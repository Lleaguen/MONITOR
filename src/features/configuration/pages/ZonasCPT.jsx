import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { ZONA_CPT, CPT_ORDEN } from '../../../core/processors/zonaCPT.js';
import PageWrapper from '../../../shared/components/PageWrapper.jsx';

const CPT_OPTIONS = [...CPT_ORDEN, 'Sin CPT'];

const Badge = ({ cpt }) => (
  <span className="inline-block px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase tracking-widest">
    {cpt}
  </span>
);

// Fila editable
const EditRow = ({ zona, cpt, onSave, onCancel }) => {
  const [newCpt, setNewCpt] = useState(cpt);
  return (
    <tr className="border-b border-white/5 bg-blue-500/5">
      <td className="px-4 py-2 font-black text-white text-[11px]">{zona}</td>
      <td className="py-2">
        <select value={newCpt} onChange={e => setNewCpt(e.target.value)}
          className="bg-[#020617] border border-blue-500/30 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg focus:outline-none focus:border-blue-500">
          {CPT_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </td>
      <td className="py-2 px-4 text-right">
        <div className="flex justify-end gap-2">
          <button onClick={() => onSave(newCpt)}
            className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all">
            <Check size={13} />
          </button>
          <button onClick={onCancel}
            className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 transition-all">
            <X size={13} />
          </button>
        </div>
      </td>
    </tr>
  );
};

const ZonasCPT = ({ overrides, onOverridesChange }) => {
  const [editingZona, setEditingZona] = useState(null);
  const [newZona, setNewZona] = useState('');
  const [newCpt, setNewCpt] = useState(CPT_ORDEN[0]);
  const [search, setSearch] = useState('');

  // Merge base + overrides
  const allZonas = useMemo(() => {
    const base = Object.entries(ZONA_CPT).map(([zona, cpt]) => ({ zona, cpt, isOverride: false }));
    const overrideEntries = Object.entries(overrides || {}).map(([zona, cpt]) => ({ zona, cpt, isOverride: true }));
    // Merge: overrides reemplazan base, nuevas se agregan
    const map = new Map(base.map(r => [r.zona, r]));
    overrideEntries.forEach(r => map.set(r.zona, { ...r, isOverride: true }));
    return Array.from(map.values()).sort((a, b) => a.zona.localeCompare(b.zona));
  }, [overrides]);

  const filtered = allZonas.filter(r =>
    r.zona.toLowerCase().includes(search.toLowerCase()) ||
    r.cpt.includes(search)
  );

  const saveEdit = (zona, newCpt) => {
    onOverridesChange({ ...overrides, [zona]: newCpt });
    setEditingZona(null);
  };

  const removeOverride = (zona) => {
    const copy = { ...overrides };
    delete copy[zona];
    onOverridesChange(copy);
  };

  const addZona = () => {
    const z = newZona.trim().toUpperCase();
    if (!z) return;
    onOverridesChange({ ...overrides, [z]: newCpt });
    setNewZona('');
    setNewCpt(CPT_ORDEN[0]);
  };

  const isCustom = (zona) => zona in (overrides || {});

  return (
    <PageWrapper>
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white italic tracking-tight uppercase">Zonas CPT</h2>
          <p className="text-[10px] text-slate-500 mt-1">Modificá la asignación de Labeling Zone a CPT o agregá nuevas zonas</p>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar zona o CPT..."
          className="bg-[#0d1525] border border-white/10 text-white text-[11px] px-4 py-2 rounded-xl focus:outline-none focus:border-blue-500/50 w-full sm:w-56" />
      </div>

      {/* Agregar nueva zona */}
      <div className="flex flex-wrap gap-3 items-end p-4 bg-[#111827]/30 rounded-2xl border border-white/5">
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Labeling Zone</label>
          <input value={newZona} onChange={e => setNewZona(e.target.value.toUpperCase())}
            placeholder="Ej: AND099"
            className="bg-[#020617] border border-white/10 text-white text-[11px] font-bold px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500/50 w-36 uppercase" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">CPT</label>
          <select value={newCpt} onChange={e => setNewCpt(e.target.value)}
            className="bg-[#020617] border border-white/10 text-white text-[11px] font-bold px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500/50">
            {CPT_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button onClick={addZona}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest transition-all active:scale-95">
          <Plus size={13} strokeWidth={3} /> Agregar
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-[#111827]/10 rounded-2xl border border-white/5 overflow-x-auto">
        <table className="w-full min-w-[400px] text-left">
          <thead>
            <tr className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] border-b border-white/10">
              <th className="px-4 py-3">Labeling Zone</th>
              <th className="py-3">CPT</th>
              <th className="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(({ zona, cpt }) =>
              editingZona === zona ? (
                <EditRow key={zona} zona={zona} cpt={cpt}
                  onSave={(nc) => saveEdit(zona, nc)}
                  onCancel={() => setEditingZona(null)} />
              ) : (
                <tr key={zona} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-2.5 font-black text-[11px] text-white font-mono">
                    {zona}
                    {isCustom(zona) && (
                      <span className="ml-2 text-[8px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                        custom
                      </span>
                    )}
                  </td>
                  <td className="py-2.5"><Badge cpt={cpt} /></td>
                  <td className="py-2.5 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingZona(zona)}
                        className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                        <Pencil size={12} />
                      </button>
                      {isCustom(zona) && (
                        <button onClick={() => removeOverride(zona)}
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-600 font-black text-[11px] uppercase tracking-widest">
            Sin resultados
          </div>
        )}
      </div>

      <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">
        {Object.keys(overrides || {}).length} zona(s) con asignación personalizada · {allZonas.length} zonas en total
      </p>
    </PageWrapper>
  );
};

export default ZonasCPT;
