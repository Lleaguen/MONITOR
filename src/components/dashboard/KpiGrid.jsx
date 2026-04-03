import React from 'react';
import { Card } from '../ui/Card';
import { AlertTriangle } from 'lucide-react';

const KpiGrid = ({ kpis }) => {
  const desvios = kpis?.desviosDoca || {};

  return (
    <div className="space-y-4 mb-4">
      {/* ── FILA DE KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <Card title="Planificación" percentage={kpis?.pArribado} color="blue">
          <div className="space-y-3">
            <div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Proyectado</p>
              <p className="text-2xl lg:text-4xl font-black text-white tracking-tighter leading-none italic">
                {kpis?.proyectado || '0'}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Arribado</p>
              <p className="text-lg lg:text-xl font-black text-blue-400 tracking-tighter">
                {kpis?.arribado || '0'}
              </p>
            </div>
          </div>
        </Card>

        <Card title="Producción" percentage={kpis?.pBipeo} color="emerald">
          <div className="space-y-3">
            <div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Bipeado</p>
              <p className="text-2xl lg:text-4xl font-black text-white tracking-tighter leading-none italic">
                {kpis?.bipeado || '0'}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Arribado - Bipeado</p>
              <p className="text-lg lg:text-xl font-black text-emerald-400 tracking-tighter">
                {kpis?.arribadoBipeado || '0'}
              </p>
            </div>
          </div>
        </Card>

        <Card title="Esperado / Real" color="orange">
          <div className="space-y-3">
            <div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Descarga x Hora</p>
              <p className="text-2xl lg:text-4xl font-black text-white tracking-tighter leading-none italic">
                {kpis?.descargaHora || '0'}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Velocidad Real</p>
              <p className="text-lg lg:text-xl font-black text-orange-500 tracking-tighter">
                {kpis?.velocidadReal || '0'}
              </p>
            </div>
          </div>
        </Card>

        <div className="bg-blue-600/10 border border-blue-500/30 rounded-2xl p-4 lg:p-6 flex flex-col justify-center relative shadow-[0_0_50px_rgba(59,130,246,0.1)] overflow-hidden">
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-3 text-center">EN ESPERA</p>
          <div className="w-full pt-3 border-t border-blue-500/20 grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center">
              <span className="text-[8px] font-black text-blue-400/50 uppercase tracking-widest mb-1">Chasis</span>
              <span className="text-lg lg:text-xl font-black text-white italic">{kpis?.espera?.chasis || 0}</span>
              <span className="text-[9px] font-black text-blue-400/60 mt-1">{kpis?.espera?.darsenasChasis || 0} dárs.</span>
            </div>
            <div className="flex flex-col items-center border-x border-blue-500/20">
              <span className="text-[8px] font-black text-blue-400/50 uppercase tracking-widest mb-1">Cam</span>
              <span className="text-lg lg:text-xl font-black text-white italic">{kpis?.espera?.camioneta || 0}</span>
              <span className="text-[9px] font-black text-blue-400/60 mt-1">{kpis?.espera?.darsenаsCamioneta || 0} dárs.</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[8px] font-black text-blue-400/50 uppercase tracking-widest mb-1">Semi</span>
              <span className="text-lg lg:text-xl font-black text-white italic">{kpis?.espera?.semi || 0}</span>
              <span className="text-[9px] font-black text-blue-400/60 mt-1">{kpis?.espera?.darsenaSemi || 0} dárs.</span>
            </div>
          </div>
          <div className="absolute top-3 right-4 text-right">
            <span className="block text-[7px] font-black text-blue-500/40 uppercase tracking-widest">En Playa</span>
            <span className="text-xs font-black text-blue-400 italic">{kpis?.espera?.total || 0} VEH</span>
          </div>
          <div className="absolute top-3 left-4 text-left">
            <span className="block text-[7px] font-black text-blue-500/40 uppercase tracking-widest">Atracados</span>
            <span className="text-xs font-black text-blue-400 italic">{kpis?.espera?.atracados || 0} VEH</span>
          </div>
        </div>
      </div>

      {/* ── DESVÍOS DE DOCA — solo chasis en sector camioneta ── */}
      {(desvios.chasisEnCamioneta || 0) > 0 && (
        <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl px-4 py-3 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <AlertTriangle size={14} className="text-orange-400" />
            <span className="text-[9px] font-black text-orange-400 uppercase tracking-widest">Chasis en Sector Camioneta</span>
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold text-slate-500 uppercase">Total:</span>
              <span className="text-sm font-black text-orange-400">{desvios.chasisEnCamioneta}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold text-slate-500 uppercase">Descargando ahora:</span>
              <span className="text-sm font-black text-yellow-400">{desvios.chasisEnCamionetaAhora || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold text-slate-500 uppercase">Ya descargados:</span>
              <span className="text-sm font-black text-slate-400">{desvios.chasisEnCamionetaYaDescargados || 0}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KpiGrid;
