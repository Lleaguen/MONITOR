// import React from 'react';
// import { LayoutDashboard, Settings, Truck, Map, Send, FileText, Plus } from 'lucide-react';

// const NavItem = ({ icon, text, active, onClick }) => (
//   <div 
//     onClick={onClick}
//     className={`flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer transition-all ${
//       active 
//         ? 'bg-blue-600/10 text-blue-400 shadow-[inset_0_0_10px_rgba(59,130,246,0.05)] border border-blue-500/10' 
//         : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
//     }`}
//   >
//     {icon} <span className="text-[11px] font-black uppercase tracking-widest">{text}</span>
//   </div>
// );

// const Sidebar = ({ activeTab, setActiveTab }) => {
//   return (
//     <aside className="w-60 bg-[#111827]/50 flex flex-col border-r border-white/5 h-screen">
//       <div className="p-8">
//         <h1 className="text-blue-400 font-black text-xl tracking-tighter leading-none italic uppercase">
//           Monitor Inbound
//         </h1>
//         <p className="text-[8px] text-slate-600 font-black tracking-[0.3em] mt-2 uppercase">Command & Control</p>
//       </div>
      
//       <nav className="flex-1 px-4 space-y-2 mt-4">
//         <NavItem 
//           icon={<LayoutDashboard size={18}/>} 
//           text="Command Center" 
//           active={activeTab === 'command'} 
//           onClick={() => setActiveTab('command')} 
//         />
//         <NavItem 
//           icon={<Truck size={18}/>} 
//           text="Fleet Status" 
//         />
//         <NavItem 
//           icon={<Map size={18}/>} 
//           text="Route Logic" 
//         />
//         <NavItem 
//           icon={<Send size={18}/>} 
//           text="Dispatch" 
//         />
//         {/* BOTÓN DE PARÁMETROS */}
//         <NavItem 
//           icon={<Settings size={18}/>} 
//           text="Parámetros" 
//           active={activeTab === 'params'} 
//           onClick={() => setActiveTab('params')} 
//         />
//       </nav>

//       <div className="p-6">
//         <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black shadow-lg shadow-blue-900/20 transition-all uppercase tracking-widest">
//           <Plus size={14} /> New Dispatch
//         </button>
//       </div>
//     </aside>
//   );
// };

// export default Sidebar;
import React from 'react';
import { LayoutDashboard, Settings, Truck, Map, Send, FileText, Plus } from 'lucide-react';

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

// Agregamos onNewDispatch a las props que recibe el Sidebar
const Sidebar = ({ activeTab, setActiveTab, onNewDispatch }) => {
  return (
    <aside className="w-60 bg-[#111827]/50 flex flex-col border-r border-white/5 h-screen">
      <div className="p-8">
        <h1 className="text-blue-400 font-black text-xl tracking-tighter leading-none italic uppercase">
          Monitor Inbound
        </h1>
        <p className="text-[8px] text-slate-600 font-black tracking-[0.3em] mt-2 uppercase">Command & Control</p>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        <NavItem 
          icon={<LayoutDashboard size={18}/>} 
          text="Command Center" 
          active={activeTab === 'command'} 
          onClick={() => setActiveTab('command')} 
        />
        <NavItem 
          icon={<Truck size={18}/>} 
          text="Fleet Status" 
        />
        <NavItem 
          icon={<Map size={18}/>} 
          text="Route Logic" 
        />
        <NavItem 
          icon={<Send size={18}/>} 
          text="Dispatch" 
        />
        <NavItem 
          icon={<Settings size={18}/>} 
          text="Parámetros" 
          active={activeTab === 'params'} 
          onClick={() => setActiveTab('params')} 
        />
      </nav>

      <div className="p-6">
        <button 
          onClick={onNewDispatch} // <--- AHORA SÍ: Esta línea activa el FileUploader
          className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black shadow-lg shadow-blue-900/20 transition-all uppercase tracking-widest active:scale-95"
        >
          <Plus size={16} strokeWidth={3} /> New Dispatch
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
