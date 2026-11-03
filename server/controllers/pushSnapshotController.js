const { setSnapshot, getLastUpdate } = require('../store/snapshot');

/**
 * POST /push-snapshot
 *
 * Recibe un dashboardData ya calculado (generado por n8n u otro cliente)
 * y lo guarda directamente como snapshot sin reprocesar nada.
 *
 * Body: {
 *   site: 'CIU' | 'EEV',
 *   data: { ...dashboardData }   // objeto completo con kpis, matrix, etc.
 * }
 */
const pushSnapshot = (req, res) => {
  try {
    const { site, data } = req.body;

    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Falta el campo "data" con el dashboardData' });
    }

    const siteKey = (site && typeof site === 'string') ? site.toUpperCase() : 'CIU';

    // Aseguramos que el site quede en el data
    data.site = siteKey;

    setSnapshot(data, siteKey);

    console.log(
      `[push-snapshot] site=${siteKey} snapshot recibido y guardado` +
      ` — usuariosActivos=${data.huStats?.usuariosActivos ?? '?'}` +
      ` avanceHU=${data.totalesHU?.avance ?? '?'}%` +
      ` ts=${getLastUpdate(siteKey)}`
    );

    return res.json({
      status: 'ok',
      site: siteKey,
      lastUpdate: getLastUpdate(siteKey),
      usuariosActivos: data.huStats?.usuariosActivos ?? 0,
      avanceHU: data.totalesHU?.avance ?? 0,
    });
  } catch (err) {
    console.error('[push-snapshot] error:', err.message);
    return res.status(500).json({ error: 'Error al guardar snapshot', detail: err.message });
  }
};

module.exports = { pushSnapshot };
