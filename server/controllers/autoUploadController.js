const Papa = require('papaparse');
const { processCombinedData } = require('../processors/dataProcessor');
const { setSnapshot, setPlan, getSnapshot, getLastUpdate } = require('../store/snapshot');

/**
 * POST /auto-upload
 *
 * Recibe CSV del TMS (texto plano) y opcionalmente Excel de Easy Docking (base64).
 * Lo procesa con los mismos processors que el frontend y guarda el snapshot.
 *
 * Body: {
 *   csv: "Shipment ID,Labeling Zone,...\n...",   // CSV del TMS como texto
 *   excel?: "base64...",                          // Excel de ED en base64 (opcional)
 *   config?: {                                     // Configuración opcional
 *     proyectado?: 239000,
 *     objetivoHU?: 75,
 *     productividadHU?: 180,
 *     horaInicioHU?: 10,
 *     horaInicioBipeos?: 9,
 *     horaInicioArribos?: 9,
 *     zonaCPTOverrides?: {},
 *     site?: 'CIU'
 *   }
 * }
 */
const autoUpload = (req, res) => {
  try {
    const { csv, excel, config = {} } = req.body;

    if (!csv || typeof csv !== 'string') {
      return res.status(400).json({ error: 'Falta el CSV del TMS en el campo "csv"' });
    }

    // Parsear CSV con papaparse
    const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
    if (!parsed.data || parsed.data.length === 0) {
      return res.status(400).json({ error: 'El CSV no tiene datos válidos' });
    }

    // Parsear Excel si viene
    let excelBuffer = null;
    if (excel) {
      excelBuffer = Buffer.from(excel, 'base64');
    }

    // Defaults de config
    const cfg = {
      proyectadoManual: config.proyectado ?? 239000,
      objetivoHU: config.objetivoHU ?? 75,
      productividadHU: config.productividadHU ?? 180,
      config: {
        horaInicioArribos: config.horaInicioArribos ?? 9,
        horaInicioBipeos: config.horaInicioBipeos ?? 9,
        horaInicioHU: config.horaInicioHU ?? 10,
        zonaCPTOverrides: config.zonaCPTOverrides ?? {},
        site: config.site ?? 'CIU',
      },
    };

    // Procesar
    const dashboardData = processCombinedData(
      parsed.data,
      excelBuffer,
      cfg.proyectadoManual,
      cfg.objetivoHU,
      cfg.productividadHU,
      cfg.config
    );

    // Preservar plan existente si el nuevo snapshot no trae uno
    const site = cfg.config.site;
    const planGuardado = getPlan(site);
    if (planGuardado && (!dashboardData.planVehiculos || dashboardData.planVehiculos.length === 0)) {
      dashboardData.planVehiculos = planGuardado;
    }

    dashboardData.site = site;
    setSnapshot(dashboardData, site);

    console.log(`[auto-upload] site=${site} procesado — ${parsed.data.length} filas CSV, snapshot guardado a las ${getLastUpdate(site)}`);

    return res.json({
      status: 'ok',
      site,
      lastUpdate: getLastUpdate(site),
      filasProcesadas: parsed.data.length,
      usuariosActivos: dashboardData.huStats?.usuariosActivos ?? 0,
      avanceHU: dashboardData.totalesHU?.avance ?? 0,
    });
  } catch (err) {
    console.error('[auto-upload] error:', err.message);
    return res.status(500).json({ error: 'Error al procesar', detail: err.message });
  }
};

module.exports = { autoUpload };
