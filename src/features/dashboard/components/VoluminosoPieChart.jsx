import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TOOLTIP_STYLE } from '../../../shared/constants/design';

const TIME_RANGES = [
  { range: 'CPT 0:00-1:00', color: '#ef4444', label: 'Rojo' },
  { range: 'CPT 2:00-3:00', color: '#eab308', label: 'Amarillo' },
  { range: 'CPT 4:00-5:00', color: '#3b82f6', label: 'Azul' },
  { range: 'CPT 6:00+', color: '#22c55e', label: 'Verde' }
];

const getTimeRangeColor = (hora) => {
  const h = parseInt(hora.split(':')[0]);
  if (h >= 0 && h <= 1) return TIME_RANGES[0].color;
  if (h >= 2 && h <= 3) return TIME_RANGES[1].color;
  if (h >= 4 && h <= 5) return TIME_RANGES[2].color;
  return TIME_RANGES[3].color;
};

const getTimeRangeLabel = (hora) => {
  const h = parseInt(hora.split(':')[0]);
  if (h >= 0 && h <= 1) return TIME_RANGES[0].label;
  if (h >= 2 && h <= 3) return TIME_RANGES[1].label;
  if (h >= 4 && h <= 5) return TIME_RANGES[2].label;
  return TIME_RANGES[3].label;
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  
  const data = payload[0].payload;
  return (
    <div style={TOOLTIP_STYLE}>
      <p className="text-[10px] font-black text-white mb-1">{data.label}</p>
      <p className="text-[9px] text-slate-300">
        Voluminoso: <span className="font-black text-orange-400">{data.value.toLocaleString()}</span>
      </p>
      <p className="text-[9px] text-slate-300">
        Porcentaje: <span className="font-black text-white">{data.percentage}%</span>
      </p>
    </div>
  );
};

const VoluminosoPieChart = ({ volDataByCPT }) => {
  if (!volDataByCPT || volDataByCPT.length === 0) {
    return (
      <div className="bg-[#111827]/10 rounded-2xl border border-white/5 p-6 flex items-center justify-center h-96">
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">No hay datos disponibles</p>
      </div>
    );
  }

  // Agrupar datos por franjas horarias
  const timeRangeData = TIME_RANGES.map(range => ({
    label: range.label,
    range: range.range,
    color: range.color,
    value: 0
  }));

  volDataByCPT.forEach(item => {
    const cpt = item.cpt;
    
    if (cpt === '0:00' || cpt === '1:00') {
      timeRangeData[0].value += item.voluminoso;
    }
    else if (cpt === '2:00' || cpt === '3:00') {
      timeRangeData[1].value += item.voluminoso;
    }
    else if (cpt === '4:00' || cpt === '5:00') {
      timeRangeData[2].value += item.voluminoso;
    }
    else {
      timeRangeData[3].value += item.voluminoso;
    }
  });

  // Mostrar todas las franjas para el gráfico, incluso las que tienen 0 valores
  const chartData = timeRangeData;
  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  
  chartData.forEach(item => {
    item.percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
  });

  // Para el gráfico, solo mostrar las franjas que tienen datos > 0
  const pieData = chartData.filter(item => item.value > 0);

  return (
    <div className="bg-[#111827]/10 rounded-2xl border border-white/5 p-6">
      <div className="mb-4">
        <h3 className="text-[12px] font-black text-white uppercase tracking-widest mb-2">
          Distribución Voluminoso por Prioridad CPT
        </h3>
        <p className="text-[10px] text-slate-400 font-black">
          Total: {total.toLocaleString()} piezas voluminosas
        </p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={2}
              dataKey="value"
              label={({ percentage }) => `${percentage}%`}
              labelLine={false}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Leyenda - mostrar todas las franjas */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.color }}
            />
            <span className={`text-[9px] font-black ${item.value > 0 ? 'text-slate-300' : 'text-slate-600'}`}>
              {item.range}: {item.value.toLocaleString()} ({item.percentage}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VoluminosoPieChart;