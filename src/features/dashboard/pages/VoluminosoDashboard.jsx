import React from 'react';
import PageWrapper from '../../../shared/components/PageWrapper';
import VoluminosoPieChart from '../components/VoluminosoPieChart';
import VoluminosoCPTTable from '../components/VoluminosoCPTTable';
import VoluminosoHourlyChart from '../components/VoluminosoHourlyChart';
import StatCard from '../../../shared/components/StatCard';

const VoluminosoDashboard = ({ data }) => {
  if (!data?.volDataByHora || !data?.volDataByCPT) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-500 text-[12px] font-black uppercase tracking-widest">
            No hay datos de voluminoso disponibles
          </p>
        </div>
      </PageWrapper>
    );
  }

  // Calcular estadísticas generales
  const totalVoluminoso = data.volDataByCPT.reduce((sum, item) => sum + item.voluminoso, 0);
  const totalPaqueteria = data.volDataByCPT.reduce((sum, item) => sum + item.paqueteria, 0);
  const totalPiezas = totalVoluminoso + totalPaqueteria;
  const voluminosoPercent = totalPiezas > 0 ? Math.round((totalVoluminoso / totalPiezas) * 100) : 0;

  return (
    <PageWrapper>
      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard 
          label="Total Piezas" 
          value={totalPiezas.toLocaleString()} 
        />
        <StatCard 
          label="Voluminoso" 
          value={totalVoluminoso.toLocaleString()} 
          sub={`${voluminosoPercent}%`}
          color="orange" 
        />
        <StatCard 
          label="Paquetería" 
          value={totalPaqueteria.toLocaleString()} 
          sub={`${100 - voluminosoPercent}%`}
          color="emerald" 
        />
      </div>

      {/* Dashboard principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna izquierda: Gráfico de torta + Gráfico de avance */}
        <div className="lg:col-span-1 space-y-6">
          <VoluminosoPieChart volDataByCPT={data.volDataByCPT} />
          <VoluminosoHourlyChart volDataByHora={data.volDataByHora} />
        </div>

        {/* Columna derecha: Tabla por CPT */}
        <div className="lg:col-span-1">
          <VoluminosoCPTTable volDataByCPT={data.volDataByCPT} />
        </div>
      </div>

      {/* Información adicional */}
      <div className="mt-6 bg-[#111827]/10 rounded-2xl border border-white/5 p-6">
        <h3 className="text-[12px] font-black text-white uppercase tracking-widest mb-4">
          Información del Dashboard
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px]">
          <div>
            <h4 className="font-black text-slate-400 uppercase tracking-widest mb-2">
              Criterios Voluminoso
            </h4>
            <ul className="space-y-1 text-slate-500">
              <li>• Dimensiones ≥ 50cm en cualquier eje</li>
              <li>• Peso > 20kg</li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-slate-400 uppercase tracking-widest mb-2">
              Prioridades CPT
            </h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-slate-500">CPT 0:00-1:00 (Prioritario)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-slate-500">CPT 2:00-3:00 (Medio-Alto)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-slate-500">CPT 4:00-5:00 (Medio)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-slate-500">CPT 6:00+ (Normal)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default VoluminosoDashboard;