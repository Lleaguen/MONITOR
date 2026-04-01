import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

// ── Fila de zona dentro de un CPT ──
const ZonaRow = ({ z, objetivo }) => {
  const bueno = z.avance >= objetivo;
  const controlOk = z.pendiente === 0;
  return (
    <tr className="border-b border-white/[0.03] text-[10px] hover:bg-white/[0.02] transition-colors">
      {/* ARMADO */}
      <td className="pl-10 pr-4 py-3 font-black text-slate-400">{z.zona}</td>
      <td className="py-3 text-right font-black text-slate-300">{z.etiquetado.toLocaleString()}</td>
      <td className="py-3 text-right font-bold text-slate-500">{z.huAbierto > 0 ? z.huAbierto.toLocaleString() : '-'}</td>
      <td className="py-3 text-right font-black text-slate-300">{z.huCerrado.toLocaleString()}</td>
      <td className="py-3 text-right font-black text-orange-400">{z.pendiente > 0 ? z.pendiente.toLocaleString() : '-'}</td>
      <td className="py-3 pl-6 w-44">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-[2px] bg-slate-800 rounded-full overflow-hidden">
            <div className={`h-full ${bueno ? 'bg-emerald-400' : 'bg-orange-400'}`} style={{ width: `${Math.min(z.avance, 100)}%` }} />
          </div>
          <span className={`w-12 text-right font-black ${bueno ? 'text-emerald-400' : 'text-orange-400'}`}>
            {z.avance.toFixed(2)}%
          </span>
        </div>
      </td>
      {/* DESPACHO */}
      <td className="py-3 text-right font-bold text-slate-500 pl-6">{z.huFinalizadas > 0 ? z.huFinalizadas.toLocaleString() : '-'}</td>
      <td className="py-3 text-right font-bold text-slate-500">{z.huEnDespacho > 0 ? z.huEnDespacho.toLocaleString() : '-'}</td>
      <td className="py-3 text-right font-bold text-slate-500">{z.despachado > 0 ? z.despachado.toLocaleString() : '-'}</td>
      <td className="py-3 text-center">
        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${controlOk ? 'text-emerald-400 bg-emerald-500/10' : 'text-orange-400 bg-orange-500/10'}`}>
          {controlOk ? 'OK' : 'PENDIENTE'}
        </span>
      </td>
    </tr>
  );
};

// ── Bloque de un CPT ──
const CPTBlock = ({ cpt, zonas, totCPT, objetivo }) => {
  const [open, setOpen] = useState(true);
  const bueno = totCPT.avance >= objetivo;

  return (
    <>
      {/* Fila cabecera del CPT */}
      <tr
        className="border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <td className="px-4 py-3" colSpan={10}>
          <div className="flex items-center gap-3">
            <div className="text-slate-500">{open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}</div>
            <span className="text-[11px] font-black text-blue-400 italic tracking-widest">CPT {cpt}</span>
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-2">
              {zonas.length} zona{zonas.length !== 1 ? 's' : ''}
            </span>
            <div className="ml-auto flex items-center gap-6 text-[9px] font-black">
              <span className="text-slate-500">{totCPT.etiquetado.toLocaleString()} piezas</span>
              <span className={bueno ? 'text-emerald-400' : 'text-orange-400'}>{totCPT.avance.toFixed(2)}%</span>
              <span className="text-slate-600">{totCPT.usuarios} usuarios</span>
            </div>
          </div>
        </td>
      </tr>
      {/* Filas de zonas */}
      {open && zonas.map((z, i) => <ZonaRow key={i} z={z} objetivo={objetivo} />)}
      {/* Subtotal del CPT */}
      {open && (
        <tr className="border-b border-white/10 bg-white/[0.02] text-[10px]">
          <td className="pl-10 pr-4 py-2 text-[9px] font-black text-slate-600 uppercase tracking-widest">Subtotal</td>
          <td className="py-2 text-right font-black text-white">{totCPT.etiquetado.toLocaleString()}</td>
          <td className="py-2 text-right font-bold text-slate-500">{totCPT.huAbierto > 0 ? totCPT.huAbierto.toLocaleString() : '-'}</td>
          <td className="py-2 text-right font-black text-white">{totCPT.huCerrado.toLocaleString()}</td>
          <td className="py-2 text-right font-black text-orange-400 pr-4">{totCPT.pendiente > 0 ? totCPT.pendiente.toLocaleString() : '-'}</td>
          <td className="py-2 pl-6">
            <span className={`font-black text-xs ${bueno ? 'text-emerald-400' : 'text-orange-400'}`}>
              {totCPT.avance.toFixed(2)}%
            </span>
          </td>
          <td className="py-2 text-right font-bold text-slate-500 pl-6">{totCPT.huFinalizadas > 0 ? totCPT.huFinalizadas.toLocaleString() : '-'}</td>
          <td className="py-2 text-right font-bold text-slate-500">{totCPT.huEnDespacho > 0 ? totCPT.huEnDespacho.toLocaleString() : '-'}</td>
          <td className="py-2 text-right font-bold text-slate-500">{totCPT.despachado > 0 ? totCPT.despachado.toLocaleString() : '-'}</td>
          <td />
        </tr>
      )}
    </>
  );
};

// ── Página principal ──
const CutOff = ({ data }) => {
  if (!data) return null;
  const { tableData = [], totalesHU = {}, huStats = {} } = data;
  const tot = {
    etiquetado:    totalesHU.etiquetado    || 0,
    huAbierto:     totalesHU.huAbierto     || 0,
    huCerrado:     totalesHU.huCerrado     || 0,
    pendiente:     totalesHU.pendiente     || 0,
    huFinalizadas: totalesHU.huFinalizadas || 0,
    huEnDespacho:  totalesHU.huEnDespacho  || 0,
    despachado:    totalesHU.despachado    || 0,
    usuarios:      totalesHU.usuarios      || 0,
    avance:        totalesHU.avance        || 0,
  };
  const objetivo = huStats.objetivoHU || 99.7;
  const faltante = Math.max(Math.ceil((objetivo / 100) * tot.etiquetado) - tot.huCerrado, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* ── RESUMEN GLOBAL ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111827]/60 border border-white/5 rounded-2xl p-5 space-y-3">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Piezas</p>
          <p className="text-3xl font-black text-white italic">{tot.etiquetado.toLocaleString()}</p>
        </div>
        <div className="bg-[#111827]/60 border border-white/5 rounded-2xl p-5 space-y-2">
          <div className="flex justify-between"><span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Piezas HU Abierto</span><span className="text-sm font-black text-slate-300">{tot.huAbierto.toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Piezas HU Cerrado</span><span className="text-sm font-black text-slate-300">{tot.huCerrado.toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Piezas Pendientes</span><span className="text-sm font-black text-orange-400">{tot.pendiente.toLocaleString()}</span></div>
        </div>
        <div className={`rounded-2xl flex flex-col items-center justify-center border p-5 ${tot.avance >= objetivo ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-orange-500/10 border-orange-500/30'}`}>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Avance Global</p>
          <p className={`text-4xl font-black italic ${tot.avance >= objetivo ? 'text-emerald-400' : 'text-orange-400'}`}>{tot.avance.toFixed(2)}%</p>
          <p className="text-[9px] font-black text-slate-600 mt-2">Objetivo: {objetivo}%</p>
        </div>
        <div className="bg-[#111827]/60 border border-white/5 rounded-2xl p-5 space-y-2">
          <div className="flex justify-between"><span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">HUs Finalizados</span><span className="text-sm font-black text-slate-300">{tot.huFinalizadas.toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">HUs en Despacho</span><span className="text-sm font-black text-slate-300">{tot.huEnDespacho.toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">HUs Enviados</span><span className="text-sm font-black text-slate-300">{tot.despachado.toLocaleString()}</span></div>
          <div className="flex justify-between border-t border-white/5 pt-2 mt-1"><span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Faltante p/ {objetivo}%</span><span className={`text-sm font-black ${faltante === 0 ? 'text-emerald-400' : 'text-red-400'}`}>{faltante.toLocaleString()}</span></div>
        </div>
      </div>

      {/* ── TABLA POR CPT / ZONA ── */}
      <div className="bg-[#111827]/10 rounded-2xl border border-white/5 overflow-x-auto">
        <table className="w-full min-w-[800px] text-left">
          <thead>
            <tr className="text-[8px] font-black text-slate-600 uppercase tracking-[0.15em] border-b border-white/10">
              {/* ARMADO */}
              <th className="px-4 py-3">SUB-CA</th>
              <th className="py-3 text-right">Piezas Etiq.</th>
              <th className="py-3 text-right">Pzas HU Ab.</th>
              <th className="py-3 text-right">Pzas HU Cerr.</th>
              <th className="py-3 text-right pr-4">Pzas Pend.</th>
              <th className="py-3 pl-6">% Avance</th>
              {/* DESPACHO */}
              <th className="py-3 text-right pl-6 border-l border-white/5">HUs Final.</th>
              <th className="py-3 text-right">HUs Desp.</th>
              <th className="py-3 text-right">HUs Env.</th>
              <th className="py-3 text-center">Control</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map(({ cpt, zonas, totCPT }) => (
              <CPTBlock key={cpt} cpt={cpt} zonas={zonas} totCPT={totCPT} objetivo={objetivo} />
            ))}
          </tbody>
          {/* Total global */}
          <tfoot>
            <tr className="border-t border-white/10 bg-white/[0.03] text-[10px]">
              <td className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Global</td>
              <td className="py-3 text-right font-black text-white">{tot.etiquetado.toLocaleString()}</td>
              <td className="py-3 text-right font-bold text-slate-500">{tot.huAbierto > 0 ? tot.huAbierto.toLocaleString() : '-'}</td>
              <td className="py-3 text-right font-black text-white">{tot.huCerrado.toLocaleString()}</td>
              <td className="py-3 text-right font-black text-orange-400 pr-4">{tot.pendiente > 0 ? tot.pendiente.toLocaleString() : '-'}</td>
              <td className="py-3 pl-6">
                <span className={`font-black text-xs ${tot.avance >= objetivo ? 'text-emerald-400' : 'text-orange-400'}`}>
                  {tot.avance.toFixed(2)}%
                </span>
              </td>
              <td className="py-3 text-right font-bold text-slate-500 pl-6">{tot.huFinalizadas > 0 ? tot.huFinalizadas.toLocaleString() : '-'}</td>
              <td className="py-3 text-right font-bold text-slate-500">{tot.huEnDespacho > 0 ? tot.huEnDespacho.toLocaleString() : '-'}</td>
              <td className="py-3 text-right font-bold text-slate-500">{tot.despachado > 0 ? tot.despachado.toLocaleString() : '-'}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default CutOff;
