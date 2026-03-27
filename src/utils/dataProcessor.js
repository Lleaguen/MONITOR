import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import minMax from 'dayjs/plugin/minMax.js';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js';

dayjs.extend(customParseFormat);
dayjs.extend(minMax);
dayjs.extend(isSameOrBefore);

export const processCombinedData = (csvData, excelRaw, proyectadoManual = 239000) => {
  // --- 1. PROCESAR EXCEL (EASY DOCKING) ---
  const workbook = XLSX.read(excelRaw, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawMatrix = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  
  const headers = rawMatrix[3]?.map(h => String(h).trim()) || []; 
  const dataRows = rawMatrix.slice(4);

  // Filtrado estricto: Solo DESCARGA y Acción ADD
  const easyDockingClean = dataRows.map(row => {
    let obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  }).filter(item => 
    String(item['TIPO DE OPERACION'] || "").toUpperCase().includes("DESCARGA") && 
    String(item['Accion'] || "").toLowerCase() === "add"
  );

  // --- 2. LÓGICA DE TIEMPO (REFERENCIA ÚLTIMO BIPEO) ---
  const ahora = dayjs();
  const horaCierre = dayjs().set('hour', 22).set('minute', 0).set('second', 0);
  let horasRestantes = horaCierre.diff(ahora, 'hour', true);
  if (horasRestantes <= 0) horasRestantes = 0.5;

  // Obtenemos la hora del bipeo más reciente en el CSV para sincronizar el monitor
  const todosLosTiempos = csvData
    .map(d => dayjs(d['Inbound Date Included'], "DD/MM/YYYY HH:mm:ss"))
    .filter(t => t.isValid());

  const ultimaReferencia = todosLosTiempos.length > 0 
    ? dayjs.max(todosLosTiempos) 
    : ahora;

  // --- 3. LÓGICA DE VEHÍCULOS EN ESPERA (CRUCE DE PATENTES) ---
  // Obtenemos patentes únicas que YA bipearon en el TMS (Truck ID)
  const patentesYaDescargadas = new Set(
    csvData.map(d => String(d['Truck ID'] || "").trim().toUpperCase()).filter(p => p !== "")
  );

  // Un vehículo está en espera si está en Easy Docking pero su patente NO está en el TMS
  const vehiculosEnEspera = easyDockingClean.filter(doc => {
    const patenteDoc = String(doc['PATENTE'] || "").trim().toUpperCase();
    return patenteDoc !== "" && !patentesYaDescargadas.has(patenteDoc);
  });

  const conteoEspera = {
    chasis: vehiculosEnEspera.filter(v => String(v['TRANSPORTE']).includes("Chasis")).length,
    camioneta: vehiculosEnEspera.filter(v => 
      String(v['TRANSPORTE']).includes("Camioneta") || String(v['TRANSPORTE']).includes("MELI")
    ).length,
    semi: vehiculosEnEspera.filter(v => String(v['TRANSPORTE']).includes("Semi")).length,
    total: vehiculosEnEspera.length
  };

  // --- 4. LÓGICA DISCRIMINADA POR TRANSPORTE (MATRIX) ---
  const calculateSectorStats = (tiposBusqueda, metaSector) => {
    const vehiculosSector = easyDockingClean.filter(d => 
      tiposBusqueda.some(tipo => String(d['TRANSPORTE'] || "").toLowerCase().includes(tipo.toLowerCase()))
    );

    const piezasYaDescargadas = vehiculosSector.reduce((acc, curr) => 
      acc + (parseFloat(curr['CANT PAQUETES']) || 0), 0
    );
    const targetHora = Math.round((metaSector - piezasYaDescargadas) / horasRestantes);

    const unaHoraAtrasSectores = ultimaReferencia.subtract(1, 'hour');
    const actualHora = vehiculosSector
      .filter(d => {
        const fechaDoc = dayjs(d['Fecha y Hora']);
        return fechaDoc.isAfter(unaHoraAtrasSectores) && fechaDoc.isSameOrBefore(ultimaReferencia);
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
  const totalPiezasSistema = csvData.filter(d => d['Shipment ID']).length;
  const arribadoExcel = easyDockingClean.reduce((acc, curr) => acc + (parseFloat(curr['CANT PAQUETES']) || 0), 0);
  const objXHoraGlobal = Math.round((proyectadoManual - totalPiezasSistema) / horasRestantes);

  // Velocidad Real (ventana de 60 min basada en el último bipeo)
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
      proyectadoBipeado: (proyectadoManual - totalPiezasSistema).toLocaleString(),
      velocidadReal: velocidadRealCalculada.toLocaleString(),
      descargaHora: objXHoraGlobal > 0 ? objXHoraGlobal.toLocaleString() : "0",
      pArribado: Math.round((arribadoExcel / proyectadoManual) * 100) || 0,
      pBipeo: Math.round((totalPiezasSistema / proyectadoManual) * 100) || 0,
      ultimaActualizacion: ultimaReferencia.format("HH:mm:ss"),
      // NUEVOS DATOS PARA EL CUADRO AZUL
      espera: conteoEspera 
    },
    matrix, 
    chartData: [], 
    tableData: []
  };
};
