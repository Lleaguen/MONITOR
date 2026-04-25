import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LabelList } from 'recharts';
import { TOOLTIP_STYLE } from '../../../shared/constants/design';

const formatNumber = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  
  return (
    <div className="bg-[#111827] border border-white/20 rounded-lg p-3 shadow-lg">
      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">
        Hora: {label}
      </p>
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-[9px] text-slate-300">
              {entry.name}: 
            </span>
            <span className="text-[9px] font-black text-white">
              {entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const CustomLabel = ({ x, y, width, value }) => {
  if (value === 0) return null;
  
  return (
    <text 
      x={x + width / 2} 
      y={y - 2} 
      fill="#94a3b8" 
      textAnchor="middle" 
      fontSize="7" 
      fontWeight="bold"
    >
      {formatNumber(value)}
    </text>
  );
};

const VoluminosoHourlyChart = ({ volDataByHora }) => {
  if (!volDataByHora || volDataByHora.length === 0) {
    return (
      <div className="bg-[#111827]/10 rounded-2xl border border-white/5 p-6 flex items-center justify-center h-64">
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">No hay datos disponibles</p>
      </div>
    );
  }

  // Preparar datos para el gráfico
  const chartData = volDataByHora
    .filter(item => item.voluminoso > 0) // Solo mostrar horas con voluminoso
    .map(item => ({
      hora: item.hora,
      ingresado: item.voluminoso,
      procesado: item.procesado || 0,
      pendiente: item.pendiente || 0
    }))
    .sort((a, b) => a.hora.localeCompare(b.hora));

  const totalIngresado = chartData.reduce((sum, item) => sum + item.ingresado, 0);
  const totalProcesado = chartData.reduce((sum, item) => sum + item.procesado, 0);
  const totalPendiente = chartData.reduce((sum, item) => sum + item.pendiente, 0);

  return (
    <div className="bg-[#111827]/10 rounded-2xl border border-white/5 p-6">
      <div className="mb-4">
        <h3 className="text-[12px] font-black text-white uppercase tracking-widest mb-2">
          Avance Voluminoso por Hora
        </h3>
        <div className="grid grid-cols-3 gap-2 text-center text-[8px]">
          <div>
            <p className="text-slate-500 font-black uppercase tracking-widest">Ingresado</p>
            <p className="text-orange-400 font-black text-[10px]">{totalIngresado.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-slate-500 font-black uppercase tracking-widest">Procesado</p>
            <p className="text-green-400 font-black text-[10px]">{totalProcesado.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-slate-500 font-black uppercase tracking-widest">Pendiente</p>
            <p className="text-red-400 font-black text-[10px]">{totalPendiente.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 15, right: 5, left: 5, bottom: 5 }}>
            <XAxis 
              dataKey="hora" 
              tick={{ fontSize: 8, fill: '#94a3b8' }}
              axisLine={{ stroke: '#374151' }}
              tickLine={{ stroke: '#374151' }}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="ingresado" 
              name="Ingresado" 
              fill="#f97316" 
              radius={[1, 1, 0, 0]}
            >
              <LabelList content={<CustomLabel />} />
            </Bar>
            <Bar 
              dataKey="procesado" 
              name="Procesado" 
              fill="#22c55e" 
              radius={[1, 1, 0, 0]}
            >
              <LabelList content={<CustomLabel />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default VoluminosoHourlyChart;