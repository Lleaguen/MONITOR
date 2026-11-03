const { getSnapshot, setSnapshot } = require('../store/snapshot');

// Almacén de config por site (persiste en memoria mientras el servidor está vivo)
const configStore = {};

/**
 * POST /config?site=CIU
 * Body: { proyectado, objetivoHU, productividadHU, horaInicioHU, horaInicioBipeos, horaInicioArribos, zonaCPTOverrides }
 */
const saveConfig = (req, res) => {
  try {
    const site = (req.query.site || req.body?.site || 'CIU').toUpperCase();
    console.log(`[config] POST site=${site} body=`, JSON.stringify(req.body));

    const body = req.body || {};

    // Leer config anterior como base
    const prev = configStore[site] || {};

    const cfg = {
      proyectado:        body.proyectado        != null ? Number(body.proyectado)        : (prev.proyectado        ?? 239000),
      objetivoHU:        body.objetivoHU        != null ? Number(body.objetivoHU)        : (prev.objetivoHU        ?? 75),
      productividadHU:   body.productividadHU   != null ? Number(body.productividadHU)   : (prev.productividadHU   ?? 180),
      horaInicioHU:      body.horaInicioHU      != null ? Number(body.horaInicioHU)      : (prev.horaInicioHU      ?? 10),
      horaInicioBipeos:  body.horaInicioBipeos  != null ? Number(body.horaInicioBipeos)  : (prev.horaInicioBipeos  ?? 9),
      horaInicioArribos: body.horaInicioArribos != null ? Number(body.horaInicioArribos) : (prev.horaInicioArribos ?? 9),
      zonaCPTOverrides:  body.zonaCPTOverrides  != null ? body.zonaCPTOverrides          : (prev.zonaCPTOverrides  ?? {}),
    };

    configStore[site] = cfg;

    // Embeber en snapshot existente para que /data lo devuelva
    const snap = getSnapshot(site);
    if (snap) {
      snap.config = cfg;
      setSnapshot(snap, site);
    }

    console.log(`[config] guardado site=${site}:`, JSON.stringify(cfg));
    return res.json({ status: 'ok', site, config: cfg });
  } catch (err) {
    console.error('[config] error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * GET /config?site=CIU
 */
const getConfig = (req, res) => {
  const site = (req.query.site || 'CIU').toUpperCase();

  // Primero desde el snapshot
  const snap = getSnapshot(site);
  if (snap?.config && Object.keys(snap.config).length > 0) {
    return res.json({ status: 'ok', site, config: snap.config });
  }

  // Desde memoria
  if (configStore[site] && Object.keys(configStore[site]).length > 0) {
    return res.json({ status: 'ok', site, config: configStore[site] });
  }

  // Defaults
  return res.json({
    status: 'ok',
    site,
    config: {
      proyectado: 239000,
      objetivoHU: 75,
      productividadHU: 180,
      horaInicioHU: 10,
      horaInicioBipeos: 9,
      horaInicioArribos: 9,
      zonaCPTOverrides: {},
    }
  });
};

module.exports = { saveConfig, getConfig };
