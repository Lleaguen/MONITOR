import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import { getTipoVehiculo, parsearHoraExactaED, parsearHoraED } from './helpers.js';
import { getCPTdeZona } from './zonaCPT.js';

dayjs.extend(customParseFormat);

/*
 * Criterios de clasificación voluminoso:
 *   - Dimensiones en MILÍMETROS: >= 500mm (= 50cm) en cualquier eje
 *   - Peso en GRAMOS:            > 20000g (= 20kg)
 *
 * Criterios de procesado:
 *   - Procesado = tiene Outbound Date Closed (HU cerrado)
 *   - Pendiente = no tiene Outbound Date Closed
 */

// Voluminoso / Paquetería por zona
export const buildVolData = (csvData, zonaCPTOverrides = {}, horaInicioBipeos = 9, horaInicioHU = 10) => {
  const volPorZona = {};
  const volPorHora = {};
  const volPorCPT  = {};

  // Deduplicar por Shipment ID — quedarse con la fila más reciente (mayor Inbound Date)
  const porShipment = new Map();
  csvData.forEach(d => {
    if (!d['Shipment ID']) return;
    const id = String(d['Shipment ID']).trim();
    const existing = porShipment.get(id);
    if (!existing) {
      porShipment.set(id, d);
    } else {
      const tsNew = d['Inbound Date Included']
        ? dayjs(d['Inbound Date Included'], "DD/MM/YYYY HH:mm:ss").valueOf()
        : 0;
      const tsOld = existing['Inbound Date Included']
        ? dayjs(existing['Inbound Date Included'], "DD/MM/YYYY HH:mm:ss").valueOf()
        : 0;
      if (tsNew > tsOld) porShipment.set(id, d);
    }
  });

  porShipment.forEach(d => {
    // ── Filtros base (sin requerir CPT) ──────────────────────────────────────
    const zonaRaw = String(d['Labeling Zone'] || "").trim();
    const zonaUpper = zonaRaw.toUpperCase();
    const zona = zonaUpper.replace(/_+$/, "");
    const hubStatus = String(d['Hub Status'] || "").toLowerCase().trim();
    if (['cancelled', 'in_hub_reject', 'blocked'].includes(hubStatus)) return;

    // Dimensiones en mm, peso en gramos
    const dimH = parseFloat(d['Height'] || 0);
    const dimL = parseFloat(d['Length'] || 0);
    const dimW = parseFloat(d['Width']  || 0);
    const peso = parseFloat(d['Weight'] || 0);

    // Voluminoso: alguna dimensión >= 500mm (50cm) O peso > 20000g (20kg)
    const esVol = dimH >= 500 || dimL >= 500 || dimW >= 500 || peso > 20000;
    const estaCerrado = !!d['Outbound Date Closed'];

    // ── Por hora de inbound (sin filtro de CPT) ──────────────────────────────
    const inboundRaw = d['Inbound Date Included'];
    if (inboundRaw) {
      const f = dayjs(inboundRaw, "DD/MM/YYYY HH:mm:ss");
      if (f.isValid() && f.hour() >= horaInicioBipeos) {
        const horaKey = `${String(f.hour()).padStart(2, '0')}:00`;
        if (!volPorHora[horaKey]) {
          volPorHora[horaKey] = {
            hora: horaKey,
            voluminoso: 0, paqueteria: 0,
            procesado: 0, pendiente: 0,
            voluminosoProcesado: 0, voluminosoPendiente: 0,
          };
        }
        if (esVol) {
          volPorHora[horaKey].voluminoso++;
          if (estaCerrado) volPorHora[horaKey].voluminosoProcesado++;
          else             volPorHora[horaKey].voluminosoPendiente++;
        } else {
          volPorHora[horaKey].paqueteria++;
        }
        if (estaCerrado) volPorHora[horaKey].procesado++;
        else             volPorHora[horaKey].pendiente++;
      }
    }

    // ── Filtros adicionales para zona/CPT ────────────────────────────────────
    if (!zonaRaw) return;
    if (zonaRaw !== zonaRaw.toUpperCase()) return;
    if (/_[AB]$/.test(zonaUpper)) return;
    if (zonaUpper === 'CK390') return;

    const cpt = zonaCPTOverrides[zona] ?? getCPTdeZona(zona);
    if (!cpt) return;

    if (!inboundRaw) return;
    const fInbound = dayjs(inboundRaw, "DD/MM/YYYY HH:mm:ss");
    if (!fInbound.isValid() || fInbound.hour() < horaInicioBipeos) return;
    // ────────────────────────────────────────────────────────────────────────

    if (!volPorZona[zona]) volPorZona[zona] = { zona, cpt, paqueteria: 0, voluminoso: 0 };
    if (esVol) volPorZona[zona].voluminoso++;
    else       volPorZona[zona].paqueteria++;

    // ── Por CPT ─────────────────────────────────────────────────────────────
    if (!volPorCPT[cpt]) {
      volPorCPT[cpt] = {
        cpt,
        voluminoso: 0, paqueteria: 0,
        procesado: 0, pendiente: 0,
        voluminosoProcesado: 0, voluminosoPendiente: 0,
      };
    }
    if (esVol) {
      volPorCPT[cpt].voluminoso++;
      if (estaCerrado) volPorCPT[cpt].voluminosoProcesado++;
      else             volPorCPT[cpt].voluminosoPendiente++;
    } else {
      volPorCPT[cpt].paqueteria++;
    }
    if (estaCerrado) volPorCPT[cpt].procesado++;
    else             volPorCPT[cpt].pendiente++;
  });

  return {
    volDataByZona: Object.values(volPorZona).sort((a, b) => a.cpt.localeCompare(b.cpt)),
    volDataByHora: Object.values(volPorHora).sort((a, b) => a.hora.localeCompare(b.hora)),
    volDataByCPT:  Object.values(volPorCPT).sort((a, b) => a.cpt.localeCompare(b.cpt)),
  };
};

// Super Bigger: peso > 50kg (50000g) O alguna dimensión >= 2000mm (200cm)
// Bigger:       peso > 30kg (30000g) Y alguna dimensión > 1500mm (150cm), y no es super bigger
export const buildSuperBigger = (csvData) => {
  const superPorHora = new Array(24).fill(0);
  const biggerPorHora = new Array(24).fill(0);
  const superList = [];
  const biggerList = [];

  csvData.forEach(d => {
    if (!d['Shipment ID']) return;
    const dimH = parseFloat(d['Height'] || 0);
    const dimL = parseFloat(d['Length'] || 0);
    const dimW = parseFloat(d['Width']  || 0);
    const peso = parseFloat(d['Weight'] || 0);

    // Dimensiones en mm, peso en gramos
    const esSuper  = peso > 50000 || dimH >= 2000 || dimL >= 2000 || dimW >= 2000;
    const esBigger = !esSuper && (peso > 30000 && (dimH > 1500 || dimL > 1500 || dimW > 1500));

    if (!esSuper && !esBigger) return;

    const raw = d['Inbound Date Included'];
    let hora = null;
    if (raw) {
      const f = dayjs(raw, "DD/MM/YYYY HH:mm:ss");
      if (f.isValid()) hora = f.hour();
    }

    const item = {
      shipmentId: String(d['Shipment ID'] || ""),
      height: Math.round(dimH / 10),  // mostrar en cm
      length: Math.round(dimL / 10),
      width:  Math.round(dimW / 10),
      weight: Math.round(peso / 1000 * 100) / 100,  // mostrar en kg
      hora:   hora !== null ? `${String(hora).padStart(2, '0')}:00` : '--',
    };

    if (esSuper) {
      if (hora !== null && hora >= 9 && hora <= 23) superPorHora[hora]++;
      superList.push(item);
    } else {
      if (hora !== null && hora >= 9 && hora <= 23) biggerPorHora[hora]++;
      biggerList.push(item);
    }
  });

  const HORAS = Array.from({ length: 15 }, (_, i) => i + 9);

  return {
    superBiggerList: superList,
    biggerList,
    superBiggerChartData: HORAS.map(h => ({
      hora: `${String(h).padStart(2, '0')}:00`,
      cantidad: superPorHora[h] || 0,
    })),
    biggerChartData: HORAS.map(h => ({
      hora: `${String(h).padStart(2, '0')}:00`,
      cantidad: biggerPorHora[h] || 0,
    })),
  };
};

// Arrivals pendientes por tipo de vehículo
export const buildArrivalChasis = (easyDockingClean, matchEDaTMS, tipo = 'chasis') => {
  return easyDockingClean
    .filter((doc, idx) =>
      getTipoVehiculo(doc['TIPO DE VEHICULO']) === tipo &&
      matchEDaTMS.get(idx) === null
    )
    .map(doc => {
      const raw = String(doc['Fecha y hora'] || "").trim();
      const hora = parsearHoraED(raw);
      const horaStr = parsearHoraExactaED(raw);
      const piezas = Math.round(parseFloat(doc['CANT PAQUETES']) || 0);
      return { patente: String(doc['PATENTE'] || "").trim(), hora: horaStr, horaNum: hora ?? 99, piezas };
    })
    .filter(r => r.piezas > 0)
    .sort((a, b) => a.horaNum - b.horaNum || a.hora.localeCompare(b.hora));
};
