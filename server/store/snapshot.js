// In-memory store — un snapshot por site ('CIU' | 'EEV')
const snapshots   = {};   // { CIU: { data, lastUpdate }, EEV: { data, lastUpdate } }
const plans       = {};   // { CIU: [...], EEV: [...] }

const DEFAULT_SITE = 'CIU';

// ── helpers ──────────────────────────────────────────────────────────────────

const resolveSite = (site) =>
  site && typeof site === 'string' ? site.toUpperCase() : DEFAULT_SITE;

// ── snapshot ─────────────────────────────────────────────────────────────────

const getSnapshot  = (site) => snapshots[resolveSite(site)]?.data ?? null;
const getLastUpdate = (site) => snapshots[resolveSite(site)]?.lastUpdate ?? null;
const hasData      = (site) => !!snapshots[resolveSite(site)]?.data;

const setSnapshot = (data, site) => {
  const key = resolveSite(site);
  snapshots[key] = {
    data,
    lastUpdate: new Date().toISOString(),
  };
};

const clearSnapshot = (site) => {
  const key = resolveSite(site);
  delete snapshots[key];
};

// ── plan ─────────────────────────────────────────────────────────────────────

const getPlan  = (site) => plans[resolveSite(site)] ?? null;
const setPlan  = (plan, site) => { plans[resolveSite(site)] = plan; };

// ── status general (cualquier site tiene datos) ───────────────────────────────

const hasAnyData = () => Object.keys(snapshots).length > 0;

// Retorna el site más recientemente actualizado (útil para /status sin site)
const getLatestSite = () => {
  const entries = Object.entries(snapshots);
  if (!entries.length) return null;
  return entries.reduce((best, [site, val]) =>
    !best || val.lastUpdate > best[1].lastUpdate ? [site, val] : best
  );
};

module.exports = {
  getSnapshot, getLastUpdate, hasData, setSnapshot, clearSnapshot,
  getPlan, setPlan,
  hasAnyData, getLatestSite,
};
