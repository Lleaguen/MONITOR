# Requirements Document

## Introduction

La feature de sincronización front-back conecta el dashboard operativo "Monitor Inbound OCASA" con su backend Express ya existente. Actualmente el front procesa los archivos CSV (TMS) y Excel (Easy Docking) de forma completamente local, sin persistir ni compartir los datos. Esta feature introduce dos modos de uso: **Admin**, quien sube los archivos y publica el snapshot al backend, y **Viewer**, quien consume el snapshot publicado sin necesidad de tener los archivos. El objetivo es que múltiples usuarios puedan ver el mismo estado del turno en tiempo real desde distintos dispositivos.

---

## Glossary

- **App**: La aplicación React "Monitor Inbound OCASA".
- **Backend**: El servidor Express que expone los endpoints `POST /snapshot`, `GET /data`, `GET /status` y `DELETE /data`.
- **Snapshot**: El objeto `dashboardData` procesado y serializado en el Backend, que representa el estado completo del turno en un momento dado.
- **Admin**: Usuario que posee los archivos CSV y Excel del turno y tiene la capacidad de procesar y publicar el Snapshot.
- **Viewer**: Usuario que accede al dashboard leyendo el Snapshot desde el Backend, sin subir archivos.
- **ModeSelector**: Pantalla de selección de modo que la App muestra al iniciar o cuando no hay datos locales.
- **FileUploader**: Componente existente que gestiona la carga y parseo de los archivos CSV y Excel.
- **SyncStatus**: Indicador visual en el Header que muestra el estado de la última sincronización con el Backend.
- **PollingService**: Mecanismo de la App que consulta periódicamente el Backend para detectar actualizaciones del Snapshot.
- **api.js**: Módulo utilitario del front que expone `pushSnapshot`, `fetchSnapshot` y `fetchStatus`.

---

## Requirements

### Requirement 1: Detección de estado del servidor al iniciar

**User Story:** Como usuario que abre la App, quiero que la aplicación verifique automáticamente si hay datos disponibles en el servidor, para que pueda decidir si ver el dashboard existente o subir archivos nuevos.

#### Acceptance Criteria

1. WHEN la App se monta, THE App SHALL invocar `fetchStatus` de `api.js` para consultar el estado del Backend.
2. WHEN `fetchStatus` retorna `{ hasData: true }`, THE App SHALL mostrar el ModeSelector con las opciones "Ver Dashboard" y "Cargar Archivos (Admin)".
3. WHEN `fetchStatus` retorna `{ hasData: false }`, THE App SHALL mostrar directamente el FileUploader sin pasar por el ModeSelector.
4. IF `fetchStatus` falla por error de red, THEN THE App SHALL mostrar el FileUploader con un mensaje indicando que el servidor no está disponible.
5. WHILE la App espera la respuesta de `fetchStatus`, THE App SHALL mostrar un indicador de carga en lugar del ModeSelector o el FileUploader.

---

### Requirement 2: Modo Admin — publicación del snapshot

**User Story:** Como Admin, quiero que al terminar de cargar los archivos el dashboard se publique automáticamente en el servidor, para que los Viewers puedan verlo sin necesidad de tener los archivos.

#### Acceptance Criteria

1. WHEN el Admin completa la carga de ambos archivos en el FileUploader, THE App SHALL procesar los datos localmente con `processCombinedData` y luego invocar `pushSnapshot` con el `dashboardData` resultante.
2. WHEN `pushSnapshot` retorna con éxito, THE App SHALL navegar a la vista del dashboard y mostrar el SyncStatus con la hora de la última sincronización exitosa.
3. IF `pushSnapshot` falla, THEN THE App SHALL mostrar el dashboard con los datos locales y mostrar en el SyncStatus un indicador de error de sincronización.
4. WHEN el Admin hace clic en "Cargar Datos" para actualizar archivos, THE App SHALL repetir el proceso de carga, procesamiento y `pushSnapshot` con los nuevos datos.
5. THE App SHALL enviar el `dashboardData` completo como payload JSON al endpoint `POST /snapshot` del Backend.

---

### Requirement 3: Modo Viewer — consumo del snapshot

**User Story:** Como Viewer, quiero poder ver el dashboard leyendo los datos del servidor sin necesidad de tener los archivos CSV o Excel, para monitorear el turno desde cualquier dispositivo.

#### Acceptance Criteria

1. WHEN el Viewer selecciona "Ver Dashboard" en el ModeSelector, THE App SHALL invocar `fetchSnapshot` de `api.js` y usar el objeto retornado como `dashboardData`.
2. WHEN `fetchSnapshot` retorna el Snapshot, THE App SHALL renderizar todas las vistas del dashboard (CommandCenter, CutOff, Voluminoso, ArribosChasis, SuperBigger) con los datos recibidos.
3. IF `fetchSnapshot` falla, THEN THE App SHALL mostrar un mensaje de error indicando que no se pudieron cargar los datos del servidor.
4. WHILE el Viewer está en modo Viewer, THE App SHALL ocultar el botón "Cargar Datos" del Sidebar, ya que el Viewer no puede subir archivos.
5. WHILE el Viewer está en modo Viewer, THE App SHALL mostrar en el Header la hora de `lastUpdate` recibida en el Snapshot.

---

### Requirement 4: Polling automático para Viewers

**User Story:** Como Viewer, quiero que el dashboard se actualice automáticamente cuando el Admin publique un nuevo snapshot, para ver siempre el estado más reciente del turno sin tener que recargar la página.

#### Acceptance Criteria

1. WHILE el Viewer está en modo Viewer, THE PollingService SHALL consultar `fetchStatus` cada 60 segundos para detectar si hay un Snapshot más reciente.
2. WHEN `fetchStatus` retorna un `lastUpdate` más reciente que el del Snapshot actualmente mostrado, THE PollingService SHALL invocar `fetchSnapshot` y actualizar el `dashboardData` en la App.
3. WHEN el Viewer navega fuera de la App o cierra la pestaña, THE PollingService SHALL detener el intervalo de polling para evitar memory leaks.
4. IF `fetchStatus` falla durante el polling, THEN THE PollingService SHALL registrar el error en consola y continuar el ciclo de polling sin interrumpir la visualización actual.
5. WHERE el intervalo de polling sea configurable, THE App SHALL leer el valor desde la variable de entorno `REACT_APP_POLL_INTERVAL_MS` con un valor por defecto de 60000 ms.

---

### Requirement 5: Selector de modo (ModeSelector)

**User Story:** Como usuario, quiero una pantalla clara que me permita elegir entre ver el dashboard existente o cargar archivos nuevos, para no tener que saber de antemano qué modo usar.

#### Acceptance Criteria

1. THE ModeSelector SHALL presentar dos opciones claramente diferenciadas: "Ver Dashboard" (modo Viewer) y "Cargar Archivos" (modo Admin).
2. WHEN el usuario selecciona "Ver Dashboard", THE ModeSelector SHALL iniciar el flujo del Requirement 3.
3. WHEN el usuario selecciona "Cargar Archivos", THE ModeSelector SHALL mostrar el FileUploader e iniciar el flujo del Requirement 2.
4. THE ModeSelector SHALL mostrar la hora del último Snapshot disponible (`lastUpdate` retornado por `fetchStatus`) para que el usuario pueda evaluar la vigencia de los datos.
5. IF `lastUpdate` es nulo o no está disponible, THEN THE ModeSelector SHALL mostrar "Sin datos previos" en lugar de una fecha.

---

### Requirement 6: Indicador de estado de sincronización (SyncStatus)

**User Story:** Como Admin, quiero ver en todo momento si el último push al servidor fue exitoso, para saber si los Viewers están viendo datos actualizados.

#### Acceptance Criteria

1. THE SyncStatus SHALL ser visible en el Header mientras el Admin está en modo Admin con el dashboard activo.
2. WHEN el último `pushSnapshot` fue exitoso, THE SyncStatus SHALL mostrar un indicador verde con la hora de la última sincronización exitosa.
3. WHEN el último `pushSnapshot` falló, THE SyncStatus SHALL mostrar un indicador rojo con el texto "Error de sincronización".
4. WHILE `pushSnapshot` está en curso, THE SyncStatus SHALL mostrar un indicador de carga (spinner o texto "Sincronizando...").
5. THE SyncStatus SHALL mostrar la hora en formato local (HH:MM) usando la zona horaria del navegador del Admin.
