// import * as XLSX from 'xlsx';
// import dayjs from 'dayjs';
// import customParseFormat from 'dayjs/plugin/customParseFormat.js';
// import minMax from 'dayjs/plugin/minMax.js';
// import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js';

// dayjs.extend(customParseFormat);
// dayjs.extend(minMax);
// dayjs.extend(isSameOrBefore);

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

//   // --- 2. LÓGICA DE TIEMPO (REFERENCIA ÚLTIMO BIPEO) ---
//   const ahora = dayjs();
//   const horaCierre = dayjs().set('hour', 22).set('minute', 0).set('second', 0);
//   let horasRestantes = horaCierre.diff(ahora, 'hour', true);
//   if (horasRestantes <= 0) horasRestantes = 0.5;

//   const todosLosTiempos = csvData
//     .map(d => dayjs(d['Inbound Date Included'], "DD/MM/YYYY HH:mm:ss"))
//     .filter(t => t.isValid());

//   const ultimaReferencia = todosLosTiempos.length > 0 
//     ? dayjs.max(todosLosTiempos) 
//     : ahora;

//   // --- 3. LÓGICA DE VEHÍCULOS (ESPERA VS ATRACADOS) ---
  
//   // A. Patentes que están actualmente descargando (in_hub)
//   const patentesAtracadas = new Set(
//     csvData
//       .filter(d => String(d['Hub Status'] || "").toLowerCase() === 'in_hub')
//       .map(d => String(d['Truck ID'] || "").trim().toUpperCase())
//       .filter(p => p !== "")
//   );

//   // B. Patentes que ya terminaron (no están in_hub pero están en el CSV)
//   const patentesFinalizadas = new Set(
//     csvData
//       .filter(d => String(d['Hub Status'] || "").toLowerCase() !== 'in_hub')
//       .map(d => String(d['Truck ID'] || "").trim().toUpperCase())
//       .filter(p => p !== "")
//   );

//   // C. Filtrar vehículos EN ESPERA (Están en Excel pero NO en el Hub y NO finalizaron)
//   const vehiculosEnEspera = easyDockingClean.filter(doc => {
//     const patenteDoc = String(doc['PATENTE'] || "").trim().toUpperCase();
//     return patenteDoc !== "" && !patentesAtracadas.has(patenteDoc) && !patentesFinalizadas.has(patenteDoc);
//   });

//   const conteoEspera = {
//     chasis: vehiculosEnEspera.filter(v => String(v['TIPO DE VEHICULO'] || "").toUpperCase().includes("CHASIS")).length,
//     camioneta: vehiculosEnEspera.filter(v => {
//       const t = String(v['TIPO DE VEHICULO'] || "").toUpperCase();
//       return t.includes("CAMIONETA") || t.includes("MELI");
//     }).length,
//     semi: vehiculosEnEspera.filter(v => String(v['TIPO DE VEHICULO'] || "").toUpperCase().includes("SEMI")).length,
//     total: vehiculosEnEspera.length,
//     atracados: patentesAtracadas.size
//   };

//   // --- 4. LÓGICA DISCRIMINADA POR TRANSPORTE (MATRIX) ---
//   const calculateSectorStats = (tiposBusqueda, metaSector) => {
//     const vehiculosSector = easyDockingClean.filter(d => 
//       tiposBusqueda.some(tipo => String(d['TIPO DE VEHICULO'] || "").toLowerCase().includes(tipo.toLowerCase()))
//     );

//     const piezasYaDescargadas = vehiculosSector.reduce((acc, curr) => 
//       acc + (parseFloat(curr['CANT PAQUETES']) || 0), 0
//     );
//     const targetHora = Math.round((metaSector - piezasYaDescargadas) / horasRestantes);

//     const unaHoraAtrasSectores = ultimaReferencia.subtract(1, 'hour');
//     const actualHora = vehiculosSector
//       .filter(d => {
//         const fechaDoc = dayjs(d['Fecha y Hora']);
//         return fechaDoc.isAfter(unaHoraAtrasSectores) && fechaDoc.isSameOrBefore(ultimaReferencia);
//       })
//       .reduce((acc, curr) => acc + (parseFloat(curr['CANT PAQUETES']) || 0), 0);

//     return {
//       planificado: targetHora > 0 ? targetHora : 0,
//       real: actualHora
//     };
//   };

//   const metas = { chasis: 120000, camioneta: 50000, semi: 30000 };

//   const matrix = {
//     chasis: calculateSectorStats(['Chasis'], metas.chasis),
//     camioneta: calculateSectorStats(['Camioneta', 'MELI'], metas.camioneta),
//     semi: calculateSectorStats(['Semi'], metas.semi)
//   };

//   // --- 5. KPIs GLOBALES ---
//   const totalPiezasSistema = csvData.filter(d => d['Shipment ID']).length;
//   const arribadoExcel = easyDockingClean.reduce((acc, curr) => acc + (parseFloat(curr['CANT PAQUETES']) || 0), 0);
//   const objXHoraGlobal = Math.round((proyectadoManual - totalPiezasSistema) / horasRestantes);

//   const unaHoraAtrasGlobal = ultimaReferencia.subtract(1, 'hour');
//   const velocidadRealCalculada = csvData.filter(d => {
//     const f = dayjs(d['Inbound Date Included'], "DD/MM/YYYY HH:mm:ss");
//     return f.isValid() && f.isAfter(unaHoraAtrasGlobal) && f.isSameOrBefore(ultimaReferencia);
//   }).length;

//   return {
//     kpis: {
//       proyectado: proyectadoManual.toLocaleString(),
//       arribado: arribadoExcel.toLocaleString(),
//       bipeado: totalPiezasSistema.toLocaleString(),
//       arribadoBipeado: (arribadoExcel - totalPiezasSistema).toLocaleString(),
//       proyectadoBipeado: (proyectadoManual - totalPiezasSistema).toLocaleString(),
//       velocidadReal: velocidadRealCalculada.toLocaleString(),
//       descargaHora: objXHoraGlobal > 0 ? objXHoraGlobal.toLocaleString() : "0",
//       pArribado: Math.round((arribadoExcel / proyectadoManual) * 100) || 0,
//       pBipeo: Math.round((totalPiezasSistema / proyectadoManual) * 100) || 0,
//       ultimaActualizacion: ultimaReferencia.format("HH:mm:ss"),
//       espera: conteoEspera 
//     },
//     matrix, 
//     chartData: [], 
//     tableData: []
//   };
// };
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import minMax from 'dayjs/plugin/minMax.js';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js';

dayjs.extend(customParseFormat);
dayjs.extend(minMax);
dayjs.extend(isSameOrBefore);

// Función auxiliar para calcular similitud de texto (Distancia Levenshtein)
const getSimilitud = (s1, s2) => {
  let longer = s1.length < s2.length ? s2 : s1;
  let shorter = s1.length < s2.length ? s1 : s2;
  if (longer.length === 0) return 1.0;
  
  const editDistance = (s1, s2) => {
    let costs = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) costs[j] = j;
        else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  };

  return (longer.length - editDistance(longer, shorter)) / parseFloat(longer.length);
};

export const processCombinedData = (csvData, excelRaw, proyectadoManual = 239000) => {
  // --- 1. PROCESAR EXCEL ---
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

  // --- 2. LÓGICA DE TIEMPO ---
  const ahora = dayjs();
  const todosLosTiempos = csvData
    .map(d => dayjs(d['Inbound Date Included'], "DD/MM/YYYY HH:mm:ss"))
    .filter(t => t.isValid());
  const ultimaReferencia = todosLosTiempos.length > 0 ? dayjs.max(todosLosTiempos) : ahora;

  // --- 3. PROCESAR PATENTES DEL TMS (CSV) ---
  const patentesTMS = csvData.map(d => ({
    patente: String(d['Truck ID'] || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, ""),
    status: String(d['Hub Status'] || "").toLowerCase()
  })).filter(p => p.patente !== "");

  const patentesAtracadas = new Set(patentesTMS.filter(p => p.status === 'in_hub').map(p => p.patente));
  const patentesFinalizadas = new Set(patentesTMS.filter(p => p.status !== 'in_hub').map(p => p.patente));

  // --- 4. LÓGICA DE VEHÍCULOS CON TOLERANCIA A ERRORES ---
  const vehiculosEnEspera = easyDockingClean.filter(doc => {
    // 1. Limpiamos y separamos patentes dobles (af372ql; myl561 -> ['AF372QL', 'MYL561'])
    const rawPatente = String(doc['PATENTE'] || "").toUpperCase();
    const listaPatentesDoc = rawPatente.split(/[;,\s/]+/).map(p => p.replace(/[^A-Z0-9]/g, "")).filter(p => p.length > 3);

    if (listaPatentesDoc.length === 0) return false;

    // 2. Verificamos si alguna de las patentes del Excel ya está en el TMS (Exacta o Similar)
    const yaProcesada = listaPatentesDoc.some(pDoc => {
      // Buscamos coincidencia exacta primero
      if (patentesAtracadas.has(pDoc) || patentesFinalizadas.has(pDoc)) return true;

      // Si no hay exacta, buscamos por similitud (error humano)
      return patentesTMS.some(pTMS => getSimilitud(pDoc, pTMS.patente) > 0.8);
    });

    return !yaProcesada;
  });

  const conteoEspera = {
    chasis: vehiculosEnEspera.filter(v => String(v['TIPO DE VEHICULO'] || "").toUpperCase().includes("CHASIS")).length,
    camioneta: vehiculosEnEspera.filter(v => {
      const t = String(v['TIPO DE VEHICULO'] || "").toUpperCase();
      return t.includes("CAMIONETA") || t.includes("MELI");
    }).length,
    semi: vehiculosEnEspera.filter(v => String(v['TIPO DE VEHICULO'] || "").toUpperCase().includes("SEMI")).length,
    total: vehiculosEnEspera.length,
    atracados: patentesAtracadas.size
  };

  // --- 5. KPIs Y MATRIX ---
  const totalPiezasSistema = csvData.filter(d => d['Shipment ID']).length;
  const arribadoExcel = easyDockingClean.reduce((acc, curr) => acc + (parseFloat(curr['CANT PAQUETES']) || 0), 0);
  const horasRestantes = Math.max(dayjs().set('hour', 22).set('minute', 0).diff(ahora, 'hour', true), 0.5);
  const objXHoraGlobal = Math.round((proyectadoManual - totalPiezasSistema) / horasRestantes);
  
  const unaHoraAtrasGlobal = ultimaReferencia.subtract(1, 'hour');
  const velocidadRealCalculada = csvData.filter(d => {
    const f = dayjs(d['Inbound Date Included'], "DD/MM/YYYY HH:mm:ss");
    return f.isValid() && f.isAfter(unaHoraAtrasGlobal) && f.isSameOrBefore(ultimaReferencia);
  }).length;

  return {
    kpis: {
      proyectado: proyectadoManual.toLocaleString(),
      arribado: arribadoExcel.toLocaleString(),
      bipeado: totalPiezasSistema.toLocaleString(),
      arribadoBipeado: (arribadoExcel - totalPiezasSistema).toLocaleString(),
      velocidadReal: velocidadRealCalculada.toLocaleString(),
      descargaHora: objXHoraGlobal > 0 ? objXHoraGlobal.toLocaleString() : "0",
      pArribado: Math.round((arribadoExcel / proyectadoManual) * 100) || 0,
      pBipeo: Math.round((totalPiezasSistema / proyectadoManual) * 100) || 0,
      ultimaActualizacion: ultimaReferencia.format("HH:mm:ss"),
      espera: conteoEspera 
    },
    matrix: {}, // Mantener tu lógica de matrix aquí si la usas
    chartData: [], 
    tableData: []
  };
};
