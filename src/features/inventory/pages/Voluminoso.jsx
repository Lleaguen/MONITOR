import React, { useState } from 'react';
import StatCard from '../../../shared/components/StatCard';
import SortButton from '../../../shared/components/SortButton';
import PageWrapper from '../../../shared/components/PageWrapper';

const CPT_ORDEN = ['0:00','1:00','2:00','3:00','4:00','5:00','6:00','7:00','8:00','9:00','10:00','11:00','13:00'];

const CPT_COLORS = {
  '0:00': '#ef4444',
  '1:00': '#f97316',
  '2:00': '#f59e0b',
  '3:00': '#eab308',
  '4:00': '#84cc16',
  '5:00': '#22c55e',
  '6:00': '#10b981',
  '7:00': '#14b8a6',
  '8:00': '#06b6d4',
  '9:00': '#0ea5e9',
  '10:00': '#3b82f6',
  '11:00': '#6366f1',
  '13:00': '#8b5cf6',
};

const FILTROS = [
  { key: 'todos',      label: 'Todos' },
  { key: 'paqueteria', label: 'Solo Paquetería' },
  { key: 'voluminoso', label: 'Solo Voluminoso' },
];

const Voluminoso = ({ data }) => {
  if (!data?.volDataByZona) return null;

  const [filtro, setFiltro] = useState('todos');

  const porCPT = {};
  CPT_ORDEN.forEach(c => { porCPT[c] = []; });
  data.volDataByZona.forEach(row => { if (porCPT[row.cpt]) porCPT[row.cpt].push(row); });

  const totalPaq = data.volDataByZona.reduce((a, r) => a + r.paqueteria, 0);
  const totalVol = data.volDataByZona.reduce((a, r) => a + r.voluminoso, 0);
  const totalPiezas = totalPaq + totalVol;
  const pctVol = totalPiezas > 0 ? Math.round((totalVol / totalPiezas) * 100) : 0;
  const pctPaq = totalPiezas > 0 ? Math.round((totalPaq / totalPiezas) * 100) : 0;

  const filasFiltradas = (zonas) => zonas.filter(r => {
    if (filtro === 'voluminoso') return r.voluminoso > 0;
    if (filtro === 'paqueteria') return r.paqueteria > 0;
    return true;
  });

  // Pie chart data por CPT
  const pieDataByCPT = (data.volDataByCPT || []).map(cpt => {
    const total = cpt.paqueteria + cpt.voluminoso;
    const pct = total > 0 ? Math.round((cpt.voluminoso / total) * 100) : 0;
    return { cpt: cpt.cpt, voluminoso: cpt.voluminoso, paqueteria: cpt.paqueteria, total, pct };
  }).filter(d => d.total > 0);

  return (
    <PageWrapper>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Piezas"          value={totalPiezas.toLocaleString()} />
        <StatCard label="Paquetería (≤50cm, ≤20kg)" value={totalPaq.toLocaleString()} sub={`${pctPaq}%`} color="emerald" />
        <StatCard label="Voluminoso (≥50cm o >20kg)" value={totalVol.toLocaleString()} sub={`${pctVol}%`} color="orange" />
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mr-2">Filtrar:</span>
          {FILTROS.map(({ key, label }) => (
            <SortButton key={key} active={filtro === key} onClick={() => setFiltro(key)}>{label}</SortButton>
          ))}
        </div>
      </div>

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
              const pct = totCPTTotal > 0 ? Math.round((totCPT.voluminoso / totCPTTotal) * 100) : 0;

              return (
                <React.Fragment key={cpt}>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <td colSpan={5} className="px-4 py-2">
                      <span className="text-[10px] font-black text-blue-400 italic tracking-widest">CPT {cpt}</span>
                      <span className="text-[9px] font-black text-slate-600 ml-3">{totCPTTotal.toLocaleString()} piezas</span>
                    </td>
                  </tr>
                  {zonas.map((row, i) => {
                    const total = row.paqueteria + row.voluminoso;
                    const rowPct = total > 0 ? Math.round((row.voluminoso / total) * 100) : 0;
                    return (
                      <tr key={i} className="border-b border-white/[0.03] text-[10px] hover:bg-white/[0.02] transition-colors">
                        <td className="pl-8 pr-4 py-3 font-black text-slate-400">{row.zona}</td>
                        <td className="py-3 text-right font-black text-slate-300">{total.toLocaleString()}</td>
                        <td className="py-3 text-right font-black text-emerald-400">{row.paqueteria.toLocaleString()}</td>
                        <td className="py-3 text-right font-black text-orange-400">{row.voluminoso.toLocaleString()}</td>
                        <td className="py-3 px-4 w-36">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-[2px] bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-orange-400" style={{ width: `${rowPct}%` }} />
                            </div>
                            <span className="text-[9px] font-black text-slate-500 w-8 text-right">{rowPct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="border-b border-white/10 text-[10px]">
                    <td className="pl-8 pr-4 py-2 text-[9px] font-black text-slate-600 uppercase">Subtotal</td>
                    <td className="py-2 text-right font-black text-white">{totCPTTotal.toLocaleString()}</td>
                    <td className="py-2 text-right font-black text-emerald-400">{totCPT.paqueteria.toLocaleString()}</td>
                    <td className="py-2 text-right font-black text-orange-400">{totCPT.voluminoso.toLocaleString()}</td>
                    <td className="py-2 px-4"><span className="text-[9px] font-black text-slate-500">{pct}% vol.</span></td>
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
              <td className="py-3 px-4"><span className="text-[9px] font-black text-slate-500">{pctVol}% vol.</span></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </PageWrapper>
  );
};

export default Voluminoso;
