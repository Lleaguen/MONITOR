import { useState, useMemo } from 'react';
import { ArrowUpDown, Clock } from 'lucide-react';
import StatCard from '../components/ui/StatCard.jsx';
import SortButton from '../components/ui/SortButton.jsx';
import PageWrapper from '../components/ui/PageWrapper.jsx';

const COLOR_MAP = (piezas) => {
  if (piezas >= 700) return { row: 'border-red-500/20 bg-red-500/5',      badge: 'bg-red-500/20 text-red-400',      dot: 'bg-red-400' };
  if (piezas >= 500) return { row: 'border-orange-500/20 bg-orange-500/5', badge: 'bg-orange-500/20 text-orange-400', dot: 'bg-orange-400' };
  return              { row: 'border-emerald-500/10 bg-emerald-500/[0.03]', badge: 'bg-emerald-500/20 text-emerald-400', dot: 'bg-emerald-400' };
};

const SORT_OPTIONS = [
  { key: 'hora',        label: 'Hora',         icon: <Clock size={11} /> },
  { key: 'piezas_desc', label: 'Mayor piezas', icon: <ArrowUpDown size={11} /> },
  { key: 'piezas_asc',  label: 'Menor piezas', icon: <ArrowUpDown size={11} /> },
];

const ArribosSemi = ({ data }) => {
  const arrivals = data?.arrivalSemi || [];
  const [orden, setOrden] = useState('hora');

  const sorted = useMemo(() => {
    const copy = [...arrivals];
    if (orden === 'piezas_desc') return copy.sort((a, b) => b.piezas - a.piezas);
    if (orden === 'piezas_asc')  return copy.sort((a, b) => a.piezas - b.piezas);
    return copy.sort((a, b) => b.hora.localeCompare(a.hora));
  }, [arrivals, orden]);

  const totalPiezas = arrivals.reduce((a, r) => a + r.piezas, 0);
  const rojos    = arrivals.filter(r => r.piezas >= 700).length;
  const naranjas = arrivals.filter(r => r.piezas >= 500 && r.piezas < 700).length;
  const verdes   = arrivals.filter(r => r.piezas < 500).length;

  return (
    <PageWrapper>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Semis"  value={arrivals.length} sub={`${totalPiezas.toLocaleString()} piezas`} />
        <StatCard label="Menos de 500" value={verdes}   color="emerald" />
        <StatCard label="500 – 699"    value={naranjas} color="orange" />
        <StatCard label="700 o más"    value={rojos}    color="red" />
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mr-2">Ordenar por:</span>
        {SORT_OPTIONS.map(({ key, label, icon }) => (
          <SortButton key={key} active={orden === key} onClick={() => setOrden(key)} icon={icon}>{label}</SortButton>
        ))}
      </div>

      <div className="bg-[#111827]/10 rounded-2xl border border-white/5 overflow-x-auto">
        <table className="w-full min-w-[400px] text-left">
          <thead>
            <tr className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] border-b border-white/10">
              <th className="px-4 py-3">#</th>
              <th className="py-3">Patente</th>
              <th className="py-3 text-center">Hora Arribo</th>
              <th className="py-3 text-right px-4">Piezas</th>
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
                  <td className="py-3 text-right px-4">
                    <span className={`inline-flex items-center gap-1.5 font-black text-xs px-3 py-1 rounded-full ${c.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                      {row.piezas.toLocaleString()}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <div className="text-center py-12 text-slate-600 font-black text-[11px] uppercase tracking-widest">
            Sin semis pendientes
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default ArribosSemi;
