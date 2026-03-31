import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import minMax from 'dayjs/plugin/minMax.js';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js';

dayjs.extend(customParseFormat);
dayjs.extend(minMax);
dayjs.extend(isSameOrBefore);

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const normalizarPatente = (p) =>
  String(p || "").toUpperCase().replace(/[^A-Z0-9]/g, "");

const levenshtein = (a, b) => {
  const m = a.length, n = b.length;
  // Fila única reutilizable — mucho más rápido que crear matriz completa
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  let curr = new Array(n + 1);
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      curr[j] = a[i - 1] === b[j - 1]
        ? prev[j - 1]
        : 1 + Math.min(prev[j - 1], prev[j], curr[j - 1]);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
};

const coincidenConTolerancia = (pED, pTMS) => {
  if (!pED || !pTMS) return false;
  if (pED === pTMS) return true;
  const dif = Math.abs(pED.length - pTMS.length);
  if (dif > 2) return false;
  const maxLen = Math.max(pED.length, pTMS.length);
  const umbral = dif === 0 ? 0.75 : 0.80;
  return (maxLen - levenshtein(pED, pTMS)) / maxLen >= umbral;
};

const getTipoVehiculo = (tipoRaw) => {
  const t = String(tipoRaw || "").toUpperCase();
  if (t.includes("SEMI")) return 'semi';
  if (t.includes("CHASIS")) return 'chasis';
  if (t.includes("CAMIONETA") || t.includes("MELI")) return 'camioneta';
  return 'otro';
};

const getSectorDoca = (doca) => {
  const num = parseInt(String(doca || "").replace(/\D/g, ""), 10);
  if (isNaN(num)) return null;
  if (num >= 20 && num <= 26) return 'semi_o_chasis';
  if (num >= 27 && num <= 42) return 'chasis';
  if (num >= 43 && num <= 75) return 'camioneta';
  return null;
};

// Infiere tipo de vehículo por número de doca (fallback cuando no hay match por patente)
const getTipoPorDoca = (doca) => {
  const num = parseInt(String(doca || "").replace(/\D/g, ""), 10);
  if (isNaN(num)) return 'otro';
  if (num >= 20 && num <= 26) return 'semi';   // zona semi/chasis, asumimos semi
  if (num >= 27 && num <= 42) return 'chasis';
  if (num >= 43 && num <= 75) return 'camioneta';
  return 'otro';
};

// Extrae lista de patentes normalizadas de un campo de ED (soporta dobles: "AAA111; BBB222")
const extraerPatentesED = (campo) =>
  String(campo || "")
    .toUpperCase()
    .split(/[;,\s/]+/)
    .map(normalizarPatente)
    .filter(p => p.length >= 4);

// ─────────────────────────────────────────────
// MAPA ZONA → CPT
// ─────────────────────────────────────────────
const ZONA_CPT = {
  OCS060: '0:00', OCS061: '0:00', OCS070: '0:00', SBH1: '0:00', SBH1_X: '0:00',
  SCO1: '0:00', SCO2: '0:00',
  OCS062: '1:00', OCS064: '1:00', SER1: '1:00', SRU1: '1:00', SRU2: '1:00',
  HOP300: '2:00', OCS063: '2:00', OCS067: '2:00', OCS069: '2:00', SGU1: '2:00',
  SRF1: '2:00', SRO1: '2:00', SRO2: '2:00', SSF1: '2:00', SSF1_X: '2:00',
  SSR1: '2:00', SSR1_X: '2:00', SVI1: '2:00', URB150: '2:00',
  AND010: '3:00', AND011: '3:00', OCS066: '3:00', SBU2: '3:00', SBU3_1: '3:00',
  SBU4: '3:00', SCF2: '3:00', SCF3: '3:00', SCK1: '3:00', SCS3: '3:00',
  SCZ1: '3:00', STD1: '3:00', STQ1: '3:00',
  OCS052: '4:00', CK350_: '4:00', SJN1: '4:00', SLA1: '4:00', SMQ1: '4:00',
  SPG1: '4:00', SPN1: '4:00', WEB200: '4:00', WEB202: '4:00',
  SBU3_2: '5:00', SJU1: '5:00', SST1: '5:00', SRV1: '5:00', STU1: '5:00',
  STU1_X: '5:00', STW1: '5:00',
  SBC1: '6:00',
  COR125: '7:00', COR126: '7:00', SCO1_X: '7:00', SPS1: '7:00', SRE1: '7:00',
  SRE1_X: '7:00', URB175: '7:00',
  AND027: '8:00', AND028: '8:00', AND031: '8:00', AND032: '8:00', AND033: '8:00',
  SNQ1: '8:00', SNQ2: '8:00',
  AND025: '9:00', AND029: '9:00', AND030: '9:00', SLU1: '9:00', SME1: '9:00',
  SME1_X: '9:00', SSJ1: '9:00',
  AND040: '10:00', COR140: '10:00', OCA291: '10:00',
  AND034: '11:00', AND035: '11:00', FBA1_R: '11:00',
  CK390_: '13:00',
};

const getCPTdeZona = (zona) => {
  if (!zona) return null;
  const z = String(zona).toUpperCase().trim();
  // Búsqueda exacta primero
  if (ZONA_CPT[z]) return ZONA_CPT[z];
  // Búsqueda por prefijo (por si la zona tiene sufijos variables)
  for (const key of Object.keys(ZONA_CPT)) {
    if (z.startsWith(key) || key.startsWith(z)) return ZONA_CPT[key];
  }
  return null;
};
export const processCombinedData = (csvData, excelRaw, proyectadoManual = 239000, objetivoHU = 75, productividadHU = 180) => {

  // ── 1. PROCESAR EXCEL (Easy Docking) ──
  const workbook = XLSX.read(excelRaw, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawMatrix = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  const headers = rawMatrix[3]?.map(h => String(h).trim()) || [];
  const dataRows = rawMatrix.slice(4);

  const easyDockingClean = dataRows
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i]; });
      return obj;
    })
    .filter(item =>
      String(item['TIPO DE OPERACION'] || "").toUpperCase().includes("DESCARGA") &&
      String(item['Accion'] || "").toLowerCase() === "add"
    );

  // ── 2. PATENTES TMS ÚNICAS (deduplicadas) ──
  // El TMS tiene miles de filas pero solo ~decenas de patentes únicas.
  // Construimos un Map patente → { status, doca } con patentes únicas.
  const patentesTMSMap = new Map(); // patente → { status, doca }
  const patentesTMSSet = new Set(); // para lookup O(1)

  csvData.forEach(d => {
    const pat = normalizarPatente(d['Truck ID']);
    if (pat.length < 4) return;
    if (!patentesTMSMap.has(pat)) {
      patentesTMSMap.set(pat, {
        status: String(d['Hub Status'] || "").toLowerCase().trim(),
        doca: String(d['Inbound Dock ID'] || "").trim(),
      });
      patentesTMSSet.add(pat);
    }
  });

  const patentesTMSArray = Array.from(patentesTMSMap.entries()); // [[patente, {status,doca}]]

  // ── 3. MATCHING ED → TMS (con índice exacto primero) ──
  // Para cada vehículo de ED, buscamos su match en TMS una sola vez
  // y guardamos el resultado en un Map para reutilizarlo.
  // matchEDaTMS: Map<índice ED, { patenteTMS, status, doca } | null>
  const matchEDaTMS = new Map();

  easyDockingClean.forEach((doc, idx) => {
    const patenteED = extraerPatentesED(doc['PATENTE']);
    if (patenteED.length === 0) { matchEDaTMS.set(idx, null); return; }

    let found = null;

    // Primero: búsqueda exacta O(1)
    for (const pED of patenteED) {
      if (patentesTMSSet.has(pED)) {
        found = { patenteTMS: pED, ...patentesTMSMap.get(pED) };
        break;
      }
    }

    // Si no hay exacta: Levenshtein solo sobre patentes únicas (~decenas, no miles)
    if (!found) {
      outer: for (const pED of patenteED) {
        for (const [patTMS, info] of patentesTMSArray) {
          if (coincidenConTolerancia(pED, patTMS)) {
            found = { patenteTMS: patTMS, ...info };
            break outer;
          }
        }
      }
    }

    matchEDaTMS.set(idx, found);
  });

  // ── 4. VEHÍCULOS EN ESPERA ──
  const vehiculosEnEspera = easyDockingClean.filter((_, idx) => matchEDaTMS.get(idx) === null);

  const conteoEspera = { chasis: 0, camioneta: 0, semi: 0, total: 0, atracados: 0 };
  vehiculosEnEspera.forEach(v => {
    const tipo = getTipoVehiculo(v['TIPO DE VEHICULO']);
    if (tipo === 'chasis') conteoEspera.chasis++;
    else if (tipo === 'camioneta') conteoEspera.camioneta++;
    else if (tipo === 'semi') conteoEspera.semi++;
    conteoEspera.total++;
  });
  patentesTMSMap.forEach(info => {
    if (info.status === 'in_hub') conteoEspera.atracados++;
  });

  // ── 5. DESVÍOS DE DOCA ──
  const desviosDoca = { chasisEnCamioneta: 0, semiEnCamioneta: 0, camionetaEnChasis: 0 };
  easyDockingClean.forEach((doc, idx) => {
    const match = matchEDaTMS.get(idx);
    if (!match) return;
    const tipo = getTipoVehiculo(doc['TIPO DE VEHICULO']);
    const sector = getSectorDoca(match.doca);
    if (tipo === 'chasis' && sector === 'camioneta') desviosDoca.chasisEnCamioneta++;
    else if (tipo === 'semi' && sector === 'camioneta') desviosDoca.semiEnCamioneta++;
    else if (tipo === 'camioneta' && (sector === 'chasis' || sector === 'semi_o_chasis')) desviosDoca.camionetaEnChasis++;
  });

  // ── 6. MAPA PATENTE TMS → TIPO (via ED) ──
  // Construido desde matchEDaTMS para no volver a iterar
  const mapPatenteTipo = new Map(); // patenteTMS → tipo
  easyDockingClean.forEach((doc, idx) => {
    const match = matchEDaTMS.get(idx);
    if (!match) return;
    if (!mapPatenteTipo.has(match.patenteTMS)) {
      mapPatenteTipo.set(match.patenteTMS, getTipoVehiculo(doc['TIPO DE VEHICULO']));
    }
  });

  // ── 7. LOOP ÚNICO SOBRE CSV — parsea fechas una sola vez ──
  // Extrae: ultimaReferencia, bipeoPorHora, piezasPorTipoEnHora, bip14/16/18, totalPiezas
  let ultimaTs = 0;
  let totalPiezasSistema = 0;
  const bipeoPorHora = new Array(24).fill(0);
  // piezasPorTipoEnHora se calcula después de conocer ultimaReferencia
  // así que guardamos los datos crudos primero
  const filasTMS = []; // { tsMs, patente }

  csvData.forEach(d => {
    if (!d['Shipment ID']) return;
    totalPiezasSistema++;
    const raw = d['Inbound Date Included'];
    if (!raw) return;
    const f = dayjs(raw, "DD/MM/YYYY HH:mm:ss");
    if (!f.isValid()) return;
    const tsMs = f.valueOf();
    const h = f.hour();
    if (tsMs > ultimaTs) ultimaTs = tsMs;
    if (h >= 10 && h <= 23) bipeoPorHora[h]++;
    filasTMS.push({ tsMs, patente: normalizarPatente(d['Truck ID']), doca: String(d['Inbound Dock ID'] || "").trim(), h });
  });

  const ultimaReferencia = ultimaTs > 0 ? dayjs(ultimaTs) : dayjs();
  const inicioHoraActualMs = ultimaReferencia.startOf('hour').valueOf();
  const minutosTranscurridos = Math.max(
    (ultimaTs - inicioHoraActualMs) / 60000, 1
  );

  // Ahora sí: piezas por tipo en la hora actual + targets
  const piezasPorTipoEnHora = { chasis: 0, camioneta: 0, semi: 0, otro: 0 };
  let bip14 = 0, bip16 = 0, bip18 = 0;

  filasTMS.forEach(({ tsMs, patente, h, doca }) => {
    if (h < 14) bip14++;
    if (h < 16) bip16++;
    if (h < 18) bip18++;
    if (tsMs >= inicioHoraActualMs && tsMs <= ultimaTs) {
      // Intentamos tipo por patente (si matcheó con ED), sino por doca
      const tipoPorPatente = mapPatenteTipo.get(patente);
      const tipo = tipoPorPatente || getTipoPorDoca(doca);
      piezasPorTipoEnHora[tipo]++;
    }
  });

  // ── 8. KPIs ──
  const ahora = dayjs();
  const arribadoExcel = easyDockingClean.reduce(
    (acc, curr) => acc + (parseFloat(curr['CANT PAQUETES']) || 0), 0
  );
  const horasRestantes = Math.max(
    ahora.clone().set('hour', 22).set('minute', 0).diff(ahora, 'hour', true), 0.5
  );
  const objXHoraGlobal = Math.round((proyectadoManual - totalPiezasSistema) / horasRestantes);
  const velocidadReal = Math.round(
    (filasTMS.filter(f => f.tsMs >= inicioHoraActualMs).length / minutosTranscurridos) * 60
  );

  // ── 9. CHART DATA ──
  const HORAS = Array.from({ length: 14 }, (_, i) => i + 10);
  const arriboPorHora = new Array(24).fill(0);
  easyDockingClean.forEach(doc => {
    const raw = String(doc['Fecha y hora'] || "");
    const f = dayjs(raw, ["DD/MM/YY HH:mm", "DD/MM/YYYY HH:mm", "DD/MM/YY HH:mm:ss", "DD/MM/YYYY HH:mm:ss", "DD/MM/YY", "DD/MM/YYYY"]);
    if (f.isValid()) {
      const h = f.hour();
      if (h >= 10 && h <= 23) {
        // Sumamos paquetes, no vehículos
        const paquetes = parseFloat(doc['CANT PAQUETES']) || 0;
        arriboPorHora[h] += paquetes;
      }
    }
  });
  const chartData = HORAS.map(h => ({
    hora: `${String(h).padStart(2, '0')}:00`,
    arribo: arriboPorHora[h],
    bipeo: bipeoPorHora[h],
  }));

  // ── 10. DISCHARGE MATRIX ──
  const velChasis    = Math.round((piezasPorTipoEnHora.chasis    / minutosTranscurridos) * 60);
  const velCamioneta = Math.round((piezasPorTipoEnHora.camioneta / minutosTranscurridos) * 60);
  const velSemi      = Math.round((piezasPorTipoEnHora.semi      / minutosTranscurridos) * 60);
  const totalTipo = piezasPorTipoEnHora.chasis + piezasPorTipoEnHora.camioneta + piezasPorTipoEnHora.semi || 1;

  const matrix = {
    chasis:    { real: velChasis,    planificado: Math.round(objXHoraGlobal * piezasPorTipoEnHora.chasis    / totalTipo) },
    camioneta: { real: velCamioneta, planificado: Math.round(objXHoraGlobal * piezasPorTipoEnHora.camioneta / totalTipo) },
    semi:      { real: velSemi,      planificado: Math.round(objXHoraGlobal * piezasPorTipoEnHora.semi      / totalTipo) },
  };

  // ── 11. TARGETS ──
  const targets = {
    "14HS": { percentage: Math.min(Math.round((bip14 / proyectadoManual) * 100), 100), units: bip14 },
    "16HS": { percentage: Math.min(Math.round((bip16 / proyectadoManual) * 100), 100), units: bip16 },
    "18HS": { percentage: Math.min(Math.round((bip18 / proyectadoManual) * 100), 100), units: bip18 },
  };

  // ── 12. TABLE DATA (HU por CPT → por zona SUB-CA) ──
  const CPT_ORDEN = [
    '0:00','1:00','2:00','3:00','4:00','5:00','6:00',
    '7:00','8:00','9:00','10:00','11:00','13:00'
  ];

  // cptData: { [cpt]: { zonas: { [zona]: { etiquetado, huAbierto, huCerrado, pendiente, huFinalizadas, huEnDespacho, despachado, usuariosSet } } } }
  const cptData = {};
  CPT_ORDEN.forEach(c => { cptData[c] = { zonas: {} }; });

  csvData.forEach(d => {
    if (!d['Shipment ID']) return;
    const zona = String(d['Labeling Zone'] || "").trim();
    if (!zona) return;
    const cpt = getCPTdeZona(zona);
    if (!cpt || !cptData[cpt]) return;

    if (!cptData[cpt].zonas[zona]) {
      cptData[cpt].zonas[zona] = {
        etiquetado: 0, huAbierto: 0, huCerrado: 0,
        huFinalizadasSet: new Set(),
        huEnDespachoSet:  new Set(),
        despachadoSet:    new Set(),
        usuariosSet:      new Set(),
      };
    }
    const z = cptData[cpt].zonas[zona];

    // Armado de HU
    const outboundId  = String(d['Outbound ID'] || "").trim();
    const dispatchId  = String(d['Dispatch ID'] || "").trim();
    const tieneOutbound = !!d['Outbound Included Date'];
    const tieneCierre   = !!d['Outbound Date Closed'];
    z.etiquetado++;
    if (tieneOutbound && tieneCierre) z.huCerrado++;
    else if (tieneOutbound)           z.huAbierto++;

    // Despacho — contamos HUs únicos (Outbound ID / Dispatch ID)
    if (tieneCierre && outboundId)          z.huFinalizadasSet.add(outboundId);
    if (d['Outbound Position'] && outboundId) z.huEnDespachoSet.add(outboundId);
    if (d['Dispatch Included Date'] && dispatchId) z.despachadoSet.add(dispatchId);

    // Usuarios activos
    const usr = String(d['Outbound Added By'] || d['Outbound User IDs'] || "").trim();
    if (usr) z.usuariosSet.add(usr);
  });

  // Convertimos a array de CPTs con sus zonas
  const tableData = CPT_ORDEN
    .filter(cpt => Object.keys(cptData[cpt].zonas).length > 0)
    .map(cpt => {
      const zonas = Object.entries(cptData[cpt].zonas).map(([zona, z]) => {
        const pendiente = z.etiquetado - z.huAbierto - z.huCerrado;
        const avance = z.etiquetado > 0
          ? Math.round((z.huCerrado / z.etiquetado) * 10000) / 100
          : 0;
        return {
          zona,
          etiquetado: z.etiquetado,
          huAbierto:  z.huAbierto,
          huCerrado:  z.huCerrado,
          pendiente:  Math.max(pendiente, 0),
          avance,
          huFinalizadas: z.huFinalizadasSet.size,
          huEnDespacho:  z.huEnDespachoSet.size,
          despachado:    z.despachadoSet.size,
          usuarios:      z.usuariosSet.size,
        };
      });

      // Totales del CPT
      const totCPT = zonas.reduce((acc, z) => ({
        etiquetado:    acc.etiquetado    + z.etiquetado,
        huAbierto:     acc.huAbierto     + z.huAbierto,
        huCerrado:     acc.huCerrado     + z.huCerrado,
        pendiente:     acc.pendiente     + z.pendiente,
        huFinalizadas: acc.huFinalizadas + z.huFinalizadas,
        huEnDespacho:  acc.huEnDespacho  + z.huEnDespacho,
        despachado:    acc.despachado    + z.despachado,
        usuarios:      acc.usuarios      + z.usuarios,
      }), { etiquetado:0, huAbierto:0, huCerrado:0, pendiente:0, huFinalizadas:0, huEnDespacho:0, despachado:0, usuarios:0 });

      totCPT.avance = totCPT.etiquetado > 0
        ? Math.round((totCPT.huCerrado / totCPT.etiquetado) * 10000) / 100
        : 0;

      return { cpt, zonas, totCPT };
    });

  // Totales globales
  const totalesHU = tableData.reduce((acc, { totCPT }) => ({
    etiquetado:    acc.etiquetado    + totCPT.etiquetado,
    huAbierto:     acc.huAbierto     + totCPT.huAbierto,
    huCerrado:     acc.huCerrado     + totCPT.huCerrado,
    pendiente:     acc.pendiente     + totCPT.pendiente,
    huFinalizadas: acc.huFinalizadas + totCPT.huFinalizadas,
    huEnDespacho:  acc.huEnDespacho  + totCPT.huEnDespacho,
    despachado:    acc.despachado    + totCPT.despachado,
    usuarios:      acc.usuarios      + totCPT.usuarios,
  }), { etiquetado:0, huAbierto:0, huCerrado:0, pendiente:0, huFinalizadas:0, huEnDespacho:0, despachado:0, usuarios:0 });

  totalesHU.avance = totalesHU.etiquetado > 0
    ? Math.round((totalesHU.huCerrado / totalesHU.etiquetado) * 10000) / 100
    : 0;

  // ── 13. USUARIOS NECESARIOS PARA HU ──
  const horasHasta22 = Math.max(
    dayjs().set('hour', 22).set('minute', 0).set('second', 0).diff(dayjs(), 'hour', true), 0.1
  );
  const pendientesHUGlobal = totalesHU.pendiente || 0;
  const usuariosNecesarios = productividadHU > 0 && horasHasta22 > 0
    ? Math.ceil(pendientesHUGlobal / productividadHU / horasHasta22)
    : 0;
  const usuariosActivos = totalesHU.usuarios || 0;
  const diferenciaUsuarios = usuariosActivos - usuariosNecesarios;

  return {
    kpis: {
      proyectado: proyectadoManual.toLocaleString(),
      arribado: Math.round(arribadoExcel).toLocaleString(),
      bipeado: totalPiezasSistema.toLocaleString(),
      arribadoBipeado: Math.round(arribadoExcel - totalPiezasSistema).toLocaleString(),
      velocidadReal: velocidadReal.toLocaleString(),
      descargaHora: objXHoraGlobal > 0 ? objXHoraGlobal.toLocaleString() : "0",
      pArribado: Math.round((arribadoExcel / proyectadoManual) * 100) || 0,
      pBipeo: Math.round((totalPiezasSistema / proyectadoManual) * 100) || 0,
      ultimaActualizacion: ultimaReferencia.format("HH:mm:ss"),
      espera: conteoEspera,
      desviosDoca,
    },
    matrix,
    chartData,
    targets,
    tableData,
    totalesHU,
    huStats: {
      objetivoHU,
      productividadHU,
      usuariosNecesarios,
      usuariosActivos,
      diferenciaUsuarios,
      pendientes: pendientesHUGlobal,
    },
  };
};
