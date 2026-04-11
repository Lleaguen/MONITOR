import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import { getCPTdeZona, CPT_ORDEN } from './zonaCPT.js';

dayjs.extend(customParseFormat);

export const buildHUData = (csvData, ultimaTs, objetivoHU, productividadHU, horaInicioHU = 14, zonaCPTOverrides = {}) => {
  /*
   * ─── FILTROS APLICADOS (para coincidir con el monitor Excel) ───────────────
   *
   * 1. Solo piezas con Shipment ID válido
   * 2. Solo zonas en MAYÚSCULAS (excluye zonas en minúscula del CSV)
   * 3. Excluye zonas Meli Air: terminan en _A o _B (ej: SNQ1_A, STW1_A)
   * 4. Excluye FBA1_R
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

  const hoy = dayjs();

csvData.forEach(d => {
  // ✅ FILTRO POR FECHA DE HOY
  const fecha = d['Outbound Included Date'] || d['Dispatch Included Date'] || d['Outbound Date Closed'];
  if (!fecha) return;

  const fechaParseada = dayjs(fecha, "DD/MM/YYYY HH:mm:ss");
  if (!fechaParseada.isValid() || !fechaParseada.isSame(hoy, 'day')) return;

  
  CPT_ORDEN.forEach(c => { cptData[c] = { zonas: {}, usuariosSetCPT: new Set() }; });

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

    const cpt = zonaCPTOverrides[zona] ?? getCPTdeZona(zona);
    if (!cpt) return;

    const cptEntry = getOrCreateCPT(cpt);
    if (!cptEntry.zonas[zona]) {
      cptEntry.zonas[zona] = {
        etiquetado: 0, huAbierto: 0, huCerrado: 0,
        huFinalizadas: 0,
        huEnDespachoSet: new Set(),
        despachadoSet:   new Set(),
        usuariosSet:     new Set(),
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
    // HU Cerrado = tiene Outbound Date Closed (HU completamente armado)
    // HU Abierto = tiene Outbound Included Date pero sin fecha de cierre (en proceso)
    // Para cambiar la lógica de clasificación, modificar estas dos líneas:
    if (d['Outbound Date Closed'] || hubStatus === 'dispatched') z.huCerrado++;
    else if (d['Outbound Included Date']) z.huAbierto++;

    if (hubStatus === 'outbound_finished') z.huFinalizadas++;
    if (d['Outbound Position'] && outboundId) z.huEnDespachoSet.add(outboundId);
    if (d['Dispatch Included Date'] && dispatchId) {
      const dh = dayjs(d['Dispatch Included Date'], "DD/MM/YYYY HH:mm:ss");
      if (dh.isValid() && dh.hour() >= horaInicioHU) z.despachadoSet.add(dispatchId);
    }

    const rawUsr = String(d['Outbound Added By'] || "").trim();
    if (rawUsr) {
      const usr = rawUsr.replace(/\(\d+\)$/, "").trim().toLowerCase();
      if (usr) {
        const ts = d['Outbound Included Date']
          ? dayjs(d['Outbound Included Date'], "DD/MM/YYYY HH:mm:ss").valueOf()
          : 0;
        const prev = ultimaActividadUsuario.get(usr);
        if (!prev || ts > prev.ts) ultimaActividadUsuario.set(usr, { cpt, zona, ts });
      }
    }
  });

  const CINCO_MIN_MS = 5 * 60 * 1000;
  const refMs = ultimaTs > 0 ? ultimaTs : Date.now();

  Object.keys(cptData).forEach(c => { cptData[c].usuariosSetCPT = new Set(); });
  ultimaActividadUsuario.forEach((info, usr) => {
    if ((refMs - info.ts) > CINCO_MIN_MS) return;
    const { cpt, zona } = info;
    if (!cptData[cpt]) return;
    cptData[cpt].usuariosSetCPT.add(usr);
    if (cptData[cpt].zonas[zona]) cptData[cpt].zonas[zona].usuariosSet.add(usr);
  });

  const usuariosSetGlobal = new Set(
    Array.from(ultimaActividadUsuario.entries())
      .filter(([, info]) => (refMs - info.ts) <= CINCO_MIN_MS)
      .map(([usr]) => usr)
  );

  const todosLosCPTs = [
    ...CPT_ORDEN.filter(c => cptData[c]),
    ...Object.keys(cptData).filter(c => !CPT_ORDEN.includes(c)).sort(),
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
  const pendientesHUGlobal = totalesHU.pendiente || 0;
  const usuariosNecesarios = productividadHU > 0
    ? Math.ceil(pendientesHUGlobal / productividadHU / horasHasta22)
    : 0;

  return {
    tableData,
    totalesHU,
    huStats: {
      objetivoHU,
      productividadHU,
      usuariosNecesarios,
      usuariosActivos: totalesHU.usuarios,
      diferenciaUsuarios: totalesHU.usuarios - usuariosNecesarios,
      pendientes: pendientesHUGlobal,
    },
  };
,};
