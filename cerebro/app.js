// Cerebro: captura rápida. Todo vive en este teléfono (localStorage, clave "cerebro").
const KEY = 'cerebro';
const DRAFT = 'cerebro-borrador';
const OLD_LIMIT = 15;
const $ = (s) => document.querySelector(s);

let items = [];
let query = '';
let showAllOld = false;
let editing = null;
let toastTimer = 0;

// ---------- Almacenamiento ----------
function read(key) { try { return localStorage.getItem(key); } catch { return null; } }
function write(key, value) { try { localStorage.setItem(key, value); return true; } catch { return false; } }

function clean(x) {
  if (!x || typeof x.id !== 'string' || typeof x.text !== 'string' || !x.text.trim()) return null;
  const now = Date.now();
  const kind = x.kind === 'pendiente' ? 'pendiente' : 'nota';
  return {
    id: x.id, text: x.text, kind,
    done: kind === 'pendiente' && x.done === true,
    doneAt: typeof x.doneAt === 'number' ? x.doneAt : undefined,
    createdAt: typeof x.createdAt === 'number' ? x.createdAt : now,
    updatedAt: typeof x.updatedAt === 'number' ? x.updatedAt : now,
  };
}

function load() {
  try {
    const d = JSON.parse(read(KEY));
    items = (Array.isArray(d && d.items) ? d.items : []).map(clean).filter(Boolean);
  } catch { items = []; }
}

function save() {
  if (!write(KEY, JSON.stringify({ items }))) toast('No se pudo guardar: el almacenamiento está lleno o bloqueado.');
}

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

// ---------- Fechas ----------
const pad = (n) => String(n).padStart(2, '0');
const dayKey = (ts) => { const d = new Date(ts); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const daysAgo = (ts) => Math.round((new Date(dayKey(Date.now())) - new Date(dayKey(ts))) / 86400000);

function when(it) {
  const n = daysAgo(it.createdAt);
  if (n === 0) return new Date(it.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  if (n === 1) return 'Ayer';
  return new Date(it.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

function headerDate() {
  const s = new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
  $('#fecha').textContent = s.charAt(0).toUpperCase() + s.slice(1);
}

// ---------- Texto: enlaces y etiquetas ----------
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function tokens(text) {
  const out = [];
  const re = /(https?:\/\/[^\s]+)|(#[\p{L}][\p{L}\p{N}_-]*)/gu;
  let last = 0;
  let m;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ t: 'text', v: text.slice(last, m.index) });
    if (m[1]) {
      const url = m[1].replace(/[.,;:!?)\]]+$/, '');
      out.push({ t: 'url', v: url });
      if (url.length < m[1].length) out.push({ t: 'text', v: m[1].slice(url.length) });
    } else out.push({ t: 'tag', v: m[2] });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ t: 'text', v: text.slice(last) });
  return out;
}

function textNodes(text) {
  const frag = document.createDocumentFragment();
  for (const tk of tokens(text)) {
    if (tk.t === 'url') {
      const a = document.createElement('a');
      a.href = tk.v; a.target = '_blank'; a.rel = 'noopener noreferrer';
      const label = tk.v.replace(/^https?:\/\/(www\.)?/, '');
      a.textContent = label.length > 38 ? label.slice(0, 37) + '…' : label;
      a.addEventListener('click', (e) => e.stopPropagation());
      frag.append(a);
    } else if (tk.t === 'tag') {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'tag'; b.textContent = tk.v;
      b.addEventListener('click', (e) => { e.stopPropagation(); setQuery(tk.v); });
      frag.append(b);
    } else frag.append(tk.v);
  }
  return frag;
}

// ---------- Vista ----------
const byNew = (a, b) => b.createdAt - a.createdAt;

function itemEl(it) {
  const li = document.createElement('li');
  li.className = 'item' + (it.done ? ' done' : '');
  li.tabIndex = 0;
  if (it.kind === 'pendiente') {
    const c = document.createElement('button');
    c.type = 'button'; c.className = 'check';
    c.setAttribute('aria-label', it.done ? 'Volver a pendiente' : 'Marcar como hecho');
    c.setAttribute('aria-pressed', String(it.done));
    c.addEventListener('click', (e) => { e.stopPropagation(); toggleDone(it.id); });
    li.append(c);
  }
  const body = document.createElement('div');
  body.className = 'body';
  const text = document.createElement('div');
  text.className = 'text';
  text.append(textNodes(it.text));
  const meta = document.createElement('div');
  meta.className = 'meta';
  const age = daysAgo(it.createdAt);
  if (it.kind === 'pendiente' && !it.done && age >= 3) {
    const v = document.createElement('span');
    v.className = 'viejo'; v.textContent = `hace ${age} días`;
    meta.append(v);
  } else meta.textContent = when(it);
  body.append(text, meta);
  li.append(body);
  li.addEventListener('click', () => openEdit(it.id));
  li.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target === li) openEdit(it.id); });
  return li;
}

function listEl(arr) {
  const ul = document.createElement('ul');
  ul.className = 'list';
  ul.append(...arr.map(itemEl));
  return ul;
}

function secTitle(title, n) {
  const h = document.createElement('h2');
  h.className = 'sec';
  h.append(title);
  if (n != null) { const s = document.createElement('span'); s.className = 'n'; s.textContent = n; h.append(s); }
  return h;
}

function note(html, cls = 'vacio') {
  const p = document.createElement('p');
  p.className = cls;
  p.innerHTML = html;
  return p;
}

function renderTags() {
  const counts = new Map();
  for (const it of items) for (const tk of tokens(it.text)) if (tk.t === 'tag') {
    const k = tk.v.toLowerCase();
    counts.set(k, (counts.get(k) || 0) + 1);
  }
  const box = $('#tags');
  box.replaceChildren();
  const top = [...counts].sort((a, b) => b[1] - a[1]).slice(0, 12);
  box.hidden = !top.length;
  for (const [tag] of top) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'tag'; b.textContent = tag;
    b.setAttribute('aria-pressed', String(norm(query.trim()) === norm(tag)));
    b.addEventListener('click', () => setQuery(norm(query.trim()) === norm(tag) ? '' : tag));
    box.append(b);
  }
}

function render() {
  renderTags();
  const view = $('#vista');
  view.replaceChildren();
  const q = norm(query.trim());

  if (q) {
    const words = q.split(/\s+/);
    const found = items.filter((it) => { const t = norm(it.text); return words.every((w) => t.includes(w)); }).sort(byNew);
    if (!found.length) {
      const p = note('');
      p.textContent = `Nada con «${query.trim()}».`;
      view.append(p);
    }
    else view.append(secTitle(found.length === 1 ? '1 resultado' : `${found.length} resultados`), listEl(found));
    return;
  }

  if (!items.length) {
    view.append(note('<strong>Aquí cae todo.</strong>Escribe arriba lo primero que tengas en la cabeza.', 'vacio centro'));
    return;
  }

  const today = dayKey(Date.now());
  const open = items.filter((i) => i.kind === 'pendiente' && !i.done).sort(byNew);
  const done = items.filter((i) => i.kind === 'pendiente' && i.done).sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0));
  const notes = items.filter((i) => i.kind !== 'pendiente').sort(byNew);
  const todayNotes = notes.filter((i) => dayKey(i.createdAt) === today);
  const older = notes.filter((i) => dayKey(i.createdAt) !== today);

  if (open.length) view.append(secTitle('Pendientes', open.length), listEl(open));

  view.append(secTitle('Hoy', todayNotes.length || null));
  view.append(todayNotes.length ? listEl(todayNotes) : note('Nada anotado hoy todavía.'));

  if (older.length) {
    const shown = showAllOld ? older : older.slice(0, OLD_LIMIT);
    view.append(secTitle('Antes', older.length), listEl(shown));
    if (older.length > shown.length) {
      const more = document.createElement('button');
      more.type = 'button'; more.className = 'mas';
      more.textContent = `Ver todo (${older.length})`;
      more.addEventListener('click', () => { showAllOld = true; render(); });
      view.append(more);
    }
  }

  if (done.length) {
    const d = document.createElement('details');
    d.className = 'hechos';
    const s = document.createElement('summary');
    s.textContent = `Hechos (${done.length})`;
    d.append(s, listEl(done.slice(0, 30)));
    view.append(d);
  }
}

function setQuery(q) {
  query = q;
  $('#buscar').value = q;
  render();
}

// ---------- Acciones ----------
function toggleDone(id) {
  const it = items.find((i) => i.id === id);
  if (!it) return;
  it.done = !it.done;
  it.doneAt = it.done ? Date.now() : undefined;
  it.updatedAt = Date.now();
  save(); render();
}

function toast(msg, action) {
  const el = $('#toast');
  el.replaceChildren(msg);
  if (action) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = action.label;
    b.addEventListener('click', () => { el.hidden = true; action.run(); });
    el.append(b);
  }
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, action ? 6000 : 2200);
}

function remove(id) {
  const idx = items.findIndex((i) => i.id === id);
  if (idx < 0) return;
  const [gone] = items.splice(idx, 1);
  save(); render();
  toast('Eliminado', { label: 'Deshacer', run: () => { items.splice(idx, 0, gone); save(); render(); } });
}

// ---------- Captura ----------
const ta = $('#texto');
function grow(el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; }

ta.addEventListener('input', () => { grow(ta); write(DRAFT, ta.value); });
ta.addEventListener('keydown', (e) => {
  const desktop = matchMedia('(pointer: fine)').matches;
  if (e.key === 'Enter' && !e.isComposing && ((desktop && !e.shiftKey) || e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    $('#capture').requestSubmit();
  }
});

$('#capture').addEventListener('submit', (e) => {
  e.preventDefault();
  const text = ta.value.trim();
  if (!text) { ta.focus(); return; }
  const now = Date.now();
  items.unshift({ id: uid(), text, kind: $('#pend').checked ? 'pendiente' : 'nota', done: false, createdAt: now, updatedAt: now });
  save();
  ta.value = ''; grow(ta); write(DRAFT, '');
  $('#pend').checked = false;
  query = ''; $('#buscar').value = '';
  render();
  toast('Guardado');
  ta.focus();
});

$('#buscar').addEventListener('input', (e) => { query = e.target.value; render(); });

// ---------- Editar ----------
const dlg = $('#editar');
function openEdit(id) {
  const it = items.find((i) => i.id === id);
  if (!it) return;
  editing = it;
  $('#editTexto').value = it.text;
  $('#editPend').checked = it.kind === 'pendiente';
  dlg.showModal();
  $('#editTexto').focus();
}

$('#editForm').addEventListener('submit', () => {
  const text = $('#editTexto').value.trim();
  if (!editing || !text) return;
  const kind = $('#editPend').checked ? 'pendiente' : 'nota';
  if (kind !== editing.kind) { editing.done = false; editing.doneAt = undefined; }
  Object.assign(editing, { text, kind, updatedAt: Date.now() });
  save(); render();
});
$('#editCancelar').addEventListener('click', () => dlg.close());
$('#editBorrar').addEventListener('click', () => { const id = editing && editing.id; dlg.close(); if (id) remove(id); });
dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });

// ---------- Copia ----------
const menu = $('#menu');
$('#menuBtn').addEventListener('click', () => {
  const p = items.filter((i) => i.kind === 'pendiente' && !i.done).length;
  $('#stats').textContent = `${items.length} anotaciones · ${p} pendientes`;
  menu.showModal();
});
$('#menuCerrar').addEventListener('click', () => menu.close());
menu.addEventListener('click', (e) => { if (e.target === menu) menu.close(); });

$('#exportar').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ app: 'cerebro', exportedAt: Date.now(), items }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `cerebro-${dayKey(Date.now())}.json`;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  menu.close();
  toast('Copia descargada');
});

$('#importar').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  try {
    const d = JSON.parse(await file.text());
    const incoming = (Array.isArray(d) ? d : d && d.items) || [];
    let added = 0, same = 0;
    for (const raw of incoming) {
      const x = clean(raw);
      if (!x) continue;
      const cur = items.find((i) => i.id === x.id);
      if (!cur) { items.push(x); added++; }
      else { same++; if (x.updatedAt > cur.updatedAt) Object.assign(cur, x); }
    }
    save(); render(); menu.close();
    toast(`Importadas ${added}${same ? ` · ya estaban ${same}` : ''}`);
  } catch { toast('Ese archivo no es una copia de Cerebro.'); }
});

// ---------- Inicio ----------
load();
headerDate();
ta.value = read(DRAFT) || '';
grow(ta);
render();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
