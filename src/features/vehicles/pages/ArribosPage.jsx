import { useState, useMemo } from 'react';
import { ArrowUpDown, Clock, ArrowRightLeft } from 'lucide-react';
import StatCard from '../../../shared/components/StatCard.jsx';
import SortButton from '../../../shared/components/SortButton.jsx';
import PageWrapper from '../../../shared/components/PageWrapper.jsx';

const COLOR_MAP = (piezas) => {
  if (piezas >= 700) return { row: 'border-red-500/20 bg-red-500/5',       badge: 'bg-red-500/20 text-red-400',       dot: 'bg-red-400' };
  if (piezas >= 500) return { row: 'border-orange-500/20 bg-orange-500/5', badge: 'bg-orange-500/20 text-orange-400', dot: 'bg-orange-400' };
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

// Modal de derivación
const DerivarModal = ({ patente, tipoActual, onConfirm, onClose }) => {
  const destinos = TIPOS.filter(t => t.key !== tipoActual);
  const [destino, setDestino] = useState(destinos[0].key);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4">
        <div>
          <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Derivar Patente</h3>
          <p className="text-[10px] text-slate-500 mt-1">
            Mover <span className="text-white font-black">{patente}</span> a otro sector
          </p>
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

const ArribosTable = ({ arrivals, orden, setOrden, label, onDerivar, tipoActivo }) => {
  const [modalPatente, setModalPatente] = useState(null);

  const sorted = useMemo(() => {
    const copy = [...arrivals];
    if (orden === 'piezas_desc') return copy.sort((a, b) => b.piezas - a.piezas);
    if (orden === 'piezas_asc')  return copy.sort((a, b) => a.piezas - b.piezas);
    return copy.sort((a, b) => b.hora.localeCompare(a.hora));
  }, [arrivals, orden]);

  return (
    <>
      {modalPatente && (
        <DerivarModal
          patente={modalPatente}
          tipoActual={tipoActivo}
          onConfirm={(destino) => onDerivar(modalPatente, tipoActivo, destino)}
          onClose={() => setModalPatente(null)}
        />
      )}

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mr-2">Ordenar por:</span>
        {SORT_OPTIONS.map(({ key, label: lbl, icon }) => (
          <SortButton key={key} active={orden === key} onClick={() => setOrden(key)} icon={icon}>{lbl}</SortButton>
        ))}
      </div>

      <div className="bg-[#111827]/10 rounded-2xl border border-white/5 overflow-x-auto">
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
                <tr key={idx} className={`border-b ${c.row} text-[11px] transition-colors`}>
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
                    <button onClick={() => setModalPatente(row.patente)}
                      title="Derivar a otro sector"
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

  // derivaciones: { patente: destinoKey }
  const [derivaciones, setDerivaciones] = useState({});

  const derivar = (patente, origen, destino) => {
    setDerivaciones(prev => ({ ...prev, [patente]: destino }));
  };

  // Construir listas con derivaciones aplicadas
  const listas = useMemo(() => {
    const base = {
      arrivalChasis:    [...(data?.arrivalChasis    || [])],
      arrivalCamioneta: [...(data?.arrivalCamioneta || [])],
      arrivalSemi:      [...(data?.arrivalSemi      || [])],
    };

    // Aplicar derivaciones
    Object.entries(derivaciones).forEach(([patente, destino]) => {
      // Buscar en qué lista original está la patente
      for (const key of Object.keys(base)) {
        const idx = base[key].findIndex(r => r.patente === patente);
        if (idx !== -1 && key !== destino) {
          const [item] = base[key].splice(idx, 1);
          base[destino].push({ ...item, derivado: true });
          break;
        }
      }
    });

    return base;
  }, [data, derivaciones]);

  const chasis    = listas.arrivalChasis;
  const camioneta = listas.arrivalCamioneta;
  const semi      = listas.arrivalSemi;
  const total     = chasis.length + camioneta.length + semi.length;
  const totalPiezas = [...chasis, ...camioneta, ...semi].reduce((a, r) => a + r.piezas, 0);

  const arrivals = listas[tipoActivo] || [];
  const tipoInfo = TIPOS.find(t => t.key === tipoActivo);

  const countOf = (key) => listas[key].length;

  // Cards reactivas al tipo seleccionado
  const totalPiezasActivo = arrivals.reduce((a, r) => a + r.piezas, 0);
  const rojosActivo    = arrivals.filter(r => r.piezas >= 700).length;
  const naranjasActivo = arrivals.filter(r => r.piezas >= 500 && r.piezas < 700).length;
  const verdesActivo   = arrivals.filter(r => r.piezas < 500).length;

  return (
    <PageWrapper>
      {/* Cards reactivas al tipo seleccionado */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label={`Total ${tipoInfo?.label ?? ''}`} value={arrivals.length} sub={`${totalPiezasActivo.toLocaleString()} piezas`} />
        <StatCard label="Menos de 500" value={verdesActivo}   color="emerald" />
        <StatCard label="500 – 699"    value={naranjasActivo} color="orange"  />
        <StatCard label="700 o más"    value={rojosActivo}    color="red"     />
      </div>

      {/* Tabs + conteos por tipo a la derecha */}
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

        {/* Conteos por tipo */}
        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest">
          {TIPOS.map(({ key, label, textColor }) => (
            <span key={key} className={`flex items-center gap-1.5 ${textColor}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {label}: {countOf(key)}
            </span>
          ))}
        </div>
      </div>

      {/* Tabla */}
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
