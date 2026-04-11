import React from 'react';
import { useState } from "react";
import KpiGrid from '../components/KpiGrid';
import MainChart from '../components/MainChart';
import VehiculosChart from '../../vehicles/components/VehiculosChart';
import MatrixPanel from '../components/MatrixPanel';
import HUTable from '../components/HUTable';
import TargetCards from '../components/TargetCards';

const HUObjetivoWidget = ({ huStats }) => {
  if (!huStats) return null;
  const { objetivoHU, usuariosNecesarios, usuariosActivos, diferenciaUsuarios } = huStats;
  const positivo = diferenciaUsuarios >= 0;

  return (
    <div className="flex flex-wrap items-center gap-4 mt-4 p-4 bg-[#111827]/40 border border-white/5 rounded-xl">
      <div className="flex items-center gap-3">
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Objetivo HU</span>
        <span className="text-sm font-black text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-lg">
          {objetivoHU}%
        </span>
      </div>
      <div className="w-px h-6 bg-white/10 hidden sm:block" />
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Usuarios necesarios</span>
        <span className="text-sm font-black text-blue-400">{usuariosNecesarios}</span>
      </div>
      <div className="w-px h-6 bg-white/10 hidden sm:block" />
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Activos</span>
        <span className="text-sm font-black text-slate-300">{usuariosActivos}</span>
      </div>
      <div className="w-px h-6 bg-white/10 hidden sm:block" />
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Diferencia</span>
        <span className={`text-sm font-black ${positivo ? 'text-emerald-400' : 'text-red-400'}`}>
          {positivo ? '+' : ''}{diferenciaUsuarios}
        </span>
      </div>
    </div>
  );
};




const CierreInhubModal = ({ data }) => {
  const [open, setOpen] = useState(false);

  if (!data) return null;

  const { proyectado, arribado, bipeado } = data;

  return (
    <>
      {/* BOTÓN */}
      <button
        onClick={() => setOpen(true)}
        className="text-[10px] font-black text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded uppercase tracking-widest transition-all"
      >
        Enviar Cierre Inhub
      </button>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 w-full max-w-md animate-in fade-in zoom-in-95">

            {/* LOGO OCASA (sin imagen) */}
            <div className="flex items-center justify-center mb-6">
              <span className="text-2xl font-black tracking-widest text-white">
                OCASA <span className="text-indigo-400">↗</span>
              </span>
            </div>

            {/* TITLE */}
            <h2 className="text-center text-lg font-black text-white mb-6">
              Cierre Inhub
            </h2>

            {/* DATA */}
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                <span className="text-xs text-slate-400 uppercase font-bold">Proyectado</span>
                <span className="text-lg font-black text-indigo-400">{proyectado}</span>
              </div>

              <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                <span className="text-xs text-slate-400 uppercase font-bold">Arribado</span>
                <span className="text-lg font-black text-blue-400">{arribado}</span>
              </div>

              <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                <span className="text-xs text-slate-400 uppercase font-bold">Bipeado</span>
                <span className="text-lg font-black text-emerald-400">{bipeado}</span>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setOpen(false)}
                className="text-xs font-bold text-slate-400 hover:text-white px-4 py-2"
              >
                Cancelar
              </button>

              <button
                onClick={() => {
                  console.log("Cierre enviado:", { proyectado, arribado, bipeado });
                  setOpen(false);
                }}
                className="text-xs font-black text-white bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg"
              >
                Confirmar
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};


const CommandCenter = ({ data, planVehiculos, onPlanChange, isViewer }) => {
  if (!data) return null;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">

      {/* 1. KPIs */}
      <section>
        <KpiGrid kpis={data.kpis} />
      </section>

      {/* 2. GRÁFICA + MATRIZ */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        <div className="lg:col-span-8">
          <MainChart chartData={data.chartData} />
        </div>
        <div className="lg:col-span-4">
          <MatrixPanel matrix={data.matrix} />
        </div>
      </section>

      {/* 3. GRÁFICA DE VEHÍCULOS POR TIPO */}
      <section>
        <VehiculosChart
          vehiculosChartData={data.vehiculosChartData}
          piezasPorTipo={data.piezasPorTipo}
          planVehiculos={planVehiculos ?? data.planVehiculos}
          onPlanChange={onPlanChange}
          isViewer={isViewer}
        />
      </section>

      {/* 3. TABLA HU */}
      <section>
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h3 className="text-lg md:text-xl font-black text-white italic tracking-tight">
            Armado de HU (Unidades de Manejo)
          </h3>
          <CierreInhubModal
            data={{
              proyectado: data.kpis?.proyectado,
              arribado: data.kpis?.arribado,
              bipeado: data.kpis?.bipeado,
            }}
          />
          <button className="text-[10px] font-black text-slate-500 hover:text-white border border-white/10 px-4 py-2 rounded uppercase tracking-widest transition-all">
            Exportar CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <HUTable tableData={data.tableData} objetivo={data.huStats?.objetivoHU} />
        </div>
        <HUObjetivoWidget huStats={data.huStats} />
      </section>

      {/* 4. TARGETS */}
      <section>
        <TargetCards targets={data.targets} />
      </section>

    </div>
  );
};

export default CommandCenter;
