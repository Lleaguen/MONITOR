# Monitor Inbound — OCASA

Dashboard operativo en tiempo real para el monitoreo del turno de descarga e inbound de OCASA. Procesa datos del TMS (CSV) y Easy Docking (Excel) para brindar visibilidad completa del estado de la operación.

Soporta dos modos de uso: **Admin** (sube los archivos y publica los datos) y **Viewer** (ve el dashboard en tiempo real sin necesidad de tener los archivos).

---

## Cómo usar

### 1. Iniciar la aplicación

```bash
npm install
npm start
```

### 2. Modos de uso

Al abrir la app, se consulta automáticamente el servidor para saber si hay datos disponibles:

- **Si hay datos en el servidor** → aparece el selector de modo:
  - **Ver Dashboard** — consume el snapshot del servidor (modo Viewer)
  - **Cargar Archivos** — sube nuevos archivos para publicar (modo Admin)
- **Si no hay datos** → va directo a la pantalla de carga de archivos

### 3. Modo Admin — cargar datos

Se deben subir dos archivos:

- **CSV Inbound (TMS)** — exportado del sistema TMS, una fila por pieza bipeada
- **Excel Easy Docking** — reporte de atraque/desatraque de vehículos en guardia

Una vez cargados, el front procesa los datos localmente y los publica automáticamente al servidor. El header muestra el estado de sincronización (punto verde = publicado con éxito).

Para actualizar los datos durante el turno, hacer clic en **"Cargar Datos"** en el sidebar.

### 4. Modo Viewer

Consume el snapshot publicado por el Admin. Se actualiza automáticamente cada 60 segundos. El botón "Cargar Datos" no está disponible en este modo.

### 5. Configurar parámetros

Desde la sección **Parámetros** se pueden ajustar:

| Parámetro | Descripción | Default |
|---|---|---|
| Proyectado de Entrada | Total de piezas esperadas en el turno | 239.000 |
| Objetivo de Avance HU (%) | % mínimo de avance de armado de HU | 75% |
| Productividad por Usuario | Piezas por usuario por hora en HU | 180 |
| Hora inicio Arribos (ED) | Desde qué hora contar arribos del Easy Docking | 9 |
| Hora inicio Bipeos (TMS) | Desde qué hora contar bipeos del TMS | 9 |
| Hora inicio HU (Dispatch) | Desde qué hora contar bipeos de HU | 10 |

Al cambiar cualquier parámetro, el dashboard se recalcula y se re-publica al servidor automáticamente.

---

## Vistas del monitor

### Centro de Mando

Vista principal del turno:

- **KPIs superiores**: Proyectado vs Arribado, Bipeado, Velocidad real vs esperada, Vehículos en espera por tipo con dársenas activas
- **Alerta de desvío de doca**: chasis descargando en sector camioneta (docas 43-75)
- **Pulso de Descarga**: barras de paquetes arribados vs bipeados por hora
- **Vehículos por Tipo**: líneas de vehículos anunciados por hora (Chasis / Camioneta / Semi) con plan MELI vs real CIU. Incluye botones:
  - **Cargar Plan**: ingresa el plan de vehículos por hora y tipo (persiste en el servidor)
  - **Resumen General**: modal con comparativo Meli vs Ciu por tipo
  - **Distribución**: modal con torta de distribución de vehículos y piezas recibidas por tipo
- **Velocidad de Descarga**: velocidad real vs planificada por tipo de vehículo
- **Tabla HU por CPT**: avance de armado de HU por hora de corte
- **Widget de usuarios HU**: objetivo, usuarios necesarios, activos y diferencia
- **Cortes de turno**: % de piezas **arribadas** a las 14hs, 16hs, 18hs y 20hs con tooltip de detalle

### CutOff / HU

Tabla expandible de armado y despacho de HUs por zona (SUB-CA) dentro de cada CPT.

Columnas de **Armado**: Piezas Etiquetadas, HU Abierto, HU Cerrado, Pendientes, % Avance

Columnas de **Despacho**: HUs Finalizados, HUs en Despacho, HUs Enviados, Control (OK / PENDIENTE)

**Lógica de conteo HU** (para coincidir con el monitor Excel):
- Solo cuenta piezas con `Labeling Zone` en mayúsculas (excluye zonas en minúscula del CSV)
- Excluye zonas Meli Air (terminan en `_A` o `_B`)
- Excluye `FBA1_R`
- Excluye piezas con `Hub Status`: `cancelled`, `in_hub_reject`, `blocked`
- **HU Cerrado**: piezas con `Outbound Date Closed` no vacío
- **HU Abierto**: piezas con `Outbound Included Date` pero sin `Outbound Date Closed`
- Normaliza zonas a mayúsculas y elimina guiones bajos al final (`PCK390_` → `PCK390`)

### Vehículos Plan

Tres gráficos por tipo de vehículo (Chasis, Camioneta, Semi), cada uno con:
- **Barras por hora**: CIU (real) vs MELI (plan)
- **Curva por hora**: líneas reales (no acumuladas) con labels en la curva

### Arribs. Chasis / Camioneta / Semi

Lista de vehículos anunciados en Easy Docking que todavía no descargaron (sin match en TMS).

- Código de color: verde < 500 piezas, naranja 500-699, rojo ≥ 700
- Ordenable por hora, mayor o menor cantidad de piezas

### Voluminoso

Clasificación de piezas por zona entre Paquetería y Voluminoso:

- **Paquetería**: todas las dimensiones < 50cm Y peso ≤ 20kg
- **Voluminoso**: alguna dimensión ≥ 50cm O peso > 20kg

### Super Bigger / Bigger

- **Super Bigger**: peso > 50kg O alguna dimensión ≥ 200cm
- **Bigger**: peso ≥ 30kg O alguna dimensión ≥ 150cm (excluye Super Bigger)

Curva por hora + tabla con Shipment ID, dimensiones y peso.

### Zonas CPT

Editor de asignación Labeling Zone → CPT. Permite agregar nuevas zonas, cambiar el CPT de zonas existentes y buscar por nombre. Los cambios se persisten en `localStorage` y se aplican al reprocesar los datos.

---

## Lógica de procesamiento

### Fuentes de datos

| Fuente | Formato | Columnas clave |
|---|---|---|
| TMS | CSV | `Shipment ID`, `Truck ID`, `Hub Status`, `Inbound Date Included`, `Inbound Dock ID`, `Labeling Zone`, `Outbound ID`, `Outbound Included Date`, `Outbound Date Closed`, `Dispatch ID`, `Dispatch Included Date`, `Height`, `Length`, `Width`, `Weight`, `Process Type` |
| Easy Docking | Excel (.xlsx) | `PATENTE`, `TIPO DE VEHICULO`, `TIPO DE OPERACION`, `Accion`, `CANT PAQUETES`, `Fecha y hora` (headers en fila 4) |

### Matching de patentes (TMS ↔ Easy Docking)

1. Normalización: mayúsculas, solo alfanuméricos
2. Búsqueda exacta O(1) con Set
3. Levenshtein fuzzy sobre patentes únicas del TMS:
   - Mismo largo: umbral ≥ 75% similitud
   - Diferencia de 1 carácter: umbral ≥ 80%
4. Soporte para patentes dobles separadas por `;` (semis)

Los semis solo se incluyen si se anunciaron desde las 12:00.

### Vehículos en espera

Aparece en ED con `TIPO DE OPERACION = DESCARGA` y `Accion = add`, pero su patente no matchea en el TMS. Los chasis que descargaron en sector camioneta (docas 43-75) se restan del conteo de chasis en espera.

### Dársenas activas

Bipeo en los últimos 10 minutos (relativo al último bipeo del archivo):

- Docas 20-26: Semi
- Docas 27-42: Chasis
- Docas 43-75: Camioneta

### Velocidad real

```
velocidad = piezas_bipeadas_desde_inicio_hora_actual / minutos_transcurridos × 60
```

### Descarga x Hora (esperado)

```
descarga_x_hora = (proyectado - bipeado) / horas_restantes_hasta_22:00
```

### Avance de HU

```
avance = (piezas_HU_cerrado + piezas_HU_abierto) / piezas_etiquetadas × 100
```

### Cortes de turno (14hs, 16hs, 18hs, 20hs)

Usan **piezas arribadas** del Easy Docking (no bipeadas del TMS), filtradas desde `horaInicioArribos`.

```
piezas_antes_del_corte = sum(CANT_PAQUETES donde hora >= horaInicioArribos Y hora <= hora_corte)
```

### Usuarios activos en HU

Último bipeo de outbound hace menos de 5 minutos (relativo al último bipeo del archivo).

### Usuarios necesarios para terminar a tiempo

```
usuarios_necesarios = piezas_pendientes_HU / productividad_por_usuario / horas_hasta_22:00
```

### Plan de vehículos (persistencia)

El plan se guarda en el servidor via `POST /plan` **independientemente del snapshot**. Cuando cualquier Admin sube nuevos archivos, el servidor inyecta automáticamente el plan guardado en el nuevo snapshot si este no trae uno. Esto evita que actualizaciones de datos borren el plan cargado.

---

## Arquitectura del proyecto

```
src/
  core/                        — Lógica de negocio pura (sin React)
    api/
      index.js                 — pushSnapshot, fetchSnapshot, fetchStatus, pushPlan, fetchPlan
    processors/
      helpers.js               — Levenshtein, parseo de fechas, tipos de vehículo
      zonaCPT.js               — Mapa Labeling Zone → CPT, CPT_ORDEN
      easyDockingParser.js     — Parseo del Excel de Easy Docking
      vehiculosProcessor.js    — Matching patentes, dársenas, vehículos en espera
      kpisProcessor.js         — KPIs, matrix, targets (con arribos), chart data, piezasPorTipo
      huProcessor.js           — Tabla HU por CPT/zona, usuarios activos, filtros de zona
      voluminosoProcessor.js   — Voluminoso, Super Bigger, Bigger, arrivals
    dataProcessor.js           — Orquestador: coordina todos los processors
    vehiculosPlan.js           — PLAN_HOURS, emptyPlan(), mergePlanConReal()

  shared/                      — Reutilizable entre features
    components/
      Card.jsx                 — Card base con glow
      StatCard.jsx             — Card de métrica
      ProgressBar.jsx          — Barra de progreso con color condicional
      SortButton.jsx           — Botón de ordenamiento
      PageWrapper.jsx          — Wrapper con animación fade-in
      index.js                 — Re-exporta todos
    charts/
      ChartPrimitives.jsx      — CustomDot, PillLabel (con offset), BarLabel
      index.js
    constants/
      design.js                — VEHICLE_COLORS, CHART_COLORS, TOOLTIP_STYLE, BG_APP
      index.js

  features/                    — Módulos por dominio de negocio
    dashboard/
      components/
        KpiGrid.jsx            — KPIs superiores + alertas de doca
        MainChart.jsx          — Gráfico Pulso de Descarga (barras)
        MatrixPanel.jsx        — Velocidad de descarga por tipo
        HUTable.jsx            — Tabla HU por CPT
        TargetCards.jsx        — Cortes de turno con tooltip (usa arribos)
      pages/
        CommandCenter.jsx      — Vista principal del turno
    vehicles/
      components/
        VehiculosChart.jsx     — Vistas: Arribo por tipo, Total vs Plan, Plan por tipo
                                  + modales: Resumen General, Distribución (torta)
      pages/
        VehiculosPlan.jsx      — Gráficos CIU vs MELI por tipo (barras + curva real)
        ArribosPage.jsx        — Tabla de arrivals parametrizada
    cutoff/
      pages/
        CutOff.jsx             — Tabla expandible CPT/zona con control HU
    inventory/
      pages/
        Voluminoso.jsx         — Paquetería vs Voluminoso por zona
        SuperBigger.jsx        — Super Bigger y Bigger con tabs
    configuration/
      pages/
        Parameters.jsx         — Formulario de parámetros configurables
        ZonasCPT.jsx           — Editor de asignación Zona → CPT

  app/                         — Orquestación y shell de la aplicación
    hooks/
      useAdminSync.js          — Lógica de sync del Admin (carga, recálculo, push, plan)
      usePolling.js            — Polling periódico para modo Viewer
    layout/
      Sidebar.jsx              — Navegación lateral colapsable
      Header.jsx               — Encabezado con hora y SyncStatus
      SyncStatus.jsx           — Indicador de estado de sincronización
    screens/
      LoadingScreen.jsx        — Pantalla de carga inicial
      ErrorScreen.jsx          — Pantalla de error
      FileUploader.jsx         — Carga de archivos CSV + Excel
      ModeSelector.jsx         — Selección Admin / Viewer

  App.jsx                      — Orquestador principal (modos, estado global, routing)
  index.js                     — Entry point React
  index.css                    — Estilos globales
```

---

## Variables de entorno

| Variable | Descripción | Default |
|---|---|---|
| `REACT_APP_API_URL` | URL del backend | `http://localhost:3001` |
| `REACT_APP_POLL_INTERVAL_MS` | Intervalo de polling para Viewers (ms) | `60000` |

Crear un archivo `.env` en la raíz del proyecto para configurarlas localmente.

---

## Deploy

- **Front-end**: GitHub Pages — `https://lleaguen.github.io/MONITOR/`
  - Deploy automático con cada `git push` a `main` via GitHub Actions
  - Variables de entorno configuradas en `.github/workflows/deploy.yml`

- **Back-end**: Render — `https://monitor-c0bd.onrender.com`
  - Ver `server/README.md` para detalles

---

## Stack tecnológico

- **React 19** — UI
- **Tailwind CSS 3** — Estilos
- **Recharts** — Gráficos
- **PapaParse** — Parseo de CSV
- **SheetJS (xlsx)** — Parseo de Excel
- **Day.js** — Manejo de fechas
- **Lucide React** — Íconos
