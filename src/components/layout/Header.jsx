import React from 'react';
import SyncStatus from '../SyncStatus';

const Header = ({ title, lastUpdate, syncStatus, viewerLastUpdate }) => {
  return (
    <header className="hidden md:flex justify-between items-center px-6 lg:px-10 py-4 lg:py-6 sticky top-0 bg-[#080c14]/80 backdrop-blur-md z-10 border-b border-white/5">
      <div className="flex items-center gap-6 lg:gap-10">
        <h2 className="text-[10px] lg:text-[11px] font-black text-white uppercase tracking-[0.3em] lg:tracking-[0.4em] italic">
          {title}
        </h2>

      </div>

      <div className="flex items-center gap-3">
        {/* Pill con hora del último bipeo — siempre igual al diseño original */}
        {(lastUpdate || viewerLastUpdate) && (
          <div className="flex items-center gap-3 px-3 lg:px-4 py-2 bg-[#0d1525] border border-white/10 rounded-full shadow-inner">
            <span className="text-[9px] text-green-500 font-black uppercase tracking-[0.2em]">
              Últ: {lastUpdate || viewerLastUpdate}
            </span>
          </div>
        )}

        {/* SyncStatus solo para Admin, pill separada */}
        {syncStatus && syncStatus.state !== 'idle' && (
          <div className="px-3 lg:px-4 py-2 bg-[#0d1525] border border-white/10 rounded-full shadow-inner">
            <SyncStatus state={syncStatus.state} time={syncStatus.time} />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
