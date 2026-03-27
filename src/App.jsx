import React, { useState, useMemo } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import CommandCenter from './pages/CommandCenter';
import Parameters from './pages/Parameters';
import FileUploader from './components/FileUploader'; 
import { processCombinedData } from './utils/dataProcessor';

function App() {
  const [dataFiles, setDataFiles] = useState(null);
  const [activeTab, setActiveTab] = useState('command');
  const [config, setConfig] = useState({ proyectado: 239000 });
  
  // 1. Estado para permitir la carga de archivos cada 15 min sin perder Parámetros
  const [isUpdating, setIsUpdating] = useState(false);

  const dashboardData = useMemo(() => {
    if (!dataFiles) return null;
    console.log("Sincronizando monitor con proyectado:", config.proyectado);
    return processCombinedData(dataFiles.csv, dataFiles.excel, config.proyectado);
  }, [dataFiles, config.proyectado]);

  // 2. Función para recibir los archivos (Nuevos o Actualización)
  const handleDataLoad = (csv, excel) => {
    setDataFiles({ csv, excel });
    setIsUpdating(false); // Cerramos el cargador
    setActiveTab('command'); // Volvemos al monitor
  };

  // 3. Si NO hay archivos cargados O si se hizo clic en "New Dispatch", mostramos Uploader
  if (!dataFiles || isUpdating) {
    return (
      <FileUploader 
        onAllDataLoaded={handleDataLoad} 
        // Permitimos cancelar si ya existen datos previos
        onCancel={dataFiles ? () => setIsUpdating(false) : null}
      />
    );
  }

  return (
    <div className="flex h-screen bg-[#080c14] text-slate-300 overflow-hidden font-sans">
      {/* 4. Pasamos la función onNewDispatch al Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onNewDispatch={() => setIsUpdating(true)} 
      />
      
      <main className="flex-1 flex flex-col overflow-y-auto">
        <Header title={activeTab === 'command' ? "OCASA COMMAND CENTER" : "AJUSTE DE PARÁMETROS"} 
          lastUpdate={kpis?.ultimaActualizacion}
        />
        
        <div className="p-10">
          {activeTab === 'command' ? (
            <CommandCenter data={dashboardData} />
          ) : (
            <Parameters config={config} setConfig={setConfig} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
