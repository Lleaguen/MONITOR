import React from 'react';
import KpiGrid from '../components/dashboard/KpiGrid';
import MainChart from '../components/dashboard/MainChart';
import MatrixPanel from '../components/dashboard/MatrixPanel';
import HUTable from '../components/dashboard/HUTable';
import TargetCards from '../components/dashboard/TargetCards';

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

const CommandCenter = ({ data }) => {
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

      {/* 3. TABLA HU */}
      <section>
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h3 className="text-lg md:text-xl font-black text-white italic tracking-tight">
            Armado de HU (Unidades de Manejo)
          </h3>
          <button className="text-[10px] font-black text-slate-500 hover:text-white border border-white/10 px-4 py-2 rounded uppercase tracking-widest transition-all">
            Exportar CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <HUTable tableData={data.tableData} />
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
