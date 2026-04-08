import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import {
  normalizarPatente, coincidenConTolerancia,
  getTipoVehiculo, getSectorDoca, extraerPatentesED
} from './helpers.js';

dayjs.extend(customParseFormat);

// Construye el mapa de patentes únicas del TMS
export const buildPatentesTMS = (csvData) => {
  const map = new Map();
  const set = new Set();
  csvData.forEach(d => {
    const pat = normalizarPatente(d['Truck ID']);
    if (pat.length < 4 || map.has(pat)) return;
    map.set(pat, {
      status: String(d['Hub Status'] || "").toLowerCase().trim(),
      doca: String(d['Inbound Dock ID'] || "").trim(),
    });
    set.add(pat);
  });
  return { map, set, array: Array.from(map.entries()) };
};

// Matching ED → TMS
export const buildMatchEDaTMS = (easyDockingClean, patentesTMS) => {
  const { map, set, array } = patentesTMS;
  const matchEDaTMS = new Map();

  easyDockingClean.forEach((doc, idx) => {
    const patenteED = extraerPatentesED(doc['PATENTE']);
    if (patenteED.length === 0) { matchEDaTMS.set(idx, null); return; }

    let found = null;
    for (const pED of patenteED) {
      if (set.has(pED)) { found = { patenteTMS: pED, ...map.get(pED) }; break; }
    }
    if (!found) {
      outer: for (const pED of patenteED) {
        for (const [patTMS, info] of array) {
          if (coincidenConTolerancia(pED, patTMS)) {
            found = { patenteTMS: patTMS, ...info };
            break outer;
          }
        }
      }
    }
    matchEDaTMS.set(idx, found);
  });

  return matchEDaTMS;
};

// Dársenas activas por sector (bipeo en últimos 10 min)
export const buildDarsenasActivas = (csvData, ultimaTs) => {
  const DIEZ_MIN_MS = 10 * 60 * 1000;
  const ultimoBipeoPorDoca = new Map();

  csvData.forEach(d => {
    const doca = String(d['Inbound Dock ID'] || "").trim();
    if (!doca) return;
    const f = dayjs(d['Inbound Date Included'], "DD/MM/YYYY HH:mm:ss");
    if (!f.isValid()) return;
    const ts = f.valueOf();
    if (!ultimoBipeoPorDoca.has(doca) || ts > ultimoBipeoPorDoca.get(doca)) {
      ultimoBipeoPorDoca.set(doca, ts);
    }
  });

  const activas = { chasis: new Set(), camioneta: new Set(), semi: new Set() };
  ultimoBipeoPorDoca.forEach((ts, doca) => {
    if ((ultimaTs - ts) > DIEZ_MIN_MS) return;
    const num = parseInt(doca.replace(/\D/g, ""), 10);
    if (isNaN(num)) return;
    if (num >= 20 && num <= 26) activas.semi.add(doca);
    else if (num >= 27 && num <= 42) activas.chasis.add(doca);
    else if (num >= 43 && num <= 75) activas.camioneta.add(doca);
  });

  return activas;
};

// Vehículos en espera + desvíos de doca
export const buildVehiculosEspera = (easyDockingClean, matchEDaTMS, patentesTMSMap, darsenasActivas) => {
  const chasisEnCamionetaDescargando = new Set();
  let chasisEnCamionetaTotal = 0;
  let chasisEnCamionetaAhora = 0;

  easyDockingClean.forEach((doc, idx) => {
    const match = matchEDaTMS.get(idx);
    if (!match) return;
    const tipo = getTipoVehiculo(doc['TIPO DE VEHICULO']);
    const sector = getSectorDoca(match.doca);
    if (tipo === 'chasis' && sector === 'camioneta') {
      chasisEnCamionetaDescargando.add(match.patenteTMS);
      chasisEnCamionetaTotal++;
      if (match.status === 'in_hub') chasisEnCamionetaAhora++;
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

  conteoEspera.chasis = Math.max(conteoEspera.chasis - chasisEnCamionetaDescargando.size, 0);
  patentesTMSMap.forEach(info => { if (info.status === 'in_hub') conteoEspera.atracados++; });
  conteoEspera.darsenasChasis    = darsenasActivas.chasis.size;
  conteoEspera.darsenаsCamioneta = darsenasActivas.camioneta.size;
  conteoEspera.darsenaSemi       = darsenasActivas.semi.size;

  const desviosDoca = {
    chasisEnCamioneta: chasisEnCamionetaTotal,
    chasisEnCamionetaAhora,
    chasisEnCamionetaYaDescargados: chasisEnCamionetaTotal - chasisEnCamionetaAhora,
  };

  return { conteoEspera, desviosDoca };
};

// Mapa patente TMS → tipo de vehículo (via ED)
export const buildMapPatenteTipo = (easyDockingClean, matchEDaTMS) => {
  const map = new Map();
  easyDockingClean.forEach((doc, idx) => {
    const match = matchEDaTMS.get(idx);
    if (!match || map.has(match.patenteTMS)) return;
    map.set(match.patenteTMS, getTipoVehiculo(doc['TIPO DE VEHICULO']));
  });
  return map;
};
