import React from 'react';
import { Card } from '../ui/Card';

const TargetCardItem = ({ time, percentage, units, colorClass, statusColor }) => (
  <Card className="relative overflow-hidden group">
    <div className="flex justify-between items-center mb-4">
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Corte {time}</p>
      <div className={`w-5 h-5 rounded-full border-2 ${statusColor} flex items-center justify-center text-[10px] font-black`}>
        {percentage >= 90 ? 'L' : '!'}
      </div>
    </div>
    <div className="flex justify-between items-end">
      <h4 className="text-3xl lg:text-5xl font-black text-white tracking-tighter italic">{percentage}%</h4>
      <div className="text-right">
        <p className="text-[9px] font-bold text-slate-600 uppercase">Bipeado</p>
        <p className="text-xs font-black text-slate-400 font-mono tracking-tighter">{units.toLocaleString()} pzas</p>
      </div>
    </div>
    <div className="mt-4 h-[3px] bg-slate-800 rounded-full overflow-hidden">
      <div className={`h-full ${colorClass}`} style={{ width: `${percentage}%` }} />
    </div>
  </Card>
);

const TargetCards = ({ targets }) => {
  if (!targets) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <TargetCardItem time="14hs" percentage={targets["14HS"].percentage} units={targets["14HS"].units} colorClass="bg-blue-500" statusColor="border-blue-500 text-blue-500" />
      <TargetCardItem time="16hs" percentage={targets["16HS"].percentage} units={targets["16HS"].units} colorClass="bg-[#00f2ad]" statusColor="border-[#00f2ad] text-[#00f2ad]" />
      <TargetCardItem time="18hs" percentage={targets["18HS"].percentage} units={targets["18HS"].units} colorClass="bg-[#ff6b00]" statusColor="border-[#ff6b00] text-[#ff6b00]" />
    </div>
  );
};

export default TargetCards;
