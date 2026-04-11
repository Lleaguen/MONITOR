import { useState } from 'react';
import {
  ComposedChart, Line, Area, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, LabelList,
  PieChart, Pie, Cell,
} from 'recharts';
import { ChevronLeft, ChevronRight, ClipboardList } from 'lucide-react';
import { PLAN_HOURS, emptyPlan, mergePlanConReal } from '../../../core/vehiculosPlan.js';
import { BarChart, Bar, Legend } from 'recharts';
/* ─── Primitivos de gráfico ─────────────────────────────────────── */

const CustomDot = ({ cx, cy, stroke }) => (
  <circle cx={cx} cy={cy} r={3} fill={stroke} stroke="none" />
);

const PillLabel = ({ x, y, value, color, offset = 0 }) => {
  if (!value || value === 0) return null;
  const text = String(value);
  const w = text.length * 7 + 10;
  const h = 16;
  const dy = offset * (h + 2);
  return (
    <g>
      <rect x={x - w / 2} y={y - h / 2 + dy} width={w} height={h} rx={4} fill={color} opacity={0.95} />
      <text x={x} y={y + dy} textAnchor="middle" dominantBaseline="middle"
        fill="white" fontSize={10} fontWeight="900">{text}</text>
    </g>
  );
};

const chartTooltipStyle = {
  backgroundColor: '#080c14',
  border: 'none',
  borderRadius: '8px',
  fontSize: '11px',
};

/* ─── Gráfico 1: Arribo por tipo ────────────────────────────────── */

const VehiculosTipoChart = ({ data }) => {
  const filtered = data.filter(d => d.chasis > 0 || d.camioneta > 0 || d.semi > 0);

  return (
    <div className="bg-[#111827]/20 p-4 md:p-6 rounded-2xl border border-white/5">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Arribo por Tipo</h3>
        <div className="flex gap-4 text-[9px] font-black tracking-widest text-slate-400">
          <span className="flex items-center gap-1"><span className="w-3 h-[2px] bg-emerald-400 inline-block" /> CHASIS</span>
          <span className="flex items-center gap-1"><span className="w-3 h-[2px] bg-[#ffab00] inline-block" /> CAMIONETA</span>
          <span className="flex items-center gap-1"><span className="w-3 h-[2px] bg-blue-400 inline-block" /> SEMI</span>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer>
          <ComposedChart data={filtered} margin={{ top: 24, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="#1e293b" strokeDasharray="4 4" />
            <XAxis dataKey="hora" axisLine={false} tickLine={false}
              tick={{ fill: '#475569', fontSize: 9, fontWeight: 700 }} dy={8} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#334155', fontSize: 9 }} width={20} />
            <Tooltip cursor={{ fill: '#1e293b' }} contentStyle={chartTooltipStyle} />
            <Line type="monotoneX" dataKey="chasis" stroke="#34d399" strokeWidth={2}
              dot={<CustomDot stroke="#34d399" />} activeDot={{ r: 4 }}>
              <LabelList content={(p) => <PillLabel {...p} color="#34d399" offset={-2} />} />
            </Line>
            <Line type="monotoneX" dataKey="camioneta" stroke="#ffab00" strokeWidth={2}
              dot={<CustomDot stroke="#ffab00" />} activeDot={{ r: 4 }}>
              <LabelList content={(p) => <PillLabel {...p} color="#ffab00" offset={-1} />} />
            </Line>
            <Line type="monotoneX" dataKey="semi" stroke="#60a5fa" strokeWidth={2}
              dot={<CustomDot stroke="#60a5fa" />} activeDot={{ r: 4 }}>
              <LabelList content={(p) => <PillLabel {...p} color="#60a5fa" offset={0} />} />
            </Line>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

/* ─── Gráfico 2: Total real vs plan ─────────────────────────────── */

const VehiculosTotalChart = ({ data }) => {
  const filtered = data.filter(d => d.realTotal > 0 || d.planTotal > 0);

  return (
    <div className="bg-[#111827]/20 p-4 md:p-6 rounded-2xl border border-white/5">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <div>
          <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Total vs Planificado</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Vehículos reales vs plan por hora</p>
        </div>
        <div className="flex gap-4 text-[9px] font-black tracking-widest text-slate-400">
          <span className="flex items-center gap-2"><span className="w-3 h-[2px] bg-emerald-400 inline-block rounded-full" /> CIU</span>
          <span className="flex items-center gap-2"><span className="w-3 h-[2px] bg-violet-400 inline-block rounded-full" /> MELI</span>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer>
          <ComposedChart data={filtered} margin={{ top: 28, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="areaReal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#1e293b" strokeDasharray="4 4" />
            <XAxis dataKey="hora" axisLine={false} tickLine={false}
              tick={{ fill: '#475569', fontSize: 9, fontWeight: 700 }} dy={8} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#334155', fontSize: 9 }} width={20} />
            <Tooltip cursor={{ fill: '#1e293b' }} contentStyle={chartTooltipStyle} />
            <Area dataKey="realTotal" fill="url(#areaReal)" stroke="none" />
            <Line type="monotoneX" dataKey="planTotal" name="Meli" stroke="#a78bfa" strokeWidth={2.5}
              strokeDasharray="5 5" dot={<CustomDot stroke="#a78bfa" />}
              activeDot={{ r: 5, fill: '#a78bfa', stroke: '#080c14', strokeWidth: 2 }}>
              <LabelList content={(p) => <PillLabel {...p} color="#a78bfa" offset={-1} />} />
            </Line>
            <Line type="monotoneX" dataKey="realTotal" name="Ciu" stroke="#22c55e" strokeWidth={3}
              dot={<CustomDot stroke="#22c55e" />}
              activeDot={{ r: 5, fill: '#22c55e', stroke: '#080c14', strokeWidth: 2 }}
              isAnimationActive={false}>
              <LabelList content={(p) => {
                const val = Number(p?.value || 0);
                const plan = Number(p?.payload?.planTotal || 0);
                if (!val) return null;
                return <PillLabel {...p} color={val >= plan ? '#22c55e' : '#ef4444'} offset={1} />;
              }} />
            </Line>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

/* ─── Gráfico 3: Plan por tipo ───────────────────────────────────── */

const VehiculosPlanChart = ({ data }) => {
  const filtered = data.filter(d =>
    d.planChasis > 0 || d.planCamioneta > 0 || d.planSemi > 0
  );

  if (filtered.length === 0) {
    return (
      <div className="bg-[#111827]/20 p-6 rounded-2xl border border-white/5 flex flex-col items-center justify-center h-64 gap-3">
        <ClipboardList size={28} className="text-slate-600" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Sin plan cargado</p>
        <p className="text-[10px] text-slate-700">Usá "Cargar Plan" para ingresar el planificado por tipo</p>
      </div>
    );
  }

  return (
    <div className="bg-[#111827]/20 p-4 md:p-6 rounded-2xl border border-white/5">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Plan por Tipo</h3>
        <div className="flex gap-4 text-[9px] font-black tracking-widest text-slate-400">
          <span className="flex items-center gap-1"><span className="w-3 h-[2px] bg-emerald-400 inline-block" /> CHASIS</span>
          <span className="flex items-center gap-1"><span className="w-3 h-[2px] bg-[#ffab00] inline-block" /> CAMIONETA</span>
          <span className="flex items-center gap-1"><span className="w-3 h-[2px] bg-blue-400 inline-block" /> SEMI</span>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer>
          <ComposedChart data={filtered} margin={{ top: 24, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="#1e293b" strokeDasharray="4 4" />
            <XAxis dataKey="hora" axisLine={false} tickLine={false}
              tick={{ fill: '#475569', fontSize: 9, fontWeight: 700 }} dy={8} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#334155', fontSize: 9 }} width={20} />
            <Tooltip cursor={{ fill: '#1e293b' }} contentStyle={chartTooltipStyle} />
            <Line type="monotoneX" dataKey="planChasis" name="Plan Chasis" stroke="#34d399"
              strokeWidth={2} strokeDasharray="5 4" dot={<CustomDot stroke="#34d399" />}>
              <LabelList content={(p) => <PillLabel {...p} color="#34d399" offset={-2} />} />
            </Line>
            <Line type="monotoneX" dataKey="planCamioneta" name="Plan Camioneta" stroke="#ffab00"
              strokeWidth={2} strokeDasharray="5 4" dot={<CustomDot stroke="#ffab00" />}>
              <LabelList content={(p) => <PillLabel {...p} color="#ffab00" offset={-1} />} />
            </Line>
            <Line type="monotoneX" dataKey="planSemi" name="Plan Semi" stroke="#60a5fa"
              strokeWidth={2} strokeDasharray="5 4" dot={<CustomDot stroke="#60a5fa" />}>
              <LabelList content={(p) => <PillLabel {...p} color="#60a5fa" offset={0} />} />
            </Line>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

/* ---- Grafica Comparativa Vehiculos --------*/

const VehiculosComparativoBarras = ({ data }) => {

  const totales = data.reduce((acc, d) => {
    acc.ciuChasis += d.chasis || 0;
    acc.ciuCamioneta += d.camioneta || 0;
    acc.ciuSemi += d.semi || 0;

    acc.meliChasis += d.planChasis || 0;
    acc.meliCamioneta += d.planCamioneta || 0;
    acc.meliSemi += d.planSemi || 0;

    return acc;
  }, {
    ciuChasis: 0,
    ciuCamioneta: 0,
    ciuSemi: 0,
    meliChasis: 0,
    meliCamioneta: 0,
    meliSemi: 0,
  });

  const chartData = [
    {
      tipo: 'Chasis',
      Meli: totales.meliChasis,
      Ciu: totales.ciuChasis,
    },
    {
      tipo: 'Camioneta',
      Meli: totales.meliCamioneta,
      Ciu: totales.ciuCamioneta,
    },
    {
      tipo: 'Semi',
      Meli: totales.meliSemi,
      Ciu: totales.ciuSemi,
    },
    {
      tipo: 'Total',
      Meli: totales.meliChasis + totales.meliCamioneta + totales.meliSemi,
      Ciu: totales.ciuChasis + totales.ciuCamioneta + totales.ciuSemi,
    },
  ];

  return (
    <div className="bg-[#111827]/20 p-4 md:p-6 rounded-2xl border border-white/5">

      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-[11px] font-black text-white uppercase tracking-widest">
            Comparativo General
          </h3>
          <p className="text-[10px] text-slate-500">
            Meli vs Ciu por tipo y total
          </p>
        </div>

        <div className="flex gap-4 text-[9px] font-black tracking-widest text-slate-400">
          <span className="flex items-center gap-2">
            <span className="w-3 h-[2px] bg-violet-400 inline-block" /> MELI
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-[2px] bg-emerald-400 inline-block" /> CIU
          </span>
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer>
          <BarChart data={chartData} barGap={10}>
            <CartesianGrid stroke="#1e293b" strokeDasharray="4 4" />

            <XAxis
              dataKey="tipo"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#334155', fontSize: 9 }}
              width={25}
            />

            <Tooltip contentStyle={chartTooltipStyle} />

            <Bar dataKey="Meli" fill="#a78bfa" radius={[6, 6, 0, 0]}>
              <LabelList content={(p) => <PillLabel {...p} color="#a78bfa" />} />
            </Bar>

            <Bar dataKey="Ciu" fill="#22c55e" radius={[6, 6, 0, 0]}>
              <LabelList content={(p) => <PillLabel {...p} color="#22c55e" />} />
            </Bar>

          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

/* ─── Modal de carga de plan ─────────────────────────────────────── */

const PlanModal = ({ open, initialPlan, onClose, onSave }) => {
  const [rows, setRows] = useState(() =>
    PLAN_HOURS.map(hora => {
      const existing = initialPlan?.find(r => r.hora === hora);
      return {
        hora,
        camioneta: existing?.camioneta ?? '',
        chasis:    existing?.chasis    ?? '',
        semi:      existing?.semi      ?? '',
      };
    })
  );

  if (!open) return null;

  const update = (i, field, val) => {
    const copy = [...rows];
    copy[i][field] = val;
    setRows(copy);
  };

  const save = () => {
    const parsed = rows.map(r => ({
      hora:      r.hora,
      chasis:    Number(r.chasis)    || 0,
      camioneta: Number(r.camioneta) || 0,
      semi:      Number(r.semi)      || 0,
    }));
    onSave(parsed);
    onClose();
  };

  const inputCls = "w-full bg-[#020617] border border-white/5 text-white text-[11px] font-bold px-2 py-1.5 rounded-lg text-center focus:outline-none focus:border-blue-500/50";

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
      <div className="bg-[#0f172a] p-6 rounded-2xl w-full max-w-lg border border-white/10 flex flex-col gap-4">

        <div>
          <h2 className="text-[11px] font-black text-white uppercase tracking-widest">Cargar Plan de Vehículos</h2>
          <p className="text-[10px] text-slate-500 mt-1">Ingresá el planificado de Meli por tipo y hora</p>
        </div>

        {/* Header columnas */}
        <div className="grid grid-cols-4 gap-2 text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">
          <span>Hora</span>
          <span className="text-center text-[#ffab00]">Camioneta</span>
          <span className="text-center text-emerald-500">Chasis</span>
          <span className="text-center text-blue-400">Semi</span>
        </div>

        {/* Filas */}
        <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
          {rows.map((r, i) => (
            <div key={r.hora} className="grid grid-cols-4 gap-2 items-center">
              <span className="text-[10px] font-black text-slate-400">{r.hora}</span>
               <input type="number" min="0" value={r.camioneta} className={inputCls}
                onChange={e => update(i, 'camioneta', e.target.value)} />
              <input type="number" min="0" value={r.chasis} className={inputCls}
                onChange={e => update(i, 'chasis', e.target.value)} />

              <input type="number" min="0" value={r.semi} className={inputCls}
                onChange={e => update(i, 'semi', e.target.value)} />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose}
            className="px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white border border-white/10 hover:border-white/20 transition-all">
            Cancelar
          </button>
          <button onClick={save}
            className="px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-500 text-white transition-all">
            Guardar Plan
          </button>
        </div>

      </div>
    </div>
  );
};

const ResumenModal = ({ open, onClose, data }) => {
  if (!open) return null;

  const totales = data.reduce((acc, d) => {
    acc.ciuChasis    += d.chasis    || 0;
    acc.ciuCamioneta += d.camioneta || 0;
    acc.ciuSemi      += d.semi      || 0;
    acc.meliChasis    += d.planChasis    || 0;
    acc.meliCamioneta += d.planCamioneta || 0;
    acc.meliSemi      += d.planSemi      || 0;
    return acc;
  }, { ciuChasis:0, ciuCamioneta:0, ciuSemi:0, meliChasis:0, meliCamioneta:0, meliSemi:0 });

  const rows = [
    { label: 'Chasis',    meli: totales.meliChasis,    ciu: totales.ciuChasis,    color: '#34d399' },
    { label: 'Camioneta', meli: totales.meliCamioneta, ciu: totales.ciuCamioneta, color: '#ffab00' },
    { label: 'Semi',      meli: totales.meliSemi,      ciu: totales.ciuSemi,      color: '#60a5fa' },
    { label: 'Total',
      meli: totales.meliChasis + totales.meliCamioneta + totales.meliSemi,
      ciu:  totales.ciuChasis  + totales.ciuCamioneta  + totales.ciuSemi,
      color: '#a78bfa' },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#0f172a] p-5 rounded-2xl w-full max-w-xs border border-white/10 flex flex-col gap-4"
        onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center">
          <h2 className="text-[11px] font-black text-white uppercase tracking-widest">Resumen General</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-xs font-black">✕</button>
        </div>
        <div className="grid grid-cols-3 text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">
          <span>Tipo</span>
          <span className="text-center text-violet-400">Meli</span>
          <span className="text-center text-emerald-400">Ciu</span>
        </div>
        <div className="space-y-2">
          {rows.map(r => (
            <div key={r.label} className="grid grid-cols-3 items-center px-1">
              <span className="text-[10px] font-black" style={{ color: r.color }}>{r.label}</span>
              <span className="text-center text-[11px] font-black text-violet-300">{r.meli}</span>
              <span className="text-center text-[11px] font-black text-emerald-300">{r.ciu}</span>
            </div>
          ))}
        </div>
        <div className="h-40">
          <ResponsiveContainer>
            <BarChart data={rows.map(r => ({ tipo: r.label, Meli: r.meli, Ciu: r.ciu }))} barSize={18} barGap={4}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="4 4" />
              <XAxis dataKey="tipo" axisLine={false} tickLine={false}
                tick={{ fill: '#475569', fontSize: 9, fontWeight: 700 }} />
              <YAxis hide />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Bar dataKey="Meli" fill="#a78bfa" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Ciu"  fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const PIE_COLORS = { Chasis: '#34d399', Camioneta: '#ffab00', Semi: '#60a5fa', Otro: '#94a3b8' };

const TortaModal = ({ open, onClose, data, piezasPorTipo = {} }) => {
  if (!open) return null;

  const totVeh = data.reduce((acc, d) => {
    acc.Chasis    += d.chasis    || 0;
    acc.Camioneta += d.camioneta || 0;
    acc.Semi      += d.semi      || 0;
    return acc;
  }, { Chasis: 0, Camioneta: 0, Semi: 0 });

  const totalVeh = totVeh.Chasis + totVeh.Camioneta + totVeh.Semi;

  const rows = [
    { name: 'Chasis',    veh: totVeh.Chasis,    piezas: piezasPorTipo.chasis    || 0 },
    { name: 'Camioneta', veh: totVeh.Camioneta, piezas: piezasPorTipo.camioneta || 0 },
    { name: 'Semi',      veh: totVeh.Semi,       piezas: piezasPorTipo.semi      || 0 },
  ].filter(d => d.veh > 0).map(d => ({
    ...d,
    pct: totalVeh > 0 ? ((d.veh / totalVeh) * 100).toFixed(1) : '0.0',
  }));

  const totalPiezas = rows.reduce((a, d) => a + d.piezas, 0);

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, index }) => {
    const RADIAN = Math.PI / 180;
    const r = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);
    const pct = rows[index]?.pct;
    if (!pct || pct === '0.0') return null;
    return (
      <text x={x} y={y} textAnchor="middle" dominantBaseline="middle"
        fill="white" fontSize={13} fontWeight="900" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
        {pct}%
      </text>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#0f172a] p-6 rounded-2xl w-full max-w-lg border border-[#8b5cf6]/30 flex flex-col gap-5"
        style={{ boxShadow: '0 0 40px rgba(139,92,246,0.15)' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-widest">Distribución por Tipo de Vehículo</h2>
            <p className="text-[10px] text-slate-500 mt-1">Vehículos recibidos y piezas recibidas por tipo</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white font-black text-sm">✕</button>
        </div>

        {/* Contenido: torta + desglose */}
        <div className="flex flex-col sm:flex-row items-center gap-6">

          {/* Torta */}
          <div className="w-48 h-48 sm:w-52 sm:h-52 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={rows.map(r => ({ name: r.name, value: r.veh }))}
                  dataKey="value" cx="50%" cy="50%"
                  outerRadius={90} labelLine={false} label={renderLabel}
                  stroke="rgba(139,92,246,0.3)" strokeWidth={2}>
                  {rows.map(r => <Cell key={r.name} fill={PIE_COLORS[r.name]} />)}
                </Pie>
                <Tooltip contentStyle={chartTooltipStyle}
                  formatter={(v, n) => [`${v} veh.`, n]} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Desglose */}
          <div className="flex-1 w-full space-y-3">
            {rows.map(d => (
              <div key={d.name} className="rounded-xl p-3 border border-white/5 bg-white/[0.02]"
                style={{ borderColor: `${PIE_COLORS[d.name]}30` }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[d.name], boxShadow: `0 0 8px ${PIE_COLORS[d.name]}80` }} />
                  <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: PIE_COLORS[d.name] }}>{d.name}</span>
                  <span className="ml-auto text-2xl font-black text-white">{d.pct}%</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Vehículos</p>
                    <p className="text-sm font-black text-slate-300">{d.veh}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Piezas recibidas</p>
                    <p className="text-sm font-black text-slate-300">
                      {Math.round(d.piezas).toLocaleString()}
                      {totalPiezas > 0 && <span className="text-[9px] font-bold text-slate-500 ml-1">({((d.piezas / totalPiezas) * 100).toFixed(1)}%)</span>}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center px-1 pt-1 border-t border-white/5">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total</span>
              <div className="flex gap-4">
                <span className="text-[10px] font-black text-slate-400">{totalVeh} veh.</span>
                <span className="text-[10px] font-black text-slate-400">{totalPiezas.toLocaleString()} pzas</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const VIEWS = ['Tipos', 'Total vs Plan', 'Plan por Tipo'];

const ViewNav = ({ index, onChange }) => (
  <div className="flex items-center gap-3">
    <button onClick={() => onChange((index - 1 + VIEWS.length) % VIEWS.length)}
      className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#020617] text-slate-400 hover:text-white hover:bg-blue-600/30 transition-all">
      <ChevronLeft size={16} />
    </button>
    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 w-28 text-center">
      {VIEWS[index]}
    </span>
    <button onClick={() => onChange((index + 1) % VIEWS.length)}
      className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#020617] text-slate-400 hover:text-white hover:bg-blue-600/30 transition-all">
      <ChevronRight size={16} />
    </button>
  </div>
);

/* ─── Componente principal ───────────────────────────────────────── */

const VehiculosChart = ({ vehiculosChartData, planVehiculos, onPlanChange, isViewer, piezasPorTipo = {} }) => {
  const [modal, setModal] = useState(false);
  const [resumen, setResumen] = useState(false);
  const [torta, setTorta] = useState(false);
  const [viewIndex, setViewIndex] = useState(0);

  const plan = planVehiculos?.length ? planVehiculos : emptyPlan();
  const mergedData = mergePlanConReal(vehiculosChartData || [], plan);

  return (
    <div className="space-y-4">

      {/* Barra de controles */}
      <div className="flex justify-between items-center bg-[#0f172a] px-4 py-3 rounded-xl border border-white/10">
        {!isViewer ? (
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setModal(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest transition-all">
              <ClipboardList size={14} />
              <span className="hidden sm:inline">Cargar Plan</span>
            </button>
            <button onClick={() => setResumen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/20 text-violet-400 text-[10px] font-black uppercase tracking-widest transition-all">
              <span className="hidden sm:inline">Resumen General</span>
              <span className="sm:hidden">Resumen</span>
            </button>
            <button onClick={() => setTorta(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/20 text-orange-400 text-[10px] font-black uppercase tracking-widest transition-all">
              Distribución
            </button>
          </div>
        ) : (
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
            {plan.some(r => r.chasis || r.camioneta || r.semi) ? 'Plan cargado' : 'Sin plan'}
          </span>
      <button onClick={() => setResumen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/20 text-violet-400 text-[10px] font-black uppercase tracking-widest transition-all">
              <span className="hidden sm:inline">Resumen General</span>
              <span className="sm:hidden">Resumen</span>
            </button>
            <button onClick={() => setTorta(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/20 text-orange-400 text-[10px] font-black uppercase tracking-widest transition-all">
              Distribución
            </button>
        )}
        <ViewNav index={viewIndex} onChange={setViewIndex} />
      </div>

      {/* Gráficos */}
      {viewIndex === 0 && <VehiculosTipoChart data={mergedData} />}
      {viewIndex === 1 && <VehiculosTotalChart data={mergedData} />}
      {viewIndex === 2 && <VehiculosPlanChart data={mergedData} />}

      {/* Modal plan */}
      <PlanModal
        open={modal}
        initialPlan={plan}
        onClose={() => setModal(false)}
        onSave={onPlanChange}
      />

      {/* Modal resumen */}
      <ResumenModal open={resumen} onClose={() => setResumen(false)} data={mergedData} />

      {/* Modal torta */}
      <TortaModal open={torta} onClose={() => setTorta(false)} data={mergedData} piezasPorTipo={piezasPorTipo} />

    </div>
  );
};

export default VehiculosChart;
