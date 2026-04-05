// In-memory snapshot — shared across all requests
let snapshot  = null;
let lastUpdate = null;

const getSnapshot  = () => snapshot;
const getLastUpdate = () => lastUpdate;
const hasData      = () => snapshot !== null;

const setSnapshot = (data) => {
  snapshot   = data;
  lastUpdate = new Date().toISOString();
};

const clearSnapshot = () => {
  snapshot   = null;
  lastUpdate = null;
};

module.exports = { getSnapshot, getLastUpdate, hasData, setSnapshot, clearSnapshot };
