import React, { useState } from 'react';
import { LayoutDashboard, Settings, ClipboardList, Package, Truck, Plus, Menu, X } from 'lucide-react';

const NavItem = ({ icon, text, active, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer transition-all ${
      active
        ? 'bg-blue-600/10 text-blue-400 shadow-[inset_0_0_10px_rgba(59,130,246,0.05)] border border-blue-500/10'
        : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
    }`}
  >
    {icon} <span className="text-[11px] font-black uppercase tracking-widest">{text}</span>
  </div>
);

const Sidebar = ({ activeTab, setActiveTab, onNewDispatch }) => {
  const [open, setOpen] = useState(false);

  const handleNav = (tab) => {
    setActiveTab(tab);
    setOpen(false);
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#111827]/80 border-b border-white/5 sticky top-0 z-30">
        <h1 className="text-blue-400 font-black text-base tracking-tighter italic uppercase">Monitor Inbound</h1>
        <button onClick={() => setOpen(o => !o)} className="text-slate-400 hover:text-white p-1">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-20 bg-black/60" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-20
        w-60 bg-[#111827]/95 md:bg-[#111827]/50
        flex flex-col border-r border-white/5
        h-full md:h-screen
        transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-8 hidden md:block">
          <h1 className="text-blue-400 font-black text-xl tracking-tighter leading-none italic uppercase">
            Monitor Inbound
          </h1>
          <p className="text-[8px] text-slate-600 font-black tracking-[0.3em] mt-2 uppercase">Comando y Control</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem icon={<LayoutDashboard size={18} />} text="Centro de Mando" active={activeTab === 'command'} onClick={() => handleNav('command')} />
          <NavItem icon={<ClipboardList size={18} />} text="CutOff" active={activeTab === 'cutoff'} onClick={() => handleNav('cutoff')} />
          <NavItem icon={<Package size={18} />} text="Voluminoso" active={activeTab === 'voluminoso'} onClick={() => handleNav('voluminoso')} />
          <NavItem icon={<Truck size={18} />} text="Arribs. Chasis" active={activeTab === 'chasis'} onClick={() => handleNav('chasis')} />
          <NavItem icon={<Settings size={18} />} text="Parámetros" active={activeTab === 'params'} onClick={() => handleNav('params')} />
        </nav>

        <div className="p-6">
          <button
            onClick={() => { onNewDispatch(); setOpen(false); }}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black shadow-lg shadow-blue-900/20 transition-all uppercase tracking-widest active:scale-95"
          >
            <Plus size={16} strokeWidth={3} /> Nuevo Turno
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
