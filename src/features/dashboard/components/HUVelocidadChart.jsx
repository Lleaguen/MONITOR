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

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-[#080c14] border border-white/10 rounded-xl p-3 shadow-xl">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{data.hora}</p>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[9px] text-red-400 font-bold">Inbound</span>
          <span className="text-[11px] font-black text-red-400">{data.arribo}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-[9px] text-emerald-400 font-bold">Bipeo HU</span>
          <span className="text-[11px] font-black text-emerald-400">{data.bipeo}</span>
        </div>
        <div className="flex items-center justify-between gap-4 pt-1 border-t border-white/10">
          <span className="text-[9px] text-white font-bold">Total</span>
          <span className="text-[11px] font-black text-white">{data.total}</span>
        </div>
      </div>
    </div>
  );
};

const HUVelocidadChart = ({ huVelocidadData }) => {
  if (!huVelocidadData) {
    return (
      <div className="bg-red-500/20 p-4 md:p-6 rounded-2xl border border-red-500/50">
        <h3 className="text-base md:text-lg font-black text-white mb-1 tracking-tight">
          Pulso de Inbound vs Bipeo HU
        </h3>
        <div className="text-center py-12 text-red-400 font-black text-[11px] uppercase tracking-widest">
          ⚠️ Sin datos disponibles
        </div>
      </div>
    );
  }

  const { velocidadPorHora, stats } = huVelocidadData;

  if (!velocidadPorHora || velocidadPorHora.length === 0) {
    return (
      <div className="bg-yellow-500/20 p-4 md:p-6 rounded-2xl border border-yellow-500/50">
        <h3 className="text-base md:text-lg font-black text-white mb-1 tracking-tight">
          Pulso de Inbound vs Bipeo HU
        </h3>
        <div className="text-center py-12 text-yellow-400 font-black text-[11px] uppercase tracking-widest">
          ⚠️ Sin datos de velocidad disponibles
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#111827]/20 p-4 md:p-6 rounded-2xl border border-white/5">
      <div className="flex flex-wrap justify-between items-end gap-3 mb-6">
        <div>
          <h3 className="text-base md:text-lg font-black text-white mb-1 tracking-tight">
            Pulso de Inbound vs Bipeo HU
          </h3>
          <p className="text-[11px] text-slate-500 font-medium italic">
            Shipments ingresados vs piezas bipeadas en HU por hora
          </p>
        </div>
        <div className="flex gap-4 text-[9px] font-black tracking-widest">
          <span className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm bg-red-500 opacity-50" /> INBOUND
          </span>
          <span className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400 opacity-50" /> BIPEO HU
          </span>
        </div>
      </div>

      <div className="h-48 sm:h-56 md:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={velocidadPorHora} barGap={4} margin={{ top: 18, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="#1e293b" strokeDasharray="3 3" />
            <XAxis
              dataKey="hora"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#475569', fontSize: 9, fontWeight: 'bold' }}
              dy={8}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b' }} />
            <Bar dataKey="arribo" name="Inbound" fill="#ef4444" fillOpacity={0.75} radius={[2, 2, 0, 0]}>
              <LabelList content={(p) => <BarLabel {...p} fill="#ef4444" />} />
            </Bar>
            <Bar dataKey="bipeo" name="Bipeo HU" fill="#34d399" fillOpacity={0.75} radius={[2, 2, 0, 0]}>
              <LabelList content={(p) => <BarLabel {...p} fill="#34d399" />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HUVelocidadChart;
