import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import minMax from 'dayjs/plugin/minMax.js';

dayjs.extend(customParseFormat);
dayjs.extend(minMax);

export const processCombinedData = (csvData, excelRaw, proyectadoManual = 239000) => {
  // --- 1. PROCESAR EXCEL (EASY DOCKING) --- (Sin cambios)
  const workbook = XLSX.read(excelRaw, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawMatrix = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  
  const headers = rawMatrix[3]?.map(h => String(h).trim()) || []; 
  const dataRows = rawMatrix.slice(4);

  const easyDockingClean = dataRows.map(row => {
    let obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  }).filter(item => 
    String(item['TIPO DE OPERACION'] || "").toUpperCase().includes("DESCARGA") && 
    String(item['Accion'] || "").toLowerCase() === "add"
  );

  // --- 2. LÓGICA DE TIEMPO --- (Sin cambios)
  const ahora = dayjs();
  const horaCierre = dayjs().set('hour', 22).set('minute', 0).set('second', 0);
  let horasRestantes = horaCierre.diff(ahora, 'hour', true);
  if (horasRestantes <= 0) horasRestantes = 0.5;

  // --- 3. PROCESAR BIPEADOS (CSV) --- (Mantenemos totalPiezasSistema intacto)
  const totalPiezasSistema = csvData.filter(d => d['Shipment ID']).length;

  // --- 4. LÓGICA DISCRIMINADA POR TRANSPORTE (MATRIX) --- (Sin cambios)
  const calculateSectorStats = (tiposBusqueda, metaSector) => {
    const vehiculosSector = easyDockingClean.filter(d => 
      tiposBusqueda.some(tipo => String(d['TRANSPORTE'] || "").toLowerCase().includes(tipo.toLowerCase()))
    );

    const piezasYaDescargadas = vehiculosSector.reduce((acc, curr) => 
      acc + (parseFloat(curr['CANT PAQUETES']) || 0), 0
    );
    const targetHora = Math.round((metaSector - piezasYaDescargadas) / horasRestantes);

    const unaHoraAtras = ahora.subtract(1, 'hour');
    const actualHora = vehiculosSector
      .filter(d => {
        const fechaDoc = dayjs(d['Fecha y Hora']);
        return fechaDoc.isAfter(unaHoraAtras);
      })
      .reduce((acc, curr) => acc + (parseFloat(curr['CANT PAQUETES']) || 0), 0);

    return {
      planificado: targetHora > 0 ? targetHora : 0,
      real: actualHora
    };
  };

  const metas = { chasis: 120000, camioneta: 50000, semi: 30000 };

  const matrix = {
    chasis: calculateSectorStats(['Chasis'], metas.chasis),
    camioneta: calculateSectorStats(['Camioneta', 'MELI'], metas.camioneta),
    semi: calculateSectorStats(['Semi'], metas.semi)
  };

  // --- 5. KPIs GLOBALES (CORRECCIÓN VELOCIDAD REAL) ---
  const arribadoExcel = easyDockingClean.reduce((acc, curr) => acc + (parseFloat(curr['CANT PAQUETES']) || 0), 0);
  const objXHoraGlobal = Math.round((proyectadoManual - totalPiezasSistema) / horasRestantes);

  // NUEVA LÓGICA: Contar bipeos de la última hora en la columna correcta
  const unaHoraAtrasGlobal = ahora.subtract(1, 'hour');
  const velocidadRealCalculada = csvData.filter(d => {
    const fechaBipeo = dayjs(d['Inbound Date Included'], "DD/MM/YYYY HH:mm:ss");
    return fechaBipeo.isValid() && fechaBipeo.isAfter(unaHoraAtrasGlobal);
  }).length;

  return {
    kpis: {
      proyectado: proyectadoManual.toLocaleString(),
      arribado: arribadoExcel.toLocaleString(),
      bipeado: totalPiezasSistema.toLocaleString(),
      arribadoBipeado: (arribadoExcel - totalPiezasSistema).toLocaleString(),
      velocidadReal: velocidadRealCalculada.toLocaleString(),
    //   proyectadoBipeado: (proyectadoManual - totalPiezasSistema).toLocaleString(),
      descargaHora: objXHoraGlobal > 0 ? objXHoraGlobal.toLocaleString() : "0",
      pArribado: Math.round((arribadoExcel / proyectadoManual) * 100) || 0,
      pBipeo: Math.round((totalPiezasSistema / proyectadoManual) * 100) || 0,
      // Se muestra el conteo de la última hora
    },
    matrix, 
    chartData: [], 
    tableData: []
  };
};
