import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import { getTipoVehiculo, parsearHoraExactaED, parsearHoraED } from './helpers.js';
import { getCPTdeZona } from './zonaCPT.js';

dayjs.extend(customParseFormat);

// Voluminoso / Paquetería por zona
export const buildVolData = (csvData) => {
  const volPorZona = {};

  csvData.forEach(d => {
    if (!d['Shipment ID']) return;
    const zona = String(d['Labeling Zone'] || "").trim();
    if (!zona) return;
    const cpt = getCPTdeZona(zona);
    if (!cpt) return;

    if (!volPorZona[zona]) volPorZona[zona] = { zona, cpt, paqueteria: 0, voluminoso: 0 };

    const dimH = parseFloat(d['Height'] || 0);
    const dimL = parseFloat(d['Length'] || 0);
    const dimW = parseFloat(d['Width']  || 0);
    const peso = parseFloat(d['Weight'] || 0);

    // Voluminoso: dimensión >= 50cm O peso > 20kg (en gramos: 20000g)
    if (dimH >= 50 || dimL >= 50 || dimW >= 50 || peso > 20000) {
      volPorZona[zona].voluminoso++;
    } else {
      volPorZona[zona].paqueteria++;
    }
  });

  return Object.values(volPorZona).sort((a, b) => a.cpt.localeCompare(b.cpt));
};

// Super Bigger: peso > 30kg (30000g) Y alguna dimensión > 150cm
export const buildSuperBigger = (csvData) => {
  const porHora = new Array(24).fill(0);
  const list = [];

  csvData.forEach(d => {
    if (!d['Shipment ID']) return;
    const dimH = parseFloat(d['Height'] || 0);
    const dimL = parseFloat(d['Length'] || 0);
    const dimW = parseFloat(d['Width']  || 0);
    const peso = parseFloat(d['Weight'] || 0);

    if (!(peso > 30000 && (dimH > 150 || dimL > 150 || dimW > 150))) return;

    const raw = d['Inbound Date Included'];
    let hora = null;
    if (raw) {
      const f = dayjs(raw, "DD/MM/YYYY HH:mm:ss");
      if (f.isValid()) hora = f.hour();
    }
    if (hora !== null && hora >= 9 && hora <= 23) porHora[hora]++;

    list.push({
      shipmentId: String(d['Shipment ID'] || ""),
      height: dimH,
      length: dimL,
      width:  dimW,
      weight: Math.round(peso / 1000 * 100) / 100,
      hora:   hora !== null ? `${String(hora).padStart(2,'0')}:00` : '--',
    });
  });

  const chartData = Array.from({ length: 15 }, (_, i) => i + 9).map(h => ({
    hora: `${String(h).padStart(2,'0')}:00`,
    cantidad: porHora[h] || 0,
  }));

  return { superBiggerList: list, superBiggerChartData: chartData };
};

// Arrivals de chasis pendientes (no descargados)
export const buildArrivalChasis = (easyDockingClean, matchEDaTMS) => {
  return easyDockingClean
    .filter((doc, idx) =>
      getTipoVehiculo(doc['TIPO DE VEHICULO']) === 'chasis' &&
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
