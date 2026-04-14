import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import { normalizarPatente, getTipoPorDoca } from './helpers.js';

dayjs.extend(customParseFormat);

// Umbral de velocidad "decente": 600 piezas/hora = 10 piezas/min
export const VELOCIDAD_OBJETIVO = 600;

const getTipoFromDoca = (doca) => getTipoPorDoca(doca);

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
    const raw = d['Inbound Date Included'];
    if (!raw) return;
    const f = dayjs(raw, 'DD/MM/YYYY HH:mm:ss');
    if (!f.isValid()) return;
    const ts = f.valueOf();
    const patente = normalizarPatente(d['Truck ID']);

    if (!porDoca.has(doca)) {
      porDoca.set(doca, {
        doca,
        tipo: getTipoFromDoca(doca),
        piezas: 0,
        primerBipeo: ts,
        ultimoBipeo: ts,
        patentes: new Map(), // patente → { piezas, primerBipeo, ultimoBipeo }
      });
    }

    const entry = porDoca.get(doca);
    entry.piezas++;
    if (ts < entry.primerBipeo) entry.primerBipeo = ts;
    if (ts > entry.ultimoBipeo) entry.ultimoBipeo = ts;

    if (!entry.patentes.has(patente)) {
      entry.patentes.set(patente, { patente, piezas: 0, primerBipeo: ts, ultimoBipeo: ts });
    }
    const pat = entry.patentes.get(patente);
    pat.piezas++;
    if (ts < pat.primerBipeo) pat.primerBipeo = ts;
    if (ts > pat.ultimoBipeo) pat.ultimoBipeo = ts;
  });

  // Calcular velocidades
  const DIEZ_MIN_MS = 10 * 60 * 1000;
  const result = [];

  porDoca.forEach(entry => {
    const minutos = Math.max((entry.ultimoBipeo - entry.primerBipeo) / 60000, 1);
    const velocidad = Math.round((entry.piezas / minutos) * 60);
    const activa = (ultimaTs - entry.ultimoBipeo) <= DIEZ_MIN_MS;

    const patentes = Array.from(entry.patentes.values()).map(p => {
      const mins = Math.max((p.ultimoBipeo - p.primerBipeo) / 60000, 1);
      const vel = Math.round((p.piezas / mins) * 60);
      return {
        patente: p.patente,
        piezas: p.piezas,
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
      velocidad,
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
