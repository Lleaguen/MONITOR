import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import { getCPTdeZona } from './zonaCPT.js';

dayjs.extend(customParseFormat);

/**
 * buildHUVelocidadData — Calcula la velocidad de armado de HU por hora.
 *
 * Analiza cuántos HU se cierran por hora para medir el "pulso de descarga" del HU.
 * Esto permite visualizar la productividad del armado de HU a lo largo del turno.
 *
 * @param {Array}  csvData           - Filas del CSV del TMS
 * @param {number} horaInicioHU      - Desde qué hora contar (default: 10)
 * @param {Object} zonaCPTOverrides  - Overrides manuales { ZONA: 'CPT' }
 * @returns {Object} { velocidadPorHora, velocidadPorCPT, stats }
 */
export const buildHUVelocidadData = (csvData, horaInicioHU = 10, zonaCPTOverrides = {}) => {
  // Estructura: { hora: { total: 0, porCPT: { '0:00': 0, ... } } }
  const huCerradosPorHora = {};
  const huAbiertosPorHora = {};
  
  // Inicializar horas desde horaInicioHU hasta 23
  for (let h = horaInicioHU; h <= 23; h++) {
    const hora = `${h}:00`;
    huCerradosPorHora[hora] = { total: 0, porCPT: {} };
    huAbiertosPorHora[hora] = { total: 0, porCPT: {} };
  }

  csvData.forEach(d => {
    if (!d['Shipment ID']) return;
    
    const zonaRaw = String(d['Labeling Zone'] || "").trim();
    if (!zonaRaw || zonaRaw !== zonaRaw.toUpperCase()) return;
    const zonaUpper = zonaRaw.toUpperCase();
    
    // Aplicar mismos filtros que huProcessor
    if (/_[AB]$/.test(zonaUpper)) return;
    if (zonaUpper === 'CK390') return;
    const zona = zonaUpper.replace(/_+$/, "");

    const cpt = zonaCPTOverrides[zona] ?? getCPTdeZona(zona);
    if (!cpt) return;

    const hubStatus = String(d['Hub Status'] || "").toLowerCase().trim();
    if (['cancelled', 'in_hub_reject', 'blocked'].includes(hubStatus)) return;

    // HU Cerrado: tiene Outbound Date Closed
    const fechaCierre = d['Outbound Date Closed'];
    if (fechaCierre) {
      const ts = dayjs(fechaCierre, "DD/MM/YYYY HH:mm:ss");
      if (ts.isValid() && ts.hour() >= horaInicioHU) {
        const hora = `${ts.hour()}:00`;
        if (huCerradosPorHora[hora]) {
          huCerradosPorHora[hora].total++;
          if (!huCerradosPorHora[hora].porCPT[cpt]) {
            huCerradosPorHora[hora].porCPT[cpt] = 0;
          }
          huCerradosPorHora[hora].porCPT[cpt]++;
        }
      }
    }

    // HU Abierto: tiene Outbound Included Date pero sin fecha de cierre
    const fechaIncluido = d['Outbound Included Date'];
    if (fechaIncluido && !fechaCierre) {
      const ts = dayjs(fechaIncluido, "DD/MM/YYYY HH:mm:ss");
      if (ts.isValid() && ts.hour() >= horaInicioHU) {
        const hora = `${ts.hour()}:00`;
        if (huAbiertosPorHora[hora]) {
          huAbiertosPorHora[hora].total++;
          if (!huAbiertosPorHora[hora].porCPT[cpt]) {
            huAbiertosPorHora[hora].porCPT[cpt] = 0;
          }
          huAbiertosPorHora[hora].porCPT[cpt]++;
        }
      }
    }
  });

  // Convertir a array para gráfica
  const velocidadPorHora = Object.keys(huCerradosPorHora)
    .sort((a, b) => {
      const hA = parseInt(a.split(':')[0], 10);
      const hB = parseInt(b.split(':')[0], 10);
      return hA - hB;
    })
    .map(hora => ({
      hora,
      huCerrados: huCerradosPorHora[hora].total,
      huAbiertos: huAbiertosPorHora[hora].total,
      total: huCerradosPorHora[hora].total + huAbiertosPorHora[hora].total,
    }));

  // Calcular velocidad promedio y pico
  const totalHUCerrados = velocidadPorHora.reduce((sum, h) => sum + h.huCerrados, 0);
  const totalHUAbiertos = velocidadPorHora.reduce((sum, h) => sum + h.huAbiertos, 0);
  const horasConActividad = velocidadPorHora.filter(h => h.total > 0).length;
  const velocidadPromedio = horasConActividad > 0 
    ? Math.round((totalHUCerrados + totalHUAbiertos) / horasConActividad)
    : 0;
  const velocidadPico = Math.max(...velocidadPorHora.map(h => h.total), 0);
  const horaPico = velocidadPorHora.find(h => h.total === velocidadPico)?.hora || '-';

  // Velocidad por CPT (últimas 3 horas)
  const ahora = dayjs();
  const tresHorasAtras = ahora.subtract(3, 'hour');
  
  const velocidadPorCPT = {};
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

    const fechaCierre = d['Outbound Date Closed'];
    if (fechaCierre) {
      const ts = dayjs(fechaCierre, "DD/MM/YYYY HH:mm:ss");
      if (ts.isValid() && ts.isAfter(tresHorasAtras)) {
        if (!velocidadPorCPT[cpt]) {
          velocidadPorCPT[cpt] = { huCerrados: 0, huAbiertos: 0 };
        }
        velocidadPorCPT[cpt].huCerrados++;
      }
    }

    const fechaIncluido = d['Outbound Included Date'];
    if (fechaIncluido && !fechaCierre) {
      const ts = dayjs(fechaIncluido, "DD/MM/YYYY HH:mm:ss");
      if (ts.isValid() && ts.isAfter(tresHorasAtras)) {
        if (!velocidadPorCPT[cpt]) {
          velocidadPorCPT[cpt] = { huCerrados: 0, huAbiertos: 0 };
        }
        velocidadPorCPT[cpt].huAbiertos++;
      }
    }
  });

  // Convertir a array y calcular velocidad por hora (últimas 3 horas)
  const velocidadPorCPTArray = Object.entries(velocidadPorCPT).map(([cpt, data]) => ({
    cpt,
    huCerrados: data.huCerrados,
    huAbiertos: data.huAbiertos,
    total: data.huCerrados + data.huAbiertos,
    velocidadPorHora: Math.round((data.huCerrados + data.huAbiertos) / 3),
  })).sort((a, b) => b.total - a.total);

  return {
    velocidadPorHora,
    velocidadPorCPT: velocidadPorCPTArray,
    stats: {
      totalHUCerrados,
      totalHUAbiertos,
      totalHU: totalHUCerrados + totalHUAbiertos,
      velocidadPromedio,
      velocidadPico,
      horaPico,
      horasConActividad,
    },
  };
};
