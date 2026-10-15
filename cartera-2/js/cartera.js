import { searchPlaces, reverse, route, directionsLink, mapSvg } from './mapas.js';
import { numOr, EXTRAS_INFO, PRESETS, isAirport, isNight, calculateQuote } from './calculos.js';
import { loadData, saveData } from './almacenamiento.js';


// Cartera: clientes privados del conductor (agenda, viajes, cobros y WhatsApp).
// Todo se guarda en este teléfono (localStorage). Sin build ni dependencias.


// ---------- Datos ----------
const KEY = 'cartera';
const EXTRA_DEF = { base: { on: false, v: 30 }, minimum: { on: true, v: 100 }, airport: { on: false, v: 50 }, night: { on: false, v: 20 }, wait: { on: false, v: 3 } };
const DEFAULTS = { clients: [], trips: [], settings: {
  onboarded: false, driver: '', phone: '', city: '', lada: '52',
  car: '', year: '', color: '', plates: '', seats: 4, extras: [],
  perKm: 12, perHour: 180, extra: EXTRA_DEF,
  pays: ['Efectivo'], bank: '', clabe: '', holder: '',
  share: { auto: true, routesOn: true, routes: [], clabe: true, hours: '' },
} };
let data = loadData(KEY, DEFAULTS, EXTRA_DEF);
function save() { saveData(KEY, data, () => toast('No se pudo guardar')); }
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
const DAYS = [[1, 'L'], [2, 'M'], [3, 'M'], [4, 'J'], [5, 'V'], [6, 'S'], [0, 'D']];
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
const mondayOf = (d) => addDays(d, -((new Date(d + 'T00:00').getDay() + 6) % 7));
const shortRoute = (from, to) => `${(from || '…').split(',')[0]} → ${(to || '…').split(',')[0]}`;
const weekSummary = (c) => `${daysLabel(c.week?.days || [])} · ${c.week?.items?.length || 0} viaje${c.week?.items?.length === 1 ? '' : 's'} al día`;

// ---------- WhatsApp y llamadas ----------
function phoneIntl(p) {
  const d = String(p || '').replace(/\D/g, '');
  return d.length === 10 ? (data.settings.lada || '52') + d : d;
}
const waLink = (c, text) => `https://wa.me/${phoneIntl(c.phone)}?text=${encodeURIComponent(text)}`;
const payTo = () => { const s = data.settings; return (s.pays || []).includes('Transferencia') && s.clabe ? [s.bank, s.clabe].filter(Boolean).join(' ') : ''; };
const sign = () => (data.settings.driver ? `\n— ${data.settings.driver}` : '');
const MSG = {
  confirm: (c, t) => `Hola ${firstName(c)}, te confirmo tu viaje ${dayLabel(t.date)}${t.time ? ' a las ' + hour12(t.time) : ''}${t.from || t.to ? `: ${t.from || '…'} → ${t.to || '…'}` : ''}. Costo ${money(t.price)}. ¡Gracias!${sign()}`,
  arrived: (c, t) => `Hola ${firstName(c)}, ya estoy afuera${t.from ? ' en ' + t.from : ''}. 🚗`,
  charge: (c, list) => `Hola ${firstName(c)}, te comparto lo pendiente:\n${list.map((t) => `• ${fdate(t.date, { day: 'numeric', month: 'short' })}${t.to ? ' · ' + (t.from ? t.from + ' → ' : '') + t.to : ''}: ${money(t.price)}`).join('\n')}\nTotal: ${money(list.reduce((s, t) => s + +t.price, 0))}.${payTo() ? `\nTransferencia: ${payTo()}` : ''}\n¡Gracias!${sign()}`,
  week: (c, list) => {
    const short = (l) => (l || '…').split(',')[0];
    const days = [...new Set(list.map((t) => t.date))];
    const lines = days.map((d) => `• ${cap(fdate(d, { weekday: 'short', day: 'numeric', month: 'short' }))}: ${list.filter((t) => t.date === d).sort(byWhen).map((t) => `${t.time ? hour12(t.time) + ' ' : ''}${short(t.from)} → ${short(t.to)}`).join(' · ')}`).join('\n');
    return `Hola ${firstName(c)}, te confirmo tus viajes:\n${lines}\nSon ${list.length} viaje${list.length === 1 ? '' : 's'} (${money(list.reduce((s, t) => s + +t.price, 0))}). ¡Gracias!${sign()}`;
  },
  hello: (c) => `Hola ${firstName(c)}, ¿cómo estás? Te recuerdo que sigo a tus órdenes para tus viajes. Cuando lo necesites, escríbeme y lo agendamos.${sign()}`,
};

// ---------- Tarifa (como CHECA: meta por km y por hora; se usa la que deje más) ----------
function quote(km, min, ctx = {}, s = data.settings) { return calculateQuote(km, min, ctx, s, EXTRA_DEF); }
const suggestPrice = (km, min, ctx) => quote(km, min, ctx).total;
const priceMath = (km, min, ctx) => quote(km, min, ctx).lines.filter((l) => l[2]).map(([l, v]) => `${l}: ${money(v)}`).join(' · ');
const calcTable = (q) => `<dl class="calc">${q.lines.map(([l, v, used]) => `<dt class="${used ? '' : 'off'}">${esc(l)}</dt><dd class="${used ? '' : 'off'}">${money(v)}</dd>`).join('')}</dl>`;

// ---------- Íconos ----------
const P = {
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  users: '<circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3-7 7-7s7 3 7 7"/><path d="M16 4a4 4 0 0 1 0 8M19 14c2 1 3 4 3 7"/>',
  wallet: '<path d="M20 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h15v13H5a2 2 0 0 1-2-2V5"/><path d="M16 13h.01"/>',
  chart: '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  back: '<path d="M15 18l-6-6 6-6"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  wa: '<path d="M3 21l1.6-4.7A8.5 8.5 0 1 1 7.7 19.4z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8c-1-.5-1.8-1.3-2.3-2.3l.8-1-1-2z"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  repeat: '<path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  pin: '<path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
  cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
  left: '<path d="M15 18l-6-6 6-6"/>',
  nav: '<path d="M3 11l19-9-9 19-2-8z"/>',
  right: '<path d="M9 18l6-6-6-6"/>',
  car: '<path d="M5 17H3v-5l2.5-5h13L21 12v5h-2"/><path d="M9 17h6"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M4 12h16"/>',
};
const icon = (n) => `<svg viewBox="0 0 24 24" class="i" aria-hidden="true">${P[n]}</svg>`;

// ---------- Estructura ----------
const view = $('#view');
const top = $('#top');
const tabs = $('#tabs');
const fab = $('#fab');
const sheet = $('#sheet');

function header(title, { back, action } = {}) {
  top.innerHTML = `${back ? `<a class="iconbtn" href="${back}" aria-label="Volver">${icon('back')}</a>` : `<a class="brand me" href="#/perfil" aria-label="Mi perfil">${data.settings.driver ? esc(initials(data.settings.driver)) : icon('users')}</a>`}
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
function toast(msg, act) {
  const t = $('#toast');
  t.textContent = msg;
  if (act) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = act.label;
    b.onclick = () => { clearTimeout(toastTimer); t.classList.remove('on', 'act'); act.fn(); };
    t.append(b);
  }
  t.classList.toggle('act', !!act);
  t.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('on', 'act'), act ? 7000 : 1800);
}

function render() {
  const [, mod = '', id = ''] = (location.hash || '#/').slice(1).split('/');
  if (mod === 'nuevo') { history.replaceState(null, '', '#/'); render(); tripForm(); return; }
  window.scrollTo(0, 0);
  document.body.classList.toggle('onboarding', !data.settings.onboarded);
  if (!data.settings.onboarded) renderOnboarding();
  else if (mod === 'perfil') renderProfile();
  else if (mod === 'clientes') renderClients();
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
  if (t.status === 'agendado' && t.fromPt && t.toPt) actions += `<a href="${directionsLink(t.fromPt, t.toPt)}" target="_blank" rel="noopener">${icon('nav')}Ruta</a>`;
  if (t.status === 'agendado') actions += `<button data-finish="${t.id}">${icon('check')}Terminar</button>`;
  if (owed(t)) actions += `<button data-paid="${t.id}">${icon('cash')}Cobrado</button>`;
  return `<article class="trip ${late ? 'late' : ''} ${t.status !== 'agendado' ? 'done' : ''}" data-trip="${t.id}" tabindex="0">
    <div class="when">${t.time ? hour12(t.time).replace(/ (am|pm)/, '') : '—'}<small>${showDate ? fdate(t.date, { day: 'numeric', month: 'short' }) : t.time ? hour12(t.time).slice(-2) : ''}</small></div>
    <div>${showClient ? `<div class="who">${esc(c.name)}</div>` : ''}
      <div class="way">${t.from || t.to ? `${esc(t.from || '…')} → ${esc(t.to || '…')}` : '<span class="muted">Sin ruta</span>'}</div>
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
      ${'contacts' in navigator ? '<button data-contacts>Importar de mis contactos</button>' : ''}</div>`;
    $('[data-newclient]', view).onclick = () => clientForm();
    $('[data-contacts]', view)?.addEventListener('click', importContacts);
    return;
  }
  const pending = active.filter((x) => x.status === 'agendado' && x.date < t).sort(byWhen);
  const upcoming = active.filter((x) => x.status === 'agendado' && x.date > t).sort(byWhen);
  const tomorrow = upcoming.filter((x) => x.date === addDays(t, 1));
  const week = upcoming.filter((x) => x.date > addDays(t, 1) && x.date <= addDays(t, 7));
  const later = upcoming.filter((x) => x.date > addDays(t, 7));
  const section = (title, list, opts) => (list.length ? `<p class="group"><span>${title}</span><em>${money(list.reduce((s, x) => s + +x.price, 0))}</em></p>${list.map((x) => tripCard(x, opts)).join('')}` : '');
  const nudges = weekNudges();
  view.innerHTML = `
    <section class="tiles">
      <div class="tile"><small>Hoy</small><b>${todays.length}</b><span>${todays.length ? money(todays.reduce((s, x) => s + +x.price, 0)) : 'sin viajes'}</span></div>
      <a class="tile ${debt ? 'warn' : ''}" href="#/cobros"><small>Por cobrar</small><b>${money(debt)}</b><span>${debt ? 'ver quién' : 'todo al día'}</span></a>
      <a class="tile" href="#/resumen"><small>Este mes</small><b>${money(monthDone.reduce((s, x) => s + +x.price, 0))}</b><span>${monthDone.length} viaje${monthDone.length === 1 ? '' : 's'}</span></a>
    </section>
    ${nudges.map(({ c }) => `<section class="card nudge"><b>¿Agendar la próxima semana de ${esc(firstName(c))}?</b><small class="muted">${esc(weekSummary(c))}</small>
      <div class="actions"><button class="primary" data-nweek="${c.id}">Agendar semana</button><button data-nsnooze="${c.id}">Ahora no</button></div></section>`).join('')}
    ${section('Sin cerrar', pending, { showDate: true })}
    ${todays.length ? section('Hoy', todays) : `<div class="card muted">Hoy no tienes viajes agendados.</div>`}
    ${section('Mañana', tomorrow)}
    ${section('Esta semana', week, { showDate: true })}
    ${section('Más adelante', later, { showDate: true })}`;
  bindTrips();
  view.querySelectorAll('[data-nweek]').forEach((b) => (b.onclick = () => weekForm(client(b.dataset.nweek), { start: 'next' })));
  view.querySelectorAll('[data-nsnooze]').forEach((b) => (b.onclick = () => { const n = nudges.find((x) => x.c.id === b.dataset.nsnooze); client(n.c.id).weekSnooze = n.next; refresh(); }));
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
    .filter((c) => q.every((w) => fold([c.name, c.phone, c.places, c.notes, ...(c.services || []).map((sv) => `${sv.name} ${sv.a?.label} ${sv.b?.label}`)].join(' ')).includes(w)))
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
    ${(c.services || []).length || done.length ? `<button class="cta primary" data-week style="margin-bottom:${c.week ? 4 : 12}px">${icon('repeat')} Agendar semana</button>${c.week ? `<p class="muted" style="margin:0 2px 12px;font-size:12.5px">Tu rutina: ${esc(weekSummary(c))}</p>` : ''}` : ''}
    <section class="tiles">
      <div class="tile"><small>Viajes</small><b>${done.length}</b><span>${last ? 'último ' + dayLabel(last.date) : '—'}</span></div>
      <div class="tile"><small>Total</small><b>${money(done.reduce((s, t) => s + +t.price, 0))}</b><span>${done.length ? 'prom. ' + money(done.reduce((s, t) => s + +t.price, 0) / done.length) : '—'}</span></div>
      <div class="tile ${debt ? 'warn' : ''}"><small>Me debe</small><b>${money(debt)}</b><span>${debt ? `<a href="#/cobros" data-collect>cobrar</a>` : 'al día'}</span></div>
    </section>
    ${(c.services || []).length ? `<p class="group"><span>Sus servicios</span><em>agendar en un toque</em></p>
      <div class="qs">${c.services.map((sv) => `<div class="q"><b>${esc(sv.name || autoName(sv))}</b>${sv.name && sv.name !== autoName(sv) ? `<small>${esc(autoName(sv))}</small>` : ''}
        <span class="meta">${sv.km ? `${sv.km} km · ${sv.min} min · ` : ''}<span class="amt">${money(svcPrice(sv))}</span></span><button data-book="${sv.id}">Agendar</button></div>`).join('')}</div>` : ''}
    ${c.places || c.rate || c.notes ? `<section class="card"><dl class="kv">
      ${c.places ? `<dt>Lugares</dt><dd>${esc(c.places)}</dd>` : ''}
      ${c.rate ? `<dt>Tarifa</dt><dd>${esc(c.rate)}</dd>` : ''}
      ${c.notes ? `<dt>Notas</dt><dd>${esc(c.notes)}</dd>` : ''}</dl></section>` : ''}
    ${c.phone && sleeping(c) && done.length ? `<a class="card wa" style="display:block" href="${waLink(c, MSG.hello(c))}" target="_blank" rel="noopener">${icon('wa')} Lleva más de 30 días sin viajar. Mándale un saludo →</a>` : ''}
    <p class="group"><span>Historial</span><em>${trips.length}</em></p>
    ${trips.length ? trips.map((t) => tripCard(t, { showDate: true, showClient: false })).join('') : '<div class="card muted">Aún no hay viajes con este cliente.</div>'}`;
  $('[data-new]', view).onclick = () => tripForm(null, { clientId: id });
  $('[data-week]', view)?.addEventListener('click', () => weekForm(c));
  $('[data-collect]', view)?.addEventListener('click', (e) => { e.preventDefault(); collectForm(c); });
  view.querySelectorAll('[data-book]').forEach((b) => (b.onclick = () => { const sv = c.services.find((x) => x.id === b.dataset.book); quickTrip(fromService(c, sv), sv.name || autoName(sv)); }));
  const rep = $('[data-repeat]', view);
  if (last) rep.onclick = () => quickTrip({ clientId: id, from: last.from, to: last.to, fromPt: last.fromPt, toPt: last.toPt, price: last.price, time: last.time, km: last.km, min: last.min, path: last.path }, 'Repetir viaje');
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
          <button data-payall="${c.id}">${icon('cash')}Cobrar</button></div></section>`).join('')}`;
  bindTrips();
  view.querySelectorAll('[data-payall]').forEach((b) => (b.onclick = () => collectForm(client(b.dataset.payall))));
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
    <a class="card mecard" href="#/perfil"><span class="avatar">${esc(initials(s.driver || '?'))}</span><span><b>${esc(s.driver || 'Mi perfil')}</b><small>Tus datos, tu auto, tu tarifa y cómo cobras</small></span>${icon('right')}</a>
    <form class="card" id="cfg" style="display:grid;gap:12px">
      <label class="field">Lada del país para WhatsApp<input name="lada" inputmode="numeric" value="${esc(s.lada)}" placeholder="52"><small>Se agrega a los números de 10 dígitos.</small></label>
      <button class="primary">Guardar</button>
    </form>
    <section class="card"><h3>Tus datos</h3>
      <p class="muted" style="margin-bottom:10px">Todo se guarda solo en este teléfono. Descarga una copia de vez en cuando.</p>
      <div class="actions"><button data-export>Descargar copia</button><button type="button" data-import>Cargar copia</button>${'contacts' in navigator ? '<button type="button" data-contacts>Importar contactos</button>' : ''}</div></section>
    <section class="card"><button type="button" data-tour>Ver el inicio rápido otra vez</button></section>
    <p class="muted" style="text-align:center;font-size:12px">${data.clients.length} clientes · ${data.trips.length} viajes · v1.2</p>`;
  $('#cfg').onsubmit = (e) => {
    e.preventDefault();
    data.settings.lada = new FormData(e.target).get('lada').replace(/\D/g, '') || '52';
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
  $('[data-import]', view).onclick = pickBackup;
  $('[data-contacts]', view)?.addEventListener('click', importContacts);
  $('[data-tour]', view).onclick = () => { data.settings.onboarded = false; obStep = 0; refresh(); };
}
function pickBackup() {
  const file = document.createElement('input');
  file.type = 'file';
  file.accept = 'application/json,.json';
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
      if (d.settings) data.settings = { ...data.settings, ...d.settings, onboarded: true };
      save();
      data = load();
      refresh();
      toast('Copia cargada');
    } catch { toast('Ese archivo no es una copia de Cartera'); }
  };
  file.click();
}
// Contactos del teléfono (Chrome en Android).
async function importContacts() {
  try {
    const list = await navigator.contacts.select(['name', 'tel'], { multiple: true });
    let n = 0;
    for (const c of list) {
      const name = (c.name?.[0] || '').trim();
      const phone = (c.tel?.[0] || '').trim();
      if (!name || data.clients.some((x) => x.name === name || (phone && x.phone.replace(/\D/g, '').slice(-10) === phone.replace(/\D/g, '').slice(-10)))) continue;
      data.clients.push({ id: uid(), name, phone, notes: '', services: [], createdAt: Date.now(), updatedAt: Date.now() });
      n++;
    }
    data.settings.onboarded = true;
    location.hash = '#/clientes';
    refresh();
    toast(n ? `${n} cliente${n === 1 ? '' : 's'} agregado${n === 1 ? '' : 's'}` : 'No se agregó nadie nuevo');
  } catch { toast('No se pudieron leer los contactos'); }
}

// ---------- Perfil del conductor e inicio rápido ----------
const PROFILE_STEPS = ['Tú', 'Tu auto', 'Tu tarifa', 'Cómo cobras'];
const CAR_EXTRAS = ['Aire acondicionado', 'Cajuela amplia', 'Acepta mascotas', 'Silla para bebé', 'Factura'];
const PAY_OPTS = ['Efectivo', 'Transferencia', 'Tarjeta'];
let obStep = 0;
// Al inicio solo se pide lo esencial (tú y tu tarifa). Auto y forma de cobro se completan en Mi perfil.
const ONB = [1, 3];
const chipsOf = (list, sel, key) => `<div class="chips wrap">${list.map((x) => `<button type="button" aria-pressed="${sel.includes(x)}" data-toggle="${key}" data-v="${esc(x)}">${esc(x)}</button>`).join('')}</div>`;
const pin = (k, label, val, attrs = '') => `<label class="field">${label}<input data-k="${k}" value="${esc(val)}" ${attrs}></label>`;

// Campos de cada paso; los usan el inicio rápido y «Editar» del perfil.
function stepHtml(n, D) {
  if (n === 1) return `<h2>¿Cómo te llamas?</h2><div class="pbody">
    ${pin('driver', 'Tu nombre o apodo', D.driver, 'placeholder="Ej. Lalo" autocomplete="given-name"')}
    ${pin('phone', 'Tu WhatsApp', D.phone, 'type="tel" inputmode="tel" placeholder="10 dígitos"')}
    ${pin('city', 'Ciudad donde trabajas', D.city, 'placeholder="Ej. Cancún"')}
    <small class="muted">Tu nombre firma los mensajes. La ciudad ayuda a encontrar direcciones.</small></div>`;
  if (n === 2) return `<h2>Tu auto</h2><div class="pbody">
    ${pin('car', 'Marca y modelo', D.car, 'placeholder="Ej. Nissan Versa"')}
    <div class="row2">${pin('year', 'Año', D.year, 'inputmode="numeric" maxlength="4"')}${pin('color', 'Color', D.color)}</div>
    ${pin('plates', 'Placas <small>(opcional, solo tú las ves)</small>', D.plates, 'placeholder="ABC-123-D" style="text-transform:uppercase"')}
    <div class="field">Pasajeros<span class="stepper"><button type="button" data-seats="-1" aria-label="Menos">−</button><b>${D.seats}</b><button type="button" data-seats="1" aria-label="Más">+</button></span></div>
    <div class="field">Qué ofreces${chipsOf(CAR_EXTRAS, D.extras, 'extras')}</div></div>`;
  if (n === 3) return `<h2>¿Cuánto cobras?</h2><div class="pbody">
    <p class="muted">Como en CHECA: tu meta por km y por hora. El precio usa la que deje más.</p>
    <div class="field">Empieza con una tarifa${chipsOf(Object.keys(PRESETS), Object.keys(PRESETS).filter((k) => PRESETS[k].join() === [D.perKm, D.perHour].join()), 'preset')}</div>
    <div class="row2">${pin('perKm', 'Por km $', D.perKm, 'type="number" inputmode="decimal" step="0.5" min="0"')}${pin('perHour', 'Por hora $', D.perHour, 'type="number" inputmode="decimal" step="10" min="0"')}</div>
    <details class="more" ${Object.values(D.extra).some((x) => x.on) ? 'open' : ''}><summary>Más detalles <small>opcional</small></summary>
      ${EXTRAS_INFO.map(([k, l, u, h]) => `<div class="opt"><label class="sw"><input type="checkbox" data-on="${k}" ${D.extra[k].on ? 'checked' : ''}><span>${l}<small>${h}</small></span></label>
        ${D.extra[k].on ? `<label class="unit"><input data-x="${k}" type="number" inputmode="decimal" min="0" value="${D.extra[k].v}" aria-label="${l}"><span>${u}</span></label>` : ''}</div>`).join('')}
    </details>
    <div class="example" data-ex></div></div>`;
  if (n === 4) return `<h2>¿Cómo te pagan?</h2><div class="pbody">
    ${chipsOf(PAY_OPTS, D.pays, 'pays')}
    ${D.pays.includes('Transferencia') ? `${pin('holder', 'Nombre completo del titular', D.holder, 'placeholder="Como aparece en tu cuenta" autocomplete="name"')}<div class="row2">${pin('bank', 'Banco', D.bank, 'placeholder="Ej. BBVA"')}${pin('clabe', 'CLABE o tarjeta', D.clabe, 'inputmode="numeric"')}</div>` : ''}
    <div class="field">Así se ve tu recordatorio de cobro</div><div class="bubble" data-bubble></div></div>`;
  return '';
}
function liveStep(root, D) {
  const ex = $('[data-ex]', root);
  if (ex) { const q = quote(18, 30, { airport: true }, D); ex.innerHTML = `<small>Ejemplo: Centro → Aeropuerto · 18 km · 30 min</small><span class="big">${money(q.total)}</span>${calcTable(q)}`; }
  const b = $('[data-bubble]', root);
  if (b) {
    const p = quote(18, 30, { airport: true }, D).total;
    const to = D.pays.includes('Transferencia') && D.clabe ? `\nTransferencia: ${[D.bank, D.clabe].filter(Boolean).join(' ')}` : '';
    b.textContent = `Hola Ana, te comparto lo pendiente:\n• 12 oct · Centro → Aeropuerto: ${money(p)}\nTotal: ${money(p)}.${to}\n¡Gracias!\n— ${D.driver || 'Tu nombre'}`;
  }
}
// Conecta los campos de un paso con el borrador D; redraw vuelve a pintar el paso.
function wireStep(root, D, redraw) {
  root.oninput = (e) => {
    const el = e.target;
    if (el.dataset.x) D.extra[el.dataset.x].v = +el.value || 0;
    else if (el.dataset.k) {
      D[el.dataset.k] = el.type === 'number' ? numOr(el.value, 0) : el.value;
      if (el.dataset.k === 'perKm' || el.dataset.k === 'perHour') root.querySelectorAll('[data-toggle=preset]').forEach((b) => b.setAttribute('aria-pressed', PRESETS[b.dataset.v].join() === [D.perKm, D.perHour].join()));
      if (el.dataset.k === 'clabe' || el.dataset.k === 'bank' || el.dataset.k === 'driver') liveStep(root, D);
    }
    liveStep(root, D);
  };
  root.onchange = (e) => { if (e.target.dataset.on) { D.extra[e.target.dataset.on] = { ...D.extra[e.target.dataset.on], on: e.target.checked }; redraw(); } };
  root.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t || !root.contains(t)) return;
    if (t.dataset.seats) { D.seats = Math.min(15, Math.max(1, D.seats + +t.dataset.seats)); redraw(); }
    else if (t.dataset.toggle === 'preset') { [D.perKm, D.perHour] = PRESETS[t.dataset.v]; redraw(); }
    else if (t.dataset.toggle) {
      const list = D[t.dataset.toggle], v = t.dataset.v;
      list.includes(v) ? list.splice(list.indexOf(v), 1) : list.push(v);
      redraw();
    }
  });
  liveStep(root, D);
}

let obDraft = null;
function renderOnboarding() {
  top.innerHTML = '';
  tabs.innerHTML = '';
  setFab(null);
  obDraft ||= structuredClone(data.settings);
  const D = obDraft;
  const n = obStep;
  if (n === 0) {
    view.innerHTML = `<section class="ob"><div class="welcome">
      <span class="mark">${icon('users')}</span>
      <h2>Tus clientes privados, en orden</h2>
      <ul class="benefits">
        <li><span class="ic">${icon('wa')}</span><div><b>Agenda y confirma por WhatsApp</b><span>Mensajes listos con fecha, ruta y precio.</span></div></li>
        <li><span class="ic">${icon('nav')}</span><div><b>Precio justo en segundos</b><span>Punto A y B, distancia, tiempo y tu tarifa.</span></div></li>
        <li><span class="ic">${icon('wallet')}</span><div><b>Sabes quién te debe</b><span>Cobros pendientes y recordatorio amable.</span></div></li>
      </ul></div>
      <button class="cta primary" data-go="1">Empezar · 1 minuto</button>
      <button class="skip" data-backup>Ya tengo una copia de mis datos</button></section>`;
  } else if (n <= ONB.length) {
    view.innerHTML = `<section class="ob"><div class="progress">${ONB.map((_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</div>
      <span class="steplabel">Paso ${n} de ${ONB.length} · ${PROFILE_STEPS[ONB[n - 1] - 1]}</span>
      <div class="pstep">${stepHtml(ONB[n - 1], D)}</div>
      <div class="nav"><button type="button" data-go="${n - 1}">Atrás</button><button type="button" class="primary" data-go="${n + 1}">${n === ONB.length ? 'Terminar' : 'Siguiente'}</button></div></section>`;
    wireStep($('.pstep', view), D, renderOnboarding);
  } else {
    view.innerHTML = `<section class="ob"><div class="done"><span class="mark">${icon('check')}</span>
      <h2>¡Listo${D.driver ? ', ' + esc(D.driver) : ''}!</h2>
      <p class="muted">Tu perfil y tu tarifa quedaron guardados. Tu auto y cómo cobras los completas luego en Mi perfil.</p></div>
      <button class="cta primary" data-finish="client">＋ Agregar mi primer cliente</button>
      ${'contacts' in navigator ? '<button class="cta" data-finish="contacts">Importar de mis contactos</button>' : ''}
      <button class="skip" data-finish="">Ir a mi agenda</button></section>`;
  }
  view.querySelectorAll('[data-go]').forEach((b) => (b.onclick = () => {
    const to = +b.dataset.go;
    if (n === 1 && to === 2 && !D.driver.trim()) { toast('Escribe tu nombre para firmar los mensajes'); $('[data-k=driver]', view).focus(); return; }
    if (to === ONB.length + 1) { data.settings = { ...D, onboarded: false }; save(); }
    obStep = to;
    render();
  }));
  $('[data-backup]', view)?.addEventListener('click', pickBackup);
  view.querySelectorAll('[data-finish]').forEach((b) => (b.onclick = () => {
    data.settings.onboarded = true;
    obDraft = null;
    obStep = 0;
    save();
    if (b.dataset.finish === 'contacts') return importContacts();
    location.hash = b.dataset.finish === 'client' ? '#/clientes' : '#/';
    render();
    if (b.dataset.finish === 'client') clientForm();
  }));
}

function renderProfile() {
  const s = data.settings;
  header('Mi perfil', { back: '#/' });
  top.lastElementChild.outerHTML = `<button class="iconbtn" data-share aria-label="Compartir mi página">${icon('share')}</button>`;
  $('[data-share]', top).onclick = shareSheet;
  setTabs('');
  setFab(null);
  const done = data.trips.filter((t) => t.status === 'hecho');
  const month = done.filter((t) => t.date.startsWith(today().slice(0, 7))).reduce((x, t) => x + +t.price, 0);
  const X = s.extra;
  const card = `Hola, soy ${s.driver}${s.city ? ', conductor privado en ' + s.city : ''}. 🚗${s.car ? `\n${s.car} ${s.year} ${s.color}`.trimEnd() + `, ${s.seats} pasajeros` : ''}${s.extras.length ? ` · ${s.extras.join(', ')}` : ''}.\nGuarda mi número y escríbeme por aquí para agendar tus viajes.${s.phone ? `\nWhatsApp: ${s.phone}` : ''}`;
  view.innerHTML = `
    <section class="hero"><span class="avatar big">${esc(initials(s.driver || '?'))}</span><h2>${esc(s.driver || 'Tu nombre')}</h2><span class="muted">Conductor privado${s.city ? ' · ' + esc(s.city) : ''}</span></section>
    <section class="tiles"><div class="tile"><small>Clientes</small><b>${data.clients.length}</b></div><div class="tile"><small>Viajes</small><b>${done.length}</b></div><div class="tile"><small>Este mes</small><b>${money(month)}</b></div></section>
    <section class="card psect"><h3>Mis datos <button data-edit="1">Editar</button></h3>
      <div class="copy"><span>WhatsApp <code>${esc(s.phone || '—')}</code></span>${s.phone ? `<button data-copy="${esc(s.phone)}">Copiar</button>` : ''}</div></section>
    <section class="card psect"><h3>Mi auto <button data-edit="2">Editar</button></h3>
      ${s.car ? `<div class="carrow"><span class="ic">${icon('car')}</span><div><b>${esc(s.car)} ${esc(s.year)}</b><span class="muted">${[s.color, s.plates.toUpperCase(), `${s.seats} pasajeros`].filter(Boolean).map(esc).join(' · ')}</span></div></div>
      ${s.extras.length ? `<div class="tags">${s.extras.map((x) => `<i>${esc(x)}</i>`).join('')}</div>` : ''}` : '<p class="muted">Agrega tu auto para mandarlo en tu tarjeta.</p>'}</section>
    <section class="card psect"><h3>Mi tarifa <button data-edit="3">Editar</button></h3>
      <dl class="kv2"><dt>Por km</dt><dd>$${s.perKm}</dd><dt>Por hora</dt><dd>$${s.perHour}</dd>
      ${EXTRAS_INFO.filter(([k]) => X[k].on).map(([k, l, u]) => `<dt>${l}</dt><dd>${u === '%' ? '+' + X[k].v + '%' : u === '$/min' ? '$' + X[k].v + '/min' : money(X[k].v)}</dd>`).join('')}</dl></section>
    <section class="card psect"><h3>Cómo cobro <button data-edit="4">Editar</button></h3>
      <div class="tags">${s.pays.map((x) => `<i>${esc(x)}</i>`).join('') || '<span class="muted">Sin elegir</span>'}</div>
      ${payTo() ? `<div class="copy"><span>${esc(s.bank)} <code>${esc(s.clabe)}</code>${s.holder ? `<br><small class="muted">A nombre de ${esc(s.holder)}</small>` : ''}</span><button data-copy="${esc(s.clabe)}">Copiar</button></div>` : ''}</section>
    <a class="share" href="https://wa.me/?text=${encodeURIComponent(card)}" target="_blank" rel="noopener">${icon('wa')} Compartir mi tarjeta por WhatsApp</a>`;
  view.querySelectorAll('[data-copy]').forEach((b) => (b.onclick = async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); toast('Copiado'); } catch { toast('No se pudo copiar'); }
  }));
  view.querySelectorAll('[data-edit]').forEach((b) => (b.onclick = () => editProfile(+b.dataset.edit)));
}
function editProfile(n) {
  const D = structuredClone(data.settings);
  const draw = () => {
    const box = $('.pstep', sheet);
    box.innerHTML = stepHtml(n, D);
    liveStep(box, D);
  };
  openSheet(`<div class="pstep wide">${stepHtml(n, D)}</div><div class="buttons"><button type="button" data-close>Cancelar</button><button class="primary">Guardar</button></div>`, (form) => {
    wireStep($('.pstep', form), D, draw);
    $('[data-close]', form).onclick = () => sheet.close();
    form.onsubmit = () => {
      if (!String(D.driver).trim()) { toast('Escribe tu nombre'); return false; }
      data.settings = D;
      sheet.close();
      refresh();
      toast('Perfil guardado');
    };
  });
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
  const chain = !c && !onSaved;
  const openMore = !!(c && ((c.services || []).length || c.notes));
  openSheet(`<h2>${c ? 'Editar cliente' : 'Nuevo cliente'}</h2>
    ${!c && 'contacts' in navigator ? '<button type="button" class="add wide" data-pick>Elegir de mis contactos</button>' : ''}
    ${field('Nombre', `<input name="name" required value="${esc(c?.name)}" placeholder="Ej. Sra. Laura">`, true)}
    ${field('Teléfono (WhatsApp)', `<input name="phone" type="tel" inputmode="tel" value="${esc(c?.phone)}" placeholder="10 dígitos">`, true)}
    <details class="opts" ${openMore ? 'open' : ''}><summary>Servicios frecuentes y notas <small>opcional · se aprenden solos con los viajes</small></summary><div>
      <div class="sec wide"><b>Servicios frecuentes</b><small>precio con tu tarifa</small></div>
      <div class="wide svcs" id="svcs"></div>
      <button type="button" class="add wide" data-addsvc>＋ Agregar servicio frecuente</button>
      ${field('Notas', `<textarea name="notes" rows="2" placeholder="Ej. Viaja con su perrito, paga por transferencia">${esc(c?.notes)}</textarea>`, true)}
    </div></details>
    <div class="buttons">${c ? '<button type="button" class="left" data-del>Eliminar</button>' : ''}<button type="button" data-close>Cancelar</button>${chain ? '<button>Solo guardar</button><button type="button" class="primary" data-savego>Guardar y agendar viaje</button>' : '<button class="primary">Guardar</button>'}</div>`, (form) => {
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
    $('[data-pick]', form)?.addEventListener('click', async () => {
      try {
        const [p] = await navigator.contacts.select(['name', 'tel'], { multiple: false });
        if (!p) return;
        if (p.name?.[0]) form.elements.name.value = p.name[0].trim();
        if (p.tel?.[0]) form.elements.phone.value = p.tel[0].trim();
      } catch { toast('No se pudieron leer los contactos'); }
    });
    const svcs = structuredClone(c?.services || []);
    const box = $('#svcs', form);
    const drawSvcs = () => {
      box.innerHTML = '';
      svcs.forEach((sv) => box.append(serviceCard(sv, () => { svcs.splice(svcs.indexOf(sv), 1); drawSvcs(); }, () => client(c?.id))));
    };
    drawSvcs();
    $('[data-addsvc]', form).onclick = () => {
      const home = svcs[0]?.a || null;
      svcs.push({ id: uid(), name: '', a: home, b: null, price: null });
      drawSvcs();
      box.lastElementChild.querySelector(home ? '[data-pt=b]' : '[data-pt=a]').focus();
    };
    const doSave = (thenTrip) => {
      const f = new FormData(form);
      const x = { ...(c || { id: uid(), createdAt: Date.now() }), updatedAt: Date.now() };
      for (const k of ['name', 'phone', 'notes']) x[k] = f.get(k).trim();
      x.services = svcs.filter((sv) => sv.b || sv.name).map((sv) => ({ ...sv, name: sv.name || autoName(sv) }));
      if (c) Object.assign(c, x);
      else data.clients.push(x);
      sheet.close();
      if (onSaved) onSaved(x);
      else if (!c) location.hash = `#/cliente/${x.id}`;
      refresh();
      if (thenTrip) tripForm(null, { clientId: x.id });
      else toast('Guardado');
    };
    form.onsubmit = () => doSave(false);
    const go = $('[data-savego]', form);
    if (go) go.onclick = () => { if (form.reportValidity()) doSave(true); };
  });
}

const PAYS = [['', 'Me debe'], ['efectivo', 'Efectivo'], ['transferencia', 'Transferencia'], ['tarjeta', 'Tarjeta']];
const seg = (name, opts, val) => `<div class="seg" role="radiogroup">${opts.map(([v, l]) => `<label><input type="radio" name="${name}" value="${v}" ${v === val ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div>`;

// ---------- Punto A y punto B ----------
// Lugares ya usados (servicios y viajes) aparecen primero, sin internet.
function knownPlaces(clientId) {
  const out = new Map();
  const add = (p) => { if (p?.label && p.lat != null && !out.has(p.label)) out.set(p.label, p); };
  const cs = clientId ? [client(clientId)] : data.clients;
  cs.forEach((c) => (c?.services || []).forEach((sv) => { add(sv.a); add(sv.b); }));
  data.trips.filter((t) => !clientId || t.clientId === clientId).forEach((t) => { add(t.fromPt); add(t.toPt); });
  if (clientId) knownPlaces().forEach((p) => add(p));
  return [...out.values()];
}
const nearPoint = () => knownPlaces()[0] || null;
const autoName = (sv) => [sv.a?.label, sv.b?.label].map((l) => (l || '…').split(',')[0]).join(' → ');
const svcCtx = (sv) => ({ airport: isAirport(sv.a?.label, sv.b?.label) });
const svcPrice = (sv) => sv.price ?? (sv.km ? suggestPrice(sv.km, sv.min, svcCtx(sv)) : 0);
const fromService = (c, sv) => ({ clientId: c.id, from: sv.a?.label || '', to: sv.b?.label || '', fromPt: sv.a, toPt: sv.b, km: sv.km || '', min: sv.min || '', path: sv.path, price: svcPrice(sv) });

function placeInput(pt, which, placeholder, locate = false) {
  return `<div class="stop ${locate ? 'has-loc' : ''}"><span class="dot ${which}"></span><input data-pt="${which}" value="${esc(pt?.label || '')}" placeholder="${placeholder}" autocomplete="off" enterkeyhint="search">${locate ? `<button type="button" class="loc" data-loc aria-label="Usar mi ubicación">${icon('pin')}</button>` : ''}</div>`;
}
// Origen habitual del cliente: el que más usa; si no hay viajes, el de su primer servicio.
function usualFrom(id) {
  const c = client(id);
  if (!c) return null;
  const n = new Map();
  tripsOf(id).filter((x) => x.status !== 'cancelado' && x.fromPt?.label).sort(byWhen).forEach((x) => {
    const e = n.get(x.fromPt.label) || { p: x.fromPt, n: 0 };
    e.n++; e.p = x.fromPt; n.set(x.fromPt.label, e);
  });
  const best = [...n.values()].sort((a, b) => b.n - a.n)[0];
  return best?.p || (c.services || []).find((sv) => sv.a)?.a || null;
}
// Sugerencias al escribir; al elegir una, guarda el punto con sus coordenadas.
function wirePlace(input, clientId, onPick) {
  let timer, box;
  const close = () => { box?.remove(); box = null; };
  const show = (items, note) => {
    close();
    if (!items.length && !note) return;
    box = document.createElement('div');
    box.className = 'sugg';
    box.innerHTML = items.map((p, i) => `<button type="button" data-i="${i}"><span>${esc(p.label)}</span><small>${esc(p.sub || 'Usado antes')}</small></button>`).join('') + (note ? `<div class="g">${note}</div>` : '');
    box.onpointerdown = (e) => e.preventDefault();
    box.onclick = (e) => {
      const b = e.target.closest('[data-i]');
      if (!b) return;
      const p = items[+b.dataset.i];
      input.value = p.label;
      close();
      onPick({ label: p.label, lat: p.lat, lon: p.lon });
    };
    input.parentElement.append(box);
  };
  input.addEventListener('input', () => {
    onPick(null, true);
    clearTimeout(timer);
    const q = input.value.trim();
    if (!q) return close();
    const words = fold(q).split(/\s+/);
    const local = knownPlaces(typeof clientId === 'function' ? clientId() : clientId).filter((p) => words.every((w) => fold(p.label + ' ' + (p.sub || '')).includes(w))).slice(0, 3);
    show(local, q.length >= 3 ? 'Buscando en el mapa…' : '');
    if (q.length < 3) return;
    timer = setTimeout(async () => {
      try {
        const found = (await searchPlaces(q, nearPoint())).filter((r) => !local.some((l) => l.label === r.label));
        if (input.value.trim() !== q || document.activeElement !== input) return;
        show([...local, ...found].slice(0, 6), found.length ? 'Mapa: OpenStreetMap' : 'Sin resultados en el mapa. Agrega colonia o ciudad.');
      } catch {
        if (input.value.trim() === q) show(local, 'Sin conexión: puedes escribir la dirección y el precio a mano.');
      }
    }, 650);
  });
  input.addEventListener('blur', () => setTimeout(close, 150));
}
// Distancia, tiempo, mapa y precio sugerido de A a B.
async function fillRoute(el, a, b) {
  if (!a || !b) { el.innerHTML = '<div class="empty-route">Elige el punto A y el punto B de la lista para ver distancia, tiempo y precio.</div>'; return null; }
  el.innerHTML = '<div class="empty-route">Calculando ruta…</div>';
  try {
    const r = await route(a, b);
    el.innerHTML = `${mapSvg(r.path, `Ruta de ${esc(a.label)} a ${esc(b.label)}`)}
      <div class="stats"><div><small>Distancia</small><b>${r.km} km</b></div><div><small>Tiempo</small><b>${r.min} min</b></div><div class="price"><small>Sugerido</small><b>${money(suggestPrice(r.km, r.min, { airport: isAirport(a.label, b.label) }))}</b></div></div>
      <div class="how">${priceMath(r.km, r.min, { airport: isAirport(a.label, b.label) })} · <a href="${directionsLink(a, b)}" target="_blank" rel="noopener">Ver en Google Maps</a></div>`;
    return r;
  } catch {
    el.innerHTML = '<div class="empty-route">No se pudo calcular la ruta (¿sin internet?). Pon el precio a mano.</div>';
    return null;
  }
}

function serviceCard(sv, onRemove, getClient) {
  const el = document.createElement('section');
  el.className = 'svc';
  el.innerHTML = `<div class="svc-head"><b data-title>${esc(sv.name || 'Servicio nuevo')}</b><button type="button" data-rm>Quitar</button></div>
    <div class="route">${placeInput(sv.a, 'a', 'Punto A · ¿de dónde sale?')}${placeInput(sv.b, 'b', 'Punto B · ¿a dónde va?')}</div>
    <div data-route></div>
    <div class="price-row"><label><span>Tu precio $</span><input data-price type="number" inputmode="numeric" min="0" step="10" value="${sv.price ?? ''}" placeholder="${sv.km ? suggestPrice(sv.km, sv.min, svcCtx(sv)) : ''}"></label><small class="muted">vacío = sugerido</small></div>`;
  const titleEl = $('[data-title]', el);
  let auto = sv.name && sv.name === autoName(sv) ? sv.name : '';
  const priceIn = $('[data-price]', el);
  const routeEl = $('[data-route]', el);
  const update = async () => {
    const r = await fillRoute(routeEl, sv.a, sv.b);
    Object.assign(sv, r ? { km: r.km, min: r.min, path: r.path } : { km: '', min: '', path: null });
    priceIn.placeholder = r ? suggestPrice(r.km, r.min, svcCtx(sv)) : '';
    if (sv.a && sv.b && (!sv.name || sv.name === auto)) { sv.name = auto = autoName(sv); titleEl.textContent = sv.name; }
  };
  for (const which of ['a', 'b']) {
    wirePlace($(`[data-pt=${which}]`, el), getClient()?.id, (p, typing) => {
      sv[which] = p;
      if (!typing || !p) update();
    });
  }
  priceIn.oninput = () => { sv.price = priceIn.value === '' ? null : +priceIn.value; };
  $('[data-rm]', el).onclick = onRemove;
  if (sv.a && sv.b) {
    // Ya calculada: dibuja sin volver a pedir la ruta.
    if (sv.path) routeEl.innerHTML = `${mapSvg(sv.path)}<div class="stats"><div><small>Distancia</small><b>${sv.km} km</b></div><div><small>Tiempo</small><b>${sv.min} min</b></div><div class="price"><small>Sugerido</small><b>${money(suggestPrice(sv.km, sv.min, svcCtx(sv)))}</b></div></div><div class="how">${priceMath(sv.km, sv.min, svcCtx(sv))} · <a href="${directionsLink(sv.a, sv.b)}" target="_blank" rel="noopener">Ver en Google Maps</a></div>`;
    else update();
  } else fillRoute(routeEl, sv.a, sv.b);
  return el;
}

// Atajos de fecha y hora (Ahora · Hoy · Mañana).
const whenHtml = '<div class="chips wide" data-when><button type="button" data-w="now">Ahora</button><button type="button" data-w="0">Hoy</button><button type="button" data-w="1">Mañana</button></div>';
function wireWhen(form, onChange = () => {}) {
  const d = form.elements.date, tm = form.elements.time;
  const mark = () => form.querySelectorAll('[data-w]').forEach((b) => b.classList.toggle('on', (b.dataset.w === '0' && d.value === today()) || (b.dataset.w === '1' && d.value === addDays(today(), 1))));
  form.querySelectorAll('[data-w]').forEach((b) => (b.onclick = () => {
    if (b.dataset.w === 'now') { d.value = today(); tm.value = new Date().toTimeString().slice(0, 5); }
    else d.value = addDays(today(), +b.dataset.w);
    mark(); onChange();
  }));
  d.addEventListener('input', () => { mark(); onChange(); });
  mark();
}
const lastUse = (id) => Math.max(0, ...tripsOf(id).map((t) => t.updatedAt || t.createdAt || 0));

// Después de guardar un viaje: ofrece confirmarlo por WhatsApp o guardar la ruta repetida.
function tripToast(x, isNew) {
  const c = client(x.clientId);
  const learn = x.status === 'hecho' ? learnOffer(x) : null;
  if (learn) return toast('Guardado · ruta repetida', learn);
  if (isNew && x.status === 'agendado' && c?.phone) return toast('Viaje agendado', { label: 'Confirmar por WhatsApp', fn: () => window.open(waLink(c, MSG.confirm(c, x)), '_blank', 'noopener') });
  toast(isNew ? 'Viaje agendado' : 'Guardado');
}
// A la segunda vez que haces la misma ruta con un cliente, ofrece guardarla como servicio frecuente.
function learnOffer(t) {
  const c = client(t.clientId);
  if (!c || !t.fromPt?.label || !t.toPt?.label || t.status !== 'hecho') return null;
  c.services ||= [];
  if (c.services.some((sv) => sv.a?.label === t.fromPt.label && sv.b?.label === t.toPt.label)) return null;
  const n = tripsOf(c.id).filter((x) => x.status === 'hecho' && x.fromPt?.label === t.fromPt.label && x.toPt?.label === t.toPt.label).length;
  if (n !== 2) return null;
  return { label: 'Guardar ruta frecuente', fn: () => {
    const sv = { id: uid(), a: t.fromPt, b: t.toPt, km: t.km || '', min: t.min || '', path: t.path || null, price: +t.price || null };
    sv.name = autoName(sv);
    c.services.push(sv);
    c.updatedAt = Date.now();
    refresh();
    toast(`Ruta guardada en ${firstName(c)}`);
  } };
}

// Agendar en un paso: ya sabemos cliente, ruta y precio; solo falta cuándo.
function quickTrip(preset, title) {
  const c = client(preset.clientId);
  if (!c || !+preset.price) return tripForm(null, preset);
  const way = preset.from || preset.to ? `${preset.from || '…'} → ${preset.to || '…'}` : '';
  openSheet(`<h2>${esc(title)}</h2>
    <p class="field wide" style="font-weight:400">${esc(c.name)}${way ? ' · ' + esc(way) : ''} · <b>${money(preset.price)}</b></p>
    ${field('Fecha', `<input name="date" type="date" required value="${today()}">`)}
    ${field('Hora', `<input name="time" type="time" value="${esc(preset.time)}">`)}
    ${whenHtml}
    <div class="buttons"><button type="button" data-close>Cancelar</button><button type="button" data-more>Más opciones</button><button class="primary">Agendar</button></div>`, (form) => {
    $('[data-close]', form).onclick = () => sheet.close();
    wireWhen(form);
    const read = () => ({ ...preset, date: form.elements.date.value || today(), time: form.elements.time.value || '' });
    $('[data-more]', form).onclick = () => { const p = read(); sheet.close(); tripForm(null, p); };
    form.onsubmit = () => {
      const x = { id: uid(), createdAt: Date.now(), updatedAt: Date.now(), status: 'agendado', pay: '', notes: '', wait: '', ...read() };
      data.trips.push(x);
      sheet.close();
      refresh();
      tripToast(x, true);
    };
  });
}

function tripForm(t = null, preset = {}) {
  const v = { date: today(), status: 'agendado', pay: '', ...preset, ...(t || {}) };
  if (!v.clientId && data.clients.length === 1) v.clientId = data.clients[0].id;
  openSheet(`<h2>${t ? 'Editar viaje' : 'Nuevo viaje'}</h2>
    <div class="field wide">Cliente<div class="chips wrap" id="cchips"></div>${data.clients.length > 5 ? '<input data-cq type="search" placeholder="Buscar otro cliente" autocomplete="off" aria-label="Buscar cliente">' : ''}</div>
    <input type="hidden" name="clientId" value="${esc(v.clientId)}">
    ${field('Fecha', `<input name="date" type="date" required value="${esc(v.date)}">`)}
    ${field('Hora', `<input name="time" type="time" value="${esc(v.time)}">`)}
    ${whenHtml}
    <div class="chips wide" id="svcchips"></div>
    <div class="route wide">${placeInput(v.fromPt || (v.from ? { label: v.from } : null), 'a', 'Punto A · origen', true)}${placeInput(v.toPt || (v.to ? { label: v.to } : null), 'b', 'Punto B · destino')}</div>
    <small class="field wide muted" id="pnote"></small>
    <div class="wide svc" id="troute" hidden></div>
    ${field('Precio', `<input name="price" type="number" inputmode="decimal" step="1" min="0" required value="${esc(v.price)}">`, true)}
    <small class="field wide muted" id="hint"></small>
    <details class="opts" ${t ? 'open' : ''}><summary>Más opciones <small>km, espera, estado, notas</small></summary><div>
      ${field('Km', `<input name="km" type="number" inputmode="decimal" step="0.1" min="0" value="${esc(v.km)}">`)}
      ${data.settings.extra?.wait?.on ? field('Espera (min)', `<input name="wait" type="number" inputmode="numeric" min="0" step="5" value="${esc(v.wait)}">`) : ''}
      <span class="field wide">Estado</span>${seg('status', [['agendado', 'Agendado'], ['hecho', 'Hecho'], ['cancelado', 'Cancelado']], v.status)}
      <div class="wide" id="paybox" style="grid-column:1/-1;display:grid;gap:6px"><span class="field">Pago</span>${seg('pay', PAYS, v.pay || '')}</div>
      ${field('Notas', `<textarea name="notes" rows="2">${esc(v.notes)}</textarea>`, true)}
    </div></details>
    ${buttons(!!t)}`, (form) => {
    wireCommon(form, () => { data.trips = data.trips.filter((x) => x.id !== t.id); });
    const els = form.elements;
    const idIn = els.clientId;
    const hint = $('#hint', form);
    const paybox = $('#paybox', form);
    let priceTyped = !!t;
    els.price.addEventListener('input', () => { priceTyped = true; });
    const fromIn = $('[data-pt=a]', form);
    const toIn = $('[data-pt=b]', form);
    const rt = { fromPt: v.fromPt || null, toPt: v.toPt || null, min: v.min || '', path: v.path || null };
    const routeEl = $('#troute', form);
    const suggest = () => {
      const same = data.trips.filter((x) => x.clientId === idIn.value && x.id !== t?.id && x.status !== 'cancelado' && x.from === fromIn.value.trim() && x.to === toIn.value.trim() && (x.from || x.to)).sort(byWhen).pop();
      const km = +els.km.value;
      const min = +rt.min || Math.round(km * 2);
      const ctx = { airport: isAirport(fromIn.value, toIn.value), night: isNight(els.time.value), wait: +(els.wait?.value || 0) };
      const tips = [];
      if (same) tips.push(`La última vez: ${money(same.price)}`);
      if (km) tips.push(`Con tu tarifa: ${money(suggestPrice(km, min, ctx))} (${priceMath(km, min, ctx)})`);
      hint.textContent = tips.join(' · ');
      if (!priceTyped && (same || km)) els.price.value = same ? same.price : suggestPrice(km, min, ctx);
    };
    const checkPlaces = () => {
      const bad = (fromIn.value.trim() && !rt.fromPt) || (toIn.value.trim() && !rt.toPt);
      $('#pnote', form).textContent = bad ? 'Toca una opción de la lista para calcular ruta y precio, o escribe el precio a mano.' : '';
    };
    [fromIn, toIn].forEach((i) => i.addEventListener('blur', () => setTimeout(checkPlaces, 300)));
    const recalc = async () => {
      routeEl.hidden = !(rt.fromPt && rt.toPt);
      if (routeEl.hidden) { rt.min = ''; rt.path = null; return; }
      const r = await fillRoute(routeEl, rt.fromPt, rt.toPt);
      if (r) { els.km.value = r.km; rt.min = r.min; rt.path = r.path; suggest(); }
    };
    const cid = () => idIn.value;
    wirePlace(fromIn, cid, (p, typing) => { rt.fromPt = p; if (!typing || !p) { recalc(); suggest(); checkPlaces(); } });
    wirePlace(toIn, cid, (p, typing) => { rt.toPt = p; if (!typing || !p) { recalc(); suggest(); checkPlaces(); } });
    if (rt.fromPt && rt.toPt) {
      routeEl.hidden = false;
      if (rt.path) routeEl.innerHTML = `${mapSvg(rt.path)}<div class="how">${els.km.value} km · ${rt.min} min · <a href="${directionsLink(rt.fromPt, rt.toPt)}" target="_blank" rel="noopener">Ver en Google Maps</a></div>`;
      else recalc();
    }
    // Origen: el habitual del cliente, mientras no lo cambies a mano.
    let autoFrom = '';
    const prefillFrom = () => {
      if (t || (fromIn.value.trim() && fromIn.value !== autoFrom)) return;
      const p = usualFrom(idIn.value);
      if (!p) return;
      fromIn.value = autoFrom = p.label;
      rt.fromPt = p.lat != null ? { label: p.label, lat: p.lat, lon: p.lon } : null;
      recalc(); suggest();
    };
    // Mi ubicación como punto A.
    $('[data-loc]', form).onclick = () => {
      if (!navigator.geolocation) return toast('Tu teléfono no comparte la ubicación');
      toast('Buscando tu ubicación…');
      navigator.geolocation.getCurrentPosition(async ({ coords: { latitude: lat, longitude: lon } }) => {
        let p;
        try { const r = await reverse(lat, lon); p = { label: r.label, lat, lon }; } catch { p = { label: 'Mi ubicación', lat, lon }; }
        fromIn.value = p.label; autoFrom = ''; rt.fromPt = p;
        recalc(); suggest(); checkPlaces();
      }, () => toast('No se pudo obtener tu ubicación'), { enableHighAccuracy: true, timeout: 10000 });
    };
    // Servicios frecuentes del cliente: un toque llena A, B y precio.
    const fillPlaces = () => {
      const svs = client(idIn.value)?.services || [];
      const chips = $('#svcchips', form);
      chips.innerHTML = svs.map((sv) => `<button type="button" data-sv="${sv.id}">${esc(sv.name || autoName(sv))}</button>`).join('');
      chips.hidden = !svs.length;
      chips.querySelectorAll('[data-sv]').forEach((b) => (b.onclick = () => {
        const sv = svs.find((x) => x.id === b.dataset.sv);
        const f = fromService(client(idIn.value), sv);
        fromIn.value = f.from; toIn.value = f.to; autoFrom = '';
        Object.assign(rt, { fromPt: f.fromPt, toPt: f.toPt, min: f.min, path: f.path });
        els.km.value = f.km; els.price.value = f.price; priceTyped = true;
        chips.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
        routeEl.hidden = !(f.fromPt && f.toPt);
        if (f.path) routeEl.innerHTML = `${mapSvg(f.path)}<div class="how">${f.km} km · ${f.min} min · <a href="${directionsLink(f.fromPt, f.toPt)}" target="_blank" rel="noopener">Ver en Google Maps</a></div>`;
        hint.textContent = `Servicio frecuente: ${money(f.price)}`;
        checkPlaces();
      }));
    };
    // Cliente: los más recientes a un toque; con muchos clientes, buscador.
    const cchips = $('#cchips', form);
    const cq = $('[data-cq]', form);
    const drawClients = () => {
      const q = fold(cq?.value || '').trim();
      let list = q
        ? data.clients.filter((c) => fold(c.name + ' ' + (c.phone || '')).includes(q)).slice(0, 8)
        : [...data.clients].sort((a, b) => lastUse(b.id) - lastUse(a.id) || a.name.localeCompare(b.name, 'es')).slice(0, 5);
      const cur = client(idIn.value);
      if (cur && !q && !list.includes(cur)) list = [cur, ...list];
      cchips.innerHTML = list.map((c) => `<button type="button" data-c="${c.id}" class="${c.id === idIn.value ? 'on' : ''}">${esc(c.name)}</button>`).join('') + '<button type="button" data-newc>＋ Nuevo</button>';
    };
    const setClient = (id) => {
      idIn.value = id;
      if (cq) cq.value = '';
      drawClients(); fillPlaces(); prefillFrom(); suggest();
    };
    cchips.onclick = (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.newc) clientForm(null, { onSaved: (c) => tripForm(null, { ...readForm(), clientId: c.id }) });
      else setClient(b.dataset.c);
    };
    cq?.addEventListener('input', drawClients);
    const showPay = () => { paybox.hidden = form.querySelector('[name=status]:checked').value !== 'hecho'; };
    form.querySelectorAll('[name=status]').forEach((r) => (r.onchange = showPay));
    els.km.addEventListener('input', () => { rt.min = ''; suggest(); });
    els.time.addEventListener('input', suggest);
    els.wait?.addEventListener('input', suggest);
    wireWhen(form, suggest);
    drawClients(); fillPlaces(); prefillFrom(); suggest(); showPay();
    function readForm() {
      const f = new FormData(form);
      return {
        clientId: f.get('clientId'), date: f.get('date'), time: f.get('time') || '',
        from: fromIn.value.trim(), to: toIn.value.trim(), fromPt: rt.fromPt, toPt: rt.toPt, km: f.get('km'), min: rt.min, path: rt.path, wait: f.get('wait') || '',
        price: +f.get('price') || 0,
        status: f.get('status'), pay: f.get('status') === 'hecho' ? f.get('pay') || '' : '', notes: f.get('notes').trim(),
      };
    }
    form.onsubmit = (e) => {
      const x = { ...(t || { id: uid(), createdAt: Date.now() }), ...readForm(), updatedAt: Date.now() };
      if (!client(x.clientId)) { e.preventDefault(); toast('Elige un cliente'); return; }
      if (t) Object.assign(t, x);
      else data.trips.push(x);
      sheet.close();
      refresh();
      tripToast(x, !t);
    };
  });
  // Sin clientes: primero se crea uno y luego se agenda su viaje.
  if (!data.clients.length) { sheet.close(); clientForm(null, { onSaved: (c) => tripForm(null, { ...preset, clientId: c.id }) }); }
}

// ---------- Cobro en un toque ----------
const PAY_LABEL = { efectivo: 'Efectivo', transferencia: 'Transferencia', tarjeta: 'Tarjeta' };
// Botones de forma de pago; la habitual del cliente va primero.
function payGrid(c, { debt = false } = {}) {
  const order = Object.keys(PAY_LABEL);
  const hab = c?.lastPay && PAY_LABEL[c.lastPay] ? c.lastPay : '';
  if (hab) { order.splice(order.indexOf(hab), 1); order.unshift(hab); }
  return `<div class="paygrid">${order.map((k) => `<button type="button" data-pay="${k}" class="${k === hab ? 'hab' : ''}">${PAY_LABEL[k]}${k === hab ? '<small>habitual</small>' : ''}</button>`).join('')}${debt ? '<button type="button" data-pay="" class="debt">Me debe</button>' : ''}</div>`;
}

// Terminar un viaje: un toque en cómo te pagó y listo.
function finishForm(t) {
  const c = client(t.clientId);
  openSheet(`<h2>Terminar viaje</h2>
    <p class="field wide" style="font-weight:400">${esc(c?.name)} · ${money(t.price)}</p>
    <span class="field wide">¿Cómo te pagó? <small>un toque y listo</small></span>${payGrid(c, { debt: true })}
    <div class="buttons"><button type="button" data-close>Cancelar</button></div>`, (form) => {
    $('[data-close]', form).onclick = () => sheet.close();
    form.querySelectorAll('[data-pay]').forEach((b) => (b.onclick = () => {
      const pay = b.dataset.pay;
      Object.assign(t, { status: 'hecho', pay, updatedAt: Date.now() });
      if (pay && c) c.lastPay = pay;
      sheet.close();
      refresh();
      const offer = learnOffer(t);
      toast(offer ? 'Viaje terminado · ruta repetida' : pay ? 'Viaje terminado' : 'Anotado en Cobros', offer);
    }));
  });
}
function payForm(list) {
  const total = list.reduce((s, t) => s + +t.price, 0);
  const c = client(list[0].clientId);
  openSheet(`<h2>Registrar pago</h2>
    <p class="field wide" style="font-weight:400">${esc(c?.name)} · ${list.length} viaje${list.length === 1 ? '' : 's'} · ${money(total)}</p>
    ${payGrid(c)}
    <div class="buttons"><button type="button" data-close>Cancelar</button></div>`, (form) => {
    $('[data-close]', form).onclick = () => sheet.close();
    form.querySelectorAll('[data-pay]').forEach((b) => (b.onclick = () => {
      const pay = b.dataset.pay;
      for (const t of list) Object.assign(t, { pay, paidAt: today(), updatedAt: Date.now() });
      if (c) c.lastPay = pay;
      sheet.close();
      refresh();
      toast('Cobrado');
    }));
  });
}

// ---------- Inicio ----------
render();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');

// ---------- Semana completa ----------
function daysLabel(days) {
  const set = WEEK_ORDER.filter((d) => days.includes(d));
  if (set.length === 7) return 'todos los días';
  if (set.join() === '1,2,3,4,5') return 'L–V';
  if (set.join() === '1,2,3,4,5,6') return 'L–S';
  return set.map((d) => DAYS.find((x) => x[0] === d)[1]).join(' ');
}
// Clientes con rutina semanal cuya próxima semana aún no está agendada (se avisa de jueves a domingo).
function weekNudges() {
  const dn = new Date().getDay();
  if (!(dn === 0 || dn >= 4)) return [];
  const next = addDays(mondayOf(today()), 7);
  return data.clients
    .filter((c) => c.week?.items?.length && c.weekSnooze !== next && !tripsOf(c.id).some((t) => t.status !== 'cancelado' && t.date >= next && t.date <= addDays(next, 6)))
    .map((c) => ({ c, next }));
}
// Viajes que se pueden poner en la rutina: sus servicios o, si no tiene, las rutas que ya hizo.
function weekCandidates(c) {
  if ((c.services || []).length) return c.services.map((sv) => ({ key: sv.id, label: sv.name || autoName(sv), time: '', ...fromService(c, sv) }));
  const seen = new Map();
  tripsOf(c.id).filter((t) => t.status === 'hecho' && (t.from || t.to)).sort(byWhen).reverse().forEach((t) => {
    const key = `${t.from}|${t.to}`;
    if (!seen.has(key) && seen.size < 6) seen.set(key, { key, label: shortRoute(t.from, t.to), time: t.time || '', clientId: c.id, from: t.from, to: t.to, fromPt: t.fromPt, toPt: t.toPt, km: t.km, min: t.min, path: t.path, price: t.price });
  });
  return [...seen.values()];
}
function weekForm(c, { start } = {}) {
  const cands = weekCandidates(c);
  if (!cands.length) { toast('Primero agrega un servicio frecuente'); clientForm(c); return; }
  const saved = c.week || {};
  const dn = new Date().getDay();
  const defStart = start || (dn === 0 || dn >= 4 ? 'next' : 'this');
  const days = new Set(saved.days || [1, 2, 3, 4, 5, 6]);
  const pick = (x) => (saved.items ? saved.items.find((i) => i.key === x.key) : { time: x.time });
  openSheet(`<h2>Agendar semana · ${esc(firstName(c))}</h2>
    <span class="field wide">Viajes de cada día <small>marca y pon la hora</small></span>
    <div class="wide picks">${cands.map((x, i) => `<div class="pick"><label><input type="checkbox" data-i="${i}" ${pick(x) ? 'checked' : ''}><span><b>${esc(x.label)}</b><small>${money(x.price)}</small></span></label><input type="time" data-t="${i}" value="${esc(pick(x)?.time || '')}" aria-label="Hora"></div>`).join('')}</div>
    <span class="field wide">Días</span>
    <div class="chips wide" id="wdays">${DAYS.map(([d, l]) => `<button type="button" data-day="${d}" class="${days.has(d) ? 'on' : ''}">${l}</button>`).join('')}</div>
    <span class="field wide">Empezar</span>${seg('start', [['this', 'Esta semana'], ['next', 'La próxima']], defStart)}
    <span class="field wide">Semanas</span>${seg('weeks', [['1', '1'], ['2', '2'], ['3', '3'], ['4', '4']], '1')}
    <p class="wide total" id="wsum"></p>
    <div class="buttons"><button type="button" data-close>Cancelar</button><button class="primary">Agendar</button></div>`, (form) => {
    $('[data-close]', form).onclick = () => sheet.close();
    const checks = [...form.querySelectorAll('[data-i]')];
    const times = [...form.querySelectorAll('[data-t]')];
    const plan = () => {
      const items = cands.map((x, i) => ({ x, on: checks[i].checked, time: times[i].value })).filter((i) => i.on);
      const mon = mondayOf(today());
      const base = form.querySelector('[name=start]:checked').value === 'next' ? addDays(mon, 7) : mon;
      const weeks = +form.querySelector('[name=weeks]:checked').value;
      const all = [];
      for (let w = 0; w < weeks; w++) {
        for (const d of WEEK_ORDER) {
          if (!days.has(d)) continue;
          const date = addDays(base, w * 7 + ((d + 6) % 7));
          if (date < today()) continue;
          for (const { x, time } of items) all.push({ clientId: c.id, date, time, from: x.from, to: x.to, fromPt: x.fromPt, toPt: x.toPt, km: x.km, min: x.min, path: x.path, price: x.price });
        }
      }
      const exists = (o) => data.trips.some((t) => t.clientId === c.id && t.status !== 'cancelado' && t.date === o.date && (t.time || '') === (o.time || '') && t.from === o.from && t.to === o.to);
      const fresh = all.filter((o) => !exists(o));
      return { items, fresh, dup: all.length - fresh.length };
    };
    const sum = () => {
      const { fresh, dup } = plan();
      $('#wsum', form).textContent = fresh.length
        ? `${fresh.length} viaje${fresh.length === 1 ? '' : 's'} · ${money(fresh.reduce((s, o) => s + +o.price, 0))}${dup ? ` · ${dup} ya estaban agendados` : ''}`
        : dup ? 'Todo eso ya está agendado' : 'Marca al menos un viaje y un día';
    };
    form.querySelectorAll('#wdays button').forEach((b) => (b.onclick = () => {
      const d = +b.dataset.day;
      if (days.has(d)) days.delete(d); else days.add(d);
      b.classList.toggle('on', days.has(d));
      sum();
    }));
    form.addEventListener('input', sum);
    form.addEventListener('change', sum);
    sum();
    form.onsubmit = (e) => {
      const { items, fresh } = plan();
      if (!fresh.length) { e.preventDefault(); toast('No hay viajes nuevos que agendar'); return; }
      const made = fresh.sort(byWhen).map((o) => ({ id: uid(), createdAt: Date.now(), updatedAt: Date.now(), status: 'agendado', pay: '', notes: '', wait: '', ...o }));
      data.trips.push(...made);
      c.week = { days: WEEK_ORDER.filter((d) => days.has(d)), items: items.map((i) => ({ key: i.x.key, time: i.time })) };
      sheet.close();
      refresh();
      toast(`${made.length} viaje${made.length === 1 ? '' : 's'} agendados`, c.phone ? { label: 'Avisar por WhatsApp', fn: () => window.open(waLink(c, MSG.week(c, made)), '_blank', 'noopener') } : undefined);
    };
  });
}

// ---------- Cobrar a tu ritmo ----------
// Marcas qué viajes te pagó (o escribes cuánto te dio y se marcan los más antiguos).
function collectForm(c) {
  const list = tripsOf(c.id).filter(owed).sort(byWhen);
  if (!list.length) { toast('No hay nada pendiente'); return; }
  openSheet(`<h2>Cobrar a ${esc(firstName(c))}</h2>
    <div class="wide picks">${list.map((t) => `<label class="pick row"><input type="checkbox" data-id="${t.id}" checked><span><b>${cap(fdate(t.date))}${t.time ? ' · ' + hour12(t.time) : ''}</b><small>${esc(shortRoute(t.from, t.to))}</small></span><em>${money(t.price)}</em></label>`).join('')}</div>
    ${field('Me pagó (opcional)', '<input name="amt" type="number" inputmode="decimal" min="0" step="1" placeholder="Ej. 300 · marca los más antiguos">', true)}
    <p class="wide total" id="ctot"></p>
    <span class="field wide">¿Cómo te pagó? <small>un toque cobra lo marcado</small></span>${payGrid(c)}
    <div class="buttons"><button type="button" data-close>Cancelar</button></div>`, (form) => {
    $('[data-close]', form).onclick = () => sheet.close();
    const checks = [...form.querySelectorAll('[data-id]')];
    const price = (ch) => +list.find((t) => t.id === ch.dataset.id).price;
    let left = 0;
    const tot = () => {
      const on = checks.filter((ch) => ch.checked);
      const amt = +form.elements.amt.value;
      $('#ctot', form).textContent = `Marcado: ${money(on.reduce((s, ch) => s + price(ch), 0))} · ${on.length} de ${list.length}${amt && left > 0 ? ` · sobran ${money(left)}` : ''}`;
    };
    form.elements.amt.addEventListener('input', () => {
      left = +form.elements.amt.value;
      if (!left) { checks.forEach((ch) => (ch.checked = true)); tot(); return; }
      let stop = false;
      checks.forEach((ch) => { if (!stop && price(ch) <= left) { ch.checked = true; left -= price(ch); } else { stop = true; ch.checked = false; } });
      tot();
    });
    checks.forEach((ch) => ch.addEventListener('change', () => { left = 0; tot(); }));
    tot();
    form.querySelectorAll('[data-pay]').forEach((b) => (b.onclick = () => {
      const picked = checks.filter((ch) => ch.checked).map((ch) => list.find((t) => t.id === ch.dataset.id));
      if (!picked.length) { toast('Marca al menos un viaje'); return; }
      const pay = b.dataset.pay;
      for (const t of picked) Object.assign(t, { pay, paidAt: today(), updatedAt: Date.now() });
      c.lastPay = pay;
      sheet.close();
      refresh();
      const rest = debtOf(c.id);
      toast(`Cobrado ${money(picked.reduce((s, t) => s + +t.price, 0))}${rest ? ` · le quedan ${money(rest)}` : ' · al día'}`);
    }));
  });
}

// ---------- Mi página de conductor (QR) ----------
const b64u = (bytes) => { let b = ''; for (const x of bytes) b += String.fromCharCode(x); return btoa(b).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
// Los datos viajan dentro del enlace (sin servidor); se comprimen cuando el navegador puede.
async function encodePage(obj) {
  const raw = new TextEncoder().encode(JSON.stringify(obj));
  let best = 'j' + b64u(raw);
  if ('CompressionStream' in window) {
    try {
      const z = new Uint8Array(await new Response(new Blob([raw]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer());
      const c = 'z' + b64u(z);
      if (c.length < best.length) best = c;
    } catch {}
  }
  return best;
}
function pagePayload(s) {
  const o = s.share;
  const p = { n: s.driver.trim(), c: (s.city || '').trim(), w: phoneIntl(s.phone) };
  if (o.auto && s.car) p.a = [s.car, s.year, s.color, s.seats, s.extras];
  const routes = o.routes.filter((r) => r.label.trim() && +r.price > 0);
  if (o.routesOn && routes.length) p.r = routes.map((r) => [r.label.trim(), Math.round(+r.price)]);
  p.p = s.pays;
  if (o.clabe && s.pays.includes('Transferencia') && s.clabe && s.holder.trim()) p.b = [s.bank, s.holder.trim(), s.clabe.replace(/\s/g, '')];
  if (o.hours.trim()) p.h = o.hours.trim();
  return p;
}
function qrSvg(qr) {
  const n = qr.getModuleCount(), m = 4;
  let d = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c + m} ${r + m}h1v1h-1z`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n + 2 * m} ${n + 2 * m}" shape-rendering="crispEdges" role="img" aria-label="Código QR de mi página"><rect width="100%" height="100%" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
}
function qrBlob(qr, title) {
  const n = qr.getModuleCount(), m = 4, W = 900, H = 1060;
  const cell = Math.floor(780 / (n + 2 * m));
  const size = cell * (n + 2 * m);
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#000';
  const x0 = (W - size) / 2 + m * cell, y0 = 50 + m * cell;
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) g.fillRect(x0 + c * cell, y0 + r * cell, cell, cell);
  g.textAlign = 'center';
  g.font = '700 54px system-ui, sans-serif';
  g.fillText(title, W / 2, 50 + size + 90, W - 60);
  g.font = '500 34px system-ui, sans-serif';
  g.fillStyle = '#444';
  g.fillText('Escanea para pedir tu viaje', W / 2, 50 + size + 140, W - 60);
  return new Promise((res) => cv.toBlob(res, 'image/png'));
}
function shareSheet() {
  const s = data.settings;
  if (!s.driver.trim()) { toast('Escribe tu nombre en tu perfil'); return; }
  const o = s.share;
  const hasBank = s.pays.includes('Transferencia') && !!s.clabe;
  const pageUrl = (code) => { const u = new URL('p.html', location.href); u.hash = code; return u.href; };
  openSheet(`<h2>Mi página de conductor</h2>
    <div class="wide qrbox"><div id="qr" class="qrimg"></div><small id="qrnote" class="muted"></small></div>
    <div class="wide shbtns"><button type="button" data-copylink>Copiar enlace</button><button type="button" data-sharelink>Compartir</button><button type="button" data-dlqr>Descargar QR</button></div>
    <a class="wide ghost" data-open target="_blank" rel="noopener">Ver cómo se ve mi página →</a>
    <span class="field wide">Qué mostrar</span>
    ${s.car ? `<label class="sw wide"><input type="checkbox" data-o="auto" ${o.auto ? 'checked' : ''}><span>Mi auto<small>Modelo, año, color y pasajeros. Sin placas.</small></span></label>` : ''}
    <label class="sw wide"><input type="checkbox" data-o="routesOn" ${o.routesOn ? 'checked' : ''}><span>Precios de referencia<small>Tú escribes las rutas y el precio</small></span></label>
    <div class="wide" id="routes"></div>
    ${hasBank ? `<label class="sw wide"><input type="checkbox" data-o="clabe" ${o.clabe ? 'checked' : ''}><span>Datos para transferencia<small>${esc(s.bank || 'Banco')} · ${esc(s.clabe)}</small></span></label>
      <label class="field wide" id="holderbox">Nombre completo del titular<input class="plain" name="holder" value="${esc(s.holder)}" placeholder="Como aparece en tu cuenta" autocomplete="name"></label>`
      : '<p class="wide muted" style="margin:0;font-size:13px">Para mostrar tu CLABE, elige «Transferencia» y guárdala en <a href="#/perfil" data-editpay>Cómo cobro</a>.</p>'}
    <label class="field wide">Horario <small>(opcional)</small><input class="plain" name="hours" value="${esc(o.hours)}" placeholder="Ej. Lun–Sáb, 6 am a 10 pm"></label>
    <div class="buttons"><button class="primary">Listo</button></div>`, (form) => {
    const state = { url: '', qr: null };
    const routesBox = $('#routes', form);
    const drawRoutes = () => {
      if (o.routesOn && !o.routes.length) o.routes.push({ label: '', price: '' });
      routesBox.hidden = !o.routesOn;
      routesBox.innerHTML = o.routes.map((r, i) => `<div class="rrow"><input class="plain" data-rl="${i}" value="${esc(r.label)}" placeholder="Ej. Aeropuerto → Centro"><input class="plain" data-rp="${i}" type="number" inputmode="decimal" min="0" value="${esc(r.price)}" placeholder="$"><button type="button" data-rx="${i}" aria-label="Quitar">✕</button></div>`).join('')
        + (o.routes.length < 8 ? '<button type="button" class="add" data-addroute>＋ Agregar ruta</button>' : '');
    };
    let timer;
    const update = () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        const payload = pagePayload(s);
        const url = pageUrl(await encodePage(payload));
        state.url = url;
        $('[data-open]', form).href = url;
        const note = [];
        try {
          const qr = qrcode(0, 'M');
          qr.addData(url);
          qr.make();
          state.qr = qr;
          $('#qr', form).innerHTML = qrSvg(qr);
          if (url.length > 900) note.push('El QR quedó muy denso; quita datos si cuesta escanearlo.');
        } catch {
          state.qr = null;
          $('#qr', form).innerHTML = '';
          note.push('Hay demasiados datos para un QR. Quita rutas o el horario.');
        }
        if (o.clabe && hasBank && !s.holder.trim()) note.push('Falta tu nombre completo: sin él no se muestra la CLABE.');
        $('#qrnote', form).textContent = note.join(' ');
      }, 200);
    };
    const persist = () => { save(); update(); };
    form.addEventListener('change', (e) => {
      const k = e.target.dataset.o;
      if (!k) return;
      o[k] = e.target.checked;
      if (k === 'routesOn') { if (o.routesOn && !o.routes.length) o.routes.push({ label: '', price: '' }); drawRoutes(); }
      persist();
    });
    form.addEventListener('input', (e) => {
      const t = e.target;
      if (t.dataset.rl != null) o.routes[+t.dataset.rl].label = t.value;
      else if (t.dataset.rp != null) o.routes[+t.dataset.rp].price = t.value;
      else if (t.name === 'holder') s.holder = t.value;
      else if (t.name === 'hours') o.hours = t.value;
      else return;
      persist();
    });
    form.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.addroute != null) { o.routes.push({ label: '', price: '' }); drawRoutes(); routesBox.querySelector('.rrow:last-of-type input')?.focus(); }
      else if (b.dataset.rx != null) { o.routes.splice(+b.dataset.rx, 1); drawRoutes(); persist(); }
    });
    $('[data-editpay]', form)?.addEventListener('click', (e) => { e.preventDefault(); sheet.close(); editProfile(4); });
    $('[data-copylink]', form).onclick = async () => { try { await navigator.clipboard.writeText(state.url); toast('Enlace copiado'); } catch { toast('No se pudo copiar'); } };
    $('[data-sharelink]', form).onclick = async () => {
      if (!navigator.share) { try { await navigator.clipboard.writeText(state.url); toast('Enlace copiado'); } catch { toast('No se pudo compartir'); } return; }
      try { await navigator.share({ title: `${s.driver} · Conductor privado`, text: 'Pide tu viaje conmigo', url: state.url }); } catch {}
    };
    $('[data-dlqr]', form).onclick = async () => {
      if (!state.qr) { toast('No hay QR para descargar'); return; }
      const blob = await qrBlob(state.qr, s.driver.trim());
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `QR-${s.driver.trim().split(/\s+/)[0] || 'conductor'}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    };
    form.onsubmit = () => { save(); };
    sheet.addEventListener('close', () => { save(); refresh(); }, { once: true });
    drawRoutes();
    update();
  });
}

