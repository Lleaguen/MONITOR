import React, { useState, useMemo } from 'react';
import { ArrowUpDown, Clock, Package } from 'lucide-react';

const getColor = (piezas) => {
  if (piezas >= 700) return { row: 'border-red-500/20 bg-red-500/5', badge: 'bg-red-500/20 text-red-400', dot: 'bg-red-400' };
  if (piezas >= 500) return { row: 'border-orange-500/20 bg-orange-500/5', badge: 'bg-orange-500/20 text-orange-400', dot: 'bg-orange-400' };
  return { row: 'border-emerald-500/10 bg-emerald-500/[0.03]', badge: 'bg-emerald-500/20 text-emerald-400', dot: 'bg-emerald-400' };
};

const ArribosChasis = ({ data }) => {
  const arrivals = data?.arrivalChasis || [];
  const [orden, setOrden] = useState('hora'); // 'hora' | 'piezas_desc' | 'piezas_asc'

  const sorted = useMemo(() => {
    const copy = [...arrivals];
    if (orden === 'piezas_desc') return copy.sort((a, b) => b.piezas - a.piezas);
    if (orden === 'piezas_asc')  return copy.sort((a, b) => a.piezas - b.piezas);
    return copy.sort((a, b) => a.hora.localeCompare(b.hora));
  }, [arrivals, orden]);

  const totalPiezas = arrivals.reduce((a, r) => a + r.piezas, 0);
  const rojos    = arrivals.filter(r => r.piezas >= 700).length;
  const naranjas = arrivals.filter(r => r.piezas >= 500 && r.piezas < 700).length;
  const verdes   = arrivals.filter(r => r.piezas < 500).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* ── RESUMEN ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#111827]/60 border border-white/5 rounded-2xl p-5">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Chasis</p>
          <p className="text-3xl font-black text-white italic">{arrivals.length}</p>
          <p className="text-[9px] font-black text-slate-600 mt-1">{totalPiezas.toLocaleString()} piezas</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5">
          <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-2">Menos de 500</p>
          <p className="text-3xl font-black text-white italic">{verdes}</p>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-5">
          <p className="text-[9px] font-black text-orange-400 uppercase tracking-widest mb-2">500 – 699</p>
          <p className="text-3xl font-black text-white italic">{naranjas}</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5">
          <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-2">700 o más</p>
          <p className="text-3xl font-black text-white italic">{rojos}</p>
        </div>
      </div>

      {/* ── CONTROLES DE ORDEN ── */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mr-2">Ordenar por:</span>
        <button
          onClick={() => setOrden('hora')}
          className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-lg transition-all ${orden === 'hora' ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-500 hover:text-white'}`}
        >
          <Clock size={11} /> Hora
        </button>
        <button
          onClick={() => setOrden('piezas_desc')}
          className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-lg transition-all ${orden === 'piezas_desc' ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-500 hover:text-white'}`}
        >
          <ArrowUpDown size={11} /> Mayor piezas
        </button>
        <button
          onClick={() => setOrden('piezas_asc')}
          className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-lg transition-all ${orden === 'piezas_asc' ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-500 hover:text-white'}`}
        >
          <ArrowUpDown size={11} /> Menor piezas
        </button>
      </div>

      {/* ── TABLA ── */}
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
              const c = getColor(row.piezas);
              return (
                <tr key={idx} className={`border-b ${c.row} text-[11px] transition-colors`}>
                  <td className="px-4 py-3 font-bold text-slate-600">{idx + 1}</td>
                  <td className="py-3 font-black text-white tracking-wider">{row.patente}</td>
                  <td className="py-3 text-center">
                    <span className="font-black text-slate-300 font-mono">{row.hora}</span>
                  </td>
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
            Sin datos de chasis
          </div>
        )}
      </div>
    </div>
  );
};

export default ArribosChasis;
