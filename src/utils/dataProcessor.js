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

const getTipoPorDoca = (doca) => {
  const num = parseInt(String(doca || "").replace(/\D/g, ""), 10);
  if (isNaN(num)) return 'otro';
  if (num >= 20 && num <= 26) return 'semi';
  if (num >= 27 && num <= 42) return 'chasis';
  if (num >= 43 && num <= 75) return 'camioneta';
  return 'otro';
};

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
  OCS052: '4:00', CK350: '4:00', PCK350: '4:00', SJN1: '4:00', SLA1: '4:00',
  SMQ1: '4:00', SPG1: '4:00', SPN1: '4:00', WEB200: '4:00', WEB202: '4:00',
  SBU1: '4:00', SBU5: '4:00', SCF4: '4:00',
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
  CK390: '13:00', PCK390: '13:00',
};

const getCPTdeZona = (zona) => {
  if (!zona) return null;
  const z = String(zona).toUpperCase().trim().replace(/_+$/, "");
  if (ZONA_CPT[z]) return ZONA_CPT[z];
  for (const key of Object.keys(ZONA_CPT)) {
    if (z.startsWith(key) || key.startsWith(z)) return ZONA_CPT[key];
  }
  return null;
};

// ─────────────────────────────────────────────
// PROCESADOR PRINCIPAL
// ─────────────────────────────────────────────
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

  // ── 2. PATENTES TMS ÚNICAS ──
  const patentesTMSMap = new Map();
  const patentesTMSSet = new Set();

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

  const patentesTMSArray = Array.from(patentesTMSMap.entries());

  // ── 3. MATCHING ED → TMS ──
  const matchEDaTMS = new Map();

  easyDockingClean.forEach((doc, idx) => {
    const patenteED = extraerPatentesED(doc['PATENTE']);
    if (patenteED.length === 0) { matchEDaTMS.set(idx, null); return; }

    let found = null;

    for (const pED of patenteED) {
      if (patentesTMSSet.has(pED)) {
        found = { patenteTMS: pED, ...patentesTMSMap.get(pED) };
        break;
      }
    }

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

  // ── 4. VEHÍCULOS EN ESPERA + DÁRSENAS ACTIVAS ──
  // Dársenas activas = docas únicas con Hub Status = in_hub, clasificadas por sector
  const darsenasActivas = { chasis: new Set(), camioneta: new Set(), semi: new Set() };

  csvData.forEach(d => {
    const status = String(d['Hub Status'] || "").toLowerCase().trim();
    if (status !== 'in_hub') return;
    const doca = String(d['Inbound Dock ID'] || "").trim();
    if (!doca) return;
    const num = parseInt(doca.replace(/\D/g, ""), 10);
    if (isNaN(num)) return;
    if (num >= 20 && num <= 26) darsenasActivas.semi.add(doca);
    else if (num >= 27 && num <= 42) darsenasActivas.chasis.add(doca);
    else if (num >= 43 && num <= 75) darsenasActivas.camioneta.add(doca);
  });

  // Chasis que están descargando en sector camioneta
  const chasisEnCamionetaDescargando = new Set();

  easyDockingClean.forEach((doc, idx) => {
    const match = matchEDaTMS.get(idx);
    if (!match) return;
    const tipo = getTipoVehiculo(doc['TIPO DE VEHICULO']);
    const sector = getSectorDoca(match.doca);
    // Chasis descargando en sector camioneta
    if (tipo === 'chasis' && sector === 'camioneta') {
      chasisEnCamionetaDescargando.add(match.patenteTMS);
    }
  });

  const vehiculosEnEspera = easyDockingClean.filter((_, idx) => matchEDaTMS.get(idx) === null);

  const conteoEspera = { chasis: 0, camioneta: 0, semi: 0, total: 0, atracados: 0 };
  vehiculosEnEspera.forEach(v => {
    const tipo = getTipoVehiculo(v['TIPO DE VEHICULO']);
    if (tipo === 'chasis') conteoEspera.chasis++;
    else if (tipo === 'camioneta') conteoEspera.camioneta++;
    else if (tipo === 'semi') conteoEspera.semi++;
    conteoEspera.total++;
  });

  // Restamos los chasis que ya entraron pero están en sector camioneta
  conteoEspera.chasis = Math.max(conteoEspera.chasis - chasisEnCamionetaDescargando.size, 0);

  patentesTMSMap.forEach(info => {
    if (info.status === 'in_hub') conteoEspera.atracados++;
  });

  conteoEspera.darsenasChasis     = darsenasActivas.chasis.size;
  conteoEspera.darsenаsCamioneta  = darsenasActivas.camioneta.size;
  conteoEspera.darsenaSemi        = darsenasActivas.semi.size;

  // ── 5. DESVÍOS DE DOCA — solo chasis en sector camioneta ──
  // Contamos: total chasis en camioneta (ya descargados + descargando ahora)
  let chasisEnCamionetaTotal = 0;
  let chasisEnCamionetaDescargandoAhora = 0;

  easyDockingClean.forEach((doc, idx) => {
    const match = matchEDaTMS.get(idx);
    if (!match) return;
    const tipo = getTipoVehiculo(doc['TIPO DE VEHICULO']);
    const sector = getSectorDoca(match.doca);
    if (tipo === 'chasis' && sector === 'camioneta') {
      chasisEnCamionetaTotal++;
      if (match.status === 'in_hub') chasisEnCamionetaDescargandoAhora++;
    }
  });

  const desviosDoca = {
    chasisEnCamioneta: chasisEnCamionetaTotal,
    chasisEnCamionetaAhora: chasisEnCamionetaDescargandoAhora,
    chasisEnCamionetaYaDescargados: chasisEnCamionetaTotal - chasisEnCamionetaDescargandoAhora,
  };

  // ── 6. MAPA PATENTE TMS → TIPO ──
  const mapPatenteTipo = new Map();
  easyDockingClean.forEach((doc, idx) => {
    const match = matchEDaTMS.get(idx);
    if (!match) return;
    if (!mapPatenteTipo.has(match.patenteTMS)) {
      mapPatenteTipo.set(match.patenteTMS, getTipoVehiculo(doc['TIPO DE VEHICULO']));
    }
  });

  // ── 7. LOOP ÚNICO SOBRE CSV ──
  let ultimaTs = 0;
  let totalPiezasSistema = 0;
  const bipeoPorHora = new Array(24).fill(0);
  const filasTMS = [];

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
  const minutosTranscurridos = Math.max((ultimaTs - inicioHoraActualMs) / 60000, 1);

  const piezasPorTipoEnHora = { chasis: 0, camioneta: 0, semi: 0, otro: 0 };
  let bip14 = 0, bip16 = 0, bip18 = 0;

  filasTMS.forEach(({ tsMs, patente, h, doca }) => {
    if (h < 14) bip14++;
    if (h < 16) bip16++;
    if (h < 18) bip18++;
    if (tsMs >= inicioHoraActualMs && tsMs <= ultimaTs) {
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

  // Convierte serial numérico de Excel a hora (0-23)
  // Excel guarda fechas como días desde 1/1/1900; la parte decimal es fracción del día
  const excelSerialToHour = (val) => {
    const num = parseFloat(val);
    if (isNaN(num) || num < 1000) return null;
    return Math.floor((num - Math.floor(num)) * 24);
  };

  const vehiculosPorHoraTipo = {};
  easyDockingClean.forEach(doc => {
    const raw = String(doc['Fecha y hora'] || "").trim();
    if (!raw) return;

    let hora = excelSerialToHour(raw);

    if (hora === null) {
      // Fallback: string D/M/YYYY H:mm:ss a. m./p. m.
      const norm = raw.replace(/\s+/g, ' ').replace(/a\.\s*m\./gi, 'AM').replace(/p\.\s*m\./gi, 'PM');
      const m = norm.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)?$/i);
      if (m) {
        let h = parseInt(m[4], 10);
        if (m[7]?.toUpperCase() === 'PM' && h !== 12) h += 12;
        if (m[7]?.toUpperCase() === 'AM' && h === 12) h = 0;
        hora = h;
      }
    }

    if (hora === null || hora < 10 || hora > 23) return;
    arriboPorHora[hora] += parseFloat(doc['CANT PAQUETES']) || 0;

    // También contamos vehículos por tipo y hora
    const tipo = getTipoVehiculo(doc['TIPO DE VEHICULO']);
    if (!vehiculosPorHoraTipo[hora]) vehiculosPorHoraTipo[hora] = { chasis: 0, camioneta: 0, semi: 0 };
    if (tipo === 'chasis') vehiculosPorHoraTipo[hora].chasis++;
    else if (tipo === 'camioneta') vehiculosPorHoraTipo[hora].camioneta++;
    else if (tipo === 'semi') vehiculosPorHoraTipo[hora].semi++;
  });

  const vehiculosChartData = HORAS.map(h => ({
    hora: `${String(h).padStart(2, '0')}:00`,
    chasis:    vehiculosPorHoraTipo[h]?.chasis    || 0,
    camioneta: vehiculosPorHoraTipo[h]?.camioneta || 0,
    semi:      vehiculosPorHoraTipo[h]?.semi      || 0,
  }));
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

  // ── 12. TABLE DATA (HU por CPT → por zona) ──
  const CPT_ORDEN = [
    '0:00','1:00','2:00','3:00','4:00','5:00','6:00',
    '7:00','8:00','9:00','10:00','11:00','13:00'
  ];

  const cptData = {};
  const ultimaActividadUsuario = new Map();
  CPT_ORDEN.forEach(c => { cptData[c] = { zonas: {}, usuariosSetCPT: new Set() }; });

  csvData.forEach(d => {
    if (!d['Shipment ID']) return;
    const zona = String(d['Labeling Zone'] || "").trim();
    if (!zona) return;
    const cpt = getCPTdeZona(zona);
    if (!cpt || !cptData[cpt]) return;

    if (!cptData[cpt].zonas[zona]) {
      cptData[cpt].zonas[zona] = {
        etiquetado: 0, huAbierto: 0, huCerrado: 0,
        huFinalizadas: 0,
        huEnDespachoSet: new Set(),
        despachadoSet:   new Set(),
        usuariosSet:     new Set(),
      };
    }
    const z = cptData[cpt].zonas[zona];

    const outboundId = String(d['Outbound ID'] || "").trim();
    const dispatchId = String(d['Dispatch ID'] || "").trim();
    const tieneOutbound = !!d['Outbound Included Date'];
    const tieneCierre   = !!d['Outbound Date Closed'];
    const hubStatus     = String(d['Hub Status'] || "").toLowerCase().trim();

    z.etiquetado++;
    if (tieneOutbound && tieneCierre) z.huCerrado++;
    else if (tieneOutbound)           z.huAbierto++;

    if (hubStatus === 'outbound_finished') z.huFinalizadas++;

    if (d['Outbound Position'] && outboundId) z.huEnDespachoSet.add(outboundId);

    if (d['Dispatch Included Date'] && dispatchId) {
      const dispatchHora = dayjs(d['Dispatch Included Date'], "DD/MM/YYYY HH:mm:ss");
      if (dispatchHora.isValid() && dispatchHora.hour() >= 10) {
        z.despachadoSet.add(dispatchId);
      }
    }

    const rawUsr = String(d['Outbound Added By'] || "").trim();
    if (rawUsr) {
      const usr = rawUsr.replace(/\(\d+\)$/, "").trim().toLowerCase();
      if (usr) {
        const outboundTs = d['Outbound Included Date']
          ? dayjs(d['Outbound Included Date'], "DD/MM/YYYY HH:mm:ss").valueOf()
          : 0;
        const prev = ultimaActividadUsuario.get(usr);
        if (!prev || outboundTs > prev.ts) {
          ultimaActividadUsuario.set(usr, { cpt, zona, ts: outboundTs });
        }
      }
    }
  });

  // Asignamos cada usuario solo a su última zona/CPT
  CPT_ORDEN.forEach(c => { cptData[c].usuariosSetCPT = new Set(); });
  ultimaActividadUsuario.forEach((info, usr) => {
    const { cpt, zona } = info;
    if (!cptData[cpt]) return;
    cptData[cpt].usuariosSetCPT.add(usr);
    if (cptData[cpt].zonas[zona]) {
      cptData[cpt].zonas[zona].usuariosSet.add(usr);
    }
  });

  const usuariosSetGlobal = new Set(ultimaActividadUsuario.keys());

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
          huFinalizadas: z.huFinalizadas,
          huEnDespacho:  z.huEnDespachoSet.size,
          despachado:    z.despachadoSet.size,
          usuarios:      z.usuariosSet.size,
        };
      });

      const totCPT = zonas.reduce((acc, z) => ({
        etiquetado:    acc.etiquetado    + z.etiquetado,
        huAbierto:     acc.huAbierto     + z.huAbierto,
        huCerrado:     acc.huCerrado     + z.huCerrado,
        pendiente:     acc.pendiente     + z.pendiente,
        huFinalizadas: acc.huFinalizadas + z.huFinalizadas,
        huEnDespacho:  acc.huEnDespacho  + z.huEnDespacho,
        despachado:    acc.despachado    + z.despachado,
      }), { etiquetado:0, huAbierto:0, huCerrado:0, pendiente:0, huFinalizadas:0, huEnDespacho:0, despachado:0 });

      totCPT.usuarios = cptData[cpt].usuariosSetCPT.size;
      totCPT.avance = totCPT.etiquetado > 0
        ? Math.round((totCPT.huCerrado / totCPT.etiquetado) * 10000) / 100
        : 0;

      return { cpt, zonas, totCPT };
    });

  const totalesHU = tableData.reduce((acc, { totCPT }) => ({
    etiquetado:    acc.etiquetado    + totCPT.etiquetado,
    huAbierto:     acc.huAbierto     + totCPT.huAbierto,
    huCerrado:     acc.huCerrado     + totCPT.huCerrado,
    pendiente:     acc.pendiente     + totCPT.pendiente,
    huFinalizadas: acc.huFinalizadas + totCPT.huFinalizadas,
    huEnDespacho:  acc.huEnDespacho  + totCPT.huEnDespacho,
    despachado:    acc.despachado    + totCPT.despachado,
  }), { etiquetado:0, huAbierto:0, huCerrado:0, pendiente:0, huFinalizadas:0, huEnDespacho:0, despachado:0 });

  totalesHU.usuarios = usuariosSetGlobal.size;
  totalesHU.avance = totalesHU.etiquetado > 0
    ? Math.round((totalesHU.huCerrado / totalesHU.etiquetado) * 10000) / 100
    : 0;

  // ── ARRIVALS DE CHASIS — solo los que NO descargaron aún ──
  const arrivalChasis = easyDockingClean
    .filter((doc, idx) => {
      const esChasis = getTipoVehiculo(doc['TIPO DE VEHICULO']) === 'chasis';
      const noDescargado = matchEDaTMS.get(idx) === null;
      return esChasis && noDescargado;
    })
    .map(doc => {
      const raw = String(doc['Fecha y hora'] || "").trim();
      let hora = null;
      const num = parseFloat(raw);
      if (!isNaN(num) && num > 1000) {
        hora = Math.floor((num - Math.floor(num)) * 24);
      } else {
        const norm = raw.replace(/\s+/g, ' ').replace(/a\.\s*m\./gi, 'AM').replace(/p\.\s*m\./gi, 'PM');
        const m = norm.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)?$/i);
        if (m) {
          let h = parseInt(m[4], 10);
          if (m[7]?.toUpperCase() === 'PM' && h !== 12) h += 12;
          if (m[7]?.toUpperCase() === 'AM' && h === 12) h = 0;
          hora = h;
        }
      }
      // Hora formateada
      let horaStr = hora !== null ? `${String(hora).padStart(2, '0')}:00` : '--:--';
      // Intentar hora exacta desde serial
      if (!isNaN(num) && num > 1000) {
        const fraccion = num - Math.floor(num);
        const totalMin = Math.round(fraccion * 24 * 60);
        const hh = Math.floor(totalMin / 60);
        const mm = totalMin % 60;
        horaStr = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
      }

      const rawPatente = String(doc['PATENTE'] || "").trim();
      const piezas = Math.round(parseFloat(doc['CANT PAQUETES']) || 0);

      return { patente: rawPatente, hora: horaStr, horaNum: hora ?? 99, piezas };
    })
    .filter(r => r.piezas > 0)
    .sort((a, b) => a.horaNum - b.horaNum || a.hora.localeCompare(b.hora));
  // Paquetería: Height ≤ 50 AND Length ≤ 50 AND Width ≤ 50 (en cm)
  // Voluminoso: cualquier dimensión > 50
  const volPorZona = {}; // zona → { paqueteria, voluminoso }

  csvData.forEach(d => {
    if (!d['Shipment ID']) return;
    const zona = String(d['Labeling Zone'] || "").trim();
    if (!zona) return;
    const cpt = getCPTdeZona(zona);
    if (!cpt) return;

    if (!volPorZona[zona]) volPorZona[zona] = { zona, cpt, paqueteria: 0, voluminoso: 0 };

    const h = parseFloat(d['Height'] || 0);
    const l = parseFloat(d['Length'] || 0);
    const w = parseFloat(d['Width']  || 0);

    if (h <= 50 && l <= 50 && w <= 50) {
      volPorZona[zona].paqueteria++;
    } else {
      volPorZona[zona].voluminoso++;
    }
  });

  // Agrupamos por CPT para la vista
  const volData = Object.values(volPorZona).sort((a, b) => a.cpt.localeCompare(b.cpt));

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
    vehiculosChartData,
    targets,
    tableData,
    totalesHU,
    volData,
    arrivalChasis,
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
