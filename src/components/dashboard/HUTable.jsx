import React from 'react';

const HUTable = ({ tableData }) => (
  <div className="bg-[#111827]/10 rounded-2xl border border-white/5 overflow-hidden">
    <table className="w-full text-left">
      <thead>
        <tr className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] border-b border-white/5">
          <th className="px-6 py-4">Intervalo Hora</th>
          <th className="py-4">Etiquetado</th>
          <th className="py-4">Piezas</th>
          <th className="py-4">Avance %</th>
          <th className="py-4 text-center">Users Active</th>
          <th className="px-6 py-4 text-right">Rating</th>
        </tr>
      </thead>
      <tbody>
        {tableData?.map((row, idx) => {
          const avance = Math.round((row.piezas / row.etiquetado) * 100) || 0;
          return (
            <tr key={idx} className="border-b border-white/5 text-[11px] hover:bg-white/5 transition-colors group">
              <td className="px-6 py-4 text-slate-500 font-bold">{row.intervalo}</td>
              <td className="py-4 font-black text-slate-300">{row.etiquetado.toLocaleString()}</td>
              <td className="py-4 font-black text-slate-300">{row.piezas.toLocaleString()}</td>
              <td className="py-4 w-64">
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-[2px] bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${avance >= 90 ? 'bg-[#00f2ad]' : 'bg-[#ff6b00]'}`} style={{ width: `${avance}%` }} />
                  </div>
                  <span className="w-10 text-right font-black text-white">{avance}%</span>
                </div>
              </td>
              <td className="py-4 text-center font-bold text-slate-500">{row.usuarios}</td>
              <td className={`px-6 py-4 text-right font-black italic tracking-tighter ${avance >= 90 ? 'text-[#00f2ad]' : 'text-[#ff6b00]'}`}>
                {avance >= 90 ? 'OPTIMAL' : 'WATCH'}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

export default HUTable;
