import React from 'react';

const Header = ({ title, lastUpdate }) => {
  return (
    <header className="flex justify-between items-center px-10 py-6 sticky top-0 bg-[#080c14]/80 backdrop-blur-md z-20 border-b border-white/5">
      <div className="flex items-center gap-10">
        <h2 className="text-[11px] font-black text-white uppercase tracking-[0.4em] italic">
          {title}
        </h2>
        <nav className="flex gap-6 text-[9px] font-black text-slate-600 uppercase tracking-widest">
          <span className="hover:text-blue-400 cursor-pointer transition-colors">Global Map</span>
          <span className="hover:text-blue-400 cursor-pointer transition-colors">Network Pulse</span>
        </nav>
      </div>
      
      <div className="flex items-center gap-3 px-4 py-2 bg-[#0d1525] border border-white/10 rounded-full shadow-inner">
        {/* <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]" /> */}
        <span className="text-[9px] text-green-500 font-black uppercase tracking-[0.2em]">
          {lastUpdate}
        </span>
      </div>
    </header>
  );
};

export default Header;
