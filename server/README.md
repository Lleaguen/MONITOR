# Monitor Inbound — Backend (OCASA)

Servidor Express que actúa como intermediario de sincronización entre el Admin y los Viewers del dashboard. Recibe el snapshot procesado desde el front-end del Admin y lo sirve a todos los Viewers en tiempo real.

---

## Cómo usar

### 1. Instalar dependencias

```bash
cd server
npm install
```

### 2. Iniciar el servidor

```bash
# Producción
npm start

# Desarrollo (se reinicia automáticamente al guardar cambios)
npm run dev
```

El servidor corre en `http://localhost:3001` por defecto.

### 3. Variables de entorno

Crear un archivo `.env` dentro de `server/` si se necesita configuración personalizada:

| Variable | Descripción | Default |
|---|---|---|
| `PORT` | Puerto en el que corre el servidor | `3001` |

---

## Cómo funciona

El backend no procesa ningún archivo. Toda la lógica de procesamiento vive en el front-end. El flujo es:

1. El **Admin** sube los archivos CSV y Excel en el front-end
2. El front-end procesa los datos localmente con `processCombinedData` y genera el objeto `dashboardData`
3. El front-end envía ese objeto al backend via `POST /snapshot`
4. El backend lo guarda en memoria
5. Los **Viewers** consultan `GET /status` para saber si hay datos disponibles
6. Si hay datos, los Viewers llaman `GET /data` y reciben el `dashboardData` completo
7. Los Viewers hacen polling cada 60 segundos para detectar actualizaciones

```
Admin (front)                Backend              Viewer (front)
     |                          |                       |
     |-- POST /snapshot ------->|                       |
     |                          |-- guarda en memoria   |
     |                          |                       |
     |                          |<-- GET /status -------|
     |                          |--- { hasData: true } ->|
     |                          |                       |
     |                          |<-- GET /data ---------|
     |                          |--- dashboardData ----->|
```

> **Importante**: el snapshot se guarda en memoria. Si el servidor se reinicia, los datos se pierden y el Admin debe volver a subir los archivos.

---

## API

### `POST /snapshot`

Guarda el snapshot procesado en memoria.

**Body**: objeto JSON con el `dashboardData` completo (debe contener la propiedad `kpis`).

**Respuesta exitosa** `200`:
```json
{
  "status": "ok",
  "lastUpdate": "2024-01-15T14:30:00.000Z"
}
```

**Error de validación** `400`:
```json
{
  "error": "Payload inválido. Se esperaba el JSON procesado del dashboard."
}
```

**Límite de payload**: 50mb.

---

### `GET /status`

Verifica si hay un snapshot disponible en memoria.

**Respuesta** `200`:
```json
{
  "hasData": true,
  "lastUpdate": "2024-01-15T14:30:00.000Z"
}
```

Cuando no hay datos: `hasData: false` y `lastUpdate: null`.

---

### `GET /data`

Devuelve el snapshot completo guardado en memoria.

**Respuesta exitosa** `200`: el objeto `dashboardData` completo.

**Sin datos** `404`:
```json
{
  "error": "No hay datos cargados. Realizá un POST /upload primero."
}
```

---

### `DELETE /data`

Elimina el snapshot de memoria.

**Respuesta** `200`:
```json
{
  "status": "ok",
  "message": "Snapshot eliminado"
}
```

---

## Estructura del proyecto

```
server/
  server.js              — Entry point, configuración de Express y middlewares
  routes/
    upload.js            — Ruta POST /snapshot
    data.js              — Rutas GET /data, GET /status, DELETE /data
  controllers/
    uploadController.js  — Lógica de guardado del snapshot
    dataController.js    — Lógica de lectura y eliminación del snapshot
  store/
    snapshot.js          — Store in-memory (variables de módulo compartidas)
  middlewares/
    logger.js            — Logger de requests (método + path + timestamp)
```

---

## Store in-memory

El snapshot se guarda en variables de módulo en `store/snapshot.js`. Al ser CommonJS, el módulo se cachea y las variables son compartidas entre todos los requests mientras el proceso esté vivo.

```js
// Las 5 funciones exportadas
getSnapshot()   // Devuelve el snapshot actual o null
getLastUpdate() // Devuelve el ISO string del último guardado o null
hasData()       // Boolean — true si hay snapshot guardado
setSnapshot(data) // Guarda el snapshot y actualiza lastUpdate
clearSnapshot() // Limpia el snapshot y lastUpdate
```

Si se necesita persistencia entre reinicios, reemplazar `store/snapshot.js` con una implementación que use un archivo JSON o una base de datos (ej: Redis, SQLite).

---

## Deploy en Render

El servidor está deployado en [Render](https://render.com) como Web Service.

| Campo | Valor |
|---|---|
| Root Directory | `server` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| URL | `https://monitor-c0bd.onrender.com` |

> El plan gratuito de Render suspende el servidor tras 15 minutos de inactividad. El primer request después de la suspensión puede tardar ~30 segundos en responder (cold start).

---

## Stack tecnológico

- **Node.js** — Runtime
- **Express 4** — Framework HTTP
- **cors** — Middleware CORS
