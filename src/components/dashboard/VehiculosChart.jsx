import React, { useState } from 'react';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
  Area
} from 'recharts';

/* ===================== LABELS ===================== */

const PillLabel = ({ x, y, value, color }) => {
  if (!value || value === 0) return null;
  const w = value > 9 ? 22 : 18;
  const h = 14;

  return (
    <g>
      <rect x={x - w / 2} y={y - h - 6} width={w} height={h} rx={4} fill={color} opacity={0.9} />
      <text
        x={x}
        y={y - h / 2 - 6}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize={8}
        fontWeight="900"
      >
        {value}
      </text>
    </g>
  );
};

const ChasisLabel = (props) => <PillLabel {...props} color="#34d399" />;
const CamionetaLabel = (props) => <PillLabel {...props} color="#ffab00" />;
const SemiLabel = (props) => <PillLabel {...props} color="#60a5fa" />;

const TotalLabel = (props) => {
  if (!props || !props.payload) return null;

  const value = Number(props.value || 0);
  const plan = Number(props.payload.plan || 0);

  return (
    <PillLabel
      {...props}
      color={value >= plan ? "#22c55e" : "#ef4444"}
    />
  );
};

const CustomDot = ({ cx, cy, stroke }) => (
  <circle cx={cx} cy={cy} r={3} fill={stroke} stroke="none" />
);

/* ===================== HELPERS ===================== */

const normalizeData = (arr = []) => {
  return arr.map(d => ({
    hora: d.hora,
    chasis: Number(d.chasis || 0),
    camioneta: Number(d.camioneta || 0),
    semi: Number(d.semi || 0),
  }));
};

const mergeData = (base = [], planData = []) => {
  const planMap = Object.fromEntries(
    planData.map(d => [d.hora, Number(d.plan) || 0])
  );

  return base.map(d => {
    const real = d.chasis + d.camioneta + d.semi;

    return {
      hora: d.hora,
      real,
      plan: planMap[d.hora] || 0
    };
  });
};

/* ===================== GRAFICO 1 ===================== */

const VehiculosTipoChart = ({ data }) => {

  const filtered = data.filter(d =>
    d.chasis > 0 || d.camioneta > 0 || d.semi > 0
  );

  return (
    <div className="bg-[#111827]/20 p-4 md:p-6 rounded-2xl border border-white/5">

      <div className="flex justify-between mb-4">
        <h3 className="text-white font-bold">Arribo por Tipo</h3>

        <div className="flex gap-4 text-[10px] font-bold">
          <span className="flex items-center gap-1">
            <div className="w-3 h-[2px] bg-emerald-400" /> CHASIS
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-[2px] bg-[#ffab00]" /> CAMIONETA
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-[2px] bg-blue-400" /> SEMI
          </span>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer>
          <ComposedChart data={filtered}>
            <CartesianGrid stroke="#1e293b" strokeDasharray="4 4" />
            <XAxis dataKey="hora" />
            <YAxis />
            <Tooltip />

            <Line dataKey="chasis" stroke="#34d399" dot={<CustomDot stroke="#34d399" />}>
              <LabelList content={<ChasisLabel />} />
            </Line>

            <Line dataKey="camioneta" stroke="#ffab00" dot={<CustomDot stroke="#ffab00" />}>
              <LabelList content={<CamionetaLabel />} />
            </Line>

            <Line dataKey="semi" stroke="#60a5fa" dot={<CustomDot stroke="#60a5fa" />}>
              <LabelList content={<SemiLabel />} />
            </Line>

          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

/* ===================== GRAFICO 2 ===================== */

const VehiculosTotalChart = ({ data }) => {

  const filtered = data.filter(d => d.real > 0 || d.plan > 0);

  return (
    <div className="bg-[#111827]/20 p-4 rounded-2xl border border-white/5">

      <h3 className="text-white font-bold mb-4">Total vs Plan</h3>

      <div className="h-64">
        <ResponsiveContainer>
          <ComposedChart data={filtered}>

            <defs>
              <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3}/>
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0}/>
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#1e293b" strokeDasharray="4 4" />
            <XAxis dataKey="hora" />
            <YAxis />
            <Tooltip />

            <Area dataKey="real" fill="url(#area)" />
            <Line dataKey="plan" stroke="#a78bfa" strokeDasharray="5 5" />

            <Line dataKey="real" stroke="#22c55e">
              <LabelList content={<TotalLabel />} />
            </Line>

          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

/* ===================== MODAL ===================== */

const HOURS = Array.from({ length: 12 }, (_, i) => {
  const h = i + 10;
  return `${h.toString().padStart(2, "0")}:00`;
});

const DataModal = ({ open, onClose, onSave }) => {

  const [rows, setRows] = useState(
    HOURS.map(h => ({ hora: h, plan: "" }))
  );

  if (!open) return null;

  const update = (i, val) => {
    const copy = [...rows];
    copy[i].plan = val;
    setRows(copy);
  };

  const save = () => {
    onSave(rows);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
      <div className="bg-[#0f172a] p-6 rounded-2xl w-full max-w-xl border border-white/10">

        <h2 className="text-white mb-4 font-semibold">Carga de Plan</h2>

        <div className="space-y-2 max-h-80 overflow-auto">
          {rows.map((r, i) => (
            <div key={i} className="flex justify-between items-center text-white">
              <span>{r.hora}</span>
              <input
                type="number"
                className="bg-[#020617] px-2 py-1 rounded w-32"
                onChange={e => update(i, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-red-500 text-white"
          >
            Cancelar
          </button>
          <button
            onClick={save}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white"
          >
            Guardar
          </button>
        </div>

      </div>
    </div>
  );
};

/* ===================== MAIN ===================== */

const VehiculosChart = ({ vehiculosChartData }) => {

  const [modal, setModal] = useState(false);
  const [planData, setPlanData] = useState([]);
  const [index, setIndex] = useState(0);

  const baseData = normalizeData(vehiculosChartData || []);
  const totalData = mergeData(baseData, planData);

  return (
    <div className="space-y-4">

      <div className="flex justify-between items-center bg-[#0f172a] p-3 rounded-xl border border-white/10">

        <button
          onClick={() => setModal(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold"
        >
          Cargar Plan
        </button>

        <div className="flex items-center gap-3">

          <button
            onClick={() => setIndex((index - 1 + 2) % 2)}
            className="w-9 h-9 rounded-lg bg-[#020617] text-white"
          >
            <
          </button>

          <span className="text-xs text-gray-400">
            {index === 0 ? "Tipos" : "Total vs Plan"}
          </span>

          <button
            onClick={() => setIndex((index + 1) % 2)}
            className="w-9 h-9 rounded-lg bg-[#020617] text-white"
          >
            >
          </button>

        </div>

      </div>

      {index === 0 && <VehiculosTipoChart data={baseData} />}
      {index === 1 && <VehiculosTotalChart data={totalData} />}

      <DataModal
        open={modal}
        onClose={() => setModal(false)}
        onSave={setPlanData}
      />

    </div>
  );
};

export default VehiculosChart;
