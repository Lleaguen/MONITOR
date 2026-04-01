import React, { useState } from 'react';

const CPT_ORDEN = ['0:00','1:00','2:00','3:00','4:00','5:00','6:00','7:00','8:00','9:00','10:00','11:00','13:00'];

const Voluminoso = ({ data }) => {
  if (!data?.volData) return null;

  const [filtro, setFiltro] = useState('todos'); // 'todos' | 'voluminoso' | 'paqueteria'

  // Agrupamos por CPT
  const porCPT = {};
  CPT_ORDEN.forEach(c => { porCPT[c] = []; });
  data.volData.forEach(row => {
    if (porCPT[row.cpt]) porCPT[row.cpt].push(row);
  });

  // Totales globales
  const totalPaq = data.volData.reduce((a, r) => a + r.paqueteria, 0);
  const totalVol = data.volData.reduce((a, r) => a + r.voluminoso, 0);
  const totalPiezas = totalPaq + totalVol;

  const filasFiltradas = (zonas) => zonas.filter(r => {
    if (filtro === 'voluminoso') return r.voluminoso > 0;
    if (filtro === 'paqueteria') return r.paqueteria > 0;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* ── RESUMEN GLOBAL ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#111827]/60 border border-white/5 rounded-2xl p-5">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Piezas</p>
          <p className="text-3xl font-black text-white italic">{totalPiezas.toLocaleString()}</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5">
          <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-2">Paquetería (≤ 50cm)</p>
          <p className="text-3xl font-black text-white italic">{totalPaq.toLocaleString()}</p>
          <p className="text-[10px] font-black text-emerald-400/60 mt-1">
            {totalPiezas > 0 ? Math.round((totalPaq / totalPiezas) * 100) : 0}%
          </p>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-5">
          <p className="text-[9px] font-black text-orange-400 uppercase tracking-widest mb-2">Voluminoso (&gt; 50cm)</p>
          <p className="text-3xl font-black text-white italic">{totalVol.toLocaleString()}</p>
          <p className="text-[10px] font-black text-orange-400/60 mt-1">
            {totalPiezas > 0 ? Math.round((totalVol / totalPiezas) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* ── FILTROS ── */}
      <div className="flex gap-2">
        {['todos', 'paqueteria', 'voluminoso'].map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all ${
              filtro === f
                ? 'bg-blue-600 text-white'
                : 'bg-white/5 text-slate-500 hover:text-white'
            }`}
          >
            {f === 'todos' ? 'Todos' : f === 'paqueteria' ? 'Solo Paquetería' : 'Solo Voluminoso'}
          </button>
        ))}
      </div>

      {/* ── TABLA POR CPT / ZONA ── */}
      <div className="bg-[#111827]/10 rounded-2xl border border-white/5 overflow-x-auto">
        <table className="w-full min-w-[500px] text-left">
          <thead>
            <tr className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] border-b border-white/10">
              <th className="px-4 py-3">SUB-CA</th>
              <th className="py-3 text-right">Total</th>
              <th className="py-3 text-right text-emerald-600">Paquetería</th>
              <th className="py-3 text-right text-orange-600">Voluminoso</th>
              <th className="py-3 px-4">% Voluminoso</th>
            </tr>
          </thead>
          <tbody>
            {CPT_ORDEN.map(cpt => {
              const zonas = filasFiltradas(porCPT[cpt] || []);
              if (zonas.length === 0) return null;

              const totCPT = zonas.reduce((a, r) => ({
                paqueteria: a.paqueteria + r.paqueteria,
                voluminoso: a.voluminoso + r.voluminoso,
              }), { paqueteria: 0, voluminoso: 0 });
              const totCPTTotal = totCPT.paqueteria + totCPT.voluminoso;
              const pctVol = totCPTTotal > 0 ? Math.round((totCPT.voluminoso / totCPTTotal) * 100) : 0;

              return (
                <React.Fragment key={cpt}>
                  {/* Cabecera CPT */}
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <td colSpan={5} className="px-4 py-2">
                      <span className="text-[10px] font-black text-blue-400 italic tracking-widest">CPT {cpt}</span>
                      <span className="text-[9px] font-black text-slate-600 ml-3">{totCPTTotal.toLocaleString()} piezas</span>
                    </td>
                  </tr>
                  {/* Filas de zonas */}
                  {zonas.map((row, i) => {
                    const total = row.paqueteria + row.voluminoso;
                    const pct = total > 0 ? Math.round((row.voluminoso / total) * 100) : 0;
                    return (
                      <tr key={i} className="border-b border-white/[0.03] text-[10px] hover:bg-white/[0.02] transition-colors">
                        <td className="pl-8 pr-4 py-3 font-black text-slate-400">{row.zona}</td>
                        <td className="py-3 text-right font-black text-slate-300">{total.toLocaleString()}</td>
                        <td className="py-3 text-right font-black text-emerald-400">{row.paqueteria.toLocaleString()}</td>
                        <td className="py-3 text-right font-black text-orange-400">{row.voluminoso.toLocaleString()}</td>
                        <td className="py-3 px-4 w-36">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-[2px] bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-orange-400" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-[9px] font-black text-slate-500 w-8 text-right">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {/* Subtotal CPT */}
                  <tr className="border-b border-white/10 text-[10px]">
                    <td className="pl-8 pr-4 py-2 text-[9px] font-black text-slate-600 uppercase">Subtotal</td>
                    <td className="py-2 text-right font-black text-white">{totCPTTotal.toLocaleString()}</td>
                    <td className="py-2 text-right font-black text-emerald-400">{totCPT.paqueteria.toLocaleString()}</td>
                    <td className="py-2 text-right font-black text-orange-400">{totCPT.voluminoso.toLocaleString()}</td>
                    <td className="py-2 px-4">
                      <span className="text-[9px] font-black text-slate-500">{pctVol}% vol.</span>
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-white/10 bg-white/[0.03] text-[10px]">
              <td className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Global</td>
              <td className="py-3 text-right font-black text-white">{totalPiezas.toLocaleString()}</td>
              <td className="py-3 text-right font-black text-emerald-400">{totalPaq.toLocaleString()}</td>
              <td className="py-3 text-right font-black text-orange-400">{totalVol.toLocaleString()}</td>
              <td className="py-3 px-4">
                <span className="text-[9px] font-black text-slate-500">
                  {totalPiezas > 0 ? Math.round((totalVol / totalPiezas) * 100) : 0}% vol.
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default Voluminoso;
