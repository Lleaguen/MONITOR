import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';

dayjs.extend(customParseFormat);

export const normalizarPatente = (p) =>
  String(p || "").toUpperCase().replace(/[^A-Z0-9]/g, "");

export const levenshtein = (a, b) => {
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

export const coincidenConTolerancia = (pED, pTMS) => {
  if (!pED || !pTMS) return false;
  if (pED === pTMS) return true;
  const dif = Math.abs(pED.length - pTMS.length);
  if (dif > 2) return false;
  const maxLen = Math.max(pED.length, pTMS.length);
  const umbral = dif === 0 ? 0.75 : 0.80;
  return (maxLen - levenshtein(pED, pTMS)) / maxLen >= umbral;
};

export const getTipoVehiculo = (tipoRaw) => {
  const t = String(tipoRaw || "").toUpperCase();
  if (t.includes("SEMI")) return 'semi';
  if (t.includes("CHASIS")) return 'chasis';
  if (t.includes("CAMIONETA") || t.includes("MELI")) return 'camioneta';
  console.log(t.includes("CAMIONETA") || t.includes("MELI"))
  return 'otro';
};

export const getSectorDoca = (doca) => {
  const num = parseInt(String(doca || "").replace(/\D/g, ""), 10);
  if (isNaN(num)) return null;
  if (num >= 20 && num <= 26) return 'semi_o_chasis';
  if (num >= 27 && num <= 42) return 'chasis';
  if (num >= 43 && num <= 75) return 'camioneta';
  return null;
};

export const getTipoPorDoca = (doca) => {
  const num = parseInt(String(doca || "").replace(/\D/g, ""), 10);
  if (isNaN(num)) return 'otro';
  if (num >= 20 && num <= 26) return 'semi';
  if (num >= 27 && num <= 42) return 'chasis';
  if (num >= 43 && num <= 75) return 'camioneta';
  return 'otro';
};

export const extraerPatentesED = (campo) =>
  String(campo || "")
    .toUpperCase()
    .split(/[;,\s/]+/)
    .map(normalizarPatente)
    .filter(p => p.length >= 4);

// Parsea hora desde serial de Excel o string D/M/YYYY H:mm:ss a.m./p.m.
export const parsearHoraED = (raw) => {
  const str = String(raw || "").trim();
  if (!str) return null;
  const num = parseFloat(str);
  if (!isNaN(num) && num > 1000) {
    return Math.floor((num - Math.floor(num)) * 24);
  }
  const norm = str.replace(/\s+/g, ' ').replace(/a\.\s*m\./gi, 'AM').replace(/p\.\s*m\./gi, 'PM');
  const m = norm.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)?$/i);
  if (!m) return null;
  let h = parseInt(m[4], 10);
  if (m[7]?.toUpperCase() === 'PM' && h !== 12) h += 12;
  if (m[7]?.toUpperCase() === 'AM' && h === 12) h = 0;
  return h;
};

// Parsea hora exacta (HH:MM) desde serial de Excel
export const parsearHoraExactaED = (raw) => {
  const str = String(raw || "").trim();
  const num = parseFloat(str);
  if (!isNaN(num) && num > 1000) {
    const fraccion = num - Math.floor(num);
    const totalMin = Math.round(fraccion * 24 * 60);
    const hh = Math.floor(totalMin / 60);
    const mm = totalMin % 60;
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  }
  const hora = parsearHoraED(raw);
  return hora !== null ? `${String(hora).padStart(2, '0')}:00` : '--:--';
};
