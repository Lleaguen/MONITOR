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
  
  const data = payload[0].payload;
  
  return (
    <div className="bg-[#111827] border border-white/20 rounded-lg p-3 shadow-lg">
      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">
        Hora: {label}
      </p>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[9px] text-slate-400">Total ingresado:</span>
          <span className="text-[9px] font-black text-white">{data.cantidadTotal.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[9px] text-slate-400">Voluminoso:</span>
          <span className="text-[9px] font-black text-orange-400">{data.cantidadVoluminoso.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between gap-3 pt-1 border-t border-white/10">
          <span className="text-[9px] text-slate-400">% Voluminoso:</span>
          <span className="text-[10px] font-black text-orange-400">{data.pctVoluminoso}%</span>
        </div>
      </div>
    </div>
  );
};

const CustomLabel = ({ x, y, width, value, fill }) => {
  if (value === 0) return null;
  
  return (
    <text 
      x={x + width / 2} 
      y={y - 2} 
      fill={fill} 
      textAnchor="middle" 
      fontSize="8" 
      fontWeight="900"
    >
      {value > 999 ? `${(value / 1000).toFixed(1)}k` : value}
    </text>
  );
};

const CustomLabelPercent = ({ x, y, width, value }) => {
  if (value === 0) return null;
  
  return (
    <text 
      x={x + width / 2} 
      y={y - 2} 
      fill="#f97316" 
      textAnchor="middle" 
      fontSize="8" 
      fontWeight="900"
    >
      {value}%
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
    .filter(item => (item.voluminoso + item.paqueteria) > 0) // Solo mostrar horas con datos
    .map(item => {
      const totalHora = item.voluminoso + item.paqueteria;
      const pctVoluminoso = totalHora > 0 ? Math.round((item.voluminoso / totalHora) * 100) : 0;
      return {
        hora: item.hora,
        pctVoluminoso: pctVoluminoso,
        cantidadVoluminoso: item.voluminoso,
        cantidadTotal: totalHora,
        procesado: item.procesado || 0,
        pendiente: item.pendiente || 0
      };
    })
    .sort((a, b) => a.hora.localeCompare(b.hora));

  const totalVoluminoso = volDataByHora.reduce((sum, item) => sum + item.voluminoso, 0);
  const totalPaqueteria = volDataByHora.reduce((sum, item) => sum + item.paqueteria, 0);
  const totalIngresado = totalVoluminoso + totalPaqueteria;
  const pctVoluminosoTotal = totalIngresado > 0 ? Math.round((totalVoluminoso / totalIngresado) * 100) : 0;
  const totalProcesado = chartData.reduce((sum, item) => sum + item.procesado, 0);
  const totalPendiente = chartData.reduce((sum, item) => sum + item.pendiente, 0);

  return (
    <div className="bg-[#111827]/10 rounded-2xl border border-white/5 p-6">
      <div className="mb-4">
        <h3 className="text-[12px] font-black text-white uppercase tracking-widest mb-2">
          Avance Voluminoso por Hora
        </h3>
        <div className="grid grid-cols-4 gap-2 text-center text-[8px]">
          <div>
            <p className="text-slate-500 font-black uppercase tracking-widest">Total</p>
            <p className="text-blue-400 font-black text-[10px]">{totalIngresado.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-slate-500 font-black uppercase tracking-widest">% Vol.</p>
            <p className="text-orange-400 font-black text-[10px]">{pctVoluminosoTotal}%</p>
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
              dataKey="pctVoluminoso" 
              name="% Voluminoso" 
              fill="#f97316" 
              radius={[2, 2, 0, 0]}
              yAxisId="percent"
            >
              <LabelList content={<CustomLabelPercent />} />
            </Bar>
            <Bar 
              dataKey="procesado" 
              name="Procesado" 
              fill="#22c55e" 
              radius={[2, 2, 0, 0]}
              yAxisId="cantidad"
            >
              <LabelList content={(p) => <CustomLabel {...p} fill="#22c55e" />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default VoluminosoHourlyChart;