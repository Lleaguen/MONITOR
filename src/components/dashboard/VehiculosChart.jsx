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

/* ===================== HELPERS ===================== */

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = 10 + Math.floor(i / 2);
  const m = i % 2 === 0 ? "00" : "30";
  return `${h.toString().padStart(2, "0")}:${m}`;
}).filter(h => h <= "21:30");

const normalizeData = (arr = []) => {
  return arr.map(d => ({
    hora: d.hora || d.HORA || "",
    chasis: Number(d.chasis ?? d.CHASIS ?? 0),
    camioneta: Number(d.camioneta ?? d.CAMIONETA ?? 0),
    semi: Number(d.semi ?? d.SEMI ?? 0),
  }));
};

const mergeData = (base = [], planData = []) => {
  const planMap = Object.fromEntries(
    planData.map(d => [d.hora, Number(d.plan) || 0])
  );

  return base.map(d => {
    const real =
      (Number(d.chasis) || 0) +
      (Number(d.camioneta) || 0) +
      (Number(d.semi) || 0);

    return {
      hora: d.hora,
      real,
      plan: planMap[d.hora] || 0
    };
  });
};

const PillLabel = ({ x, y, value, color }) => {
  if (!value || value === 0) return null;

  return (
    <g>
      <rect x={x - 10} y={y - 18} width={22} height={14} rx={4} fill={color} />
      <text x={x} y={y - 10} textAnchor="middle" fill="white" fontSize={8}>
        {value}
      </text>
    </g>
  );
};

/* ===================== GRAFICOS ===================== */

const VehiculosTipoChart = ({ data }) => (
  <div className="bg-[#111827]/20 p-4 rounded-2xl border border-white/5">
    <h3 className="text-white font-bold mb-4">Arribo por Tipo</h3>
    <div className="h-64">
      <ResponsiveContainer>
        <ComposedChart data={data}>
          <CartesianGrid stroke="#1e293b" strokeDasharray="4 4" />
          <XAxis dataKey="hora" />
          <YAxis />
          <Tooltip />
          <Line dataKey="chasis" stroke="#34d399" />
          <Line dataKey="camioneta" stroke="#ffab00" />
          <Line dataKey="semi" stroke="#60a5fa" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  </div>
);

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
              <LabelList content={(p) => {
                if (!p || !p.payload) return null;

                const plan = Number(p.payload.plan || 0);
                const value = Number(p.value || 0);

                return (
                  <PillLabel
                    {...p}
                    color={value >= plan ? "#22c55e" : "#ef4444"}
                  />
                );
              }} />
            </Line>

          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

/* ===================== MODAL ===================== */

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
              <span className="w-20">{r.hora}</span>
              <input
                className="bg-[#020617] px-2 py-1 rounded w-32"
                type="number"
                placeholder="Total"
                onChange={e => update(i, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-red-500/90 hover:bg-red-500 text-white text-sm font-medium transition"
          >
            Cancelar
          </button>
          <button
            onClick={save}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition"
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
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-indigo-500/20"
        >
          Cargar Plan
        </button>

        <div className="flex items-center gap-3">

          <button
            onClick={() => setIndex((index - 1 + 2) % 2)}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#020617] border border-white/10 hover:border-indigo-500 hover:text-indigo-400 text-white transition-all"
          >
            ◀
          </button>

          <span className="text-xs text-gray-400">
            {index === 0 ? "Tipos" : "Total vs Plan"}
          </span>

          <button
            onClick={() => setIndex((index + 1) % 2)}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#020617] border border-white/10 hover:border-indigo-500 hover:text-indigo-400 text-white transition-all"
          >
            ▶
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
