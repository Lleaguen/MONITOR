import React from 'react';
import KpiGrid from '../components/dashboard/KpiGrid';
import MainChart from '../components/dashboard/MainChart';
import MatrixPanel from '../components/dashboard/MatrixPanel';
import HUTable from '../components/dashboard/HUTable';
import TargetCards from '../components/dashboard/TargetCards';

const CommandCenter = ({ data }) => {
  // Verificación de seguridad para que no rompa si los datos tardan
  if (!data) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 1. KPIs SUPERIORES (Lo que sacamos de tu Excel) */}
      <section>
        <KpiGrid kpis={data.kpis} />
      </section>

      {/* 2. FILA CENTRAL: GRÁFICA + MATRIZ DE DESCARGA */}
      <section className="grid grid-cols-12 gap-8">
        <div className="col-span-8">
          <MainChart chartData={data.chartData} />
        </div>
        <div className="col-span-4">
          <MatrixPanel matrix={data.matrix} />
        </div>
      </section>

      {/* 3. TABLA DE PRODUCCIÓN (Armado de HU) */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-white italic tracking-tight">
            Armado de HU (Handling Units)
          </h3>
          <button className="text-[10px] font-black text-slate-500 hover:text-white border border-white/10 px-4 py-2 rounded uppercase tracking-widest transition-all">
            Export Segment CSV
          </button>
        </div>
        <HUTable tableData={data.tableData} />
      </section>

      {/* 4. TARGETS DE CIERRE (Corte 14hs, 16hs, 18hs) */}
      <section>
        <TargetCards targets={data.targets} />
      </section>

    </div>
  );
};

export default CommandCenter;
