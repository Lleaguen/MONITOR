import React, { useState } from 'react';
import { LayoutDashboard, Settings, ClipboardList, Package, Truck, Maximize2, Plus, Menu, X } from 'lucide-react';

const NavItem = ({ icon, text, active, onClick, expanded }) => (
  <div
    onClick={onClick}
    title={!expanded ? text : undefined}
    className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all overflow-hidden ${
      active
        ? 'bg-blue-600/10 text-blue-400 border border-blue-500/10'
        : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
    }`}
  >
    <span className="shrink-0">{icon}</span>
    <span
      className={`text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-200 ${
        expanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'
      }`}
    >
      {text}
    </span>
  </div>
);

const Sidebar = ({ activeTab, setActiveTab, onNewDispatch, isViewer = false }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleNav = (tab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  const expanded = hovered;

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#111827]/80 border-b border-white/5 sticky top-0 z-30">
        <h1 className="text-blue-400 font-black text-base tracking-tighter italic uppercase">Monitor Inbound</h1>
        <button onClick={() => setMobileOpen(o => !o)} className="text-slate-400 hover:text-white p-1">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-black/60" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar (full width) */}
      <aside className={`
        md:hidden fixed inset-y-0 left-0 z-20 w-60
        bg-[#111827]/95 flex flex-col border-r border-white/5
        transition-transform duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 mt-14">
          <h1 className="text-blue-400 font-black text-lg tracking-tighter italic uppercase">Monitor Inbound</h1>
          <p className="text-[8px] text-slate-600 font-black tracking-[0.3em] mt-1 uppercase">Comando y Control</p>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {[
            { tab: 'command', icon: <LayoutDashboard size={18}/>, text: 'Centro de Mando' },
            { tab: 'cutoff',  icon: <ClipboardList size={18}/>, text: 'CutOff' },
            { tab: 'voluminoso', icon: <Package size={18}/>, text: 'Voluminoso' },
            { tab: 'chasis', icon: <Truck size={18}/>, text: 'Arribs. Chasis' },
            { tab: 'superbigger', icon: <Maximize2 size={18}/>, text: 'Super Bigger' },
            { tab: 'params', icon: <Settings size={18}/>, text: 'Parámetros' },
          ].map(({ tab, icon, text }) => (
            <div key={tab} onClick={() => handleNav(tab)}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all ${activeTab === tab ? 'bg-blue-600/10 text-blue-400 border border-blue-500/10' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}>
              {icon}
              <span className="text-[11px] font-black uppercase tracking-widest">{text}</span>
            </div>
          ))}
        </nav>
        {!isViewer && (
          <div className="p-4">
            <button onClick={() => { onNewDispatch(); setMobileOpen(false); }}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest active:scale-95">
              <Plus size={14} strokeWidth={3} /> Cargar Datos
            </button>
          </div>
        )}
      </aside>

      {/* Desktop sidebar — colapsado con íconos, se expande al hover */}
      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`
          hidden md:flex flex-col
          fixed inset-y-0 left-0 z-20
          bg-[#111827]/95 border-r border-white/5
          transition-all duration-200 ease-in-out
          ${expanded ? 'w-56' : 'w-[60px]'}
        `}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-3 py-6 overflow-hidden`}>
          <span className="shrink-0 w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center text-blue-400 font-black text-sm">M</span>
          <span className={`text-blue-400 font-black text-sm tracking-tighter italic uppercase whitespace-nowrap transition-all duration-200 ${expanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
            Monitor Inbound
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 space-y-1">
          <NavItem icon={<LayoutDashboard size={18}/>} text="Centro de Mando" active={activeTab === 'command'} onClick={() => handleNav('command')} expanded={expanded} />
          <NavItem icon={<ClipboardList size={18}/>} text="CutOff" active={activeTab === 'cutoff'} onClick={() => handleNav('cutoff')} expanded={expanded} />
          <NavItem icon={<Package size={18}/>} text="Voluminoso" active={activeTab === 'voluminoso'} onClick={() => handleNav('voluminoso')} expanded={expanded} />
          <NavItem icon={<Truck size={18}/>} text="Arribs. Chasis" active={activeTab === 'chasis'} onClick={() => handleNav('chasis')} expanded={expanded} />
          <NavItem icon={<Maximize2 size={18}/>} text="Super Bigger" active={activeTab === 'superbigger'} onClick={() => handleNav('superbigger')} expanded={expanded} />
          <NavItem icon={<Settings size={18}/>} text="Parámetros" active={activeTab === 'params'} onClick={() => handleNav('params')} expanded={expanded} />
        </nav>

        {/* Cargar Datos */}
        {!isViewer && (
          <div className="p-2 mb-2">
            <button
              onClick={() => { onNewDispatch(); }}
              title={!expanded ? 'Cargar Datos' : undefined}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest active:scale-95 overflow-hidden transition-all"
            >
              <Plus size={14} strokeWidth={3} className="shrink-0" />
              <span className={`whitespace-nowrap transition-all duration-200 ${expanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
                Cargar Datos
              </span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
