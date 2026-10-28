const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);
const { normalizarPatente, getTipoPorDoca, isDocaValida } = require('./helpers');

const VELOCIDAD_OBJETIVO = 600;

const getTipoFromDoca = (doca, site = 'CIU') => {
  const num = parseInt(String(doca || '').replace(/\D/g, ''), 10);
  if (isNaN(num)) return null;
  return getTipoPorDoca(doca, site) || null;
};

const buildDarsenaStats = (csvData, ultimaTs, site = 'CIU') => {
  const porDoca = new Map();
  csvData.forEach(d => {
    if (!d['Shipment ID']) return;
    const doca = String(d['Inbound Dock ID'] || '').trim();
    if (!doca) return;
    const docaNum = parseInt(doca.replace(/\D/g, ''), 10);
    if (isNaN(docaNum) || !isDocaValida(docaNum, site)) return;
    const raw = d['Inbound Date Included'];
    if (!raw) return;
    const f = dayjs(raw, 'DD/MM/YYYY HH:mm:ss');
    if (!f.isValid()) return;
    const ts = f.valueOf();
    const patente = normalizarPatente(d['Truck ID']);
    const dimH = parseFloat(d['Height'] || 0), dimL = parseFloat(d['Length'] || 0), dimW = parseFloat(d['Width'] || 0), peso = parseFloat(d['Weight'] || 0);
    const esVoluminoso = dimH >= 50 || dimL >= 50 || dimW >= 50 || peso > 20000;
    if (!porDoca.has(doca)) {
      porDoca.set(doca, { doca, tipo: getTipoFromDoca(doca, site), piezas: 0, voluminoso: 0, primerBipeo: ts, ultimoBipeo: ts, bipeoTs: [], patentes: new Map() });
    }
    const entry = porDoca.get(doca);
    entry.piezas++; if (esVoluminoso) entry.voluminoso++;
    entry.bipeoTs.push(ts);
    if (ts < entry.primerBipeo) entry.primerBipeo = ts;
    if (ts > entry.ultimoBipeo) entry.ultimoBipeo = ts;
    if (!entry.patentes.has(patente)) entry.patentes.set(patente, { patente, piezas: 0, voluminoso: 0, primerBipeo: ts, ultimoBipeo: ts });
    const pat = entry.patentes.get(patente);
    pat.piezas++; if (esVoluminoso) pat.voluminoso++;
    if (ts < pat.primerBipeo) pat.primerBipeo = ts;
    if (ts > pat.ultimoBipeo) pat.ultimoBipeo = ts;
  });
  const DIEZ_MIN_MS = 10 * 60 * 1000, UNA_HORA_MS = 60 * 60 * 1000;
  const result = [];
  porDoca.forEach(entry => {
    const minutos = Math.max((entry.ultimoBipeo - entry.primerBipeo) / 60000, 1);
    const velocidad = Math.round((entry.piezas / minutos) * 60);
    const activa = (ultimaTs - entry.ultimoBipeo) <= DIEZ_MIN_MS;
    const piezasUltimaHora = entry.bipeoTs.filter(ts => (ultimaTs - ts) <= UNA_HORA_MS).length;
    const patentes = Array.from(entry.patentes.values()).map(p => {
      const mins = Math.max((p.ultimoBipeo - p.primerBipeo) / 60000, 1);
      return { patente: p.patente, piezas: p.piezas, voluminoso: p.voluminoso, pctVoluminoso: p.piezas > 0 ? Math.round((p.voluminoso / p.piezas) * 100) : 0, velocidad: Math.round((p.piezas / mins) * 60), ok: Math.round((p.piezas / mins) * 60) >= VELOCIDAD_OBJETIVO, primerBipeo: dayjs(p.primerBipeo).format('HH:mm'), ultimoBipeo: dayjs(p.ultimoBipeo).format('HH:mm') };
    }).sort((a, b) => b.piezas - a.piezas);
    result.push({ doca: entry.doca, docaNum: parseInt(entry.doca.replace(/\D/g, ''), 10) || 0, tipo: entry.tipo, piezas: entry.piezas, voluminoso: entry.voluminoso, pctVoluminoso: entry.piezas > 0 ? Math.round((entry.voluminoso / entry.piezas) * 100) : 0, velocidad, velUltimaHora: piezasUltimaHora, ok: velocidad >= VELOCIDAD_OBJETIVO, activa, primerBipeo: dayjs(entry.primerBipeo).format('HH:mm'), ultimoBipeo: dayjs(entry.ultimoBipeo).format('HH:mm'), patentes });
  });
  return result.sort((a, b) => { if (a.activa !== b.activa) return b.activa - a.activa; return a.docaNum - b.docaNum; });
};

const buildDarsenasAhora = (csvData, easyDocking, ultimaTs, site = 'CIU') => {
  const DIEZ_MIN_MS = 10 * 60 * 1000, TREINTA_MIN_MS = 30 * 60 * 1000, UNA_HORA_MS = 60 * 60 * 1000;
  const porDoca = new Map();
  csvData.forEach(d => {
    if (!d['Shipment ID']) return;
    const doca = String(d['Inbound Dock ID'] || '').trim();
    if (!doca) return;
    const docaNum = parseInt(doca.replace(/\D/g, ''), 10);
    if (isNaN(docaNum) || !isDocaValida(docaNum, site)) return;
    const raw = d['Inbound Date Included'];
    if (!raw) return;
    const f = dayjs(raw, 'DD/MM/YYYY HH:mm:ss');
    if (!f.isValid()) return;
    const ts = f.valueOf();
    const inboundId = String(d['Inbound ID'] || '').trim();
    const patente = normalizarPatente(d['Truck ID']);
    const dimH = parseFloat(d['Height'] || 0), dimL = parseFloat(d['Length'] || 0), dimW = parseFloat(d['Width'] || 0), peso = parseFloat(d['Weight'] || 0);
    const esVoluminoso = dimH >= 50 || dimL >= 50 || dimW >= 50 || peso > 20000;
    if (!porDoca.has(doca)) porDoca.set(doca, { doca, tipo: getTipoFromDoca(doca, site), inbounds: new Map() });
    const docaEntry = porDoca.get(doca);
    if (!docaEntry.inbounds.has(inboundId)) docaEntry.inbounds.set(inboundId, { inboundId, patente, piezas: 0, voluminoso: 0, primerBipeo: ts, ultimoBipeo: ts, bipeoTs: [] });
    const inb = docaEntry.inbounds.get(inboundId);
    inb.piezas++; if (esVoluminoso) inb.voluminoso++;
    inb.bipeoTs.push(ts);
    if (ts < inb.primerBipeo) inb.primerBipeo = ts;
    if (ts > inb.ultimoBipeo) inb.ultimoBipeo = ts;
  });
  const cantAnunciadaMap = new Map();
  if (Array.isArray(easyDocking)) {
    easyDocking.forEach(row => {
      const keys = Object.keys(row);
      const inboundKey = keys.find(k => /inbound.*id/i.test(k)) || keys.find(k => /^id$/i.test(k));
      const cantKey = keys.find(k => /cant.*paq/i.test(k) || /paquete/i.test(k) || /^cantidad$/i.test(k));
      if (!inboundKey || !cantKey) return;
      const id = String(row[inboundKey] || '').trim();
      const cant = parseInt(row[cantKey], 10);
      if (id && !isNaN(cant)) cantAnunciadaMap.set(id, cant);
    });
  }
  const result = [];
  porDoca.forEach(docaEntry => {
    let inboundActivo = null, maxUltimoBipeo = 0;
    docaEntry.inbounds.forEach(inb => { if (inb.ultimoBipeo > maxUltimoBipeo) { maxUltimoBipeo = inb.ultimoBipeo; inboundActivo = inb; } });
    if (!inboundActivo) return;
    const darsenaActiva = (ultimaTs - inboundActivo.ultimoBipeo) <= DIEZ_MIN_MS;
    const piezasUltimaHora = inboundActivo.bipeoTs.filter(ts => (ultimaTs - ts) <= UNA_HORA_MS).length;
    const minutosInbound = Math.max((inboundActivo.ultimoBipeo - inboundActivo.primerBipeo) / 60000, 1);
    const velocidadInbound = Math.round((inboundActivo.piezas / minutosInbound) * 60);
    const pctVoluminoso = inboundActivo.piezas > 0 ? Math.round((inboundActivo.voluminoso / inboundActivo.piezas) * 100) : 0;
    result.push({ doca: docaEntry.doca, docaNum: parseInt(docaEntry.doca.replace(/\D/g, ''), 10) || 0, tipo: docaEntry.tipo, activa: darsenaActiva, inboundId: inboundActivo.inboundId, patente: inboundActivo.patente, piezasBipeadas: inboundActivo.piezas, cantAnunciada: cantAnunciadaMap.get(inboundActivo.inboundId) ?? null, pctVoluminoso, piezasUltimaHora, velocidadActual: velocidadInbound, ok: velocidadInbound >= VELOCIDAD_OBJETIVO, horaInicio: dayjs(inboundActivo.primerBipeo).format('HH:mm'), ultimoBipeo: dayjs(inboundActivo.ultimoBipeo).format('HH:mm'), totalInbounds: docaEntry.inbounds.size });
  });
  return result.sort((a, b) => { if (a.activa !== b.activa) return b.activa - a.activa; return a.docaNum - b.docaNum; });
};

module.exports = { buildDarsenaStats, buildDarsenasAhora };
