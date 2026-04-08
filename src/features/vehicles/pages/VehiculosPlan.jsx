import {
  BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { mergePlanConReal } from '../../../core/vehiculosPlan.js';

const tooltipStyle = {
  backgroundColor: '#080c14',
  border: 'none',
  borderRadius: '8px',
  fontSize: '11px',
};

/* ─── Chart individual por tipo ─────────────────────────────────── */

const TipoChart = ({ title, subtitle, dataKey, planKey, color, data }) => {
  const filtered = data.filter(d => d[dataKey] > 0 || d[planKey] > 0);

  return (
    <div className="bg-[#111827]/20 p-4 md:p-6 rounded-2xl border border-white/5">
      <div className="flex flex-wrap justify-between items-end gap-3 mb-6">
        <div>
          <h3 className="text-base md:text-lg font-black text-white mb-1 tracking-tight">{title}</h3>
          <p className="text-[11px] text-slate-500 font-medium italic">{subtitle}</p>
        </div>
        <div className="flex gap-4 text-[9px] font-black tracking-widest">
          <span className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm bg-violet-400 opacity-75" /> MELI
          </span>
          <span className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm opacity-70" style={{ backgroundColor: color }} /> CIU
          </span>
        </div>
      </div>
      <div className="h-48 sm:h-56 md:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={filtered} barGap={4}>
            <CartesianGrid vertical={false} stroke="#1e293b" strokeDasharray="3 3" />
            <XAxis dataKey="hora" axisLine={false} tickLine={false}
              tick={{ fill: '#475569', fontSize: 9, fontWeight: 'bold' }} dy={8} />
            <YAxis axisLine={false} tickLine={false}
              tick={{ fill: '#334155', fontSize: 9 }} width={20} />
            <Tooltip cursor={{ fill: '#1e293b' }} contentStyle={tooltipStyle} />
            <Bar dataKey={planKey} name="Meli" fill="#a78bfa" fillOpacity={0.75} radius={[2, 2, 0, 0]} />
            <Bar dataKey={dataKey} name="Ciu" fill={color} fillOpacity={0.75} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

/* ─── Página ─────────────────────────────────────────────────────── */

const VehiculosPlan = ({ data, planVehiculos }) => {
  if (!data) return null;

  const mergedData = mergePlanConReal(data.vehiculosChartData || [], planVehiculos || data.planVehiculos || []);

  const hasPlan = mergedData.some(d => d.planChasis > 0 || d.planCamioneta > 0 || d.planSemi > 0);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">

      {!hasPlan && (
        <div className="px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-yellow-500">
            Sin plan cargado — ingresá el plan desde Centro de Mando → Cargar Plan
          </p>
        </div>
      )}

      <TipoChart
        title="Chasis — Real vs Plan"
        subtitle="Vehículos tipo chasis arribados vs planificados por hora"
        dataKey="chasis"
        planKey="planChasis"
        color="#34d399"
        data={mergedData}
      />

      <TipoChart
        title="Camioneta — Real vs Plan"
        subtitle="Vehículos tipo camioneta arribados vs planificados por hora"
        dataKey="camioneta"
        planKey="planCamioneta"
        color="#ffab00"
        data={mergedData}
      />

      <TipoChart
        title="Semi — Real vs Plan"
        subtitle="Vehículos tipo semi arribados vs planificados por hora"
        dataKey="semi"
        planKey="planSemi"
        color="#60a5fa"
        data={mergedData}
      />

    </div>
  );
};

export default VehiculosPlan;
