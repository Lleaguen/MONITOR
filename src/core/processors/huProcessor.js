import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import { getCPTdeZona, CPT_ORDEN, ZONA_CPT, ZONA_CPT_EEV, CPT_ORDEN_EEV } from './zonaCPT.js';

dayjs.extend(customParseFormat);

export const buildHUData = (csvData, ultimaTs, objetivoHU, productividadHU, horaInicioHU = 14, zonaCPTOverrides = {}, site = 'CIU') => {
  const zonaCPTMap = site === 'EEV' ? ZONA_CPT_EEV : ZONA_CPT;
  const cptOrden   = site === 'EEV' ? CPT_ORDEN_EEV : CPT_ORDEN;
  /*
   * ─── FILTROS APLICADOS (para coincidir con el monitor Excel) ───────────────
   *
   * 1. Solo piezas con Shipment ID válido
   * 2. Solo zonas en MAYÚSCULAS (excluye zonas en minúscula del CSV)
   * 3. Excluye zonas Meli Air: terminan en _A o _B (ej: SNQ1_A, STW1_A)
   * 4. FBA1_R y FBA4_R → CPT 10:00 (incluidas en el conteo)
   * 5. Excluye piezas con Hub Status: cancelled, in_hub_reject, blocked
   * 6. Solo zonas mapeadas a un CPT (via zonaCPT.js o zonaCPTOverrides)
   * 7. Normaliza zonas: elimina guiones bajos al final (PCK390_ → PCK390)
   *
   * Para agregar una nueva exclusión, agregar un `if (...) return;` antes de z.etiquetado++
   * Para cambiar qué cuenta como HU Cerrado/Abierto, modificar el bloque de Hub Status abajo
   * ─────────────────────────────────────────────────────────────────────────────
   */
  const cptData = {};
  const ultimaActividadUsuario = new Map();
  cptOrden.forEach(c => { cptData[c] = { zonas: {}, usuariosSetCPT: new Set() }; });

  // Bipeos por hora global (para sparkline de productividad)
  const bipeoPorHoraGlobal = {};
  for (let h = horaInicioHU; h <= 23; h++) bipeoPorHoraGlobal[h] = 0;

  const getOrCreateCPT = (cpt) => {
    if (!cptData[cpt]) cptData[cpt] = { zonas: {}, usuariosSetCPT: new Set() };
    return cptData[cpt];
  };

  Object.entries(zonaCPTOverrides).forEach(([zona, cpt]) => {
    if (!cpt) return;
    const entry = getOrCreateCPT(cpt);
    if (!entry.zonas[zona]) {
      entry.zonas[zona] = {
        etiquetado: 0, huAbierto: 0, huCerrado: 0,
        huFinalizadas: 0,
        huEnDespachoSet: new Set(),
        despachadoSet:   new Set(),
        usuariosSet:     new Set(),
      };
    }
  });

  csvData.forEach(d => {
    if (!d['Shipment ID']) return;
    const zonaRaw = String(d['Labeling Zone'] || "").trim();
    if (!zonaRaw) return;
    // Excluir zonas en minúscula (el Excel no las reconoce)
    if (zonaRaw !== zonaRaw.toUpperCase()) return;
    const zonaUpper = zonaRaw.toUpperCase();
    // Excluir zonas Meli Air (terminan en _A o _B), FBA1_R y CK390
    if (/_[AB]$/.test(zonaUpper)) return;
   /* if (zonaUpper === 'FBA1_R') return;*/
    if (zonaUpper === 'CK390') return;
    // Normalizar: quitar guiones bajos al final (PCK390_ → PCK390)
    const zona = zonaUpper.replace(/_+$/, "");

    const cpt = zonaCPTOverrides[zona] ?? getCPTdeZona(zona, zonaCPTMap);
    if (!cpt) return;

    const cptEntry = getOrCreateCPT(cpt);
    if (!cptEntry.zonas[zona]) {
      cptEntry.zonas[zona] = {
        etiquetado: 0, huAbierto: 0, huCerrado: 0,
        huFinalizadas: 0,
        huEnDespachoSet: new Set(),
        despachadoSet:   new Set(),
        usuariosSet:     new Set(),
        bipeoPorHora:    {}, // { hora: count }
      };
    }
    const z = cptEntry.zonas[zona];
    const outboundId = String(d['Outbound ID'] || "").trim();
    const dispatchId = String(d['Dispatch ID'] || "").trim();
    const hubStatus  = String(d['Hub Status'] || "").toLowerCase().trim();

    // Excluir piezas canceladas, rechazadas o bloqueadas
    if (['cancelled', 'in_hub_reject', 'blocked'].includes(hubStatus)) return;

    z.etiquetado++;

    // ── Clasificación HU ──────────────────────────────────────────────────────
    if (d['Outbound Date Closed'] || hubStatus === 'dispatched') z.huCerrado++;
    else if (d['Outbound Included Date']) z.huAbierto++;

    if (hubStatus === 'outbound_finished') z.huFinalizadas++;
    if (d['Outbound Position'] && outboundId) z.huEnDespachoSet.add(outboundId);
    if (d['Dispatch Included Date'] && dispatchId) {
      const dh = dayjs(d['Dispatch Included Date'], "DD/MM/YYYY HH:mm:ss");
      if (dh.isValid() && dh.hour() >= horaInicioHU) z.despachadoSet.add(dispatchId);
    }

    // Bipeos por hora por zona y global
    if (d['Outbound Included Date']) {
      const tsOut = dayjs(d['Outbound Included Date'], "DD/MM/YYYY HH:mm:ss");
      if (tsOut.isValid() && tsOut.hour() >= horaInicioHU) {
        const h = tsOut.hour();
        z.bipeoPorHora[h] = (z.bipeoPorHora[h] || 0) + 1;
        bipeoPorHoraGlobal[h] = (bipeoPorHoraGlobal[h] || 0) + 1;
      }
    }

    const rawUsr = String(d['Outbound Added By'] || "").trim();
    if (rawUsr) {
      const usr = rawUsr.replace(/\(\d+\)$/, "").trim().toLowerCase();
      if (usr) {
        const ts = d['Outbound Included Date']
          ? dayjs(d['Outbound Included Date'], "DD/MM/YYYY HH:mm:ss").valueOf()
          : 0;
        const pos = String(d['Outbound Position'] || "").trim().toUpperCase();
        const prev = ultimaActividadUsuario.get(usr);
        if (!prev || ts > prev.ts) ultimaActividadUsuario.set(usr, { cpt, zona, ts, pos });
      }
    }
  });

  const CINCO_MIN_MS  = 5  * 60 * 1000;
  const DIEZ_MIN_MS   = 10 * 60 * 1000;
  const refMs = ultimaTs > 0 ? ultimaTs : Date.now();

  // Derivar tipo de posición: AS?-?-1-? = PAQUETERIA, AS?-?-2-? = VOLUMINOSO
  const getTipoPosicion = (pos) => {
    if (!pos) return null;
    const m = String(pos).match(/^AS\d-\d-(\d)-\d+$/i);
    if (!m) return null;
    return m[1] === '1' ? 'PAQUETERIA' : m[1] === '2' ? 'VOLUMINOSO' : null;
  };

  Object.keys(cptData).forEach(c => { cptData[c].usuariosSetCPT = new Set(); });

  // Detalle SIN filtrar por ventana — el frontend aplica el filtro dinámico
  const usuariosActivosDetalle = [];

  ultimaActividadUsuario.forEach((info, usr) => {
    const { cpt, zona, pos } = info;
    // Agregar al detalle completo (sin filtro de tiempo)
    usuariosActivosDetalle.push({
      usr,
      cpt,
      zona,
      pos: pos || null,
      tipoPosicion: getTipoPosicion(pos),
      ts: info.ts,
    });
    // Para los sets de tableData/totalesHU seguimos usando la ventana de 5 min
    if ((refMs - info.ts) > CINCO_MIN_MS) return;
    if (!cptData[cpt]) return;
    cptData[cpt].usuariosSetCPT.add(usr);
    if (cptData[cpt].zonas[zona]) cptData[cpt].zonas[zona].usuariosSet.add(usr);
  });

  const usuariosSetGlobal = new Set(
    Array.from(ultimaActividadUsuario.entries())
      .filter(([, info]) => (refMs - info.ts) <= CINCO_MIN_MS)
      .map(([usr]) => usr)
  );

  // Lista de usuarios activos en los últimos 10 minutos, con su zona y tiempo relativo
  const usuariosConectados = Array.from(ultimaActividadUsuario.entries())
    .filter(([, info]) => (refMs - info.ts) <= DIEZ_MIN_MS)
    .map(([usr, info]) => ({
      nombre:  usr,
      zona:    info.zona,
      cpt:     info.cpt,
      ts:      info.ts,
      minutos: Math.round((refMs - info.ts) / 60000),
    }))
    .sort((a, b) => a.zona.localeCompare(b.zona) || a.nombre.localeCompare(b.nombre));

  const todosLosCPTs = [
    ...cptOrden.filter(c => cptData[c]),
    ...Object.keys(cptData).filter(c => !cptOrden.includes(c)).sort(),
  ];

  const tableData = todosLosCPTs
    .filter(cpt => Object.keys(cptData[cpt].zonas).length > 0)
    .map(cpt => {
      const zonas = Object.entries(cptData[cpt].zonas).map(([zona, z]) => {
        const pendiente = z.etiquetado - z.huAbierto - z.huCerrado;
        const avance = z.etiquetado > 0
          ? Math.round(((z.huCerrado + z.huAbierto) / z.etiquetado) * 100)/* / 100*/
          : 0;
        return {
          zona, etiquetado: z.etiquetado, huAbierto: z.huAbierto, huCerrado: z.huCerrado,
          pendiente: Math.max(pendiente, 0), avance,
          huFinalizadas: z.huFinalizadas,
          huEnDespacho: z.huEnDespachoSet.size,
          despachado: z.despachadoSet.size,
          usuarios: z.usuariosSet.size,
          bipeoPorHora: z.bipeoPorHora,
        };
      });

      const totCPT = zonas.reduce((acc, z) => ({
        etiquetado: acc.etiquetado + z.etiquetado, huAbierto: acc.huAbierto + z.huAbierto,
        huCerrado: acc.huCerrado + z.huCerrado, pendiente: acc.pendiente + z.pendiente,
        huFinalizadas: acc.huFinalizadas + z.huFinalizadas,
        huEnDespacho: acc.huEnDespacho + z.huEnDespacho, despachado: acc.despachado + z.despachado,
      }), { etiquetado:0, huAbierto:0, huCerrado:0, pendiente:0, huFinalizadas:0, huEnDespacho:0, despachado:0 });

      totCPT.usuarios = cptData[cpt].usuariosSetCPT.size;
      totCPT.avance = totCPT.etiquetado > 0
        ? Math.round(((totCPT.huCerrado + totCPT.huAbierto) / totCPT.etiquetado) * 10000) / 100
        : 0;

      return { cpt, zonas, totCPT };
    });

  const totalesHU = tableData.reduce((acc, { totCPT }) => ({
    etiquetado: acc.etiquetado + totCPT.etiquetado, huAbierto: acc.huAbierto + totCPT.huAbierto,
    huCerrado: acc.huCerrado + totCPT.huCerrado, pendiente: acc.pendiente + totCPT.pendiente,
    huFinalizadas: acc.huFinalizadas + totCPT.huFinalizadas,
    huEnDespacho: acc.huEnDespacho + totCPT.huEnDespacho, despachado: acc.despachado + totCPT.despachado,
  }), { etiquetado:0, huAbierto:0, huCerrado:0, pendiente:0, huFinalizadas:0, huEnDespacho:0, despachado:0 });

  totalesHU.usuarios = usuariosSetGlobal.size;
  totalesHU.avance = totalesHU.etiquetado > 0
    ? Math.round(((totalesHU.huCerrado + totalesHU.huAbierto) / totalesHU.etiquetado) * 10000) / 100
    : 0;

  const horasHasta22 = Math.max(
    dayjs().set('hour', 22).set('minute', 0).set('second', 0).diff(dayjs(), 'hour', true), 0.1
  );
  // Incluye pendientes + HU abiertas (en proceso) + 25% de margen para asegurar llegar a tiempo
  const trabajoRestante = (totalesHU.pendiente || 0) + (totalesHU.huAbierto || 0);
  const usuariosNecesarios = productividadHU > 0
    ? Math.ceil((trabajoRestante / productividadHU / horasHasta22) * 1.25)
    : 0;

  // Convertir bipeoPorHoraGlobal a array ordenado
  const bipeoPorHoraArray = Object.entries(bipeoPorHoraGlobal)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([h, count]) => ({ hora: `${h}:00`, bipeos: count }));

  return {
    tableData,
    totalesHU,
    usuariosActivosDetalle,
    refMs,
    bipeoPorHoraArray,
    huStats: {
      objetivoHU,
      productividadHU,
      usuariosNecesarios,
      usuariosActivos: totalesHU.usuarios,
      diferenciaUsuarios: totalesHU.usuarios - usuariosNecesarios,
      pendientes: trabajoRestante,
    },
    usuariosConectados,
  };
};
