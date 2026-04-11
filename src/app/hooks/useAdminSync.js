import { useEffect } from 'react';
import { processCombinedData } from '../../core/dataProcessor';
import { pushSnapshot, pushPlan } from '../../core/api/index';

/**
 * useAdminSync — maneja la lógica de sincronización del Admin.
 *
 * Extrae handleDataLoad, handlePlanChange y el efecto de recálculo
 * cuando cambian config/overrides.
 *
 * Flujo de datos:
 * 1. handleDataLoad: carga archivos → procesa → publica snapshot al servidor
 * 2. handlePlanChange: guarda plan en servidor (POST /plan) + actualiza snapshot
 * 3. useEffect: recalcula automáticamente cuando cambian parámetros de config
 *
 * El plan se guarda SEPARADO del snapshot para que no se pierda cuando
 * otro Admin sube nuevos archivos. Ver server/store/snapshot.js.
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
    // Guardar plan por separado en el servidor para que persista
    pushPlan(nuevoPlan).catch(() => {});
    pushSnapshot(dataWithPlan)
      .then((res) => { setSyncState('success'); setSyncTime(res.lastUpdate ?? null); })
      .catch(() => setSyncState('error'));
  };

  return { handleDataLoad, handlePlanChange };
};
