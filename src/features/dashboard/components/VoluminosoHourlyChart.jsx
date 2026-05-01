import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LabelList } from 'recharts';
import { X } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-[#111827] border border-white/20 rounded-lg p-3 shadow-lg">
      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">{label}</p>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[9px] text-slate-400">Total ingresado:</span>
          <span className="text-[9px] font-black text-white">{data.cantidadTotal.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[9px] text-orange-400">% Voluminoso:</span>
          <span className="text-[9px] font-black text-orange-400">{data.pctVoluminoso}% ({data.voluminoso.toLocaleString()} pzas)</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[9px] text-green-400">Procesado:</span>
          <span className="text-[9px] font-black text-green-400">{data.procesado.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

// Label naranja: muestra el porcentaje
const PctLabel = ({ x, y, width, value }) => {
  if (!value || value === 0) return null;
  return (
    <text x={x + width / 2} y={y - 3} fill="#f97316" textAnchor="middle" fontSize="8" fontWeight="900">
      {value}%
    </text>
  );
};

// Label verde: muestra la cantidad real de procesados
const CantLabel = ({ x, y, width, value }) => {
  if (!value || value === 0) return null;
  return (
    <text x={x + width / 2} y={y - 3} fill="#22c55e" textAnchor="middle" fontSize="8" fontWeight="900">
      {value > 999 ? `${(value / 1000).toFixed(1)}k` : value}
    </text>
  );
};

const VoluminosoHourlyChart = ({ volDataByHora }) => {
  const [showResumen, setShowResumen] = useState(false);
  const [vista, setVista] = useState('naranja');

  const toggleVista = () => {
    setVista(v => v === 'naranja' ? 'verde' : v === 'verde' ? 'ambos' : 'naranja');
  };

  const VISTA_LABELS  = { naranja: '% Vol.', verde: 'Procesado', ambos: 'Ambos' };
  const VISTA_NEXT    = { naranja: 'Ver Procesado →', verde: 'Ver Ambos →', ambos: 'Ver % Vol. →' };

  if (!volDataByHora || volDataByHora.length === 0) {
    return (
      <div className="bg-[#111827]/10 rounded-2xl border border-white/5 p-6 flex items-center justify-center h-64">
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">No hay datos disponibles</p>
      </div>
    );
  }

  const chartData = volDataByHora
    .filter(item => (item.voluminoso + item.paqueteria) > 0)
    .map(item => {
      const cantidadTotal = item.voluminoso + item.paqueteria;
      const pctVoluminoso = cantidadTotal > 0 ? Math.round((item.voluminoso / cantidadTotal) * 100) : 0;
      return {
        hora: item.hora,
        pctVoluminoso,
        voluminoso: item.voluminoso,
        procesado: item.procesado || 0,
        cantidadTotal,
      };
    })
    .sort((a, b) => a.hora.localeCompare(b.hora));

  // Normalizar procesado a escala 0-100 para que sea visible junto al porcentaje
  const maxProcesado = Math.max(...chartData.map(d => d.procesado), 1);
  const chartDataNorm = chartData.map(d => ({
    ...d,
    procesadoNorm: Math.round((d.procesado / maxProcesado) * 100),
  }));

  const totalVoluminoso          = volDataByHora.reduce((s, i) => s + i.voluminoso, 0);
  const totalPaqueteria          = volDataByHora.reduce((s, i) => s + i.paqueteria, 0);
  const totalIngresado           = totalVoluminoso + totalPaqueteria;
  const pctVoluminosoTotal       = totalIngresado > 0 ? Math.round((totalVoluminoso / totalIngresado) * 100) : 0;
  const totalVoluminosoProcesado = volDataByHora.reduce((s, i) => s + (i.voluminosoProcesado || 0), 0);
  const totalVoluminosoPendiente = volDataByHora.reduce((s, i) => s + (i.voluminosoPendiente || 0), 0);

  return (
    <div className="bg-[#111827]/10 rounded-2xl border border-white/5 p-6">
      {/* Header */}
      <div className="mb-4 flex justify-between items-start">
        <div className="flex items-center gap-3">
          <img src={`${process.env.PUBLIC_URL}/Ocasa.png`} alt="" className="h-16 w-auto opacity-90" />
          <div className="w-px h-8 bg-white/10" />
          <div>
            <h3 className="text-[12px] font-black text-white uppercase tracking-widest mb-2">
              Avance Voluminoso por Hora
            </h3>
          <div className="grid grid-cols-4 gap-2 text-center text-[8px]">
            <div>
              <p className="text-slate-500 font-black uppercase tracking-widest">Total</p>
              <p className="text-orange-400 font-black text-[10px]">{totalVoluminoso.toLocaleString()}</p>
            </div>
            {(vista === 'naranja' || vista === 'ambos') && (
              <div>
                <p className="text-slate-500 font-black uppercase tracking-widest">% Vol.</p>
                <p className="text-orange-400 font-black text-[10px]">{pctVoluminosoTotal}%</p>
              </div>
            )}
            {(vista === 'verde' || vista === 'ambos') && (
              <div>
                <p className="text-slate-500 font-black uppercase tracking-widest">Procesado</p>
                <p className="text-green-400 font-black text-[10px]">{totalVoluminosoProcesado.toLocaleString()}</p>
              </div>
            )}
            {vista === 'ambos' && (
              <div>
                <p className="text-slate-500 font-black uppercase tracking-widest">Pendiente</p>
                <p className="text-red-400 font-black text-[10px]">{totalVoluminosoPendiente.toLocaleString()}</p>
              </div>
            )}
          </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={() => setShowResumen(true)}
            className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest transition-all"
          >
            Ver Resumen
          </button>
          <button
            onClick={toggleVista}
            className={`px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all
              ${vista === 'naranja' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' : ''}
              ${vista === 'verde'   ? 'bg-green-500/10 border-green-500/20 text-green-400' : ''}
              ${vista === 'ambos'   ? 'bg-white/5 border-white/10 text-slate-400' : ''}
            `}
          >
            {VISTA_NEXT[vista]}
          </button>
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex gap-4 mb-3 text-[9px] font-black tracking-widest">
        {(vista === 'ambos' || vista === 'naranja') && (
          <span className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-orange-500 opacity-80" /> % VOLUMINOSO
          </span>
        )}
        {(vista === 'ambos' || vista === 'verde') && (
          <span className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-green-500 opacity-80" /> PROCESADO
          </span>
        )}
      </div>

      {/* Gráfico — naranja usa pctVoluminoso (0-100), verde usa procesadoNorm (0-100) */}
      <div style={{ width: '100%', height: 192, minHeight: 192 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartDataNorm} barGap={3} margin={{ top: 16, right: 5, left: 5, bottom: 5 }}>
            <XAxis
              dataKey="hora"
              tick={{ fontSize: 8, fill: '#94a3b8' }}
              axisLine={{ stroke: '#374151' }}
              tickLine={false}
            />
            <YAxis yAxisId="pct"  hide domain={[0, 100]} />
            <YAxis yAxisId="proc" hide domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b' }} />
            {(vista === 'ambos' || vista === 'naranja') && (
              <Bar yAxisId="pct" dataKey="pctVoluminoso" name="% Voluminoso" fill="#f97316" fillOpacity={0.85} radius={[2, 2, 0, 0]}>
                <LabelList content={(p) => <PctLabel {...p} />} />
              </Bar>
            )}
            {(vista === 'ambos' || vista === 'verde') && (
              <Bar yAxisId="proc" dataKey="procesadoNorm" name="Procesado" fill="#22c55e" fillOpacity={0.85} radius={[2, 2, 0, 0]}>
                <LabelList dataKey="procesado" content={(p) => <CantLabel {...p} />} />
              </Bar>
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Modal Resumen */}
      {showResumen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#080c14] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-4">
                <img src={`${process.env.PUBLIC_URL}/Ocasa.png`} alt="" className="h-16 w-auto opacity-90" />
                <div className="w-px h-6 bg-white/10" />
                <h2 className="text-[11px] font-black text-white uppercase tracking-widest">
                  Resumen Voluminoso por Hora
                </h2>
              </div>
              <button onClick={() => setShowResumen(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] border-b border-white/10">
                    <th className="px-3 py-3">Hora</th>
                    <th className="py-3 text-right">Total</th>
                    <th className="py-3 text-right">Voluminoso</th>
                    <th className="py-3 text-right">% Vol.</th>
                    <th className="py-3 text-right">Procesado</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((row) => (
                    <tr key={row.hora} className="border-b border-white/[0.03] text-[10px] hover:bg-white/[0.02] transition-colors">
                      <td className="px-3 py-3 font-black text-blue-400">{row.hora}</td>
                      <td className="py-3 text-right font-black text-slate-300">{row.cantidadTotal.toLocaleString()}</td>
                      <td className="py-3 text-right font-black text-orange-400">{row.voluminoso.toLocaleString()}</td>
                      <td className="py-3 text-right font-black text-orange-400">{row.pctVoluminoso}%</td>
                      <td className="py-3 text-right font-black text-green-400">{row.procesado.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-white/10 bg-white/[0.03] text-[10px]">
                    <td className="px-3 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Total</td>
                    <td className="py-3 text-right font-black text-white">{totalIngresado.toLocaleString()}</td>
                    <td className="py-3 text-right font-black text-orange-400">{totalVoluminoso.toLocaleString()}</td>
                    <td className="py-3 text-right font-black text-orange-400">{pctVoluminosoTotal}%</td>
                    <td className="py-3 text-right font-black text-green-400">{totalVoluminosoProcesado.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoluminosoHourlyChart;
