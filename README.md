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

- **Si hay datos en el servidor** → aparece el selector de modo con dos opciones:
  - **Ver Dashboard** — consume el snapshot del servidor (modo Viewer)
  - **Cargar Archivos** — sube nuevos archivos para publicar (modo Admin)

- **Si no hay datos** → va directo a la pantalla de carga de archivos (modo Admin)

### 3. Modo Admin — cargar datos

Se deben subir dos archivos:

- **CSV Inbound (TMS)** — exportado del sistema TMS, contiene una fila por pieza bipeada
- **Excel Easy Docking** — reporte de atraque/desatraque de vehículos en guardia

Una vez cargados ambos archivos, el front procesa los datos localmente y los publica automáticamente al servidor. El header muestra el estado de sincronización (punto verde = publicado con éxito).

Para actualizar los datos durante el turno, hacer clic en **"Cargar Datos"** en el sidebar.

### 4. Modo Viewer

os publicados por el Admin. El dashboard se actualiza automáticamente cada 60 segundos si el Admin publica nuevos datos. El botón "Cargar Datos" no está disponible en este modo.

### 5. Configurar parámetros

Desde la sección **Parámetros** se pueden ajustar (solo en modo Admin):

| Parámetro | Descripción | Default |
|---|---|---|
| Proyectado de Entrada | Total de piezas esperadas en el turno | 239.000 |
| Objetivo de Avance HU (%) | % mínimo de avance de armado de HU | 75% |
| Productividad por Usuario | Piezas por usuario por hora en HU | 180 |

Al cambiar un parámetro, el dashboard se recalcula automáticamente y se re-publica al servidor.

---

## Vistas del monitor

### Centro de Mando

Vista principal del turno. Muestra:

- **KPIs superiores**: Proyectado vs Arribado, Bipeado, Velocidad de descarga esperada vs real, Vehículos en espera por tipo (Chasis / Camioneta / Semi) con dársenas activas
- **Alerta de desvío de descargando ahora y cuántos ya descargaron
- **Pulso de Descarga**: gráfico de barras con paquetes arribados vs bipeados por hora (desde las 9hs)
- **Arribo por Tipo de Vehículo**: gráfico de líneas con cantidad de vehículos anunciados por hora, discriminado por Chasis / Camioneta / Semi
- **Velocidad de Descarga**: velocidad real vs planificada por tipo de vehículo (u/hr)
- **Tabla HU por CPT**: avance de armado de HU por hora d
- **Widget de usuarios HU**: objetivo de avance, usuarios necesarios para terminar a tiempo, activos y diferencia
- **Cortes de turno**: % de avance bipeado a las 12hs, 16hs y 19hs respecto al proyectado

### CutOff / HU

Vista detallada del armado y despacho de HUs por zona (SUB-CA) dentro de cada CPT.

Columnas de **Armado**:
- Piezas Etiquetadas
- Piezas en HU Abierto
- Piezas en HU Cerrado
- Piezas Pendientes de HU
- % Avance

Columnas de **Despacho**:
- HUs Finalizados (`Hub Status = outbound_finished`)
- HUs en Despacho (Outbound IDs únicos con posición asignada)
- HUs Enviados (Dispatch IDs únicos desde las 10hs)
- Control (OK / PENDIENTE según si hay piezas pendientes)

Resumen global con total de piezas, avance, faltante para el objetivo y totales de despacho.

### Voluminoso

Clasificación de piezas por zona entre **Paquetería** y **Voluminoso**:

- **Paquetería**: todas las dimensiones < 50cm Y peso ≤ 20kg
- **Voluminoso**: alguna dimensión ≥ 50cm O peso > 20kg (el peso en el TMS está en gramos)

Mueotales globales y desglose por CPT → zona con barra de % voluminoso. Incluye filtros para ver solo paquetería, solo voluminoso o todos.

### Super Bigger

Piezas clasificadas como **Super Bigger**: peso > 30kg (30.000g) Y alguna dimensión > 150cm.

- Resumen: total, peso máximo, dimensión máxima
- Curva de Super Bigger bipeados por hora
- Tabla con Shipment ID, dimensiones (cm), peso (kg) y hora de bipeo
- Ordenable por mayor peso u hora

### Arribs. Chasis

Lista de chasis anunciados en Easy Docking que **todavía no descargaron** (no tienen match en el TMS).

- Código de color por cantidad de piezas: verde < 500, naranja 500-699, rojo ≥ 700
- Ordenable por hora (más reciente primero), mayor o menor cantidad de piezas
- Resumen por categoría de color

---

## Lógica de procesamiento

### Fuentes de datos

| Fuente | Formato | Contenido |
|---|---|---|
`Outbound Included Date`, `Outbound Date Closed`, `Dispatch ID`, `Dispatch Included Date`, `Height`, `Length`, `Width`, `Weight` |
| Easy Docking | Excel (.xlsx) | Una fila por evento de vehículo. Headers en fila 4. Columnas clave: `PATENTE`, `TIPO DE VEHICULO`, `TIPO DE OPERACION`, `Accion`, `CANT PAQUETES`, `Fecha y hora` |

### Matching de patentes (TMS ↔ Easy Docking)

Para determinar si un vehículo de ED ya está en el TMS se usa:

1. **Normalización**: mayúsculas, solo alfanuméricos
2. **Búsqueda exacta** O(1) con Set
3. **Levenshtein fuzzy** sobre patentes únicas del TMS (no sobre todas las filas):
   - Mismo largo: umbral ≥ 75% similitud
   - Diferencia de 1 carácter: umbral ≥ 80%
4. Soporte para **patentes dobles** en ED separadas por `;` (semis)

Los semis solo se incluyen si se anunciaron desde las **12:00** (filtro en Easy Docking).

### Vehículos en espera

Un vehículo está "en espera" si aparece en ED con `TIPO DE OPERACION = DESCARGA` y `Accion = add`, pero su patente **no matchea** en el TMS.

que matchearon en TMS pero descargaron en sector camioneta (docas 43-75) se **restan** del conteo de chasis en espera.

### Dársenas activas

Una dársena es activa si tuvo al menos un bipeo en los **últimos 10 minutos** (relativo al último bipeo del archivo). Se clasifica por sector:

- Docas 20-26: Semi
- Docas 27-42: Chasis
- Docas 43-75: Camioneta

### Velocidad real

Basada en la fórmula del monitor Excel:

```
velocidad = piezas_bipeadas_desde_inicio_hora_actual / minutos_transcurridos × 60
```

último bipeo del archivo como referencia temporal (no la hora del sistema), para que funcione correctamente con archivos históricos.

### Descarga x Hora (esperado)

```
descarga_x_hora = (proyectado - bipeado) / horas_restantes_hasta_22:00
```

Las horas restantes se calculan desde el último bipeo del archivo hasta las 22:00.

### Avance de HU

```
avance = (piezas_HU_cerrado + piezas_HU_abierto) / piezas_etiquetadas × 100
```

Un HU está "abierto" cuando tiene `Outbound Includedte Closed`. Está "cerrado" cuando tiene ambos.

### Usuarios activos en HU

Un usuario se considera activo si su último bipeo de outbound fue hace **menos de 5 minutos** (relativo al último bipeo del archivo). Cada usuario se asigna solo a la zona donde tuvo su última actividad, evitando duplicados entre zonas.

### Usuarios necesarios para terminar a tiempo

```
usuarios_necesarios = piezas_pendientes_HU / productividad_por_usuario / horas_hasta_22:00
```

---

## Estructura del proyecto

```
src/
  pages/
    CommandCenter.jsx    — Vista principal del turno
    CutOff.jsx           — Control CPT / HU detallado
    Voluminoso.jsx       — Clasificación paquetería vs voluminoso
    SuperBigger.jsx      — Piezas super bigger
    ArribosChasis.jsx    — Chasis pendientes de descarga
    Parameters.jsx       — Configuración de parámetros
  components/
    dashboard/
      KpiGrid.jsx        — KPIs superiores + desvíos de doca
      MainChart.jsx      — Gráfico arribo vs bipeo
      VehiculosChart.jsx — Gráfico vehículos por tipo/hora
      MatrixPanel.jsx    — Velocidad de descarga por tipo
      HUTable.jsx        — Tabla HU por CPT
      TargetCards.jsx    — Cortes de turno (12hs, 16hs, 19hs)
    layout/
      Sidebar.jsx        — Navegación lateral colapsable (prop isViewer oculta "Cargar Datos")
      Header.jsx         — Encabezado con título, última actualización y SyncStatus
    ui/
      Card.jsx           — Card base con glow
      StatCard.jsx       — Card de métrica reutilizable
      ProgressBar.jse progreso parametrizada
      SortButton.jsx     — Botón de ordenamiento
      PageWrapper.jsx    — Wrapper estándar de página
      SectionHeader.jsx  — Título de sección con acción
    FileUploader.jsx     — Pantalla de carga de archivos
    ModeSelector.jsx     — Pantalla de selección Admin / Viewer
    SyncStatus.jsx       — Indicador de estado de sincronización con el servidor
  hooks/
    usePolling.js        — Hook de polling automático para Viewers (cada 60s)
a automáticamente con cada `git push` a `main` via GitHub Actions
  - Las variables de entorno se configuran en `.github/workflows/deploy.yml`

- **Back-end**: Render — `https://monitor-c0bd.onrender.com`
  - Ver `server/README.md` para detalles del backend

---

## Stack tecnológico

- **React 19** — UI
- **Tailwind CSS 3** — Estilos
- **Recharts** — Gráficos
- **PapaParse** — Parseo de CSV
- **SheetJS (xlsx)** — Parseo de Excel
- **Day.js** — Manejo de fechas
- **Lucide React** — Íconos
ivos, stats
      voluminosoProcessor.js — Voluminoso, super bigger, arrivals chasis
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
  - El deploy se generones HTTP: pushSnapshot, fetchSnapshot, fetchStatus
    dataProcessor.js     — Orquestador principal de procesamiento
    processors/
      helpers.js         — Funciones puras compartidas (Levenshtein, parseo, tipos)
      zonaCPT.js         — Mapa zona → CPT y orden de CPTs
      easyDockingParser.js — Parseo del Excel de Easy Docking
      vehiculosProcessor.js — Matching, espera, dársenas, desvíos
      kpisProcessor.js   — KPIs, matrix, targets, chart data
      huProcessor.js     — Tabla HU, usuarios act  utils/
    api.js               — Funci