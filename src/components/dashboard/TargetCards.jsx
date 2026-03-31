import React from 'react';
import { Card } from '../ui/Card';

const TargetCardItem = ({ time, percentage, units, colorClass, statusColor }) => (
  <Card className="relative overflow-hidden group">
    <div className="flex justify-between items-center mb-6">
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Corte {time}</p>
      <div className={`w-5 h-5 rounded-full border-2 ${statusColor} flex items-center justify-center text-[10px] font-black`}>
        {percentage >= 90 ? 'L' : '!'}
      </div>
    </div>
    
    <div className="flex justify-between items-end">
      <h4 className="text-5xl font-black text-white tracking-tighter italic">{percentage}%</h4>
      <div className="text-right">
        <p className="text-[9px] font-bold text-slate-600 uppercase">Bipeado</p>
        <p className="text-xs font-black text-slate-400 font-mono tracking-tighter">{units.toLocaleString()} piezas</p>
      </div>
    </div>

    <div className="mt-5 h-[3px] bg-slate-800 rounded-full overflow-hidden">
      <div className={`h-full ${colorClass} shadow-[0_0_10px_rgba(0,0,0,0.5)]`} style={{ width: `${percentage}%` }} />
    </div>
  </Card>
);

const TargetCards = ({ targets }) => {
  // Datos fallback si el procesador no los entrega aún
  const data = targets || {
    "14HS": { percentage: 82, units: 15000 },
    "16HS": { percentage: 95, units: 22500 },
    "18HS": { percentage: 48, units: 35000 },
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      <TargetCardItem time="14hs" percentage={data["14HS"].percentage} units={data["14HS"].units} colorClass="bg-blue-500" statusColor="border-blue-500 text-blue-500" />
      <TargetCardItem time="16hs" percentage={data["16HS"].percentage} units={data["16HS"].units} colorClass="bg-[#00f2ad]" statusColor="border-[#00f2ad] text-[#00f2ad]" />
      <TargetCardItem time="18hs" percentage={data["18HS"].percentage} units={data["18HS"].units} colorClass="bg-[#ff6b00]" statusColor="border-[#ff6b00] text-[#ff6b00]" />
    </div>
  );
};

export default TargetCards;
