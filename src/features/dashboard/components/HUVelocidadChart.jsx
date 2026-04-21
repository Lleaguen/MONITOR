import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from 'recharts';

const BarLabel = ({ x, y, width, value, fill }) => {
  if (!value || value === 0) return null;
  return (
    <text x={x + width / 2} y={y - 4} textAnchor="middle"
      fill={fill} fontSize={8} fontWeight="900">
      {value}
    </text>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-[#080c14] border border-white/10 rounded-xl p-3 shadow-xl">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{data.hora}</p>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[9px] text-emerald-400 font-bold">HU Cerrados</span>
          <span className="text-[11px] font-black text-emerald-400">{data.huCerrados}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-[9px] text-yellow-400 font-bold">HU Abiertos</span>
          <span className="text-[11px] font-black text-yellow-400">{data.huAbiertos}</span>
        </div>
        <div className="flex items-center justify-between gap-4 pt-1 border-t border-white/10">
          <span className="text-[9px] text-white font-bold">Total</span>
          <span className="text-[11px] font-black text-white">{data.total}</span>
        </div>
      </div>
    </div>
  );
};

const HUVelocidadChart = ({ huVelocidadData }) => {
  console.log('🎨 HUVelocidadChart - Renderizando con:', huVelocidadData);

  if (!huVelocidadData) {
    console.log('❌ HUVelocidadChart: No hay datos de huVelocidadData');
    return (
      <div className="bg-red-500/20 p-4 md:p-6 rounded-2xl border border-red-500/50">
        <h3 className="text-base md:text-lg font-black text-white mb-1 tracking-tight">
          Velocidad de Armado de HU
        </h3>
        <p className="text-[11px] text-slate-500 font-medium italic mb-4">
          Pulso de descarga: HU cerrados y abiertos por hora
        </p>
        <div className="text-center py-12 text-red-400 font-black text-[11px] uppercase tracking-widest">
          ⚠️ No hay datos de huVelocidadData (null o undefined)
        </div>
      </div>
    );
  }

  const { velocidadPorHora, velocidadPorCPT, stats } = huVelocidadData;

  console.log('📊 HUVelocidadChart - Datos recibidos:', {
    velocidadPorHora: velocidadPorHora?.length,
    velocidadPorCPT: velocidadPorCPT?.length,
    stats
  });

  // Si no hay datos, mostrar mensaje
  if (!velocidadPorHora || velocidadPorHora.length === 0) {
    return (
      <div className="bg-yellow-500/20 p-4 md:p-6 rounded-2xl border border-yellow-500/50">
        <h3 className="text-base md:text-lg font-black text-white mb-1 tracking-tight">
          Velocidad de Armado de HU
        </h3>
        <p className="text-[11px] text-slate-500 font-medium italic mb-4">
          Pulso de descarga: HU cerrados y abiertos por hora
        </p>
        <div className="text-center py-12 text-yellow-400 font-black text-[11px] uppercase tracking-widest">
          ⚠️ Sin datos de velocidad de HU disponibles (array vacío)
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">{/* Gráfica principal: Velocidad por hora */}
      <div className="bg-[#111827]/20 p-4 md:p-6 rounded-2xl border border-white/5">
        <div className="flex flex-wrap justify-between items-end gap-3 mb-6">
          <div>
            <h3 className="text-base md:text-lg font-black text-white mb-1 tracking-tight">
              Velocidad de Armado de HU
            </h3>
            <p className="text-[11px] text-slate-500 font-medium italic">
              Pulso de descarga: HU cerrados y abiertos por hora
            </p>
          </div>
          <div className="flex gap-4 text-[9px] font-black tracking-widest">
            <span className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400 opacity-75" /> CERRADOS
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm bg-yellow-400 opacity-75" /> ABIERTOS
            </span>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-[#111827]/40 border border-white/5 rounded-xl p-3">
            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Total HU</p>
            <p className="text-lg font-black text-white">{stats.totalHU.toLocaleString()}</p>
          </div>
          <div className="bg-[#111827]/40 border border-white/5 rounded-xl p-3">
            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Velocidad Prom.</p>
            <p className="text-lg font-black text-blue-400">{stats.velocidadPromedio} HU/hr</p>
          </div>
          <div className="bg-[#111827]/40 border border-white/5 rounded-xl p-3">
            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Velocidad Pico</p>
            <p className="text-lg font-black text-amber-400">{stats.velocidadPico} HU/hr</p>
          </div>
          <div className="bg-[#111827]/40 border border-white/5 rounded-xl p-3">
            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Hora Pico</p>
            <p className="text-lg font-black text-slate-300">{stats.horaPico}</p>
          </div>
        </div>

        {/* Gráfica de barras */}
        <div className="h-56 md:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={velocidadPorHora} barGap={2} margin={{ top: 18, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid vertical={false} stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis 
                dataKey="hora" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: '#475569', fontSize: 9, fontWeight: 'bold' }} 
                dy={8} 
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b' }} />
              <Bar 
                dataKey="huCerrados" 
                name="HU Cerrados" 
                fill="#34d399" 
                fillOpacity={0.85} 
                radius={[2, 2, 0, 0]}
                stackId="hu"
              >
                <LabelList content={(p) => <BarLabel {...p} fill="#34d399" />} />
              </Bar>
              <Bar 
                dataKey="huAbiertos" 
                name="HU Abiertos" 
                fill="#fbbf24" 
                fillOpacity={0.85} 
                radius={[2, 2, 0, 0]}
                stackId="hu"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla: Velocidad por CPT (últimas 3 horas) */}
      <div className="bg-[#111827]/20 p-4 md:p-6 rounded-2xl border border-white/5">
        <div className="mb-4">
          <h4 className="text-sm md:text-base font-black text-white mb-1 tracking-tight">
            Velocidad por CPT
          </h4>
          <p className="text-[10px] text-slate-500 font-medium italic">
            Desde las 13:30 hasta las 22:30 horas
          </p>
        </div>

        {velocidadPorCPT && velocidadPorCPT.length > 0 ? (
          <>
            {/* Vista desktop: tabla */}
            <div className="hidden sm:block bg-[#111827]/10 rounded-xl border border-white/5 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[8px] font-black text-slate-600 uppercase tracking-[0.15em] border-b border-white/5">
                    <th className="px-3 py-2">CPT</th>
                    <th className="py-2 text-right">HU Cerrados</th>
                    <th className="py-2 text-right">HU Abiertos</th>
                    <th className="py-2 text-right">Total</th>
                    <th className="py-2 text-right pr-3">Velocidad</th>
                  </tr>
                </thead>
                <tbody>
                  {velocidadPorCPT.map((row, idx) => (
                    <tr key={idx} className="border-b border-white/5 text-[10px] hover:bg-white/5 transition-colors">
                      <td className="px-3 py-2 font-black text-blue-400">{row.cpt}</td>
                      <td className="py-2 text-right font-bold text-emerald-400">{row.huCerrados.toLocaleString()}</td>
                      <td className="py-2 text-right font-bold text-yellow-400">{row.huAbiertos.toLocaleString()}</td>
                      <td className="py-2 text-right font-black text-white">{row.total.toLocaleString()}</td>
                      <td className="py-2 text-right pr-3 font-black text-slate-300">{row.velocidadPorHora} HU/hr</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Vista mobile: cards */}
            <div className="sm:hidden space-y-2">
              {velocidadPorCPT.map((row, idx) => (
                <div key={idx} className="rounded-xl border border-white/5 bg-[#111827]/30 p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] font-black text-blue-400">{row.cpt}</span>
                    <span className="text-[10px] font-black text-slate-300">{row.velocidadPorHora} HU/hr</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Cerrados</p>
                      <p className="text-[10px] font-black text-emerald-400">{row.huCerrados}</p>
                    </div>
                    <div>
                      <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Abiertos</p>
                      <p className="text-[10px] font-black text-yellow-400">{row.huAbiertos}</p>
                    </div>
                    <div>
                      <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Total</p>
                      <p className="text-[10px] font-black text-white">{row.total}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-slate-600 font-black text-[10px] uppercase tracking-widest">
            Sin actividad de HU entre las 13:30 y 22:30 horas
          </div>
        )}
      </div>
    </div>
  );
};

export default HUVelocidadChart;
