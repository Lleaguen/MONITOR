import React from 'react';
import { Card } from '../components/ui/Card';
import { Save, AlertCircle } from 'lucide-react';

const Parameters = ({ config, setConfig }) => {
  return (
    <div className="max-w-3xl animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-8">
        <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Configuración de Operación</h2>
      </div>

      <div className="space-y-6">
        <Card title="Metas Globales">
          <div className="space-y-6 p-2">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">
                Proyectado de Entrada (Piezas Totales)
              </label>
              <div className="flex gap-4">
                <input 
                type="number" 
                value={config.proyectado}
                onChange={(e) => setConfig({ ...config, proyectado: Number(e.target.value) })}
                className="w-full bg-[#080c14] border border-white/20 rounded-xl px-6 py-4 text-4xl font-black text-blue-400 focus:border-blue-500 outline-none transition-all font-mono"/>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-xl flex items-center gap-2 font-black text-xs uppercase tracking-widest transition-all">
                  <Save size={16} /> Aplicar
                </button>
              </div>
            </div>

            <div className="flex gap-3 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
              <AlertCircle className="text-blue-500 shrink-0" size={16} />
              <p className="text-[10px] text-blue-200/60 font-bold uppercase tracking-wider leading-relaxed">
                Este valor se utiliza para calcular el % de Arribo y los Deltas de producción. 
                Los cambios se reflejan instantáneamente en el Command Center.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Parameters;
