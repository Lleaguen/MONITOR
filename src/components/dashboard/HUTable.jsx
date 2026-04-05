import React from 'react';
import ProgressBar from '../ui/ProgressBar';

const HUTable = ({ tableData, objetivo = 99 }) => {
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
    <div className="bg-[#111827]/10 rounded-2xl border border-white/5 overflow-x-auto">
      <table className="w-full min-w-[600px] text-left">
        <thead>
          <tr className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] border-b border-white/5">
            <th className="px-4 py-3">CPT</th>
            <th className="py-3 text-right">Etiquetado</th>
            <th className="py-3 text-right hidden sm:table-cell">HU Abierto</th>
            <th className="py-3 text-right">HU Cerrado</th>
            <th className="py-3 text-right pr-3">Pendiente</th>
            <th className="py-3 pl-4">% Avance</th>
            <th className="px-4 py-3 text-center hidden md:table-cell">Users HU</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((row, idx) => {
            return (
              <tr key={idx} className="border-b border-white/5 text-[11px] hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 font-black text-blue-400 italic">{row.intervalo}</td>
                <td className="py-3 text-right font-black text-slate-300">{row.etiquetado.toLocaleString()}</td>
                <td className="py-3 text-right font-bold text-slate-500 hidden sm:table-cell">{row.huAbierto > 0 ? row.huAbierto.toLocaleString() : '-'}</td>
                <td className="py-3 text-right font-black text-slate-300">{row.huCerrado.toLocaleString()}</td>
                <td className="py-3 text-right font-black text-orange-400 pr-3">{row.pendiente > 0 ? row.pendiente.toLocaleString() : '-'}</td>
                <td className="py-3 pl-4 w-36 md:w-44">
                  <ProgressBar value={row.avance} threshold={objetivo} />
                </td>
                <td className="px-4 py-3 text-center font-bold text-slate-500 hidden md:table-cell">{row.usuarios > 0 ? row.usuarios : '-'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default HUTable;
