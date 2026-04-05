/**
 * StatCard — card reutilizable para mostrar una métrica.
 *
 * Props:
 *  label      string   — etiqueta superior
 *  value      string|number — valor principal
 *  sub        string   — texto secundario opcional
 *  color      'default' | 'emerald' | 'orange' | 'red' | 'blue' | 'yellow'
 *  className  string   — clases extra
 */
const COLORS = {
  default:  'bg-[#111827]/60 border-white/5',
  emerald:  'bg-emerald-500/10 border-emerald-500/20',
  orange:   'bg-orange-500/10 border-orange-500/20',
  red:      'bg-red-500/10 border-red-500/20',
  blue:     'bg-blue-600/10 border-blue-500/20',
  yellow:   'bg-yellow-500/10 border-yellow-500/20',
};

const LABEL_COLORS = {
  default:  'text-slate-500',
  emerald:  'text-emerald-400',
  orange:   'text-orange-400',
  red:      'text-red-400',
  blue:     'text-blue-400',
  yellow:   'text-yellow-400',
};

const StatCard = ({ label, value, sub, color = 'default', className = '' }) => (
  <div className={`rounded-2xl border p-5 ${COLORS[color]} ${className}`}>
    <p className={`text-[9px] font-black uppercase tracking-widest mb-2 ${LABEL_COLORS[color]}`}>{label}</p>
    <p className="text-3xl font-black text-white italic">{value}</p>
    {sub && <p className="text-[9px] text-slate-500 mt-1">{sub}</p>}
  </div>
);

export default StatCard;
