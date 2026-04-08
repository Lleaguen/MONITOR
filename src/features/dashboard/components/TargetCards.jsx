import { useState } from 'react';
import { Card } from '../../../shared/components/Card.jsx';

const COLORS = {
  '14HS': { bar: 'bg-blue-500',    border: 'border-blue-500',    text: 'text-blue-400',    glow: 'shadow-blue-500/20' },
  '16HS': { bar: 'bg-[#00f2ad]',   border: 'border-[#00f2ad]',   text: 'text-[#00f2ad]',   glow: 'shadow-[#00f2ad]/20' },
  '18HS': { bar: 'bg-orange-500',  border: 'border-orange-500',  text: 'text-orange-400',  glow: 'shadow-orange-500/20' },
  '20HS': { bar: 'bg-[#33C8FF]' ,  border: 'border-[#33C8FF]',   text: 'text-[#33C8FF] ',  glow: 'shadow-[#33C8FF]/20'},
};

const fmt = (n) => Math.round(n).toLocaleString('es-AR');
const pct = (n) => `${n.toFixed(2).replace('.', ',')}%`;

const InfoTooltip = ({ t, color }) => (
  <div className="absolute bottom-full right-0 mb-2 z-30 w-56 pointer-events-none">
    <div className={`bg-[#0d1525] border ${color.border} border-opacity-40 rounded-xl p-3 shadow-xl ${color.glow} shadow-lg`}>
      <div className="space-y-1.5">
        {[
          ['Proy',                    fmt(t.proyectado)],
          [`< ${t.hora}:00`,          fmt(t.antesDelCorte)],
          [`Pz post ${t.hora}hs`,     fmt(t.despuesDelCorte)],
          [`% Post ${t.hora}hs`,      pct(t.pctDespues)],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between items-center gap-4">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{label}</span>
            <span className={`text-[10px] font-black font-mono ${color.text}`}>{value}</span>
          </div>
        ))}
        <div className={`mt-2 pt-2 border-t ${color.border} border-opacity-20 flex justify-between items-center`}>
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">% Pre {t.hora}hs</span>
          <span className={`text-[10px] font-black font-mono ${color.text}`}>{pct(t.pctAntes)}</span>
        </div>
      </div>
    </div>
    {/* Arrow */}
    <div className={`absolute right-3 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent ${color.border.replace('border-', 'border-t-')}`} style={{ opacity: 0.4 }} />
  </div>
);

const TargetCardItem = ({ keyHS, t }) => {
  const [hover, setHover] = useState(false);
  const color = COLORS[keyHS];
  const isOk = t.pctAntes >= 90;

  return (
    <Card className="relative overflow-visible group">
      <div className="flex justify-between items-center mb-4">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
          Corte {t.hora}hs
        </p>
        <div className="relative"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}>
          <div className={`w-5 h-5 rounded-full border-2 ${color.border} ${color.text} flex items-center justify-center text-[10px] font-black cursor-help transition-all ${hover ? 'scale-110' : ''}`}>
            {isOk ? '✓' : '!'}
          </div>
          {hover && <InfoTooltip t={t} color={color} />}
        </div>
      </div>

      <div className="flex justify-between items-end">
        <h4 className="text-3xl lg:text-5xl font-black text-white tracking-tighter italic">
          {pct(t.pctAntes)}
        </h4>
        <div className="text-right">
          <p className="text-[9px] font-bold text-slate-600 uppercase">Bipeado</p>
          <p className="text-xs font-black text-slate-400 font-mono tracking-tighter">
            {fmt(t.antesDelCorte)} pzas
          </p>
        </div>
      </div>

      <div className="mt-4 h-[3px] bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full ${color.bar} transition-all duration-700`}
          style={{ width: `${Math.min(t.pctAntes, 100)}%` }} />
      </div>
    </Card>
  );
};

const TargetCards = ({ targets }) => {
  if (!targets) return null;
  const keys = ['14HS', '16HS', '18HS', '20HS'];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
      {keys.map(k => targets[k] && (
        <TargetCardItem key={k} keyHS={k} t={targets[k]} />
      ))}
    </div>
  );
};

export default TargetCards;
