import React from 'react';
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
