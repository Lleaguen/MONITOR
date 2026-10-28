const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

const normalizarPatente = (p) =>
  String(p || "").toUpperCase().replace(/[^A-Z0-9]/g, "");

const levenshtein = (a, b) => {
  const m = a.length, n = b.length;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  let curr = new Array(n + 1);
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      curr[j] = a[i - 1] === b[j - 1] ? prev[j - 1] : 1 + Math.min(prev[j - 1], prev[j], curr[j - 1]);
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

const RANGOS_CIU = [
  { min: 16, max: 19, tipo: 'otro' },
  { min: 20, max: 26, tipo: 'semi' },
  { min: 27, max: 42, tipo: 'chasis' },
  { min: 43, max: 75, tipo: 'camioneta' },
];
const RANGOS_EEV = [
  { min: 17, max: 25, tipo: 'camioneta' },
  { min: 80, max: 100, tipo: 'chasis' },
];

const getTipoByNum = (num, site = 'CIU') => {
  const rangos = site === 'EEV' ? RANGOS_EEV : RANGOS_CIU;
  return rangos.find(r => num >= r.min && num <= r.max)?.tipo ?? null;
};

const isDocaValida = (num, site = 'CIU') => getTipoByNum(num, site) !== null;

const getSectorDoca = (doca, site = 'CIU') => {
  const num = parseInt(String(doca || "").replace(/\D/g, ""), 10);
  if (isNaN(num)) return null;
  return getTipoByNum(num, site);
};

const getTipoPorDoca = (doca, site = 'CIU') => {
  const num = parseInt(String(doca || "").replace(/\D/g, ""), 10);
  if (isNaN(num)) return 'otro';
  return getTipoByNum(num, site) ?? 'otro';
};

const extraerPatentesED = (campo) =>
  String(campo || "").toUpperCase().split(/[;,\s/]+/).map(normalizarPatente).filter(p => p.length >= 4);

const parsearHoraED = (raw) => {
  const str = String(raw || "").trim();
  if (!str) return null;
  const num = parseFloat(str);
  if (!isNaN(num) && num > 1000) return Math.floor((num - Math.floor(num)) * 24);
  const norm = str.replace(/\s+/g, ' ').replace(/a\.\s*m\./gi, 'AM').replace(/p\.\s*m\./gi, 'PM');
  const m = norm.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)?$/i);
  if (!m) return null;
  let h = parseInt(m[4], 10);
  if (m[7]?.toUpperCase() === 'PM' && h !== 12) h += 12;
  if (m[7]?.toUpperCase() === 'AM' && h === 12) h = 0;
  return h;
};

const parsearHoraExactaED = (raw) => {
  const str = String(raw || "").trim();
  const num = parseFloat(str);
  if (!isNaN(num) && num > 1000) {
    const fraccion = num - Math.floor(num);
    const totalMin = Math.round(fraccion * 24 * 60);
    return `${String(Math.floor(totalMin / 60)).padStart(2, '0')}:${String(totalMin % 60).padStart(2, '0')}`;
  }
  const hora = parsearHoraED(raw);
  return hora !== null ? `${String(hora).padStart(2, '0')}:00` : '--:--';
};

module.exports = {
  normalizarPatente, levenshtein, coincidenConTolerancia, getTipoVehiculo,
  isDocaValida, getSectorDoca, getTipoPorDoca, extraerPatentesED,
  parsearHoraED, parsearHoraExactaED,
};
