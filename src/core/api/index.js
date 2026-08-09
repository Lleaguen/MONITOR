const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Obtiene el site activo guardado en localStorage (fallback 'CIU')
const getSite = () => {
  try { return localStorage.getItem('selectedSite') || 'CIU'; } catch { return 'CIU'; }
};

// Envía el snapshot procesado al backend (solo admin)
// El site va embebido en dashboardData.site (lo agrega useAdminSync)
export const pushSnapshot = async (dashboardData) => {
  const res = await fetch(`${BASE_URL}/snapshot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dashboardData),
  });
  if (!res.ok) throw new Error(`Error al guardar snapshot: ${res.status}`);
  return res.json();
};

// Obtiene el snapshot del backend para el site activo
export const fetchSnapshot = async (site) => {
  const s = site || getSite();
  const res = await fetch(`${BASE_URL}/data?site=${s}`);
  if (!res.ok) throw new Error(`Error al obtener datos: ${res.status}`);
  return res.json();
};

// Verifica si hay datos disponibles para el site activo
export const fetchStatus = async (site) => {
  const s = site || getSite();
  const res = await fetch(`${BASE_URL}/status?site=${s}`);
  if (!res.ok) throw new Error(`Error al verificar estado: ${res.status}`);
  return res.json();
};

// Guarda el plan de vehículos en el servidor (persiste entre actualizaciones)
export const pushPlan = async (planVehiculos, site) => {
  const s = site || getSite();
  const res = await fetch(`${BASE_URL}/plan?site=${s}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planVehiculos, site: s }),
  });
  if (!res.ok) throw new Error(`Error al guardar plan: ${res.status}`);
  return res.json();
};

// Obtiene el plan guardado en el servidor para el site activo
export const fetchPlan = async (site) => {
  const s = site || getSite();
  const res = await fetch(`${BASE_URL}/plan?site=${s}`);
  if (!res.ok) throw new Error(`Error al obtener plan: ${res.status}`);
  return res.json();
};
