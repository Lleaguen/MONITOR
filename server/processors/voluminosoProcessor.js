const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);
const { getTipoVehiculo, parsearHoraExactaED, parsearHoraED } = require('./helpers');
const { getCPTdeZona, ZONA_CPT, ZONA_CPT_EEV } = require('./zonaCPT');

const DARSENA_MIN = 16, DARSENA_MAX = 75;
const esDarsenaValida = (d) => {
  const raw = String(d['Inbound Dock ID'] || '').trim();
  if (!raw) return false;
  const num = parseInt(raw, 10);
  return !isNaN(num) && num >= DARSENA_MIN && num <= DARSENA_MAX;
};

const buildVolData = (csvData, zonaCPTOverrides = {}, horaInicioBipeos = 9, horaInicioHU = 10, site = 'CIU') => {
  const zonaCPTMap = site === 'EEV' ? ZONA_CPT_EEV : ZONA_CPT;
  const volPorZona = {}, volPorHora = {}, volPorCPT = {};
  let totalRecibidoGlobal = 0, totalVoluminosoGlobal = 0;
  const porShipment = new Map();
  csvData.forEach(d => {
    if (!d['Shipment ID'] || !esDarsenaValida(d)) return;
    const id = String(d['Shipment ID']).trim();
    const existing = porShipment.get(id);
    if (!existing) { porShipment.set(id, d); return; }
    const tsNew = d['Inbound Date Included'] ? dayjs(d['Inbound Date Included'], "DD/MM/YYYY HH:mm:ss").valueOf() : 0;
    const tsOld = existing['Inbound Date Included'] ? dayjs(existing['Inbound Date Included'], "DD/MM/YYYY HH:mm:ss").valueOf() : 0;
    if (tsNew > tsOld) porShipment.set(id, d);
  });
  porShipment.forEach(d => {
    const hubStatus = String(d['Hub Status'] || "").toLowerCase().trim();
    if (['cancelled', 'in_hub_reject', 'blocked'].includes(hubStatus)) return;
    const inboundRaw = d['Inbound Date Included'];
    if (!inboundRaw) return;
    const fInbound = dayjs(inboundRaw, "DD/MM/YYYY HH:mm:ss");
    if (!fInbound.isValid() || fInbound.hour() < horaInicioBipeos) return;
    const dimH = parseFloat(d['Height'] || 0), dimL = parseFloat(d['Length'] || 0), dimW = parseFloat(d['Width'] || 0);
    const peso = parseFloat(d['Weight'] || 0);
    const esVol = dimH >= 50 || dimL >= 50 || dimW >= 50 || peso > 20000;
    const estaCerrado = !!d['Outbound Date Closed'];
    totalRecibidoGlobal++; if (esVol) totalVoluminosoGlobal++;
    const horaKey = `${String(fInbound.hour()).padStart(2, '0')}:00`;
    if (!volPorHora[horaKey]) volPorHora[horaKey] = { hora: horaKey, voluminoso: 0, paqueteria: 0, procesado: 0, pendiente: 0, voluminosoProcesado: 0, voluminosoPendiente: 0 };
    if (esVol) { volPorHora[horaKey].voluminoso++; if (estaCerrado) volPorHora[horaKey].voluminosoProcesado++; else volPorHora[horaKey].voluminosoPendiente++; }
    else volPorHora[horaKey].paqueteria++;
    if (estaCerrado) volPorHora[horaKey].procesado++; else volPorHora[horaKey].pendiente++;
    const zonaRaw = String(d['Labeling Zone'] || "").trim();
    if (!zonaRaw || zonaRaw !== zonaRaw.toUpperCase()) return;
    const zonaUpper = zonaRaw.toUpperCase();
    if (/_[AB]$/.test(zonaUpper) || zonaUpper === 'CK390') return;
    const zona = zonaUpper.replace(/_+$/, "");
    const cpt = zonaCPTOverrides[zona] ?? getCPTdeZona(zona, zonaCPTMap);
    if (!cpt) return;
    if (!volPorZona[zona]) volPorZona[zona] = { zona, cpt, paqueteria: 0, voluminoso: 0 };
    if (esVol) volPorZona[zona].voluminoso++; else volPorZona[zona].paqueteria++;
    if (!volPorCPT[cpt]) volPorCPT[cpt] = { cpt, voluminoso: 0, paqueteria: 0, procesado: 0, pendiente: 0, voluminosoProcesado: 0, voluminosoPendiente: 0 };
    if (esVol) { volPorCPT[cpt].voluminoso++; if (estaCerrado) volPorCPT[cpt].voluminosoProcesado++; else volPorCPT[cpt].voluminosoPendiente++; }
    else volPorCPT[cpt].paqueteria++;
    if (estaCerrado) volPorCPT[cpt].procesado++; else volPorCPT[cpt].pendiente++;
  });
  return {
    volDataByZona: Object.values(volPorZona).sort((a, b) => a.cpt.localeCompare(b.cpt)),
    volDataByHora: Object.values(volPorHora).sort((a, b) => a.hora.localeCompare(b.hora)),
    volDataByCPT: Object.values(volPorCPT).sort((a, b) => a.cpt.localeCompare(b.cpt)),
    totalRecibidoGlobal, totalVoluminosoGlobal,
    pctVoluminosoGlobal: totalRecibidoGlobal > 0 ? Math.round((totalVoluminosoGlobal / totalRecibidoGlobal) * 100) : 0,
  };
};

const buildSuperBigger = (csvData) => {
  const superPorHora = new Array(24).fill(0), biggerPorHora = new Array(24).fill(0);
  const superList = [], biggerList = [];
  csvData.forEach(d => {
    if (!d['Shipment ID'] || !esDarsenaValida(d)) return;
    const dimH = parseFloat(d['Height'] || 0), dimL = parseFloat(d['Length'] || 0), dimW = parseFloat(d['Width'] || 0), peso = parseFloat(d['Weight'] || 0);
    const esSuper = peso > 50000 || dimH > 200 || dimL > 200 || dimW > 200;
    const esBigger = !esSuper && (peso > 30000 || dimH > 150 || dimL > 150 || dimW > 150);
    if (!esSuper && !esBigger) return;
    const raw = d['Inbound Date Included'];
    let hora = null;
    if (raw) { const f = dayjs(raw, "DD/MM/YYYY HH:mm:ss"); if (f.isValid()) hora = f.hour(); }
    const item = { shipmentId: String(d['Shipment ID'] || ""), height: dimH, length: dimL, width: dimW, weight: Math.round(peso / 1000 * 100) / 100, hora: hora !== null ? `${String(hora).padStart(2, '0')}:00` : '--' };
    if (esSuper) { if (hora !== null && hora >= 9 && hora <= 23) superPorHora[hora]++; superList.push(item); }
    else { if (hora !== null && hora >= 9 && hora <= 23) biggerPorHora[hora]++; biggerList.push(item); }
  });
  const HORAS = Array.from({ length: 15 }, (_, i) => i + 9);
  return {
    superBiggerList: superList, biggerList,
    superBiggerChartData: HORAS.map(h => ({ hora: `${String(h).padStart(2, '0')}:00`, cantidad: superPorHora[h] || 0 })),
    biggerChartData: HORAS.map(h => ({ hora: `${String(h).padStart(2, '0')}:00`, cantidad: biggerPorHora[h] || 0 })),
  };
};

const buildArrivalChasis = (easyDockingClean, matchEDaTMS, tipo = 'chasis') => {
  return easyDockingClean.filter((doc, idx) => getTipoVehiculo(doc['TIPO DE VEHICULO']) === tipo && matchEDaTMS.get(idx) === null)
    .map(doc => {
      const hora = parsearHoraED(doc['Fecha y hora']); const horaStr = parsearHoraExactaED(doc['Fecha y hora']);
      const piezas = Math.round(parseFloat(doc['CANT PAQUETES']) || 0);
      return { patente: String(doc['PATENTE'] || "").trim(), hora: horaStr, horaNum: hora ?? 99, piezas };
    }).filter(r => r.piezas > 0).sort((a, b) => a.horaNum - b.horaNum || a.hora.localeCompare(b.hora));
};

module.exports = { buildVolData, buildSuperBigger, buildArrivalChasis };
