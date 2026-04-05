import React from 'react';
import { Monitor, UploadCloud } from 'lucide-react';

const formatTime = (iso) => {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return null;
  }
};

const ModeSelector = ({ lastUpdate, onViewDashboard, onLoadFiles }) => {
  const formattedTime = formatTime(lastUpdate);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#080c14] text-white p-4 font-sans">
      <div className="w-full max-w-md flex flex-col items-center gap-8">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight uppercase italic text-white mb-2">
            Monitor Inbound OCASA
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
            Último snapshot:{' '}
            <span className={formattedTime ? 'text-blue-400' : 'text-slate-600'}>
              {formattedTime ?? 'Sin datos previos'}
            </span>
          </p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">

          {/* Ver Dashboard */}
          <button
            onClick={onViewDashboard}
            className="flex flex-col items-center gap-4 p-6 rounded-2xl border border-white/5 bg-[#111827]/50 hover:bg-blue-600/10 hover:border-blue-500/30 transition-all group"
          >
            <div className="p-3 bg-blue-600/10 rounded-full text-blue-500 group-hover:scale-110 transition-transform">
              <Monitor size={28} />
            </div>
            <div className="text-center">
              <p className="text-[11px] font-black uppercase tracking-widest text-white mb-1">
                Ver Dashboard
              </p>
              <p className="text-[10px] text-slate-500 font-medium">
                Ver el turno en curso
              </p>
            </div>
          </button>

          {/* Cargar Archivos */}
          <button
            onClick={onLoadFiles}
            className="flex flex-col items-center gap-4 p-6 rounded-2xl border border-white/5 bg-[#111827]/50 hover:bg-slate-700/20 hover:border-slate-500/30 transition-all group"
          >
            <div className="p-3 bg-slate-700/30 rounded-full text-slate-400 group-hover:scale-110 transition-transform">
              <UploadCloud size={28} />
            </div>
            <div className="text-center">
              <p className="text-[11px] font-black uppercase tracking-widest text-white mb-1">
                Cargar Archivos
              </p>
              <p className="text-[10px] text-slate-500 font-medium">
                Subir CSV y Excel (Admin)
              </p>
            </div>
          </button>

        </div>
      </div>
    </div>
  );
};

export default ModeSelector;
