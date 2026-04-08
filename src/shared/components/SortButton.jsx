/**
 * SortButton — botón de ordenamiento reutilizable.
 *
 * Props:
 *  active     boolean  — si este botón está activo
 *  onClick    fn
 *  icon       ReactNode — ícono opcional
 *  children   ReactNode — label
 *  activeColor string  — clase de color activo (default 'bg-blue-600')
 */
const SortButton = ({ active, onClick, icon, children, activeColor = 'bg-blue-600' }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-lg transition-all ${
      active ? `${activeColor} text-white` : 'bg-white/5 text-slate-500 hover:text-white'
    }`}
  >
    {icon && <span className="shrink-0">{icon}</span>}
    {children}
  </button>
);

export default SortButton;
