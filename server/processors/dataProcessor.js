const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

const { parseEasyDocking } = require('./easyDockingParser');
const { buildPatentesTMS, buildMatchEDaTMS, buildDarsenasActivas, buildVehiculosEspera, buildMapPatenteTipo } = require('./vehiculosProcessor');
const { buildTMSData, buildKpis, buildChartData } = require('./kpisProcessor');
const { buildHUData } = require('./huProcessor');
const { buildVolData, buildSuperBigger, buildArrivalChasis } = require('./voluminosoProcessor');
const { buildDarsenaStats, buildDarsenasAhora } = require('./darsenaProcessor');
const { buildHUVelocidadData } = require('./huVelocidadProcessor');

/**
 * processCombinedData — Orquestador server-side.
 * Recibe CSV parseado (array de objetos) y Excel como buffer, devuelve el mismo
 * objeto dashboardData que genera el frontend.
 */
const processCombinedData = (
  csvData,
  excelBuffer,
  proyectadoManual = 239000,
  objetivoHU = 75,
  productividadHU = 180,
  config = {}
) => {
  const {
    horaInicioArribos = 9,
    horaInicioBipeos = 9,
    horaInicioHU = 10,
    zonaCPTOverrides = {},
    site = 'CIU',
  } = config;

  const easyDockingClean = excelBuffer ? parseEasyDocking(excelBuffer) : [];

  const { ultimaTs, totalPiezasSistema, bipeoPorHora, filasTMS } = buildTMSData(csvData, horaInicioBipeos, zonaCPTOverrides);

  const shipmentsSinMovimientoMap = new Map();
  csvData.forEach(d => {
    if (!d['Shipment ID']) return;
    const hubStatus = String(d['Hub Status'] || '').toLowerCase().trim();
    if (!['in_hub', 'in_hub_finished'].includes(hubStatus)) return;
    const inboundRaw = d['Inbound Date Included'];
    if (!inboundRaw) return;
    const inbound = dayjs(inboundRaw, 'DD/MM/YYYY HH:mm:ss');
    if (!inbound.isValid()) return;
    const id = String(d['Shipment ID']).trim();
    if (!shipmentsSinMovimientoMap.has(id) || inbound.valueOf() > shipmentsSinMovimientoMap.get(id)) {
      shipmentsSinMovimientoMap.set(id, inbound.valueOf());
    }
  });
  const shipmentsSinMovimientoList = Array.from(shipmentsSinMovimientoMap.entries())
    .map(([id, inboundTs]) => ({ id, inboundTs })).sort((a, b) => a.id.localeCompare(b.id));

  const patentesTMS = buildPatentesTMS(csvData);
  const matchEDaTMS = buildMatchEDaTMS(easyDockingClean, patentesTMS);
  const darsenasActivas = buildDarsenasActivas(csvData, ultimaTs, site);
  const { conteoEspera, desviosDoca } = buildVehiculosEspera(easyDockingClean, matchEDaTMS, patentesTMS.map, darsenasActivas);
  const mapPatenteTipo = buildMapPatenteTipo(easyDockingClean, matchEDaTMS);

  const { kpis, matrix, targets, piezasPorTipo } = buildKpis({
    easyDockingClean, totalPiezasSistema, filasTMS, ultimaTs, proyectadoManual, conteoEspera, desviosDoca, mapPatenteTipo, horaInicioArribos,
  });

  const { volDataByZona, volDataByHora, volDataByCPT, totalRecibidoGlobal, totalVoluminosoGlobal, pctVoluminosoGlobal } = buildVolData(csvData, zonaCPTOverrides, horaInicioBipeos, horaInicioHU, site);
  const { chartData, vehiculosChartData } = buildChartData(easyDockingClean, bipeoPorHora, horaInicioArribos, volDataByHora);
  const { tableData, totalesHU, huStats, usuariosActivosDetalle, refMs, bipeoPorHoraArray } = buildHUData(csvData, ultimaTs, objetivoHU, productividadHU, horaInicioHU, zonaCPTOverrides, site);

  const { superBiggerList, biggerList, superBiggerChartData, biggerChartData } = buildSuperBigger(csvData);
  const arrivalChasis = buildArrivalChasis(easyDockingClean, matchEDaTMS, 'chasis');
  const arrivalCamioneta = buildArrivalChasis(easyDockingClean, matchEDaTMS, 'camioneta');
  const arrivalSemi = buildArrivalChasis(easyDockingClean, matchEDaTMS, 'semi');
  const darsenaStats = buildDarsenaStats(csvData, ultimaTs, site);
  const darsenasAhora = buildDarsenasAhora(csvData, easyDockingClean, ultimaTs, site);
  const huVelocidadData = buildHUVelocidadData(csvData, horaInicioHU, zonaCPTOverrides, site);

  return {
    kpis, matrix, chartData, vehiculosChartData, targets, piezasPorTipo,
    tableData, totalesHU, usuariosActivosDetalle, refMs, bipeoPorHoraArray,
    volDataByZona, volDataByHora, volDataByCPT,
    volData: { totalRecibidoGlobal, totalVoluminosoGlobal, pctVoluminosoGlobal },
    arrivalChasis, arrivalCamioneta, arrivalSemi,
    darsenaStats, darsenasAhora,
    superBiggerList, biggerList, superBiggerChartData, biggerChartData,
    huStats, huVelocidadData,
    shipmentsSinMovimiento: shipmentsSinMovimientoList,
  };
};

module.exports = { processCombinedData };
