import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import PageWrapper from '../../../shared/components/PageWrapper.jsx';
import StatCard from '../../../shared/components/StatCard.jsx';
import { VELOCIDAD_OBJETIVO } from '../../../core/processors/darsenaProcessor.js';

const TIPO_COLORS = {
  chasis:    { text: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Chasis'    },
  camioneta: { text: 'text-[#ffab00]',   bg: 'bg-yellow-500/10',  label: 'Camioneta' },
  semi:      { text: 'text-blue-400',    bg: 'bg-blue-500/10',    label: 'Semi'      },
  otro:      { text: 'text-slate-400',   bg: 'bg-slate-500/10',   label: 'Otro'      },
};

const VelBadge = ({ velocidad }) => {
  const ok = velocidad >= VELOCIDAD_OBJETIVO;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[9px] font-black px-2 py-0.5 rounded-full ${ok ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-emerald-400' : 'bg-red-400'}`} />
      {velocidad.toLocaleString()} pzas/hr
    </span>
  );
};

/* ── Card mobile ── */
const DarsenaCard = ({ d }) => {
  const [open, setOpen] = useState(false);
  const color = TIPO_COLORS[d.tipo] || TIPO_COLORS.otro;
  return (
    <div className={`rounded-xl border border-white/5 bg-[#111827]/30 overflow-hidden ${!d.activa ? 'opacity-50' : ''}`}>
      <button className="w-full text-left px-4 py-3 flex items-center gap-3" onClick={() => setOpen(o => !o)}>
        <span className="text-slate-500">{open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}</span>
        <span className="font-black text-white text-sm flex-1">{d.doca}</span>
        {d.activa && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${color.bg} ${color.text}`}>{color.label}</span>
      </button>
      <div className="px-4 pb-3 grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
        <div className="flex justify-between">
          <span className="text-slate-500">Piezas</span>
          <span className="font-black text-slate-300">{d.piezas.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Patentes</span>
          <span className="font-black text-slate-400">{d.patentes.length}</span>
        </div>
        <div className="flex justify-between col-span-2">
          <span className="text-slate-500">Velocidad</span>
          <VelBadge velocidad={d.velocidad} />
        </div>
        <div className="flex justify-between col-span-2">
          <span className="text-slate-500">Últ. hora</span>
          <VelBadge velocidad={d.velUltimaHora} />
        </div>
        <div className="flex justify-between col-span-2">
          <span className="text-slate-500">Rango</span>
          <span className="font-mono text-slate-500">{d.primerBipeo} – {d.ultimoBipeo}</span>
        </div>
      </div>
      {open && d.patentes.length > 0 && (
        <div className="border-t border-white/5 px-4 py-2 space-y-1">
          {d.patentes.map((p, i) => (
            <div key={i} className="flex items-center justify-between text-[10px]">
              <span className="font-mono font-black text-slate-400">{p.patente || '—'}</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-600">{p.piezas.toLocaleString()} pzas</span>
                <VelBadge velocidad={p.velocidad} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Row desktop ── */
const DarsenaRow = ({ d }) => {
  const [open, setOpen] = useState(false);
  const color = TIPO_COLORS[d.tipo] || TIPO_COLORS.otro;
  return (
    <>
      <tr
        className={`border-b border-white/5 text-[11px] cursor-pointer transition-colors ${d.activa ? 'hover:bg-white/5' : 'opacity-50 hover:opacity-70'}`}
        onClick={() => setOpen(o => !o)}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">{open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}</span>
            <span className="font-black text-white">{d.doca}</span>
            {d.activa && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
          </div>
        </td>
        <td className="py-3">
          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${color.bg} ${color.text}`}>{color.label}</span>
        </td>
        <td className="py-3 text-right font-black text-slate-300">{d.piezas.toLocaleString()}</td>
        <td className="py-3 text-right"><VelBadge velocidad={d.velocidad} /></td>
        <td className="py-3 text-center font-mono text-[10px] text-slate-500">{d.primerBipeo} – {d.ultimoBipeo}</td>
        <td className="py-3 text-center"><VelBadge velocidad={d.velUltimaHora} /></td>
        <td className="py-3 text-center text-[10px] text-slate-600">{d.patentes.length}</td>
      </tr>
      {open && d.patentes.map((p, i) => (
        <tr key={i} className="border-b border-white/[0.03] text-[10px] bg-white/[0.01]">
          <td className="pl-12 pr-4 py-2 font-black text-slate-400 font-mono">{p.patente || '—'}</td>
          <td className="py-2 text-[9px] text-slate-600">patente</td>
          <td className="py-2 text-right font-black text-slate-400">{p.piezas.toLocaleString()}</td>
          <td className="py-2 text-right"><VelBadge velocidad={p.velocidad} /></td>
          <td className="py-2 text-center font-mono text-[10px] text-slate-600">{p.primerBipeo} – {p.ultimoBipeo}</td>
          <td /><td />
        </tr>
      ))}
    </>
  );
};

const TIPOS = ['todos', 'chasis', 'camioneta', 'semi'];

const VelocidadDarsenas = ({ data }) => {
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [soloActivas, setSoloActivas] = useState(false);

  const darsenas = data?.darsenaStats || [];

  const filtradas = darsenas.filter(d => {
    if (soloActivas && !d.activa) return false;
    if (filtroTipo !== 'todos' && d.tipo !== filtroTipo) return false;
    return true;
  });

  const activas  = darsenas.filter(d => d.activa).length;
  const ok       = darsenas.filter(d => d.ok).length;
  const lentas   = darsenas.filter(d => !d.ok && d.activa).length;
  const totalPzs = darsenas.reduce((a, d) => a + d.piezas, 0);

  return (
    <PageWrapper>
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Dársenas activas" value={activas}                    color="emerald" />
        <StatCard label="Velocidad OK"      value={ok}      sub={`≥${VELOCIDAD_OBJETIVO} pzas/hr`} color="emerald" />
        <StatCard label="Velocidad lenta"   value={lentas}  sub="activas"     color="red"     />
        <StatCard label="Total piezas"      value={totalPzs.toLocaleString()} />
      </div>

      {/* Referencia */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-2 bg-[#111827]/40 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500">
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> OK ≥ {VELOCIDAD_OBJETIVO} pzas/hr</span>
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Lento &lt; {VELOCIDAD_OBJETIVO} pzas/hr</span>
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Activa (&lt;10 min)</span>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 items-center">
        {TIPOS.map(t => (
          <button key={t} onClick={() => setFiltroTipo(t)}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              filtroTipo === t ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'
            }`}>
            {t === 'todos' ? 'Todos' : TIPO_COLORS[t]?.label}
          </button>
        ))}
        <button onClick={() => setSoloActivas(v => !v)}
          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ml-auto ${
            soloActivas ? 'bg-emerald-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'
          }`}>
          Solo activas
        </button>
      </div>

      {/* Mobile: cards */}
      <div className="flex flex-col gap-3 sm:hidden">
        {filtradas.map(d => <DarsenaCard key={d.doca} d={d} />)}
        {filtradas.length === 0 && (
          <div className="text-center py-12 text-slate-600 font-black text-[11px] uppercase tracking-widest">
            Sin dársenas con datos
          </div>
        )}
      </div>

      {/* Desktop: tabla */}
      <div className="hidden sm:block bg-[#111827]/10 rounded-2xl border border-white/5 overflow-x-auto">
        <table className="w-full min-w-[600px] text-left">
          <thead>
            <tr className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] border-b border-white/10">
              <th className="px-4 py-3">Dársena</th>
              <th className="py-3">Tipo</th>
              <th className="py-3 text-right">Piezas</th>
              <th className="py-3 text-right">Velocidad</th>
              <th className="py-3 text-center">Rango horario</th>
              <th className="py-3 text-center">Últ. hora</th>
              <th className="py-3 text-center">Patentes</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.map(d => <DarsenaRow key={d.doca} d={d} />)}
          </tbody>
        </table>
        {filtradas.length === 0 && (
          <div className="text-center py-12 text-slate-600 font-black text-[11px] uppercase tracking-widest">
            Sin dársenas con datos
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default VelocidadDarsenas;
