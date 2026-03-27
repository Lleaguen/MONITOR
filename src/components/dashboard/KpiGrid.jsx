import React from 'react';
import { Card } from '../ui/Card';

const KpiGrid = ({ kpis }) => {
  return (
    <div className="grid grid-cols-4 gap-6 mb-10">
      {/* 1. PLANIFICACIÓN */}
      <Card title="Planificación" percentage={kpis?.pArribado} color="blue">
        <div className="space-y-4">
          <div>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Proyectado</p>
            <p className="text-4xl font-black text-white tracking-tighter leading-none italic">
              {kpis?.proyectado || '0'}
            </p>
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Arribado</p>
            <p className="text-xl font-black text-blue-400 tracking-tighter">
              {kpis?.arribado || '0'}
            </p>
          </div>
        </div>
      </Card>

      {/* 2. PRODUCCIÓN SISTEMA */}
      <Card title="Producción" percentage={kpis?.pBipeo} color="emerald">
        <div className="space-y-4">
          <div>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Bipeado</p>
            <p className="text-4xl font-black text-white tracking-tighter leading-none italic">
              {kpis?.bipeado || '0'}
            </p>
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Arribado - Bipeado</p>
            <p className="text-xl font-black text-emerald-400 tracking-tighter">
              {kpis?.arribadoBipeado || '0'}
            </p>
          </div>
        </div>
      </Card>

      {/* 3. DELTAS / DESVÍOS */}
      <Card title="Deltas / Desvíos" color="orange">
        <div className="space-y-4">
          <div>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Descarga x Hora</p>
            <p className="text-4xl font-black text-white tracking-tighter leading-none italic">
              {kpis?.descargaHora || '0'}
            </p>
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Velocidad Real</p>
            <p className="text-xl font-black text-orange-500 tracking-tighter">
              {kpis?.velocidadReal || '0'}
            </p>
          </div>
        </div>
      </Card>

      {/* 4. VELOCIDAD REAL (Look Neón) */}
      <div className="bg-blue-600/10 border border-blue-500/30 rounded-2xl p-8 flex flex-col items-center justify-center relative shadow-[0_0_50px_rgba(59,130,246,0.1)] group">
        <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-4">Velocidad Real</p>
        <div className="relative">
          <h3 className="text-7xl font-black text-white italic tracking-tighter leading-none z-10 relative">
            {kpis?.velocidadReal || '0'}
          </h3>
          {/* Resplandor azul detrás del número */}
          <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
        </div>
        <p className="text-[9px] font-bold text-blue-500/60 mt-6 uppercase tracking-[0.2em]">Unidades / Hora</p>
      </div>
    </div>
  );
};

export default KpiGrid;
