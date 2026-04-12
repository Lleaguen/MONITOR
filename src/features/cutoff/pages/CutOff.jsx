import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Camera } from 'lucide-react';
import StatCard from '../../../shared/components/StatCard';
import ProgressBar from '../../../shared/components/ProgressBar';
import PageWrapper from '../../../shared/components/PageWrapper';

// ── Fila de zona dentro de un CPT ──
const ZonaRow = ({ z, objetivo }) => {
  const controlOk = z.pendiente === 0;
  return (
    <tr className="border-b border-white/[0.03] text-[10px] hover:bg-white/[0.02] transition-colors">
      <td className="pl-10 pr-4 py-3 font-black text-slate-400">{z.zona}</td>
      <td className="py-3 text-right font-black text-slate-300">{z.etiquetado.toLocaleString()}</td>
      <td className="py-3 text-right font-bold text-slate-500">{z.huAbierto > 0 ? z.huAbierto.toLocaleString() : '-'}</td>
      <td className="py-3 text-right font-black text-slate-300">{z.huCerrado.toLocaleString()}</td>
      <td className="py-3 text-right font-black text-orange-400">{z.pendiente > 0 ? z.pendiente.toLocaleString() : '-'}</td>
      <td className="py-3 pl-6 w-44">
        <ProgressBar value={z.avance} threshold={objetivo} />
      </td>
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
      <tr className="border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setOpen(o => !o)}>
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
      {open && zonas.map((z, i) => <ZonaRow key={i} z={z} objetivo={objetivo} />)}
      {open && (
        <tr className="border-b border-white/10 bg-white/[0.02] text-[10px]">
          <td className="pl-10 pr-4 py-2 text-[9px] font-black text-slate-600 uppercase tracking-widest">Subtotal</td>
          <td className="py-2 text-right font-black text-white">{totCPT.etiquetado.toLocaleString()}</td>
          <td className="py-2 text-right font-bold text-slate-500">{totCPT.huAbierto > 0 ? totCPT.huAbierto.toLocaleString() : '-'}</td>
          <td className="py-2 text-right font-black text-white">{totCPT.huCerrado.toLocaleString()}</td>
          <td className="py-2 text-right font-black text-orange-400 pr-4">{totCPT.pendiente > 0 ? totCPT.pendiente.toLocaleString() : '-'}</td>
          <td className="py-2 pl-6">
            <span className={`font-black text-xs ${bueno ? 'text-emerald-400' : 'text-orange-400'}`}>{totCPT.avance.toFixed(2)}%</span>
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

// ── Modal Cierre de HU ──
const CierreModal = ({ data, onClose }) => {
  const { tableData = [], totalesHU = {}, huStats = {} } = data;
  const tot = {
    etiquetado:    totalesHU.etiquetado    || 0,
    huAbierto:     totalesHU.huAbierto     || 0,
    huCerrado:     totalesHU.huCerrado     || 0,
    pendiente:     totalesHU.pendiente     || 0,
    huFinalizadas: totalesHU.huFinalizadas || 0,
    huEnDespacho:  totalesHU.huEnDespacho  || 0,
    despachado:    totalesHU.despachado    || 0,
    avance:        totalesHU.avance        || 0,
  };
  const objetivo = huStats.objetivoHU || 99.7;
  const faltante = Math.max(Math.ceil((objetivo / 100) * tot.etiquetado) - tot.huCerrado, 0);
  const now = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#080c14] border border-white/10 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto flex flex-col">

        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 sticky top-0 bg-[#080c14] z-10">
          <div>
            <h2 className="text-[11px] font-black text-white uppercase tracking-widest">Cierre de HU</h2>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{now} hs</p>
          </div>
          <button onClick={onClose}
            className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-all">
            Cerrar
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* KPIs compactos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#111827]/60 border border-white/5 rounded-xl p-3 space-y-1.5">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Total Piezas</p>
              <p className="text-lg font-black text-white">{tot.etiquetado.toLocaleString()}</p>
            </div>
            <div className={`bg-[#111827]/60 border rounded-xl p-3 space-y-1.5 ${tot.avance >= objetivo ? 'border-emerald-500/20' : 'border-orange-500/20'}`}>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Avance Global</p>
              <p className={`text-lg font-black ${tot.avance >= objetivo ? 'text-emerald-400' : 'text-orange-400'}`}>{tot.avance.toFixed(2)}%</p>
              <p className="text-[8px] text-slate-600 font-bold">Obj: {objetivo}%</p>
            </div>
            <div className="bg-[#111827]/60 border border-white/5 rounded-xl p-3 space-y-1">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Armado</p>
              <div className="flex justify-between"><span className="text-[8px] text-slate-600">Abierto</span><span className="text-[10px] font-black text-slate-300">{tot.huAbierto.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-[8px] text-slate-600">Cerrado</span><span className="text-[10px] font-black text-slate-300">{tot.huCerrado.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-[8px] text-slate-600">Pendiente</span><span className="text-[10px] font-black text-orange-400">{tot.pendiente.toLocaleString()}</span></div>
            </div>
            <div className="bg-[#111827]/60 border border-white/5 rounded-xl p-3 space-y-1">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Despacho</p>
              <div className="flex justify-between"><span className="text-[8px] text-slate-600">Finalizados</span><span className="text-[10px] font-black text-slate-300">{tot.huFinalizadas.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-[8px] text-slate-600">En Despacho</span><span className="text-[10px] font-black text-slate-300">{tot.huEnDespacho.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-[8px] text-slate-600">Enviados</span><span className="text-[10px] font-black text-slate-300">{tot.despachado.toLocaleString()}</span></div>
              <div className="flex justify-between border-t border-white/5 pt-1 mt-1">
                <span className="text-[8px] text-slate-600">Faltante p/{objetivo}%</span>
                <span className={`text-[10px] font-black ${faltante === 0 ? 'text-emerald-400' : 'text-red-400'}`}>{faltante.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Tabla compacta por CPT */}
          <div className="overflow-x-auto rounded-xl border border-white/5">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="text-[8px] font-black text-slate-600 uppercase tracking-[0.15em] border-b border-white/10 bg-[#111827]/40">
                  <th className="px-3 py-2">CPT</th>
                  <th className="py-2 text-right">Etiq.</th>
                  <th className="py-2 text-right">HU Ab.</th>
                  <th className="py-2 text-right">HU Cerr.</th>
                  <th className="py-2 text-right">Pend.</th>
                  <th className="py-2 pl-3">% Av.</th>
                  <th className="py-2 text-right border-l border-white/5 pl-3">Final.</th>
                  <th className="py-2 text-right">Desp.</th>
                  <th className="py-2 text-right">Env.</th>
                  <th className="py-2 text-center">Ctrl</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map(({ cpt, totCPT }) => {
                  const bueno = totCPT.avance >= objetivo;
                  const ctrl  = totCPT.pendiente === 0;
                  return (
                    <tr key={cpt} className="border-b border-white/[0.03] text-[9px] hover:bg-white/[0.02]">
                      <td className="px-3 py-2 font-black text-blue-400 italic">{cpt}</td>
                      <td className="py-2 text-right font-black text-slate-300">{totCPT.etiquetado.toLocaleString()}</td>
                      <td className="py-2 text-right text-slate-500">{totCPT.huAbierto > 0 ? totCPT.huAbierto.toLocaleString() : '-'}</td>
                      <td className="py-2 text-right font-black text-slate-300">{totCPT.huCerrado.toLocaleString()}</td>
                      <td className="py-2 text-right font-black text-orange-400">{totCPT.pendiente > 0 ? totCPT.pendiente.toLocaleString() : '-'}</td>
                      <td className="py-2 pl-3">
                        <span className={`font-black text-[9px] ${bueno ? 'text-emerald-400' : 'text-orange-400'}`}>{totCPT.avance.toFixed(1)}%</span>
                      </td>
                      <td className="py-2 text-right text-slate-500 border-l border-white/5 pl-3">{totCPT.huFinalizadas > 0 ? totCPT.huFinalizadas.toLocaleString() : '-'}</td>
                      <td className="py-2 text-right text-slate-500">{totCPT.huEnDespacho > 0 ? totCPT.huEnDespacho.toLocaleString() : '-'}</td>
                      <td className="py-2 text-right text-slate-500">{totCPT.despachado > 0 ? totCPT.despachado.toLocaleString() : '-'}</td>
                      <td className="py-2 text-center">
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${ctrl ? 'text-emerald-400 bg-emerald-500/10' : 'text-orange-400 bg-orange-500/10'}`}>
                          {ctrl ? 'OK' : 'PEND'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-white/10 bg-white/[0.03] text-[9px]">
                  <td className="px-3 py-2 font-black text-slate-400 uppercase">Total</td>
                  <td className="py-2 text-right font-black text-white">{tot.etiquetado.toLocaleString()}</td>
                  <td className="py-2 text-right text-slate-500">{tot.huAbierto > 0 ? tot.huAbierto.toLocaleString() : '-'}</td>
                  <td className="py-2 text-right font-black text-white">{tot.huCerrado.toLocaleString()}</td>
                  <td className="py-2 text-right font-black text-orange-400">{tot.pendiente > 0 ? tot.pendiente.toLocaleString() : '-'}</td>
                  <td className="py-2 pl-3">
                    <span className={`font-black text-[9px] ${tot.avance >= objetivo ? 'text-emerald-400' : 'text-orange-400'}`}>{tot.avance.toFixed(2)}%</span>
                  </td>
                  <td className="py-2 text-right text-slate-500 border-l border-white/5 pl-3">{tot.huFinalizadas > 0 ? tot.huFinalizadas.toLocaleString() : '-'}</td>
                  <td className="py-2 text-right text-slate-500">{tot.huEnDespacho > 0 ? tot.huEnDespacho.toLocaleString() : '-'}</td>
                  <td className="py-2 text-right text-slate-500">{tot.despachado > 0 ? tot.despachado.toLocaleString() : '-'}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Página principal ──
const CutOff = ({ data }) => {
  if (!data) return null;
  const [cierreOpen, setCierreOpen] = useState(false);
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
    <PageWrapper>
      {cierreOpen && <CierreModal data={data} onClose={() => setCierreOpen(false)} />}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Piezas" value={tot.etiquetado.toLocaleString()} />
        <div className="bg-[#111827]/60 border border-white/5 rounded-2xl p-5 space-y-2">
          <div className="flex justify-between"><span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Piezas HU Abierto</span><span className="text-sm font-black text-slate-300">{tot.huAbierto.toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Piezas HU Cerrado</span><span className="text-sm font-black text-slate-300">{tot.huCerrado.toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Piezas Pendientes</span><span className="text-sm font-black text-orange-400">{tot.pendiente.toLocaleString()}</span></div>
        </div>
        <StatCard
          label="Avance Global"
          value={`${tot.avance.toFixed(2)}%`}
          sub={`Objetivo: ${objetivo}%`}
          color={tot.avance >= objetivo ? 'emerald' : 'orange'}
        />
        <div className="bg-[#111827]/60 border border-white/5 rounded-2xl p-5 space-y-2">
          <div className="flex justify-between"><span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">HUs Finalizados</span><span className="text-sm font-black text-slate-300">{tot.huFinalizadas.toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">HUs en Despacho</span><span className="text-sm font-black text-slate-300">{tot.huEnDespacho.toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">HUs Enviados</span><span className="text-sm font-black text-slate-300">{tot.despachado.toLocaleString()}</span></div>
          <div className="flex justify-between border-t border-white/5 pt-2 mt-1"><span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Faltante p/ {objetivo}%</span><span className={`text-sm font-black ${faltante === 0 ? 'text-emerald-400' : 'text-red-400'}`}>{faltante.toLocaleString()}</span></div>
        </div>
      </div>

      {/* Botón Cierre de HU */}
      <div className="flex justify-end">
        <button onClick={() => setCierreOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest transition-all">
          <Camera size={14} />
          Cierre de HU
        </button>
      </div>

      {/* ── TABLA POR CPT / ZONA ── */}
      <div className="bg-[#111827]/10 rounded-2xl border border-white/5 overflow-x-auto">
        <table className="w-full min-w-[800px] text-left">
          <thead>
            <tr className="text-[8px] font-black text-slate-600 uppercase tracking-[0.15em] border-b border-white/10">
              <th className="px-4 py-3">SUB-CA</th>
              <th className="py-3 text-right">Piezas Etiq.</th>
              <th className="py-3 text-right">Pzas HU Ab.</th>
              <th className="py-3 text-right">Pzas HU Cerr.</th>
              <th className="py-3 text-right pr-4">Pzas Pend.</th>
              <th className="py-3 pl-6">% Avance</th>
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
    </PageWrapper>
  );
};

export default CutOff;
