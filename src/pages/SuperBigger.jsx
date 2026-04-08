import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import StatCard from '../components/ui/StatCard.jsx';
import SortButton from '../components/ui/SortButton.jsx';
import PageWrapper from '../components/ui/PageWrapper.jsx';

const SORT_OPTIONS = [
  { key: 'peso', label: 'Mayor Peso' },
  { key: 'hora', label: 'Hora' },
];

const PiezasTable = ({ list, orden, color }) => {
  const sorted = [...list].sort((a, b) =>
    orden === 'peso' ? b.weight - a.weight : a.hora.localeCompare(b.hora)
  );
  return (
    <div className="bg-[#111827]/10 rounded-2xl border border-white/5 overflow-x-auto">
      <table className="w-full min-w-[600px] text-left">
        <thead>
          <tr className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] border-b border-white/10">
            <th className="px-4 py-3">#</th>
            <th className="py-3">Shipment ID</th>
            <th className="py-3 text-right">Peso (kg)</th>
            <th className="py-3 text-right">Alto (cm)</th>
            <th className="py-3 text-right">Largo (cm)</th>
            <th className="py-3 text-right">Ancho (cm)</th>
            <th className="py-3 text-center px-4">Hora Bipeo</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, idx) => (
            <tr key={idx} className="border-b border-white/[0.03] text-[10px] hover:bg-white/[0.02] transition-colors">
              <td className="px-4 py-3 font-bold text-slate-600">{idx + 1}</td>
              <td className="py-3 font-black text-slate-300 font-mono text-[9px]">{row.shipmentId}</td>
              <td className={`py-3 text-right font-black text-${color}`}>{row.weight.toLocaleString()}</td>
              <td className="py-3 text-right font-black text-slate-300">{row.height.toLocaleString()}</td>
              <td className="py-3 text-right font-black text-slate-300">{row.length.toLocaleString()}</td>
              <td className="py-3 text-right font-black text-slate-300">{row.width.toLocaleString()}</td>
              <td className="py-3 text-center font-black text-slate-400 px-4">{row.hora}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {sorted.length === 0 && (
        <div className="text-center py-10 text-slate-600 font-black text-[11px] uppercase tracking-widest">
          Sin piezas en esta categoría
        </div>
      )}
    </div>
  );
};

const SuperBigger = ({ data }) => {
  const superList  = data?.superBiggerList      || [];
  const biggerList = data?.biggerList           || [];
  const superChart = data?.superBiggerChartData || [];
  const biggerChart = data?.biggerChartData     || [];
  const [orden, setOrden] = useState('peso');
  const [tab, setTab] = useState('super');

  const list  = tab === 'super' ? superList  : biggerList;
  const chart = tab === 'super' ? superChart : biggerChart;

  const pesoMax = list.length > 0 ? Math.max(...list.map(r => r.weight)) : 0;
  const dimMax  = list.length > 0 ? Math.max(...list.map(r => Math.max(r.height, r.length, r.width))) : 0;
  const lineColor = tab === 'super' ? '#ef4444' : '#f97316';
  const statColor = tab === 'super' ? 'red' : 'orange';

  return (
    <PageWrapper>
      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab('super')}
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'super' ? 'bg-red-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
          Super Bigger
        </button>
        <button onClick={() => setTab('bigger')}
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'bigger' ? 'bg-orange-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
          Bigger
        </button>
      </div>

      {/* Criterios */}
      <div className="px-4 py-2 rounded-xl bg-white/[0.02] border border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-500">
        {tab === 'super'
          ? 'Criterio: peso > 50 kg  O  alguna dimensión ≥ 200 cm'
          : 'Criterio: peso ≥ 30 kg  O  alguna dimensión ≥ 150 cm  (excluye Super Bigger)'}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label={`Total ${tab === 'super' ? 'Super Bigger' : 'Bigger'}`} value={list.length.toLocaleString()} color={statColor} />
        <StatCard label="Peso Máximo"      value={`${pesoMax.toLocaleString()} kg`} />
        <StatCard label="Dimensión Máxima" value={`${dimMax.toLocaleString()} cm`} />
      </div>

      <div className="bg-[#111827]/20 p-4 md:p-6 rounded-2xl border border-white/5">
        <h3 className="text-base font-black text-white mb-1 tracking-tight">
          {tab === 'super' ? 'Super Bigger' : 'Bigger'} por Hora
        </h3>
        <p className="text-[11px] text-slate-500 italic mb-6">Cantidad de piezas bipeadas por hora</p>
        <div className="h-48 sm:h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chart} margin={{ top: 10, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid vertical={false} stroke="#1e293b" strokeDasharray="4 4" />
              <XAxis dataKey="hora" axisLine={false} tickLine={false}
                tick={{ fill: '#475569', fontSize: 9, fontWeight: 700 }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#334155', fontSize: 9 }} width={24} />
              <Tooltip cursor={{ stroke: '#1e293b' }}
                contentStyle={{ backgroundColor: '#080c14', border: 'none', borderRadius: '8px', fontSize: '11px' }} />
              <Line type="monotone" dataKey="cantidad" name={tab === 'super' ? 'Super Bigger' : 'Bigger'}
                stroke={lineColor} strokeWidth={2.5}
                dot={{ fill: lineColor, r: 3 }}
                activeDot={{ r: 5, fill: lineColor, stroke: '#080c14', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mr-2">Ordenar por:</span>
        {SORT_OPTIONS.map(({ key, label }) => (
          <SortButton key={key} active={orden === key} onClick={() => setOrden(key)}
            activeColor={tab === 'super' ? 'bg-red-600' : 'bg-orange-600'}>
            {label}
          </SortButton>
        ))}
      </div>

      <PiezasTable list={list} orden={orden} color={tab === 'super' ? 'red-400' : 'orange-400'} />
    </PageWrapper>
  );
};

export default SuperBigger;
