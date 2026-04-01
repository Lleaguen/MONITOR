import React from 'react';

const Header = ({ title, lastUpdate }) => {
  return (
    <header className="hidden md:flex justify-between items-center px-6 lg:px-10 py-4 lg:py-6 sticky top-0 bg-[#080c14]/80 backdrop-blur-md z-10 border-b border-white/5">
      <div className="flex items-center gap-6 lg:gap-10">
        <h2 className="text-[10px] lg:text-[11px] font-black text-white uppercase tracking-[0.3em] lg:tracking-[0.4em] italic">
          {title}
        </h2>
        <nav className="hidden lg:flex gap-6 text-[9px] font-black text-slate-600 uppercase tracking-widest">
          <span className="hover:text-blue-400 cursor-pointer transition-colors">Mapa Global</span>
          <span className="hover:text-blue-400 cursor-pointer transition-colors">Pulso de Red</span>
        </nav>
      </div>
      <div className="flex items-center gap-3 px-3 lg:px-4 py-2 bg-[#0d1525] border border-white/10 rounded-full shadow-inner">
        <span className="text-[9px] text-green-500 font-black uppercase tracking-[0.2em]">
          Últ: {lastUpdate}
        </span>
      </div>
    </header>
  );
};

export default Header;
