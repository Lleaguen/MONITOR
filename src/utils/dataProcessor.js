import { parseEasyDocking }                                    from './processors/easyDockingParser.js';
import { buildPatentesTMS, buildMatchEDaTMS, buildDarsenasActivas,
         buildVehiculosEspera, buildMapPatenteTipo }           from './processors/vehiculosProcessor.js';
import { buildTMSData, buildKpis, buildChartData }             from './processors/kpisProcessor.js';
import { buildHUData }                                         from './processors/huProcessor.js';
import { buildVolData, buildSuperBigger, buildArrivalChasis }  from './processors/voluminosoProcessor.js';

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
  const { ultimaTs, totalPiezasSistema, bipeoPorHora, filasTMS } = buildTMSData(csvData, horaInicioBipeos);

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
  const { kpis, matrix, targets } = buildKpis({
    easyDockingClean, totalPiezasSistema, filasTMS,
    ultimaTs, proyectadoManual, conteoEspera, desviosDoca, mapPatenteTipo,
    horaInicioArribos,
  });

  // 7. Chart data
  const { chartData, vehiculosChartData } = buildChartData(easyDockingClean, bipeoPorHora, horaInicioArribos);

  // 8. HU / CutOff
  const { tableData, totalesHU, huStats } = buildHUData(csvData, ultimaTs, objetivoHU, productividadHU, horaInicioHU, zonaCPTOverrides);

  // 9. Voluminoso + Super Bigger + Arrivals Chasis
  const volData = buildVolData(csvData, zonaCPTOverrides);
  const { superBiggerList, biggerList, superBiggerChartData, biggerChartData } = buildSuperBigger(csvData);
  const arrivalChasis    = buildArrivalChasis(easyDockingClean, matchEDaTMS, 'chasis');
  const arrivalCamioneta = buildArrivalChasis(easyDockingClean, matchEDaTMS, 'camioneta');
  const arrivalSemi      = buildArrivalChasis(easyDockingClean, matchEDaTMS, 'semi');

  return {
    kpis,
    matrix,
    chartData,
    vehiculosChartData,
    targets,
    tableData,
    totalesHU,
    volData,
    arrivalChasis,
    arrivalCamioneta,
    arrivalSemi,
    superBiggerList,
    biggerList,
    superBiggerChartData,
    biggerChartData,
    huStats,
  };
};
