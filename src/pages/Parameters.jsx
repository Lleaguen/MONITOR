import { useState } from 'react';
import { Card } from '../components/ui/Card.jsx';
import { Save, AlertCircle } from 'lucide-react';

const NumericField = ({ label, value, onChange, onApply, color = "blue-400", min, max }) => (
  <div>
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">
      {label}
    </label>
    <div className="flex gap-3">
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onApply()}
        className={`w-full bg-[#080c14] border border-white/20 rounded-xl px-4 py-3 text-2xl md:text-3xl font-black text-${color} focus:border-blue-500 outline-none transition-all font-mono`}
      />
      <button
        onClick={onApply}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-xl flex items-center gap-2 font-black text-xs uppercase tracking-widest transition-all active:scale-95 shrink-0"
      >
        <Save size={14} /> Aplicar
      </button>
    </div>
  </div>
);

const Parameters = ({ config, setConfig }) => {
  const [local, setLocal] = useState({ ...config });

  const apply = (key) => setConfig({ ...config, [key]: Number(local[key]) });

  const field = (key, label, color, min, max) => (
    <NumericField
      label={label}
      value={local[key]}
      onChange={v => setLocal(l => ({ ...l, [key]: v }))}
      onApply={() => apply(key)}
      color={color}
      min={min}
      max={max}
    />
  );

  return (
    <div className="max-w-3xl animate-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-xl md:text-2xl font-black text-white italic tracking-tighter uppercase mb-8">
        Configuración de Operación
      </h2>

      <div className="space-y-6">
        <Card title="Metas Globales de Descarga">
          <div className="space-y-6 p-2">
            {field('proyectado', 'Proyectado de Entrada (Piezas Totales)', 'blue-400')}
          </div>
        </Card>

        <Card title="Filtros de Hora — Datos de Entrada">
          <div className="space-y-6 p-2">
            {field('horaInicioArribos', 'Desde qué hora contar Arribos (Easy Docking)', 'violet-400', 0, 23)}
            {field('horaInicioBipeos',  'Desde qué hora contar Bipeos (TMS)', 'cyan-400', 0, 23)}
          </div>
        </Card>

        <Card title="Parámetros de Armado HU">
          <div className="space-y-6 p-2">
            {field('objetivoHU',      'Objetivo de Avance HU (%)', 'yellow-400', 0, 100)}
            {field('productividadHU', 'Productividad por Usuario (piezas/hora)', 'emerald-400', 1)}
            {field('horaInicioHU',    'Desde qué hora contar Bipeos de HU (Dispatch)', 'orange-400', 0, 23)}
          </div>
        </Card>

        <div className="flex gap-3 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
          <AlertCircle className="text-blue-500 shrink-0" size={16} />
          <p className="text-[10px] text-blue-200/60 font-bold uppercase tracking-wider leading-relaxed">
            Los cambios se aplican al presionar "Aplicar" o la tecla Enter en cada campo.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Parameters;
