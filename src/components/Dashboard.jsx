import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { LayoutDashboard, Truck, Map, FileText, Settings, Send, Plus, Activity, AlertTriangle } from 'lucide-react';

// --- SUB-COMPONENTES INTERNOS (Para mantener el código limpio) ---
const NavItem = ({ icon, text, active }) => (
  <div className={`flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer transition-all ${active ? 'bg-blue-600/10 text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}>
    {icon} <span className="text-[13px] font-bold uppercase tracking-tight">{text}</span>
  </div>
);

const KpiCard = ({ title, value, trend, hasBar, barColor, labelBg }) => (
  <div className="bg-[#111827]/40 p-6 rounded-xl border border-white/5 relative overflow-hidden group">
    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">{title}</p>
    <h3 className="text-4xl font-black text-white mb-2 tracking-tighter">{value}</h3>
    {trend && <p className="text-[11px] text-green-400 font-bold flex items-center gap-1">↗ {trend}</p>}
    {hasBar && (
      <div className="mt-6 w-full h-[3px] bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full ${barColor} shadow-[0_0_8px_rgba(0,0,0,0.4)]`} style={{ width: '65%' }} />
      </div>
    )}
  </div>
);

// --- COMPONENTE PRINCIPAL DASHBOARD ---
const Dashboard = ({ data }) => {
  // Desestructuramos el objeto que viene del procesador
  const { kpis, chartData, tableData, targets } = data;

  return (
    <div className="flex h-screen bg-[#080c14] text-slate-300 font-sans overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-60 bg-[#111827]/50 flex flex-col border-r border-white/5">
        <div className="p-8">
          <h1 className="text-blue-400 font-black text-xl tracking-tighter leading-none">MONITOR INHUB</h1>
          <p className="text-[9px] text-slate-600 font-black tracking-[0.2em] mt-1 uppercase">OPERACIONES</p>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <NavItem icon={<LayoutDashboard size={18}/>} text="Command Center" active />
          <NavItem icon={<Truck size={18}/>} text="Fleet Status" />
          <NavItem icon={<Map size={18}/>} text="Route Logic" />
          <NavItem icon={<Send size={18}/>} text="Dispatch" />
          <NavItem icon={<FileText size={18}/>} text="Reports" />
          <NavItem icon={<Settings size={18}/>} text="Settings" />
        </nav>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="flex justify-between items-center px-10 py-8">
          <h2 className="text-xs font-black text-white uppercase tracking-[0.3em]">OCASA REAL-TIME DASHBOARD</h2>
          <div className="flex items-center gap-2 px-4 py-1.5 bg-[#0d1525] border border-white/10 rounded-full">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] text-green-500 font-black uppercase tracking-widest">SYSTEM ACTIVE</span>
          </div>
        </header>

        <div className="px-10 pb-10 space-y-10">
          {/* SECCIÓN 1: KPIs REALES */}
          <div className="grid grid-cols-4 gap-6">
            <KpiCard title="Global Efficiency" value={kpis.eficiencia} trend="+2.4%" />
            <KpiCard title="Total Piezas" value={kpis.total} hasBar barColor="bg-blue-500" />
            <KpiCard title="Arribados" value={kpis.arribados} hasBar barColor="bg-orange-500" />
            <div className="bg-[#111827]/80 p-6 rounded-xl border border-white/5">
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Status Active</p>
               <h3 className="text-xl font-black text-green-400 tracking-tighter mb-4">LIVE PULSE</h3>
               <div className="flex items-end gap-1 h-12">
                  {[40,70,45,90,65,80,30,50].map((h, i) => (
                    <div key={i} className="flex-1 bg-green-500/20 rounded-t-sm" style={{height: `${h}%`}} />
                  ))}
               </div>
            </div>
          </div>

          {/* SECCIÓN 2: GRÁFICA REAL */}
          <div className="bg-[#111827]/20 p-8 rounded-2xl border border-white/5">
            <h3 className="text-lg font-black text-white mb-6 tracking-tight">Kinetic Pulse (Inbound vs Labeling)</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={8}>
                  <XAxis dataKey="hora" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 'bold'}} dy={10} />
                  <Tooltip contentStyle={{backgroundColor: '#080c14', border: 'none', borderRadius: '8px'}} />
                  <Bar dataKey="arribo" fill="#334155" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="bipeo" fill="#94a3b8" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* SECCIÓN 3: TABLA DE ARMADO DE HU */}
          <div className="mt-10">
            <h3 className="text-xl font-black text-white mb-8 tracking-tight italic">Armado de HU (Handling Units)</h3>
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] border-b border-white/10">
                  <th className="pb-4">Intervalo Hora</th>
                  <th className="pb-4">Etiquetado</th>
                  <th className="pb-4">Piezas</th>
                  <th className="pb-4">Avance %</th>
                  <th className="pb-4 text-center">Users Active</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, idx) => (
                  <tr key={idx} className="border-b border-white/5 text-[12px] hover:bg-white/5 transition-colors">
                    <td className="py-5 text-slate-500 font-medium">{row.intervalo}</td>
                    <td className="py-5 font-bold text-slate-200">{row.etiquetado}</td>
                    <td className="py-5 font-bold text-slate-200">{row.piezas}</td>
                    <td className="py-5 w-64">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-[3px] bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full ${row.piezas > 0 ? 'bg-[#00f2ad]' : 'bg-slate-700'}`} style={{ width: `${(row.piezas/row.etiquetado)*100}%` }} />
                        </div>
                        <span className="w-10 text-right font-black text-white">{Math.round((row.piezas/row.etiquetado)*100) || 0}%</span>
                      </div>
                    </td>
                    <td className="py-5 text-center font-bold text-slate-400">{row.usuarios}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
