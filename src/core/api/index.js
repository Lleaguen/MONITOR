const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Envía el snapshot procesado al backend (solo admin)
export const pushSnapshot = async (dashboardData) => {
  const res = await fetch(`${BASE_URL}/snapshot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dashboardData),
  });
  if (!res.ok) throw new Error(`Error al guardar snapshot: ${res.status}`);
  return res.json();
};

// Obtiene el snapshot del backend (todos los usuarios)
export const fetchSnapshot = async () => {
  const res = await fetch(`${BASE_URL}/data`);
  if (!res.ok) throw new Error(`Error al obtener datos: ${res.status}`);
  return res.json();
};

// Verifica si hay datos disponibles
export const fetchStatus = async () => {
  const res = await fetch(`${BASE_URL}/status`);
  if (!res.ok) throw new Error(`Error al verificar estado: ${res.status}`);
  return res.json();
};
