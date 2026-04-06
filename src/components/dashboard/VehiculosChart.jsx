/*import React from 'react';
import { ComposedChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from 'recharts';

const PillLabel = ({ x, y, value, color }) => {
  if (!value || value === 0) return null;
  const w = value > 9 ? 22 : 18;
  const h = 14;
  return (
    <g>
      <rect x={x - w / 2} y={y - h - 6} width={w} height={h} rx={4} fill={color} opacity={0.9} />
      <text x={x} y={y - h / 2 - 6} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={8} fontWeight="900">{value}</text>
    </g>
  );
};

const ChasisLabel    = (props) => <PillLabel {...props} color="#34d399" />;
const CamionetaLabel = (props) => <PillLabel {...props} color="#ffab00" />;
const SemiLabel      = (props) => <PillLabel {...props} color="#60a5fa" />;
const CustomDot      = ({ cx, cy, stroke }) => <circle cx={cx} cy={cy} r={3} fill={stroke} stroke="none" />;

const VehiculosChart = ({ vehiculosChartData }) => {
  const data = (vehiculosChartData || []).filter(d => d.chasis > 0 || d.camioneta > 0 || d.semi > 0);

  return (
    <div className="bg-[#111827]/20 p-4 md:p-6 rounded-2xl border border-white/5">
      <div className="flex flex-wrap justify-between items-end gap-3 mb-6">
        <div>
          <h3 className="text-base md:text-lg font-black text-white mb-1 tracking-tight">Arribo por Tipo de Vehículo</h3>
          <p className="text-[11px] text-slate-500 italic">Vehículos anunciados en guardia por hora</p>
        </div>
        <div className="flex flex-wrap gap-4 text-[9px] font-black tracking-widest">
          <span className="flex items-center gap-2"><div className="w-3 h-[2px] bg-emerald-400 rounded-full" /> CHASIS</span>
          <span className="flex items-center gap-2"><div className="w-3 h-[2px] bg-[#ffab00] rounded-full" /> CAMIONETA</span>
          <span className="flex items-center gap-2"><div className="w-3 h-[2px] bg-blue-400 rounded-full" /> SEMI</span>
        </div>
      </div>
      <div className="h-56 sm:h-64 md:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 28, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="#1e293b" strokeDasharray="4 4" />
            <XAxis dataKey="hora" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 9, fontWeight: 700 }} dy={8} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#334155', fontSize: 9 }} width={20} />
            <Tooltip cursor={{ fill: '#1e293b' }} contentStyle={{ backgroundColor: '#080c14', border: 'none', borderRadius: '8px', fontSize: '11px' }} />
            <Line type="monotoneX" dataKey="chasis" name="Chasis" stroke="#34d399" strokeWidth={2.5} dot={<CustomDot stroke="#34d399" />} activeDot={{ r: 5, fill: '#34d399', stroke: '#080c14', strokeWidth: 2 }}>
              <LabelList content={<ChasisLabel />} />
            </Line>
            <Line type="monotoneX" dataKey="camioneta" name="Camioneta" stroke="#ffab00" strokeWidth={2.5} dot={<CustomDot stroke="#ffab00" />} activeDot={{ r: 5, fill: '#ffab00', stroke: '#080c14', strokeWidth: 2 }}>
              <LabelList content={<CamionetaLabel />} />
            </Line>
            <Line type="monotoneX" dataKey="semi" name="Semi" stroke="#60a5fa" strokeWidth={2.5} dot={<CustomDot stroke="#60a5fa" />} activeDot={{ r: 5, fill: '#60a5fa', stroke: '#080c14', strokeWidth: 2 }}>
              <LabelList content={<SemiLabel />} />
            </Line>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default VehiculosChart;
*/
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

/* ===================== BASE ===================== */

const PillLabel = ({ x, y, value, color }) => {
  if (!value || value === 0) return null;
  const w = value > 9 ? 22 : 18;
  const h = 14;

  return (
    <g>
      <rect x={x - w / 2} y={y - h - 6} width={w} height={h} rx={4} fill={color} opacity={0.9} />
      <text x={x} y={y - h / 2 - 6} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={8} fontWeight="900">
        {value}
      </text>
    </g>
  );
};

const CustomDot = ({ cx, cy, stroke }) => (
  <circle cx={cx} cy={cy} r={3} fill={stroke} stroke="none" />
);

/* ===================== GRAFICO ORIGINAL ===================== */

const VehiculosTipoChart = ({ data }) => {
  const filtered = (data || []).filter(d => d.chasis > 0 || d.camioneta > 0 || d.semi > 0);

  return (
    <div className="bg-[#111827]/20 p-4 md:p-6 rounded-2xl border border-white/5">
      <h3 className="text-white font-black mb-4">Arribo por Tipo de Vehículo</h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={filtered}>
            <CartesianGrid stroke="#1e293b" strokeDasharray="4 4" />
            <XAxis dataKey="hora" tick={{ fill: '#475569', fontSize: 9 }} />
            <YAxis tick={{ fill: '#334155', fontSize: 9 }} />
            <Tooltip />

            <Line dataKey="chasis" stroke="#34d399" dot={<CustomDot stroke="#34d399" />}>
              <LabelList content={(p) => <PillLabel {...p} color="#34d399" />} />
            </Line>

            <Line dataKey="camioneta" stroke="#ffab00" dot={<CustomDot stroke="#ffab00" />}>
              <LabelList content={(p) => <PillLabel {...p} color="#ffab00" />} />
            </Line>

            <Line dataKey="semi" stroke="#60a5fa" dot={<CustomDot stroke="#60a5fa" />}>
              <LabelList content={(p) => <PillLabel {...p} color="#60a5fa" />} />
            </Line>

          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

/* ===================== TOTAL VS PLAN ===================== */

const VehiculosTotalChart = ({ data }) => {

  const formatted = (data || []).map(d => ({
    ...d,
    real: (d.chasis || 0) + (d.camioneta || 0) + (d.semi || 0)
  }));

  return (
    <div className="bg-[#111827]/20 p-4 md:p-6 rounded-2xl border border-white/5">
      <h3 className="text-white font-black mb-4">Total vs Plan</h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={formatted}>

            <defs>
              <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3}/>
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0}/>
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#1e293b" strokeDasharray="4 4" />
            <XAxis dataKey="hora" tick={{ fill: '#475569', fontSize: 9 }} />
            <YAxis tick={{ fill: '#334155', fontSize: 9 }} />
            <Tooltip />

            <Area dataKey="real" fill="url(#area)" stroke="none" />

            <Line dataKey="plan" stroke="#a78bfa" strokeDasharray="5 5" dot={<CustomDot stroke="#a78bfa" />} />

            <Line dataKey="real" stroke="#22c55e" dot={<CustomDot stroke="#22c55e" />}>
              <LabelList content={(p) => (
                <PillLabel {...p} color={p.value >= (p.payload.plan || 0) ? "#22c55e" : "#ef4444"} />
              )} />
            </Line>

          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

/* ===================== MODAL ===================== */

const DataModal = ({ open, onClose, onSave }) => {
  const [rows, setRows] = useState([]);

  if (!open) return null;

  const update = (i, field, val) => {
    const copy = [...rows];
    copy[i][field] = val;
    setRows(copy);
  };

  const add = () => setRows([...rows, { hora: '', chasis: '', camioneta: '', semi: '', plan: '' }]);

  const save = () => {
    const formatted = rows.map(r => ({
      hora: r.hora,
      chasis: +r.chasis || 0,
      camioneta: +r.camioneta || 0,
      semi: +r.semi || 0,
      plan: +r.plan || 0
    }));
    onSave(formatted);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
      <div className="bg-[#0f172a] p-6 rounded-xl w-full max-w-3xl">

        <h2 className="text-white mb-4 font-bold">Cargar datos</h2>

        <div className="space-y-2 max-h-80 overflow-auto">
          {rows.map((r, i) => (
            <div key={i} className="flex gap-2">
              <input placeholder="Hora" onChange={e => update(i, 'hora', e.target.value)} className="bg-black text-white p-1 w-20"/>
              <input placeholder="Chasis" type="number" onChange={e => update(i, 'chasis', e.target.value)} className="bg-black text-white p-1 w-20"/>
              <input placeholder="Camioneta" type="number" onChange={e => update(i, 'camioneta', e.target.value)} className="bg-black text-white p-1 w-24"/>
              <input placeholder="Semi" type="number" onChange={e => update(i, 'semi', e.target.value)} className="bg-black text-white p-1 w-20"/>
              <input placeholder="Plan" type="number" onChange={e => update(i, 'plan', e.target.value)} className="bg-black text-white p-1 w-20"/>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-4">
          <button onClick={add} className="text-blue-400 text-xs">+ fila</button>
          <div className="flex gap-2">
            <button onClick={onClose} className="text-gray-400 text-xs">Cancelar</button>
            <button onClick={save} className="bg-green-500 px-3 py-1 text-xs rounded">Guardar</button>
          </div>
        </div>

      </div>
    </div>
  );
};

/* ===================== MAIN ===================== */

const VehiculosChart = ({ vehiculosChartData = [] }) => {

  const [modal, setModal] = useState(false);
  const [customData, setCustomData] = useState(null);
  const [index, setIndex] = useState(0);

  // 🔥 CLAVE: usa props o datos del modal
  const data = customData || vehiculosChartData;

  return (
    <div>

      <button onClick={() => setModal(true)} className="mb-4 bg-blue-500 px-4 py-2 text-white rounded">
        Cargar Datos
      </button>

      {index === 0 && <VehiculosTipoChart data={data} />}
      {index === 1 && <VehiculosTotalChart data={data} />}

      <div className="flex justify-between mt-2">
        <button onClick={() => setIndex((index - 1 + 2) % 2)}>◀</button>
        <button onClick={() => setIndex((index + 1) % 2)}>▶</button>
      </div>

      <DataModal
        open={modal}
        onClose={() => setModal(false)}
        onSave={setCustomData}
      />

    </div>
  );
};

export default VehiculosChart;
