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

const HOURS = Array.from({ length: 15 }, (_, i) => {
  const h = i + 9;
  return `${h.toString().padStart(2, "0")}:00`;
});

const normalizeData = (arr = []) => {
  return arr.map(d => ({
    hora: d.hora || "",
    chasis: Number(d.chasis ?? 0),
    camioneta: Number(d.camioneta ?? 0),
    semi: Number(d.semi ?? 0),
    plan: Number(d.plan ?? 0),
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
      <text x={x} y={y - 11} textAnchor="middle" fill="white" fontSize={8}>
        {value}
      </text>
    </g>
  );
};

const CustomDot = ({ cx, cy, stroke }) => (
  <circle cx={cx} cy={cy} r={3} fill={stroke} />
);

/* ===================== GRAFICO 1 ===================== */

const VehiculosTipoChart = ({ data }) => {
  const filtered = data.filter(d => d.chasis || d.camioneta || d.semi);

  return (
    <div className="bg-[#111827]/20 p-4 rounded-2xl border border-white/5">
      <h3 className="text-white font-bold mb-4">Arribo por Tipo</h3>

      <div className="h-64">
        <ResponsiveContainer>
          <ComposedChart data={filtered}>
            <CartesianGrid stroke="#1e293b" strokeDasharray="4 4" />
            <XAxis dataKey="hora" />
            <YAxis />
            <Tooltip />

            <Line dataKey="chasis" stroke="#34d399" dot={<CustomDot stroke="#34d399" />}/>
            <Line dataKey="camioneta" stroke="#ffab00" dot={<CustomDot stroke="#ffab00" />}/>
            <Line dataKey="semi" stroke="#60a5fa" dot={<CustomDot stroke="#60a5fa" />}/>

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
    HOURS.map(h => ({ hora: h, total: "", plan: "" }))
  );

  if (!open) return null;

  const update = (i, field, val) => {
    const copy = [...rows];
    copy[i][field] = val;
    setRows(copy);
  };

  const save = () => {

    const formatted = rows.map(r => {
      const total = Number(r.total) || 0;

      return {
        hora: r.hora,
        chasis: Math.round(total * 0.4),
        camioneta: Math.round(total * 0.3),
        semi: Math.round(total * 0.3),
        plan: Number(r.plan) || 0
      };
    });

    onSave(formatted);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
      <div className="bg-[#0f172a] p-6 rounded-2xl w-full max-w-3xl border border-white/10">

        <h2 className="text-white mb-4 font-semibold">Carga de Plan</h2>

        <div className="grid grid-cols-3 gap-2 text-white text-sm mb-2">
          <span>Hora</span>
          <span>Total</span>
          <span>Plan</span>
        </div>

        <div className="space-y-2 max-h-80 overflow-auto">
          {rows.map((r, i) => (
            <div key={i} className="grid grid-cols-3 gap-2">
              <div className="bg-[#020617] px-2 py-1 rounded">{r.hora}</div>

              <input
                className="bg-[#020617] text-white px-2 py-1 rounded"
                type="number"
                placeholder="Real"
                onChange={e => update(i, 'total', e.target.value)}
              />

              <input
                className="bg-[#020617] text-white px-2 py-1 rounded"
                type="number"
                placeholder="Plan"
                onChange={e => update(i, 'plan', e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button className="bg-red-500 px-3 py-1 rounded" onClick={onClose}>
            Cancelar
          </button>
          <button className="bg-green-500 px-3 py-1 rounded" onClick={save}>
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
  const [customData, setCustomData] = useState([]);
  const [index, setIndex] = useState(0);

  const baseData = normalizeData(vehiculosChartData || []);

  const totalData = mergeData(baseData, customData);

  return (
    <div className="space-y-4">

      {/* BOTONES */}
      <div className="flex justify-between items-center">

        <button
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl"
          onClick={() => setModal(true)}
        >
          Cargar Datos
        </button>

        <div className="flex gap-2">
          <button
            className="bg-[#1e293b] text-white px-3 py-1 rounded"
            onClick={() => setIndex((index - 1 + 2) % 2)}
          >
            ◀
          </button>
          <button
            className="bg-[#1e293b] text-white px-3 py-1 rounded"
            onClick={() => setIndex((index + 1) % 2)}
          >
            ▶
          </button>
        </div>

      </div>

      {/* CARRUSEL */}
      {index === 0 && <VehiculosTipoChart data={baseData} />}
      {index === 1 && <VehiculosTotalChart data={totalData} />}

      <DataModal
        open={modal}
        onClose={() => setModal(false)}
        onSave={setCustomData}
      />

    </div>
  );
};

export default VehiculosChart;
