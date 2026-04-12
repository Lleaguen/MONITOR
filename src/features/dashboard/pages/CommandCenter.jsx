import { useState } from 'react';
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
        <span className="text-sm font-black text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-lg">{objetivoHU}%</span>
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

  const proyectado = data.kpis?.proyectado;
  const arribado   = data.kpis?.arribado;
  const bipeado    = data.kpis?.bipeado;
  const now = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#111827]/60 hover:bg-[#111827] border border-white/10 hover:border-white/20 text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
        Cierre Inhub
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#080c14] border border-white/10 rounded-2xl w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">

            {/* Header: Cierre Inhub izq | hora + OCASA der */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div>
                <h2 className="text-[11px] font-black text-white uppercase tracking-widest">Cierre Inhub</h2>
                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">{now} hs</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-base font-black tracking-widest text-white italic">OCASA</span>
                <button onClick={() => setOpen(false)}
                  className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-all">
                  Cerrar
                </button>
              </div>
            </div>

            {/* Solo Proyectado / Arribado / Bipeado */}
            <div className="p-6 space-y-3">
              {[
                { label: 'Proyectado', value: proyectado, color: 'text-slate-300'   },
                { label: 'Arribado',   value: arribado,   color: 'text-blue-400'    },
                { label: 'Bipeado',    value: bipeado,    color: 'text-emerald-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between items-center bg-[#111827]/60 border border-white/5 rounded-xl px-4 py-3">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
                  <span className={`text-lg font-black ${color}`}>{value ?? '-'}</span>
                </div>
              ))}
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

      <section>
        <KpiGrid kpis={data.kpis} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        <div className="lg:col-span-8">
          <MainChart chartData={data.chartData} />
        </div>
        <div className="lg:col-span-4">
          <MatrixPanel matrix={data.matrix} />
        </div>
      </section>

      <section>
        <VehiculosChart
          vehiculosChartData={data.vehiculosChartData}
          planVehiculos={planVehiculos ?? data.planVehiculos}
          onPlanChange={onPlanChange}
          isViewer={isViewer}
        />
      </section>

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
          <HUTable tableData={data.tableData} objetivo={data.huStats?.objetivoHU} />
        </div>
        <HUObjetivoWidget huStats={data.huStats} />
      </section>

      <section>
        <TargetCards targets={data.targets} />
        <div className="flex justify-end mt-4">
          <CierreInhubModal data={data} />
        </div>
      </section>

    </div>
  );
};

export default CommandCenter;
