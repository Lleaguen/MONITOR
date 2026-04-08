import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import CommandCenter from './pages/CommandCenter';
import Parameters from './pages/Parameters';
import CutOff from './pages/CutOff';
import Voluminoso from './pages/Voluminoso';
import ArribosChasis from './pages/ArribosChasis';
import SuperBigger from './pages/SuperBigger';
import VehiculosPlan from './pages/VehiculosPlan';
import ArribosCamioneta from './pages/ArribosCamioneta';
import ArribosSemi from './pages/ArribosSemi';
import ZonasCPT from './pages/ZonasCPT';
import FileUploader from './components/FileUploader';
import ModeSelector from './components/ModeSelector';
import { processCombinedData } from './utils/dataProcessor';
import { pushSnapshot, fetchSnapshot, fetchStatus } from './utils/api';

import usePolling from './hooks/usePolling';

const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-[#080c14] text-white font-sans gap-4">
    <span className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Verificando servidor...</p>
  </div>
);

const ErrorScreen = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-[#080c14] text-white font-sans gap-4 p-4">
    <span className="w-3 h-3 rounded-full bg-red-500" />
    <p className="text-[11px] font-black uppercase tracking-widest text-red-400">No se pudieron cargar los datos del servidor</p>
    <p className="text-[10px] text-slate-600 font-medium">Intentá recargar la página o contactá al administrador.</p>
  </div>
);

// ─── Pantallas auxiliares ────────────────────────────────────────────────────

function App() {
  // Modo de la app
  const [appMode, setAppMode] = useState('loading');
  // 'loading' | 'mode-selector' | 'file-uploader' | 'dashboard-admin' | 'dashboard-viewer' | 'error'

  // Datos del dashboard (reemplaza el useMemo anterior)
  const [dashboardData, setDashboardData] = useState(null);

  // Archivos crudos guardados para reprocesar cuando cambian los parámetros
  const [rawFiles, setRawFiles] = useState(null); // { csv, excel }

  // Estado de sincronización (solo Admin)
  const [syncState, setSyncState] = useState('idle');
  const [syncTime, setSyncTime] = useState(null);

  // Último update del servidor (Viewer)
  const [serverLastUpdate, setServerLastUpdate] = useState(null);

  // Error de red al montar
  const [serverError, setServerError] = useState(false);

  // Navegación interna del dashboard
  const [activeTab, setActiveTab] = useState('command');

  // Parámetros configurables
  const [config, setConfig] = useState({
    proyectado: 239000,
    objetivoHU: 75,
    productividadHU: 180,
    horaInicioArribos: 9,
    horaInicioBipeos: 9,
    horaInicioHU: 10,
  });

  // Overrides de zona → CPT — persisten en localStorage
  const [zonaCPTOverrides, setZonaCPTOverrides] = useState(() => {
    try {
      const saved = localStorage.getItem('zonaCPTOverrides');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const handleOverridesChange = (newOverrides) => {
    setZonaCPTOverrides(newOverrides);
    try { localStorage.setItem('zonaCPTOverrides', JSON.stringify(newOverrides)); } catch {}
  };

  // Plan de vehículos por tipo y hora (se incluye en el snapshot)
  const [planVehiculos, setPlanVehiculos] = useState([]);

  // ── Tarea 1: fetchStatus al montar ──────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const status = await fetchStatus();
        if (status?.hasData) {
          setServerLastUpdate(status.lastUpdate ?? null);
          setAppMode('mode-selector');
        } else {
          setAppMode('file-uploader');
        }
      } catch {
        setServerError(true);
        setAppMode('file-uploader');
      }
    };
    init();
  }, []);

  // ── Tarea 4: Flujo Admin ─────────────────────────────────────────────────────
  const handleDataLoad = async (csv, excel) => {
    setRawFiles({ csv, excel });
    const data = processCombinedData(
      csv, excel,
      config.proyectado, config.objetivoHU, config.productividadHU,
      { horaInicioArribos: config.horaInicioArribos, horaInicioBipeos: config.horaInicioBipeos, horaInicioHU: config.horaInicioHU, zonaCPTOverrides }
    );
    const dataWithPlan = { ...data, planVehiculos };
    setDashboardData(dataWithPlan);
    setAppMode('dashboard-admin');
    setActiveTab('command');
    setSyncState('syncing');

    try {
      const res = await pushSnapshot(dataWithPlan);
      setSyncState('success');
      setSyncTime(res.lastUpdate ?? null);
    } catch {
      setSyncState('error');
    }
  };

  // ── Recalcular cuando cambian los parámetros (solo modo Admin con archivos) ──
  useEffect(() => {
    if (appMode !== 'dashboard-admin' || !rawFiles) return;
    const data = processCombinedData(
      rawFiles.csv, rawFiles.excel,
      config.proyectado, config.objetivoHU, config.productividadHU,
      { horaInicioArribos: config.horaInicioArribos, horaInicioBipeos: config.horaInicioBipeos, horaInicioHU: config.horaInicioHU, zonaCPTOverrides }
    );
    const dataWithPlan = { ...data, planVehiculos };
    setDashboardData(dataWithPlan);
    setSyncState('syncing');
    pushSnapshot(dataWithPlan)
      .then((res) => { setSyncState('success'); setSyncTime(res.lastUpdate ?? null); })
      .catch(() => setSyncState('error'));
  }, [config.proyectado, config.objetivoHU, config.productividadHU, config.horaInicioArribos, config.horaInicioBipeos, config.horaInicioHU, zonaCPTOverrides]); // rawFiles y appMode son refs estables

  // ── Actualizar plan y re-pushear snapshot ────────────────────────────────────
  const handlePlanChange = (nuevoPlan) => {
    setPlanVehiculos(nuevoPlan);
    if (appMode !== 'dashboard-admin' || !rawFiles) return;
    const data = processCombinedData(
      rawFiles.csv, rawFiles.excel,
      config.proyectado, config.objetivoHU, config.productividadHU,
      { horaInicioArribos: config.horaInicioArribos, horaInicioBipeos: config.horaInicioBipeos, horaInicioHU: config.horaInicioHU, zonaCPTOverrides }
    );
    const dataWithPlan = { ...data, planVehiculos: nuevoPlan };
    setDashboardData(dataWithPlan);
    setSyncState('syncing');
    pushSnapshot(dataWithPlan)
      .then((res) => { setSyncState('success'); setSyncTime(res.lastUpdate ?? null); })
      .catch(() => setSyncState('error'));
  };

  // ── Tarea 6: Flujo Viewer ────────────────────────────────────────────────────
  const handleViewDashboard = async () => {
    try {
      const data = await fetchSnapshot();
      setDashboardData(data);
      setServerLastUpdate(data?.kpis?.ultimaActualizacion ?? null);
      if (data?.planVehiculos?.length) setPlanVehiculos(data.planVehiculos);
      setAppMode('dashboard-viewer');
    } catch {
      setAppMode('error');
    }
  };

  // ── Tarea 6: Polling ─────────────────────────────────────────────────────────
  usePolling(
    appMode === 'dashboard-viewer',
    serverLastUpdate,
    (newData) => {
      setDashboardData(newData);
      setServerLastUpdate(newData?.kpis?.ultimaActualizacion ?? null);
      if (newData?.planVehiculos?.length) setPlanVehiculos(newData.planVehiculos);
    }
  );

  // ── Tarea 10: Renderizado condicional por modo ───────────────────────────────

  if (appMode === 'loading') return <LoadingScreen />;

  if (appMode === 'mode-selector') {
    return (
      <ModeSelector
        lastUpdate={serverLastUpdate}
        onViewDashboard={handleViewDashboard}
        onLoadFiles={() => setAppMode('file-uploader')}
      />
    );
  }

  if (appMode === 'file-uploader') {
    return (
      <FileUploader
        onAllDataLoaded={handleDataLoad}
        onCancel={dashboardData ? () => setAppMode('dashboard-admin') : null}
        serverError={serverError}
      />
    );
  }

  if (appMode === 'error') return <ErrorScreen />;

  // dashboard-admin | dashboard-viewer
  const isViewer = appMode === 'dashboard-viewer';

  const pageTitle =
    activeTab === 'command'     ? 'CENTRO DE MANDO OCASA' :
    activeTab === 'cutoff'      ? 'CONTROL CPT / HU' :
    activeTab === 'vehiculos'   ? 'VEHÍCULOS — PLAN VS REAL' :
    activeTab === 'chasis'      ? 'ARRIBS. DE CHASIS' :
    activeTab === 'camioneta'   ? 'ARRIBS. DE CAMIONETA' :
    activeTab === 'semi'        ? 'ARRIBS. DE SEMI' :
    activeTab === 'voluminoso'  ? 'VOLUMINOSO / PAQUETERÍA' :
    activeTab === 'superbigger' ? 'SUPER BIGGER / BIGGER' :
    activeTab === 'zonas'       ? 'ZONAS CPT' :
    'AJUSTE DE PARÁMETROS';

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#080c14] text-slate-300 font-sans overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewDispatch={() => setAppMode('file-uploader')}
        isViewer={isViewer}
      />
      <main className="flex-1 flex flex-col min-h-0 overflow-y-auto md:ml-[60px]">
        <Header
          title={pageTitle}
          lastUpdate={dashboardData?.kpis?.ultimaActualizacion}
          syncStatus={!isViewer ? { state: syncState, time: syncTime } : undefined}
          viewerLastUpdate={isViewer ? serverLastUpdate : undefined}
        />
        <div className="p-4 md:p-6 lg:p-10 flex-1">
          {activeTab === 'command' ? (
            <CommandCenter data={dashboardData} planVehiculos={planVehiculos} onPlanChange={handlePlanChange} isViewer={isViewer} />
          ) : activeTab === 'cutoff' ? (
            <CutOff data={dashboardData} />
          ) : activeTab === 'vehiculos' ? (
            <VehiculosPlan data={dashboardData} planVehiculos={planVehiculos} />
          ) : activeTab === 'chasis' ? (
            <ArribosChasis data={dashboardData} />
          ) : activeTab === 'camioneta' ? (
            <ArribosCamioneta data={dashboardData} />
          ) : activeTab === 'semi' ? (
            <ArribosSemi data={dashboardData} />
          ) : activeTab === 'voluminoso' ? (
            <Voluminoso data={dashboardData} />
          ) : activeTab === 'superbigger' ? (
            <SuperBigger data={dashboardData} />
          ) : activeTab === 'zonas' ? (
            <ZonasCPT overrides={zonaCPTOverrides} onOverridesChange={handleOverridesChange} />
          ) : (
            <Parameters config={config} setConfig={setConfig} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
