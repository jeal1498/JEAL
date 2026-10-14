// Cartera: clientes privados del conductor (agenda, viajes, cobros y WhatsApp).
// Todo se guarda en este teléfono (localStorage). Sin build ni dependencias.

// ---------- Datos ----------
const KEY = 'cartera';
const DEFAULTS = { clients: [], trips: [], settings: { driver: '', lada: '52', perKm: '', bank: '' } };
let data = load();
function load() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY));
    if (d) return { ...DEFAULTS, ...d, settings: { ...DEFAULTS.settings, ...d.settings } };
  } catch {}
  return structuredClone(DEFAULTS);
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { toast('No se pudo guardar'); }
}
navigator.storage?.persist?.();

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const money = (n) => '$' + Math.round(+n || 0).toLocaleString('es-MX');
const today = () => new Date().toLocaleDateString('en-CA');
const addDays = (d, n) => { const x = new Date(d + 'T00:00'); x.setDate(x.getDate() + n); return x.toLocaleDateString('en-CA'); };
const daysBetween = (a, b) => Math.round((new Date(b + 'T00:00') - new Date(a + 'T00:00')) / 864e5);
const fdate = (d, o = { weekday: 'short', day: 'numeric', month: 'short' }) => new Date(d + 'T00:00').toLocaleDateString('es-MX', o);
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
function dayLabel(d) {
  const n = daysBetween(today(), d);
  return n === 0 ? 'hoy' : n === 1 ? 'mañana' : n === -1 ? 'ayer' : fdate(d, { weekday: 'long', day: 'numeric', month: 'short' });
}
const hour12 = (t) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;
};
const initials = (name) => name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
const firstName = (c) => (c?.name || '').trim().split(/\s+/)[0];

const client = (id) => data.clients.find((c) => c.id === id);
const tripsOf = (id) => data.trips.filter((t) => t.clientId === id);
const owed = (t) => t.status === 'hecho' && !t.pay;
const debtOf = (id) => tripsOf(id).filter(owed).reduce((s, t) => s + +t.price, 0);
const lastTrip = (id) => tripsOf(id).filter((t) => t.status === 'hecho').sort((a, b) => b.date.localeCompare(a.date))[0];
const byWhen = (a, b) => a.date.localeCompare(b.date) || (a.time || '99').localeCompare(b.time || '99');

// ---------- WhatsApp y llamadas ----------
function phoneIntl(p) {
  const d = String(p || '').replace(/\D/g, '');
  return d.length === 10 ? (data.settings.lada || '52') + d : d;
}
const waLink = (c, text) => `https://wa.me/${phoneIntl(c.phone)}?text=${encodeURIComponent(text)}`;
const sign = () => (data.settings.driver ? `\n— ${data.settings.driver}` : '');
const MSG = {
  confirm: (c, t) => `Hola ${firstName(c)}, te confirmo tu viaje ${dayLabel(t.date)}${t.time ? ' a las ' + hour12(t.time) : ''}${t.from || t.to ? `: ${t.from || '…'} → ${t.to || '…'}` : ''}. Costo ${money(t.price)}. ¡Gracias!${sign()}`,
  arrived: (c, t) => `Hola ${firstName(c)}, ya estoy afuera${t.from ? ' en ' + t.from : ''}. 🚗`,
  charge: (c, list) => `Hola ${firstName(c)}, te comparto lo pendiente:\n${list.map((t) => `• ${fdate(t.date, { day: 'numeric', month: 'short' })}${t.to ? ' · ' + (t.from ? t.from + ' → ' : '') + t.to : ''}: ${money(t.price)}`).join('\n')}\nTotal: ${money(list.reduce((s, t) => s + +t.price, 0))}.${data.settings.bank ? `\nTransferencia: ${data.settings.bank}` : ''}\n¡Gracias!${sign()}`,
  hello: (c) => `Hola ${firstName(c)}, ¿cómo estás? Te recuerdo que sigo a tus órdenes para tus viajes. Cuando lo necesites, escríbeme y lo agendamos.${sign()}`,
};

// ---------- Íconos ----------
const P = {
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  users: '<circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3-7 7-7s7 3 7 7"/><path d="M16 4a4 4 0 0 1 0 8M19 14c2 1 3 4 3 7"/>',
  wallet: '<path d="M20 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h15v13H5a2 2 0 0 1-2-2V5"/><path d="M16 13h.01"/>',
  chart: '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  back: '<path d="M15 18l-6-6 6-6"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  wa: '<path d="M3 21l1.6-4.7A8.5 8.5 0 1 1 7.7 19.4z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8c-1-.5-1.8-1.3-2.3-2.3l.8-1-1-2z"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  repeat: '<path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  pin: '<path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
  cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
  left: '<path d="M15 18l-6-6 6-6"/>',
  right: '<path d="M9 18l6-6-6-6"/>',
};
const icon = (n) => `<svg viewBox="0 0 24 24" class="i" aria-hidden="true">${P[n]}</svg>`;

// ---------- Estructura ----------
const view = $('#view');
const top = $('#top');
const tabs = $('#tabs');
const fab = $('#fab');
const sheet = $('#sheet');

function header(title, { back, action } = {}) {
  top.innerHTML = `${back ? `<a class="iconbtn" href="${back}" aria-label="Volver">${icon('back')}</a>` : `<span class="brand">${icon('users')}</span>`}
    <h1>${esc(title)}</h1>
    ${action ? `<a class="iconbtn" href="${action.href}" aria-label="${action.label}">${icon(action.icon)}</a>` : '<span></span>'}`;
}
function setTabs(on) {
  const n = new Set(data.trips.filter(owed).map((t) => t.clientId)).size;
  const tab = (h, ic, l, k, extra = '') => `<a href="${h}" class="${on === k ? 'on' : ''}" ${on === k ? 'aria-current="page"' : ''}>${icon(ic)}${l}${extra}</a>`;
  tabs.innerHTML = tab('#/', 'calendar', 'Agenda', 'agenda') + tab('#/clientes', 'users', 'Clientes', 'clientes')
    + tab('#/cobros', 'wallet', 'Cobros', 'cobros', n ? `<span class="dot">${n}</span>` : '') + tab('#/resumen', 'chart', 'Resumen', 'resumen');
}
function setFab(fn) {
  fab.hidden = !fn;
  fab.onclick = fn;
}
let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('on'), 1800);
}

function render() {
  const [, mod = '', id = ''] = (location.hash || '#/').slice(1).split('/');
  if (mod === 'nuevo') { history.replaceState(null, '', '#/'); render(); tripForm(); return; }
  window.scrollTo(0, 0);
  if (mod === 'clientes') renderClients();
  else if (mod === 'cliente' && client(id)) renderClient(id);
  else if (mod === 'cobros') renderCharges();
  else if (mod === 'resumen') renderSummary();
  else if (mod === 'ajustes') renderSettings();
  else renderAgenda();
}
window.addEventListener('hashchange', render);
function refresh() { save(); render(); }

// ---------- Tarjeta de viaje ----------
function tripCard(t, { showDate = false, showClient = true } = {}) {
  const c = client(t.clientId) || { name: 'Sin cliente' };
  const late = t.status === 'agendado' && t.date < today();
  const pay = t.status === 'cancelado' ? '<small class="muted">Cancelado</small>'
    : owed(t) ? '<small class="badge">Me debe</small>'
      : t.pay ? `<small class="badge ok">${cap(t.pay)}</small>` : '';
  let actions = '';
  if (t.status === 'agendado' && c.phone) {
    actions = `<a class="wa" href="${waLink(c, MSG.confirm(c, t))}" target="_blank" rel="noopener">${icon('wa')}Confirmar</a>
      ${t.date === today() ? `<a class="wa" href="${waLink(c, MSG.arrived(c, t))}" target="_blank" rel="noopener">${icon('pin')}Ya llegué</a>` : ''}`;
  }
  if (t.status === 'agendado') actions += `<button data-finish="${t.id}">${icon('check')}Terminar</button>`;
  if (owed(t)) actions += `<button data-paid="${t.id}">${icon('cash')}Cobrado</button>`;
  return `<article class="trip ${late ? 'late' : ''} ${t.status !== 'agendado' ? 'done' : ''}" data-trip="${t.id}" tabindex="0">
    <div class="when">${t.time ? hour12(t.time).replace(/ (am|pm)/, '') : '—'}<small>${showDate ? fdate(t.date, { day: 'numeric', month: 'short' }) : t.time ? hour12(t.time).slice(-2) : ''}</small></div>
    <div>${showClient ? `<div class="who">${esc(c.name)}</div>` : ''}
      <div class="route">${t.from || t.to ? `${esc(t.from || '…')} → ${esc(t.to || '…')}` : '<span class="muted">Sin ruta</span>'}</div>
      ${late ? '<span class="badge warn">¿Se hizo?</span>' : ''}</div>
    <div class="price">${money(t.price)}${pay}</div>
    ${actions ? `<div class="actions">${actions}</div>` : ''}
  </article>`;
}
function bindTrips() {
  view.querySelectorAll('[data-trip]').forEach((el) => {
    const open = () => tripForm(data.trips.find((t) => t.id === el.dataset.trip));
    el.onclick = (e) => { if (!e.target.closest('a,button')) open(); };
    el.onkeydown = (e) => { if (e.key === 'Enter' && e.target === el) open(); };
  });
  view.querySelectorAll('[data-finish]').forEach((b) => (b.onclick = () => finishForm(data.trips.find((t) => t.id === b.dataset.finish))));
  view.querySelectorAll('[data-paid]').forEach((b) => (b.onclick = () => payForm([data.trips.find((t) => t.id === b.dataset.paid)])));
}

// ---------- Agenda ----------
function renderAgenda() {
  header('Agenda', { action: { href: '#/ajustes', icon: 'gear', label: 'Ajustes' } });
  setTabs('agenda');
  const t = today();
  const active = data.trips.filter((x) => x.status !== 'cancelado');
  const todays = active.filter((x) => x.date === t).sort(byWhen);
  const month = t.slice(0, 7);
  const monthDone = active.filter((x) => x.status === 'hecho' && x.date.startsWith(month));
  const debt = data.trips.filter(owed).reduce((s, x) => s + +x.price, 0);
  setFab(data.clients.length ? () => tripForm() : () => clientForm());
  if (!data.clients.length) {
    view.innerHTML = `<div class="empty">${icon('users')}<h2>Tu cartera, en orden</h2>
      <p>Guarda a tus clientes privados, agenda sus viajes, confírmales por WhatsApp y lleva quién te debe.</p>
      <button class="primary" data-newclient>＋ Agregar mi primer cliente</button>
      ${data.settings.driver ? '' : '<a href="#/ajustes">Antes, pon tu nombre para los mensajes →</a>'}</div>`;
    $('[data-newclient]', view).onclick = () => clientForm();
    return;
  }
  const pending = active.filter((x) => x.status === 'agendado' && x.date < t).sort(byWhen);
  const upcoming = active.filter((x) => x.status === 'agendado' && x.date > t).sort(byWhen);
  const tomorrow = upcoming.filter((x) => x.date === addDays(t, 1));
  const week = upcoming.filter((x) => x.date > addDays(t, 1) && x.date <= addDays(t, 7));
  const later = upcoming.filter((x) => x.date > addDays(t, 7));
  const section = (title, list, opts) => (list.length ? `<p class="group"><span>${title}</span><em>${money(list.reduce((s, x) => s + +x.price, 0))}</em></p>${list.map((x) => tripCard(x, opts)).join('')}` : '');
  view.innerHTML = `
    <section class="tiles">
      <div class="tile"><small>Hoy</small><b>${todays.length}</b><span>${todays.length ? money(todays.reduce((s, x) => s + +x.price, 0)) : 'sin viajes'}</span></div>
      <a class="tile ${debt ? 'warn' : ''}" href="#/cobros"><small>Por cobrar</small><b>${money(debt)}</b><span>${debt ? 'ver quién' : 'todo al día'}</span></a>
      <a class="tile" href="#/resumen"><small>Este mes</small><b>${money(monthDone.reduce((s, x) => s + +x.price, 0))}</b><span>${monthDone.length} viaje${monthDone.length === 1 ? '' : 's'}</span></a>
    </section>
    ${section('Sin cerrar', pending, { showDate: true })}
    ${todays.length ? section('Hoy', todays) : `<div class="card muted">Hoy no tienes viajes agendados.</div>`}
    ${section('Mañana', tomorrow)}
    ${section('Esta semana', week, { showDate: true })}
    ${section('Más adelante', later, { showDate: true })}`;
  bindTrips();
}

// ---------- Clientes ----------
let clientQuery = '';
let clientFilter = '';
const fold = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
function renderClients() {
  header('Clientes', { action: { href: '#/ajustes', icon: 'gear', label: 'Ajustes' } });
  setTabs('clientes');
  setFab(() => clientForm());
  if (!data.clients.length) {
    view.innerHTML = `<div class="empty">${icon('users')}<h2>Sin clientes</h2><p>Agrega a las personas que te piden viajes por fuera.</p><button class="primary" data-newclient>＋ Nuevo cliente</button></div>`;
    $('[data-newclient]', view).onclick = () => clientForm();
    return;
  }
  view.innerHTML = `<input class="search" type="search" placeholder="Buscar por nombre, teléfono o lugar" value="${esc(clientQuery)}" aria-label="Buscar cliente">
    <div class="chips">${[['', 'Todos'], ['debe', 'Me deben'], ['dormidos', 'Sin viajar +30 días']].map(([k, l]) => `<button class="${k === clientFilter ? 'on' : ''}" data-cf="${k}">${l}</button>`).join('')}</div>
    <ul class="list" id="clist"></ul>`;
  const search = $('.search', view);
  search.oninput = () => { clientQuery = search.value; drawClientList(); };
  view.querySelectorAll('[data-cf]').forEach((b) => (b.onclick = () => { clientFilter = b.dataset.cf; renderClients(); }));
  drawClientList();
}
function sleeping(c) {
  const last = lastTrip(c.id);
  return daysBetween(last ? last.date : new Date(c.createdAt).toLocaleDateString('en-CA'), today()) > 30;
}
function drawClientList() {
  const q = fold(clientQuery).split(/\s+/).filter(Boolean);
  const list = data.clients
    .filter((c) => q.every((w) => fold([c.name, c.phone, c.places, c.notes].join(' ')).includes(w)))
    .filter((c) => (clientFilter === 'debe' ? debtOf(c.id) > 0 : clientFilter === 'dormidos' ? sleeping(c) : true))
    .map((c) => ({ c, last: lastTrip(c.id), n: tripsOf(c.id).filter((t) => t.status === 'hecho').length, debt: debtOf(c.id) }))
    .sort((a, b) => (b.last?.date || '').localeCompare(a.last?.date || '') || a.c.name.localeCompare(b.c.name, 'es'));
  $('#clist').innerHTML = list.length ? list.map(({ c, last, n, debt }) => `<li data-client="${c.id}" tabindex="0">
      <span class="avatar">${esc(initials(c.name))}</span>
      <span class="body"><b>${esc(c.name)}</b><small>${n ? `${n} viaje${n === 1 ? '' : 's'} · último ${last ? dayLabel(last.date) : ''}` : esc(c.phone || 'Sin viajes aún')}</small></span>
      ${debt ? `<span class="badge">Debe ${money(debt)}</span>` : ''}</li>`).join('')
    : '<li class="muted">Nadie coincide.</li>';
  view.querySelectorAll('[data-client]').forEach((li) => {
    const go = () => (location.hash = `#/cliente/${li.dataset.client}`);
    li.onclick = go;
    li.onkeydown = (e) => { if (e.key === 'Enter') go(); };
  });
}

function renderClient(id) {
  const c = client(id);
  header(c.name, { back: '#/clientes' });
  top.lastElementChild.outerHTML = `<button class="iconbtn" data-editc aria-label="Editar cliente">${icon('edit')}</button>`;
  $('[data-editc]', top).onclick = () => clientForm(c);
  setTabs('clientes');
  const trips = tripsOf(id).sort((a, b) => byWhen(b, a));
  const done = trips.filter((t) => t.status === 'hecho');
  const debt = debtOf(id);
  const last = done[0] || trips[0];
  setFab(() => tripForm(null, { clientId: id }));
  view.innerHTML = `
    <section class="hero"><span class="avatar">${esc(initials(c.name))}</span><h2>${esc(c.name)}</h2>
      ${c.phone ? `<span class="muted">${esc(c.phone)}</span>` : ''}</section>
    <nav class="quick">
      ${c.phone ? `<a class="wa" href="${waLink(c, `Hola ${firstName(c)}, `)}" target="_blank" rel="noopener">${icon('wa')}WhatsApp</a><a href="tel:+${phoneIntl(c.phone)}">${icon('phone')}Llamar</a>` : '<button data-editc2>' + icon('phone') + 'Agregar tel.</button><span></span>'}
      <button data-new>${icon('plus')}Nuevo viaje</button>
      <button data-repeat ${last ? '' : 'disabled'}>${icon('repeat')}Repetir</button>
    </nav>
    <section class="tiles">
      <div class="tile"><small>Viajes</small><b>${done.length}</b><span>${last ? 'último ' + dayLabel(last.date) : '—'}</span></div>
      <div class="tile"><small>Total</small><b>${money(done.reduce((s, t) => s + +t.price, 0))}</b><span>${done.length ? 'prom. ' + money(done.reduce((s, t) => s + +t.price, 0) / done.length) : '—'}</span></div>
      <div class="tile ${debt ? 'warn' : ''}"><small>Me debe</small><b>${money(debt)}</b><span>${debt ? `<a href="#/cobros">cobrar</a>` : 'al día'}</span></div>
    </section>
    ${c.places || c.rate || c.notes ? `<section class="card"><dl class="kv">
      ${c.places ? `<dt>Lugares</dt><dd>${esc(c.places)}</dd>` : ''}
      ${c.rate ? `<dt>Tarifa</dt><dd>${esc(c.rate)}</dd>` : ''}
      ${c.notes ? `<dt>Notas</dt><dd>${esc(c.notes)}</dd>` : ''}</dl></section>` : ''}
    ${c.phone && sleeping(c) && done.length ? `<a class="card wa" style="display:block" href="${waLink(c, MSG.hello(c))}" target="_blank" rel="noopener">${icon('wa')} Lleva más de 30 días sin viajar. Mándale un saludo →</a>` : ''}
    <p class="group"><span>Historial</span><em>${trips.length}</em></p>
    ${trips.length ? trips.map((t) => tripCard(t, { showDate: true, showClient: false })).join('') : '<div class="card muted">Aún no hay viajes con este cliente.</div>'}`;
  $('[data-new]', view).onclick = () => tripForm(null, { clientId: id });
  const rep = $('[data-repeat]', view);
  if (last) rep.onclick = () => tripForm(null, { clientId: id, from: last.from, to: last.to, price: last.price, time: last.time, km: last.km });
  const e2 = $('[data-editc2]', view);
  if (e2) e2.onclick = () => clientForm(c);
  bindTrips();
}

// ---------- Cobros ----------
function renderCharges() {
  header('Cobros', { action: { href: '#/ajustes', icon: 'gear', label: 'Ajustes' } });
  setTabs('cobros');
  setFab(null);
  const groups = data.clients
    .map((c) => ({ c, list: tripsOf(c.id).filter(owed).sort(byWhen) }))
    .filter((g) => g.list.length)
    .sort((a, b) => b.list.reduce((s, t) => s + +t.price, 0) - a.list.reduce((s, t) => s + +t.price, 0));
  const total = groups.reduce((s, g) => s + g.list.reduce((x, t) => x + +t.price, 0), 0);
  view.innerHTML = !groups.length
    ? `<div class="empty">${icon('wallet')}<h2>Nadie te debe</h2><p>Cuando termines un viaje y elijas «Me debe», aparecerá aquí para cobrarlo.</p></div>`
    : `<section class="tiles" style="grid-template-columns:1fr 1fr"><div class="tile warn"><small>Por cobrar</small><b>${money(total)}</b><span>${groups.length} cliente${groups.length === 1 ? '' : 's'}</span></div>
        <div class="tile"><small>Más antiguo</small><b>${Math.max(0, ...groups.map((g) => daysBetween(g.list[0].date, today())))} días</b><span>sin pagar</span></div></section>
      ${groups.map(({ c, list }) => `<section class="card">
        <h3><a href="#/cliente/${c.id}">${esc(c.name)}</a> · ${money(list.reduce((s, t) => s + +t.price, 0))}</h3>
        <ul class="list" style="box-shadow:none;margin-bottom:10px">${list.map((t) => `<li data-trip="${t.id}"><span class="body"><b>${cap(fdate(t.date))}</b><small>${t.from || t.to ? `${esc(t.from || '…')} → ${esc(t.to || '…')}` : 'Sin ruta'}</small></span><span class="amt">${money(t.price)}</span><button data-paid="${t.id}">Cobrado</button></li>`).join('')}</ul>
        <div class="actions">${c.phone ? `<a class="wa" href="${waLink(c, MSG.charge(c, list))}" target="_blank" rel="noopener">${icon('wa')}Recordar por WhatsApp</a>` : ''}
          <button data-payall="${c.id}">${icon('cash')}Me pagó todo</button></div></section>`).join('')}`;
  bindTrips();
  view.querySelectorAll('[data-payall]').forEach((b) => (b.onclick = () => payForm(tripsOf(b.dataset.payall).filter(owed))));
}

// ---------- Resumen ----------
let sumMonth = '';
function renderSummary() {
  header('Resumen', { action: { href: '#/ajustes', icon: 'gear', label: 'Ajustes' } });
  setTabs('resumen');
  setFab(null);
  if (!sumMonth) sumMonth = today().slice(0, 7);
  const shift = (n) => { const d = new Date(sumMonth + '-01T00:00'); d.setMonth(d.getMonth() + n); return d.toLocaleDateString('en-CA').slice(0, 7); };
  const trips = data.trips.filter((t) => t.status === 'hecho' && t.date.startsWith(sumMonth));
  const total = trips.reduce((s, t) => s + +t.price, 0);
  const paid = trips.filter((t) => t.pay).reduce((s, t) => s + +t.price, 0);
  const per = new Map();
  for (const t of trips) per.set(t.clientId, (per.get(t.clientId) || 0) + +t.price);
  const top = [...per].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const max = top[0]?.[1] || 1;
  const methods = ['efectivo', 'transferencia', 'tarjeta'].map((m) => [m, trips.filter((t) => t.pay === m).reduce((s, t) => s + +t.price, 0)]).filter(([, v]) => v);
  const isNow = sumMonth === today().slice(0, 7);
  const asleep = data.clients.filter((c) => c.phone && lastTrip(c.id) && sleeping(c));
  view.innerHTML = `
    <div class="monthnav"><button class="iconbtn" data-m="-1" aria-label="Mes anterior">${icon('left')}</button>
      <b>${cap(new Date(sumMonth + '-01T00:00').toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }))}</b>
      <button class="iconbtn" data-m="1" aria-label="Mes siguiente" ${isNow ? 'disabled style="opacity:.3"' : ''}>${icon('right')}</button></div>
    <section class="tiles">
      <div class="tile"><small>Generado</small><b>${money(total)}</b><span>${trips.length} viaje${trips.length === 1 ? '' : 's'}</span></div>
      <div class="tile"><small>Cobrado</small><b>${money(paid)}</b><span>${total - paid ? 'faltan ' + money(total - paid) : 'completo'}</span></div>
      <div class="tile"><small>Promedio</small><b>${money(trips.length ? total / trips.length : 0)}</b><span>${per.size} cliente${per.size === 1 ? '' : 's'}</span></div>
    </section>
    ${top.length ? `<section class="card"><h3>Mejores clientes</h3><div class="bars">${top.map(([id, v]) => `<div class="bar"><span>${esc(client(id)?.name || '—')}</span><b>${money(v)}</b><i style="--w:${Math.round((v / max) * 100)}%"></i></div>`).join('')}</div></section>` : '<div class="card muted">Sin viajes terminados este mes.</div>'}
    ${methods.length ? `<section class="card"><h3>Cómo te pagaron</h3><dl class="kv">${methods.map(([m, v]) => `<dt>${cap(m)}</dt><dd>${money(v)}</dd>`).join('')}</dl></section>` : ''}
    ${isNow && asleep.length ? `<p class="group"><span>Para reactivar</span><em>+30 días sin viajar</em></p>
      <ul class="list">${asleep.map((c) => `<li data-client="${c.id}"><span class="avatar">${esc(initials(c.name))}</span><span class="body"><b>${esc(c.name)}</b><small>último viaje ${dayLabel(lastTrip(c.id).date)}</small></span><a class="wa" href="${waLink(c, MSG.hello(c))}" target="_blank" rel="noopener" aria-label="Saludar por WhatsApp">${icon('wa')}</a></li>`).join('')}</ul>` : ''}`;
  view.querySelectorAll('[data-m]').forEach((b) => (b.onclick = () => { if (!b.disabled) { sumMonth = shift(+b.dataset.m); renderSummary(); } }));
  view.querySelectorAll('[data-client]').forEach((li) => (li.onclick = (e) => { if (!e.target.closest('a')) location.hash = `#/cliente/${li.dataset.client}`; }));
}

// ---------- Ajustes ----------
function renderSettings() {
  header('Ajustes', { back: '#/' });
  setTabs('');
  setFab(null);
  const s = data.settings;
  view.innerHTML = `
    <form class="card" id="cfg" style="display:grid;gap:12px">
      <label class="field">Tu nombre (firma de los mensajes)<input name="driver" value="${esc(s.driver)}" placeholder="Ej. Lalo"></label>
      <label class="field">Datos para transferencia (opcional)<input name="bank" value="${esc(s.bank)}" placeholder="Ej. BBVA · CLABE 0123…"><small>Se agregan al mensaje de cobro.</small></label>
      <label class="field">Precio sugerido por km (opcional)<input name="perKm" type="number" inputmode="decimal" step="0.5" min="0" value="${esc(s.perKm)}" placeholder="Ej. 12"><small>Si capturas los km de un viaje, te sugiere el precio.</small></label>
      <label class="field">Lada del país para WhatsApp<input name="lada" inputmode="numeric" value="${esc(s.lada)}" placeholder="52"></label>
      <button class="primary">Guardar</button>
    </form>
    <section class="card"><h3>Tus datos</h3>
      <p class="muted" style="margin-bottom:10px">Todo se guarda solo en este teléfono. Descarga una copia de vez en cuando.</p>
      <div class="actions"><button data-export>Descargar copia</button><label class="actions"><button type="button" data-import>Cargar copia</button></label></div>
      <input type="file" accept="application/json,.json" hidden id="file"></section>
    <p class="muted" style="text-align:center;font-size:12px">${data.clients.length} clientes · ${data.trips.length} viajes · v1.0</p>`;
  $('#cfg').onsubmit = (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    data.settings = { ...s, driver: f.get('driver').trim(), bank: f.get('bank').trim(), perKm: f.get('perKm'), lada: f.get('lada').replace(/\D/g, '') || '52' };
    save();
    toast('Guardado');
  };
  $('[data-export]', view).onclick = () => {
    const blob = new Blob([JSON.stringify({ app: 'cartera', exportedAt: new Date().toISOString(), ...data }, null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `cartera-${today()}.json`;
    a.click();
  };
  const file = $('#file', view);
  $('[data-import]', view).onclick = () => file.click();
  file.onchange = async () => {
    try {
      const d = JSON.parse(await file.files[0].text());
      if (d.app !== 'cartera') throw new Error();
      // Suma sin borrar: lo que trae el archivo reemplaza solo los mismos ids.
      for (const k of ['clients', 'trips']) {
        const m = new Map(data[k].map((x) => [x.id, x]));
        for (const x of d[k] || []) m.set(x.id, x);
        data[k] = [...m.values()];
      }
      if (d.settings) data.settings = { ...data.settings, ...d.settings };
      refresh();
      toast('Copia cargada');
    } catch { toast('Ese archivo no es una copia de Cartera'); }
  };
}

// ---------- Formularios ----------
function openSheet(html, bind) {
  sheet.innerHTML = `<form method="dialog">${html}</form>`;
  const form = $('form', sheet);
  bind(form);
  sheet.showModal();
}
const field = (label, input, wide = false) => `<label class="field ${wide ? 'wide' : ''}">${label}${input}</label>`;
const buttons = (canDelete) => `<div class="buttons">${canDelete ? '<button type="button" class="left" data-del>Eliminar</button>' : ''}<button type="button" data-close>Cancelar</button><button class="primary">Guardar</button></div>`;
function wireCommon(form, onDelete) {
  $('[data-close]', form).onclick = () => sheet.close();
  const del = $('[data-del]', form);
  if (del) del.onclick = () => { if (confirm('¿Eliminar?')) { onDelete(); sheet.close(); refresh(); } };
}

function clientForm(c = null, { onSaved } = {}) {
  openSheet(`<h2>${c ? 'Editar cliente' : 'Nuevo cliente'}</h2>
    ${field('Nombre', `<input name="name" required value="${esc(c?.name)}" placeholder="Ej. Sra. Laura">`, true)}
    ${field('Teléfono (WhatsApp)', `<input name="phone" type="tel" inputmode="tel" value="${esc(c?.phone)}" placeholder="10 dígitos">`, true)}
    ${field('Lugares frecuentes <small>uno por renglón</small>', `<textarea name="places" rows="3" placeholder="Casa: Col. Centro, calle…\nTrabajo: Hospital General">${esc(c?.places)}</textarea>`, true)}
    ${field('Tarifa acordada', `<input name="rate" value="${esc(c?.rate)}" placeholder="Ej. $250 al aeropuerto">`, true)}
    ${field('Notas', `<textarea name="notes" rows="2" placeholder="Ej. Viaja con su perrito, paga por transferencia">${esc(c?.notes)}</textarea>`, true)}
    ${buttons(!!c)}`, (form) => {
    wireCommon(form, () => {
      data.clients = data.clients.filter((x) => x.id !== c.id);
      data.trips = data.trips.filter((t) => t.clientId !== c.id);
      location.hash = '#/clientes';
    });
    if (c && tripsOf(c.id).length) $('[data-del]', form).onclick = () => {
      if (!confirm(`¿Eliminar a ${c.name} y sus ${tripsOf(c.id).length} viajes?`)) return;
      data.clients = data.clients.filter((x) => x.id !== c.id);
      data.trips = data.trips.filter((t) => t.clientId !== c.id);
      sheet.close();
      location.hash = '#/clientes';
      refresh();
    };
    form.onsubmit = () => {
      const f = new FormData(form);
      const x = { ...(c || { id: uid(), createdAt: Date.now() }), updatedAt: Date.now() };
      for (const k of ['name', 'phone', 'places', 'rate', 'notes']) x[k] = f.get(k).trim();
      if (c) Object.assign(c, x);
      else data.clients.push(x);
      sheet.close();
      if (onSaved) onSaved(x);
      else if (!c) location.hash = `#/cliente/${x.id}`;
      refresh();
      toast('Guardado');
    };
  });
}

const PAYS = [['', 'Me debe'], ['efectivo', 'Efectivo'], ['transferencia', 'Transferencia'], ['tarjeta', 'Tarjeta']];
const seg = (name, opts, val) => `<div class="seg" role="radiogroup">${opts.map(([v, l]) => `<label><input type="radio" name="${name}" value="${v}" ${v === val ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div>`;
function placesFor(clientId) {
  const c = client(clientId);
  const own = String(c?.places || '').split('\n').map((l) => l.replace(/^[^:]{1,20}:\s*/, '').trim());
  const used = data.trips.filter((t) => !clientId || t.clientId === clientId).flatMap((t) => [t.from, t.to]);
  return [...new Set([...own, ...used].filter(Boolean))];
}

function tripForm(t = null, preset = {}) {
  const v = { date: today(), status: 'agendado', pay: '', ...preset, ...(t || {}) };
  const opts = [...data.clients].sort((a, b) => a.name.localeCompare(b.name, 'es'));
  openSheet(`<h2>${t ? 'Editar viaje' : 'Nuevo viaje'}</h2>
    ${field('Cliente', `<select name="clientId" required>${opts.length ? '' : '<option value="" disabled selected>Agrega un cliente</option>'}${opts.map((c) => `<option value="${c.id}" ${c.id === v.clientId ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}<option value="__new">＋ Cliente nuevo…</option></select>`, true)}
    ${field('Fecha', `<input name="date" type="date" required value="${esc(v.date)}">`)}
    ${field('Hora', `<input name="time" type="time" value="${esc(v.time)}">`)}
    ${field('De', `<input name="from" list="places" value="${esc(v.from)}" placeholder="Origen">`, true)}
    ${field('A', `<input name="to" list="places" value="${esc(v.to)}" placeholder="Destino">`, true)}
    <datalist id="places"></datalist>
    ${field('Km <small>(opcional)</small>', `<input name="km" type="number" inputmode="decimal" step="0.1" min="0" value="${esc(v.km)}">`)}
    ${field('Precio', `<input name="price" type="number" inputmode="decimal" step="1" min="0" required value="${esc(v.price)}">`)}
    <small class="field wide muted" id="hint"></small>
    <span class="field wide">Estado</span>${seg('status', [['agendado', 'Agendado'], ['hecho', 'Hecho'], ['cancelado', 'Cancelado']], v.status)}
    <div class="wide" id="paybox" style="grid-column:1/-1;display:grid;gap:6px"><span class="field">Pago</span>${seg('pay', PAYS, v.pay || '')}</div>
    ${field('Notas', `<textarea name="notes" rows="2">${esc(v.notes)}</textarea>`, true)}
    ${buttons(!!t)}`, (form) => {
    wireCommon(form, () => { data.trips = data.trips.filter((x) => x.id !== t.id); });
    const els = form.elements;
    const sel = els.clientId;
    const hint = $('#hint', form);
    const paybox = $('#paybox', form);
    let prevClient = sel.value;
    let priceTyped = !!t;
    els.price.addEventListener('input', () => { priceTyped = true; });
    const fillPlaces = () => { $('#places', form).innerHTML = placesFor(sel.value).map((p) => `<option value="${esc(p)}">`).join(''); };
    const suggest = () => {
      const same = data.trips.filter((x) => x.clientId === sel.value && x.id !== t?.id && x.status !== 'cancelado' && x.from === els.from.value.trim() && x.to === els.to.value.trim() && (x.from || x.to)).sort(byWhen).pop();
      const perKm = +data.settings.perKm;
      const tips = [];
      if (same) tips.push(`La última vez: ${money(same.price)}`);
      if (perKm && +els.km.value) tips.push(`Por km: ${money(perKm * els.km.value)}`);
      hint.textContent = tips.join(' · ');
      if (!priceTyped && (same || (perKm && +els.km.value))) els.price.value = Math.round(same ? same.price : perKm * els.km.value);
    };
    const showPay = () => { paybox.hidden = form.querySelector('[name=status]:checked').value !== 'hecho'; };
    sel.onchange = () => {
      if (sel.value === '__new') {
        sel.value = prevClient;
        clientForm(null, { onSaved: (c) => tripForm(null, { ...readForm(), clientId: c.id }) });
        return;
      }
      prevClient = sel.value;
      fillPlaces();
      suggest();
    };
    form.querySelectorAll('[name=status]').forEach((r) => (r.onchange = showPay));
    for (const k of ['from', 'to', 'km']) els[k].addEventListener('input', suggest);
    fillPlaces(); suggest(); showPay();
    function readForm() {
      const f = new FormData(form);
      return {
        clientId: f.get('clientId'), date: f.get('date'), time: f.get('time') || '',
        from: f.get('from').trim(), to: f.get('to').trim(), km: f.get('km'),
        price: +f.get('price') || 0,
        status: f.get('status'), pay: f.get('status') === 'hecho' ? f.get('pay') || '' : '', notes: f.get('notes').trim(),
      };
    }
    form.onsubmit = () => {
      const x = { ...(t || { id: uid(), createdAt: Date.now() }), ...readForm(), updatedAt: Date.now() };
      if (!client(x.clientId)) return;
      if (t) Object.assign(t, x);
      else data.trips.push(x);
      sheet.close();
      refresh();
      toast(t ? 'Guardado' : 'Viaje agendado');
    };
  });
  // Sin clientes: el precio no se exige hasta tener a quién cobrarle.
  if (!opts.length) { sheet.close(); clientForm(null, { onSaved: (c) => tripForm(null, { ...preset, clientId: c.id }) }); }
}

// Terminar un viaje: ¿cómo te pagó?
function finishForm(t) {
  const c = client(t.clientId);
  openSheet(`<h2>Terminar viaje</h2>
    <p class="field wide" style="font-weight:400">${esc(c?.name)} · ${money(t.price)}</p>
    <span class="field wide">¿Cómo te pagó?</span>${seg('pay', [['efectivo', 'Efectivo'], ['transferencia', 'Transferencia'], ['tarjeta', 'Tarjeta'], ['', 'Me debe']], 'efectivo')}
    <div class="buttons"><button type="button" data-close>Cancelar</button><button class="primary">Listo</button></div>`, (form) => {
    $('[data-close]', form).onclick = () => sheet.close();
    form.onsubmit = () => {
      Object.assign(t, { status: 'hecho', pay: new FormData(form).get('pay') || '', updatedAt: Date.now() });
      sheet.close();
      refresh();
      toast(t.pay ? 'Viaje terminado' : 'Anotado en Cobros');
    };
  });
}
function payForm(list) {
  const total = list.reduce((s, t) => s + +t.price, 0);
  openSheet(`<h2>Registrar pago</h2>
    <p class="field wide" style="font-weight:400">${esc(client(list[0].clientId)?.name)} · ${list.length} viaje${list.length === 1 ? '' : 's'} · ${money(total)}</p>
    ${seg('pay', PAYS.slice(1), 'efectivo')}
    <div class="buttons"><button type="button" data-close>Cancelar</button><button class="primary">Cobrado</button></div>`, (form) => {
    $('[data-close]', form).onclick = () => sheet.close();
    form.onsubmit = () => {
      const pay = new FormData(form).get('pay');
      for (const t of list) Object.assign(t, { pay, paidAt: today(), updatedAt: Date.now() });
      sheet.close();
      refresh();
      toast('Cobrado');
    };
  });
}

// ---------- Inicio ----------
render();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
