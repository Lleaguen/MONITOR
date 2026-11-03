/**
 * tms-downloader.js
 * 1. Descarga CSV del TMS y Excel de EasyDocking via Playwright
 * 2. Procesa los datos localmente con los mismos processors del servidor
 * 3. Manda solo el snapshot calculado al endpoint /push-snapshot
 *    (payload pequeño, sin CSV crudo)
 */

const { chromium } = require('playwright');
const https = require('https');
const http = require('http');
const fs = require('fs');
const Papa = require('papaparse');
const { processCombinedData } = require('../server/processors/dataProcessor');

// ── Logger ────────────────────────────────────────────────────────────────────
const logFile = 'C:\\Users\\FNRomero\\Desktop\\tms-downloader.log';
function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  try { fs.appendFileSync(logFile, line + '\n', 'utf8'); } catch (_) {}
}

// ── Configuración ─────────────────────────────────────────────────────────────
const CONFIG = {
  usuario: 'ext_fanromer',
  password: 'Linkshell$a99',
  edUsuario: 'rodriguezarian001@gmail.com',
  edPassword: '123456',
  serverUrl: 'https://monitor-c0bd.onrender.com/push-snapshot',
  site: 'CIU',
  objetivoHU: 75,
  productividadHU: 180,
  horaInicioHU: 10,
  horaInicioBipeos: 9,
  horaInicioArribos: 9,
};

// ── Helpers de fecha ──────────────────────────────────────────────────────────
function getFechaHoy() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// ── POST snapshot al servidor ─────────────────────────────────────────────────
function postSnapshot(snapshot) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ site: CONFIG.site, data: snapshot });
    const url = new URL(CONFIG.serverUrl);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
      timeout: 60000,
    };
    const lib = url.protocol === 'https:' ? https : http;
    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        log(`[server] status=${res.statusCode} response=${data.slice(0, 200)}`);
        resolve({ status: res.statusCode, data });
      });
    });
    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Timeout POST snapshot')));
    req.write(body);
    req.end();
  });
}

// ── Wake up Render ────────────────────────────────────────────────────────────
function wakeUpServer() {
  return new Promise((resolve) => {
    const url = new URL(CONFIG.serverUrl);
    const req = https.request({
      hostname: url.hostname,
      port: 443,
      path: '/',
      method: 'GET',
      timeout: 60000,
    }, () => resolve());
    req.on('error', () => resolve());
    req.on('timeout', () => { req.destroy(); resolve(); });
    req.end();
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  const fecha = getFechaHoy();
  log(`===== INICIO fecha=${fecha} =====`);

  const browser = await chromium.launch({
    headless: false,
    args: ['--headless=new', '--disable-blink-features=AutomationControlled'],
  });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36',
    extraHTTPHeaders: {
      'sec-ch-ua': '"Not:A-Brand";v="8", "Chromium";v="156", "Google Chrome";v="156"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
    }
  });
  const page = await context.newPage();

  try {
    // 1. Login TMS
    log('Navegando al TMS...');
    await page.goto('https://tms.adminml.com/', { waitUntil: 'networkidle', timeout: 30000 });

    const currentUrl = page.url();
    log(`URL actual: ${currentUrl}`);

    if (currentUrl.includes('okta') || currentUrl.includes('login') || currentUrl.includes('auth-meli')) {
      log('Login requerido...');
      await page.locator('input[name="identifier"]').waitFor({ timeout: 15000 });
      await page.locator('input[name="identifier"]').fill(CONFIG.usuario);
      await page.locator('input[type="submit"], button[type="submit"]').first().click();
      await page.locator('input[name="credentials.passcode"]').waitFor({ timeout: 15000 });
      await page.locator('input[name="credentials.passcode"]').fill(CONFIG.password);
      await page.locator('input[type="submit"], button[type="submit"]').first().click();
      await page.waitForURL('**/tms.adminml.com/**', { timeout: 30000 });
      log('Login TMS exitoso');
    } else {
      log('Sesión TMS activa');
    }

    // 2. Descargar CSV
    log('Descargando CSV...');
    const csvUrl = `https://tms.adminml.com/api/fos/shipment/report/export?inbound_included_at_date_start=${fecha}T00:00:00Z&inbound_included_at_date_end=${fecha}T23:59:59Z`;
    const csvText = await page.evaluate(async (url) => {
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error(`CSV fetch failed: ${res.status}`);
      return await res.text();
    }, csvUrl);
    log(`CSV descargado: ${csvText.length} caracteres`);

    // 3. Descargar Excel ED
    let excelBuffer = null;
    try {
      log('Navegando a EasyDocking...');
      await page.goto('https://server4.easydocking.ar/meliciudad/root/locations/reports', {
        waitUntil: 'networkidle', timeout: 30000,
      });

      const edLoginVisible = await page.locator('input[type="password"]').isVisible().catch(() => false);
      if (edLoginVisible) {
        log('Login ED requerido...');
        await page.locator('input[name="user"], input[type="text"]').first().fill(CONFIG.edUsuario);
        await page.locator('input[type="password"]').first().fill(CONFIG.edPassword);
        await page.locator('input[type="submit"], button[type="submit"]').first().click();
        await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
        log('Login ED exitoso');
      } else {
        log('Sesión ED activa');
      }

      log('Descargando Excel ED...');
      const edUrl = `https://server4.easydocking.ar/meliciudad/root/locations/excel/${fecha}/${fecha}/xls`;
      const edCookies = await context.cookies('https://server4.easydocking.ar');
      const cookieStr = edCookies.map(c => `${c.name}=${c.value}`).join('; ');

      excelBuffer = await new Promise((resolve, reject) => {
        const url = new URL(edUrl);
        const chunks = [];
        const req = https.request({
          hostname: url.hostname,
          path: url.pathname,
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36',
            'Cookie': cookieStr,
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'none',
          },
          timeout: 30000,
        }, (res) => {
          if (res.statusCode !== 200) { reject(new Error(`ED respondió ${res.statusCode}`)); return; }
          res.on('data', chunk => chunks.push(chunk));
          res.on('end', () => resolve(Buffer.concat(chunks)));
        });
        req.on('error', reject);
        req.on('timeout', () => reject(new Error('Timeout ED')));
        req.end();
      });
      log(`Excel descargado: ${excelBuffer.length} bytes`);
    } catch (e) {
      log(`Excel ED no disponible: ${e.message}`);
    }

    // 4. Procesar datos localmente
    log('Procesando datos localmente...');
    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    log(`CSV parseado: ${parsed.data.length} filas`);

    const dashboardData = processCombinedData(
      parsed.data,
      excelBuffer,
      239000,           // proyectado default — el servidor lo preserva del snapshot anterior
      CONFIG.objetivoHU,
      CONFIG.productividadHU,
      {
        horaInicioArribos: CONFIG.horaInicioArribos,
        horaInicioBipeos: CONFIG.horaInicioBipeos,
        horaInicioHU: CONFIG.horaInicioHU,
        zonaCPTOverrides: {},
        site: CONFIG.site,
      }
    );
    log(`Snapshot calculado — bipeado: ${dashboardData.kpis?.bipeado}, avance HU: ${dashboardData.totalesHU?.avance}%`);

    // 5. Wake up y POST del snapshot
    log('Despertando servidor...');
    await wakeUpServer();
    log('Esperando 15s...');
    await new Promise(r => setTimeout(r, 15000));

    log('Enviando snapshot al servidor...');
    const result = await postSnapshot(dashboardData);
    log(`Resultado: status=${result.status}`);
    log('===== FIN OK =====');

  } catch (err) {
    log(`ERROR: ${err.message}`);
    log('===== FIN CON ERROR =====');
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
