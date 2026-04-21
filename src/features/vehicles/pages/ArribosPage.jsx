import { useState, useMemo, useRef, useCallback } from 'react';
import { ArrowUpDown, Clock, ArrowRightLeft } from 'lucide-react';
import StatCard from '../../../shared/components/StatCard.jsx';
import SortButton from '../../../shared/components/SortButton.jsx';
import PageWrapper from '../../../shared/components/PageWrapper.jsx';

// ID único por entrada: patente + hora (maneja duplicados de misma patente en distintas horas)
const rowId = (row) => `${row.patente}|${row.hora}`;

const COLOR_MAP = (piezas) => {
  if (piezas >= 700) return { row: 'border-red-500/20 bg-red-500/5',         badge: 'bg-red-500/20 text-red-400',       dot: 'bg-red-400'     };
  if (piezas >= 500) return { row: 'border-orange-500/20 bg-orange-500/5',   badge: 'bg-orange-500/20 text-orange-400', dot: 'bg-orange-400'  };
  return               { row: 'border-emerald-500/10 bg-emerald-500/[0.03]', badge: 'bg-emerald-500/20 text-emerald-400', dot: 'bg-emerald-400' };
};

const SORT_OPTIONS = [
  { key: 'hora',        label: 'Hora',         icon: <Clock size={11} /> },
  { key: 'piezas_desc', label: 'Mayor piezas', icon: <ArrowUpDown size={11} /> },
  { key: 'piezas_asc',  label: 'Menor piezas', icon: <ArrowUpDown size={11} /> },
];

const TIPOS = [
  { key: 'arrivalChasis',    label: 'Chasis',    color: 'emerald', activeBg: 'bg-emerald-600', textColor: 'text-emerald-400' },
  { key: 'arrivalCamioneta', label: 'Camioneta', color: 'orange',  activeBg: 'bg-yellow-600',  textColor: 'text-yellow-400'  },
  { key: 'arrivalSemi',      label: 'Semi',      color: 'blue',    activeBg: 'bg-blue-600',    textColor: 'text-blue-400'    },
];

// Modal de derivación — recibe items completos (con patente + hora)
const DerivarModal = ({ items, tipoActual, onConfirm, onClose }) => {
  const destinos = TIPOS.filter(t => t.key !== tipoActual);
  const [destino, setDestino] = useState(destinos[0].key);
  const esMultiple = items.length > 1;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4">
        <div>
          <h3 className="text-[11px] font-black text-white uppercase tracking-widest">
            Derivar Patente{esMultiple ? 's' : ''}
          </h3>
          <p className="text-[10px] text-slate-500 mt-1">
            {esMultiple
              ? `Mover ${items.length} entradas a otro sector`
              : <>Mover <span className="text-white font-black">{items[0].patente}</span> ({items[0].hora}) a otro sector</>
            }
          </p>
          {esMultiple && (
            <div className="mt-2 flex flex-wrap gap-1 max-h-24 overflow-y-auto">
              {items.map(it => (
                <span key={rowId(it)} className="text-[9px] font-black bg-white/5 text-slate-300 px-2 py-0.5 rounded-full">
                  {it.patente} <span className="text-slate-500">{it.hora}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Derivar a</label>
          <div className="flex gap-2">
            {destinos.map(t => (
              <button key={t.key} onClick={() => setDestino(t.key)}
                className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  destino === t.key ? `${t.activeBg} text-white` : 'bg-white/5 text-slate-400 hover:text-white'
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose}
            className="px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white border border-white/10 hover:border-white/20 transition-all">
            Cancelar
          </button>
          <button onClick={() => { onConfirm(destino); onClose(); }}
            className="px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-500 text-white transition-all">
            Derivar
          </button>
        </div>
      </div>
    </div>
  );
};

// Card mobile — usa rowId como identificador único
const MobilePatentCard = ({ row, selected, onToggle, onDerivarSingle, isDragging }) => {
  const id = rowId(row);
  const c = COLOR_MAP(row.piezas);
  const isSelected = selected.has(id);

  return (
    <div
      data-rowid={id}
      onPointerDown={() => onToggle(id)}
      className={`relative rounded-xl border px-4 py-3 flex items-center gap-3 transition-all select-none cursor-pointer
        ${isSelected ? 'border-blue-500/60 bg-blue-500/10' : `${c.row} border`}
        ${isDragging ? 'touch-none' : ''}
      `}
    >
      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
        isSelected ? 'border-blue-400 bg-blue-500' : 'border-white/20 bg-transparent'
      }`}>
        {isSelected && <span className="text-white text-[10px] font-black">✓</span>}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-black text-white tracking-wider text-sm">{row.patente}</span>
          {row.derivado && <span className="text-[8px] font-black text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-full">DERIVADO</span>}
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-[9px] text-slate-500 font-mono">{row.hora}</span>
          <span className={`inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full ${c.badge}`}>
            <span className={`w-1 h-1 rounded-full ${c.dot}`} />
            {row.piezas.toLocaleString()} pzas
          </span>
        </div>
      </div>

      {selected.size === 0 && (
        <button
          onPointerDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); onDerivarSingle(row); }}
          className="p-2 rounded-lg bg-white/5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all flex-shrink-0"
        >
          <ArrowRightLeft size={13} />
        </button>
      )}
    </div>
  );
};

const ArribosTable = ({ arrivals, orden, setOrden, label, onDerivar, tipoActivo }) => {
  const [modalItems, setModalItems] = useState(null);
  const [selected, setSelected] = useState(new Set()); // Set de rowId
  const [isDragging, setIsDragging] = useState(false);
  const lastToggledRef = useRef(null);

  const sorted = useMemo(() => {
    const copy = [...arrivals];
    if (orden === 'piezas_desc') return copy.sort((a, b) => b.piezas - a.piezas);
    if (orden === 'piezas_asc')  return copy.sort((a, b) => a.piezas - b.piezas);
    return copy.sort((a, b) => b.hora.localeCompare(a.hora));
  }, [arrivals, orden]);

  // Mapa id → row para recuperar el item completo al derivar
  const rowMap = useMemo(() => {
    const m = new Map();
    sorted.forEach(r => m.set(rowId(r), r));
    return m;
  }, [sorted]);

  const toggleId = useCallback((id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const card = el?.closest('[data-rowid]');
    if (!card) return;
    const id = card.dataset.rowid;
    if (id && id !== lastToggledRef.current) {
      lastToggledRef.current = id;
      setSelected(prev => { const next = new Set(prev); next.add(id); return next; });
    }
  }, [isDragging]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    lastToggledRef.current = null;
  }, []);

  const handlePointerDown = useCallback((id) => {
    lastToggledRef.current = id;
    setIsDragging(true);
  }, []);

  const clearSelection = () => setSelected(new Set());

  const derivarSeleccionados = () => {
    if (selected.size === 0) return;
    const items = Array.from(selected).map(id => rowMap.get(id)).filter(Boolean);
    setModalItems(items);
  };

  return (
    <>
      {modalItems && (
        <DerivarModal
          items={modalItems}
          tipoActual={tipoActivo}
          onConfirm={(destino) => {
            modalItems.forEach(item => onDerivar(rowId(item), tipoActivo, destino));
            clearSelection();
          }}
          onClose={() => setModalItems(null)}
        />
      )}

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mr-2">Ordenar por:</span>
        {SORT_OPTIONS.map(({ key, label: lbl, icon }) => (
          <SortButton key={key} active={orden === key} onClick={() => setOrden(key)} icon={icon}>{lbl}</SortButton>
        ))}
      </div>

      {selected.size > 0 && (
        <div className="sm:hidden flex items-center justify-between gap-3 px-4 py-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
            {selected.size} seleccionada{selected.size > 1 ? 's' : ''}
          </span>
          <div className="flex gap-2">
            <button onClick={clearSelection}
              className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-400 border border-white/10 hover:text-white transition-all">
              Limpiar
            </button>
            <button onClick={derivarSeleccionados}
              className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-blue-600 text-white hover:bg-blue-500 transition-all flex items-center gap-1.5">
              <ArrowRightLeft size={11} /> Derivar
            </button>
          </div>
        </div>
      )}

      {/* Mobile */}
      <div
        className="sm:hidden flex flex-col gap-2 touch-pan-y"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {sorted.map((row) => (
          <MobilePatentCard
            key={rowId(row)}
            row={row}
            selected={selected}
            onToggle={(id) => { handlePointerDown(id); toggleId(id); }}
            onDerivarSingle={(r) => setModalItems([r])}
            isDragging={isDragging}
          />
        ))}
        {sorted.length === 0 && (
          <div className="text-center py-12 text-slate-600 font-black text-[11px] uppercase tracking-widest">
            Sin {label.toLowerCase()}s pendientes
          </div>
        )}
      </div>

      {/* Desktop */}
      <div className="hidden sm:block bg-[#111827]/10 rounded-2xl border border-white/5 overflow-x-auto">
        <table className="w-full min-w-[400px] text-left">
          <thead>
            <tr className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] border-b border-white/10">
              <th className="px-4 py-3">#</th>
              <th className="py-3">Patente</th>
              <th className="py-3 text-center">Hora Arribo</th>
              <th className="py-3 text-right">Piezas</th>
              <th className="py-3 px-4 text-right">Derivar</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, idx) => {
              const c = COLOR_MAP(row.piezas);
              return (
                <tr key={rowId(row)} className={`border-b ${c.row} text-[11px] transition-colors`}>
                  <td className="px-4 py-3 font-bold text-slate-600">{idx + 1}</td>
                  <td className="py-3 font-black text-white tracking-wider">{row.patente}</td>
                  <td className="py-3 text-center font-black text-slate-300 font-mono">{row.hora}</td>
                  <td className="py-3 text-right">
                    <span className={`inline-flex items-center gap-1.5 font-black text-xs px-3 py-1 rounded-full ${c.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                      {row.piezas.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => setModalItems([row])}
                      className="p-1.5 rounded-lg bg-white/5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all">
                      <ArrowRightLeft size={13} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <div className="text-center py-12 text-slate-600 font-black text-[11px] uppercase tracking-widest">
            Sin {label.toLowerCase()}s pendientes
          </div>
        )}
      </div>
    </>
  );
};

const ArribosPage = ({ data }) => {
  const [tipoActivo, setTipoActivo] = useState('arrivalChasis');
  const [orden, setOrden] = useState('hora');
  // derivaciones keyed por rowId (patente|hora) en lugar de solo patente
  const [derivaciones, setDerivaciones] = useState({});

  const derivar = (id, origen, destino) => {
    setDerivaciones(prev => ({ ...prev, [id]: destino }));
  };

  const listas = useMemo(() => {
    const base = {
      arrivalChasis:    [...(data?.arrivalChasis    || [])],
      arrivalCamioneta: [...(data?.arrivalCamioneta || [])],
      arrivalSemi:      [...(data?.arrivalSemi      || [])],
    };
    Object.entries(derivaciones).forEach(([id, destino]) => {
      for (const key of Object.keys(base)) {
        const idx = base[key].findIndex(r => rowId(r) === id);
        if (idx !== -1 && key !== destino) {
          const [item] = base[key].splice(idx, 1);
          base[destino].push({ ...item, derivado: true });
          break;
        }
      }
    });
    return base;
  }, [data, derivaciones]);

  const arrivals  = listas[tipoActivo] || [];
  const tipoInfo  = TIPOS.find(t => t.key === tipoActivo);
  const countOf   = (key) => listas[key].length;

  const totalPiezasActivo = arrivals.reduce((a, r) => a + r.piezas, 0);
  const rojosActivo    = arrivals.filter(r => r.piezas >= 700).length;
  const naranjasActivo = arrivals.filter(r => r.piezas >= 500 && r.piezas < 700).length;
  const verdesActivo   = arrivals.filter(r => r.piezas < 500).length;

  return (
    <PageWrapper>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label={`Total ${tipoInfo?.label ?? ''}`} value={arrivals.length} sub={`${totalPiezasActivo.toLocaleString()} piezas`} />
        <StatCard label="Menos de 500" value={verdesActivo}   color="emerald" />
        <StatCard label="500 – 699"    value={naranjasActivo} color="orange"  />
        <StatCard label="700 o más"    value={rojosActivo}    color="red"     />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 flex-wrap">
          {TIPOS.map(({ key, label, activeBg }) => (
            <button key={key} onClick={() => { setTipoActivo(key); setOrden('hora'); }}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                tipoActivo === key ? `${activeBg} text-white` : 'bg-white/5 text-slate-400 hover:text-white'
              }`}>
              {label}
            </button>
          ))}
          {Object.keys(derivaciones).length > 0 && (
            <button onClick={() => setDerivaciones({})}
              className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
              Resetear ({Object.keys(derivaciones).length})
            </button>
          )}
        </div>
        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest">
          {TIPOS.map(({ key, label, textColor }) => (
            <span key={key} className={`flex items-center gap-1.5 ${textColor}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {label}: {countOf(key)}
            </span>
          ))}
        </div>
      </div>

      <ArribosTable
        arrivals={arrivals}
        orden={orden}
        setOrden={setOrden}
        label={tipoInfo?.label ?? ''}
        onDerivar={derivar}
        tipoActivo={tipoActivo}
      />
    </PageWrapper>
  );
};

export default ArribosPage;
