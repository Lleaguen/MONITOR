import React from 'react';

const SyncStatus = ({ state, time }) => {
  if (state === 'idle' || !state) return null;

  const formatTime = (iso) => {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  if (state === 'syncing') {
    return (
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
        <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">
          Sincronizando...
        </span>
      </div>
    );
  }

  if (state === 'success') {
    return (
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-500" />
        <span className="text-[9px] font-black uppercase tracking-widest text-green-400">
          {formatTime(time)}
        </span>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-red-500" />
        <span className="text-[9px] font-black uppercase tracking-widest text-red-400">
          Error de sincronización
        </span>
      </div>
    );
  }

  return null;
};

export default SyncStatus;
