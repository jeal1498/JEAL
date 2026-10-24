/* Sincronización manual de Finanzas con una hoja de Google (vía Apps Script propio).
   No tiene que ver con el respaldo de SecondBrain: usa su propia configuración, su propio script y
   sus propias pestañas («Finanzas · Pagos», «Finanzas · Metas» y la oculta «_finanzas»). Sin DOM. */
const KEY = 'finanzas_sync';

export function getCfg() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
}
export function setCfg(patch) {
  const cfg = { ...getCfg(), ...patch };
  try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch (e) { /* sin almacenamiento */ }
  return cfg;
}
export function clearCfg() {
  try { localStorage.removeItem(KEY); } catch (e) { /* nada */ }
}

export const newToken = () => Array.from(crypto.getRandomValues(new Uint8Array(18)), b => b.toString(16).padStart(2, '0')).join('');

/* Acepta el enlace completo de la hoja o solo su identificador. */
export function sheetId(text) {
  const t = String(text || '').trim();
  const m = /\/d\/([a-zA-Z0-9_-]{20,})/.exec(t);
  if (m) return m[1];
  return /^[a-zA-Z0-9_-]{20,}$/.test(t) ? t : '';
}

const abonosTxt = v => (v || []).map(p => `${p.fecha || 'sin fecha'}: ${p.monto}`).join(' · ');
/* Un texto que empieza con "=" Google lo tomaría como fórmula. */
const cell = v => (v == null ? '' : typeof v === 'string' && /^[=+@-]/.test(v) ? "'" + v : v);

function table(name, headers, items, cols) {
  return {
    name,
    headers,
    rows: [...items].sort((a, b) => String(a.fecha).localeCompare(String(b.fecha))).map(x => cols.map(([k, f]) => cell(f ? f(x[k]) : x[k])))
  };
}

export function tables(movimientos, metas) {
  return [
    table('Finanzas · Pagos', ['Fecha límite', 'Concepto', 'Importe', 'Abonado', 'Categoría', 'Abonos'], movimientos,
      [['fecha'], ['conc'], ['imp'], ['abo'], ['cat'], ['pagos', abonosTxt]]),
    table('Finanzas · Metas', ['Para cuándo', 'Concepto', 'Monto', 'Ahorrado', 'Categoría', 'Abonos'], metas,
      [['fecha'], ['conc'], ['imp'], ['abo'], ['cat'], ['pagos', abonosTxt]])
  ];
}

const NET_HELP = 'Google no respondió. Revisa que "Quién tiene acceso" sea "Cualquier persona", que la URL termine en /exec y que hayas implementado la última versión del código.';
async function call(url, opts) {
  let res;
  try { res = await fetch(url, opts); } catch (e) { throw new Error(navigator.onLine === false ? 'Sin conexión a internet' : NET_HELP); }
  try { return await res.json(); } catch (e) { throw new Error(NET_HELP); }
}

const withToken = (cfg, extra) => `${cfg.url}?token=${encodeURIComponent(cfg.token)}${extra || ''}`;

/* Comprueba que la URL y la clave responden. */
export async function ping(cfg) {
  const out = await call(withToken(cfg, '&ping=1'));
  if (!out.ok) throw new Error(out.error || 'Error en la hoja');
  return true;
}

/* Envía los pagos y metas a la hoja. Body como text/plain para que el navegador no haga preflight. */
export async function push(movimientos, metas) {
  const cfg = getCfg();
  if (!cfg.url) throw new Error('Aún no conectas una hoja');
  const raw = JSON.stringify({ app: 'secondbrain', movimientos, metas });
  const out = await call(cfg.url, { method: 'POST', body: JSON.stringify({ token: cfg.token, tables: tables(movimientos, metas), raw }) });
  if (!out.ok) throw new Error(out.error || 'Error en la hoja');
  setCfg({ last: Date.now(), error: '' });
}

/* Trae de la hoja la última copia enviada: { movimientos, metas }. */
export async function pull() {
  const cfg = getCfg();
  if (!cfg.url) throw new Error('Aún no conectas una hoja');
  const out = await call(withToken(cfg));
  if (!out.ok) throw new Error(out.error || 'Error en la hoja');
  return out.data;
}

export function scriptFor(id, token) {
  return `// Finanzas · sincronización con Google Sheets
const TOKEN = '${token}';
const SHEET_ID = '${id}';

function doPost(e) {
  const req = JSON.parse(e.postData.contents);
  if (req.token !== TOKEN) return out({ ok: false, error: 'Clave incorrecta' });
  const ss = SpreadsheetApp.openById(SHEET_ID);
  req.tables.forEach(function (t) {
    const sh = ss.getSheetByName(t.name) || ss.insertSheet(t.name);
    sh.clearContents();
    const rows = [t.headers].concat(t.rows);
    sh.getRange(1, 1, rows.length, t.headers.length).setValues(rows);
    sh.getRange(1, 1, 1, t.headers.length).setFontWeight('bold');
    sh.setFrozenRows(1);
  });
  // Copia exacta para traerla de vuelta (en trozos: una celda admite 50 mil caracteres).
  const raw = ss.getSheetByName('_finanzas') || ss.insertSheet('_finanzas');
  raw.clearContents();
  const parts = [];
  for (let i = 0; i < req.raw.length; i += 40000) parts.push([req.raw.slice(i, i + 40000)]);
  const range = raw.getRange(1, 1, parts.length, 1);
  range.setNumberFormat('@');
  range.setValues(parts);
  raw.hideSheet();
  return out({ ok: true });
}

function doGet(e) {
  if (e.parameter.token !== TOKEN) return out({ ok: false, error: 'Clave incorrecta' });
  if (e.parameter.ping) return out({ ok: true });
  const raw = SpreadsheetApp.openById(SHEET_ID).getSheetByName('_finanzas');
  if (!raw || raw.getLastRow() === 0) return out({ ok: false, error: 'Aún no hay copia en la hoja' });
  const text = raw.getRange(1, 1, raw.getLastRow(), 1).getValues().map(function (r) { return r[0]; }).join('');
  return out({ ok: true, data: JSON.parse(text) });
}

function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
`;
}
