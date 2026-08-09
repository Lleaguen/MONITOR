import React, { useState } from 'react';
import { Monitor, UploadCloud, Lock, MapPin, Check } from 'lucide-react';

const ADMIN_PIN = process.env.REACT_APP_ADMIN_PIN || '1234';

const SITES = [
  {
    code: 'CIU',
    name: 'Soldati',
    sub: 'Ciudad Universitaria',
    color: 'blue',
  },
  {
    code: 'EEV',
    name: 'Echeverría',
    sub: 'Esteban Echeverría',
    color: 'violet',
  },
];

const formatTime = (iso) => {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return null;
  }
};

const ModeSelector = ({ lastUpdate, selectedSite, onSiteChange, onViewDashboard, onLoadFiles }) => {
  const formattedTime = formatTime(lastUpdate);
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleAdminClick = () => {
    setShowPin(true);
    setPin('');
    setError(false);
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      setShowPin(false);
      onLoadFiles();
    } else {
      setError(true);
      setPin('');
    }
  };

  const activeSite = SITES.find(s => s.code === selectedSite) ?? SITES[0];

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

        {/* ── Selector de Site ── */}
        <div className="w-full flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-1">
            <MapPin size={11} className="text-slate-500" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
              Seleccioná el site
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {SITES.map((site) => {
              const isActive = selectedSite === site.code;
              const colorMap = {
                blue:   { ring: 'border-blue-500/60',   bg: 'bg-blue-600/10',   dot: 'bg-blue-500',   text: 'text-blue-400'   },
                violet: { ring: 'border-violet-500/60', bg: 'bg-violet-600/10', dot: 'bg-violet-500', text: 'text-violet-400' },
              };
              const c = colorMap[site.color];
              return (
                <button
                  key={site.code}
                  onClick={() => onSiteChange(site.code)}
                  className={`
                    relative flex flex-col items-start gap-1.5 p-4 rounded-2xl border transition-all text-left
                    ${isActive
                      ? `${c.ring} ${c.bg}`
                      : 'border-white/5 bg-[#111827]/40 hover:border-white/10 hover:bg-[#111827]/70'
                    }
                  `}
                >
                  {/* check indicator */}
                  <div className={`
                    absolute top-3 right-3 w-4 h-4 rounded-full flex items-center justify-center transition-all
                    ${isActive ? `${c.dot}` : 'border border-white/10 bg-transparent'}
                  `}>
                    {isActive && <Check size={9} className="text-white" strokeWidth={3} />}
                  </div>

                  <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? c.text : 'text-slate-400'}`}>
                    {site.code}
                  </span>
                  <span className="text-[13px] font-black text-white leading-tight">{site.name}</span>
                  <span className="text-[9px] text-slate-500 font-medium">{site.sub}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Divisor ── */}
        <div className="w-full flex items-center gap-3">
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">
            {activeSite.name} ({activeSite.code})
          </span>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        {/* PIN modal */}
        {showPin && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <form onSubmit={handlePinSubmit}
              className="bg-[#0f172a] p-6 rounded-2xl border border-white/10 flex flex-col gap-4 w-full max-w-xs">
              <div className="flex items-center gap-3">
                <Lock size={16} className="text-slate-400" />
                <h2 className="text-[11px] font-black uppercase tracking-widest text-white">Acceso Admin</h2>
              </div>
              <p className="text-[10px] text-slate-500">Ingresá el PIN de administrador para cargar archivos.</p>
              <input
                type="password"
                value={pin}
                onChange={e => { setPin(e.target.value); setError(false); }}
                placeholder="PIN"
                autoFocus
                className="bg-[#020617] border border-white/10 text-white text-center text-lg font-black px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500/50 tracking-widest"
              />
              {error && (
                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest text-center">PIN incorrecto</p>
              )}
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowPin(false)}
                  className="flex-1 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 border border-white/10 hover:border-white/20 transition-all">
                  Cancelar
                </button>
                <button type="submit"
                  className="flex-1 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-500 text-white transition-all">
                  Ingresar
                </button>
              </div>
            </form>
          </div>
        )}

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

          {/* Cargar Archivos — requiere PIN */}
          <button
            onClick={handleAdminClick}
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
