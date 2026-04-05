# Plan de Implementación: sync-front-back

## Overview

Conectar el front React con el backend Express introduciendo dos modos de uso (Admin y Viewer), con selección de modo al inicio, publicación de snapshot, polling automático e indicadores de estado de sincronización. Todos los cambios son en `src/`.

## Tasks

- [x] 1. Refactorizar el estado de App.jsx para soportar modos y datos del servidor
  - Reemplazar el `useMemo` de `dashboardData` por estado directo `useState(null)`
  - Agregar estados: `appMode` (`'loading' | 'mode-selector' | 'file-uploader' | 'dashboard-admin' | 'dashboard-viewer' | 'error'`), `syncState`, `syncTime`, `serverLastUpdate`
  - Agregar `useEffect` que invoca `fetchStatus` al montar y transiciona `appMode` según la respuesta (`mode-selector`, `file-uploader` o `file-uploader` con banner de error)
  - Mientras espera `fetchStatus`, renderizar un indicador de carga en lugar del contenido
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]* 1.1 Escribir property test — Property 2: Estado inicial determinado por fetchStatus
    - **Property 2: Estado inicial determinado por fetchStatus**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4**

- [x] 2. Crear el componente ModeSelector
  - Crear `src/components/ModeSelector.jsx` con props `{ lastUpdate, onViewDashboard, onLoadFiles }`
  - Mostrar dos opciones diferenciadas: "Ver Dashboard" y "Cargar Archivos"
  - Mostrar la hora de `lastUpdate` formateada (HH:MM) o "Sin datos previos" si es null
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 2.1 Escribir unit tests para ModeSelector
    - Verificar que renderiza "Sin datos previos" cuando `lastUpdate` es null
    - Verificar que renderiza la hora formateada cuando `lastUpdate` es un ISO string válido
    - _Requirements: 5.4, 5.5_

  - [ ]* 2.2 Escribir property test — Property 8: ModeSelector muestra lastUpdate o fallback
    - **Property 8: ModeSelector muestra lastUpdate o fallback**
    - **Validates: Requirements 5.4, 5.5**

- [x] 3. Crear el componente SyncStatus
  - Crear `src/components/SyncStatus.jsx` con props `{ state, time }`
  - `syncing` → spinner + "Sincronizando..."
  - `success` → punto verde + hora en HH:MM (zona horaria del navegador)
  - `error` → punto rojo + "Error de sincronización"
  - `idle` → no renderizar nada
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ]* 3.1 Escribir unit tests para SyncStatus
    - Verificar spinner en estado `syncing`
    - Verificar punto verde + hora en estado `success`
    - Verificar punto rojo en estado `error`
    - _Requirements: 6.2, 6.3, 6.4_

- [x] 4. Implementar el flujo Admin en App.jsx
  - En `handleDataLoad`: después de calcular `dashboardData` con `processCombinedData`, invocar `pushSnapshot`, actualizar `syncState`/`syncTime` según resultado y setear `appMode` a `'dashboard-admin'`
  - Si `pushSnapshot` falla, setear `syncState` a `'error'` y mostrar el dashboard con datos locales igualmente
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 4.1 Escribir property test — Property 3: Push exitoso implica SyncStatus success
    - **Property 3: Push exitoso implica SyncStatus success**
    - **Validates: Requirements 2.2, 6.2**

  - [ ]* 4.2 Escribir property test — Property 4: Push fallido implica SyncStatus error
    - **Property 4: Push fallido implica SyncStatus error**
    - **Validates: Requirements 2.3, 6.3**

- [x] 5. Crear el hook usePolling
  - Crear `src/hooks/usePolling.js` con firma `usePolling(enabled, currentLastUpdate, onNewSnapshot, intervalMs?)`
  - Usar `useEffect` con `setInterval`; limpiar el intervalo en el cleanup
  - Leer `REACT_APP_POLL_INTERVAL_MS` del entorno con fallback a 60000
  - En cada tick: llamar `fetchStatus`; si `lastUpdate` del servidor es más reciente que `currentLastUpdate`, llamar `fetchSnapshot` y pasar el resultado a `onNewSnapshot`
  - Si `fetchStatus` falla durante el polling, hacer `console.error` y continuar sin interrumpir la vista
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 5.1 Escribir property test — Property 5: Polling detecta snapshot más nuevo
    - **Property 5: Polling detecta snapshot más nuevo**
    - **Validates: Requirements 4.1, 4.2**

  - [ ]* 5.2 Escribir property test — Property 6: Polling no invoca fetchSnapshot si no hay cambio
    - **Property 6: Polling no invoca fetchSnapshot si no hay cambio**
    - **Validates: Requirements 4.1, 4.2**

- [x] 6. Implementar el flujo Viewer en App.jsx y conectar usePolling
  - Agregar handler `handleViewDashboard`: invoca `fetchSnapshot`, setea `dashboardData` y `appMode` a `'dashboard-viewer'`; si falla, setear `appMode` a `'error'`
  - Invocar `usePolling` con `enabled = appMode === 'dashboard-viewer'`, pasando `serverLastUpdate` y un callback que actualice `dashboardData` y `serverLastUpdate`
  - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.2, 4.3_

- [ ] 7. Checkpoint — Verificar que todos los tests pasan
  - Asegurarse de que todos los tests pasan, consultar al usuario si surgen dudas.

- [x] 8. Modificar Header para mostrar SyncStatus y lastUpdate del Viewer
  - Agregar props opcionales `syncStatus` (objeto `{ state, time }`) y `viewerLastUpdate` (string ISO o null)
  - Cuando `syncStatus` está presente, renderizar `<SyncStatus>` en el Header (solo Admin)
  - Cuando `viewerLastUpdate` está presente, mostrar la hora formateada del snapshot del servidor (solo Viewer)
  - _Requirements: 3.5, 6.1_

- [x] 9. Modificar Sidebar para ocultar "Cargar Datos" en modo Viewer
  - Agregar prop `isViewer: boolean` al componente `Sidebar`
  - Cuando `isViewer === true`, no renderizar el botón "Cargar Datos" en desktop ni en mobile
  - _Requirements: 3.4_

  - [ ]* 9.1 Escribir unit tests para Sidebar
    - Verificar que con `isViewer=true` el botón "Cargar Datos" no está en el DOM
    - Verificar que con `isViewer=false` el botón sí está presente
    - _Requirements: 3.4_

  - [ ]* 9.2 Escribir property test — Property 7: Viewer no puede acceder al FileUploader
    - **Property 7: Viewer no puede acceder al FileUploader**
    - **Validates: Requirements 3.4**

- [x] 10. Cablear todo en App.jsx — renderizado condicional por modo
  - Renderizar según `appMode`:
    - `loading` → indicador de carga
    - `mode-selector` → `<ModeSelector>` con `lastUpdate=serverLastUpdate`
    - `file-uploader` → `<FileUploader>` (con banner de error si el servidor no estaba disponible)
    - `dashboard-admin` → layout completo con `<Sidebar isViewer=false>` y `<Header syncStatus={...}>`
    - `dashboard-viewer` → layout completo con `<Sidebar isViewer=true>` y `<Header viewerLastUpdate={...}>`
    - `error` → pantalla de error con mensaje
  - Pasar `isViewer` al Sidebar y las props de sync/viewer al Header según el modo activo
  - _Requirements: 1.2, 1.3, 1.4, 1.5, 2.2, 3.2, 3.3, 5.2, 5.3_

  - [ ]* 10.1 Escribir property test — Property 1: Snapshot round-trip
    - **Property 1: Snapshot round-trip**
    - **Validates: Requirements 2.5**

- [ ] 11. Checkpoint final — Verificar que todos los tests pasan
  - Asegurarse de que todos los tests pasan, consultar al usuario si surgen dudas.

## Notes

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia los requisitos específicos para trazabilidad
- El backend no se modifica; todos los cambios son en `src/`
- Los property tests usan **fast-check** con el tag `Feature: sync-front-back, Property N`
- El intervalo de polling se configura con `REACT_APP_POLL_INTERVAL_MS` (default 60000 ms)
