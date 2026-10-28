const XLSX = require('xlsx');
const { getTipoVehiculo } = require('./helpers');

const parseEasyDocking = (excelRaw) => {
  const workbook = XLSX.read(excelRaw, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawMatrix = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  const headers = rawMatrix[3]?.map(h => String(h).trim()) || [];
  const dataRows = rawMatrix.slice(4);
  return dataRows.map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  }).filter(item => {
    const tipoOp = String(item['TIPO DE OPERACION'] || "").toUpperCase().includes("DESCARGA");
    const accion = String(item['Accion'] || "").toLowerCase() === "add";
    return tipoOp && accion;
  });
};

module.exports = { parseEasyDocking };
