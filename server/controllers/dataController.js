const {
  getSnapshot, getLastUpdate, hasData, clearSnapshot,
  getPlan, setPlan, setSnapshot,
  hasAnyData, getLatestSite,
} = require('../store/snapshot');

// GET /data?site=CIU
const getData = (req, res) => {
  const site = req.query.site || 'CIU';
  if (!hasData(site)) {
    return res.status(404).json({
      error: `No hay datos cargados para el site ${site}. Realizá un POST /upload primero.`,
    });
  }
  return res.json(getSnapshot(site));
};

// GET /status?site=CIU
const getStatus = (req, res) => {
  const site = req.query.site || null;

  if (site) {
    // Estado específico del site solicitado
    return res.json({
      hasData: hasData(site),
      lastUpdate: getLastUpdate(site) || null,
      site,
    });
  }

  // Sin site: respuesta genérica (compatibilidad con clientes viejos)
  const latest = getLatestSite();
  return res.json({
    hasData: hasAnyData(),
    lastUpdate: latest ? latest[1].lastUpdate : null,
    site: latest ? latest[0] : null,
  });
};

// DELETE /data?site=CIU
const deleteData = (req, res) => {
  const site = req.query.site || 'CIU';
  clearSnapshot(site);
  return res.json({ status: 'ok', message: `Snapshot de ${site} eliminado` });
};

// POST /plan?site=CIU  (o site en el body)
const savePlan = (req, res) => {
  try {
    const { planVehiculos, site: bodySite } = req.body;
    const site = req.query.site || bodySite || 'CIU';

    if (!Array.isArray(planVehiculos)) {
      return res.status(400).json({ error: 'planVehiculos debe ser un array' });
    }
    setPlan(planVehiculos, site);

    // También actualizar el snapshot actual si existe
    const snap = getSnapshot(site);
    if (snap) {
      snap.planVehiculos = planVehiculos;
      setSnapshot(snap, site);
    }
    console.log(`[plan] site=${site} guardado con ${planVehiculos.length} filas`);
    return res.json({ status: 'ok', site });
  } catch (err) {
    return res.status(500).json({ error: 'Error al guardar el plan', detail: err.message });
  }
};

// GET /plan?site=CIU
const getStoredPlan = (req, res) => {
  const site = req.query.site || 'CIU';
  return res.json({ planVehiculos: getPlan(site) || [], site });
};

module.exports = { getData, getStatus, deleteData, savePlan, getStoredPlan };
