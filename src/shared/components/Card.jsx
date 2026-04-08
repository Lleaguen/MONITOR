export const Card = ({ children, title, percentage, color = "blue", className = "" }) => {
  const colors = {
    blue: "text-blue-400 border-blue-500/20 shadow-blue-900/10",
    orange: "text-orange-400 border-orange-500/20 shadow-orange-900/10",
    emerald: "text-emerald-400 border-emerald-500/20 shadow-emerald-900/10",
  };

  return (
    <div className={`bg-[#111827]/60 border border-white/5 rounded-2xl p-6 relative overflow-hidden transition-all hover:border-white/10 shadow-2xl ${className}`}>
      <div className="flex justify-between items-start mb-6">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{title}</p>
        {percentage && (
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full bg-white/5 border ${colors[color]}`}>
            {percentage}%
          </span>
        )}
      </div>
      <div className="relative z-10 space-y-4">
        {children}
      </div>
      {/* El "glow" de fondo que le da estilo */}
      <div className={`absolute -bottom-10 -right-10 w-32 h-32 blur-[60px] opacity-10 rounded-full ${color === 'blue' ? 'bg-blue-500' : color === 'orange' ? 'bg-orange-500' : 'bg-emerald-500'}`} />
    </div>
  );
};
