const { setSnapshot, getLastUpdate, getPlan } = require('../store/snapshot');

const saveSnapshot = (req, res) => {
  try {
    const data = req.body;
    if (!data || typeof data !== 'object' || !data.kpis) {
      return res.status(400).json({ error: 'Payload inválido. Se esperaba el JSON procesado del dashboard.' });
    }
    // Preservar el plan guardado en el servidor si el nuevo snapshot no trae uno
    const planGuardado = getPlan();
    if (planGuardado && (!data.planVehiculos || data.planVehiculos.length === 0)) {
      data.planVehiculos = planGuardado;
    }
    setSnapshot(data);
    console.log(`[snapshot] guardado a las ${getLastUpdate()}`);
    return res.json({ status: 'ok', lastUpdate: getLastUpdate() });
  } catch (err) {
    console.error('[snapshot] error:', err.message);
    return res.status(500).json({ error: 'Error al guardar el snapshot', detail: err.message });
  }
};

module.exports = { saveSnapshot };
