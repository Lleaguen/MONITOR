const { getSnapshot, setSnapshot } = require('../store/snapshot');

// Almacén de config por site (persiste entre reinicios solo en memoria)
const configStore = {};

/**
 * POST /config?site=CIU
 * Guarda la config de parámetros y la embebe en el snapshot actual.
 * Body: { proyectado, objetivoHU, productividadHU, horaInicioHU, horaInicioBipeos, horaInicioArribos, zonaCPTOverrides }
 */
const saveConfig = (req, res) => {
  try {
    const site = (req.query.site || req.body.site || 'CIU').toUpperCase();
    const { proyectado, objetivoHU, productividadHU, horaInicioHU, horaInicioBipeos, horaInicioArribos, zonaCPTOverrides } = req.body;

    const cfg = {
      proyectado:        Number(proyectado)        || configStore[site]?.proyectado        || 239000,
      objetivoHU:        Number(objetivoHU)        || configStore[site]?.objetivoHU        || 75,
      productividadHU:   Number(productividadHU)   || configStore[site]?.productividadHU   || 180,
      horaInicioHU:      Number(horaInicioHU)      ?? configStore[site]?.horaInicioHU      ?? 10,
      horaInicioBipeos:  Number(horaInicioBipeos)  ?? configStore[site]?.horaInicioBipeos  ?? 9,
      horaInicioArribos: Number(horaInicioArribos) ?? configStore[site]?.horaInicioArribos ?? 9,
      zonaCPTOverrides:  zonaCPTOverrides          || configStore[site]?.zonaCPTOverrides  || {},
    };

    configStore[site] = cfg;

    // Embeber en snapshot existente para que /data lo devuelva
    const snap = getSnapshot(site);
    if (snap) {
      snap.config = cfg;
      setSnapshot(snap, site);
    }

    console.log(`[config] site=${site} guardado:`, cfg);
    return res.json({ status: 'ok', site, config: cfg });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

/**
 * GET /config?site=CIU
 * Devuelve la config guardada para el site.
 */
const getConfig = (req, res) => {
  const site = (req.query.site || 'CIU').toUpperCase();

  // Primero intentar desde el snapshot
  const snap = getSnapshot(site);
  if (snap?.config) return res.json({ status: 'ok', site, config: snap.config });

  // Si no hay snapshot, devolver lo guardado en memoria o defaults
  return res.json({
    status: 'ok',
    site,
    config: configStore[site] || {
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
