import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const MainChart = ({ chartData }) => {
  return (
    <div className="bg-[#111827]/20 p-6 rounded-2xl border border-white/5 h-[400px]">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h3 className="text-lg font-black text-white mb-1 tracking-tight">Kinetic Pulse Chart</h3>
          <p className="text-[11px] text-slate-500 font-medium italic">Hourly Arribo vs Bipeo Dynamics</p>
        </div>
        <div className="flex gap-6 text-[9px] font-black tracking-widest">
          <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-[#334155] rounded-sm" /> ARRIBO</span>
          <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-[#94a3b8] rounded-sm" /> BIPEO</span>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={6}>
            <CartesianGrid vertical={false} stroke="#1e293b" strokeDasharray="3 3" />
            <XAxis dataKey="hora" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 'bold'}} dy={10} />
            <YAxis hide />
            <Tooltip 
              cursor={{fill: '#1e293b'}} 
              contentStyle={{backgroundColor: '#080c14', border: 'none', borderRadius: '8px', fontSize: '12px'}} 
            />
            <Bar dataKey="arribo" fill="#334155" radius={[2, 2, 0, 0]} />
            <Bar dataKey="bipeo" fill="#94a3b8" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MainChart;
