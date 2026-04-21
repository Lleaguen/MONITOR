import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import { getCPTdeZona } from './zonaCPT.js';

dayjs.extend(customParseFormat);

/**
 * buildHUVelocidadData — Pulso de inbound vs bipeo HU por hora.
 *
 * - Rojo (arribo): shipments que ingresaron por hora via Inbound Date Included
 * - Verde (bipeo):  piezas bipeadas en HU via Outbound Included Date
 *
 * @param {Array}  csvData           - Filas del CSV del TMS
 * @param {number} horaInicioHU      - Desde qué hora contar (default: 10)
 * @param {Object} zonaCPTOverrides  - Overrides manuales { ZONA: 'CPT' }
 * @returns {Object} { velocidadPorHora, velocidadPorCPT, stats }
 */
export const buildHUVelocidadData = (csvData, horaInicioHU = 10, zonaCPTOverrides = {}) => {
  console.log('🚀 buildHUVelocidadData - Iniciando con:', {
    totalFilas: csvData?.length,
    horaInicioHU,
    zonaCPTOverrides: Object.keys(zonaCPTOverrides).length
  });

  const arriboPorHora = {};   // Inbound Date Included  → rojo
  const bipeoPorHora  = {};   // Outbound Date Included → verde

  const horaInicio = 13;
  for (let h = horaInicio; h <= 23; h++) {
    const hora = `${h}:00`;
    arriboPorHora[hora] = { total: 0 };
    bipeoPorHora[hora]  = { total: 0 };
  }

  // Conjuntos para contar shipments únicos por hora en inbound
  const shipmentsInboundPorHora = {};
  for (let h = horaInicio; h <= 23; h++) {
    shipmentsInboundPorHora[`${h}:00`] = new Set();
  }

  csvData.forEach(d => {
    if (!d['Shipment ID']) return;

    const zonaRaw = String(d['Labeling Zone'] || "").trim();
    if (!zonaRaw || zonaRaw !== zonaRaw.toUpperCase()) return;
    const zonaUpper = zonaRaw.toUpperCase();

    if (/_[AB]$/.test(zonaUpper)) return;
    if (zonaUpper === 'CK390') return;
    const zona = zonaUpper.replace(/_+$/, "");

    const cpt = zonaCPTOverrides[zona] ?? getCPTdeZona(zona);
    if (!cpt) return;

    const hubStatus = String(d['Hub Status'] || "").toLowerCase().trim();
    if (['cancelled', 'in_hub_reject', 'blocked'].includes(hubStatus)) return;

    const shipmentId = String(d['Shipment ID']).trim();

    // Rojo: shipments que ingresaron (Inbound Date Included) — conteo único por shipment
    const fechaInbound = d['Inbound Date Included'];
    if (fechaInbound) {
      const ts = dayjs(fechaInbound, "DD/MM/YYYY HH:mm:ss");
      if (ts.isValid() && ts.hour() >= horaInicio) {
        const hora = `${ts.hour()}:00`;
        if (shipmentsInboundPorHora[hora] && !shipmentsInboundPorHora[hora].has(shipmentId)) {
          shipmentsInboundPorHora[hora].add(shipmentId);
          arriboPorHora[hora].total++;
        }
      }
    }

    // Verde: piezas bipeadas en HU (Outbound Included Date)
    const fechaOutbound = d['Outbound Included Date'];
    if (fechaOutbound) {
      const ts = dayjs(fechaOutbound, "DD/MM/YYYY HH:mm:ss");
      if (ts.isValid() && ts.hour() >= horaInicio) {
        const hora = `${ts.hour()}:00`;
        if (bipeoPorHora[hora]) {
          bipeoPorHora[hora].total++;
        }
      }
    }
  });

  // Convertir a array para gráfica
  const velocidadPorHora = Object.keys(arriboPorHora)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .map(hora => ({
      hora,
      arribo: arriboPorHora[hora].total,
      bipeo:  bipeoPorHora[hora].total,
      total:  arriboPorHora[hora].total + bipeoPorHora[hora].total,
    }));

  const totalArribo = velocidadPorHora.reduce((sum, h) => sum + h.arribo, 0);
  const totalBipeo  = velocidadPorHora.reduce((sum, h) => sum + h.bipeo, 0);
  const horasConActividad = velocidadPorHora.filter(h => h.total > 0).length;
  const velocidadPromedio = horasConActividad > 0
    ? Math.round((totalArribo + totalBipeo) / horasConActividad)
    : 0;
  const velocidadPico = Math.max(...velocidadPorHora.map(h => h.total), 0);
  const horaPico = velocidadPorHora.find(h => h.total === velocidadPico)?.hora || '-';

  // Velocidad por CPT (desde las 13:30 hasta las 22:30)
  const ahora = dayjs();
  const inicioTurno = ahora.clone().hour(13).minute(30).second(0);
  const finTurno    = ahora.clone().hour(22).minute(30).second(0);

  const velocidadPorCPT = {};
  const shipmentsInboundCPT = {};

  csvData.forEach(d => {
    if (!d['Shipment ID']) return;

    const zonaRaw = String(d['Labeling Zone'] || "").trim();
    if (!zonaRaw || zonaRaw !== zonaRaw.toUpperCase()) return;
    const zonaUpper = zonaRaw.toUpperCase();

    if (/_[AB]$/.test(zonaUpper)) return;
    if (zonaUpper === 'CK390') return;
    const zona = zonaUpper.replace(/_+$/, "");

    const cpt = zonaCPTOverrides[zona] ?? getCPTdeZona(zona);
    if (!cpt) return;

    const hubStatus = String(d['Hub Status'] || "").toLowerCase().trim();
    if (['cancelled', 'in_hub_reject', 'blocked'].includes(hubStatus)) return;

    const shipmentId = String(d['Shipment ID']).trim();

    if (!velocidadPorCPT[cpt]) {
      velocidadPorCPT[cpt] = { arribo: 0, bipeo: 0 };
      shipmentsInboundCPT[cpt] = new Set();
    }

    const fechaInbound = d['Inbound Date Included'];
    if (fechaInbound) {
      const ts = dayjs(fechaInbound, "DD/MM/YYYY HH:mm:ss");
      if (ts.isValid() && ts.isAfter(inicioTurno) && ts.isBefore(finTurno)) {
        if (!shipmentsInboundCPT[cpt].has(shipmentId)) {
          shipmentsInboundCPT[cpt].add(shipmentId);
          velocidadPorCPT[cpt].arribo++;
        }
      }
    }

    const fechaOutbound = d['Outbound Included Date'];
    if (fechaOutbound) {
      const ts = dayjs(fechaOutbound, "DD/MM/YYYY HH:mm:ss");
      if (ts.isValid() && ts.isAfter(inicioTurno) && ts.isBefore(finTurno)) {
        velocidadPorCPT[cpt].bipeo++;
      }
    }
  });

  const horasTranscurridas = Math.max(ahora.diff(inicioTurno, 'hour', true), 0.5);

  const velocidadPorCPTArray = Object.entries(velocidadPorCPT).map(([cpt, data]) => ({
    cpt,
    arribo: data.arribo,
    bipeo:  data.bipeo,
    total:  data.arribo + data.bipeo,
    velocidadPorHora: Math.round((data.arribo + data.bipeo) / horasTranscurridas),
  })).sort((a, b) => b.total - a.total);

  const resultado = {
    velocidadPorHora,
    velocidadPorCPT: velocidadPorCPTArray,
    stats: {
      totalArribo,
      totalBipeo,
      totalHU: totalArribo + totalBipeo,
      velocidadPromedio,
      velocidadPico,
      horaPico,
      horasConActividad,
    },
  };

  console.log('✅ buildHUVelocidadData - Resultado:', {
    velocidadPorHora: resultado.velocidadPorHora.length,
    velocidadPorCPT: resultado.velocidadPorCPT.length,
    totalArribo: resultado.stats.totalArribo,
    totalBipeo: resultado.stats.totalBipeo,
  });

  return resultado;
};
