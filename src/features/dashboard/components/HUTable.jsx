import ProgressBar from '../../../shared/components/ProgressBar';

const getRowColor = (cpt) => {
  const h = parseFloat(cpt);
  if (h <= 1) return { text: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20'     };
  if (h <= 3) return { text: 'text-yellow-400',  bg: 'bg-yellow-500/10',  border: 'border-yellow-500/20'  };
  if (h <= 5) return { text: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20'    };
  return             { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
};

// Vista desktop: tabla compacta
const DesktopTable = ({ filas, objetivo }) => (
  <div className="hidden sm:block bg-[#111827]/10 rounded-xl border border-white/5 overflow-x-auto">
    <table className="w-full text-left">
      <thead>
        <tr className="text-[8px] font-black text-slate-600 uppercase tracking-[0.15em] border-b border-white/5">
          <th className="px-2 py-2">CPT</th>
          <th className="py-2 text-right">Etiq.</th>
          <th className="py-2 text-right">Ab.</th>
          <th className="py-2 text-right">Cerr.</th>
          <th className="py-2 text-right pr-2">Pend.</th>
          <th className="py-2 pl-2">% Av.</th>
          <th className="px-2 py-2 text-center">Usr</th>
        </tr>
      </thead>
      <tbody>
        {filas.map((row, idx) => {
          const { text } = getRowColor(row.intervalo);
          return (
            <tr key={idx} className="border-b border-white/5 text-[10px] hover:bg-white/5 transition-colors">
              <td className={`px-2 py-2 font-black italic ${text}`}>{row.intervalo}</td>
              <td className={`py-2 text-right font-black ${text}`}>{row.etiquetado.toLocaleString()}</td>
              <td className={`py-2 text-right font-bold ${text}`}>{row.huAbierto > 0 ? row.huAbierto.toLocaleString() : '-'}</td>
              <td className={`py-2 text-right font-black ${text}`}>{row.huCerrado.toLocaleString()}</td>
              <td className="py-2 text-right font-black text-orange-400 pr-2">{row.pendiente > 0 ? row.pendiente.toLocaleString() : '-'}</td>
              <td className="py-2 pl-2 w-24"><ProgressBar value={row.avance} threshold={objetivo} /></td>
              <td className="px-2 py-2 text-center font-bold text-slate-500">{row.usuarios > 0 ? row.usuarios : '-'}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

// Vista mobile: cards apiladas
const MobileCards = ({ filas, objetivo }) => (
  <div className="sm:hidden space-y-2">
    {filas.map((row, idx) => {
      const { text, bg, border } = getRowColor(row.intervalo);
      return (
        <div key={idx} className={`rounded-xl border ${border} ${bg} p-3`}>
          <div className="flex justify-between items-center mb-2">
            <span className={`text-[11px] font-black italic ${text}`}>{row.intervalo}</span>
            <span className="text-[9px] font-bold text-slate-500">{row.usuarios > 0 ? `${row.usuarios} usr` : ''}</span>
          </div>
          <div className="grid grid-cols-4 gap-1 text-center mb-2">
            {[
              { label: 'Etiq', value: row.etiquetado.toLocaleString(), cls: text },
              { label: 'Ab',   value: row.huAbierto > 0 ? row.huAbierto.toLocaleString() : '-', cls: text },
              { label: 'Cerr', value: row.huCerrado.toLocaleString(), cls: text },
              { label: 'Pend', value: row.pendiente > 0 ? row.pendiente.toLocaleString() : '-', cls: 'text-orange-400' },
            ].map(({ label, value, cls }) => (
              <div key={label}>
                <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest">{label}</p>
                <p className={`text-[10px] font-black ${cls}`}>{value}</p>
              </div>
            ))}
          </div>
          <ProgressBar value={row.avance} threshold={objetivo} />
        </div>
      );
    })}
  </div>
);

const Block = ({ title, filas, objetivo }) => (
  <div className="flex-1 min-w-0">
    <p className="text-[8px] font-black uppercase tracking-widest text-slate-600 mb-1.5">{title}</p>
    <DesktopTable filas={filas} objetivo={objetivo} />
    <MobileCards  filas={filas} objetivo={objetivo} />
  </div>
);

const HUTable = ({ tableData, objetivo = 99 }) => {
  const filas = (tableData || []).map(({ cpt, totCPT }) => ({
    intervalo:  cpt,
    etiquetado: totCPT?.etiquetado || 0,
    huAbierto:  totCPT?.huAbierto  || 0,
    huCerrado:  totCPT?.huCerrado  || 0,
    pendiente:  totCPT?.pendiente  || 0,
    avance:     totCPT?.avance     || 0,
    usuarios:   totCPT?.usuarios   || 0,
  }));

  const EARLY = ['0:00', '1:00', '2:00', '3:00', '4:00', '5:00'];
  const early = filas.filter(r => EARLY.includes(r.intervalo));
  const rest  = filas.filter(r => !EARLY.includes(r.intervalo));

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {early.length > 0 && <Block title="CPT 00:00 — 05:00"      filas={early} objetivo={objetivo} />}
      {rest.length  > 0 && <Block title="CPT 06:00 en adelante"  filas={rest}  objetivo={objetivo} />}
    </div>
  );
};

export default HUTable;
