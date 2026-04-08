import { useState } from 'react';
import {
  ComposedChart, Line, Area, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, LabelList,
} from 'recharts';
import { ChevronLeft, ChevronRight, ClipboardList } from 'lucide-react';
import { PLAN_HOURS, emptyPlan, mergePlanConReal } from '../../../core/vehiculosPlan.js';

/* ─── Primitivos de gráfico ─────────────────────────────────────── */

const CustomDot = ({ cx, cy, stroke }) => (
  <circle cx={cx} cy={cy} r={3} fill={stroke} stroke="none" />
);

const PillLabel = ({ x, y, value, color }) => {
  if (!value || value === 0) return null;
  const w = value > 9 ? 22 : 18;
  const h = 14;
  return (
    <g>
      <rect x={x - w / 2} y={y - h - 6} width={w} height={h} rx={4} fill={color} opacity={0.9} />
      <text x={x} y={y - h / 2 - 6} textAnchor="middle" dominantBaseline="middle"
        fill="white" fontSize={8} fontWeight="900">{value}</text>
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
              <LabelList content={(p) => <PillLabel {...p} color="#34d399" />} />
            </Line>
            <Line type="monotoneX" dataKey="camioneta" stroke="#ffab00" strokeWidth={2}
              dot={<CustomDot stroke="#ffab00" />} activeDot={{ r: 4 }}>
              <LabelList content={(p) => <PillLabel {...p} color="#ffab00" />} />
            </Line>
            <Line type="monotoneX" dataKey="semi" stroke="#60a5fa" strokeWidth={2}
              dot={<CustomDot stroke="#60a5fa" />} activeDot={{ r: 4 }}>
              <LabelList content={(p) => <PillLabel {...p} color="#60a5fa" />} />
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
              <LabelList content={(p) => <PillLabel {...p} color="#a78bfa" />} />
            </Line>
            <Line type="monotoneX" dataKey="realTotal" name="Ciu" stroke="#22c55e" strokeWidth={3}
              dot={<CustomDot stroke="#22c55e" />}
              activeDot={{ r: 5, fill: '#22c55e', stroke: '#080c14', strokeWidth: 2 }}
              isAnimationActive={false}>
              <LabelList content={(p) => {
                const val = Number(p?.value || 0);
                const plan = Number(p?.payload?.planTotal || 0);
                if (!val) return null;
                return <PillLabel {...p} color={val >= plan ? '#22c55e' : '#ef4444'} />;
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
              <LabelList content={(p) => <PillLabel {...p} color="#34d399" />} />
            </Line>
            <Line type="monotoneX" dataKey="planCamioneta" name="Plan Camioneta" stroke="#ffab00"
              strokeWidth={2} strokeDasharray="5 4" dot={<CustomDot stroke="#ffab00" />}>
              <LabelList content={(p) => <PillLabel {...p} color="#ffab00" />} />
            </Line>
            <Line type="monotoneX" dataKey="planSemi" name="Plan Semi" stroke="#60a5fa"
              strokeWidth={2} strokeDasharray="5 4" dot={<CustomDot stroke="#60a5fa" />}>
              <LabelList content={(p) => <PillLabel {...p} color="#60a5fa" />} />
            </Line>
          </ComposedChart>
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
        chasis:    existing?.chasis    ?? '',
        camioneta: existing?.camioneta ?? '',
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
          <span className="text-center text-emerald-500">Chasis</span>
          <span className="text-center text-[#ffab00]">Camioneta</span>
          <span className="text-center text-blue-400">Semi</span>
        </div>

        {/* Filas */}
        <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
          {rows.map((r, i) => (
            <div key={r.hora} className="grid grid-cols-4 gap-2 items-center">
              <span className="text-[10px] font-black text-slate-400">{r.hora}</span>
              <input type="number" min="0" value={r.chasis} className={inputCls}
                onChange={e => update(i, 'chasis', e.target.value)} />
              <input type="number" min="0" value={r.camioneta} className={inputCls}
                onChange={e => update(i, 'camioneta', e.target.value)} />
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

/* ─── Navegación entre vistas ────────────────────────────────────── */

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

const VehiculosChart = ({ vehiculosChartData, planVehiculos, onPlanChange, isViewer }) => {
  const [modal, setModal] = useState(false);
  const [viewIndex, setViewIndex] = useState(0);

  const plan = planVehiculos?.length ? planVehiculos : emptyPlan();
  const mergedData = mergePlanConReal(vehiculosChartData || [], plan);

  return (
    <div className="space-y-4">

      {/* Barra de controles */}
      <div className="flex justify-between items-center bg-[#0f172a] px-4 py-3 rounded-xl border border-white/10">
        {!isViewer ? (
          <button onClick={() => setModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest transition-all">
            <ClipboardList size={14} />
            Cargar Plan
          </button>
        ) : (
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
            {plan.some(r => r.chasis || r.camioneta || r.semi) ? 'Plan cargado' : 'Sin plan'}
          </span>
        )}
        <ViewNav index={viewIndex} onChange={setViewIndex} />
      </div>

      {/* Gráficos */}
      {viewIndex === 0 && <VehiculosTipoChart data={mergedData} />}
      {viewIndex === 1 && <VehiculosTotalChart data={mergedData} />}
      {viewIndex === 2 && <VehiculosPlanChart data={mergedData} />}

      {/* Modal */}
      <PlanModal
        open={modal}
        initialPlan={plan}
        onClose={() => setModal(false)}
        onSave={onPlanChange}
      />

    </div>
  );
};

export default VehiculosChart;
