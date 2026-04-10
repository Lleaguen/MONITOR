// utils/csvParser.js

// Detecta automáticamente el delimitador
export const detectDelimiter = (text) => {
  const delimiters = [',', ';', '\t'];

  const counts = delimiters.map(d => ({
    delimiter: d,
    count: (text.split('\n')[0].match(new RegExp(`\\${d}`, 'g')) || []).length
  }));

  return counts.sort((a, b) => b.count - a.count)[0].delimiter;
};

// Parsea el CSV a JSON plano
export const parseCSV = (text) => {
  const delimiter = detectDelimiter(text);
  const lines = text.split('\n').filter(line => line.trim() !== '');

  const headers = lines[0].split(delimiter).map(h => h.trim());

  return lines.slice(1).map(line => {
    const values = line.split(delimiter);

    let obj = {};
    headers.forEach((header, i) => {
      obj[header] = values[i]?.trim();
    });

    return obj;
  });
};

// Normaliza los datos a tu formato
export const normalizeCSVData = (rows) => {
  return rows.map(r => ({
    shipmentId: String(r["Shipment ID"] || r["shipment_id"] || '').trim(),
    weight: Number(r["Weight"] || r["weight"] || 0),
    height: Number(r["Height"] || r["height"] || 0),
    length: Number(r["Length"] || r["length"] || 0),
    width: Number(r["Width"] || r["width"] || 0),
  }));
};

// Función principal (la que vas a usar)
export const parseCSVFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const text = evt.target.result;

        const raw = parseCSV(text);
        const normalized = normalizeCSVData(raw);

        resolve(normalized);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);

    reader.readAsText(file);
  });
};