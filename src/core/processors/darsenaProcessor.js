import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import { normalizarPatente, getTipoPorDoca } from './helpers.js';

dayjs.extend(customParseFormat);

// Umbral de velocidad "decente": 600 piezas/hora = 10 piezas/min (12 pzas/min)
export const VELOCIDAD_OBJETIVO = 600;

// Dársenas válidas para mostrar en velocidad de dársenas:
// 16-19 → otro, 20-26 → semi, 27-42 → chasis, 43-75 → camioneta
const DOCAS_VALIDAS = (num) =>
  (num >= 16 && num <= 19) ||
  (num >= 20 && num <= 26) ||
  (num >= 27 && num <= 42) ||
  (num >= 43 && num <= 75);

const getTipoFromDoca = (doca) => {
  const num = parseInt(String(doca || '').replace(/\D/g, ''), 10);
  if (isNaN(num)) return null;
  if (num >= 16 && num <= 19) return 'otro';
  return getTipoPorDoca(doca); // maneja 20-75
};

/**
 * buildDarsenaStats — calcula velocidad de descarga por dársena y patente.
 *
 * Para cada dársena activa:
 *   - Agrupa todas las piezas bipeadas por esa dársena
 *   - Calcula velocidad = piezas / minutos_activos × 60
 *   - Clasifica como OK (≥600 pzas/hr) o LENTO (<600)
 *
 * @param {Array}  csvData   - Filas del TMS
 * @param {number} ultimaTs  - Timestamp del último bipeo (referencia temporal)
 * @returns {Array} darsenas — array de objetos por dársena
 */
export const buildDarsenaStats = (csvData, ultimaTs) => {
  // Agrupar bipeos por dársena
  const porDoca = new Map();

  csvData.forEach(d => {
    if (!d['Shipment ID']) return;
    const doca = String(d['Inbound Dock ID'] || '').trim();
    if (!doca) return;
    const docaNum = parseInt(doca.replace(/\D/g, ''), 10);
    if (isNaN(docaNum) || !DOCAS_VALIDAS(docaNum)) return; // excluir dársenas ficticias
    const raw = d['Inbound Date Included'];
    if (!raw) return;
    const f = dayjs(raw, 'DD/MM/YYYY HH:mm:ss');
    if (!f.isValid()) return;
    const ts = f.valueOf();
    const patente = normalizarPatente(d['Truck ID']);

    // Clasificar voluminoso: misma lógica que voluminosoProcessor
    const dimH = parseFloat(d['Height'] || 0);
    const dimL = parseFloat(d['Length'] || 0);
    const dimW = parseFloat(d['Width']  || 0);
    const peso = parseFloat(d['Weight'] || 0);
    const esVoluminoso = dimH >= 50 || dimL >= 50 || dimW >= 50 || peso > 20000;

    if (!porDoca.has(doca)) {
      porDoca.set(doca, {
        doca,
        tipo: getTipoFromDoca(doca),
        piezas: 0,
        voluminoso: 0,
        primerBipeo: ts,
        ultimoBipeo: ts,
        bipeoTs: [],
        patentes: new Map(),
      });
    }

    const entry = porDoca.get(doca);
    entry.piezas++;
    if (esVoluminoso) entry.voluminoso++;
    entry.bipeoTs.push(ts);
    if (ts < entry.primerBipeo) entry.primerBipeo = ts;
    if (ts > entry.ultimoBipeo) entry.ultimoBipeo = ts;

    if (!entry.patentes.has(patente)) {
      entry.patentes.set(patente, { patente, piezas: 0, voluminoso: 0, primerBipeo: ts, ultimoBipeo: ts });
    }
    const pat = entry.patentes.get(patente);
    pat.piezas++;
    if (esVoluminoso) pat.voluminoso++;
    if (ts < pat.primerBipeo) pat.primerBipeo = ts;
    if (ts > pat.ultimoBipeo) pat.ultimoBipeo = ts;
  });

  // Calcular velocidades
  const DIEZ_MIN_MS  = 10 * 60 * 1000;
  const UNA_HORA_MS  = 60 * 60 * 1000;
  const result = [];

  porDoca.forEach(entry => {
    const minutos = Math.max((entry.ultimoBipeo - entry.primerBipeo) / 60000, 1);
    const velocidad = Math.round((entry.piezas / minutos) * 60);
    const activa = (ultimaTs - entry.ultimoBipeo) <= DIEZ_MIN_MS;

    // Velocidad última hora: bipeos dentro del último UNA_HORA_MS desde ultimaTs
    const piezasUltimaHora = entry.bipeoTs.filter(ts => (ultimaTs - ts) <= UNA_HORA_MS).length;
    const velUltimaHora = Math.round(piezasUltimaHora); // ya son piezas en 1hr exacta

    const patentes = Array.from(entry.patentes.values()).map(p => {
      const mins = Math.max((p.ultimoBipeo - p.primerBipeo) / 60000, 1);
      const vel = Math.round((p.piezas / mins) * 60);
      return {
        patente: p.patente,
        piezas: p.piezas,
        voluminoso: p.voluminoso,
        pctVoluminoso: p.piezas > 0 ? Math.round((p.voluminoso / p.piezas) * 100) : 0,
        velocidad: vel,
        ok: vel >= VELOCIDAD_OBJETIVO,
        primerBipeo: dayjs(p.primerBipeo).format('HH:mm'),
        ultimoBipeo: dayjs(p.ultimoBipeo).format('HH:mm'),
      };
    }).sort((a, b) => b.piezas - a.piezas);

    result.push({
      doca: entry.doca,
      docaNum: parseInt(entry.doca.replace(/\D/g, ''), 10) || 0,
      tipo: entry.tipo,
      piezas: entry.piezas,
      voluminoso: entry.voluminoso,
      pctVoluminoso: entry.piezas > 0 ? Math.round((entry.voluminoso / entry.piezas) * 100) : 0,
      velocidad,
      velUltimaHora,
      ok: velocidad >= VELOCIDAD_OBJETIVO,
      activa,
      primerBipeo: dayjs(entry.primerBipeo).format('HH:mm'),
      ultimoBipeo: dayjs(entry.ultimoBipeo).format('HH:mm'),
      patentes,
    });
  });

  // Ordenar: activas primero, luego por número de doca
  return result.sort((a, b) => {
    if (a.activa !== b.activa) return b.activa - a.activa;
    return a.docaNum - b.docaNum;
  });
};

/**
 * buildDarsenasAhora — calcula el estado en tiempo real de cada dársena activa.
 *
 * Para cada dársena con bipeos en los últimos 10 minutos:
 *   - Detecta el Inbound ID activo (el más reciente con bipeos en los últimos 30 min)
 *   - Cuenta piezas bipeadas de ese Inbound ID específico
 *   - Calcula piezas/hr de la descarga activa (últimos 60 min)
 *   - Calcula % voluminoso del inbound activo
 *   - Determina si está OK o lenta
 *
 * @param {Array}  csvData       - Filas del TMS
 * @param {Array}  easyDocking   - Filas del ED (para cantidad anunciada)
 * @param {number} ultimaTs      - Timestamp del último bipeo (referencia temporal)
 * @returns {Array} darsenas con info del inbound activo
 */
export const buildDarsenasAhora = (csvData, easyDocking, ultimaTs) => {
  const DIEZ_MIN_MS   = 10 * 60 * 1000;
  const TREINTA_MIN_MS = 30 * 60 * 1000;
  const UNA_HORA_MS   = 60 * 60 * 1000;

  // Agrupar por dársena → por Inbound ID
  const porDoca = new Map();

  csvData.forEach(d => {
    if (!d['Shipment ID']) return;
    const doca = String(d['Inbound Dock ID'] || '').trim();
    if (!doca) return;
    const docaNum = parseInt(doca.replace(/\D/g, ''), 10);
    if (isNaN(docaNum) || !DOCAS_VALIDAS(docaNum)) return;
    const raw = d['Inbound Date Included'];
    if (!raw) return;
    const f = dayjs(raw, 'DD/MM/YYYY HH:mm:ss');
    if (!f.isValid()) return;
    const ts = f.valueOf();

    const inboundId = String(d['Inbound ID'] || '').trim();
    const patente   = normalizarPatente(d['Truck ID']);

    const dimH = parseFloat(d['Height'] || 0);
    const dimL = parseFloat(d['Length'] || 0);
    const dimW = parseFloat(d['Width']  || 0);
    const peso = parseFloat(d['Weight'] || 0);
    const esVoluminoso = dimH >= 50 || dimL >= 50 || dimW >= 50 || peso > 20000;

    if (!porDoca.has(doca)) {
      porDoca.set(doca, {
        doca,
        tipo: getTipoFromDoca(doca),
        inbounds: new Map(),
      });
    }

    const docaEntry = porDoca.get(doca);

    if (!docaEntry.inbounds.has(inboundId)) {
      docaEntry.inbounds.set(inboundId, {
        inboundId,
        patente,
        piezas: 0,
        voluminoso: 0,
        primerBipeo: ts,
        ultimoBipeo: ts,
        bipeoTs: [],
      });
    }

    const inb = docaEntry.inbounds.get(inboundId);
    inb.piezas++;
    if (esVoluminoso) inb.voluminoso++;
    inb.bipeoTs.push(ts);
    if (ts < inb.primerBipeo) inb.primerBipeo = ts;
    if (ts > inb.ultimoBipeo) inb.ultimoBipeo = ts;
  });

  // Construir mapa de cantidades anunciadas en ED por Inbound ID
  // ED tiene columna "Inbound ID" o similar — usamos "Cant. Paquetes" o "CANT. PAQUETES"
  const cantAnunciadaMap = new Map();
  if (Array.isArray(easyDocking)) {
    easyDocking.forEach(row => {
      // Intentar varias claves posibles del ED
      const keys = Object.keys(row);
      const inboundKey = keys.find(k => /inbound.*id/i.test(k)) || keys.find(k => /^id$/i.test(k));
      const cantKey    = keys.find(k => /cant.*paq/i.test(k) || /paquete/i.test(k) || /^cantidad$/i.test(k));
      if (!inboundKey || !cantKey) return;
      const id   = String(row[inboundKey] || '').trim();
      const cant = parseInt(row[cantKey], 10);
      if (id && !isNaN(cant)) cantAnunciadaMap.set(id, cant);
    });
  }

  const result = [];

  porDoca.forEach(docaEntry => {
    // Encontrar el inbound activo: el que tuvo bipeos más recientemente (últimos 30 min)
    let inboundActivo = null;
    let maxUltimoBipeo = 0;

    docaEntry.inbounds.forEach(inb => {
      if (inb.ultimoBipeo > maxUltimoBipeo) {
        maxUltimoBipeo = inb.ultimoBipeo;
        inboundActivo  = inb;
      }
    });

    if (!inboundActivo) return;

    const darsenaActiva = (ultimaTs - inboundActivo.ultimoBipeo) <= DIEZ_MIN_MS;

    // Piezas bipeadas en la última hora (del inbound activo)
    const piezasUltimaHora = inboundActivo.bipeoTs.filter(ts => (ultimaTs - ts) <= UNA_HORA_MS).length;

    // Velocidad: piezas/hr usando el rango real del inbound
    const minutosInbound = Math.max((inboundActivo.ultimoBipeo - inboundActivo.primerBipeo) / 60000, 1);
    const velocidadInbound = Math.round((inboundActivo.piezas / minutosInbound) * 60);

    // % voluminoso del inbound activo
    const pctVoluminoso = inboundActivo.piezas > 0
      ? Math.round((inboundActivo.voluminoso / inboundActivo.piezas) * 100)
      : 0;

    // Cantidad anunciada en ED
    const cantAnunciada = cantAnunciadaMap.get(inboundActivo.inboundId) ?? null;

    result.push({
      doca: docaEntry.doca,
      docaNum: parseInt(docaEntry.doca.replace(/\D/g, ''), 10) || 0,
      tipo: docaEntry.tipo,
      activa: darsenaActiva,
      inboundId: inboundActivo.inboundId,
      patente: inboundActivo.patente,
      piezasBipeadas: inboundActivo.piezas,
      cantAnunciada,
      pctVoluminoso,
      piezasUltimaHora,
      velocidadActual: velocidadInbound,
      ok: velocidadInbound >= VELOCIDAD_OBJETIVO,
      horaInicio: dayjs(inboundActivo.primerBipeo).format('HH:mm'),
      ultimoBipeo: dayjs(inboundActivo.ultimoBipeo).format('HH:mm'),
      totalInbounds: docaEntry.inbounds.size,
    });
  });

  // Ordenar: activas primero, luego por número de doca
  return result.sort((a, b) => {
    if (a.activa !== b.activa) return b.activa - a.activa;
    return a.docaNum - b.docaNum;
  });
};
