// utils/auditEngine.js

const isDifferent = (a, b) => Math.abs(Number(a) - Number(b)) > 0.001;

export const runAudit = (csvData, apiData) => {
  const csvMap = new Map();
  const result = {};

  // Indexar CSV
  csvData.forEach(item => {
    csvMap.set(String(item.shipmentId), item);
  });

  // Recorrer API
  apiData.forEach(apiItem => {
    const id = String(apiItem.shipment_id);
    const csvItem = csvMap.get(id);

    if (!csvItem) {
      const seller = "SIN_SELLER";

      if (!result[seller]) result[seller] = [];

      result[seller].push({
        shipmentId: id,
        type: "MISSING_CSV",
        api: apiItem
      });

      return;
    }

    const diff =
      isDifferent(apiItem.weight, csvItem.weight) ||
      isDifferent(apiItem.height, csvItem.height) ||
      isDifferent(apiItem.length, csvItem.length) ||
      isDifferent(apiItem.width, csvItem.width);

    if (diff) {
      const seller = csvItem.sellerId;

      if (!result[seller]) result[seller] = [];

      result[seller].push({
        shipmentId: id,
        type: "DIFF",
        api: apiItem,
        csv: csvItem,
        diff: {
          weight: apiItem.weight - csvItem.weight,
          height: apiItem.height - csvItem.height,
          length: apiItem.length - csvItem.length,
          width: apiItem.width - csvItem.width,
        }
      });
    }

    // eliminar para detectar faltantes API después
    csvMap.delete(id);
  });

  // Faltantes en API
  csvMap.forEach((csvItem) => {
    const seller = csvItem.sellerId;

    if (!result[seller]) result[seller] = [];

    result[seller].push({
      shipmentId: csvItem.shipmentId,
      type: "MISSING_API",
      csv: csvItem
    });
  });

  return result;
};