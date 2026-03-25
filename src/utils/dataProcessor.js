// import * as XLSX from 'xlsx';
// import dayjs from 'dayjs';
// import customParseFormat from 'dayjs/plugin/customParseFormat.js';
// import minMax from 'dayjs/plugin/minMax.js'; // <--- IMPORTANTE: Agregamos este plugin

// // Activamos los plugins
// dayjs.extend(customParseFormat);
// dayjs.extend(minMax); // <--- ACTIVAMOS min/max

// export const processCombinedData = (csvData, excelRaw, proyectadoManual = 239000) => {
//   // --- 1. PROCESAR EXCEL (EASY DOCKING) ---
//   const workbook = XLSX.read(excelRaw, { type: 'array' });
//   const sheet = workbook.Sheets[workbook.SheetNames[0]];
//   const rawMatrix = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  
//   const headers = rawMatrix[3]?.map(h => String(h).trim()) || []; 
//   const dataRows = rawMatrix.slice(4);

//   const easyDockingClean = dataRows.map(row => {
//     let obj = {};
//     headers.forEach((h, i) => obj[h] = row[i]);
//     return obj;
//   }).filter(item => 
//     String(item['TIPO DE OPERACION'] || "").toUpperCase().includes("DESCARGA") && 
//     String(item['Accion'] || "").toLowerCase() === "add"
//   );

//   const arribadoExcel = easyDockingClean.reduce((acc, curr) => acc + (parseFloat(curr['CANT PAQUETES']) || 0), 0);

//   // --- 2. PROCESAR CSV (TMS) ---
//   const totalPiezasSistema = csvData.filter(d => d['Shipment ID']).length;

//   // --- 3. CÁLCULO DE TIEMPO (OBJ X HORA Y VELOCIDAD REAL) ---
//   const ahora = dayjs();
//   const horaCierre = dayjs().set('hour', 22).set('minute', 0).set('second', 0);
  
//   // A. Horas restantes hasta el cierre (para Obj x Hora)
//   let horasRestantes = horaCierre.diff(ahora, 'hour', true);
//   if (horasRestantes <= 0) horasRestantes = 0.5;

//   // B. Horas transcurridas de operación (para Velocidad Real)
//   const tiemposBipeo = csvData
//     .map(d => dayjs(d['Labeling Date Printed'], "DD/MM/YYYY HH:mm:ss"))
//     .filter(d => d.isValid());
  
//   // Ahora dayjs.min() funcionará porque extendimos el plugin
//   const primerBipeo = tiemposBipeo.length > 0 ? dayjs.min(tiemposBipeo) : ahora.subtract(1, 'hour');
//   const horasTrabajadas = ahora.diff(primerBipeo, 'hour', true) || 1;

//   // --- 4. CÁLCULOS FINALES (KPIS) ---
//   const objXHora = Math.round((proyectadoManual - totalPiezasSistema) / horasRestantes);
//   const velocidadRealCalculada = Math.round(totalPiezasSistema / horasTrabajadas);

//   const kpis = {
//     proyectado: proyectadoManual.toLocaleString(),
//     arribado: arribadoExcel.toLocaleString(),
//     bipeado: totalPiezasSistema.toLocaleString(),
//     arribadoBipeado: (arribadoExcel - totalPiezasSistema).toLocaleString(),
//     proyectadoBipeado: (proyectadoManual - totalPiezasSistema).toLocaleString(),
    
//     // El "Obj x Hora" de tu Excel
//     descargaHora: objXHora > 0 ? objXHora.toLocaleString() : "0",
    
//     pArribado: Math.round((arribadoExcel / proyectadoManual) * 100) || 0,
//     pBipeo: Math.round((totalPiezasSistema / proyectadoManual) * 100) || 0,
    
//     // El cuadro central "Velocidad Real" de tu Excel
//     velocidadReal: velocidadRealCalculada.toLocaleString()
//   };

//   return {
//     kpis,
//     chartData: [], 
//     tableData: [],
//     matrix: { 
//       chasis: easyDockingClean.filter(d => String(d['TRANSPORTE']).includes('Chasis')).length, 
//       camioneta: easyDockingClean.filter(d => String(d['TRANSPORTE']).toLowerCase().includes('camioneta')).length, 
//       semi: easyDockingClean.filter(d => String(d['TRANSPORTE']).includes('Semi')).length 
//     }
//   };
// };







// import * as XLSX from 'xlsx';
// import dayjs from 'dayjs';
// import customParseFormat from 'dayjs/plugin/customParseFormat.js';
// import minMax from 'dayjs/plugin/minMax.js';

// dayjs.extend(customParseFormat);
// dayjs.extend(minMax);

// export const processCombinedData = (csvData, excelRaw, proyectadoManual = 239000) => {
//   // --- 1. PROCESAR EXCEL (EASY DOCKING) ---
//   const workbook = XLSX.read(excelRaw, { type: 'array' });
//   const sheet = workbook.Sheets[workbook.SheetNames[0]];
//   const rawMatrix = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  
//   const headers = rawMatrix[3]?.map(h => String(h).trim()) || []; 
//   const dataRows = rawMatrix.slice(4);

//   const easyDockingClean = dataRows.map(row => {
//     let obj = {};
//     headers.forEach((h, i) => obj[h] = row[i]);
//     return obj;
//   }).filter(item => 
//     String(item['TIPO DE OPERACION'] || "").toUpperCase().includes("DESCARGA") && 
//     String(item['Accion'] || "").toLowerCase() === "add"
//   );

//   // --- 2. LÓGICA DE TIEMPO (CIERRE 22:00) ---
//   const ahora = dayjs();
//   const horaCierre = dayjs().set('hour', 22).set('minute', 0).set('second', 0);
//   let horasRestantes = horaCierre.diff(ahora, 'hour', true);
//   if (horasRestantes <= 0) horasRestantes = 0.5; // Evita división por cero

//   // --- 3. PROCESAR BIPEADOS (CSV) PARA VELOCIDAD REAL ---
//   const totalPiezasSistema = csvData.filter(d => d['Shipment ID']).length;
//   const tiemposBipeo = csvData
//     .map(d => dayjs(d['Labeling Date Printed'], "DD/MM/YYYY HH:mm:ss"))
//     .filter(d => d.isValid());
//   const primerBipeo = tiemposBipeo.length > 0 ? dayjs.min(tiemposBipeo) : ahora.subtract(1, 'hour');
//   const horasTrabajadas = ahora.diff(primerBipeo, 'hour', true) || 1;

//   // --- 4. LÓGICA DISCRIMINADA POR TRANSPORTE (MATRIX) ---
  
//   const calculateSectorVelocity = (tiposBusqueda, metaSector) => {
//     // Filtramos los vehículos de este sector
//     const vehiculosSector = easyDockingClean.filter(d => 
//       tiposBusqueda.some(tipo => String(d['TRANSPORTE'] || "").toLowerCase().includes(tipo.toLowerCase()))
//     );

//     // Sumamos las piezas reales que ya se descargaron de estos vehículos
//     const piezasDescargadas = vehiculosSector.reduce((acc, curr) => 
//       acc + (parseFloat(curr['CANT PAQUETES']) || 0), 0
//     );

//     // Aplicamos la fórmula: (Meta_Sector - Descargado_Sector) / Horas_Restantes
//     const velocityRequired = Math.round((metaSector - piezasDescargadas) / horasRestantes);
//     return velocityRequired > 0 ? velocityRequired : 0;
//   };

//   // Definimos las metas por sector (puedes ajustarlas según tu operación)
//   const metas = { chasis: 120000, camioneta: 50000, semi: 30000 };

//   const matrix = {
//     chasis: calculateSectorVelocity(['Chasis'], metas.chasis),
//     camioneta: calculateSectorVelocity(['Camioneta', 'MELI'], metas.camioneta),
//     semi: calculateSectorVelocity(['Semi'], metas.semi)
//   };

//   // --- 5. KPIs GLOBALES ---
//   const arribadoExcel = easyDockingClean.reduce((acc, curr) => acc + (parseFloat(curr['CANT PAQUETES']) || 0), 0);
//   const objXHoraGlobal = Math.round((proyectadoManual - totalPiezasSistema) / horasRestantes);
//   const velocidadRealCalculada = Math.round(totalPiezasSistema / horasTrabajadas);

//   return {
//     kpis: {
//       proyectado: proyectadoManual.toLocaleString(),
//       arribado: arribadoExcel.toLocaleString(),
//       bipeado: totalPiezasSistema.toLocaleString(),
//       arribadoBipeado: (arribadoExcel - totalPiezasSistema).toLocaleString(),
//       proyectadoBipeado: (proyectadoManual - totalPiezasSistema).toLocaleString(),
//       descargaHora: objXHoraGlobal > 0 ? objXHoraGlobal.toLocaleString() : "0",
//       pArribado: Math.round((arribadoExcel / proyectadoManual) * 100) || 0,
//       pBipeo: Math.round((totalPiezasSistema / proyectadoManual) * 100) || 0,
//       velocidadReal: velocidadRealCalculada.toLocaleString()
//     },
//     matrix, // Enviamos las velocidades requeridas por sector
//     chartData: [], 
//     tableData: []
//   };
// };
 


import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import minMax from 'dayjs/plugin/minMax.js';

dayjs.extend(customParseFormat);
dayjs.extend(minMax);

export const processCombinedData = (csvData, excelRaw, proyectadoManual = 239000) => {
  // --- 1. PROCESAR EXCEL (EASY DOCKING) ---
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

  // --- 2. LÓGICA DE TIEMPO (CIERRE 22:00) ---
  const ahora = dayjs();
  const horaCierre = dayjs().set('hour', 22).set('minute', 0).set('second', 0);
  let horasRestantes = horaCierre.diff(ahora, 'hour', true);
  if (horasRestantes <= 0) horasRestantes = 0.5;

  // --- 3. PROCESAR BIPEADOS (CSV) PARA VELOCIDAD REAL ---
  const totalPiezasSistema = csvData.filter(d => d['Shipment ID']).length;
  const tiemposBipeo = csvData
    .map(d => dayjs(d['Labeling Date Printed'], "DD/MM/YYYY HH:mm:ss"))
    .filter(d => d.isValid());
  const primerBipeo = tiemposBipeo.length > 0 ? dayjs.min(tiemposBipeo) : ahora.subtract(1, 'hour');
  const horasTrabajadas = ahora.diff(primerBipeo, 'hour', true) || 1;

  // --- 4. LÓGICA DISCRIMINADA POR TRANSPORTE (MATRIX) ---
  const calculateSectorStats = (tiposBusqueda, metaSector) => {
    const vehiculosSector = easyDockingClean.filter(d => 
      tiposBusqueda.some(tipo => String(d['TRANSPORTE'] || "").toLowerCase().includes(tipo.toLowerCase()))
    );

    // PLANIFICADO (Target): (Meta - Ya descargado) / Horas restantes
    const piezasYaDescargadas = vehiculosSector.reduce((acc, curr) => 
      acc + (parseFloat(curr['CANT PAQUETES']) || 0), 0
    );
    const targetHora = Math.round((metaSector - piezasYaDescargadas) / horasRestantes);

    // REAL (Velocidad última hora): Suma de piezas con Fecha y Hora en los últimos 60 min
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

  // --- 5. KPIs GLOBALES ---
  const arribadoExcel = easyDockingClean.reduce((acc, curr) => acc + (parseFloat(curr['CANT PAQUETES']) || 0), 0);
  const objXHoraGlobal = Math.round((proyectadoManual - totalPiezasSistema) / horasRestantes);
  const velocidadRealCalculada = Math.round(totalPiezasSistema / horasTrabajadas);

  return {
    kpis: {
      proyectado: proyectadoManual.toLocaleString(),
      arribado: arribadoExcel.toLocaleString(),
      bipeado: totalPiezasSistema.toLocaleString(),
      arribadoBipeado: (arribadoExcel - totalPiezasSistema).toLocaleString(),
      proyectadoBipeado: (proyectadoManual - totalPiezasSistema).toLocaleString(),
      descargaHora: objXHoraGlobal > 0 ? objXHoraGlobal.toLocaleString() : "0",
      pArribado: Math.round((arribadoExcel / proyectadoManual) * 100) || 0,
      pBipeo: Math.round((totalPiezasSistema / proyectadoManual) * 100) || 0,
      velocidadReal: velocidadRealCalculada.toLocaleString()
    },
    matrix, 
    chartData: [], 
    tableData: []
  };
};
