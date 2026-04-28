import React, { useState, useEffect } from 'react';
import Sidebar from './app/layout/Sidebar';
import Header from './app/layout/Header';
import CommandCenter from './features/dashboard/pages/CommandCenter';
import Parameters from './features/configuration/pages/Parameters';
import CutOff from './features/cutoff/pages/CutOff';
import Voluminoso from './features/inventory/pages/Voluminoso';
import SuperBigger from './features/inventory/pages/SuperBigger';
import VehiculosPlan from './features/vehicles/pages/VehiculosPlan';
import ArribosPage from './features/vehicles/pages/ArribosPage';
import ZonasCPT from './features/configuration/pages/ZonasCPT';
import FileUploader from './app/screens/FileUploader';
import ModeSelector from './app/screens/ModeSelector';
import LoadingScreen from './app/screens/LoadingScreen';
import ErrorScreen from './app/screens/ErrorScreen';
import { fetchSnapshot, fetchStatus } from './core/api/index';
import usePolling from './app/hooks/usePolling';
import { useAdminSync } from './app/hooks/useAdminSync';
import VelocidadDarsenas from './features/dashboard/pages/VelocidadDarsenas';
import VoluminosoDashboard from './features/dashboard/pages/VoluminosoDashboard';

function App() {
  const [appMode, setAppMode] = useState('loading');
  // 'loading' | 'mode-selector' | 'file-uploader' | 'dashboard-admin' | 'dashboard-viewer' | 'error'

  const [dashboardData, setDashboardData] = useState(null);
  const [rawFiles, setRawFiles] = useState(null);
  const [syncState, setSyncState] = useState('idle');
  const [syncTime, setSyncTime] = useState(null);
  const [serverLastUpdate, setServerLastUpdate] = useState(null);
  const [serverError, setServerError] = useState(false);
  const [activeTab, setActiveTab] = useState('command');

  const [config, setConfig] = useState({
    proyectado: 239000,
    objetivoHU: 75,
    productividadHU: 180,
    horaInicioArribos: 9,
    horaInicioBipeos: 9,
    horaInicioHU: 10,
  });

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

  const [planVehiculos, setPlanVehiculos] = useState([]);

  // ── Admin sync hook ──────────────────────────────────────────────────────────
  const { handleDataLoad, handlePlanChange: _handlePlanChange } = useAdminSync({
    rawFiles,
    config,
    zonaCPTOverrides,
    planVehiculos,
    appMode,
    setDashboardData,
    setSyncState,
    setSyncTime,
    setRawFiles,
    setAppMode,
    setActiveTab,
  });

  // handlePlanChange también actualiza planVehiculos local
  const handlePlanChange = (nuevoPlan) => {
    setPlanVehiculos(nuevoPlan);
    _handlePlanChange(nuevoPlan);
  };

  // ── fetchStatus al montar ────────────────────────────────────────────────────
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

  // ── Flujo Viewer ─────────────────────────────────────────────────────────────
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

  // ── Polling ──────────────────────────────────────────────────────────────────
  usePolling(
    appMode === 'dashboard-viewer',
    serverLastUpdate,
    (newData) => {
      setDashboardData(newData);
      setServerLastUpdate(newData?.kpis?.ultimaActualizacion ?? null);
      if (newData?.planVehiculos?.length) setPlanVehiculos(newData.planVehiculos);
    }
  );

  // ── Renderizado condicional ──────────────────────────────────────────────────
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
    activeTab === 'arribs'      ? 'ARRIBS. DE VEHÍCULOS' :
    activeTab === 'voluminoso'  ? 'VOLUMINOSO / PAQUETERÍA' :
    activeTab === 'voluminoso-dashboard' ? 'DASHBOARD VOLUMINOSO' :
    activeTab === 'superbigger' ? 'SUPER BIGGER / BIGGER' :
    activeTab === 'zonas'       ? 'ZONAS CPT' :
    activeTab === 'velocidad'   ? 'VELOCIDAD_OBJETIVO' :
    'AJUSTE DE PARÁMETROS';

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#080c14] text-slate-300 font-sans overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewDispatch={() => setAppMode('file-uploader')}
        isViewer={isViewer}
      />
      <main className="flex-1 flex flex-col min-h-0 overflow-y-auto overflow-x-hidden md:ml-[60px]">
        <Header
          title={pageTitle}
          lastUpdate={dashboardData?.kpis?.ultimaActualizacion}
          syncStatus={!isViewer ? { state: syncState, time: syncTime } : undefined}
          viewerLastUpdate={isViewer ? serverLastUpdate : undefined}
        />
        <div className="p-4 md:p-6 lg:p-10 flex-1">
          {activeTab === 'command' ? (
            <CommandCenter data={dashboardData} planVehiculos={planVehiculos} onPlanChange={handlePlanChange} isViewer={isViewer} rawCsvData={rawFiles?.csvData} />
          ) : activeTab === 'cutoff' ? (
            <CutOff data={dashboardData} />
          ) : activeTab === 'vehiculos' ? (
            <VehiculosPlan data={dashboardData} planVehiculos={planVehiculos} />
          ) : activeTab === 'arribs' ? (
            <ArribosPage data={dashboardData} />
          ) : activeTab === 'voluminoso' ? (
            <Voluminoso data={dashboardData} />
          ) : activeTab === 'voluminoso-dashboard' ? (
            <VoluminosoDashboard data={dashboardData} />
          ) : activeTab === 'superbigger' ? (
            <SuperBigger data={dashboardData} />
          ) : activeTab === 'zonas' ? (
            <ZonasCPT overrides={zonaCPTOverrides} onOverridesChange={handleOverridesChange} />
          ) : activeTab === 'velocidad' ? (
            <VelocidadDarsenas data={dashboardData}/>
          ) 
          : (
            <Parameters config={config} setConfig={setConfig} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
