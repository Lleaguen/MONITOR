const { getSnapshot, getLastUpdate, hasData, clearSnapshot, getPlan, setPlan, setSnapshot } = require('../store/snapshot');

const getData = (req, res) => {
  if (!hasData()) {
    return res.status(404).json({ error: 'No hay datos cargados. Realizá un POST /upload primero.' });
  }
  return res.json(getSnapshot());
};

const getStatus = (req, res) => {
  return res.json({
    hasData: hasData(),
    lastUpdate: getLastUpdate() || null,
  });
};

const deleteData = (req, res) => {
  clearSnapshot();
  return res.json({ status: 'ok', message: 'Snapshot eliminado' });
};

const savePlan = (req, res) => {
  try {
    const { planVehiculos } = req.body;
    if (!Array.isArray(planVehiculos)) {
      return res.status(400).json({ error: 'planVehiculos debe ser un array' });
    }
    setPlan(planVehiculos);
    // También actualizar el snapshot actual si existe
    const snap = getSnapshot();
    if (snap) {
      snap.planVehiculos = planVehiculos;
      setSnapshot(snap);
    }
    console.log(`[plan] guardado con ${planVehiculos.length} filas`);
    return res.json({ status: 'ok' });
  } catch (err) {
    return res.status(500).json({ error: 'Error al guardar el plan', detail: err.message });
  }
};

const getStoredPlan = (req, res) => {
  return res.json({ planVehiculos: getPlan() || [] });
};

module.exports = { getData, getStatus, deleteData, savePlan, getStoredPlan };
