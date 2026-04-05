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
  productividadHU   = 180
) => {
  // 1. Easy Docking
  const easyDockingClean = parseEasyDocking(excelRaw);

  // 2. TMS — loop principal
  const { ultimaTs, totalPiezasSistema, bipeoPorHora, filasTMS } = buildTMSData(csvData);

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
  });

  // 7. Chart data
  const { chartData, vehiculosChartData } = buildChartData(easyDockingClean, bipeoPorHora);

  // 8. HU / CutOff
  const { tableData, totalesHU, huStats } = buildHUData(csvData, ultimaTs, objetivoHU, productividadHU);

  // 9. Voluminoso + Super Bigger + Arrivals Chasis
  const volData = buildVolData(csvData);
  const { superBiggerList, superBiggerChartData } = buildSuperBigger(csvData);
  const arrivalChasis = buildArrivalChasis(easyDockingClean, matchEDaTMS);

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
    superBiggerList,
    superBiggerChartData,
    huStats,
  };
};
