import * as db from './db.js';
import { CATEGORIES, REPEATS, GOAL_WINDOW, monthKey, monthDays, addMonths, billsIn, billStatus, simulate, todayPlan } from './finance.js';
import { fuelStats, fuelStatsByType, FUELS, fuelTypeOf, currentOdometer, firstOdometer, totals, monthlySpend, reminderStatus, amountOf } from './calc.js';

const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const today = () => new Date().toLocaleDateString('en-CA');
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));

const state = { fuel: [], maintenance: [], expenses: [], reminders: [], income: [], bills: [], goals: [], vehicle: {}, finance: {} };

async function load() {
  const [fuel, maintenance, expenses, reminders, income, bills, goals, vehicle, finance] = await Promise.all([
    db.all('fuel'), db.all('maintenance'), db.all('expenses'), db.all('reminders'),
    db.all('income'), db.all('bills'), db.all('goals'), db.getSetting('vehicle'), db.getSetting('finance'),
  ]);
  Object.assign(state, { fuel, maintenance, expenses, reminders, income, bills, goals, vehicle: vehicle || {}, finance: finance || {} });
}

// ---------- Formato ----------
function money(n) {
  try {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: state.vehicle.currency || 'MXN' }).format(n || 0);
  } catch {
    return '$' + num(n, 2);
  }
}
const money0 = (n) => (Math.abs(n) >= 1000 ? money(Math.round(n)).replace(/\.00$/, '') : money(n));
const num = (n, d = 0) => new Intl.NumberFormat('es-MX', { minimumFractionDigits: d, maximumFractionDigits: d }).format(n || 0);
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const fdate = (s, opts = { day: 'numeric', month: 'short', year: 'numeric' }) => (s ? new Date(s + 'T00:00').toLocaleDateString('es-MX', opts) : '');

// ---------- Iconos ----------
const P = {
  chart: '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
  fuel: '<path d="M4 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16"/><path d="M2 21h15"/><path d="M6 9h7"/><path d="M15 10h2a2 2 0 0 1 2 2v4a1.5 1.5 0 0 0 3 0V8l-3-3"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  receipt: '<path d="M5 2v20l2.5-1.5L10 22l2-1.5 2 1.5 2.5-1.5L19 22V2l-2.5 1.5L14 2l-2 1.5L10 2 7.5 3.5z"/><path d="M9 8h6M9 12h6M9 16h4"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
  sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  back: '<path d="M15 18l-6-6 6-6"/>',
  car: '<path d="M5 17H3v-5l2.5-5h13L21 12v5h-2"/><path d="M9 17h6"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M4 12h16"/>',
  alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  wallet: '<path d="M20 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h15v13H5a2 2 0 0 1-2-2V5"/><path d="M16 13h.01"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
};
const icon = (n) => `<svg viewBox="0 0 24 24" class="i" aria-hidden="true">${P[n]}</svg>`;

// El vehículo usa gas LP si está activado en ajustes o ya hay cargas de LP.
const hasLP = () => !!state.vehicle.lp || state.fuel.some((f) => fuelTypeOf(f) === 'lp');
const lastFuelType = () => {
  const last = [...state.fuel].sort((a, b) => a.date.localeCompare(b.date) || a.odometer - b.odometer).at(-1);
  return last ? fuelTypeOf(last) : state.vehicle.lp ? 'lp' : 'gasolina';
};
const lastPriceOf = (type) => {
  const p = fuelStats(state.fuel.filter((f) => fuelTypeOf(f) === type)).lastPrice;
  return p ? p.toFixed(2) : '';
};
const fuelTag = (x) => (hasLP() ? `<span class="tag ${fuelTypeOf(x)}">${fuelTypeOf(x) === 'lp' ? 'LP' : 'Gas'}</span>` : '');

// ---------- Esquemas de formularios ----------
const MAINT_TYPES = ['Servicio', 'Cambio de aceite', 'Equipo de gas LP', 'Llantas', 'Frenos', 'Batería', 'Afinación', 'Alineación y balanceo', 'Reparación', 'Otro'];
const EXPENSE_TYPES = ['Seguro', 'Verificación', 'Tenencia / Refrendo', 'Estacionamiento', 'Casetas', 'Lavado', 'Multa', 'Accesorios', 'Otro'];

const SCHEMAS = {
  fuel: {
    title: 'Carga de combustible',
    fields: [
      { k: 'fuelType', label: 'Combustible', type: 'select', options: Object.entries(FUELS).map(([v, l]) => ({ v, l })), def: lastFuelType, show: hasLP },
      { k: 'date', label: 'Fecha', type: 'date', req: true, def: today },
      { k: 'odometer', label: 'Odómetro (km)', type: 'number', step: '1', req: true, def: () => currentOdometer(state) || '' },
      { k: 'liters', label: 'Litros', type: 'number', step: '0.01', req: true },
      { k: 'pricePerLiter', label: 'Precio por litro', type: 'number', step: '0.01', def: () => lastPriceOf(hasLP() ? lastFuelType() : 'gasolina') },
      { k: 'total', label: 'Total pagado', type: 'number', step: '0.01', req: true },
      { k: 'full', label: 'Llené el tanque', type: 'checkbox', def: () => true, hint: 'Necesario para calcular el rendimiento' },
      { k: 'station', label: 'Gasolinera', type: 'text', list: () => uniq(state.fuel.map((f) => f.station)) },
      { k: 'notes', label: 'Notas', type: 'textarea' },
    ],
    summary: (x) => {
      const kml = fuelStats(hasLP() ? state.fuel.filter((f) => fuelTypeOf(f) === 'lp') : state.fuel).byId.get(x.id);
      return {
        title: `${fuelTag(x)}${num(x.liters, 2)} L${x.station ? ' · ' + esc(x.station) : ''}`,
        sub: `${fdate(x.date)} · ${num(x.odometer)} km${kml ? ` · <b>${num(kml, 1)} km/l</b>` : ''}${x.full ? '' : ' · parcial'}`,
        amount: money(x.total),
      };
    },
  },
  maintenance: {
    title: 'Mantenimiento',
    fields: [
      { k: 'date', label: 'Fecha', type: 'date', req: true, def: today },
      { k: 'type', label: 'Tipo', type: 'select', options: MAINT_TYPES, req: true },
      { k: 'odometer', label: 'Odómetro (km)', type: 'number', step: '1', def: () => currentOdometer(state) || '' },
      { k: 'cost', label: 'Costo', type: 'number', step: '0.01' },
      { k: 'shop', label: 'Taller', type: 'text', list: () => uniq(state.maintenance.map((m) => m.shop)) },
      { k: 'notes', label: 'Detalle / notas', type: 'textarea' },
    ],
    summary: (x) => ({
      title: esc(x.type) + (x.shop ? ' · ' + esc(x.shop) : ''),
      sub: `${fdate(x.date)}${x.odometer ? ' · ' + num(x.odometer) + ' km' : ''}${x.notes ? ' · ' + esc(x.notes) : ''}`,
      amount: money(x.cost),
    }),
  },
  expenses: {
    title: 'Gasto',
    fields: [
      { k: 'date', label: 'Fecha', type: 'date', req: true, def: today },
      { k: 'category', label: 'Categoría', type: 'select', options: EXPENSE_TYPES, req: true },
      { k: 'amount', label: 'Monto', type: 'number', step: '0.01', req: true },
      { k: 'notes', label: 'Notas', type: 'textarea' },
    ],
    summary: (x) => ({
      title: esc(x.category),
      sub: `${fdate(x.date)}${x.notes ? ' · ' + esc(x.notes) : ''}`,
      amount: money(x.amount),
    }),
  },
  reminders: {
    title: 'Recordatorio',
    fields: [
      { k: 'title', label: 'Qué', type: 'text', req: true, list: () => [...MAINT_TYPES, 'Seguro', 'Verificación', 'Tenencia / Refrendo'], placeholder: 'Ej. Cambio de aceite' },
      { k: 'everyKm', label: 'Cada (km)', type: 'number', step: '1', placeholder: 'Ej. 10000' },
      { k: 'everyMonths', label: 'Cada (meses)', type: 'number', step: '1', placeholder: 'Ej. 6' },
      { k: 'lastKm', label: 'Última vez (km)', type: 'number', step: '1', def: () => currentOdometer(state) || '' },
      { k: 'lastDate', label: 'Última vez (fecha)', type: 'date', def: today },
      { k: 'notes', label: 'Notas', type: 'textarea' },
    ],
  },
  income: {
    title: 'Ingreso', newLabel: 'Nuevo',
    fields: [
      { k: 'amount', label: 'Monto', type: 'number', step: '0.01', req: true },
      { k: 'date', label: 'Fecha', type: 'date', req: true, def: today },
      { k: 'concept', label: 'Concepto', type: 'text', list: () => uniq(state.income.map((x) => x.concept)), placeholder: 'Opcional' },
      { k: 'notes', label: 'Notas', type: 'textarea' },
    ],
    summary: (x) => ({ title: esc(x.concept || 'Ingreso'), sub: fdate(x.date, { weekday: 'short', day: 'numeric', month: 'short' }) + (x.notes ? ' · ' + esc(x.notes) : ''), amount: money(x.amount) }),
  },
  bills: {
    title: 'Pago', newLabel: 'Nuevo',
    fields: [
      { k: 'concept', label: 'Concepto', type: 'text', req: true, list: () => uniq(state.bills.map((x) => x.concept)), placeholder: 'Ej. Colegiatura' },
      { k: 'amount', label: 'Monto', type: 'number', step: '0.01', req: true },
      { k: 'category', label: 'Categoría', type: 'select', options: CATEGORIES, req: true },
      { k: 'date', label: 'Fecha límite', type: 'date', req: true, def: today },
      { k: 'repeat', label: 'Se repite', type: 'select', options: REPEATS },
      { k: 'until', label: 'Repetir hasta (opcional)', type: 'date' },
      { k: 'notes', label: 'Notas', type: 'textarea' },
    ],
  },
  goals: {
    title: 'Meta',
    fields: [
      { k: 'concept', label: 'Concepto', type: 'text', req: true, placeholder: 'Ej. Llantas' },
      { k: 'amount', label: 'Monto total', type: 'number', step: '0.01', req: true },
      { k: 'category', label: 'Categoría', type: 'select', options: CATEGORIES, req: true },
      { k: 'date', label: 'Para cuándo', type: 'date', req: true },
      { k: 'saved', label: 'Ya tengo ahorrado (opcional)', type: 'number', step: '0.01' },
      { k: 'notes', label: 'Notas', type: 'textarea' },
    ],
  },
};

const uniq = (arr) => [...new Set(arr.filter(Boolean))].sort();

// ---------- Formulario (hoja inferior) ----------
const sheet = $('#sheet');

function openForm(store, item = null, { preset = {}, extra = null } = {}) {
  const schema = SCHEMAS[store];
  const isNew = !item;
  const v = (f) => (item ? item[f.k] ?? '' : f.k in preset ? preset[f.k] : typeof f.def === 'function' ? f.def() : f.def ?? '');
  const field = (f) => {
    if (f.show && !f.show()) return '';
    const id = `f-${f.k}`;
    const common = `id="${id}" name="${f.k}" ${f.req ? 'required' : ''} ${f.placeholder ? `placeholder="${esc(f.placeholder)}"` : ''}`;
    if (f.type === 'checkbox') {
      return `<label class="check"><input type="checkbox" ${common} ${v(f) ? 'checked' : ''}><span>${f.label}${f.hint ? `<small>${f.hint}</small>` : ''}</span></label>`;
    }
    let input;
    if (f.type === 'select') {
      const opts = f.options.map((o) => (typeof o === 'string' ? { v: o, l: o } : o));
      input = `<select ${common}>${opts.map((o) => `<option value="${esc(o.v)}" ${o.v === v(f) ? 'selected' : ''}>${esc(o.l)}</option>`).join('')}</select>`;
    } else if (f.type === 'textarea') {
      input = `<textarea ${common} rows="2">${esc(v(f))}</textarea>`;
    } else {
      const list = f.list ? `list="dl-${f.k}"` : '';
      const mode = f.type === 'number' ? `inputmode="${f.step === '1' ? 'numeric' : 'decimal'}" step="${f.step}" min="0"` : '';
      input = `<input type="${f.type}" ${common} ${mode} ${list} value="${esc(v(f))}">`;
      if (f.list) input += `<datalist id="dl-${f.k}">${f.list().map((o) => `<option value="${esc(o)}">`).join('')}</datalist>`;
    }
    return `<label class="field ${f.type === 'textarea' ? 'wide' : ''}" for="${id}"><span>${f.label}</span>${input}</label>`;
  };

  sheet.innerHTML = `
    <form method="dialog" class="form">
      <header><h2>${isNew ? schema.newLabel || 'Nueva' : 'Editar'}: ${schema.title}</h2>
        <button type="button" class="ghost" data-close aria-label="Cerrar">✕</button></header>
      <div class="grid">${schema.fields.map(field).join('')}</div>
      <p class="warn" hidden></p>
      <footer>
        ${isNew ? '' : '<button type="button" class="danger" data-delete>Eliminar</button>'}
        ${extra ? `<button type="button" data-extra>${esc(extra.label)}</button>` : ''}
        <button type="submit" class="primary">Guardar</button>
      </footer>
    </form>`;
  const form = $('form', sheet);
  if (store === 'fuel') wireFuelMath(form);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = { ...(item || {}), id: item?.id || uid(), createdAt: item?.createdAt || Date.now(), updatedAt: Date.now() };
    for (const f of schema.fields) {
      const el = form.elements[f.k];
      if (!el) continue;
      data[f.k] = f.type === 'checkbox' ? el.checked : f.type === 'number' ? (el.value === '' ? '' : +el.value) : el.value.trim();
    }
    if (store === 'fuel' && isNew) {
      const prev = Math.max(0, ...state.fuel.map((f) => +f.odometer));
      const warn = $('.warn', form);
      if (data.odometer < prev && warn.hidden) {
        warn.textContent = `El odómetro (${num(data.odometer)}) es menor al último registro (${num(prev)}). Pulsa Guardar otra vez para confirmar.`;
        warn.hidden = false;
        return;
      }
    }
    await db.put(store, data);
    sheet.close();
    await refresh();
    toast('Guardado');
  });
  $('[data-close]', form).onclick = () => sheet.close();
  if (extra) $('[data-extra]', form).onclick = async () => { await extra.run(); sheet.close(); await refresh(); };
  const del = $('[data-delete]', form);
  if (del) del.onclick = async () => {
    if (!confirm('¿Eliminar este registro?')) return;
    await db.remove(store, item.id);
    sheet.close();
    await refresh();
    toast('Eliminado');
  };
  sheet.showModal();
  if (isNew) setTimeout(() => [...form.querySelectorAll('input[required]')].find((el) => !el.value)?.focus(), 50);
}

// Litros × precio = total (y al revés).
function wireFuelMath(form) {
  const { liters, pricePerLiter, total, fuelType } = form.elements;
  const n = (el) => parseFloat(el.value);
  // Al cambiar de combustible, sugerir su último precio.
  fuelType?.addEventListener('change', () => {
    pricePerLiter.value = lastPriceOf(fuelType.value);
    if (n(liters) && n(pricePerLiter)) total.value = (n(liters) * n(pricePerLiter)).toFixed(2);
  });
  liters.addEventListener('input', () => { if (n(pricePerLiter)) total.value = (n(liters) * n(pricePerLiter)).toFixed(2); });
  pricePerLiter.addEventListener('input', () => { if (n(liters)) total.value = (n(liters) * n(pricePerLiter)).toFixed(2); });
  total.addEventListener('input', () => {
    if (n(liters) && n(total)) pricePerLiter.value = (n(total) / n(liters)).toFixed(2);
    else if (n(pricePerLiter) && n(total)) liters.value = (n(total) / n(pricePerLiter)).toFixed(2);
  });
}

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.remove('show'), 1800);
}

// ---------- Gráficas (SVG propio, funciona offline) ----------
function lineChart(series, fmt) {
  series = series.filter((sr) => sr.pts.length);
  const all = series.flatMap((sr) => sr.pts.map((p) => ({ ...p, sr })));
  if (all.length < 2) return `<p class="muted small">Necesitas al menos 3 cargas con tanque lleno para ver la tendencia.</p>`;
  const W = 340, H = 160, L = 36, R = 12, T = 12, B = 24;
  all.sort((p, q) => p.t - q.t);
  const t0 = all[0].t, t1 = all.at(-1).t === t0 ? t0 + 1 : all.at(-1).t;
  const ys = all.map((p) => p.y);
  let min = Math.min(...ys), max = Math.max(...ys);
  const pad = (max - min) * 0.2 || 1;
  min = Math.max(0, min - pad); max += pad;
  const x = (t) => L + ((t - t0) * (W - L - R)) / (t1 - t0);
  const y = (v) => T + (H - T - B) * (1 - (v - min) / (max - min));
  const ticks = [min, (min + max) / 2, max];
  const multi = series.length > 1;
  const tips = all.map((p) => ({ x: x(p.t) / W, h: `${multi ? `<i class="sw ${p.sr.cls}"></i>${p.sr.label} · ` : ''}${p.label}<br><b>${fmt(p.y)}</b>` }));
  return `${multi ? `<div class="legend">${series.map((sr) => `<span><i class="sw ${sr.cls}"></i>${sr.label}</span>`).join('')}</div>` : ''}
    <div class="chart" data-chart='${esc(JSON.stringify(tips))}'>
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Rendimiento por carga">
      ${ticks.map((t) => `<line class="grid" x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}"/><text class="axis" x="${L - 6}" y="${y(t) + 4}" text-anchor="end">${num(t, 1)}</text>`).join('')}
      <text class="axis" x="${x(t0)}" y="${H - 6}">${all[0].short}</text>
      <text class="axis" x="${x(all.at(-1).t)}" y="${H - 6}" text-anchor="end">${all.at(-1).short}</text>
      ${series.map((sr) => `<path class="line ${sr.cls}" d="${sr.pts.map((p, i) => `${i ? 'L' : 'M'}${x(p.t).toFixed(1)},${y(p.y).toFixed(1)}`).join('')}"/>
        ${sr.pts.map((p, i) => `<circle class="dot ${sr.cls}" cx="${x(p.t)}" cy="${y(p.y)}" r="${i === sr.pts.length - 1 ? 4.5 : 3}"/>`).join('')}`).join('')}
      <line class="cross" x1="0" x2="0" y1="${T}" y2="${H - B}" hidden/>
    </svg><div class="tip" hidden></div></div>`;
}

// Cada categoría conserva su color aunque no aparezca el gas LP.
const spendSeries = () => [
  { k: 'gasolina', label: hasLP() ? 'Gasolina' : 'Combustible', cls: 's1' },
  ...(hasLP() ? [{ k: 'lp', label: 'Gas LP', cls: 's2' }] : []),
  { k: 'maintenance', label: 'Mantenimiento', cls: 's3' },
  { k: 'expenses', label: 'Otros gastos', cls: 's4' },
];

function stackedBars(months) {
  const SPEND_SERIES = spendSeries();
  const W = 340, H = 170, L = 44, R = 8, T = 10, B = 24;
  const max = Math.max(...months.map((m) => m.total)) || 1;
  const bw = (W - L - R) / months.length;
  const barW = Math.min(30, bw * 0.6);
  const y = (v) => ((H - T - B) * v) / max;
  const ticks = [0, max / 2, max];
  const tips = [];
  const bars = months.map((m, i) => {
    const cx = L + bw * i + bw / 2;
    let base = H - B;
    const segs = SPEND_SERIES.filter((s) => m[s.k] > 0).map((s, j, arr) => {
      // 2px de separación entre segmentos apilados (el hueco queda arriba de cada uno salvo el último).
      const top = j === arr.length - 1;
      const gap = top ? 0 : 2;
      const h = Math.max(y(m[s.k]) - gap, 1);
      base -= y(m[s.k]);
      return `<rect class="bar ${s.cls}" x="${cx - barW / 2}" y="${base + gap}" width="${barW}" height="${h}" rx="${top ? 3 : 0}"/>`;
    });
    const label = fdate(m.key + '-01', { month: 'short' }).replace('.', '');
    tips.push({ x: cx / W, h: `<b>${fdate(m.key + '-01', { month: 'long', year: 'numeric' })}</b><br>${SPEND_SERIES.map((s) => `<i class="sw ${s.cls}"></i>${s.label}: ${money(m[s.k])}`).join('<br>')}<br><b>Total: ${money(m.total)}</b>` });
    return `${segs.join('')}<text class="axis" x="${cx}" y="${H - 6}" text-anchor="middle">${label}</text>`;
  });
  return `<div class="legend">${SPEND_SERIES.map((s) => `<span><i class="sw ${s.cls}"></i>${s.label}</span>`).join('')}</div>
    <div class="chart" data-chart='${esc(JSON.stringify(tips))}' data-snap>
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Gasto mensual">
      ${ticks.map((t) => `<line class="grid" x1="${L}" x2="${W - R}" y1="${H - B - y(t)}" y2="${H - B - y(t)}"/><text class="axis" x="${L - 6}" y="${H - B - y(t) + 4}" text-anchor="end">${compact(t)}</text>`).join('')}
      ${bars.join('')}
    </svg><div class="tip" hidden></div></div>`;
}
const compact = (n) => (n >= 1000 ? num(n / 1000, n >= 10000 ? 0 : 1) + 'k' : num(n));

function bindCharts(root) {
  root.querySelectorAll('.chart').forEach((c) => {
    const pts = JSON.parse(c.dataset.chart);
    const tip = $('.tip', c);
    const cross = $('.cross', c);
    const svg = $('svg', c);
    const move = (e) => {
      const r = svg.getBoundingClientRect();
      const fx = (e.clientX - r.left) / r.width;
      let best = 0;
      pts.forEach((p, i) => { if (Math.abs(p.x - fx) < Math.abs(pts[best].x - fx)) best = i; });
      const p = pts[best];
      tip.innerHTML = p.h;
      tip.hidden = false;
      const px = p.x * r.width;
      tip.style.left = Math.min(Math.max(px - tip.offsetWidth / 2, 0), r.width - tip.offsetWidth) + 'px';
      if (cross) { cross.hidden = false; const vx = p.x * svg.viewBox.baseVal.width; cross.setAttribute('x1', vx); cross.setAttribute('x2', vx); }
    };
    const leave = () => { tip.hidden = true; if (cross) cross.hidden = true; };
    svg.addEventListener('pointermove', move);
    svg.addEventListener('pointerdown', move);
    svg.addEventListener('pointerleave', leave);
  });
}

// ---------- Vistas ----------
const TABS = [
  { id: '', label: 'Resumen', icon: 'chart' },
  { id: 'cargas', label: 'Cargas', icon: 'fuel', store: 'fuel' },
  { id: 'servicio', label: 'Servicio', icon: 'wrench', store: 'maintenance' },
  { id: 'gastos', label: 'Gastos', icon: 'receipt', store: 'expenses' },
  { id: 'recordatorios', label: 'Avisos', icon: 'bell', store: 'reminders' },
];

const view = $('#view');
const top = $('#top');
const tabs = $('#tabs');
const fab = $('#fab');

function setHeader({ title, back, action }) {
  top.innerHTML = `
    ${back ? `<a class="iconbtn" href="${back}" aria-label="Volver">${icon('back')}</a>` : '<span class="brand">🧠</span>'}
    <h1>${esc(title)}</h1>
    ${action ? `<a class="iconbtn" href="${action.href}" aria-label="${action.label}">${icon(action.icon)}</a>` : '<span></span>'}`;
}

function setFab(store) {
  fab.hidden = !store;
  fab.onclick = store ? () => openForm(store) : null;
}

function render() {
  const [, mod, sub = ''] = (location.hash || '#/').slice(1).split('/');
  window.scrollTo(0, 0);
  if (mod === 'vehiculo') renderVehicle(sub);
  else if (mod === 'finanzas') renderFinance(sub);
  else renderHome();
  bindCharts(view);
}

function alertsFor(odo) {
  return state.reminders
    .map((r) => ({ r, s: reminderStatus(r, odo) }))
    .sort((a, b) => rank(a.s) - rank(b.s));
}
const rank = (s) => ({ overdue: 0, soon: 1, ok: 2 })[s.level] * 1e6 + Math.min(s.kmLeft ?? 1e5, (s.daysLeft ?? 1e4) * 30);

function renderHome() {
  setHeader({ title: 'SecondBrain' });
  setFab(null);
  tabs.hidden = true;
  const odo = currentOdometer(state);
  const pending = alertsFor(odo).filter((a) => a.s.level !== 'ok').length;
  const km = odo - firstOdometer(state);
  const month = monthlySpend(state, 1)[0].total;
  const plan = todayPlan(state, today(), !!state.finance.fuel);
  view.innerHTML = `
    <p class="muted">Módulos</p>
    <a class="module" href="#/vehiculo">
      <span class="module-icon">${icon('car')}</span>
      <span class="module-body">
        <b>${esc(state.vehicle.name || 'Vehículo')}</b>
        ${!state.vehicle.name ? '<small>Toca para configurarlo</small>' : `<small>${km > 0 ? money(totals(state).all / km) + '/km · ' : ''}${money(month)} este mes${pending ? ` · <span class="badge">${pending} aviso${pending > 1 ? 's' : ''}</span>` : ''}</small>`}
      </span>
    </a>
    <a class="module" href="#/finanzas">
      <span class="module-icon">${icon('wallet')}</span>
      <span class="module-body">
        <b>Finanzas</b>
        <small>Meta de hoy ${money(plan.meta)} · ${plan.pending > 0 ? `faltan ${money(plan.pending)} este mes` : 'mes cubierto'}</small>
      </span>
    </a>
    <div class="module soon"><span class="module-icon">＋</span><span class="module-body"><b>Más módulos</b><small>Próximamente: notas, hábitos…</small></span></div>`;
}

function renderVehicle(sub) {
  const tab = TABS.find((t) => t.id === sub);
  const name = state.vehicle.name || 'Mi vehículo';
  if (sub === 'ajustes') {
    setHeader({ title: 'Ajustes', back: '#/vehiculo' });
    tabs.hidden = true;
    setFab(null);
    return renderSettings();
  }
  // Primero se configura el vehículo; sin eso no tiene sentido registrar cargas.
  if (!state.vehicle.name) {
    setHeader({ title: 'Configura tu vehículo', back: '#/' });
    tabs.hidden = true;
    setFab(null);
    return renderSetup();
  }
  setHeader({ title: name, back: '#/', action: { href: '#/vehiculo/ajustes', icon: 'sliders', label: 'Ajustes' } });
  tabs.hidden = false;
  tabs.style.gridTemplateColumns = `repeat(${TABS.length}, 1fr)`;
  tabs.innerHTML = TABS.map((t) => `<a href="#/vehiculo${t.id ? '/' + t.id : ''}" class="${t === tab ? 'active' : ''}">${icon(t.icon)}<span>${t.label}</span></a>`).join('');
  if (!tab || !tab.store) { setFab('fuel'); return renderSummary(); }
  setFab(tab.store);
  if (tab.store === 'reminders') return renderReminders();
  renderList(tab.store);
}

function renderSummary() {
  const fs = fuelStats(state.fuel);
  const byType = fuelStatsByType(state.fuel);
  const lp = hasLP();
  const odo = currentOdometer(state);
  const km = odo - firstOdometer(state);
  const tot = totals(state);
  const months = monthlySpend(state, 6);
  const alerts = alertsFor(odo).filter((a) => a.s.level !== 'ok');

  if (!state.fuel.length && !state.maintenance.length && !state.expenses.length) {
    view.innerHTML = `
      <div class="empty">
        ${icon('fuel')}
        <h2>Empieza registrando una carga</h2>
        <p>Cada vez que cargues combustible anota el <b>odómetro</b>, los <b>litros</b> y el <b>total</b>. Si llenas el tanque, a partir de la segunda carga verás tu rendimiento real.</p>
        <button class="primary" id="first">Registrar carga</button>
      </div>`;
    $('#first').onclick = () => openForm('fuel');
    return;
  }

  const tile = (label, value, sub = '') => `<div class="tile"><small>${label}</small><b>${value}</b>${sub ? `<span>${sub}</span>` : ''}</div>`;
  const pts = (st) => st.series.slice(-12).map((s) => ({ t: new Date(s.date + 'T00:00').getTime(), y: s.kml, label: fdate(s.date), short: fdate(s.date, { day: 'numeric', month: 'short' }) }));
  const trend = lp
    ? [{ label: 'Gas LP', cls: 's2', pts: pts(byType.lp) }]
    : [{ label: 'Combustible', cls: 's1', pts: pts(fs) }];
  const g = byType.gasolina, l = byType.lp;
  const gasSpend = state.fuel.filter((f) => fuelTypeOf(f) === 'gasolina').reduce((s, f) => s + amountOf.fuel(f), 0);
  // Ahorro = lo que habría costado recorrer esos km solo con gasolina − lo que realmente se gastó en combustible.
  const kmlGas = +state.vehicle.kmlGas;
  const saving = km > 0 && kmlGas && g.lastPrice ? (km / kmlGas) * g.lastPrice - tot.fuel : null;
  const tilesHtml = lp
    ? [
        tile('Rendimiento gas LP', l.avgKml ? `${num(l.avgKml, 1)} <em>km/l</em>` : '—', l.avgKml ? `Última: ${num(l.lastKml, 1)} km/l · ${money(l.lastPrice)}/L` : 'Faltan cargas de LP con tanque lleno'),
        tile('Combustible por km', km > 0 ? money(tot.fuel / km) : '—', km > 0 ? `Todo incluido: ${money(tot.all / km)}/km` : ''),
        tile('Ahorro con LP', saving != null ? money(saving) : '—', saving != null ? `vs. solo gasolina (${num(kmlGas, 1)} km/l)` : kmlGas ? 'Registra una carga de gasolina' : 'Pon tu km/l en gasolina en Ajustes'),
        tile('Gasolina', money(gasSpend), tot.fuel ? `${num((gasSpend / tot.fuel) * 100)}% del combustible · ${num(g.totalLiters)} L` : ''),
        tile('Gasto este mes', money(months.at(-1).total), `Mes anterior: ${money(months.at(-2).total)}`),
        tile('Odómetro', `${num(odo)} <em>km</em>`, km > 0 ? `${num(km)} km registrados` : ''),
      ]
    : [
        tile('Rendimiento promedio', fs.avgKml ? `${num(fs.avgKml, 1)} <em>km/l</em>` : '—', fs.lastKml ? `Última: ${num(fs.lastKml, 1)} km/l` : 'Faltan cargas con tanque lleno'),
        tile('Costo por km', km > 0 ? money(tot.all / km) : '—', km > 0 ? `Combustible: ${money(tot.fuel / km)}` : ''),
        tile('Gasto este mes', money(months.at(-1).total), `Mes anterior: ${money(months.at(-2).total)}`),
        tile('Odómetro', `${num(odo)} <em>km</em>`, km > 0 ? `${num(km)} km registrados` : ''),
        tile('Precio por litro', fs.lastPrice ? money(fs.lastPrice) : '—', 'Última carga'),
        tile('Total invertido', money(tot.all), `${num(fs.totalLiters)} L cargados`),
      ];
  const recent = [
    ...state.fuel.map((x) => ({ x, store: 'fuel' })),
    ...state.maintenance.map((x) => ({ x, store: 'maintenance' })),
    ...state.expenses.map((x) => ({ x, store: 'expenses' })),
  ].sort((a, b) => b.x.date.localeCompare(a.x.date) || (b.x.updatedAt || 0) - (a.x.updatedAt || 0)).slice(0, 5);

  view.innerHTML = `
    ${alerts.map(alertCard).join('')}
    <section class="tiles">${tilesHtml.join('')}
    </section>
    <section class="card"><h3>Rendimiento${lp ? " gas LP" : ""} (km/l)</h3>${lineChart(trend, (v) => num(v, 1) + ' km/l')}</section>
    <section class="card"><h3>Gasto mensual</h3>${stackedBars(months)}</section>
    <section class="card"><h3>Actividad reciente</h3><ul class="list flat">${recent.map((r) => row(r.store, r.x)).join('')}</ul></section>`;
  bindRows();
}

function alertCard({ r, s }) {
  const parts = [];
  if (s.kmLeft != null) parts.push(s.kmLeft <= 0 ? `pasado por ${num(-s.kmLeft)} km` : `faltan ${num(s.kmLeft)} km`);
  if (s.daysLeft != null) parts.push(s.daysLeft < 0 ? `venció hace ${-s.daysLeft} días` : s.daysLeft === 0 ? 'vence hoy' : `en ${s.daysLeft} días (${fdate(s.dueDate.toLocaleDateString('en-CA'))})`);
  const label = { overdue: 'Vencido', soon: 'Próximo', ok: 'Al día' }[s.level];
  const ic = { overdue: 'alert', soon: 'clock', ok: 'check' }[s.level];
  return `<div class="alert ${s.level}" data-rem="${r.id}">
    ${icon(ic)}<div><b>${esc(r.title)}</b><small><span class="status">${label}</span> · ${parts.join(' · ') || 'sin datos de última vez'}</small></div>
    <button class="ghost small" data-done="${r.id}">Hecho</button></div>`;
}

const ICON_FOR = { fuel: 'fuel', maintenance: 'wrench', expenses: 'receipt', income: 'wallet' };
function row(store, x) {
  const s = SCHEMAS[store].summary(x);
  return `<li data-store="${store}" data-id="${x.id}" tabindex="0">
    <span class="row-icon">${icon(ICON_FOR[store])}</span>
    <span class="row-body"><b>${s.title}</b><small>${s.sub}</small></span>
    <span class="row-amount">${s.amount}</span></li>`;
}

function bindRows() {
  view.querySelectorAll('li[data-store]').forEach((li) => {
    const open = () => openForm(li.dataset.store, state[li.dataset.store].find((x) => x.id === li.dataset.id));
    li.onclick = open;
    li.onkeydown = (e) => { if (e.key === 'Enter') open(); };
  });
  view.querySelectorAll('[data-done]').forEach((b) => (b.onclick = (e) => { e.stopPropagation(); markDone(b.dataset.done); }));
  view.querySelectorAll('[data-rem]').forEach((el) => (el.onclick = () => openForm('reminders', state.reminders.find((r) => r.id === el.dataset.rem))));
}

async function markDone(id) {
  const r = state.reminders.find((x) => x.id === id);
  if (!confirm(`¿Marcar "${r.title}" como hecho hoy a los ${num(currentOdometer(state))} km?`)) return;
  await db.put('reminders', { ...r, lastKm: currentOdometer(state), lastDate: today(), updatedAt: Date.now() });
  await refresh();
  toast('Recordatorio reiniciado');
}

const sumType = (items, type) => items.filter((x) => fuelTypeOf(x) === type).reduce((s, x) => s + amountOf.fuel(x), 0);

function renderList(store) {
  const items = [...state[store]].sort((a, b) => b.date.localeCompare(a.date) || (+b.odometer || 0) - (+a.odometer || 0));
  const total = items.reduce((s, x) => s + amountOf[store](x), 0);
  const groups = new Map();
  for (const x of items) {
    const k = x.date.slice(0, 7);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(x);
  }
  view.innerHTML = items.length
    ? `<p class="muted">${items.length} registro${items.length > 1 ? 's' : ''} · ${money(total)}${store === 'fuel' && hasLP() ? ` (Gasolina ${money(sumType(items, 'gasolina'))} · LP ${money(sumType(items, 'lp'))})` : ''}</p>
      ${[...groups].map(([k, xs]) => `<h4 class="group"><span>${cap(fdate(k + '-01', { month: 'long', year: 'numeric' }))}</span><span>${money(xs.reduce((s, x) => s + amountOf[store](x), 0))}</span></h4>
        <ul class="list">${xs.map((x) => row(store, x)).join('')}</ul>`).join('')}`
    : `<div class="empty">${icon(ICON_FOR[store])}<p>Aún no hay registros. Toca <b>+</b> para agregar.</p></div>`;
  bindRows();
}

function renderReminders() {
  const odo = currentOdometer(state);
  const list = alertsFor(odo);
  view.innerHTML = list.length
    ? `<p class="muted">Odómetro actual: ${num(odo)} km</p>${list.map(alertCard).join('')}`
    : `<div class="empty">${icon('bell')}<p>Crea avisos para el cambio de aceite, servicio, verificación o seguro. Te avisaré por kilometraje o por fecha.</p>
        <button class="primary" id="suggest">Agregar sugeridos</button></div>`;
  const s = $('#suggest');
  if (s) s.onclick = async () => {
    const base = { lastKm: odo, lastDate: today(), notes: '' };
    const sugg = [
      { title: 'Cambio de aceite', everyKm: 10000, everyMonths: 6 },
      { title: 'Servicio', everyKm: 20000, everyMonths: 12 },
      { title: 'Rotación de llantas', everyKm: 10000, everyMonths: '' },
      { title: 'Verificación', everyKm: '', everyMonths: 6 },
      { title: 'Seguro', everyKm: '', everyMonths: 12 },
      ...(hasLP() ? [{ title: 'Servicio equipo de gas LP', everyKm: 10000, everyMonths: 12 }] : []),
    ];
    for (const x of sugg) await db.put('reminders', { ...base, ...x, id: uid(), updatedAt: Date.now() });
    await refresh();
    toast('Ajusta las fechas de cada aviso');
  };
  bindRows();
}

// ---------- Finanzas ----------
const FIN_TABS = [
  { id: '', label: 'Hoy', icon: 'sun' },
  { id: 'ingresos', label: 'Ingresos', icon: 'calendar', store: 'income' },
  { id: 'pagos', label: 'Pagos', icon: 'receipt', store: 'bills' },
  { id: 'metas', label: 'Metas', icon: 'target', store: 'goals' },
];
let finMonth = null; // mes que se está viendo (YYYY-MM)
const finRows = new Map(); // id de instancia de pago → pago, para abrirlo al tocarlo
const withFuel = () => !!state.finance.fuel;
const pad2 = (n) => String(n).padStart(2, '0');
const sum = (xs, f) => xs.reduce((s, x) => s + (+f(x) || 0), 0);
const catEmoji = (c) => (c || '📦').split(' ')[0];
const monthLabel = (key) => cap(fdate(key + '-01', { month: 'long', year: 'numeric' }));
const daysText = (d) => (d < 0 ? `venció hace ${-d} día${d === -1 ? '' : 's'}` : d === 0 ? 'vence hoy' : d === 1 ? 'vence mañana' : `en ${d} días`);
const bar = (pct, cls = '') => `<div class="progress ${cls}"><i style="width:${(Math.min(1, Math.max(0, pct || 0)) * 100).toFixed(1)}%"></i></div>`;
const finTile = (label, value, sub = '') => `<div class="tile"><small>${label}</small><b>${value}</b>${sub ? `<span>${sub}</span>` : ''}</div>`;
const monthNav = () => `<div class="monthnav"><button class="ghost" data-m="-1" aria-label="Mes anterior">‹</button><b>${monthLabel(finMonth)}</b><button class="ghost" data-m="1" aria-label="Mes siguiente">›</button></div>`;

function renderFinance(sub) {
  if (sub === 'ajustes') {
    setHeader({ title: 'Ajustes de finanzas', back: '#/finanzas' });
    tabs.hidden = true;
    setFab(null);
    return renderFinSettings();
  }
  const tab = FIN_TABS.find((t) => t.id === sub) || FIN_TABS[0];
  setHeader({ title: 'Finanzas', back: '#/', action: { href: '#/finanzas/ajustes', icon: 'sliders', label: 'Ajustes' } });
  tabs.hidden = false;
  tabs.style.gridTemplateColumns = `repeat(${FIN_TABS.length}, 1fr)`;
  tabs.innerHTML = FIN_TABS.map((t) => `<a href="#/finanzas${t.id ? '/' + t.id : ''}" class="${t === tab ? 'active' : ''}">${icon(t.icon)}<span>${t.label}</span></a>`).join('');
  finMonth ||= monthKey(today());
  finRows.clear();
  setFab(tab.store || 'income');
  if (tab.id === 'ingresos') renderIncome();
  else if (tab.id === 'pagos') renderBills();
  else if (tab.id === 'metas') renderGoals();
  else renderFinToday();
  bindFin();
}

function billRow(b, paid, t) {
  finRows.set(b.id, b);
  const st = billStatus(b, paid, t);
  const label = st.level === 'paid' ? 'Pagado' : `${paid > 0 ? `Abonado ${money(paid)} · ` : ''}${daysText(st.days)}`;
  const daily = st.level !== 'paid' && st.days > 0 ? ` · ${money(st.cuota)}/día` : '';
  return `<li data-bill="${esc(b.id)}" tabindex="0" class="bill ${st.level}">
    <span class="row-icon emoji">${catEmoji(b.category)}</span>
    <span class="row-body"><b>${esc(b.concept)}${b.bill?.repeat ? ' <span class="rep" title="Se repite">↻</span>' : ''}${b.fuel ? ' <span class="rep">⛽</span>' : ''}</b>
      <small><span class="status">${label}</span> · ${fdate(b.date, { day: 'numeric', month: 'short' })}${daily}</small></span>
    <span class="row-amount">${money(st.level === 'paid' ? b.amount : st.pending)}${st.level !== 'paid' && paid > 0 ? `<small>de ${money(b.amount)}</small>` : ''}</span></li>`;
}

function catCard(list) {
  const by = new Map();
  for (const b of list) by.set(b.category, (by.get(b.category) || 0) + b.amount);
  const rows = [...by].filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  if (!rows.length) return '';
  const total = sum(rows, (r) => r[1]);
  return `<section class="card"><h3>Por categoría</h3><div class="cats">${rows.map(([c, v]) => `
    <div class="cat"><span>${esc(c)} <small>${num((v / total) * 100)}%</small></span><b>${money(v)}</b>${bar(v / rows[0][1])}</div>`).join('')}</div></section>`;
}

function renderFinToday() {
  const t = today();
  if (!state.income.length && !state.bills.length && !state.goals.length) {
    view.innerHTML = `
      <div class="empty">
        ${icon('wallet')}
        <h2>Tus finanzas en un vistazo</h2>
        <p>Registra lo que <b>entra</b> cada día y tus <b>pagos</b> con su fecha. Cada día te diré cuánto necesitas juntar para cubrirlos y para tus <b>metas</b>.</p>
        <button class="primary" data-new="income">Registrar ingreso</button>
        <div class="actions"><button data-new="bills">Agregar pago</button><button data-new="goals">Agregar meta</button></div>
      </div>`;
    return;
  }
  const plan = todayPlan(state, t, withFuel());
  const { sim, key } = plan;
  const monthBills = billsIn(state, key, withFuel());
  const next = billsIn(state, addMonths(key, 1), withFuel());
  const upcoming = [...sim.carry.filter((b) => b.date < key + '-01'), ...monthBills, ...next]
    .filter((b) => (sim.paid.get(b.id) || 0) < b.amount).slice(0, 5);
  const earnedMonth = sum(state.income.filter((x) => monthKey(x.date) === key), (x) => x.amount);
  const saved = sum(sim.goals, (g) => g.collected);
  const goalsTotal = sum(sim.goals, (g) => g.amount);
  const pct = plan.meta ? plan.earnedToday / plan.meta : plan.earnedToday ? 1 : 0;
  view.innerHTML = `
    <section class="hero">
      <small>Meta de hoy</small>
      <b>${money(plan.meta)}</b>
      ${bar(pct, pct >= 1 ? 'done' : '')}
      <span>Hoy llevas <b>${money(plan.earnedToday)}</b>${plan.meta > plan.earnedToday ? ` · faltan ${money(plan.meta - plan.earnedToday)}` : plan.meta ? ' · ¡meta cumplida! 🎉' : ''}</span>
      <span class="small">Pagos ${money(plan.metaBills)}/día (quedan ${plan.daysLeft} días del mes) · Metas ${money(plan.metaGoals)}/día</span>
    </section>
    <section class="tiles">
      ${finTile('Ingresos del mes', money(earnedMonth), cap(fdate(key + '-01', { month: 'long' })))}
      ${finTile('Pagos del mes', money(sum(monthBills, (b) => b.amount)), `${monthBills.length} pago${monthBills.length === 1 ? '' : 's'}`)}
      ${finTile('Falta cubrir', money(plan.pending), plan.pending > 0 ? 'Incluye vencidos' : 'Mes cubierto ✓')}
      ${finTile('Ahorrado en metas', money(saved), goalsTotal ? `de ${money(goalsTotal)}` : 'Sin metas')}
    </section>
    <section class="card"><h3>Próximos pagos</h3>${upcoming.length ? `<ul class="list flat">${upcoming.map((b) => billRow(b, sim.paid.get(b.id) || 0, t)).join('')}</ul>` : '<p class="muted small">Sin pagos pendientes 🎉</p>'}</section>
    ${catCard(monthBills)}`;
}

function renderIncome() {
  const key = finMonth;
  const t = today();
  const list = state.income.filter((x) => monthKey(x.date) === key).sort((a, b) => b.date.localeCompare(a.date) || (b.updatedAt || 0) - (a.updatedAt || 0));
  const byDay = new Map();
  for (const x of list) byDay.set(x.date, (byDay.get(x.date) || 0) + (+x.amount || 0));
  const total = sum(list, (x) => x.amount);
  const target = sum(billsIn(state, key, withFuel()), (b) => b.amount);
  const offset = new Date(key + '-01T00:00').getDay();
  const n = monthDays(key);
  let cells = ['D', 'L', 'M', 'M', 'J', 'V', 'S', 'Sem'].map((d) => `<span class="dow">${d}</span>`).join('');
  for (let w = 0; w < Math.ceil((offset + n) / 7); w++) {
    let week = 0;
    for (let d = 0; d < 7; d++) {
      const day = w * 7 + d - offset + 1;
      if (day < 1 || day > n) { cells += '<span class="day out"></span>'; continue; }
      const date = `${key}-${pad2(day)}`;
      const v = byDay.get(date) || 0;
      week += v;
      cells += `<button class="day${date === t ? ' today' : ''}${v ? ' has' : ''}" data-day="${date}" aria-label="${fdate(date)}: ${money(v)}"><small>${day}</small>${v ? compact(v) : ''}</button>`;
    }
    cells += `<span class="day week">${week ? compact(week) : '—'}</span>`;
  }
  const diff = total - target;
  view.innerHTML = `
    ${monthNav()}
    <section class="tiles three">
      ${finTile('Generado', money0(total))}
      ${finTile('Pagos del mes', money0(target))}
      ${finTile(diff >= 0 ? 'Sobra' : 'Falta', money0(Math.abs(diff)))}
    </section>
    <section class="card"><div class="cal">${cells}</div><p class="muted small center">Toca un día para registrar lo que entró.</p></section>
    ${list.length ? `<ul class="list">${list.map((x) => row('income', x)).join('')}</ul>` : ''}`;
}

function renderBills() {
  const key = finMonth;
  const t = today();
  const sim = simulate(state, t, { withFuel: withFuel() });
  const list = billsIn(state, key, withFuel());
  const prev = key === monthKey(t) ? sim.carry.filter((b) => b.date < key + '-01') : [];
  const total = sum(list, (b) => b.amount);
  const covered = sum(list, (b) => sim.paid.get(b.id) || 0);
  view.innerHTML = `
    ${monthNav()}
    ${list.length || prev.length ? `
      <section class="tiles three">
        ${finTile('Total', money0(total))}
        ${finTile('Cubierto', money0(covered), total ? `${num((covered / total) * 100)}%` : '')}
        ${finTile('Falta', money0(total - covered))}
      </section>
      ${prev.length ? `<h4 class="group"><span>De meses anteriores</span><span>${money(sum(prev, (b) => b.amount - (sim.paid.get(b.id) || 0)))}</span></h4>
        <ul class="list">${prev.map((b) => billRow(b, sim.paid.get(b.id) || 0, t)).join('')}</ul>` : ''}
      ${list.length ? `<h4 class="group"><span>${monthLabel(key)}</span><span>${list.length} pago${list.length === 1 ? '' : 's'}</span></h4>
        <ul class="list">${list.map((b) => billRow(b, sim.paid.get(b.id) || 0, t)).join('')}</ul>` : ''}
      ${catCard(list)}`
    : `<div class="empty">${icon('receipt')}<p>Agrega tus pagos: colegiatura, servicios, tandas, tarjetas… Si se repite, márcalo y aparecerá solo cada mes.</p></div>`}`;
}

function renderGoals() {
  const t = today();
  const sim = simulate(state, t, { withFuel: withFuel() });
  const gs = sim.goals;
  if (!gs.length) {
    view.innerHTML = `<div class="empty">${icon('target')}<p>Crea metas como llantas, Navidad o un viaje. Lo que te sobre cada mes se aparta solo para ellas, en orden de fecha.</p></div>`;
    return;
  }
  const daily = sum(gs, (g) => g.cuota);
  view.innerHTML = `
    <section class="tiles three">
      ${finTile('Apartar por día', money0(daily))}
      ${finTile('Por semana', money0(daily * 7))}
      ${finTile('Por mes', money0(daily * 30))}
    </section>
    <p class="muted small">Cuentan las metas de los próximos ${GOAL_WINDOW} días. Ahorrado: <b>${money(sum(gs, (g) => g.collected))}</b> de ${money(sum(gs, (g) => g.amount))}${sim.free > 0 ? ` · sobrante libre ${money(sim.free)}` : ''}.</p>
    <ul class="list">${gs.map(({ g, amount, collected, pending, days, cuota }) => {
      const done = pending <= 0;
      const status = done ? '✓ Lista' : days < 0 ? 'Vencida' : days <= GOAL_WINDOW ? `${money(cuota)}/día` : 'Más adelante';
      return `<li data-goal="${g.id}" tabindex="0" class="goal ${done ? 'paid' : days < 0 ? 'overdue' : ''}">
        <span class="row-icon emoji">${catEmoji(g.category)}</span>
        <span class="row-body"><b>${esc(g.concept)}</b>
          <small><span class="status">${status}</span> · ${fdate(g.date, { day: 'numeric', month: 'short', year: '2-digit' })}</small>
          ${bar(amount ? collected / amount : 0, done ? 'done' : '')}</span>
        <span class="row-amount">${money(collected)}<small>de ${money(amount)}</small></span></li>`;
    }).join('')}</ul>`;
}

function renderFinSettings() {
  view.innerHTML = `
    <form class="card form" id="fin">
      <h3>Opciones</h3>
      <label class="check"><input type="checkbox" name="fuel" ${state.finance.fuel ? 'checked' : ''}><span>Contar las cargas del vehículo como pagos<small>Cada carga de combustible aparece en Pagos como 🚗 Vehículo. Si la activas, no captures el combustible dos veces.</small></span></label>
      <footer><button class="primary">Guardar</button></footer>
    </form>
    <section class="card">
      <h3>Cómo se calcula</h3>
      <p class="muted small">Lo que entra cada mes cubre tus pagos en orden de fecha, empezando por los vencidos. Lo que sobra se aparta para tus metas, también en orden de fecha. La <b>meta de hoy</b> es lo que falta del mes entre los días que quedan, más lo que toca apartar para las metas de los próximos ${GOAL_WINDOW} días.</p>
    </section>
    <section class="card">
      <h3>Importar movimientos</h3>
      <p class="muted small">Agrega ingresos, pagos y metas desde un archivo JSON sin borrar lo que ya tienes. El respaldo completo está en Ajustes del vehículo.</p>
      <label class="btn">Importar JSON<input type="file" id="finImport" accept="application/json,.json" hidden></label>
    </section>`;
  $('#fin').onsubmit = async (e) => {
    e.preventDefault();
    await db.setSetting('finance', { ...state.finance, fuel: e.target.elements.fuel.checked });
    await refresh();
    toast('Guardado');
  };
  $('#finImport').onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const n = await db.mergeFinance(JSON.parse(await file.text()));
      await refresh();
      toast(`${n} movimientos importados`);
    } catch (err) {
      alert('No se pudo importar: ' + err.message);
    }
  };
}

function bindFin() {
  view.querySelectorAll('[data-bill]').forEach((li) => {
    const b = finRows.get(li.dataset.bill);
    const open = () => {
      if (b.fuel) return openForm('fuel', b.fuel);
      const extra = b.bill.repeat
        ? { label: `Omitir el ${fdate(b.date, { day: 'numeric', month: 'short' })}`, run: () => db.put('bills', { ...b.bill, skip: [...(b.bill.skip || []), b.date], updatedAt: Date.now() }) }
        : null;
      openForm('bills', b.bill, { extra });
    };
    li.onclick = open;
    li.onkeydown = (e) => { if (e.key === 'Enter') open(); };
  });
  view.querySelectorAll('[data-goal]').forEach((li) => {
    const open = () => openForm('goals', state.goals.find((g) => g.id === li.dataset.goal));
    li.onclick = open;
    li.onkeydown = (e) => { if (e.key === 'Enter') open(); };
  });
  view.querySelectorAll('[data-day]').forEach((el) => (el.onclick = () => openForm('income', null, { preset: { date: el.dataset.day } })));
  view.querySelectorAll('[data-new]').forEach((el) => (el.onclick = () => openForm(el.dataset.new)));
  view.querySelectorAll('[data-m]').forEach((el) => (el.onclick = () => { finMonth = addMonths(finMonth, +el.dataset.m); render(); }));
  bindRows();
}

function renderSetup() {
  const f = (k, label, type, extra = '') => `<label class="field"><span>${label}</span><input name="${k}" type="${type}" ${extra}></label>`;
  view.innerHTML = `
    <p class="muted">Antes de registrar cargas, cuéntame de tu vehículo. Podrás cambiarlo después en Ajustes.</p>
    <form class="card form" id="setup">
      <div class="grid">
        ${f('name', 'Nombre', 'text', 'required placeholder="Ej. Mi Versa"')}
        ${f('model', 'Marca / modelo / año', 'text', 'placeholder="Ej. Nissan Versa 2018"')}
        ${f('plate', 'Placas', 'text')}
        ${f('odometer', 'Kilometraje actual', 'number', 'required inputmode="numeric" step="1" min="0" placeholder="Lo que marca el tablero"')}
        <label class="check"><input type="checkbox" name="lp" id="setup-lp"><span>Usa gas LP<small>El rendimiento se calcula con el LP; la gasolina cuenta como gasto</small></span></label>
        <div class="grid lp-only" hidden style="grid-column: 1 / -1">
          ${f('tankLp', 'Tanque gas LP (L)', 'number', 'inputmode="decimal" step="0.1" min="0"')}
          ${f('kmlGas', 'Rendimiento con gasolina (km/l)', 'number', 'inputmode="decimal" step="0.1" min="0" placeholder="Para calcular el ahorro"')}
        </div>
        ${f('tank', 'Tanque gasolina (L)', 'number', 'inputmode="decimal" step="0.1" min="0"')}
      </div>
      <footer><button class="primary">Guardar y continuar</button></footer>
    </form>`;
  const form = $('#setup');
  $('#setup-lp').onchange = (e) => ($('.lp-only', form).hidden = !e.target.checked);
  form.onsubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    data.name = data.name.trim();
    data.lp = data.lp === 'on';
    data.odometer = +data.odometer;
    data.currency = 'MXN';
    await db.setSetting('vehicle', { ...state.vehicle, ...data });
    await refresh();
    toast('¡Listo! Ya puedes registrar cargas');
  };
  setTimeout(() => form.elements.name.focus(), 50);
}

function renderSettings() {
  const v = state.vehicle;
  const f = (k, label, type = 'text', extra = '') => `<label class="field"><span>${label}</span><input name="${k}" type="${type}" value="${esc(v[k] ?? '')}" ${extra}></label>`;
  view.innerHTML = `
    <form class="card form" id="veh">
      <h3>Vehículo</h3>
      <div class="grid">
        ${f('name', 'Nombre', 'text', 'required placeholder="Ej. Mi Versa"')}
        ${f('model', 'Marca / modelo / año')}
        ${f('plate', 'Placas')}
        <label class="check"><input type="checkbox" name="lp" ${v.lp ? 'checked' : ''}><span>También usa gas LP<small>El rendimiento se calcula con el LP; la gasolina cuenta como gasto</small></span></label>
        <label class="field"><span>Tipo de gasolina</span><select name="fuelType">${['Magna / Regular', 'Premium', 'Diésel', 'Eléctrico', 'Híbrido'].map((o) => `<option ${o === v.fuelType ? 'selected' : ''}>${o}</option>`).join('')}</select></label>
        ${f('tank', 'Tanque gasolina (L)', 'number', 'inputmode="decimal" step="0.1" min="0"')}
        ${f('tankLp', 'Tanque gas LP (L)', 'number', 'inputmode="decimal" step="0.1" min="0"')}
        ${f('kmlGas', 'Rendimiento en gasolina (km/l)', 'number', 'inputmode="decimal" step="0.1" min="0" placeholder="Para calcular el ahorro"')}
        ${f('odometer', 'Odómetro inicial (km)', 'number', 'inputmode="numeric" step="1" min="0"')}
        ${f('currency', 'Moneda (código)', 'text', 'maxlength="3" placeholder="MXN"')}
      </div>
      <footer><button class="primary">Guardar</button></footer>
    </form>
    <section class="card">
      <h3>Respaldo</h3>
      <p class="muted small">Tus datos viven solo en este dispositivo. Exporta un respaldo de vez en cuando (por ejemplo a Drive).</p>
      <div class="actions">
        <button id="export">Exportar JSON</button>
        <button id="exportCsv">Exportar CSV de cargas</button>
        <label class="btn">Importar JSON<input type="file" id="import" accept="application/json,.json" hidden></label>
      </div>
    </section>
    <section class="card">
      <h3>Zona de peligro</h3>
      <button class="danger" id="wipe">Borrar todos los datos</button>
    </section>
    <p class="muted small center">SecondBrain · v${VERSION}</p>`;

  $('#veh').onsubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    data.currency = (data.currency || 'MXN').toUpperCase();
    data.lp = data.lp === 'on';
    data.odometer = data.odometer === '' ? '' : +data.odometer;
    await db.setSetting('vehicle', { ...v, ...data });
    await refresh();
    toast('Vehículo guardado');
  };
  $('#export').onclick = async () => download(`secondbrain-${today()}.json`, JSON.stringify(await db.exportAll(), null, 2), 'application/json');
  $('#exportCsv').onclick = () => {
    const cols = ['date', 'fuelType', 'odometer', 'liters', 'pricePerLiter', 'total', 'full', 'station', 'notes'];
    const q = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;
    const csv = [cols.join(','), ...[...state.fuel].sort((a, b) => a.date.localeCompare(b.date)).map((x) => cols.map((c) => q(c === 'fuelType' ? FUELS[fuelTypeOf(x)] : x[c])).join(','))].join('\n');
    download(`cargas-${today()}.csv`, '﻿' + csv, 'text/csv');
  };
  $('#import').onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!confirm('Esto reemplazará todos los datos actuales. ¿Continuar?')) return;
      await db.importAll(data);
      await refresh();
      toast('Datos importados');
    } catch (err) {
      alert('No se pudo importar: ' + err.message);
    }
  };
  $('#wipe').onclick = async () => {
    if (!confirm('¿Borrar TODOS los datos? Esto no se puede deshacer.')) return;
    await db.clearAll();
    await refresh();
    toast('Datos borrados');
  };
}

function download(name, text, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

const VERSION = '1.3.0';

async function refresh() {
  await load();
  render();
}

window.addEventListener('hashchange', render);
sheet.addEventListener('click', (e) => { if (e.target === sheet) sheet.close(); });

refresh();
if (navigator.storage?.persist) navigator.storage.persist();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js');
