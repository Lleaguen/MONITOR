import { useState, useMemo } from 'react';
import { Users, Clock } from 'lucide-react';
import PageWrapper from '../../../shared/components/PageWrapper';

const Conectados = ({ data }) => {
  const [busqueda, setBusqueda] = useState('');

  const usuarios = data?.usuariosConectados || [];

  // Agrupar: CPT → zonas → usuarios
  const porCPT = useMemo(() => {
    const mapa = {};
    usuarios.forEach(u => {
      if (!mapa[u.cpt]) mapa[u.cpt] = { cpt: u.cpt, zonas: {} };
      if (!mapa[u.cpt].zonas[u.zona]) mapa[u.cpt].zonas[u.zona] = { zona: u.zona, cpt: u.cpt, usuarios: [] };
      mapa[u.cpt].zonas[u.zona].usuarios.push(u);
    });

    // Convertir a array ordenado por CPT, con zonas ordenadas alfabéticamente
    return Object.values(mapa)
      .sort((a, b) => a.cpt.localeCompare(b.cpt))
      .map(c => ({
        ...c,
        zonas: Object.values(c.zonas).sort((a, b) => a.zona.localeCompare(b.zona)),
        total: Object.values(c.zonas).reduce((acc, z) => acc + z.usuarios.length, 0),
      }));
  }, [usuarios]);

  // Filtro aplicado sobre la estructura CPT → zonas
  const filtrados = useMemo(() => {
    if (!busqueda.trim()) return porCPT;
    const q = busqueda.toLowerCase();
    return porCPT
      .map(c => ({
        ...c,
        zonas: c.zonas
          .map(z => ({
            ...z,
            usuarios: z.usuarios.filter(u =>
              u.nombre.toLowerCase().includes(q) ||
              u.zona.toLowerCase().includes(q) ||
              u.cpt.toLowerCase().includes(q)
            ),
          }))
          .filter(z => z.usuarios.length > 0),
      }))
      .filter(c => c.zonas.length > 0);
  }, [porCPT, busqueda]);

  const totalConectados = usuarios.length;
  const totalZonas = porCPT.reduce((acc, c) => acc + c.zonas.length, 0);
  const totalCPTs = porCPT.length;

  if (!data) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-500 text-[12px] font-black uppercase tracking-widest">Sin datos disponibles</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {/* Header con stats */}
      <div className="bg-[#111827]/20 p-6 rounded-2xl border border-white/5 mb-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <img src={`${process.env.PUBLIC_URL}/Ocasa.png`} alt="" className="h-14 w-auto opacity-90" />
            <div className="w-px h-10 bg-white/10" />
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight">Usuarios Conectados</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Actividad en los últimos 10 minutos · por CPT / zona</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="text-center px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Conectados</p>
              <p className="text-2xl font-black text-emerald-400">{totalConectados}</p>
            </div>
            <div className="text-center px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-xl">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">CPTs activos</p>
              <p className="text-2xl font-black text-violet-400">{totalCPTs}</p>
            </div>
            <div className="text-center px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Zonas activas</p>
              <p className="text-2xl font-black text-blue-400">{totalZonas}</p>
            </div>
          </div>
        </div>

        {/* Búsqueda */}
        <div className="mt-4">
          <input
            type="text"
            placeholder="Buscar por usuario, zona o CPT..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="w-full max-w-sm bg-[#020617] border border-white/10 text-white text-[11px] font-bold px-4 py-2.5 rounded-xl focus:outline-none focus:border-blue-500/50 placeholder:text-slate-600"
          />
        </div>
      </div>

      {/* Sin datos */}
      {totalConectados === 0 ? (
        <div className="bg-[#111827]/20 p-12 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-4">
          <Users size={48} className="text-slate-600" />
          <div className="text-center">
            <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-2">Sin usuarios activos</h3>
            <p className="text-[10px] text-slate-500">No hay actividad registrada en los últimos 10 minutos</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {filtrados.map(cptGroup => (
            <div key={cptGroup.cpt}>
              {/* ── Cabecera de CPT ── */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 px-4 py-2 rounded-xl">
                  <Clock size={13} className="text-violet-400" />
                  <span className="text-[11px] font-black text-violet-300 uppercase tracking-widest">CPT {cptGroup.cpt}</span>
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {cptGroup.total} usuario{cptGroup.total !== 1 ? 's' : ''} · {cptGroup.zonas.length} zona{cptGroup.zonas.length !== 1 ? 's' : ''}
                </span>
                <div className="flex-1 h-px bg-white/5" />
              </div>

              {/* ── Grid de zonas dentro del CPT ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {cptGroup.zonas.map(zona => (
                  <div key={zona.zona}
                    className="bg-[#111827]/20 border border-white/5 rounded-2xl overflow-hidden">
                    {/* Header de zona */}
                    <div className="flex items-center justify-between px-4 py-3 bg-white/[0.03] border-b border-white/5">
                      <p className="text-[11px] font-black text-white uppercase tracking-widest">{zona.zona}</p>
                      <span className="text-base font-black text-emerald-400 bg-emerald-400/10 px-3 py-0.5 rounded-lg">
                        {zona.usuarios.length}
                      </span>
                    </div>

                    {/* Lista de usuarios */}
                    <div className="divide-y divide-white/[0.04]">
                      {zona.usuarios.map(u => (
                        <div key={u.nombre} className="flex items-center justify-between px-4 py-2.5 hover:bg-white/[0.02] transition-colors">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              u.minutos <= 3 ? 'bg-emerald-400' :
                              u.minutos <= 6 ? 'bg-yellow-400' :
                              'bg-orange-400'
                            }`} />
                            <span className="text-[11px] font-bold text-slate-300 capitalize">{u.nombre}</span>
                          </div>
                          <span className={`text-[9px] font-black ${
                            u.minutos <= 3 ? 'text-emerald-400' :
                            u.minutos <= 6 ? 'text-yellow-400' :
                            'text-orange-400'
                          }`}>
                            {u.minutos === 0 ? 'ahora' : `${u.minutos}m`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Leyenda */}
      {totalConectados > 0 && (
        <div className="mt-6 flex gap-4 text-[9px] font-black tracking-widest text-slate-500">
          <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400" /> 0–3 min</span>
          <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-400" /> 4–6 min</span>
          <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-400" /> 7–10 min</span>
        </div>
      )}
    </PageWrapper>
  );
};

export default Conectados;
