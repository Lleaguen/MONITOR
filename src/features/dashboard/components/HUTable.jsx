import ProgressBar from '../../../shared/components/ProgressBar';

// Color por CPT: 0-1 rojo, 2-3 amarillo, 4-5 azul, 6+ verde
const getRowColor = (cpt) => {
  const h = parseFloat(cpt);
  if (h <= 1)  return 'text-red-400';
  if (h <= 3)  return 'text-yellow-400';
  if (h <= 5)  return 'text-blue-400';
  return 'text-emerald-400';
};

const TableHead = () => (
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
);

const TableRows = ({ filas, objetivo }) => (
  <tbody>
    {filas.map((row, idx) => {
      const color = getRowColor(row.intervalo);
      return (
        <tr key={idx} className="border-b border-white/5 text-[10px] hover:bg-white/5 transition-colors">
          <td className={`px-2 py-2 font-black italic ${color}`}>{row.intervalo}</td>
          <td className={`py-2 text-right font-black ${color}`}>{row.etiquetado.toLocaleString()}</td>
          <td className={`py-2 text-right font-bold ${color}`}>{row.huAbierto > 0 ? row.huAbierto.toLocaleString() : '-'}</td>
          <td className={`py-2 text-right font-black ${color}`}>{row.huCerrado.toLocaleString()}</td>
          <td className="py-2 text-right font-black text-orange-400 pr-2">{row.pendiente > 0 ? row.pendiente.toLocaleString() : '-'}</td>
          <td className="py-2 pl-2 w-24">
            <ProgressBar value={row.avance} threshold={objetivo} />
          </td>
          <td className="px-2 py-2 text-center font-bold text-slate-500">{row.usuarios > 0 ? row.usuarios : '-'}</td>
        </tr>
      );
    })}
  </tbody>
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

  const EARLY_CPTS = ['0:00', '1:00', '2:00', '3:00', '4:00', '5:00'];
  const early = filas.filter(r => EARLY_CPTS.includes(r.intervalo));
  const rest  = filas.filter(r => !EARLY_CPTS.includes(r.intervalo));

  const Block = ({ title, rows }) => (
    <div className="flex-1 min-w-0">
      <p className="text-[8px] font-black uppercase tracking-widest text-slate-600 mb-1.5">{title}</p>
      <div className="bg-[#111827]/10 rounded-xl border border-white/5 overflow-x-auto">
        <table className="w-full text-left">
          <TableHead />
          <TableRows filas={rows} objetivo={objetivo} />
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {early.length > 0 && <Block title="CPT 00:00 — 05:00" rows={early} />}
      {rest.length  > 0 && <Block title="CPT 06:00 en adelante" rows={rest} />}
    </div>
  );
};

export default HUTable;
