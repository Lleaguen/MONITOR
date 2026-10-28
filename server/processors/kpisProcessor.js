const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);
const { normalizarPatente, getTipoPorDoca, parsearHoraED, getTipoVehiculo } = require('./helpers');

const HORAS_RANGO = Array.from({ length: 15 }, (_, i) => i + 9);

const buildTMSData = (csvData, horaInicioBipeos = 9, zonaCPTOverrides = {}) => {
  let ultimaTs = 0, totalPiezasSistema = 0;
  const bipeoPorHora = new Array(24).fill(0), filasTMS = [];
  csvData.forEach(d => {
    const raw = d['Inbound Date Included'];
    if (!raw) return;
    const f = dayjs(raw, "DD/MM/YYYY HH:mm:ss");
    if (!f.isValid()) return;
    const tsMs = f.valueOf(), h = f.hour();
    if (tsMs > ultimaTs) ultimaTs = tsMs;
    if (!d['Shipment ID'] || h < horaInicioBipeos) return;
    totalPiezasSistema++; bipeoPorHora[h]++;
    filasTMS.push({ tsMs, patente: normalizarPatente(d['Truck ID']), doca: String(d['Inbound Dock ID'] || "").trim(), h });
  });
  return { ultimaTs, totalPiezasSistema, bipeoPorHora, filasTMS };
};

const buildKpis = ({ easyDockingClean, totalPiezasSistema, filasTMS, ultimaTs, proyectadoManual, conteoEspera, desviosDoca, mapPatenteTipo, horaInicioArribos = 9 }) => {
  const ultimaReferencia = ultimaTs > 0 ? dayjs(ultimaTs) : dayjs();
  const inicioHoraActualMs = ultimaReferencia.startOf('hour').valueOf();
  const minutosTranscurridos = Math.max((ultimaTs - inicioHoraActualMs) / 60000, 1);
  const piezasPorTipoEnHora = { chasis: 0, camioneta: 0, semi: 0, otro: 0 };
  filasTMS.forEach(({ tsMs, patente, doca }) => {
    if (tsMs >= inicioHoraActualMs && tsMs <= ultimaTs) {
      const tipo = mapPatenteTipo.get(patente) || getTipoPorDoca(doca);
      piezasPorTipoEnHora[tipo]++;
    }
  });
  const arribadoExcel = easyDockingClean.reduce((acc, curr) => {
    const hora = parsearHoraED(curr['Fecha y hora']);
    if (hora === null || hora < horaInicioArribos) return acc;
    return acc + (parseFloat(curr['CANT PAQUETES']) || 0);
  }, 0);
  const horasRestantes = Math.max(ultimaReferencia.clone().set('hour', 22).set('minute', 0).diff(ultimaReferencia, 'hour', true), 0.5);
  const objXHoraGlobal = Math.round((proyectadoManual - totalPiezasSistema) / horasRestantes);
  const velocidadReal = Math.round((filasTMS.filter(f => f.tsMs >= inicioHoraActualMs).length / minutosTranscurridos) * 60);
  const totalTipo = piezasPorTipoEnHora.chasis + piezasPorTipoEnHora.camioneta + piezasPorTipoEnHora.semi || 1;
  const matrix = {
    chasis: { real: Math.round((piezasPorTipoEnHora.chasis / minutosTranscurridos) * 60), planificado: Math.round(objXHoraGlobal * piezasPorTipoEnHora.chasis / totalTipo) },
    camioneta: { real: Math.round((piezasPorTipoEnHora.camioneta / minutosTranscurridos) * 60), planificado: Math.round(objXHoraGlobal * piezasPorTipoEnHora.camioneta / totalTipo) },
    semi: { real: Math.round((piezasPorTipoEnHora.semi / minutosTranscurridos) * 60), planificado: Math.round(objXHoraGlobal * piezasPorTipoEnHora.semi / totalTipo) },
  };
  const CORTES = [14, 16, 18, 20];
  const arriboAntes = {};
  CORTES.forEach(h => { arriboAntes[h] = easyDockingClean.reduce((acc, curr) => { const hora = parsearHoraED(curr['Fecha y hora']); if (hora === null || hora < horaInicioArribos || hora > h) return acc; return acc + (parseFloat(curr['CANT PAQUETES']) || 0); }, 0); });
  const targets = {};
  CORTES.forEach(h => {
    const antes = Math.round(arriboAntes[h]), despues = proyectadoManual - antes;
    targets[`${h}HS`] = { hora: h, proyectado: proyectadoManual, antesDelCorte: antes, despuesDelCorte: Math.max(despues, 0), pctAntes: Math.min(Math.round((antes / proyectadoManual) * 10000) / 100, 100), pctDespues: Math.min(Math.round((Math.max(despues, 0) / proyectadoManual) * 10000) / 100, 100), percentage: Math.min(Math.round((antes / proyectadoManual) * 100), 100), units: antes };
  });
  const piezasBipeadasPorTipo = { chasis: 0, camioneta: 0, semi: 0, otro: 0 };
  filasTMS.forEach(({ patente, doca }) => { const tipo = mapPatenteTipo.get(patente) || getTipoPorDoca(doca); piezasBipeadasPorTipo[tipo]++; });
  const kpis = {
    proyectado: proyectadoManual.toLocaleString(), arribado: Math.round(arribadoExcel).toLocaleString(),
    bipeado: totalPiezasSistema.toLocaleString(), arribadoBipeado: Math.round(arribadoExcel - totalPiezasSistema).toLocaleString(),
    velocidadReal: velocidadReal.toLocaleString(), descargaHora: objXHoraGlobal > 0 ? objXHoraGlobal.toLocaleString() : "0",
    pArribado: Math.round((arribadoExcel / proyectadoManual) * 100) || 0, pBipeo: Math.round((totalPiezasSistema / proyectadoManual) * 100) || 0,
    ultimaActualizacion: ultimaReferencia.format("HH:mm:ss"), espera: conteoEspera, desviosDoca,
  };
  return { kpis, matrix, targets, ultimaReferencia, piezasPorTipo: piezasBipeadasPorTipo };
};

const buildChartData = (easyDockingClean, bipeoPorHora, horaInicioArribos = 9, volDataByHora = []) => {
  const arriboPorHora = new Array(24).fill(0), vehiculosPorHoraTipo = {};
  easyDockingClean.forEach(doc => {
    const hora = parsearHoraED(doc['Fecha y hora']);
    if (hora === null || hora < horaInicioArribos || hora > 23) return;
    arriboPorHora[hora] += parseFloat(doc['CANT PAQUETES']) || 0;
    const tipo = getTipoVehiculo(doc['TIPO DE VEHICULO']);
    if (!vehiculosPorHoraTipo[hora]) vehiculosPorHoraTipo[hora] = { chasis: 0, camioneta: 0, semi: 0 };
    if (tipo === 'chasis') vehiculosPorHoraTipo[hora].chasis++; else if (tipo === 'camioneta') vehiculosPorHoraTipo[hora].camioneta++; else if (tipo === 'semi') vehiculosPorHoraTipo[hora].semi++;
  });
  const volPorHora = {};
  volDataByHora.forEach(item => { const h = parseInt(item.hora.split(':')[0]); volPorHora[h] = { voluminoso: item.voluminoso || 0, paqueteria: item.paqueteria || 0 }; });
  const chartData = HORAS_RANGO.map(h => {
    const arribo = arriboPorHora[h]; const volEntry = volPorHora[h] || { voluminoso: 0, paqueteria: 0 };
    const voluminoso = volEntry.voluminoso, totalTMS = voluminoso + volEntry.paqueteria;
    const pctVoluminoso = totalTMS > 0 ? Math.round((voluminoso / totalTMS) * 100) : 0;
    return { hora: `${String(h).padStart(2, '0')}:00`, arribo, arriboBase: Math.max(arribo - voluminoso, 0), bipeo: bipeoPorHora[h], voluminoso, pctVoluminoso };
  });
  const vehiculosChartData = HORAS_RANGO.map(h => ({ hora: `${String(h).padStart(2, '0')}:00`, chasis: vehiculosPorHoraTipo[h]?.chasis || 0, camioneta: vehiculosPorHoraTipo[h]?.camioneta || 0, semi: vehiculosPorHoraTipo[h]?.semi || 0 }));
  return { chartData, vehiculosChartData };
};

module.exports = { buildTMSData, buildKpis, buildChartData };
