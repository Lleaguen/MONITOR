const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);
const { getCPTdeZona, ZONA_CPT, ZONA_CPT_EEV } = require('./zonaCPT');

const buildHUVelocidadData = (csvData, horaInicioHU = 10, zonaCPTOverrides = {}, site = 'CIU') => {
  const zonaCPTMap = site === 'EEV' ? ZONA_CPT_EEV : ZONA_CPT;
  const arriboPorHora = {}, bipeoPorHora = {}, shipmentsInboundPorHora = {};
  for (let h = horaInicioHU; h <= 23; h++) { const hora = `${h}:00`; arriboPorHora[hora] = { total: 0 }; bipeoPorHora[hora] = { total: 0 }; shipmentsInboundPorHora[hora] = new Set(); }
  csvData.forEach(d => {
    if (!d['Shipment ID']) return;
    const zonaRaw = String(d['Labeling Zone'] || "").trim();
    if (!zonaRaw || zonaRaw !== zonaRaw.toUpperCase()) return;
    const zonaUpper = zonaRaw.toUpperCase();
    if (/_[AB]$/.test(zonaUpper) || zonaUpper === 'CK390') return;
    const zona = zonaUpper.replace(/_+$/, "");
    const cpt = zonaCPTOverrides[zona] ?? getCPTdeZona(zona, zonaCPTMap);
    if (!cpt) return;
    const hubStatus = String(d['Hub Status'] || "").toLowerCase().trim();
    if (['cancelled', 'in_hub_reject', 'blocked'].includes(hubStatus)) return;
    const shipmentId = String(d['Shipment ID']).trim();
    const fechaInbound = d['Inbound Date Included'];
    if (fechaInbound) { const ts = dayjs(fechaInbound, "DD/MM/YYYY HH:mm:ss"); if (ts.isValid() && ts.hour() >= horaInicioHU) { const hora = `${ts.hour()}:00`; if (shipmentsInboundPorHora[hora] && !shipmentsInboundPorHora[hora].has(shipmentId)) { shipmentsInboundPorHora[hora].add(shipmentId); arriboPorHora[hora].total++; } } }
    const fechaOutbound = d['Outbound Included Date'];
    if (fechaOutbound) { const ts = dayjs(fechaOutbound, "DD/MM/YYYY HH:mm:ss"); if (ts.isValid() && ts.hour() >= horaInicioHU) { const hora = `${ts.hour()}:00`; if (bipeoPorHora[hora]) bipeoPorHora[hora].total++; } }
  });
  const velocidadPorHora = Object.keys(arriboPorHora).sort((a, b) => parseInt(a) - parseInt(b)).map(hora => ({ hora, arribo: arriboPorHora[hora].total, bipeo: bipeoPorHora[hora].total, total: arriboPorHora[hora].total + bipeoPorHora[hora].total }));
  const totalArribo = velocidadPorHora.reduce((s, h) => s + h.arribo, 0), totalBipeo = velocidadPorHora.reduce((s, h) => s + h.bipeo, 0);
  const horasConActividad = velocidadPorHora.filter(h => h.total > 0).length;
  const velocidadPromedio = horasConActividad > 0 ? Math.round((totalArribo + totalBipeo) / horasConActividad) : 0;
  const velocidadPico = Math.max(...velocidadPorHora.map(h => h.total), 0);
  const horaPico = velocidadPorHora.find(h => h.total === velocidadPico)?.hora || '-';
  const ahora = dayjs(), inicioTurno = ahora.clone().hour(horaInicioHU).minute(30).second(0), finTurno = ahora.clone().hour(22).minute(30).second(0);
  const velocidadPorCPT = {}, shipmentsInboundCPT = {};
  csvData.forEach(d => {
    if (!d['Shipment ID']) return;
    const zonaRaw = String(d['Labeling Zone'] || "").trim();
    if (!zonaRaw || zonaRaw !== zonaRaw.toUpperCase()) return;
    const zonaUpper = zonaRaw.toUpperCase();
    if (/_[AB]$/.test(zonaUpper) || zonaUpper === 'CK390') return;
    const zona = zonaUpper.replace(/_+$/, "");
    const cpt = zonaCPTOverrides[zona] ?? getCPTdeZona(zona, zonaCPTMap);
    if (!cpt) return;
    const hubStatus = String(d['Hub Status'] || "").toLowerCase().trim();
    if (['cancelled', 'in_hub_reject', 'blocked'].includes(hubStatus)) return;
    const shipmentId = String(d['Shipment ID']).trim();
    if (!velocidadPorCPT[cpt]) { velocidadPorCPT[cpt] = { arribo: 0, bipeo: 0 }; shipmentsInboundCPT[cpt] = new Set(); }
    const fechaInbound = d['Inbound Date Included'];
    if (fechaInbound) { const ts = dayjs(fechaInbound, "DD/MM/YYYY HH:mm:ss"); if (ts.isValid() && ts.isAfter(inicioTurno) && ts.isBefore(finTurno)) { if (!shipmentsInboundCPT[cpt].has(shipmentId)) { shipmentsInboundCPT[cpt].add(shipmentId); velocidadPorCPT[cpt].arribo++; } } }
    const fechaOutbound = d['Outbound Included Date'];
    if (fechaOutbound) { const ts = dayjs(fechaOutbound, "DD/MM/YYYY HH:mm:ss"); if (ts.isValid() && ts.isAfter(inicioTurno) && ts.isBefore(finTurno)) velocidadPorCPT[cpt].bipeo++; }
  });
  const horasTranscurridas = Math.max(ahora.diff(inicioTurno, 'hour', true), 0.5);
  const velocidadPorCPTArray = Object.entries(velocidadPorCPT).map(([cpt, data]) => ({ cpt, arribo: data.arribo, bipeo: data.bipeo, total: data.arribo + data.bipeo, velocidadPorHora: Math.round((data.arribo + data.bipeo) / horasTranscurridas) })).sort((a, b) => b.total - a.total);
  return { velocidadPorHora, velocidadPorCPT: velocidadPorCPTArray, stats: { totalArribo, totalBipeo, totalHU: totalArribo + totalBipeo, velocidadPromedio, velocidadPico, horaPico, horasConActividad } };
};

module.exports = { buildHUVelocidadData };
