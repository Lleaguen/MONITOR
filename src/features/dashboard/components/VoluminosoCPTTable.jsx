import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const CPT_ORDER = ['0:00', '1:00', '2:00', '3:00', '4:00', '5:00', '6:00', '7:00', '8:00', '9:00', '10:00', '11:00', '13:00'];

const TooltipPieChart = ({ data }) => {
  const chartData = [
    { name: 'Procesado', value: data.voluminosoProcesado || 0, color: '#22c55e' },
    { name: 'Pendiente', value: data.voluminosoPendiente || 0, color: '#f97316' }
  ].filter(item => item.value > 0);

  if (chartData.length === 0) return null;

  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  chartData.forEach(item => {
    item.percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
  });

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="10"
        fontWeight="bold"
      >
        {`${percentage}%`}
      </text>
    );
  };

  return (
    <div className="w-32 h-32">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={50}
            dataKey="value"
            label={renderCustomLabel}
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const VoluminosoCPTTable = ({ volDataByCPT }) => {
  const [hoveredCPT, setHoveredCPT] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  if (!volDataByCPT || volDataByCPT.length === 0) {
    return (
      <div className="bg-[#111827]/10 rounded-2xl border border-white/5 p-6 flex items-center justify-center h-96">
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">No hay datos disponibles</p>
      </div>
    );
  }

  // Crear un mapa de datos por CPT
  const cptDataMap = {};
  volDataByCPT.forEach(item => {
    cptDataMap[item.cpt] = item;
  });

  // Ordenar por CPT_ORDER y filtrar solo los que tienen voluminoso
  const tableData = CPT_ORDER
    .map(cpt => cptDataMap[cpt])
    .filter(item => item && item.voluminoso > 0)
    .map(item => ({
      ...item,
      total: item.voluminoso + item.paqueteria,
      voluminosoPercent: item.voluminoso > 0 ? 
        Math.round((item.voluminoso / (item.voluminoso + item.paqueteria)) * 100) : 0
    }));

  const totalVoluminoso = tableData.reduce((sum, item) => sum + item.voluminoso, 0);

  const handleMouseEnter = (item, event) => {
    setHoveredCPT(item);
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseMove = (event) => {
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredCPT(null);
  };

  return (
    <div className="bg-[#111827]/10 rounded-2xl border border-white/5 p-6 relative">
      <div className="mb-4">
        <h3 className="text-[12px] font-black text-white uppercase tracking-widest mb-2">
          Voluminoso por CPT
        </h3>
        <p className="text-[10px] text-slate-400 font-black">
          {tableData.length} CPTs con voluminoso
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] border-b border-white/10">
              <th className="px-3 py-3">CPT</th>
              <th className="py-3 text-right">Voluminoso</th>
              <th className="py-3 text-right">Procesado</th>
              <th className="py-3 text-right">Pendiente</th>
              <th className="py-3 text-right">%</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr 
                key={row.cpt} 
                className="border-b border-white/[0.03] text-[10px] hover:bg-white/[0.02] transition-colors cursor-pointer"
                onMouseEnter={(e) => handleMouseEnter(row, e)}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <td className="px-3 py-3 font-black text-blue-400">{row.cpt}</td>
                <td className="py-3 text-right font-black text-orange-400">
                  {row.voluminoso.toLocaleString()}
                </td>
                <td className="py-3 text-right font-black text-green-400">
                  {(row.voluminosoProcesado || 0).toLocaleString()}
                </td>
                <td className="py-3 text-right font-black text-orange-300">
                  {(row.voluminosoPendiente || 0).toLocaleString()}
                </td>
                <td className="py-3 text-right font-black text-slate-300">
                  {Math.round((row.voluminoso / totalVoluminoso) * 100)}%
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-white/10 bg-white/[0.03] text-[10px]">
              <td className="px-3 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Total
              </td>
              <td className="py-3 text-right font-black text-orange-400">
                {totalVoluminoso.toLocaleString()}
              </td>
              <td className="py-3 text-right font-black text-green-400">
                {tableData.reduce((sum, item) => sum + (item.voluminosoProcesado || 0), 0).toLocaleString()}
              </td>
              <td className="py-3 text-right font-black text-orange-300">
                {tableData.reduce((sum, item) => sum + (item.voluminosoPendiente || 0), 0).toLocaleString()}
              </td>
              <td className="py-3 text-right font-black text-slate-300">100%</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Tooltip con gráfico de torta */}
      {hoveredCPT && (
        <div 
          className="fixed z-50 bg-[#111827] border border-white/20 rounded-lg p-4 pointer-events-none"
          style={{
            left: mousePosition.x + 10,
            top: mousePosition.y - 80,
            transform: mousePosition.x > window.innerWidth - 200 ? 'translateX(-100%)' : 'none'
          }}
        >
          <div className="text-center mb-2">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
              CPT {hoveredCPT.cpt}
            </p>
            <p className="text-[9px] text-slate-400">
              Total: {hoveredCPT.voluminoso.toLocaleString()} voluminoso
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <TooltipPieChart data={hoveredCPT} />
            <div className="text-[9px] space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-slate-300">
                  Procesado: {(hoveredCPT.voluminosoProcesado || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="text-slate-300">
                  Pendiente: {(hoveredCPT.voluminosoPendiente || 0).toLocaleString()}
                </span>
              </div>
              <div className="text-slate-400 pt-1 border-t border-white/10">
                {(hoveredCPT.voluminosoProcesado || 0) + (hoveredCPT.voluminosoPendiente || 0) > 0 ? 
                  Math.round(((hoveredCPT.voluminosoProcesado || 0) / ((hoveredCPT.voluminosoProcesado || 0) + (hoveredCPT.voluminosoPendiente || 0))) * 100) : 0
                }% procesado
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas adicionales */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="text-center">
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">
            Total Voluminoso
          </p>
          <p className="text-[12px] font-black text-orange-400">
            {totalVoluminoso.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoluminosoCPTTable;