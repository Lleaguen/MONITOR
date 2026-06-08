import { useState } from 'react';
import { X, Zap, Package, Clock, TrendingUp, Truck } from 'lucide-react';
import { VELOCIDAD_OBJETIVO } from '../../../core/processors/darsenaProcessor.js';

const TIPO_LABEL = {
  chasis:    'Chasis',
  camioneta: 'Camioneta',
  semi:      'Semi',
  otro:      'Otro',
};

/* ── Modal de detalle ── */
const DetalleModal = ({ d, onClose }) => {
  if (!d) return null;

  const pctAvance = d.cantAnunciada
    ? Math.min(Math.round((d.piezasBipeadas / d.cantAnunciada) * 100), 100)
    : null;

  const velOk = d.velocidadActual >= VELOCIDAD_OBJETIVO;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* card */}
      <div
        className="relative z-10 w-full max-w-sm bg-[#0f1623] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-5 py-4 flex items-center justify-between ${velOk ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
          <div className="flex items-center gap-3">
            <span className={`text-2xl font-black ${velOk ? 'text-emerald-400' : 'text-red-400'}`}>
              D{d.doca}
            </span>
            {d.activa && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
              {TIPO_LABEL[d.tipo] || 'Otro'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Patente / descarga activa */}
        <div className="px-5 pt-4 pb-2">
          <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest font-black">
            <Truck size={11} />
            <span>Descargando</span>
          </div>
          <p className="text-white font-mono font-black text-sm mt-1">
            {d.patente || '—'}
          </p>
        </div>

        <div className="px-5 pb-5 space-y-3 mt-2">
          {/* Hora inicio */}
          <Row
            icon={<Clock size={12} />}
            label="Hora inicio"
            value={
              <span className="font-mono text-slate-200">
                {d.horaInicio} <span className="text-slate-500 font-normal">— Descargando</span>
              </span>
            }
          />

          {/* Cant anunciada en ED */}
          <Row
            icon={<Package size={12} />}
            label="Cant. anunciada (ED)"
            value={
              d.cantAnunciada != null
                ? <span className="font-black text-slate-200">{d.cantAnunciada.toLocaleString()} pzas</span>
                : <span className="text-slate-600">—</span>
            }
          />

          {/* Piezas bipeadas */}
          <Row
            icon={<Zap size={12} />}
            label="Piezas bipeadas"
            value={
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-200 text-base">{d.piezasBipeadas.toLocaleString()}</span>
                {pctAvance != null && (
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400">
                    {pctAvance}%
                  </span>
                )}
              </div>
            }
          />

          {/* Barra de progreso */}
          {pctAvance != null && (
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${pctAvance >= 90 ? 'bg-emerald-500' : pctAvance >= 50 ? 'bg-blue-500' : 'bg-slate-500'}`}
                style={{ width: `${pctAvance}%` }}
              />
            </div>
          )}

          {/* % Voluminoso */}
          <Row
            icon={<Package size={12} />}
            label="Voluminoso en descarga"
            value={
              <span className={`font-black ${d.pctVoluminoso >= 30 ? 'text-orange-400' : 'text-slate-400'}`}>
                {d.pctVoluminoso}%
              </span>
            }
          />

          {/* Velocidad */}
          <Row
            icon={<TrendingUp size={12} />}
            label="Velocidad actual"
            value={
              <div className="flex items-center gap-2">
                <span className={`font-black text-base ${velOk ? 'text-emerald-400' : 'text-red-400'}`}>
                  {d.velocidadActual.toLocaleString()}
                </span>
                <span className="text-slate-500 text-[10px]">pzas/hr</span>
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${velOk ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {velOk ? 'OK' : 'LENTA'}
                </span>
              </div>
            }
          />

          {/* Referencia velocidad */}
          <div className="mt-1 pt-3 border-t border-white/5 text-[9px] text-slate-600 font-black uppercase tracking-widest flex justify-between">
            <span>Objetivo: {VELOCIDAD_OBJETIVO} pzas/hr</span>
            <span>12 pzas/min</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Fila de detalle ── */
const Row = ({ icon, label, value }) => (
  <div className="flex items-start justify-between gap-4">
    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-black uppercase tracking-widest whitespace-nowrap">
      <span className="text-slate-600">{icon}</span>
      {label}
    </div>
    <div className="text-right text-[11px]">{value}</div>
  </div>
);

/* ── Cuadrado de dársena ── */
const DarsenaCuadrado = ({ d, onClick }) => {
  const velOk   = d.ok;
  const activa  = d.activa;

  let bg, border, textColor;
  if (!activa) {
    bg = 'bg-[#111827]/30';
    border = 'border-white/5';
    textColor = 'text-slate-600';
  } else if (velOk) {
    bg = 'bg-emerald-500/10';
    border = 'border-emerald-500/30';
    textColor = 'text-emerald-400';
  } else {
    bg = 'bg-red-500/10';
    border = 'border-red-500/30';
    textColor = 'text-red-400';
  }

  return (
    <button
      onClick={() => activa && onClick(d)}
      className={`
        relative flex flex-col items-center justify-center
        rounded-2xl border transition-all select-none
        w-full aspect-square min-w-[70px] max-w-[100px]
        ${bg} ${border}
        ${activa ? 'cursor-pointer hover:scale-105 hover:shadow-lg' : 'cursor-default opacity-40'}
      `}
    >
      {/* Pulso activa */}
      {activa && (
        <span className={`absolute top-2 right-2 w-2 h-2 rounded-full ${velOk ? 'bg-emerald-400 animate-pulse' : 'bg-red-400 animate-pulse'}`} />
      )}

      {/* Número de dársena */}
      <span className={`text-xl font-black leading-none ${textColor}`}>
        {d.doca}
      </span>

      {/* Velocidad */}
      {activa && (
        <span className={`text-[9px] font-black mt-1 ${textColor}`}>
          {d.velocidadActual >= 1000
            ? `${(d.velocidadActual / 1000).toFixed(1)}k`
            : d.velocidadActual}
          <span className="font-normal opacity-70"> /hr</span>
        </span>
      )}

      {/* Tipo */}
      <span className="text-[8px] font-black text-slate-600 uppercase tracking-wider mt-0.5">
        {TIPO_LABEL[d.tipo]?.slice(0, 3) || '?'}
      </span>
    </button>
  );
};

/* ── Vista principal ── */
const DarsenasAhora = ({ data }) => {
  const [selected, setSelected] = useState(null);

  const darsenas = data?.darsenasAhora || [];

  const activas = darsenas.filter(d => d.activa);
  const lentas  = activas.filter(d => !d.ok);
  const ok      = activas.filter(d => d.ok);

  // Agrupar por tipo para mostrar secciones
  const grupos = [
    { label: 'Semi', tipo: 'semi',      color: 'text-blue-400'    },
    { label: 'Chasis', tipo: 'chasis',  color: 'text-emerald-400' },
    { label: 'Camioneta', tipo: 'camioneta', color: 'text-yellow-400' },
    { label: 'Otro', tipo: 'otro',      color: 'text-slate-400'   },
  ].map(g => ({
    ...g,
    items: darsenas.filter(d => d.tipo === g.tipo),
  })).filter(g => g.items.length > 0);

  return (
    <div className="space-y-6">
      {/* KPIs rápidos */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#111827]/40 border border-white/5 rounded-xl px-4 py-3 text-center">
          <p className="text-emerald-400 font-black text-2xl">{activas.length}</p>
          <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mt-0.5">Activas</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-center">
          <p className="text-emerald-400 font-black text-2xl">{ok.length}</p>
          <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mt-0.5">OK ≥{VELOCIDAD_OBJETIVO}</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-center">
          <p className="text-red-400 font-black text-2xl">{lentas.length}</p>
          <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mt-0.5">Lentas</p>
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap gap-4 text-[9px] font-black uppercase tracking-widest text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/30" />
          OK ≥ {VELOCIDAD_OBJETIVO} pzas/hr
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-red-500/20 border border-red-500/30" />
          Lenta &lt; {VELOCIDAD_OBJETIVO} pzas/hr
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-white/5 border border-white/5 opacity-40" />
          Inactiva
        </span>
        <span className="ml-auto text-slate-600">Clic para ver detalle</span>
      </div>

      {/* Grillas por sector */}
      {grupos.map(g => (
        <div key={g.tipo}>
          <h3 className={`text-[9px] font-black uppercase tracking-[0.2em] mb-3 ${g.color}`}>
            {g.label} ({g.items.filter(d => d.activa).length} activas)
          </h3>
          <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))' }}>
            {g.items.map(d => (
              <DarsenaCuadrado key={d.doca} d={d} onClick={setSelected} />
            ))}
          </div>
        </div>
      ))}

      {darsenas.length === 0 && (
        <div className="text-center py-16 text-slate-600 font-black text-[11px] uppercase tracking-widest">
          Sin datos de dársenas
        </div>
      )}

      {/* Modal */}
      {selected && (
        <DetalleModal d={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
};

export default DarsenasAhora;
