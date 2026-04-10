import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import StatCard from '../../../shared/components/StatCard.jsx';
import SortButton from '../../../shared/components/SortButton.jsx';
import PageWrapper from '../../../shared/components/PageWrapper.jsx';
import { parseCSVFile } from '../utils/csvParser.js';

const SORT_OPTIONS = [
  { key: 'peso', label: 'Mayor Peso' },
  { key: 'hora', label: 'Hora' },
];

const PiezasTable = ({ list, orden, color }) => {
  const sorted = [...list].sort((a, b) =>
    orden === 'peso' ? b.weight - a.weight : (a.hora || '').localeCompare(b.hora || '')
  );

  return (
    <div className="bg-[#111827]/10 rounded-2xl border border-white/5 overflow-x-auto">
      <table className="w-full min-w-[600px] text-left">
        <thead>
          <tr className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] border-b border-white/10">
            <th className="px-4 py-3">#</th>
            <th className="py-3">Shipment ID</th>
            <th className="py-3 text-right">Peso (kg)</th>
            <th className="py-3 text-right">Alto</th>
            <th className="py-3 text-right">Largo</th>
            <th className="py-3 text-right">Ancho</th>
            <th className="py-3 text-center px-4">Hora</th>
          </tr>
        </thead>

        <tbody>
          {sorted.map((row, idx) => {
            const hasDiff =
              row.excelWeight !== undefined &&
              (
                row.weight !== row.excelWeight ||
                row.height !== row.excelHeight ||
                row.length !== row.excelLength ||
                row.width !== row.excelWidth
              );

            return (
              <tr
                key={idx}
                className={`border-b border-white/[0.03] text-[10px] transition-colors ${
                  hasDiff ? 'bg-red-500/10' : 'hover:bg-white/[0.02]'
                }`}
              >
                <td className="px-4 py-3 font-bold text-slate-600">{idx + 1}</td>
                <td className="py-3 font-black text-slate-300 font-mono text-[9px]">{row.shipmentId}</td>
                <td className={`py-3 text-right font-black text-${color}`}>{row.weight}</td>
                <td className="py-3 text-right text-slate-300">{row.height}</td>
                <td className="py-3 text-right text-slate-300">{row.length}</td>
                <td className="py-3 text-right text-slate-300">{row.width}</td>
                <td className="py-3 text-center text-slate-400 px-4">{row.hora || '-'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {sorted.length === 0 && (
        <div className="text-center py-10 text-slate-600 font-black text-[11px] uppercase tracking-widest">
          Sin datos
        </div>
      )}
    </div>
  );
};

const SuperBigger = ({ data }) => {
  const superList  = data?.superBiggerList || [];
  const biggerList = data?.biggerList || [];
  const superChart = data?.superBiggerChartData || [];
  const biggerChart = data?.biggerChartData || [];

  const [orden, setOrden] = useState('peso');
  const [tab, setTab] = useState('super');
  const [excelData, setExcelData] = useState([]);

  // 📁 Cargar CSV
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const parsed = await parseCSVFile(file);
      setExcelData(parsed);
    } catch (err) {
      console.error("Error CSV:", err);
    }
  };

  // 🔗 Comparación
  const allLocal = [...superList, ...biggerList];

  const comparisonList = excelData
    .map(excelItem => {
      const match = allLocal.find(
        local => String(local.shipmentId) === String(excelItem.shipmentId)
      );

      if (!match) return null;

      return {
        ...match,
        excelWeight: excelItem.weight,
        excelHeight: excelItem.height,
        excelLength: excelItem.length,
        excelWidth: excelItem.width,
      };
    })
    .filter(Boolean);

  // 📊 Data según tab
  const list =
    tab === 'super'
      ? superList
      : tab === 'bigger'
      ? biggerList
      : comparisonList;

  const chart =
    tab === 'super'
      ? superChart
      : tab === 'bigger'
      ? biggerChart
      : [];

  const pesoMax = list.length ? Math.max(...list.map(r => r.weight)) : 0;
  const dimMax  = list.length ? Math.max(...list.map(r => Math.max(r.height, r.length, r.width))) : 0;

  const lineColor =
    tab === 'super' ? '#ef4444' :
    tab === 'bigger' ? '#f97316' :
    '#3b82f6';

  const statColor =
    tab === 'super' ? 'red' :
    tab === 'bigger' ? 'orange' :
    'blue';

  return (
    <PageWrapper>

      {/* 📁 Upload CSV */}
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="mb-4 text-xs text-slate-400"
      />

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab('super')} className={`px-4 py-2 rounded-xl text-[10px] font-black ${tab === 'super' ? 'bg-red-600 text-white' : 'bg-white/5 text-slate-400'}`}>
          Super
        </button>

        <button onClick={() => setTab('bigger')} className={`px-4 py-2 rounded-xl text-[10px] font-black ${tab === 'bigger' ? 'bg-orange-600 text-white' : 'bg-white/5 text-slate-400'}`}>
          Bigger
        </button>

        <button onClick={() => setTab('compare')} className={`px-4 py-2 rounded-xl text-[10px] font-black ${tab === 'compare' ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400'}`}>
          Comparación
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        <StatCard label="Total" value={list.length} color={statColor} />
        <StatCard label="Peso Máximo" value={`${pesoMax} kg`} />
        <StatCard label="Dimensión Máxima" value={`${dimMax} cm`} />
      </div>

      {/* Chart */}
      {tab !== 'compare' && (
        <div className="bg-[#111827]/20 p-4 mt-4 rounded-2xl">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chart}>
              <CartesianGrid stroke="#1e293b" />
              <XAxis dataKey="hora" />
              <YAxis />
              <Tooltip />
              <Line dataKey="cantidad" stroke={lineColor} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Sort */}
      <div className="flex gap-2 mt-4">
        {SORT_OPTIONS.map(({ key, label }) => (
          <SortButton key={key} active={orden === key} onClick={() => setOrden(key)}>
            {label}
          </SortButton>
        ))}
      </div>

      {/* Tabla */}
      <PiezasTable
        list={list}
        orden={orden}
        color={tab === 'super' ? 'red-400' : tab === 'bigger' ? 'orange-400' : 'blue-400'}
      />

    </PageWrapper>
  );
};

export default SuperBigger;