import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import { normalizarPatente, getTipoPorDoca, parsearHoraED, getTipoVehiculo } from './helpers.js';

dayjs.extend(customParseFormat);

const HORAS_RANGO = Array.from({ length: 15 }, (_, i) => i + 9); // 9 a 23

// Loop principal sobre TMS — extrae ultimaTs, totalPiezas, bipeo por hora, filasTMS
export const buildTMSData = (csvData, horaInicioBipeos = 9) => {
  let ultimaTs = 0;
  let totalPiezasSistema = 0;
  const bipeoPorHora = new Array(24).fill(0);
  const filasTMS = [];

  csvData.forEach(d => {
    const raw = d['Inbound Date Included'];
    if (!raw) return;
    const f = dayjs(raw, "DD/MM/YYYY HH:mm:ss");
    if (!f.isValid()) return;
    const tsMs = f.valueOf();
    const h = f.hour();
    if (tsMs > ultimaTs) ultimaTs = tsMs;
    if (!d['Shipment ID'] || h < horaInicioBipeos) return;
    totalPiezasSistema++;
    if (h <= 23) bipeoPorHora[h]++;
    filasTMS.push({
      tsMs,
      patente: normalizarPatente(d['Truck ID']),
      doca: String(d['Inbound Dock ID'] || "").trim(),
      h,
    });
  });

  return { ultimaTs, totalPiezasSistema, bipeoPorHora, filasTMS };
};

// KPIs principales
export const buildKpis = ({
  easyDockingClean, totalPiezasSistema, filasTMS,
  ultimaTs, proyectadoManual, conteoEspera, desviosDoca,
  mapPatenteTipo, horaInicioArribos = 9,
}) => {
  const ultimaReferencia = ultimaTs > 0 ? dayjs(ultimaTs) : dayjs();
  const inicioHoraActualMs = ultimaReferencia.startOf('hour').valueOf();
  const minutosTranscurridos = Math.max((ultimaTs - inicioHoraActualMs) / 60000, 1);

  // Piezas por tipo en la hora actual
  const piezasPorTipoEnHora = { chasis: 0, camioneta: 0, semi: 0, otro: 0 };

  filasTMS.forEach(({ tsMs, patente, h, doca }) => {
    if (tsMs >= inicioHoraActualMs && tsMs <= ultimaTs) {
      const tipo = mapPatenteTipo.get(patente) || getTipoPorDoca(doca);
      piezasPorTipoEnHora[tipo]++;
    }
  });

  // Arribado desde ED (filtrado por horaInicioArribos)
  const arribadoExcel = easyDockingClean.reduce((acc, curr) => {
    const hora = parsearHoraED(curr['Fecha y hora']);
    if (hora !== null && hora < horaInicioArribos) return acc;
    return acc + (parseFloat(curr['CANT PAQUETES']) || 0);
  }, 0);

  const horasRestantes = Math.max(
    ultimaReferencia.clone().set('hour', 22).set('minute', 0).diff(ultimaReferencia, 'hour', true), 0.5
  );
  const objXHoraGlobal = Math.round((proyectadoManual - totalPiezasSistema) / horasRestantes);
  const velocidadReal = Math.round(
    (filasTMS.filter(f => f.tsMs >= inicioHoraActualMs).length / minutosTranscurridos) * 60
  );

  // Matrix
  const totalTipo = piezasPorTipoEnHora.chasis + piezasPorTipoEnHora.camioneta + piezasPorTipoEnHora.semi || 1;
  const matrix = {
    chasis:    { real: Math.round((piezasPorTipoEnHora.chasis    / minutosTranscurridos) * 60), planificado: Math.round(objXHoraGlobal * piezasPorTipoEnHora.chasis    / totalTipo) },
    camioneta: { real: Math.round((piezasPorTipoEnHora.camioneta / minutosTranscurridos) * 60), planificado: Math.round(objXHoraGlobal * piezasPorTipoEnHora.camioneta / totalTipo) },
    semi:      { real: Math.round((piezasPorTipoEnHora.semi      / minutosTranscurridos) * 60), planificado: Math.round(objXHoraGlobal * piezasPorTipoEnHora.semi      / totalTipo) },
  };

  // ── Cortes de turno ───────────────────────────────────────────────────────
  // Usa ARRIBOS del Easy Docking (no bipeos del TMS) filtrados desde horaInicioArribos.
  // Para cambiar las horas de corte, modificar el array CORTES:
  const CORTES = [14, 16, 18, 20];
  const arriboAntes = {};
  CORTES.forEach(h => {
    arriboAntes[h] = easyDockingClean.reduce((acc, curr) => {
      const hora = parsearHoraED(curr['Fecha y hora']);
      if (hora === null || hora < horaInicioArribos || hora > h) return acc;
      return acc + (parseFloat(curr['CANT PAQUETES']) || 0);
    }, 0);
  });

  const targets = {};
  CORTES.forEach(h => {
    const antes = Math.round(arriboAntes[h]);
    const despues = proyectadoManual - antes;
    targets[`${h}HS`] = {
      hora: h,
      proyectado: proyectadoManual,
      antesDelCorte: antes,
      despuesDelCorte: Math.max(despues, 0),
      pctAntes:   Math.min(Math.round((antes / proyectadoManual) * 10000) / 100, 100),
      pctDespues: Math.min(Math.round((Math.max(despues, 0) / proyectadoManual) * 10000) / 100, 100),
      percentage: Math.min(Math.round((antes / proyectadoManual) * 100), 100),
      units: antes,
    };
  });

  // Piezas bipeadas por tipo de vehículo — clasificadas por dársena del TMS
  const piezasBipeadasPorTipo = { chasis: 0, camioneta: 0, semi: 0, otro: 0 };
  filasTMS.forEach(({ patente, doca }) => {
    const tipo = mapPatenteTipo.get(patente) || getTipoPorDoca(doca);
    piezasBipeadasPorTipo[tipo]++;
  });

  const kpis = {
    proyectado: proyectadoManual.toLocaleString(),
    arribado: Math.round(arribadoExcel).toLocaleString(),
    bipeado: totalPiezasSistema.toLocaleString(),
    arribadoBipeado: Math.round(arribadoExcel - totalPiezasSistema).toLocaleString(),
    velocidadReal: velocidadReal.toLocaleString(),
    descargaHora: objXHoraGlobal > 0 ? objXHoraGlobal.toLocaleString() : "0",
    pArribado: Math.round((arribadoExcel / proyectadoManual) * 100) || 0,
    pBipeo: Math.round((totalPiezasSistema / proyectadoManual) * 100) || 0,
    ultimaActualizacion: ultimaReferencia.format("HH:mm:ss"),
    espera: conteoEspera,
    desviosDoca,
  };

  return { kpis, matrix, targets, ultimaReferencia, piezasPorTipo: piezasBipeadasPorTipo };
};

// Chart data (arribo vs bipeo por hora + vehículos por tipo)
export const buildChartData = (easyDockingClean, bipeoPorHora, horaInicioArribos = 9) => {
  const arriboPorHora = new Array(24).fill(0);
  const vehiculosPorHoraTipo = {};

  easyDockingClean.forEach(doc => {
    const hora = parsearHoraED(doc['Fecha y hora']);
    if (hora === null || hora < horaInicioArribos || hora > 23) return;
    arriboPorHora[hora] += parseFloat(doc['CANT PAQUETES']) || 0;
    const tipo = getTipoVehiculo(doc['TIPO DE VEHICULO']);
    if (!vehiculosPorHoraTipo[hora]) vehiculosPorHoraTipo[hora] = { chasis: 0, camioneta: 0, semi: 0 };
    if (tipo === 'chasis') vehiculosPorHoraTipo[hora].chasis++;
    else if (tipo === 'camioneta') vehiculosPorHoraTipo[hora].camioneta++;
    else if (tipo === 'semi') vehiculosPorHoraTipo[hora].semi++;
  });

  const chartData = HORAS_RANGO.map(h => ({
    hora: `${String(h).padStart(2, '0')}:00`,
    arribo: arriboPorHora[h],
    bipeo: bipeoPorHora[h],
  }));

  const vehiculosChartData = HORAS_RANGO.map(h => ({
    hora: `${String(h).padStart(2, '0')}:00`,
    chasis:    vehiculosPorHoraTipo[h]?.chasis    || 0,
    camioneta: vehiculosPorHoraTipo[h]?.camioneta || 0,
    semi:      vehiculosPorHoraTipo[h]?.semi      || 0,
  }));

  return { chartData, vehiculosChartData };
};
