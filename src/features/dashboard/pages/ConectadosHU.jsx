import React, { useState, useMemo } from 'react';
import dayjs from 'dayjs';

// ── Colores por CPT ──────────────────────────────────────────────────────────
const CPT_COLORS = {
  '0:00':  { bg: 'bg-red-900/30',     border: 'border-red-500/40',    text: 'text-red-300',    badge: 'bg-red-500/20 text-red-300',    dot: 'bg-red-400',    stroke: '#f87171', fill: 'rgba(248,113,113,0.15)' },
  '1:00':  { bg: 'bg-pink-900/30',    border: 'border-pink-500/40',   text: 'text-pink-300',   badge: 'bg-pink-500/20 text-pink-300',   dot: 'bg-pink-400',   stroke: '#f472b6', fill: 'rgba(244,114,182,0.15)' },
  '2:00':  { bg: 'bg-orange-900/30',  border: 'border-orange-500/40', text: 'text-orange-300', badge: 'bg-orange-500/20 text-orange-300',dot: 'bg-orange-400', stroke: '#fb923c', fill: 'rgba(251,146,60,0.15)'  },
  '3:00':  { bg: 'bg-yellow-900/30',  border: 'border-yellow-500/40', text: 'text-yellow-300', badge: 'bg-yellow-500/20 text-yellow-300',dot: 'bg-yellow-400', stroke: '#facc15', fill: 'rgba(250,204,21,0.15)'  },
  '4:00':  { bg: 'bg-lime-900/30',    border: 'border-lime-500/40',   text: 'text-lime-300',   badge: 'bg-lime-500/20 text-lime-300',   dot: 'bg-lime-400',   stroke: '#a3e635', fill: 'rgba(163,230,53,0.15)'  },
  '5:00':  { bg: 'bg-green-900/30',   border: 'border-green-500/40',  text: 'text-green-300',  badge: 'bg-green-500/20 text-green-300', dot: 'bg-green-400',  stroke: '#4ade80', fill: 'rgba(74,222,128,0.15)'  },
  '6:00':  { bg: 'bg-teal-900/30',    border: 'border-teal-500/40',   text: 'text-teal-300',   badge: 'bg-teal-500/20 text-teal-300',   dot: 'bg-teal-400',   stroke: '#2dd4bf', fill: 'rgba(45,212,191,0.15)'  },
  '7:00':  { bg: 'bg-cyan-900/30',    border: 'border-cyan-500/40',   text: 'text-cyan-300',   badge: 'bg-cyan-500/20 text-cyan-300',   dot: 'bg-cyan-400',   stroke: '#22d3ee', fill: 'rgba(34,211,238,0.15)'  },
  '8:00':  { bg: 'bg-sky-900/30',     border: 'border-sky-500/40',    text: 'text-sky-300',    badge: 'bg-sky-500/20 text-sky-300',     dot: 'bg-sky-400',    stroke: '#38bdf8', fill: 'rgba(56,189,248,0.15)'  },
  '9:00':  { bg: 'bg-blue-900/30',    border: 'border-blue-500/40',   text: 'text-blue-300',   badge: 'bg-blue-500/20 text-blue-300',   dot: 'bg-blue-400',   stroke: '#60a5fa', fill: 'rgba(96,165,250,0.15)'  },
  '10:00': { bg: 'bg-indigo-900/30',  border: 'border-indigo-500/40', text: 'text-indigo-300', badge: 'bg-indigo-500/20 text-indigo-300',dot: 'bg-indigo-400', stroke: '#818cf8', fill: 'rgba(129,140,248,0.15)' },
  '11:00': { bg: 'bg-violet-900/30',  border: 'border-violet-500/40', text: 'text-violet-300', badge: 'bg-violet-500/20 text-violet-300',dot: 'bg-violet-400', stroke: '#a78bfa', fill: 'rgba(167,139,250,0.15)' },
  '12:00': { bg: 'bg-purple-900/30',  border: 'border-purple-500/40', text: 'text-purple-300', badge: 'bg-purple-500/20 text-purple-300',dot: 'bg-purple-400', stroke: '#c084fc', fill: 'rgba(192,132,252,0.15)' },
  '13:00': { bg: 'bg-fuchsia-900/30', border: 'border-fuchsia-500/40',text: 'text-fuchsia-300',badge: 'bg-fuchsia-500/20 text-fuchsia-300',dot:'bg-fuchsia-400',stroke: '#e879f9', fill: 'rgba(232,121,249,0.15)' },
};
const getCptColor = (cpt) => CPT_COLORS[cpt] ?? {
  bg: 'bg-slate-800/40', border: 'border-slate-600/40', text: 'text-slate-300',
  badge: 'bg-slate-600/20 text-slate-300', dot: 'bg-slate-400', stroke: '#94a3b8', fill: 'rgba(148,163,184,0.15)',
};

const MINUTOS_PRESET = [5, 10, 15, 20, 30];

const horasHasta = (h) => Math.max(dayjs().hour(h).minute(0).second(0).diff(dayjs(), 'hour', true), 0.1);

// ── Selector de ventana ──────────────────────────────────────────────────────
const VentanaSelector = ({ ventana, onChange }) => {
  const [customVal, setCustomVal] = useState('');
  const [editando,  setEditando]  = useState(false);

  const aplicar = () => {
    const v = parseInt(customVal, 10);
    if (v > 0 && v <= 480) { onChange(v); setEditando(false); }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Ventana</span>
      <div className="flex items-center gap-1 bg-[#111827] border border-white/8 rounded-xl p-1">
        {MINUTOS_PRESET.map(m => (
          <button key={m} onClick={() => { onChange(m); setEditando(false); }}
            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all ${
              ventana === m && !editando
                ? 'bg-blue-600/25 text-blue-400 border border-blue-500/25'
                : 'text-slate-500 hover:text-slate-300'
            }`}>
            {m}m
          </button>
        ))}
        {editando ? (
          <div className="flex items-center gap-1 pl-1">
            <input autoFocus type="number" min="1" max="480" value={customVal}
              onChange={e => setCustomVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') aplicar(); if (e.key === 'Escape') setEditando(false); }}
              className="w-12 bg-[#0d1420] border border-blue-500/30 rounded-lg text-[10px] text-blue-300 font-black text-center py-1.5 px-1 outline-none"
              placeholder="min" />
            <button onClick={aplicar}              className="text-[9px] font-black text-blue-400 px-1.5 py-1.5 rounded-lg bg-blue-600/15 border border-blue-500/20">OK</button>
            <button onClick={() => setEditando(false)} className="text-[9px] font-black text-slate-500 px-1.5 py-1.5 rounded-lg">✕</button>
          </div>
        ) : (
          <button onClick={() => { setEditando(true); setCustomVal(String(ventana)); }}
            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all ${
              !MINUTOS_PRESET.includes(ventana)
                ? 'bg-blue-600/25 text-blue-400 border border-blue-500/25'
                : 'text-slate-500 hover:text-slate-300'
            }`}>
            {!MINUTOS_PRESET.includes(ventana) ? `${ventana}m` : '···'}
          </button>
        )}
      </div>
    </div>
  );
};

// ── ZonaCard — limpia, sin sparkline ─────────────────────────────────────────
const ZonaCard = ({ zona, detalleUsuarios, zonaData }) => {
  const [expanded, setExpanded] = useState(false);
  const total      = detalleUsuarios.length;
  const paqueteria = detalleUsuarios.filter(u => u.tipoPosicion === 'PAQUETERIA').length;
  const voluminoso = detalleUsuarios.filter(u => u.tipoPosicion === 'VOLUMINOSO').length;
  const totalPiezas = zonaData?.etiquetado ?? 0;
  const avance      = zonaData?.avance ?? 0;

  return (
    <div
      onClick={() => setExpanded(e => !e)}
      className="bg-[#0d1420]/70 border border-white/8 rounded-lg p-2.5 cursor-pointer hover:border-white/20 transition-all select-none"
    >
      {/* Nombre + conectados */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black tracking-widest text-white uppercase">{zona}</span>
        <span className={`text-[12px] font-black tabular-nums leading-none ${total > 0 ? 'text-green-400' : 'text-slate-700'}`}>
          {total}
        </span>
      </div>

      {/* Piezas + avance */}
      <div className="flex items-center justify-between mt-1">
        <span className="text-[9px] text-slate-400 tabular-nums">
          {totalPiezas > 0 ? <><span className="text-slate-200 font-bold">{totalPiezas.toLocaleString('es-AR')}</span> pzs</> : <span className="text-slate-700">—</span>}
        </span>
        {totalPiezas > 0 && (
          <span className={`text-[9px] font-black tabular-nums ${avance >= 80 ? 'text-green-400' : avance >= 50 ? 'text-yellow-400' : 'text-slate-500'}`}>
            {avance}%
          </span>
        )}
      </div>

      {/* Pills PAQ / VOL */}
      {(paqueteria > 0 || voluminoso > 0) && (
        <div className="flex gap-1 mt-1.5">
          {paqueteria > 0 && <span className="text-[8px] font-black bg-blue-500/15 text-blue-300 px-1.5 py-0.5 rounded">PAQ {paqueteria}</span>}
          {voluminoso > 0 && <span className="text-[8px] font-black bg-amber-500/15 text-amber-300 px-1.5 py-0.5 rounded">VOL {voluminoso}</span>}
        </div>
      )}

      {/* Detalle expandido */}
      {expanded && detalleUsuarios.length > 0 && (
        <div className="mt-2 pt-2 border-t border-white/5 space-y-0.5">
          {detalleUsuarios.map((u, i) => (
            <div key={i} className="flex items-center justify-between gap-1">
              <span className="text-[8px] text-white truncate">{u.usr}</span>
              <div className="flex items-center gap-1 shrink-0">
                {u.pos && <span className="text-[7px] text-slate-300 font-mono">{u.pos}</span>}
                {u.tipoPosicion && (
                  <span className={`text-[7px] font-black px-1 py-0.5 rounded ${
                    u.tipoPosicion === 'PAQUETERIA' ? 'bg-blue-500/20 text-blue-200' : 'bg-amber-500/20 text-amber-200'
                  }`}>
                    {u.tipoPosicion === 'PAQUETERIA' ? 'PAQ' : 'VOL'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── CPTBlock ─────────────────────────────────────────────────────────────────
const CPTBlock = ({ cptEntry, detalleMap, horaInicioHU }) => {
  const { cpt, zonas } = cptEntry;
  const col = getCptColor(cpt);

  const totalConectados = new Set(zonas.flatMap(z => (detalleMap[z.zona] || []).map(u => u.usr))).size;
  const totalPiezas     = zonas.reduce((s, z) => s + (z.etiquetado || 0), 0);

  return (
    <div className={`rounded-xl border ${col.border} ${col.bg} p-3`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${col.dot}`} />
          <span className={`text-[11px] font-black tracking-widest uppercase ${col.text}`}>CPT {cpt}</span>
          <span className="text-[10px] text-slate-400 tabular-nums">
            <span className="text-white font-bold">{totalPiezas.toLocaleString('es-AR')}</span> pzs
          </span>
        </div>
        <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg ${col.badge}`}>
          {totalConectados} conectados
        </span>
      </div>

      {/* Zonas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
        {zonas.map(z => (
          <ZonaCard
            key={z.zona}
            zona={z.zona}
            detalleUsuarios={detalleMap[z.zona] || []}
            zonaData={z}
          />
        ))}
      </div>
    </div>
  );
};

// ── Pestaña Productividad ─────────────────────────────────────────────────────
const TabProductividad = ({ bipeoPorHoraArray, tableData, horaInicioHU }) => {
  const activas = (bipeoPorHoraArray ?? []).filter(h => h.bipeos > 0);
  if (activas.length === 0) return (
    <div className="flex items-center justify-center h-40 text-slate-600 text-sm">Sin datos de bipeos por hora</div>
  );

  const maxVal  = Math.max(...activas.map(h => h.bipeos));
  const total   = activas.reduce((s, h) => s + h.bipeos, 0);
  const promedio = Math.round(total / activas.length);
  const horaPico = activas.reduce((a, b) => b.bipeos > a.bipeos ? b : a).hora;

  // Gráfico SVG de barras verticales
  const W = 600, H = 160, PAD_L = 48, PAD_B = 28, PAD_T = 12, PAD_R = 16;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;
  const n      = activas.length;
  const barW   = Math.max(Math.floor(chartW / n) - 4, 6);

  // Líneas de referencia (0, 25%, 50%, 75%, 100%)
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(pct => ({
    y:   PAD_T + (1 - pct) * chartH,
    val: Math.round(pct * maxVal),
  }));

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total bipeos', value: total.toLocaleString('es-AR'), color: 'text-blue-300' },
          { label: 'Promedio / hora', value: promedio.toLocaleString('es-AR'), color: 'text-white' },
          { label: 'Hora pico', value: horaPico, color: 'text-green-400' },
        ].map(k => (
          <div key={k.label} className="bg-[#0d1420]/60 border border-white/8 rounded-xl p-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">{k.label}</p>
            <p className={`text-2xl font-black tabular-nums ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Gráfico de barras */}
      <div className="bg-[#0d1420]/60 border border-white/8 rounded-xl p-4 overflow-x-auto">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3">Bipeos HU por hora</p>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ minWidth: 340 }}>
          {/* Grid lines */}
          {gridLines.map(g => (
            <g key={g.y}>
              <line x1={PAD_L} y1={g.y} x2={W - PAD_R} y2={g.y} stroke="#1e293b" strokeWidth="1" />
              <text x={PAD_L - 6} y={g.y + 4} textAnchor="end" fontSize="9" fill="#475569">{g.val.toLocaleString('es-AR')}</text>
            </g>
          ))}
          {/* Eje X */}
          <line x1={PAD_L} y1={PAD_T + chartH} x2={W - PAD_R} y2={PAD_T + chartH} stroke="#334155" strokeWidth="1" />

          {/* Barras */}
          {activas.map((h, i) => {
            const x   = PAD_L + (i / n) * chartW + (chartW / n - barW) / 2;
            const pct = h.bipeos / maxVal;
            const bH  = Math.max(pct * chartH, 2);
            const y   = PAD_T + chartH - bH;
            const esPico = h.hora === horaPico;
            return (
              <g key={h.hora}>
                <rect x={x} y={y} width={barW} height={bH}
                  fill={esPico ? '#4ade80' : '#3b82f6'}
                  fillOpacity={esPico ? 0.9 : 0.6}
                  rx="2" />
                {/* Valor encima si hay espacio */}
                {bH > 20 && (
                  <text x={x + barW / 2} y={y - 3} textAnchor="middle" fontSize="8" fill="#e2e8f0" fontWeight="bold">
                    {h.bipeos.toLocaleString('es-AR')}
                  </text>
                )}
                {/* Hora debajo */}
                <text x={x + barW / 2} y={PAD_T + chartH + 16} textAnchor="middle" fontSize="9" fill="#64748b">
                  {h.hora}
                </text>
              </g>
            );
          })}

          {/* Línea promedio */}
          {(() => {
            const yProm = PAD_T + (1 - promedio / maxVal) * chartH;
            return (
              <g>
                <line x1={PAD_L} y1={yProm} x2={W - PAD_R} y2={yProm}
                  stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 3" />
                <text x={W - PAD_R + 4} y={yProm + 4} fontSize="8" fill="#f59e0b">prom</text>
              </g>
            );
          })()}
        </svg>
      </div>

      {/* Productividad por CPT */}
      <div className="bg-[#0d1420]/60 border border-white/8 rounded-xl p-4">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3">Piezas totales por CPT</p>
        <div className="space-y-2">
          {(tableData ?? [])
            .map(c => ({ cpt: c.cpt, piezas: c.totCPT?.etiquetado ?? 0, avance: c.totCPT?.avance ?? 0 }))
            .filter(c => c.piezas > 0)
            .sort((a, b) => b.piezas - a.piezas)
            .map(c => {
              const col = getCptColor(c.cpt);
              const maxP = Math.max(...(tableData ?? []).map(x => x.totCPT?.etiquetado ?? 0), 1);
              return (
                <div key={c.cpt} className="flex items-center gap-3">
                  <span className={`text-[10px] font-black w-14 shrink-0 ${col.text}`}>{c.cpt}</span>
                  <div className="flex-1 h-5 bg-[#111827] rounded-lg overflow-hidden">
                    <div className="h-full rounded-lg transition-all"
                      style={{ width: `${(c.piezas / maxP) * 100}%`, backgroundColor: col.stroke, opacity: 0.7 }} />
                  </div>
                  <span className="text-[10px] text-white font-black w-16 text-right tabular-nums">
                    {c.piezas.toLocaleString('es-AR')}
                  </span>
                  <span className={`text-[9px] font-black w-10 text-right tabular-nums ${c.avance >= 80 ? 'text-green-400' : c.avance >= 50 ? 'text-yellow-400' : 'text-slate-500'}`}>
                    {c.avance.toFixed(0)}%
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

// ── Pestaña Ritmo — heatmap bipeos por hora × subca ──────────────────────────
const TabRitmo = ({ tableData, horaInicioHU }) => {
  const [cptSeleccionado, setCptSeleccionado] = useState(null);

  // Construir estructura: para el CPT seleccionado (o todos), zonas × horas
  const cpts = (tableData ?? []).filter(c =>
    c.zonas.some(z => z.bipeoPorHora && Object.keys(z.bipeoPorHora).length > 0)
  );

  if (cpts.length === 0) return (
    <div className="flex items-center justify-center h-40 text-slate-600 text-sm">
      Sin datos de bipeos por hora disponibles
    </div>
  );

  const cptActual = cptSeleccionado
    ? cpts.find(c => c.cpt === cptSeleccionado) ?? cpts[0]
    : cpts[0];

  const col   = getCptColor(cptActual.cpt);
  const horas = [];
  for (let h = horaInicioHU; h <= 23; h++) horas.push(h);

  // Filtrar zonas que tienen al menos 1 bipeo
  const zonas = cptActual.zonas.filter(z =>
    z.bipeoPorHora && Object.values(z.bipeoPorHora).some(v => v > 0)
  );

  if (zonas.length === 0) return (
    <div className="flex flex-col gap-4">
      {/* Selector de CPT */}
      <div className="flex gap-2 flex-wrap">
        {cpts.map(c => {
          const cc = getCptColor(c.cpt);
          return (
            <button key={c.cpt}
              onClick={() => setCptSeleccionado(c.cpt)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${
                cptActual.cpt === c.cpt
                  ? `${cc.badge} ${cc.border}`
                  : 'text-slate-500 border-white/8 hover:text-slate-300'
              }`}>
              CPT {c.cpt}
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-center h-32 text-slate-600 text-sm">Sin bipeos para este CPT</div>
    </div>
  );

  // Valor máximo global para escalar el color
  const allValues = zonas.flatMap(z => horas.map(h => z.bipeoPorHora?.[h] ?? 0));
  const maxVal    = Math.max(...allValues, 1);

  // Color de celda según intensidad (0 → transparente, max → color CPT opaco)
  const cellColor = (val) => {
    if (!val) return 'transparent';
    const pct = val / maxVal;
    // Escala: < 25% gris sutil, < 60% color medio, >= 60% color vivo
    const alpha = 0.15 + pct * 0.7;
    return `${col.stroke}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;
  };

  const totalPorHora = horas.map(h => zonas.reduce((s, z) => s + (z.bipeoPorHora?.[h] ?? 0), 0));
  const totalPorZona = zonas.map(z => horas.reduce((s, h) => s + (z.bipeoPorHora?.[h] ?? 0), 0));

  return (
    <div className="space-y-4">
      {/* Selector de CPT */}
      <div className="flex gap-2 flex-wrap">
        {cpts.map(c => {
          const cc = getCptColor(c.cpt);
          return (
            <button key={c.cpt}
              onClick={() => setCptSeleccionado(c.cpt)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${
                cptActual.cpt === c.cpt
                  ? `${cc.badge} ${cc.border}`
                  : 'text-slate-500 border-white/8 hover:text-slate-300'
              }`}>
              <span className={`w-2 h-2 rounded-full ${cc.dot}`} />
              CPT {c.cpt}
            </button>
          );
        })}
      </div>

      {/* Heatmap */}
      <div className={`rounded-xl border ${col.border} bg-[#0a0f1a] p-4 overflow-x-auto`}>
        <div className="flex items-center gap-2 mb-4">
          <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
          <span className={`text-[11px] font-black tracking-widest uppercase ${col.text}`}>
            CPT {cptActual.cpt} — bipeos por hora por subca
          </span>
          <span className="text-[9px] text-slate-500 ml-2">
            Total: <span className="text-white font-black">{totalPorHora.reduce((a,b)=>a+b,0).toLocaleString('es-AR')}</span> bipeos
          </span>
        </div>

        <table className="w-full border-collapse" style={{ minWidth: Math.max(400, zonas.length * 64 + 80) }}>
          <thead>
            <tr>
              {/* Columna hora */}
              <th className="text-left pb-2 pr-3 w-12">
                <span className="text-[9px] font-black uppercase text-slate-600">Hora</span>
              </th>
              {zonas.map((z, zi) => (
                <th key={z.zona} className="pb-2 px-1 text-center" style={{ minWidth: 56 }}>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-wide">{z.zona}</span>
                    <span className="text-[8px] text-slate-600 tabular-nums">{z.etiquetado?.toLocaleString('es-AR')} pzs</span>
                  </div>
                </th>
              ))}
              {/* Total por hora */}
              <th className="pb-2 pl-3 text-right w-16">
                <span className="text-[9px] font-black uppercase text-slate-600">Total</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {horas.map((h, hi) => {
              const rowTotal = totalPorHora[hi];
              return (
                <tr key={h} className="group">
                  {/* Etiqueta hora */}
                  <td className="pr-3 py-0.5">
                    <span className="text-[10px] font-black text-slate-400 tabular-nums">{h}:00</span>
                  </td>
                  {zonas.map((z, zi) => {
                    const val = z.bipeoPorHora?.[h] ?? 0;
                    return (
                      <td key={z.zona} className="px-1 py-0.5">
                        <div
                          className="flex items-center justify-center rounded h-7 transition-all"
                          style={{ backgroundColor: cellColor(val) }}
                          title={`${z.zona} · ${h}:00 → ${val} bipeos`}
                        >
                          {val > 0 ? (
                            <span className="text-[9px] font-black text-white tabular-nums">{val}</span>
                          ) : (
                            <span className="text-[8px] text-slate-800">—</span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                  {/* Total fila */}
                  <td className="pl-3 py-0.5 text-right">
                    {rowTotal > 0 ? (
                      <span className="text-[10px] font-black text-white tabular-nums">{rowTotal.toLocaleString('es-AR')}</span>
                    ) : (
                      <span className="text-[9px] text-slate-700">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {/* Fila total por zona */}
            <tr className="border-t border-white/10">
              <td className="pt-2 pr-3">
                <span className="text-[9px] font-black uppercase text-slate-500">Total</span>
              </td>
              {zonas.map((z, zi) => (
                <td key={z.zona} className="px-1 pt-2 text-center">
                  <span className={`text-[10px] font-black tabular-nums ${col.text}`}>
                    {totalPorZona[zi].toLocaleString('es-AR')}
                  </span>
                </td>
              ))}
              <td className="pl-3 pt-2 text-right">
                <span className={`text-[11px] font-black tabular-nums ${col.text}`}>
                  {totalPorHora.reduce((a,b)=>a+b,0).toLocaleString('es-AR')}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Leyenda de escala */}
        <div className="flex items-center gap-2 mt-4 justify-end">
          <span className="text-[8px] text-slate-600 uppercase">Intensidad</span>
          {[0.1, 0.3, 0.55, 0.75, 1].map((pct, i) => {
            const alpha = 0.15 + pct * 0.7;
            const hex   = Math.round(alpha * 255).toString(16).padStart(2, '0');
            return (
              <div key={i} className="w-5 h-3 rounded-sm" style={{ backgroundColor: `${col.stroke}${hex}` }} />
            );
          })}
          <span className="text-[8px] text-slate-600 uppercase">Máx</span>
        </div>
      </div>
    </div>
  );
};

// ── Pestaña Proyección ────────────────────────────────────────────────────────
const TabProyeccion = ({ huStats, totalesHU, productividadHU, totalConectadosFiltrado }) => {
  if (!huStats) return (
    <div className="flex items-center justify-center h-40 text-slate-600 text-sm">Sin datos de HU disponibles</div>
  );
  const { pendientes } = huStats;
  const prod = productividadHU || 180;
  const act  = totalConectadosFiltrado;
  const hs18 = horasHasta(18);
  const hs20 = horasHasta(20);
  const nec18 = prod > 0 ? Math.ceil((pendientes / prod / hs18) * 1.1) : 0;
  const nec20 = prod > 0 ? Math.ceil((pendientes * 1.1 / prod / hs20) * 1.1) : 0;
  const ok18  = act >= nec18;
  const d18   = act - nec18;
  const d20   = act - nec20;

  const StatCard = ({ label, value, color = 'text-white' }) => (
    <div className="bg-[#0d1420]/60 border border-white/8 rounded-xl p-4">
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">{label}</p>
      <p className={`text-3xl font-black tabular-nums ${color}`}>{value}</p>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Conectados (ventana)" value={act}                                    color="text-green-400" />
        <StatCard label="Pendientes HU"         value={pendientes?.toLocaleString('es-AR')}   color="text-orange-300" />
        <StatCard label="Productividad cfg."     value={`${prod} pzs/h`}                      color="text-slate-300" />
        <StatCard label="Avance HU"
          value={`${totalesHU?.avance?.toFixed(1) ?? 0}%`}
          color={totalesHU?.avance >= 80 ? 'text-green-400' : totalesHU?.avance >= 50 ? 'text-yellow-400' : 'text-red-400'} />
      </div>

      <div className={`rounded-xl border p-5 ${ok18 ? 'border-green-500/30 bg-green-900/10' : 'border-red-500/30 bg-red-900/10'}`}>
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3">Objetivo antes de las 18:00</p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className={`text-4xl font-black tabular-nums ${ok18 ? 'text-green-400' : 'text-red-400'}`}>
              {nec18} <span className="text-base font-bold text-slate-500">usuarios necesarios</span>
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              {pendientes?.toLocaleString('es-AR')} pzs · {hs18.toFixed(1)}h restantes · margen 10%
            </p>
          </div>
          <div className={`text-center px-5 py-3 rounded-xl ${ok18 ? 'bg-green-500/15' : 'bg-red-500/15'}`}>
            <p className={`text-2xl font-black ${ok18 ? 'text-green-400' : 'text-red-400'}`}>
              {d18 >= 0 ? `+${d18}` : d18}
            </p>
            <p className="text-[9px] text-slate-500 font-black uppercase">{ok18 ? 'Superávit' : 'Faltan'}</p>
          </div>
        </div>
        {!ok18 && <p className="mt-3 text-[10px] text-red-300 font-black">⚠ No se llega al objetivo a las 18:00 — ver plan B abajo</p>}
      </div>

      {!ok18 && (
        <div className="rounded-xl border border-indigo-500/30 bg-indigo-900/10 p-5">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3">Plan B — objetivo +10% antes de las 20:00</p>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-4xl font-black tabular-nums text-indigo-300">
                {nec20} <span className="text-base font-bold text-slate-500">usuarios necesarios</span>
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                {Math.ceil(pendientes * 1.1).toLocaleString('es-AR')} pzs (+10%) · {hs20.toFixed(1)}h restantes
              </p>
            </div>
            <div className={`text-center px-5 py-3 rounded-xl ${d20 >= 0 ? 'bg-green-500/15' : 'bg-orange-500/15'}`}>
              <p className={`text-2xl font-black ${d20 >= 0 ? 'text-green-400' : 'text-orange-400'}`}>
                {d20 >= 0 ? `+${d20}` : d20}
              </p>
              <p className="text-[9px] text-slate-500 font-black uppercase">{d20 >= 0 ? 'Suficiente' : 'Faltan'}</p>
            </div>
          </div>
        </div>
      )}

      {ok18 && (
        <div className="rounded-xl border border-green-500/20 bg-green-900/10 p-4 text-center">
          <p className="text-green-400 font-black text-sm uppercase tracking-widest">✓ Se llega al objetivo antes de las 18:00</p>
        </div>
      )}
    </div>
  );
};

// ── Principal ─────────────────────────────────────────────────────────────────
const ConectadosHU = ({ data }) => {
  const [tab,        setTab]        = useState('layout');
  const [ventanaMin, setVentanaMin] = useState(5);

  const tableData         = data?.tableData              ?? [];
  const todosLosUsuarios  = data?.usuariosActivosDetalle ?? [];
  const refMs             = data?.refMs                  ?? Date.now();
  const huStats           = data?.huStats;
  const totalesHU         = data?.totalesHU;
  const productividadHU   = huStats?.productividadHU     ?? 180;
  const horaInicioHU      = 10;
  const bipeoPorHoraArray = data?.bipeoPorHoraArray      ?? [];

  const usuariosFiltrados = useMemo(() => {
    const ms = ventanaMin * 60 * 1000;
    return todosLosUsuarios.filter(u => (refMs - u.ts) <= ms);
  }, [todosLosUsuarios, ventanaMin, refMs]);

  const detalleMap = useMemo(() => {
    const m = {};
    usuariosFiltrados.forEach(u => {
      if (!m[u.zona]) m[u.zona] = [];
      m[u.zona].push(u);
    });
    return m;
  }, [usuariosFiltrados]);

  const totalConectados = new Set(usuariosFiltrados.map(u => u.usr)).size;
  const totalPaq        = usuariosFiltrados.filter(u => u.tipoPosicion === 'PAQUETERIA').length;
  const totalVol        = usuariosFiltrados.filter(u => u.tipoPosicion === 'VOLUMINOSO').length;
  const totalSinPos     = usuariosFiltrados.filter(u => !u.tipoPosicion).length;

  if (!data || tableData.length === 0) {
    return (
      <div className="flex items-center justify-center h-60 text-slate-600 text-sm">
        Sin datos disponibles. Cargá archivos para ver los conectados.
      </div>
    );
  }

  const TABS = [
    { id: 'layout',     label: 'Layout',         cls: 'bg-blue-600/20 text-blue-400 border border-blue-500/20'   },
    { id: 'prod',       label: 'Productividad',   cls: 'bg-green-600/20 text-green-400 border border-green-500/20' },
    { id: 'ritmo',      label: 'Ritmo',           cls: 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/20'   },
    { id: 'proyeccion', label: 'Proyección',      cls: 'bg-purple-600/20 text-purple-400 border border-purple-500/20' },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-green-900/20 border border-green-500/20 rounded-xl px-4 py-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 font-black text-xl tabular-nums">{totalConectados}</span>
            <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">conectados</span>
          </div>
          {totalPaq > 0    && <div className="flex items-center gap-1 bg-blue-900/20 border border-blue-500/20 rounded-xl px-3 py-2"><span className="text-blue-300 font-black text-sm">{totalPaq}</span><span className="text-[9px] text-slate-500 uppercase tracking-wider ml-1">paq</span></div>}
          {totalVol > 0    && <div className="flex items-center gap-1 bg-amber-900/20 border border-amber-500/20 rounded-xl px-3 py-2"><span className="text-amber-300 font-black text-sm">{totalVol}</span><span className="text-[9px] text-slate-500 uppercase tracking-wider ml-1">vol</span></div>}
          {totalSinPos > 0 && <div className="flex items-center gap-1 bg-slate-800/40 border border-slate-600/20 rounded-xl px-3 py-2"><span className="text-slate-400 font-black text-sm">{totalSinPos}</span><span className="text-[9px] text-slate-500 uppercase tracking-wider ml-1">s/p</span></div>}
          <VentanaSelector ventana={ventanaMin} onChange={setVentanaMin} />
        </div>
        <div className="flex bg-[#111827] border border-white/8 rounded-xl p-1 gap-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                tab === t.id ? t.cls : 'text-slate-500 hover:text-slate-300'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'layout' && (
        <div className="space-y-4">
          {tableData.map(e => (
            <CPTBlock key={e.cpt} cptEntry={e} detalleMap={detalleMap} horaInicioHU={horaInicioHU} />
          ))}
        </div>
      )}
      {tab === 'prod' && (
        <TabProductividad bipeoPorHoraArray={bipeoPorHoraArray} tableData={tableData} horaInicioHU={horaInicioHU} />
      )}
      {tab === 'ritmo' && (
        <TabRitmo tableData={tableData} horaInicioHU={horaInicioHU} />
      )}
      {tab === 'proyeccion' && (
        <TabProyeccion huStats={huStats} totalesHU={totalesHU} productividadHU={productividadHU} totalConectadosFiltrado={totalConectados} />
      )}
    </div>
  );
};

export default ConectadosHU;
