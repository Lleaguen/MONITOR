import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import { getTipoVehiculo, parsearHoraExactaED, parsearHoraED } from './helpers.js';
import { getCPTdeZona } from './zonaCPT.js';

dayjs.extend(customParseFormat);

// Voluminoso / Paquetería por zona
export const buildVolData = (csvData, zonaCPTOverrides = {}) => {
  const volPorZona = {};
  const volPorHora = {};
  const volPorCPT = {};

  let debugCount = 0;
  let voluminosoCount = 0;
  let voluminosoProcesadoCount = 0;
  let voluminosoPendienteCount = 0;

  csvData.forEach(d => {
    if (!d['Shipment ID']) return;
    const zona = String(d['Labeling Zone'] || "").trim();
    if (!zona) return;
    const cpt = zonaCPTOverrides[zona] ?? getCPTdeZona(zona);
    if (!cpt) return;

    if (!volPorZona[zona]) volPorZona[zona] = { zona, cpt, paqueteria: 0, voluminoso: 0 };

    const dimH = parseFloat(d['Height'] || 0);
    const dimL = parseFloat(d['Length'] || 0);
    const dimW = parseFloat(d['Width']  || 0);
    const peso = parseFloat(d['Weight'] || 0);

    const esVol = dimH >= 50 || dimL >= 50 || dimW >= 50 || peso > 20000;

    if (esVol) {
      volPorZona[zona].voluminoso++;
      voluminosoCount++;
    } else {
      volPorZona[zona].paqueteria++;
    }

    // Tracking por hora y procesado/pendiente
    const inboundRaw = d['Inbound Date Included'];
    const outboundRaw = d['Outbound Included Date'];
    
    // Debug: log primeras 5 piezas voluminosas
    if (esVol && debugCount < 5) {
      console.log('🔍 Debug voluminoso:', {
        shipmentId: d['Shipment ID'],
        outboundRaw,
        hasOutbound: !!(outboundRaw && outboundRaw.trim()),
        cpt
      });
      debugCount++;
    }
    
    let hora = null;
    if (inboundRaw) {
      const f = dayjs(inboundRaw, "DD/MM/YYYY HH:mm:ss");
      if (f.isValid()) hora = f.hour();
    }

    if (hora !== null) {
      const horaKey = `${String(hora).padStart(2,'0')}:00`;
      if (!volPorHora[horaKey]) {
        volPorHora[horaKey] = { 
          hora: horaKey, 
          voluminoso: 0, 
          paqueteria: 0, 
          procesado: 0, 
          pendiente: 0,
          voluminosoProcesado: 0,
          voluminosoPendiente: 0
        };
      }
      if (esVol) {
        volPorHora[horaKey].voluminoso++;
        if (outboundRaw && outboundRaw.trim()) {
          volPorHora[horaKey].voluminosoProcesado++;
          voluminosoProcesadoCount++;
        } else {
          volPorHora[horaKey].voluminosoPendiente++;
          voluminosoPendienteCount++;
        }
      } else {
        volPorHora[horaKey].paqueteria++;
      }

      // Total procesado/pendiente (todas las piezas)
      if (outboundRaw && outboundRaw.trim()) {
        volPorHora[horaKey].procesado++;
      } else {
        volPorHora[horaKey].pendiente++;
      }
    }

    // Tracking por CPT
    if (!volPorCPT[cpt]) {
      volPorCPT[cpt] = { 
        cpt, 
        voluminoso: 0, 
        paqueteria: 0, 
        procesado: 0, 
        pendiente: 0,
        voluminosoProcesado: 0,
        voluminosoPendiente: 0
      };
    }
    if (esVol) {
      volPorCPT[cpt].voluminoso++;
      if (outboundRaw && outboundRaw.trim()) {
        volPorCPT[cpt].voluminosoProcesado++;
      } else {
        volPorCPT[cpt].voluminosoPendiente++;
      }
    } else {
      volPorCPT[cpt].paqueteria++;
    }
    
    // Total procesado/pendiente (todas las piezas)
    if (outboundRaw && outboundRaw.trim()) {
      volPorCPT[cpt].procesado++;
    } else {
      volPorCPT[cpt].pendiente++;
    }
  });

  console.log('📊 Resumen voluminoso:', {
    totalVoluminoso: voluminosoCount,
    voluminosoProcesado: voluminosoProcesadoCount,
    voluminosoPendiente: voluminosoPendienteCount
  });

  const volDataByZona = Object.values(volPorZona).sort((a, b) => a.cpt.localeCompare(b.cpt));
  const volDataByHora = Object.values(volPorHora).sort((a, b) => a.hora.localeCompare(b.hora));
  const volDataByCPT = Object.values(volPorCPT).sort((a, b) => a.cpt.localeCompare(b.cpt));

  return { volDataByZona, volDataByHora, volDataByCPT };
};

// Super Bigger: peso > 50kg (50000g) O alguna dimensión >= 200cm
// Bigger:       peso > 30kg (30000g) Y alguna dimensión > 150cm (y no es super bigger)
export const buildSuperBigger = (csvData) => {
  const superPorHora = new Array(24).fill(0);
  const biggerPorHora = new Array(24).fill(0);
  const superList = [];
  const biggerList = [];

  csvData.forEach(d => {
    if (!d['Shipment ID']) return;
    const dimH = parseFloat(d['Height'] || 0);
    const dimL = parseFloat(d['Length'] || 0);
    const dimW = parseFloat(d['Width']  || 0);
    const peso = parseFloat(d['Weight'] || 0);

    const esSuper  = peso > 50000 || dimH >= 200 || dimL >= 200 || dimW >= 200;
    const esBigger = !esSuper && (peso > 30000 && (dimH > 150 || dimL > 150 || dimW > 150));

    if (!esSuper && !esBigger) return;

    const raw = d['Inbound Date Included'];
    let hora = null;
    if (raw) {
      const f = dayjs(raw, "DD/MM/YYYY HH:mm:ss");
      if (f.isValid()) hora = f.hour();
    }

    const item = {
      shipmentId: String(d['Shipment ID'] || ""),
      height: dimH,
      length: dimL,
      width:  dimW,
      weight: Math.round(peso / 1000 * 100) / 100,
      hora:   hora !== null ? `${String(hora).padStart(2,'0')}:00` : '--',
    };

    if (esSuper) {
      if (hora !== null && hora >= 9 && hora <= 23) superPorHora[hora]++;
      superList.push(item);
    } else {
      if (hora !== null && hora >= 9 && hora <= 23) biggerPorHora[hora]++;
      biggerList.push(item);
    }
  });

  const HORAS = Array.from({ length: 15 }, (_, i) => i + 9);

  const superBiggerChartData = HORAS.map(h => ({
    hora: `${String(h).padStart(2,'0')}:00`,
    cantidad: superPorHora[h] || 0,
  }));

  const biggerChartData = HORAS.map(h => ({
    hora: `${String(h).padStart(2,'0')}:00`,
    cantidad: biggerPorHora[h] || 0,
  }));

  return {
    superBiggerList: superList,
    biggerList,
    superBiggerChartData,
    biggerChartData,
  };
};

// Arrivals pendientes por tipo de vehículo
export const buildArrivalChasis = (easyDockingClean, matchEDaTMS, tipo = 'chasis') => {
  return easyDockingClean
    .filter((doc, idx) =>
      getTipoVehiculo(doc['TIPO DE VEHICULO']) === tipo &&
      matchEDaTMS.get(idx) === null
    )
    .map(doc => {
      const raw = String(doc['Fecha y hora'] || "").trim();
      const hora = parsearHoraED(raw);
      const horaStr = parsearHoraExactaED(raw);
      const piezas = Math.round(parseFloat(doc['CANT PAQUETES']) || 0);
      return { patente: String(doc['PATENTE'] || "").trim(), hora: horaStr, horaNum: hora ?? 99, piezas };
    })
    .filter(r => r.piezas > 0)
    .sort((a, b) => a.horaNum - b.horaNum || a.hora.localeCompare(b.hora));
};
