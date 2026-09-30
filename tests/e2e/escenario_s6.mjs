// Escenario integral S6 — Sistema de Trazabilidad por QR (Helaspi)
// Recorre el flujo principal en el navegador (frontend -> API -> BD -> interfaz),
// guarda una captura por paso en tests/e2e/evidencias/ y un informe en informe_s6.md.
//
// Requisitos: backend corriendo (puerto 3000). El frontend lo levanta el propio script
// (Vite en 127.0.0.1:5199) salvo que se indique FRONT_URL.
// Uso:  cd tests\e2e   ->   npm install   ->   npm run s6
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

let FRONT = process.env.FRONT_URL;
const API = process.env.API_URL || 'http://localhost:3000/api';
const ADMIN = { email: process.env.ADMIN_EMAIL || 'admin@helaspi.com', password: process.env.ADMIN_PASSWORD || 'helaspi2026' };

const DIR = dirname(fileURLToPath(import.meta.url));
const FRONTEND_DIR = join(DIR, '..', '..', 'frontend');
const EVID = join(DIR, 'evidencias');
mkdirSync(EVID, { recursive: true });

const sufijo = Date.now().toString().slice(-6);
const hoy = new Date().toISOString().slice(0, 10);
const resultados = [];

async function api(method, path, token, body) {
  const r = await fetch(API + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: r.status, data: await r.json().catch(() => ({})) };
}

async function abrirNavegador() {
  // Usa el Edge o Chrome ya instalado en Windows; si no hay, el Chromium de Playwright
  for (const channel of ['chrome', 'msedge', undefined]) {
    try { return await chromium.launch({ channel, args: ['--no-proxy-server'], headless: process.env.HEADLESS !== '0' }); } catch { /* probar siguiente */ }
  }
  throw new Error('No se encontró navegador. Ejecutá: npx playwright install chromium');
}

async function paso(n, titulo, esperado, fn) {
  let ok = false, detalle = '';
  try { detalle = (await fn()) || ''; ok = true; } catch (e) {
    const texto = ((await page.locator('body').innerText().catch(() => '')) || '(vacía)').replace(/\s+/g, ' ').slice(0, 120);
    detalle = `${e.message.split('\n')[0]} | URL: ${page.url()} | Pantalla: ${texto}`;
  }
  const archivo = `paso${n}.png`;
  await page.screenshot({ path: join(EVID, archivo), fullPage: true }).catch(() => {});
  resultados.push({ n, titulo, esperado, ok, detalle, archivo });
  console.log(`${ok ? 'OK   ' : 'FALLA'} Paso ${n}: ${titulo}${detalle ? ' — ' + detalle : ''}`);
}

async function login({ email, password }) {
  await page.evaluate(() => localStorage.clear()).catch(() => {});
  await page.goto(`${FRONT}/login`);
  await page.locator('input[type=email]').fill(email);
  await page.locator('input[type=password]').fill(password);
  await page.getByRole('button', { name: /ingresar/i }).click();
  await page.waitForURL(/trazabilidad/, { timeout: 10000 });
}

// ---------- Backend ----------
const adm = await api('POST', '/auth/login', null, ADMIN).catch(() => ({ status: 0, data: {} }));
if (adm.status !== 200) {
  console.error(adm.status === 0
    ? `El backend no responde en ${API}. Abrí otra ventana:  cd backend  ->  npm run dev`
    : `Login de ${ADMIN.email} rechazado (HTTP ${adm.status}). Si tu clave no es helaspi2026:  $env:ADMIN_PASSWORD="tu_clave"`);
  process.exit(1);
}
console.log(`Backend OK (${API})`);

// ---------- Frontend: el script levanta su propio Vite para no depender de puertos/IPv6 ----------
let vite = null;
if (!FRONT) {
  const viteEntry = pathToFileURL(join(FRONTEND_DIR, 'node_modules', 'vite', 'dist', 'node', 'index.js')).href;
  const { createServer } = await import(viteEntry).catch(() => {
    console.error('No encuentro Vite en frontend/node_modules. Ejecutá:  cd ..\\..\\frontend  ->  npm install');
    process.exit(1);
  });
  vite = await createServer({ root: FRONTEND_DIR, configFile: join(FRONTEND_DIR, 'vite.config.js'), logLevel: 'error',
    server: { host: '127.0.0.1', port: 5199, strictPort: false } });
  await vite.listen();
  FRONT = `http://127.0.0.1:${vite.config.server.port}`;
  const addr = vite.httpServer.address();
  if (addr && addr.port) FRONT = `http://127.0.0.1:${addr.port}`;
}
for (const f of ['/', '/src/main.jsx', '/src/App.jsx']) {
  const r = await fetch(FRONT + f).catch(() => ({ status: 0 }));
  if (r.status !== 200) { console.error(`Frontend: ${FRONT}${f} respondió ${r.status}. Revisá la carpeta frontend.`); if (vite) await vite.close(); process.exit(1); }
}
console.log(`Frontend OK (${FRONT})`);

// ---------- Preparación por API: usuarios de prueba y un proveedor ----------
const tokenAdm = adm.data.token;
const CAL = { email: `cal_s6_${sufijo}@helaspi.com`, password: 'Test1234' };
const LOG = { email: `log_s6_${sufijo}@helaspi.com`, password: 'Test1234' };
await api('POST', '/usuarios', tokenAdm, { nombre: 'Calidad S6', ...CAL, rol: 'calidad' });
await api('POST', '/usuarios', tokenAdm, { nombre: 'Logística S6', ...LOG, rol: 'logistica' });
const nombreProv = `Lácteos Varillas S6-${sufijo}`;
await api('POST', '/proveedores', tokenAdm, { nombre: nombreProv, contacto: 'Ana Pérez', telefono: '3533-400100' });

const browser = await abrirNavegador();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.setDefaultTimeout(15000);
page.on('pageerror', (e) => console.log('   [error JS]', e.message.slice(0, 200)));
page.on('response', (r) => { if (r.status() >= 400 && !r.url().includes('/api/')) console.log('   [recurso ' + r.status() + ']', r.url()); });
let idMp, idLote, codigoQr;
const nombreMp = `Leche entera S6-${sufijo}`;
const codigoLote = `L-S6-${sufijo}`;

await paso(1, 'Login de Supervisión', 'Navbar con nombre y rol (supervision)', async () => {
  await login(ADMIN);
  await page.getByText('(supervision)').waitFor();
});

await paso(2, 'Calidad registra materia prima con QR', 'Mensaje verde con ID y código QR', async () => {
  await login(CAL);
  await page.goto(`${FRONT}/materia-prima/nueva`);
  await page.locator('form input').first().fill(nombreMp);
  await page.locator('input[type=date]').fill(hoy);
  await page.locator('select').selectOption({ label: nombreProv });
  await page.getByRole('button', { name: /registrar/i }).click();
  const msg = await page.getByText(/Materia prima registrada/).textContent({ timeout: 10000 });
  idMp = msg.match(/ID: (\d+)/)[1];
  codigoQr = msg.match(/QR: (\S+)/)[1];
  return `MP id ${idMp}, QR ${codigoQr}`;
});

await paso(3, 'Logística crea lote de producción', 'Mensaje verde con ID y código de lote', async () => {
  await login(LOG);
  await page.goto(`${FRONT}/lote/nuevo`);
  const inputs = page.locator('form input');
  await inputs.nth(0).fill(codigoLote);
  await inputs.nth(1).fill('Helado de dulce de leche');
  await page.locator('input[type=date]').fill(hoy);
  await page.locator('input[type=number]').fill('120');
  await inputs.nth(4).fill('kg');
  await page.getByRole('button', { name: /crear lote/i }).click();
  const msg = await page.getByText(/Lote creado/).textContent({ timeout: 10000 });
  idLote = msg.match(/ID: (\d+)/)[1];
  return `Lote id ${idLote}, código ${codigoLote}`;
});

await paso(4, 'Logística asocia la MP al lote', 'Mensaje verde de asociación correcta', async () => {
  await page.goto(`${FRONT}/lote/asociar`);
  await page.locator('select').nth(0).locator(`option[value="${idMp}"]`).waitFor({ state: 'attached' });
  await page.locator('select').nth(0).selectOption(String(idMp));
  await page.locator('select').nth(1).selectOption(String(idLote));
  await page.getByRole('button', { name: /asociar/i }).click();
  await page.getByText(/asociada al lote correctamente/).waitFor({ timeout: 10000 });
});

await paso(5, 'La MP utilizada no puede reasignarse (H2)', 'La MP ya no aparece en la lista y la API responde 409', async () => {
  await page.goto(`${FRONT}/lote/asociar`);
  await page.locator('select').nth(1).locator('option').nth(1).waitFor({ state: 'attached' });
  const enLista = await page.locator('select').nth(0).locator(`option[value="${idMp}"]`).count();
  if (enLista) throw new Error('La MP utilizada sigue apareciendo como disponible');
  const tokenLog = await page.evaluate(() => localStorage.getItem('token'));
  const r = await api('PUT', `/materia-prima/${idMp}/asociar-lote`, tokenLog, { id_lote_produccion: idLote });
  await page.evaluate((t) => {
    const p = document.createElement('p');
    p.style.cssText = 'background:#fff3cd;padding:8px;border:1px solid #c90';
    p.textContent = `[Verificación API] PUT /materia-prima/:id/asociar-lote sobre MP utilizada → HTTP ${t}`;
    document.querySelector('h2').after(p);
  }, `${r.status} — ${r.data.error || ''}`);
  if (r.status !== 409) throw new Error(`La API respondió ${r.status}, se esperaba 409`);
  return `API: HTTP 409 — ${r.data.error}`;
});

await paso(6, 'Trazabilidad hacia adelante (MP → lote)', `Muestra proveedor y el lote ${codigoLote}`, async () => {
  await page.goto(`${FRONT}/trazabilidad/adelante`);
  await page.locator('input[type=number]').fill(String(idMp));
  await page.getByRole('button', { name: /buscar/i }).click();
  await page.getByText(codigoLote).waitFor({ timeout: 10000 });
  await page.getByText(nombreProv).waitFor();
});

await paso(7, 'Trazabilidad hacia atrás (lote → MP → proveedor)', `Muestra ${nombreMp} y su proveedor`, async () => {
  await page.goto(`${FRONT}/trazabilidad/atras`);
  await page.locator('input[type=number]').fill(String(idLote));
  await page.getByRole('button', { name: /buscar/i }).click();
  await page.getByText(nombreMp).waitFor({ timeout: 10000 });
  await page.getByText(nombreProv).waitFor();
});

await paso(8, 'Logística intenta entrar a /usuarios (H1)', 'Pantalla "Acceso denegado"', async () => {
  await page.goto(`${FRONT}/usuarios`);
  await page.getByText('Acceso denegado').waitFor({ timeout: 10000 });
});

await browser.close();
if (vite) await vite.close();

// ---------- Informe ----------
const okCount = resultados.filter((r) => r.ok).length;
const fecha = new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });
const md = `# Escenario integral S6 — Evidencia automática

- Fecha de ejecución: ${fecha}
- Frontend: ${FRONT} · API: ${API}
- Resultado: **${okCount}/${resultados.length} pasos OK**
- Datos de la corrida: MP "${nombreMp}" (id ${idMp ?? '-'}, QR ${codigoQr ?? '-'}), lote ${codigoLote} (id ${idLote ?? '-'}), proveedor "${nombreProv}"

| Paso | Acción | Esperado | Resultado | Captura |
|---|---|---|---|---|
${resultados.map((r) => `| ${r.n} | ${r.titulo} | ${r.esperado} | ${r.ok ? '✅ OK' : '❌ FALLA'}${r.detalle ? ' — ' + r.detalle.replace(/\|/g, '/') : ''} | [${r.archivo}](evidencias/${r.archivo}) |`).join('\n')}
`;
writeFileSync(join(DIR, 'informe_s6.md'), md);
console.log(`\nResultado: ${okCount}/${resultados.length} pasos OK. Informe: tests/e2e/informe_s6.md — Capturas: tests/e2e/evidencias/`);
process.exit(okCount === resultados.length ? 0 : 1);
