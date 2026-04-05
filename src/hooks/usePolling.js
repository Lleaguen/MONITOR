import { useEffect, useRef } from 'react';
import { fetchStatus, fetchSnapshot } from '../utils/api.js';

const DEFAULT_INTERVAL = parseInt(process.env.REACT_APP_POLL_INTERVAL_MS, 10) || 60000;

/**
 * usePolling — consulta el backend periódicamente y notifica cuando hay un snapshot más nuevo.
 *
 * @param {boolean} enabled - Solo activo cuando es true (modo viewer)
 * @param {string|null} currentLastUpdate - ISO string del snapshot actualmente mostrado
 * @param {function} onNewSnapshot - Callback(data) cuando hay un snapshot más nuevo
 * @param {number} [intervalMs] - Intervalo en ms (default: REACT_APP_POLL_INTERVAL_MS || 60000)
 */
const usePolling = (enabled, currentLastUpdate, onNewSnapshot, intervalMs = DEFAULT_INTERVAL) => {
  // Usar ref para acceder al valor más reciente sin re-crear el intervalo
  const currentLastUpdateRef = useRef(currentLastUpdate);
  const onNewSnapshotRef = useRef(onNewSnapshot);

  useEffect(() => {
    currentLastUpdateRef.current = currentLastUpdate;
  }, [currentLastUpdate]);

  useEffect(() => {
    onNewSnapshotRef.current = onNewSnapshot;
  }, [onNewSnapshot]);

  useEffect(() => {
    if (!enabled) return;

    const tick = async () => {
      try {
        const statusRes = await fetchStatus();
        const serverLastUpdate = statusRes?.lastUpdate;

        if (
          serverLastUpdate &&
          currentLastUpdateRef.current &&
          serverLastUpdate > currentLastUpdateRef.current
        ) {
          const data = await fetchSnapshot();
          onNewSnapshotRef.current(data);
        } else if (serverLastUpdate && !currentLastUpdateRef.current) {
          // Si no tenemos referencia local, actualizar igual
          const data = await fetchSnapshot();
          onNewSnapshotRef.current(data);
        }
      } catch (err) {
        console.error('[usePolling] Error durante el polling:', err);
      }
    };

    const intervalId = setInterval(tick, intervalMs);

    return () => {
      clearInterval(intervalId);
    };
  }, [enabled, intervalMs]);
};

export default usePolling;
