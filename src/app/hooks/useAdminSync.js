import { useEffect } from 'react';
import { processCombinedData } from '../../core/dataProcessor';
import { pushSnapshot } from '../../core/api/index';

/**
 * useAdminSync — maneja la lógica de sincronización del Admin.
 *
 * Extrae handleDataLoad, handlePlanChange y el efecto de recálculo
 * cuando cambian config/overrides.
 */
export const useAdminSync = ({
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
}) => {
  // ── Recalcular cuando cambian parámetros (solo modo Admin con archivos) ──
  useEffect(() => {
    if (appMode !== 'dashboard-admin' || !rawFiles) return;
    const data = processCombinedData(
      rawFiles.csv, rawFiles.excel,
      config.proyectado, config.objetivoHU, config.productividadHU,
      {
        horaInicioArribos: config.horaInicioArribos,
        horaInicioBipeos:  config.horaInicioBipeos,
        horaInicioHU:      config.horaInicioHU,
        zonaCPTOverrides,
      }
    );
    const dataWithPlan = { ...data, planVehiculos };
    setDashboardData(dataWithPlan);
    setSyncState('syncing');
    pushSnapshot(dataWithPlan)
      .then((res) => { setSyncState('success'); setSyncTime(res.lastUpdate ?? null); })
      .catch(() => setSyncState('error'));
  }, [
    config.proyectado, config.objetivoHU, config.productividadHU,
    config.horaInicioArribos, config.horaInicioBipeos, config.horaInicioHU,
    zonaCPTOverrides,
  ]); // rawFiles, planVehiculos y setters son refs estables

  // ── handleDataLoad ──────────────────────────────────────────────────────────
  const handleDataLoad = async (csv, excel) => {
    setRawFiles({ csv, excel });
    const data = processCombinedData(
      csv, excel,
      config.proyectado, config.objetivoHU, config.productividadHU,
      {
        horaInicioArribos: config.horaInicioArribos,
        horaInicioBipeos:  config.horaInicioBipeos,
        horaInicioHU:      config.horaInicioHU,
        zonaCPTOverrides,
      }
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

  // ── handlePlanChange ────────────────────────────────────────────────────────
  const handlePlanChange = (nuevoPlan) => {
    if (appMode !== 'dashboard-admin' || !rawFiles) return;
    const data = processCombinedData(
      rawFiles.csv, rawFiles.excel,
      config.proyectado, config.objetivoHU, config.productividadHU,
      {
        horaInicioArribos: config.horaInicioArribos,
        horaInicioBipeos:  config.horaInicioBipeos,
        horaInicioHU:      config.horaInicioHU,
        zonaCPTOverrides,
      }
    );
    const dataWithPlan = { ...data, planVehiculos: nuevoPlan };
    setDashboardData(dataWithPlan);
    setSyncState('syncing');
    pushSnapshot(dataWithPlan)
      .then((res) => { setSyncState('success'); setSyncTime(res.lastUpdate ?? null); })
      .catch(() => setSyncState('error'));
  };

  return { handleDataLoad, handlePlanChange };
};
