import React from 'react';
import { Card } from '../ui/Card';
import { AlertTriangle } from 'lucide-react';

const KpiGrid = ({ kpis }) => {
  const desvios = kpis?.desviosDoca || {};
  const hayDesvios =
    (desvios.chasisEnCamioneta || 0) > 0 ||
    (desvios.semiEnCamioneta || 0) > 0 ||
    (desvios.camionetaEnChasis || 0) > 0;

  return (
    <div className="space-y-6 mb-4">
      {/* ── FILA DE KPIs ── */}
      <div className="grid grid-cols-4 gap-6">

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

        {/* 2. PRODUCCIÓN */}
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

        {/* 3. VELOCIDAD */}
        <Card title="Esperado / Real" color="orange">
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

        {/* 4. EN ESPERA */}
        <div className="bg-blue-600/10 border border-blue-500/30 rounded-2xl p-6 flex flex-col justify-center relative shadow-[0_0_50px_rgba(59,130,246,0.1)] overflow-hidden">
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-4 text-center">
            EN ESPERA
          </p>

          <div className="w-full pt-4 border-t border-blue-500/20 grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center">
              <span className="text-[8px] font-black text-blue-400/50 uppercase tracking-widest mb-1">Chasis</span>
              <span className="text-xl font-black text-white italic">{kpis?.espera?.chasis || 0}</span>
            </div>
            <div className="flex flex-col items-center border-x border-blue-500/20">
              <span className="text-[8px] font-black text-blue-400/50 uppercase tracking-widest mb-1">Meli/Cam</span>
              <span className="text-xl font-black text-white italic">{kpis?.espera?.camioneta || 0}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[8px] font-black text-blue-400/50 uppercase tracking-widest mb-1">Semis</span>
              <span className="text-xl font-black text-white italic">{kpis?.espera?.semi || 0}</span>
            </div>
          </div>

          <div className="absolute top-4 right-5 text-right">
            <span className="block text-[7px] font-black text-blue-500/40 uppercase tracking-widest">En Playa</span>
            <span className="text-sm font-black text-blue-400 italic">{kpis?.espera?.total || 0} VEH</span>
          </div>
          <div className="absolute top-4 left-5 text-left">
            <span className="block text-[7px] font-black text-blue-500/40 uppercase tracking-widest">Atracados</span>
            <span className="text-sm font-black text-blue-400 italic">{kpis?.espera?.atracados || 0} VEH</span>
          </div>
        </div>
      </div>

      {/* ── PANEL DE DESVÍOS DE DOCA ── */}
      {hayDesvios && (
        <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl px-6 py-4 flex items-center gap-6">
          <div className="flex items-center gap-2 shrink-0">
            <AlertTriangle size={14} className="text-orange-400" />
            <span className="text-[9px] font-black text-orange-400 uppercase tracking-widest">
              Desvíos de Doca
            </span>
          </div>

          <div className="flex gap-8 flex-wrap">
            {(desvios.chasisEnCamioneta || 0) > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                  Chasis en sector camioneta:
                </span>
                <span className="text-sm font-black text-orange-400 italic">
                  {desvios.chasisEnCamioneta}
                </span>
              </div>
            )}
            {(desvios.semiEnCamioneta || 0) > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                  Semi en sector camioneta:
                </span>
                <span className="text-sm font-black text-orange-400 italic">
                  {desvios.semiEnCamioneta}
                </span>
              </div>
            )}
            {(desvios.camionetaEnChasis || 0) > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                  Camioneta en sector chasis:
                </span>
                <span className="text-sm font-black text-orange-400 italic">
                  {desvios.camionetaEnChasis}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default KpiGrid;
