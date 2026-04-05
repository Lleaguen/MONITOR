const { getSnapshot, getLastUpdate, hasData, clearSnapshot } = require('../store/snapshot');

const getData = (req, res) => {
  if (!hasData()) {
    return res.status(404).json({ error: 'No hay datos cargados. Realizá un POST /upload primero.' });
  }
  return res.json(getSnapshot());
};

const getStatus = (req, res) => {
  return res.json({
    hasData: hasData(),
    lastUpdate: getLastUpdate() || null,
  });
};

const deleteData = (req, res) => {
  clearSnapshot();
  return res.json({ status: 'ok', message: 'Snapshot eliminado' });
};

module.exports = { getData, getStatus, deleteData };
