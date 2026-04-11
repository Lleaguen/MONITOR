// In-memory snapshot — shared across all requests
let snapshot  = null;
let lastUpdate = null;
let planVehiculos = null; // Plan guardado independientemente del snapshot

const getSnapshot  = () => snapshot;
const getLastUpdate = () => lastUpdate;
const hasData      = () => snapshot !== null;
const getPlan      = () => planVehiculos;
const setPlan      = (plan) => { planVehiculos = plan; };

const setSnapshot = (data) => {
  snapshot   = data;
  lastUpdate = new Date().toISOString();
};

const clearSnapshot = () => {
  snapshot   = null;
  lastUpdate = null;
};

module.exports = { getSnapshot, getLastUpdate, hasData, setSnapshot, clearSnapshot, getPlan, setPlan };
