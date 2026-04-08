import React from 'react';
import { Zap } from 'lucide-react';
import { Card } from '../../../shared/components/Card';

const MatrixItem = ({ label, actual, projected, color }) => (
  <div className="border-l-2 border-white/5 pl-4 py-2 hover:bg-white/[0.02] transition-colors rounded-r-lg">
    <div className="flex justify-between items-center mb-2">
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-1 text-[9px] text-blue-400 font-mono font-bold uppercase">
        <Zap size={10} /> En vivo
      </div>
    </div>
    <div className="flex gap-10">
      <div>
        <p className="text-[8px] font-bold text-slate-600 uppercase mb-1 tracking-tighter">Planificado</p>
        <p className="text-xl font-black text-white tracking-tighter italic">
          {projected?.toLocaleString() || 0}
        </p>
      </div>
      <div>
        <p className="text-[8px] font-bold text-slate-600 uppercase mb-1 tracking-tighter">Real</p>
        <p className={`text-xl font-black tracking-tighter ${color}`}>
          {actual?.toLocaleString() || 0}
        </p>
      </div>
    </div>
  </div>
);

const MatrixPanel = ({ matrix }) => (
  <Card title="Velocidad de Descarga (u/hr)" className="h-full flex flex-col justify-between">
    <div className="space-y-6">
      <MatrixItem
        label="Velocidad Chasis"
        actual={matrix?.chasis?.real}
        projected={matrix?.chasis?.planificado}
        color="text-emerald-400"
      />
      <MatrixItem
        label="Velocidad Camioneta"
        actual={matrix?.camioneta?.real}
        projected={matrix?.camioneta?.planificado}
        color="text-[#ffab00]"
      />
      <MatrixItem
        label="Velocidad Semi"
        actual={matrix?.semi?.real}
        projected={matrix?.semi?.planificado}
        color="text-blue-400"
      />
    </div>
  </Card>
);

export default MatrixPanel;
