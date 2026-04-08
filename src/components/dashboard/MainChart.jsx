import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from 'recharts';

const BarLabel = ({ x, y, width, value, fill }) => {
  if (!value || value === 0) return null;
  return (
    <text x={x + width / 2} y={y - 4} textAnchor="middle"
      fill={fill} fontSize={8} fontWeight="900">
      {value > 999 ? `${(value / 1000).toFixed(1)}k` : value}
    </text>
  );
};

const MainChart = ({ chartData }) => (
  <div className="bg-[#111827]/20 p-4 md:p-6 rounded-2xl border border-white/5">
    <div className="flex flex-wrap justify-between items-end gap-3 mb-6">
      <div>
        <h3 className="text-base md:text-lg font-black text-white mb-1 tracking-tight">Pulso de Descarga</h3>
        <p className="text-[11px] text-slate-500 font-medium italic">Paquetes arribados vs bipeados por hora</p>
      </div>
      <div className="flex gap-4 text-[9px] font-black tracking-widest">
        <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-red-500 opacity-50" /> ARRIBO</span>
        <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-emerald-400 opacity-50" /> BIPEO</span>
      </div>
    </div>
    <div className="h-48 sm:h-56 md:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} barGap={4} margin={{ top: 18, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="#1e293b" strokeDasharray="3 3" />
          <XAxis dataKey="hora" axisLine={false} tickLine={false}
            tick={{ fill: '#475569', fontSize: 9, fontWeight: 'bold' }} dy={8} />
          <YAxis hide />
          <Tooltip cursor={{ fill: '#1e293b' }}
            contentStyle={{ backgroundColor: '#080c14', border: 'none', borderRadius: '8px', fontSize: '11px' }} />
          <Bar dataKey="arribo" name="Arribo" fill="#ef4444" fillOpacity={0.75} radius={[2, 2, 0, 0]}>
            <LabelList content={(p) => <BarLabel {...p} fill="#ef4444" />} />
          </Bar>
          <Bar dataKey="bipeo" name="Bipeo" fill="#34d399" fillOpacity={0.75} radius={[2, 2, 0, 0]}>
            <LabelList content={(p) => <BarLabel {...p} fill="#34d399" />} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default MainChart;
