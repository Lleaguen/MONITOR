import { useState } from 'react';
import { Upload, X, Calendar } from 'lucide-react';
import { ComposedChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, LabelList, PieChart, Pie, Cell } from 'recharts';
import Papa from 'papaparse';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { processCombinedData } from '../../../core/dataProcessor';
import VoluminosoHourlyChart from '../components/VoluminosoHourlyChart';

dayjs.extend(customParseFormat);

const PIE_COLORS = { Chasis: '#34d399', Camioneta: '#ffab00', Semi: '#60a5fa' };

const LineBadgeLabel = (color) => ({ x, y, value }) => {
  if (!value || value === 0) return null;
  const label = String(value);
  const padX = 3;
  const padY = 2;
  const fontSize = 8;
  const textW = label.length * 5.2;
  const badgeW = textW + padX * 2;
  const badgeH = fontSize + padY * 2;
  const badgeX = x - badgeW / 2;
  const badgeY = y - badgeH - 5;
  return (
    <g>
      <rect x={badgeX} y={badgeY} width={badgeW} height={badgeH}
        fill="#0f172a" fillOpacity={0.92} stroke={color} strokeWidth={0.8} rx={3} ry={3} />
      <text x={x} y={badgeY + padY + fontSize - 1}
        textAnchor="middle" fill={color} fontSize={fontSize} fontWeight="900" letterSpacing="0.3">
        {label}
      </text>
    </g>
  );
};

const chartTooltipStyle = {
  backgroundColor: '#080c14',
  border: 'none',
  borderRadius: '8px',
  fontSize: '11px',
};

const ComparativaDias = ({ data: dataHoy }) => {
  const [diasCargados, setDiasCargados] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState({ csv: null, excel: null, proyectado: 239000 });
  const [showProyectadoModal, setShowProyectadoModal] = useState(false);
  const [diaVoluminosoIdx, setDiaVoluminosoIdx] = useState(0);

  // Extraer fecha del CSV
  const getFechaFromCSV = (csvData) => {
    if (!csvData || csvData.length === 0) return null;
    const firstRow = csvData.find(r => r['Inbound Date Opened'] || r['Inbound Date Included']);
    if (!firstRow) return null;
    const rawDate = firstRow['Inbound Date Opened'] || firstRow['Inbound Date Included'];
    const parsed = dayjs(rawDate, 'DD/MM/YYYY HH:mm:ss');
    return parsed.isValid() ? parsed.format('DD/MM/YYYY') : null;
  };

  const handleCSVChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      await new Promise((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setPendingFiles(prev => ({ ...prev, csv: results.data }));
            resolve();
          },
          error: reject
        });
      });
      alert('CSV cargado correctamente. Ahora carga el archivo Excel.');
    } catch (error) {
      console.error('Error al cargar CSV:', error);
      alert('Error al procesar el archivo CSV');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleExcelChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!pendingFiles.csv) {
      alert('Primero debes cargar el archivo CSV');
      event.target.value = '';
      return;
    }

    setUploading(true);
    try {
      await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPendingFiles(prev => ({ ...prev, excel: e.target.result }));
          resolve();
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      });
      
      // Mostrar modal para ingresar proyectado
      setShowProyectadoModal(true);
    } catch (error) {
      console.error('Error al cargar Excel:', error);
      alert('Error al procesar el archivo Excel');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const confirmarProyectado = () => {
    if (pendingFiles.csv && pendingFiles.excel) {
      procesarDia(pendingFiles.csv, pendingFiles.excel, pendingFiles.proyectado);
      setPendingFiles({ csv: null, excel: null, proyectado: 239000 });
      setShowProyectadoModal(false);
    }
  };

  const procesarDia = (csvData, excelBuffer, proyectado) => {
    try {
      const fecha = getFechaFromCSV(csvData);
      if (!fecha) {
        alert('No se pudo extraer la fecha del archivo CSV');
        return;
      }

      // Verificar que no exista ya un día con esta fecha
      if (diasCargados.find(d => d.fecha === fecha)) {
        alert(`Ya existe un día cargado con fecha ${fecha}`);
        return;
      }

      // Procesar con el mismo pipeline que el día actual
      const processed = processCombinedData(
        csvData,
        excelBuffer,
        proyectado,
        75,     // objetivoHU
        180,    // productividadHU
        {
          horaInicioArribos: 9,
          horaInicioBipeos: 9,
          horaInicioHU: 10,
          zonaCPTOverrides: {},
        }
      );

      // Calcular totales por tipo
      const totales = (processed.vehiculosChartData || []).reduce((acc, h) => {
        acc.chasis += h.chasis || 0;
        acc.camioneta += h.camioneta || 0;
        acc.semi += h.semi || 0;
        return acc;
      }, { chasis: 0, camioneta: 0, semi: 0 });

      setDiasCargados(prev => [...prev, {
        fecha,
        data: processed,
        totales,
        proyectado,
      }]);

      alert(`Día ${fecha} cargado exitosamente con proyectado de ${proyectado.toLocaleString()}`);
    } catch (error) {
      console.error('Error al procesar día:', error);
      alert('Error al procesar los datos. Verifica que los archivos sean correctos.');
    }
  };

  const eliminarDia = (fecha) => {
    setDiasCargados(prev => prev.filter(d => d.fecha !== fecha));
  };

  // Preparar datos del día de hoy (solo si existen)
  const fechaHoy = dataHoy?.kpis ? dayjs().format('DD/MM/YYYY') : null;

  const totalesHoy = dataHoy?.vehiculosChartData ? 
    (dataHoy.vehiculosChartData || []).reduce((acc, h) => {
      acc.chasis += h.chasis || 0;
      acc.camioneta += h.camioneta || 0;
      acc.semi += h.semi || 0;
      return acc;
    }, { chasis: 0, camioneta: 0, semi: 0 })
    : { chasis: 0, camioneta: 0, semi: 0 };

  // Combinar todos los días para comparativa (solo incluir día actual si existe)
  const todosDias = [
    ...(fechaHoy && dataHoy ? [{ fecha: fechaHoy, data: dataHoy, totales: totalesHoy, esHoy: true }] : []),
    ...diasCargados,
  ];

  // Datos para curvas comparativas por hora (vehículos)
  const datosCurvas = [];
  const horas = Array.from({ length: 15 }, (_, i) => `${String(i + 9).padStart(2, '0')}:00`);
  
  horas.forEach(hora => {
    const punto = { hora };
    todosDias.forEach(dia => {
      const horaData = (dia.data?.vehiculosChartData || []).find(h => h.hora === hora);
      const total = (horaData?.chasis || 0) + (horaData?.camioneta || 0) + (horaData?.semi || 0);
      punto[dia.fecha] = total;
    });
    datosCurvas.push(punto);
  });

  const coloresCurvas = ['#22c55e', '#60a5fa', '#f97316', '#a78bfa', '#fbbf24', '#ec4899'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header con upload */}
      <div className="bg-[#111827]/20 p-6 rounded-2xl border border-white/5">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="flex items-center gap-4">
            <img src={`${process.env.PUBLIC_URL}/Ocasa.png`} alt="" className="h-16 w-auto opacity-90" />
            <div className="w-px h-10 bg-white/10" />
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight">Comparativa de Días</h2>
              <p className="text-[11px] text-slate-500 mt-1">Compara el desempeño de diferentes días cargando archivos CSV y Excel</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {/* Botón CSV */}
            <label className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
              pendingFiles.csv 
                ? 'bg-green-500/20 border-green-500/50 text-green-400' 
                : 'bg-blue-600/20 hover:bg-blue-600/30 border-blue-500/20 text-blue-400'
            }`}>
              <Upload size={16} />
              {pendingFiles.csv ? '✓ CSV Cargado' : '1. Cargar CSV (TMS)'}
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVChange}
                className="hidden"
                disabled={uploading}
              />
            </label>

            {/* Botón Excel */}
            <label className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
              !pendingFiles.csv 
                ? 'bg-slate-800/20 border-slate-700/50 text-slate-600 cursor-not-allowed' 
                : pendingFiles.excel
                  ? 'bg-green-500/20 border-green-500/50 text-green-400'
                  : 'bg-blue-600/20 hover:bg-blue-600/30 border-blue-500/20 text-blue-400'
            }`}>
              <Upload size={16} />
              {pendingFiles.excel ? '✓ Excel Cargado' : '2. Cargar Excel (Easy Docking)'}
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleExcelChange}
                className="hidden"
                disabled={uploading || !pendingFiles.csv}
              />
            </label>
          </div>
        </div>

        {/* Estado de carga */}
        {(pendingFiles.csv || pendingFiles.excel) && (
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">📁 Archivos en espera</p>
            <div className="flex gap-4 text-[9px] text-slate-400">
              {pendingFiles.csv && <span>✓ CSV listo</span>}
              {pendingFiles.excel && <span>✓ Excel listo</span>}
              {pendingFiles.csv && !pendingFiles.excel && <span className="text-yellow-400">⚠ Falta cargar Excel</span>}
            </div>
          </div>
        )}

        {/* Mensaje informativo si no hay datos del día actual */}
        {!fechaHoy && (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-[9px] font-black text-yellow-400 uppercase tracking-widest mb-1">⚠️ Sin datos del día actual</p>
            <p className="text-[9px] text-slate-400">No se detectaron datos del día actual en el servidor. Puedes cargar archivos de días anteriores para compararlos entre sí.</p>
          </div>
        )}

        {/* Días cargados */}
        {diasCargados.length > 0 && (
          <div className="mt-4">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Días cargados:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {diasCargados.map(dia => (
                <div key={dia.fecha} className="flex flex-col gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-blue-400" />
                      <span className="text-[11px] font-black text-white">{dia.fecha}</span>
                    </div>
                    <button onClick={() => eliminarDia(dia.fecha)} className="text-slate-500 hover:text-red-400 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="text-[9px] text-slate-400">
                    <span className="font-black text-slate-500">Proyectado:</span> {dia.proyectado?.toLocaleString() || '239,000'}
                  </div>
                  <div className="flex gap-2 text-[8px]">
                    <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 font-black">
                      CH: {dia.totales.chasis}
                    </span>
                    <span className="px-2 py-1 rounded bg-orange-500/10 text-orange-400 font-black">
                      CM: {dia.totales.camioneta}
                    </span>
                    <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 font-black">
                      SM: {dia.totales.semi}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instrucciones */}
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">📌 Instrucciones</p>
          <ul className="text-[9px] text-slate-400 space-y-1 list-disc list-inside">
            <li>Paso 1: Carga el archivo CSV del TMS</li>
            <li>Paso 2: Carga el archivo Excel de Easy Docking del mismo día</li>
            <li>Paso 3: Configura el proyectado para ese día</li>
            <li>Los archivos se procesarán con todos los cálculos automáticamente</li>
          </ul>
        </div>
      </div>

      {/* Modal para configurar proyectado */}
      {showProyectadoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 px-6 py-4 border-b border-white/10">
              <img src={`${process.env.PUBLIC_URL}/Ocasa.png`} alt="" className="h-12 w-auto opacity-90" />
              <div className="w-px h-8 bg-white/10" />
              <div>
                <h2 className="text-[11px] font-black text-white uppercase tracking-widest">Configurar Proyectado</h2>
                <p className="text-[9px] text-slate-500 mt-1">Ingresa el valor proyectado para este día</p>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                  Piezas Proyectadas
                </label>
                <input
                  type="number"
                  value={pendingFiles.proyectado}
                  onChange={(e) => setPendingFiles(prev => ({ ...prev, proyectado: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-[#020617] border border-white/10 text-white text-lg font-black px-4 py-3 rounded-lg text-center focus:outline-none focus:border-blue-500/50"
                  placeholder="239000"
                  min="0"
                />
                <p className="text-[8px] text-slate-500 mt-2 text-center">
                  Este valor se usará para calcular todos los KPIs y métricas del día
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setPendingFiles({ csv: null, excel: null, proyectado: 239000 });
                    setShowProyectadoModal(false);
                  }}
                  className="flex-1 px-4 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white border border-white/10 hover:border-white/20 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarProyectado}
                  className="flex-1 px-4 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-500 text-white transition-all"
                >
                  Procesar Día
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gráfico comparativo de % voluminoso por hora — mismo estilo que Dashboard Voluminoso */}
      {todosDias.length > 0 ? (
        <div className="space-y-3">
          {/* Selector de día */}
          <div className="flex flex-wrap gap-2">
            {todosDias.map((dia, idx) => (
              <button
                key={dia.fecha}
                onClick={() => setDiaVoluminosoIdx(idx)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${
                  diaVoluminosoIdx === idx
                    ? 'bg-orange-500/20 border-orange-500/40 text-orange-400'
                    : 'bg-white/5 border-white/10 text-slate-500 hover:text-slate-300'
                }`}
              >
                {dia.esHoy ? `${dia.fecha} (Hoy)` : dia.fecha}
              </button>
            ))}
          </div>

          {/* Componente idéntico al de Dashboard Voluminoso */}
          <VoluminosoHourlyChart
            volDataByHora={todosDias[diaVoluminosoIdx]?.data?.volDataByHora || []}
          />
        </div>
      ) : (
        <div className="bg-[#111827]/20 p-12 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-4">
          <Upload size={48} className="text-slate-600" />
          <div className="text-center">
            <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-2">No hay días para comparar</h3>
            <p className="text-[10px] text-slate-500">Carga archivos CSV y Excel de días anteriores para comenzar la comparativa</p>
          </div>
        </div>
      )}

      {/* Gráfico de curvas comparativas */}
      {todosDias.length > 0 && (
        <div className="bg-[#111827]/20 p-6 rounded-2xl border border-white/5">
          <div className="flex items-center gap-4 mb-4">
            <img src={`${process.env.PUBLIC_URL}/Ocasa.png`} alt="" className="h-12 w-auto opacity-90" />
            <div className="w-px h-8 bg-white/10" />
            <div>
              <h3 className="text-[12px] font-black text-white uppercase tracking-widest">Curvas Comparativas por Hora</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Arribo total de vehículos por hora en cada día</p>
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer>
              <ComposedChart data={datosCurvas} margin={{ top: 32, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid vertical={false} stroke="#1e293b" strokeDasharray="4 4" />
                <XAxis 
                  dataKey="hora" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#475569', fontSize: 9, fontWeight: 700 }} 
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#334155', fontSize: 9 }} width={30} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend 
                  wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                  iconType="line"
                />
                {todosDias.map((dia, idx) => {
                  const color = dia.esHoy ? '#22c55e' : coloresCurvas[idx % coloresCurvas.length];
                  return (
                    <Line
                      key={dia.fecha}
                      type="monotone"
                      dataKey={dia.fecha}
                      stroke={color}
                      strokeWidth={dia.esHoy ? 3 : 2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    >
                      <LabelList
                        dataKey={dia.fecha}
                        content={LineBadgeLabel(color)}
                      />
                    </Line>
                  );
                })}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Distribución por tipo - cada día */}
      {todosDias.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {todosDias.map((dia, idx) => {
          const total = dia.totales.chasis + dia.totales.camioneta + dia.totales.semi;
          const pieData = [
            { name: 'Chasis', value: dia.totales.chasis },
            { name: 'Camioneta', value: dia.totales.camioneta },
            { name: 'Semi', value: dia.totales.semi },
          ].filter(d => d.value > 0);

          const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
            const RADIAN = Math.PI / 180;
            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
            const x = cx + radius * Math.cos(-midAngle * RADIAN);
            const y = cy + radius * Math.sin(-midAngle * RADIAN);
            return (
              <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="900">
                {`${(percent * 100).toFixed(0)}%`}
              </text>
            );
          };

          return (
            <div key={dia.fecha} className="bg-[#111827]/20 p-5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <img src={`${process.env.PUBLIC_URL}/Ocasa.png`} alt="" className="h-10 w-auto opacity-90" />
                <div className="w-px h-6 bg-white/10" />
                <div>
                  <div className="flex items-center gap-2">
                    <Calendar size={12} className="text-blue-400" />
                    <h4 className="text-[11px] font-black text-white uppercase tracking-widest">{dia.fecha}</h4>
                  </div>
                  {dia.esHoy && (
                    <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Día actual</span>
                  )}
                </div>
              </div>

              <div className="h-48">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      dataKey="value"
                      label={renderLabel}
                      labelLine={false}
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={PIE_COLORS[entry.name]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={chartTooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 mt-2">
                {pieData.map(d => (
                  <div key={d.name} className="flex justify-between items-center text-[10px]">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[d.name] }} />
                      <span className="font-black text-slate-300">{d.name}</span>
                    </div>
                    <span className="font-black text-white">
                      {d.value} <span className="text-slate-500">({((d.value / total) * 100).toFixed(1)}%)</span>
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center text-[10px] pt-2 border-t border-white/10">
                  <span className="font-black text-slate-500 uppercase tracking-widest">Total</span>
                  <span className="font-black text-white">{total}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};

export default ComparativaDias;
