// Cartera: clientes privados del conductor (agenda, viajes, cobros y WhatsApp).
// Todo se guarda en este teléfono (localStorage). Sin build ni dependencias.
import { searchPlaces, route, directionsLink, mapSvg } from './maps.js';

// ---------- Datos ----------
const KEY = 'cartera';
const EXTRA_DEF = { base: { on: false, v: 30 }, minimum: { on: true, v: 100 }, airport: { on: false, v: 50 }, night: { on: false, v: 20 }, wait: { on: false, v: 3 } };
const DEFAULTS = { clients: [], trips: [], settings: {
  onboarded: false, driver: '', phone: '', city: '', lada: '52',
  car: '', year: '', color: '', plates: '', seats: 4, extras: [],
  perKm: 12, perHour: 180, extra: EXTRA_DEF,
  pays: ['Efectivo'], bank: '', clabe: '',
} };
let data = load();
function load() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY));
    if (d) {
      const s = { ...structuredClone(DEFAULTS.settings), ...d.settings };
      // Tarifa anterior (banderazo + km + minuto) → por km y por hora, como en CHECA.
      if (d.settings && d.settings.perHour == null) {
        s.perHour = 180;
        s.extra = { ...structuredClone(EXTRA_DEF), base: { on: !!d.settings.base, v: +d.settings.base || 30 }, minimum: { on: true, v: +d.settings.minimum || 100 } };
        if (d.settings.bank && !d.settings.clabe) Object.assign(s, { clabe: d.settings.bank, bank: '', pays: ['Efectivo', 'Transferencia'] });
        delete s.base; delete s.perMin; delete s.minimum;
      }
      s.extra = { ...structuredClone(EXTRA_DEF), ...s.extra };
      return { ...DEFAULTS, ...d, settings: s };
    }
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
const payTo = () => { const s = data.settings; return (s.pays || []).includes('Transferencia') && s.clabe ? [s.bank, s.clabe].filter(Boolean).join(' ') : ''; };
const sign = () => (data.settings.driver ? `\n— ${data.settings.driver}` : '');
const MSG = {
  confirm: (c, t) => `Hola ${firstName(c)}, te confirmo tu viaje ${dayLabel(t.date)}${t.time ? ' a las ' + hour12(t.time) : ''}${t.from || t.to ? `: ${t.from || '…'} → ${t.to || '…'}` : ''}. Costo ${money(t.price)}. ¡Gracias!${sign()}`,
  arrived: (c, t) => `Hola ${firstName(c)}, ya estoy afuera${t.from ? ' en ' + t.from : ''}. 🚗`,
  charge: (c, list) => `Hola ${firstName(c)}, te comparto lo pendiente:\n${list.map((t) => `• ${fdate(t.date, { day: 'numeric', month: 'short' })}${t.to ? ' · ' + (t.from ? t.from + ' → ' : '') + t.to : ''}: ${money(t.price)}`).join('\n')}\nTotal: ${money(list.reduce((s, t) => s + +t.price, 0))}.${payTo() ? `\nTransferencia: ${payTo()}` : ''}\n¡Gracias!${sign()}`,
  hello: (c) => `Hola ${firstName(c)}, ¿cómo estás? Te recuerdo que sigo a tus órdenes para tus viajes. Cuando lo necesites, escríbeme y lo agendamos.${sign()}`,
};

// ---------- Tarifa (como CHECA: meta por km y por hora; se usa la que deje más) ----------
const numOr = (v, d) => (v === '' || v == null || isNaN(+v) ? d : +v);
const EXTRAS_INFO = [
  ['base', 'Banderazo', '$', 'Se suma a cada viaje'],
  ['minimum', 'Viaje mínimo', '$', 'Ningún viaje cuesta menos'],
  ['airport', 'Extra aeropuerto', '$', 'Si el viaje sale o llega al aeropuerto'],
  ['night', 'Tarifa nocturna', '%', 'De 10 pm a 6 am'],
  ['wait', 'Tiempo de espera', '$/min', 'Lo agregas en el viaje si te hacen esperar'],
];
const PRESETS = { 'Económica': [9, 150], 'Estándar': [12, 180], 'Ejecutiva': [16, 250] };
const isAirport = (...labels) => labels.some((l) => /aeropuerto|airport/i.test(l || ''));
const isNight = (time) => !!time && (+time.slice(0, 2) >= 22 || +time.slice(0, 2) < 6);
function quote(km, min, { airport = false, night = false, wait = 0 } = {}, s = data.settings) {
  const X = s.extra || EXTRA_DEF, lines = [];
  const byKm = km * numOr(s.perKm, 12), byHour = (min / 60) * numOr(s.perHour, 180);
  let p = Math.max(byKm, byHour);
  lines.push([`Por km · ${km} km × $${s.perKm}`, byKm, byKm >= byHour], [`Por hora · ${min} min a $${s.perHour}/h`, byHour, byHour > byKm]);
  if (X.base.on) { p += +X.base.v; lines.push(['Banderazo', +X.base.v, true]); }
  if (X.airport.on && airport) { p += +X.airport.v; lines.push(['Extra aeropuerto', +X.airport.v, true]); }
  if (X.wait.on && wait) { p += wait * X.wait.v; lines.push([`Espera · ${wait} min`, wait * X.wait.v, true]); }
  if (X.night.on && night) { const n = (p * X.night.v) / 100; p += n; lines.push([`Nocturna +${X.night.v}%`, n, true]); }
  let total = Math.round(p / 10) * 10;
  if (X.minimum.on && total < +X.minimum.v) { total = +X.minimum.v; lines.push(['Sube al viaje mínimo', total, true]); }
  return { total, lines };
}
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
    <section class="tiles">
      <div class="tile"><small>Viajes</small><b>${done.length}</b><span>${last ? 'último ' + dayLabel(last.date) : '—'}</span></div>
      <div class="tile"><small>Total</small><b>${money(done.reduce((s, t) => s + +t.price, 0))}</b><span>${done.length ? 'prom. ' + money(done.reduce((s, t) => s + +t.price, 0) / done.length) : '—'}</span></div>
      <div class="tile ${debt ? 'warn' : ''}"><small>Me debe</small><b>${money(debt)}</b><span>${debt ? `<a href="#/cobros">cobrar</a>` : 'al día'}</span></div>
    </section>
    ${(c.services || []).length ? `<p class="group"><span>Sus servicios</span><em>agendar en un toque</em></p>
      <div class="qs">${c.services.map((sv) => `<div class="q"><b>${esc(sv.name || 'Servicio')}</b><small>${esc(sv.a?.label || '…')} → ${esc(sv.b?.label || '…')}</small>
        <span class="meta">${sv.km ? `${sv.km} km · ${sv.min} min · ` : ''}<span class="amt">${money(svcPrice(sv))}</span></span><button data-book="${sv.id}">Agendar</button></div>`).join('')}</div>` : ''}
    ${c.places || c.rate || c.notes ? `<section class="card"><dl class="kv">
      ${c.places ? `<dt>Lugares</dt><dd>${esc(c.places)}</dd>` : ''}
      ${c.rate ? `<dt>Tarifa</dt><dd>${esc(c.rate)}</dd>` : ''}
      ${c.notes ? `<dt>Notas</dt><dd>${esc(c.notes)}</dd>` : ''}</dl></section>` : ''}
    ${c.phone && sleeping(c) && done.length ? `<a class="card wa" style="display:block" href="${waLink(c, MSG.hello(c))}" target="_blank" rel="noopener">${icon('wa')} Lleva más de 30 días sin viajar. Mándale un saludo →</a>` : ''}
    <p class="group"><span>Historial</span><em>${trips.length}</em></p>
    ${trips.length ? trips.map((t) => tripCard(t, { showDate: true, showClient: false })).join('') : '<div class="card muted">Aún no hay viajes con este cliente.</div>'}`;
  $('[data-new]', view).onclick = () => tripForm(null, { clientId: id });
  view.querySelectorAll('[data-book]').forEach((b) => (b.onclick = () => tripForm(null, fromService(c, c.services.find((x) => x.id === b.dataset.book)))));
  const rep = $('[data-repeat]', view);
  if (last) rep.onclick = () => tripForm(null, { clientId: id, from: last.from, to: last.to, fromPt: last.fromPt, toPt: last.toPt, price: last.price, time: last.time, km: last.km, min: last.min, path: last.path });
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
    ${D.pays.includes('Transferencia') ? `<div class="row2">${pin('bank', 'Banco', D.bank, 'placeholder="Ej. BBVA"')}${pin('clabe', 'CLABE o tarjeta', D.clabe, 'inputmode="numeric"')}</div>` : ''}
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
      <button class="cta primary" data-go="1">Empezar · 2 minutos</button>
      <button class="skip" data-backup>Ya tengo una copia de mis datos</button></section>`;
  } else if (n <= 4) {
    view.innerHTML = `<section class="ob"><div class="progress">${PROFILE_STEPS.map((_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</div>
      <span class="steplabel">Paso ${n} de 4 · ${PROFILE_STEPS[n - 1]}</span>
      <div class="pstep">${stepHtml(n, D)}</div>
      <div class="nav"><button type="button" data-go="${n - 1}">Atrás</button><button type="button" class="primary" data-go="${n + 1}">${n === 4 ? 'Terminar' : 'Siguiente'}</button></div></section>`;
    wireStep($('.pstep', view), D, renderOnboarding);
  } else {
    view.innerHTML = `<section class="ob"><div class="done"><span class="mark">${icon('check')}</span>
      <h2>¡Listo${D.driver ? ', ' + esc(D.driver) : ''}!</h2>
      <p class="muted">Tu perfil y tu tarifa quedaron guardados. Ahora agrega a tus clientes.</p></div>
      <button class="cta primary" data-finish="client">＋ Agregar mi primer cliente</button>
      ${'contacts' in navigator ? '<button class="cta" data-finish="contacts">Importar de mis contactos</button>' : ''}
      <button class="skip" data-finish="">Ir a mi agenda</button></section>`;
  }
  view.querySelectorAll('[data-go]').forEach((b) => (b.onclick = () => {
    const to = +b.dataset.go;
    if (n === 1 && to === 2 && !D.driver.trim()) { toast('Escribe tu nombre para firmar los mensajes'); $('[data-k=driver]', view).focus(); return; }
    if (to === 5) { data.settings = { ...D, onboarded: false }; save(); }
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
      ${payTo() ? `<div class="copy"><span>${esc(s.bank)} <code>${esc(s.clabe)}</code></span><button data-copy="${esc(s.clabe)}">Copiar</button></div>` : ''}</section>
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
  openSheet(`<h2>${c ? 'Editar cliente' : 'Nuevo cliente'}</h2>
    ${field('Nombre', `<input name="name" required value="${esc(c?.name)}" placeholder="Ej. Sra. Laura">`, true)}
    ${field('Teléfono (WhatsApp)', `<input name="phone" type="tel" inputmode="tel" value="${esc(c?.phone)}" placeholder="10 dígitos">`, true)}
    <div class="sec wide"><b>Servicios frecuentes</b><small>precio con tu tarifa</small></div>
    <div class="wide svcs" id="svcs"></div>
    <button type="button" class="add wide" data-addsvc>＋ Agregar servicio frecuente</button>
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
    form.onsubmit = () => {
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
      toast('Guardado');
    };
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

function placeInput(pt, which, placeholder) {
  return `<div class="stop"><span class="dot ${which}"></span><input data-pt="${which}" value="${esc(pt?.label || '')}" placeholder="${placeholder}" autocomplete="off" enterkeyhint="search"></div>`;
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
    const local = knownPlaces(clientId).filter((p) => words.every((w) => fold(p.label + ' ' + (p.sub || '')).includes(w))).slice(0, 3);
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
  el.innerHTML = `<div class="svc-head"><input data-name value="${esc(sv.name)}" placeholder="Nombre · ej. Casa → Aeropuerto" aria-label="Nombre del servicio"><button type="button" data-rm>Quitar</button></div>
    <div class="route">${placeInput(sv.a, 'a', 'Punto A · ¿de dónde sale?')}${placeInput(sv.b, 'b', 'Punto B · ¿a dónde va?')}</div>
    <div data-route></div>
    <div class="price-row"><label><span>Tu precio $</span><input data-price type="number" inputmode="numeric" min="0" step="10" value="${sv.price ?? ''}" placeholder="${sv.km ? suggestPrice(sv.km, sv.min, svcCtx(sv)) : ''}"></label><small class="muted">vacío = sugerido</small></div>`;
  const nameIn = $('[data-name]', el);
  const priceIn = $('[data-price]', el);
  const routeEl = $('[data-route]', el);
  const update = async () => {
    const r = await fillRoute(routeEl, sv.a, sv.b);
    Object.assign(sv, r ? { km: r.km, min: r.min, path: r.path } : { km: '', min: '', path: null });
    priceIn.placeholder = r ? suggestPrice(r.km, r.min, svcCtx(sv)) : '';
    if (!nameIn.value.trim() && sv.a && sv.b) nameIn.value = sv.name = autoName(sv);
  };
  for (const which of ['a', 'b']) {
    wirePlace($(`[data-pt=${which}]`, el), getClient()?.id, (p, typing) => {
      sv[which] = p;
      if (!typing || !p) update();
    });
  }
  nameIn.oninput = () => { sv.name = nameIn.value.trim(); };
  priceIn.oninput = () => { sv.price = priceIn.value === '' ? null : +priceIn.value; };
  $('[data-rm]', el).onclick = onRemove;
  if (sv.a && sv.b) {
    // Ya calculada: dibuja sin volver a pedir la ruta.
    if (sv.path) routeEl.innerHTML = `${mapSvg(sv.path)}<div class="stats"><div><small>Distancia</small><b>${sv.km} km</b></div><div><small>Tiempo</small><b>${sv.min} min</b></div><div class="price"><small>Sugerido</small><b>${money(suggestPrice(sv.km, sv.min, svcCtx(sv)))}</b></div></div><div class="how">${priceMath(sv.km, sv.min, svcCtx(sv))} · <a href="${directionsLink(sv.a, sv.b)}" target="_blank" rel="noopener">Ver en Google Maps</a></div>`;
    else update();
  } else fillRoute(routeEl, sv.a, sv.b);
  return el;
}

function tripForm(t = null, preset = {}) {
  const v = { date: today(), status: 'agendado', pay: '', ...preset, ...(t || {}) };
  const opts = [...data.clients].sort((a, b) => a.name.localeCompare(b.name, 'es'));
  openSheet(`<h2>${t ? 'Editar viaje' : 'Nuevo viaje'}</h2>
    ${field('Cliente', `<select name="clientId" required>${opts.length ? '' : '<option value="" disabled selected>Agrega un cliente</option>'}${opts.map((c) => `<option value="${c.id}" ${c.id === v.clientId ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}<option value="__new">＋ Cliente nuevo…</option></select>`, true)}
    ${field('Fecha', `<input name="date" type="date" required value="${esc(v.date)}">`)}
    ${field('Hora', `<input name="time" type="time" value="${esc(v.time)}">`)}
    <div class="chips wide" id="svcchips"></div>
    <div class="route wide">${placeInput(v.fromPt || (v.from ? { label: v.from } : null), 'a', 'Punto A · origen')}${placeInput(v.toPt || (v.to ? { label: v.to } : null), 'b', 'Punto B · destino')}</div>
    <div class="wide svc" id="troute" hidden></div>
    ${field('Km', `<input name="km" type="number" inputmode="decimal" step="0.1" min="0" value="${esc(v.km)}">`)}
    ${data.settings.extra?.wait?.on ? field('Espera (min)', `<input name="wait" type="number" inputmode="numeric" min="0" step="5" value="${esc(v.wait)}">`, true) : ''}
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
    const fromIn = $('[data-pt=a]', form);
    const toIn = $('[data-pt=b]', form);
    const rt = { fromPt: v.fromPt || null, toPt: v.toPt || null, min: v.min || '', path: v.path || null };
    const routeEl = $('#troute', form);
    const suggest = () => {
      const same = data.trips.filter((x) => x.clientId === sel.value && x.id !== t?.id && x.status !== 'cancelado' && x.from === fromIn.value.trim() && x.to === toIn.value.trim() && (x.from || x.to)).sort(byWhen).pop();
      const km = +els.km.value;
      const min = +rt.min || Math.round(km * 2);
      const ctx = { airport: isAirport(fromIn.value, toIn.value), night: isNight(els.time.value), wait: +(els.wait?.value || 0) };
      const tips = [];
      if (same) tips.push(`La última vez: ${money(same.price)}`);
      if (km) tips.push(`Con tu tarifa: ${money(suggestPrice(km, min, ctx))} (${priceMath(km, min, ctx)})`);
      hint.textContent = tips.join(' · ');
      if (!priceTyped && (same || km)) els.price.value = same ? same.price : suggestPrice(km, min, ctx);
    };
    const recalc = async () => {
      routeEl.hidden = !(rt.fromPt && rt.toPt);
      if (routeEl.hidden) { rt.min = ''; rt.path = null; return; }
      const r = await fillRoute(routeEl, rt.fromPt, rt.toPt);
      if (r) { els.km.value = r.km; rt.min = r.min; rt.path = r.path; suggest(); }
    };
    wirePlace(fromIn, sel.value, (p, typing) => { rt.fromPt = p; if (!typing || !p) { recalc(); suggest(); } });
    wirePlace(toIn, sel.value, (p, typing) => { rt.toPt = p; if (!typing || !p) { recalc(); suggest(); } });
    if (rt.fromPt && rt.toPt) {
      routeEl.hidden = false;
      if (rt.path) routeEl.innerHTML = `${mapSvg(rt.path)}<div class="how">${els.km.value} km · ${rt.min} min · <a href="${directionsLink(rt.fromPt, rt.toPt)}" target="_blank" rel="noopener">Ver en Google Maps</a></div>`;
      else recalc();
    }
    // Servicios frecuentes del cliente: un toque llena A, B y precio.
    const fillPlaces = () => {
      const svs = client(sel.value)?.services || [];
      const chips = $('#svcchips', form);
      chips.innerHTML = svs.map((sv) => `<button type="button" data-sv="${sv.id}">${esc(sv.name || autoName(sv))}</button>`).join('');
      chips.hidden = !svs.length;
      chips.querySelectorAll('[data-sv]').forEach((b) => (b.onclick = () => {
        const sv = svs.find((x) => x.id === b.dataset.sv);
        const f = fromService(client(sel.value), sv);
        fromIn.value = f.from; toIn.value = f.to;
        Object.assign(rt, { fromPt: f.fromPt, toPt: f.toPt, min: f.min, path: f.path });
        els.km.value = f.km; els.price.value = f.price; priceTyped = true;
        chips.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
        routeEl.hidden = !(f.fromPt && f.toPt);
        if (f.path) routeEl.innerHTML = `${mapSvg(f.path)}<div class="how">${f.km} km · ${f.min} min · <a href="${directionsLink(f.fromPt, f.toPt)}" target="_blank" rel="noopener">Ver en Google Maps</a></div>`;
        hint.textContent = `Servicio frecuente: ${money(f.price)}`;
      }));
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
    els.km.addEventListener('input', () => { rt.min = ''; suggest(); });
    els.time.addEventListener('input', suggest);
    els.wait?.addEventListener('input', suggest);
    fillPlaces(); suggest(); showPay();
    function readForm() {
      const f = new FormData(form);
      return {
        clientId: f.get('clientId'), date: f.get('date'), time: f.get('time') || '',
        from: fromIn.value.trim(), to: toIn.value.trim(), fromPt: rt.fromPt, toPt: rt.toPt, km: f.get('km'), min: rt.min, path: rt.path, wait: f.get('wait') || '',
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
