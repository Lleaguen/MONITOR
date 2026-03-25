import React, { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { UploadCloud, CheckCircle2 } from 'lucide-react';

const FileUploader = ({ onAllDataLoaded }) => {
  const [files, setFiles] = useState({ csv: null, excel: null });

  const handleCsv = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const newFiles = { ...files, csv: results.data };
        setFiles(newFiles);
        checkCompletion(newFiles);
      }
    });
  };

  const handleExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const newFiles = { ...files, excel: evt.target.result };
      setFiles(newFiles);
      checkCompletion(newFiles);
    };
    reader.readAsArrayBuffer(file);
  };

  const checkCompletion = (currentFiles) => {
    if (currentFiles.csv && currentFiles.excel) {
      onAllDataLoaded(currentFiles.csv, currentFiles.excel);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#080c14] text-white p-6 font-sans">
      <div className="w-full max-w-xl p-10 border-2 border-dashed border-slate-800 rounded-3xl bg-[#111827]/30 flex flex-col items-center gap-8 hover:border-blue-500/50 transition-all group">
        
        <div className="p-4 bg-blue-600/10 rounded-full text-blue-500 group-hover:scale-110 transition-transform">
          <UploadCloud size={48} />
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-black tracking-tight mb-2 uppercase italic">Data Ingest Center</h2>
          <p className="text-sm text-slate-500 font-medium">Carga ambos reportes para sincronizar el monitor</p>
        </div>

        <div className="grid grid-cols-2 gap-6 w-full">
          {/* BOTÓN CSV */}
          <label className={`cursor-pointer flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-white/5 transition-all ${files.csv ? 'bg-green-500/10 border-green-500/50' : 'bg-[#1e293b]/50 hover:bg-[#1e293b]'}`}>
            {files.csv ? <CheckCircle2 className="text-green-500" /> : <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Archivo 1</div>}
            <span className={`text-[11px] font-black tracking-widest ${files.csv ? 'text-green-400' : 'text-white'}`}>
              {files.csv ? 'CSV CARGADO' : 'SUBIR CSV INBOUND'}
            </span>
            <input type="file" accept=".csv" className="hidden" onChange={handleCsv} />
          </label>

          {/* BOTÓN EXCEL */}
          <label className={`cursor-pointer flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-white/5 transition-all ${files.excel ? 'bg-green-500/10 border-green-500/50' : 'bg-[#1e293b]/50 hover:bg-[#1e293b]'}`}>
            {files.excel ? <CheckCircle2 className="text-green-500" /> : <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Archivo 2</div>}
            <span className={`text-[11px] font-black tracking-widest ${files.excel ? 'text-green-400' : 'text-white'}`}>
              {files.excel ? 'EXCEL CARGADO' : 'SUBIR EASY DOCKING'}
            </span>
            <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleExcel} />
          </label>
        </div>

        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">
          {(!files.csv || !files.excel) ? 'Esperando archivos...' : 'Procesando sincronización...'}
        </p>
      </div>
    </div>
  );
};

export default FileUploader;
