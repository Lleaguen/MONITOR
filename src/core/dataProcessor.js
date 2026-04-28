import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import { parseEasyDocking }                                    from './processors/easyDockingParser.js';
import { buildPatentesTMS, buildMatchEDaTMS, buildDarsenasActivas,
         buildVehiculosEspera, buildMapPatenteTipo }           from './processors/vehiculosProcessor.js';
import { buildTMSData, buildKpis, buildChartData }             from './processors/kpisProcessor.js';
import { buildHUData }                                         from './processors/huProcessor.js';
import { buildVolData, buildSuperBigger, buildArrivalChasis }  from './processors/voluminosoProcessor.js';
import { buildDarsenaStats }                                     from './processors/darsenaProcessor.js';
import { buildHUVelocidadData }                                from './processors/huVelocidadProcessor.js';

dayjs.extend(customParseFormat);

/**
 * processCombinedData — Orquestador principal de procesamiento de datos.
 *
 * Recibe los datos crudos del CSV (TMS) y Excel (Easy Docking) y coordina
 * todos los processors para generar el objeto dashboardData completo.
 *
 * @param {Array}  csvData          - Filas del CSV del TMS (una por pieza)
 * @param {Array}  excelRaw         - Filas del Excel de Easy Docking
 * @param {number} proyectadoManual - Total de piezas esperadas en el turno
 * @param {number} objetivoHU       - % objetivo de avance de HU (0-100)
 * @param {number} productividadHU  - Piezas por usuario por hora en HU
 * @param {Object} config           - Configuración adicional:
 *   @param {number} config.horaInicioArribos  - Desde qué hora contar arribos del ED (default: 9)
 *   @param {number} config.horaInicioBipeos   - Desde qué hora contar bipeos del TMS (default: 9)
 *   @param {number} config.horaInicioHU       - Desde qué hora contar bipeos de HU (default: 10)
 *   @param {Object} config.zonaCPTOverrides   - Overrides manuales { ZONA: 'CPT' }
 *
 * @returns {Object} dashboardData con todas las métricas del turno
 *
 * Para agregar un nuevo processor:
 * 1. Crear el archivo en src/core/processors/
 * 2. Importarlo acá
 * 3. Llamarlo en el orden correcto (respetando dependencias)
 * 4. Agregar el resultado al objeto de retorno
 */
export const processCombinedData = (
  csvData,
  excelRaw,
  proyectadoManual  = 239000,
  objetivoHU        = 75,
  productividadHU   = 180,
  config            = {}
) => {
  const {
    horaInicioArribos   = 9,   // desde qué hora contar arribos del ED
    horaInicioBipeos    = 9,   // desde qué hora contar bipeos del TMS
    horaInicioHU        = 10,  // desde qué hora contar bipeos de HU (dispatch)
    zonaCPTOverrides    = {},  // { ZONA: 'CPT' } — overrides manuales
  } = config;

  // 1. Easy Docking
  const easyDockingClean = parseEasyDocking(excelRaw);

  // 2. TMS — loop principal
  const { ultimaTs, totalPiezasSistema, bipeoPorHora, filasTMS } = buildTMSData(csvData, horaInicioBipeos, zonaCPTOverrides);

  // 2.1. Extraer Shipment IDs filtrados: in_hub / in_hub_finished con más de N horas
  // Se guardan con su inbound timestamp para que el componente pueda filtrar por horas dinámicamente
  const shipmentsSinMovimiento = csvData
    .filter(d => {
      if (!d['Shipment ID']) return false;
      const hubStatus = String(d['Hub Status'] || '').toLowerCase().trim();
      if (!['in_hub', 'in_hub_finished'].includes(hubStatus)) return false;
      const inboundRaw = d['Inbound Date Included'];
      if (!inboundRaw) return false;
      const inbound = dayjs(inboundRaw, 'DD/MM/YYYY HH:mm:ss');
      return inbound.isValid();
    })
    .map(d => ({
      id: String(d['Shipment ID']).trim(),
      inboundTs: dayjs(d['Inbound Date Included'], 'DD/MM/YYYY HH:mm:ss').valueOf(),
    }));

  // Deduplicar por ID (quedarse con el inboundTs más reciente)
  const shipmentsSinMovimientoMap = new Map();
  shipmentsSinMovimiento.forEach(({ id, inboundTs }) => {
    if (!shipmentsSinMovimientoMap.has(id) || inboundTs > shipmentsSinMovimientoMap.get(id)) {
      shipmentsSinMovimientoMap.set(id, inboundTs);
    }
  });
  const shipmentsSinMovimientoList = Array.from(shipmentsSinMovimientoMap.entries())
    .map(([id, inboundTs]) => ({ id, inboundTs }))
    .sort((a, b) => a.id.localeCompare(b.id));

  // 3. Matching patentes
  const patentesTMS = buildPatentesTMS(csvData);
  const matchEDaTMS = buildMatchEDaTMS(easyDockingClean, patentesTMS);

  // 4. Vehículos en espera + dársenas
  const darsenasActivas = buildDarsenasActivas(csvData, ultimaTs);
  const { conteoEspera, desviosDoca } = buildVehiculosEspera(
    easyDockingClean, matchEDaTMS, patentesTMS.map, darsenasActivas
  );

  // 5. Mapa patente → tipo
  const mapPatenteTipo = buildMapPatenteTipo(easyDockingClean, matchEDaTMS);

  // 6. KPIs, matrix, targets
  const { kpis, matrix, targets, piezasPorTipo } = buildKpis({
    easyDockingClean, totalPiezasSistema, filasTMS,
    ultimaTs, proyectadoManual, conteoEspera, desviosDoca, mapPatenteTipo,
    horaInicioArribos,
  });

  // 7. Chart data
  const { chartData, vehiculosChartData } = buildChartData(easyDockingClean, bipeoPorHora, horaInicioArribos);

  // 8. HU / CutOff
  const { tableData, totalesHU, huStats } = buildHUData(csvData, ultimaTs, objetivoHU, productividadHU, horaInicioHU, zonaCPTOverrides);

  // 9. Voluminoso + Super Bigger + Arrivals Chasis
  const { volDataByZona, volDataByHora, volDataByCPT } = buildVolData(csvData, zonaCPTOverrides);
  const { superBiggerList, biggerList, superBiggerChartData, biggerChartData } = buildSuperBigger(csvData);
  const arrivalChasis    = buildArrivalChasis(easyDockingClean, matchEDaTMS, 'chasis');
  const arrivalCamioneta = buildArrivalChasis(easyDockingClean, matchEDaTMS, 'camioneta');
  const arrivalSemi      = buildArrivalChasis(easyDockingClean, matchEDaTMS, 'semi');
  const darsenaStats     = buildDarsenaStats(csvData, ultimaTs);

  // 10. Velocidad de HU (pulso de descarga)
  const huVelocidadData = buildHUVelocidadData(csvData, horaInicioBipeos, zonaCPTOverrides);

  return {
    kpis,
    matrix,
    chartData,
    vehiculosChartData,
    targets,
    piezasPorTipo,
    tableData,
    totalesHU,
    volDataByZona,
    volDataByHora,
    volDataByCPT,
    arrivalChasis,
    arrivalCamioneta,
    arrivalSemi,
    darsenaStats,
    superBiggerList,
    biggerList,
    superBiggerChartData,
    biggerChartData,
    huStats,
    huVelocidadData,
    shipmentsSinMovimiento: shipmentsSinMovimientoList,
  };
};
