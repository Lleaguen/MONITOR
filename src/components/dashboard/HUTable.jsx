import React from 'react';

const HUTable = ({ tableData }) => {
  // tableData ahora es [{ cpt, zonas, totCPT }]
  // Mostramos una fila por CPT con los totales
  const filas = (tableData || []).map(({ cpt, totCPT }) => ({
    intervalo: cpt,
    etiquetado: totCPT?.etiquetado || 0,
    huAbierto:  totCPT?.huAbierto  || 0,
    huCerrado:  totCPT?.huCerrado  || 0,
    pendiente:  totCPT?.pendiente  || 0,
    avance:     totCPT?.avance     || 0,
    usuarios:   totCPT?.usuarios   || 0,
  }));

  return (
    <div className="bg-[#111827]/10 rounded-2xl border border-white/5 overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] border-b border-white/5">
            <th className="px-6 py-4">CPT</th>
            <th className="py-4 text-right">Etiquetado</th>
            <th className="py-4 text-right">HU Abierto</th>
            <th className="py-4 text-right">HU Cerrado</th>
            <th className="py-4 text-right pr-4">Pendiente</th>
            <th className="py-4 pl-6">% Avance</th>
            <th className="px-6 py-4 text-center">Users HU</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((row, idx) => {
            const bueno = row.avance >= 99;
            return (
              <tr key={idx} className="border-b border-white/5 text-[11px] hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-black text-blue-400 italic">{row.intervalo}</td>
                <td className="py-4 text-right font-black text-slate-300">{row.etiquetado.toLocaleString()}</td>
                <td className="py-4 text-right font-bold text-slate-500">{row.huAbierto > 0 ? row.huAbierto.toLocaleString() : '-'}</td>
                <td className="py-4 text-right font-black text-slate-300">{row.huCerrado.toLocaleString()}</td>
                <td className="py-4 text-right font-black text-orange-400 pr-4">{row.pendiente > 0 ? row.pendiente.toLocaleString() : '-'}</td>
                <td className="py-4 pl-6 w-44">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-[2px] bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${bueno ? 'bg-[#00f2ad]' : 'bg-[#ff6b00]'}`} style={{ width: `${Math.min(row.avance, 100)}%` }} />
                    </div>
                    <span className={`w-14 text-right font-black text-xs ${bueno ? 'text-[#00f2ad]' : 'text-[#ff6b00]'}`}>
                      {row.avance.toFixed(2)}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center font-bold text-slate-500">{row.usuarios > 0 ? row.usuarios : '-'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default HUTable;
