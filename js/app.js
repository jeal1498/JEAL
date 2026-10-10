import * as db from './db.js';
import * as backup from './backup.js';
import { CATEGORIES, REPEATS, BUDGET_KINDS, GOAL_WINDOW, WORK_DAYS, VEHICLE_CAT, monthKey, monthDays, daysBetween, addMonths, billsIn, billStatus, monthPlan, todayPlan, goalsPlan, incomeMonth } from './finance.js';
import { fuelStats, fuelStatsByType, FUELS, fuelTypeOf, currentOdometer, firstOdometer, totals, monthlySpend, reminderStatus, amountOf } from './calc.js';

const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const today = () => new Date().toLocaleDateString('en-CA');
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));

const state = { fuel: [], maintenance: [], expenses: [], reminders: [], income: [], bills: [], goals: [], budgets: [], notes: [], tasks: [], habits: [], journal: [], vehicle: {}, finance: {} };

async function load() {
  const [fuel, maintenance, expenses, reminders, income, bills, goals, budgets, spending, notes, tasks, habits, journal, vehicle, finance] = await Promise.all([
    db.all('fuel'), db.all('maintenance'), db.all('expenses'), db.all('reminders'),
    db.all('income'), db.all('bills'), db.all('goals'), db.all('budgets'), db.all('spending'),
    db.all('notes'), db.all('tasks'), db.all('habits'), db.all('journal'), db.getSetting('vehicle'), db.getSetting('finance'),
  ]);
  state.backup = await backup.getConfig();
  // Los gastos de la vista estilo MonAi (ya retirada) pasan a ser pagos del mes.
  for (const x of spending) {
    const bill = { id: x.id, concept: x.concept || x.category, amount: x.amount, category: x.category, date: x.date, notes: x.notes || '', createdAt: x.createdAt, updatedAt: Date.now() };
    await db.put('bills', bill);
    await db.remove('spending', x.id);
    bills.push(bill);
  }
  Object.assign(state, { fuel, maintenance, expenses, reminders, income, bills, goals, budgets, notes, tasks, habits, journal, vehicle: vehicle || {}, finance: finance || {} });
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
  cloud: '<path d="M17.5 19H7a5 5 0 1 1 1.4-9.8A6 6 0 0 1 20 11.5 3.75 3.75 0 0 1 17.5 19z"/>',
  wallet: '<path d="M20 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h15v13H5a2 2 0 0 1-2-2V5"/><path d="M16 13h.01"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  note: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
  tasks: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="m8 12 3 3 5-6"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
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
  budgets: {
    title: 'Presupuesto', newLabel: 'Nuevo',
    fields: [
      { k: 'concept', label: 'Nombre', type: 'text', req: true, placeholder: 'Ej. Combustible' },
      { k: 'amount', label: 'Tope al mes', type: 'number', step: '0.01', req: true },
      { k: 'category', label: 'Categoría', type: 'select', options: CATEGORIES, req: true },
      { k: 'kind', label: 'Qué cuenta', type: 'select', options: BUDGET_KINDS },
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
  notes: {
    title: 'Nota',
    fields: [
      { k: 'title', label: 'Título', type: 'text', req: true, placeholder: 'Ej. Ideas para el cumpleaños' },
      { k: 'body', label: 'Nota', type: 'textarea', rows: 8 },
      { k: 'tags', label: 'Etiquetas (separadas por coma)', type: 'text', placeholder: 'Ej. casa, ideas', big: true },
      { k: 'pinned', label: 'Fijar arriba', type: 'checkbox' },
    ],
  },
  tasks: {
    title: 'Pendiente', newLabel: 'Nuevo',
    fields: [
      { k: 'title', label: 'Qué hay que hacer', type: 'text', req: true, placeholder: 'Ej. Pagar la luz', big: true },
      { k: 'due', label: 'Para cuándo (opcional)', type: 'date' },
      { k: 'notes', label: 'Notas', type: 'textarea' },
    ],
  },
  habits: {
    title: 'Hábito', newLabel: 'Nuevo',
    fields: [
      { k: 'name', label: 'Hábito', type: 'text', req: true, placeholder: 'Ej. Tomar 2 L de agua' },
      { k: 'emoji', label: 'Emoji (opcional)', type: 'text', placeholder: '💧' },
    ],
  },
};

const uniq = (arr) => [...new Set(arr.filter(Boolean))].sort();

// ---------- Formulario (hoja inferior) ----------
const sheet = $('#sheet');

function openForm(store, item = null, { preset = {}, extra = null, onSaved = null } = {}) {
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
      input = `<textarea ${common} rows="${f.rows || 2}">${esc(v(f))}</textarea>`;
    } else {
      const list = f.list ? `list="dl-${f.k}"` : '';
      const mode = f.type === 'number' ? `inputmode="${f.step === '1' ? 'numeric' : 'decimal'}" step="${f.step}" min="0"` : '';
      input = `<input type="${f.type}" ${common} ${mode} ${list} value="${esc(v(f))}">`;
      if (f.list) input += `<datalist id="dl-${f.k}">${f.list().map((o) => `<option value="${esc(o)}">`).join('')}</datalist>`;
    }
    // Sugerencias visibles (el datalist casi no se ve en el teléfono): botones con lo ya capturado.
    const sugg = f.list && f.list().length ? `<div class="sugg" data-for="${f.k}"></div>` : '';
    return `<label class="field ${f.type === 'textarea' || sugg || f.big ? 'wide' : ''} ${f.big ? 'big' : ''}" for="${id}"><span>${f.label}</span>${input}</label>${sugg}`;
  };

  sheet.innerHTML = `
    <form method="dialog" class="form">
      <header><h2>${isNew ? schema.newLabel || 'Nueva' : 'Editar'}: ${schema.title}</h2>
        <button type="button" class="ghost" data-close aria-label="Cerrar">✕</button></header>
      <div class="grid">${schema.fields.map(field).join('')}</div>
      ${store === 'bills' ? `<div class="vehlink" hidden><p>Los gastos de 🚗 Vehículo se guardan en el módulo Vehículo para no duplicarlos. ¿Qué fue?</p>
        <div class="actions"><button type="button" data-veh="fuel">Carga</button><button type="button" data-veh="maintenance">Servicio</button><button type="button" data-veh="expenses">Otro gasto</button></div>
        <small>Si es algo planeado a futuro, guárdalo aquí como pago normal.</small></div>` : ''}
      <p class="warn" hidden></p>
      <footer>
        ${isNew ? '' : '<button type="button" class="danger" data-delete>Eliminar</button>'}
        ${extra ? `<button type="button" data-extra>${esc(extra.label)}</button>` : ''}
        <button type="submit" class="primary">Guardar</button>
      </footer>
    </form>`;
  const form = $('form', sheet);
  if (store === 'fuel') wireFuelMath(form);
  if (store === 'bills') wireVehicleLink(form, store, item);
  schema.fields.filter((f) => f.list).forEach((f) => wireSuggestions(form, store, f, isNew));

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
    if (onSaved) await onSaved();
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

// Botones con valores ya usados, filtrados mientras escribes. En un registro nuevo,
// elegir uno copia monto/categoría del último registro con ese valor.
function wireSuggestions(form, store, f, isNew) {
  const box = $(`.sugg[data-for="${f.k}"]`, form);
  const el = form.elements[f.k];
  if (!box || !el) return;
  const all = f.list();
  const norm = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const draw = () => {
    const q = norm(el.value.trim());
    const items = all.filter((o) => norm(o) !== q && norm(o).includes(q));
    box.innerHTML = items.map((o) => `<button type="button">${esc(o)}</button>`).join('');
    box.hidden = !items.length;
  };
  el.addEventListener('input', draw);
  box.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    el.value = b.textContent;
    if (isNew) {
      const last = state[store].filter((x) => x[f.k] === el.value).sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')) || (b.createdAt || 0) - (a.createdAt || 0))[0];
      for (const k of ['amount', 'category']) {
        const input = form.elements[k];
        if (last && input && last[k] !== '' && last[k] != null && (k === 'category' ? [...(input.options || input)].some((o) => o.value === last[k]) : input.value === '')) {
          input.value = last[k];
          form.dispatchEvent(new Event('change'));
        }
      }
    }
    draw();
  });
  draw();
}

// Pago de vehículo en finanzas → se captura en el módulo Vehículo (única fuente), con fecha y monto ya puestos.
function wireVehicleLink(form, store, item) {
  const box = $('.vehlink', form);
  const sync = () => (box.hidden = form.elements.category.value !== VEHICLE_CAT);
  form.addEventListener('change', sync);
  sync();
  box.querySelectorAll('[data-veh]').forEach((b) => (b.onclick = () => {
    const { date, amount, concept } = Object.fromEntries(['date', 'amount', 'concept'].map((k) => [k, form.elements[k].value.trim()]));
    const match = (list) => list.find((t) => concept && t.toLowerCase().includes(concept.toLowerCase())) || 'Otro';
    const preset = {
      fuel: { date: date || today(), total: amount },
      maintenance: { date: date || today(), cost: amount, type: match(MAINT_TYPES), notes: concept },
      expenses: { date: date || today(), amount, category: match(EXPENSE_TYPES), notes: concept },
    }[b.dataset.veh];
    sheet.close();
    // Si venía de un pago ya guardado, se elimina al guardarlo en Vehículo.
    openForm(b.dataset.veh, null, { preset, onSaved: item ? () => db.remove(store, item.id) : null });
  }));
}

// Litros × precio = total (y al revés).
function wireFuelMath(form) {
  const { liters, pricePerLiter, total, fuelType } = form.elements;
  const n = (el) => parseFloat(el.value);
  if (n(total) && n(pricePerLiter) && !n(liters)) liters.value = (n(total) / n(pricePerLiter)).toFixed(2);
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
  else if (mod === 'respaldo') renderBackup();
  else if (mod === 'buscar') renderSearch();
  else if (mod === 'notas') renderNotes();
  else if (mod === 'pendientes') renderTasks();
  else if (mod === 'dia') renderDay();
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
  setHeader({ title: 'SecondBrain', action: { href: '#/buscar', icon: 'search', label: 'Buscar' } });
  setFab(null);
  tabs.hidden = true;
  const t = today();
  const h = new Date().getHours();
  const hello = h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
  // Números del día
  const plan = todayPlan(state, t);
  const hasFin = state.income.length || state.bills.length;
  const tasks = state.tasks.filter((x) => !x.done && x.due && x.due <= t).sort((a, b) => a.due.localeCompare(b.due));
  const late = tasks.filter((x) => x.due < t).length;
  const habits = [...state.habits].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  const habitsDone = habits.filter((x) => (x.done || []).includes(t)).length;
  const j = state.journal.find((x) => x.date === t) || {};
  // Lo de hoy
  const bills = hasFin ? plan.items.filter((b) => (plan.paid.get(b.id) || 0) < b.amount && daysBetween(t, b.date) <= 7) : [];
  const odo = currentOdometer(state);
  const alerts = alertsFor(odo).filter((a) => a.s.level !== 'ok');
  const month = monthlySpend(state, 1)[0].total;
  const m0 = (n) => money(Math.round(n)).replace(/\.00$/, '');
  const bk = state.backup || {};
  const tile = (href, label, value, sub, cls = '') => `<a class="tile ${cls}" href="${href}"><small>${label}</small><b>${value}</b><span>${sub}</span></a>`;
  dayDate = t;
  view.innerHTML = `
    <section class="hello"><b>${hello}</b><span>${cap(fdate(t, { weekday: 'long', day: 'numeric', month: 'long' }))}</span></section>
    <section class="tiles three">
      ${tile('#/finanzas', 'Meta de hoy', hasFin ? m0(plan.meta) : '—', hasFin ? `llevas ${m0(plan.earnedToday)}` : 'Configura Finanzas', hasFin && plan.meta && plan.earnedToday >= plan.meta ? 'good' : '')}
      ${tile('#/pendientes', 'Pendientes', tasks.length, late ? `<em class="badge">${late} vencido${late > 1 ? 's' : ''}</em>` : 'para hoy')}
      ${tile('#/dia', 'Hábitos', habits.length ? `${habitsDone}/${habits.length}` : '—', habits.length ? (habitsDone === habits.length ? '¡completos! 🎉' : 'hoy') : 'Agrega en Mi día', habits.length && habitsDone === habits.length ? 'good' : '')}
    </section>
    <section class="card mood-card"><h3>¿Cómo te sientes hoy?</h3>
      <div class="moods" role="radiogroup" aria-label="¿Cómo te sientes hoy?">${MOODS.map((m) => `<button class="${j.mood === m ? 'on' : ''}" data-hmood="${m}" role="radio" aria-checked="${j.mood === m}">${m}</button>`).join('')}</div>
      <a class="link" href="#/dia">${j.text ? 'Ver tu diario de hoy →' : 'Escribir en el diario →'}</a></section>
    ${tasks.length ? `<section class="card"><h3>Pendientes de hoy</h3><ul class="list flat">${tasks.map(taskRow).join('')}</ul><a class="link" href="#/pendientes">Ver todos →</a></section>` : ''}
    ${habits.length ? `<section class="card"><h3>Hábitos de hoy</h3><ul class="list flat">${habits.map((x) => habitRow(x, t)).join('')}</ul></section>` : ''}
    ${bills.length ? `<section class="card"><h3>Pagos de esta semana</h3><ul class="list flat">${bills.map((b) => billRow(b, plan.paid.get(b.id) || 0, t)).join('')}</ul><a class="link" href="#/finanzas/mes">Ver la hoja del mes →</a></section>` : ''}
    ${alerts.length ? `<p class="group"><span>Avisos del auto</span></p>${alerts.map(alertCard).join('')}` : ''}
    <p class="group"><span>Módulos</span></p>
    <nav class="modgrid">
      ${modTile('#/vehiculo', 'car', esc(state.vehicle.name || 'Vehículo'), !state.vehicle.name ? 'Configúralo' : `${m0(month)} este mes`)}
      ${modTile('#/finanzas', 'wallet', 'Finanzas', hasFin ? (plan.pending > 0 ? `Faltan ${m0(plan.pending)}` : 'Mes cubierto') : 'Empieza aquí')}
      ${modTile('#/pendientes', 'tasks', 'Pendientes', `${state.tasks.filter((x) => !x.done).length} abiertos`)}
      ${modTile('#/notas', 'note', 'Notas', `${state.notes.length} nota${state.notes.length === 1 ? '' : 's'}`)}
      ${modTile('#/dia', 'heart', 'Mi día', 'Diario y hábitos')}
      ${modTile('#/respaldo', 'cloud', 'Respaldo', !bk.url ? '<span class="badge">Sin configurar</span>' : bk.error ? '<span class="badge">Falló</span>' : bk.last ? `Al día · ${ago(bk.last)}` : 'Pendiente')}
    </nav>`;
  bindFin();
  bindTicks();
  view.querySelectorAll('[data-hmood]').forEach((b) => (b.onclick = async () => {
    const mood = j.mood === b.dataset.hmood ? '' : b.dataset.hmood;
    const id = `dia-${t}`;
    if (!mood && !j.text) await db.remove('journal', id);
    else await db.put('journal', { ...j, id, date: t, mood, text: j.text || '', createdAt: j.createdAt || Date.now(), updatedAt: Date.now() });
    await refresh();
  }));
}
const modTile = (href, ic, name, sub) => `<a class="modtile" href="${href}"><span class="module-icon">${icon(ic)}</span><b>${name}</b><small>${sub}</small></a>`;

// ---------- Buscador general ----------
// Busca en todo lo guardado (Vehículo y Finanzas); cada palabra debe aparecer en el registro.
const fold = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const SEARCH = [
  { store: 'fuel', label: 'Cargas', icon: 'fuel', show: (x) => ({ title: `${x.fuelType === 'lp' ? 'Gas LP' : 'Gasolina'} · ${num(x.liters, 2)} L`, amount: x.total }) },
  { store: 'maintenance', label: 'Servicio', icon: 'wrench', show: (x) => ({ title: x.type || 'Servicio', amount: x.cost }) },
  { store: 'expenses', label: 'Gastos del vehículo', icon: 'receipt', show: (x) => ({ title: x.category || 'Gasto', amount: x.amount }) },
  { store: 'reminders', label: 'Avisos', icon: 'bell', show: (x) => ({ title: x.title, date: x.lastDate }) },
  { store: 'income', label: 'Ingresos', icon: 'wallet', show: (x) => ({ title: x.concept || 'Ingreso', amount: x.amount }) },
  { store: 'bills', label: 'Pagos', icon: 'calendar', show: (x) => ({ title: `${catEmoji(x.category)} ${x.concept}`, amount: x.amount }) },
  { store: 'goals', label: 'Metas', icon: 'target', show: (x) => ({ title: `${catEmoji(x.category)} ${x.concept}`, amount: x.amount }) },
  { store: 'notes', label: 'Notas', icon: 'note', show: (x) => ({ title: x.title, sub: x.body }) },
  { store: 'tasks', label: 'Pendientes', icon: 'tasks', show: (x) => ({ title: (x.done ? '✓ ' : '') + x.title, date: x.due }) },
  { store: 'journal', label: 'Diario', icon: 'heart', show: (x) => ({ title: `${x.mood || ''} ${fdate(x.date, { weekday: 'long', day: 'numeric', month: 'long' })}`.trim(), sub: x.text }), open: (x) => { dayDate = x.date; location.hash = '#/dia'; } },
  { store: 'habits', label: 'Hábitos', icon: 'check', show: (x) => ({ title: `${x.emoji || ''} ${x.name}`.trim() }) },
];
const SKIP_KEYS = new Set(['id', 'createdAt', 'updatedAt', 'skip', 'doneAt']);
function haystack(g, x) {
  const parts = [g.label];
  for (const [k, v] of Object.entries(x)) {
    if (SKIP_KEYS.has(k) || v == null || typeof v === 'object') continue;
    parts.push(v);
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) parts.push(fdate(v, { day: 'numeric', month: 'long', year: 'numeric' }));
    if (k === 'fuelType') parts.push(v === 'lp' ? 'gas lp' : 'gasolina');
  }
  return fold(parts.join(' '));
}
let searchQ = '';
const searchHits = [];
function searchResults(q) {
  // "$1,490" → "1490": los montos se guardan sin formato.
  const terms = fold(q).replace(/(\d)[,\s](?=\d{3}\b)/g, '$1').replace(/\$/g, '').split(/\s+/).filter(Boolean);
  searchHits.length = 0;
  if (!terms.length) return '<p class="muted small">Escribe para buscar en cargas, servicios, gastos, avisos, ingresos, pagos y metas. Ej. <i>llantas</i>, <i>octubre</i>, <i>1490</i>.</p>';
  let html = '';
  for (const g of SEARCH) {
    const found = state[g.store].filter((x) => { const h = haystack(g, x); return terms.every((t) => h.includes(t)); })
      .sort((a, b) => String(b.date || b.lastDate || '').localeCompare(a.date || a.lastDate || ''));
    if (!found.length) continue;
    html += `<p class="muted small">${g.label} (${found.length})</p><ul class="list">${found.slice(0, 30).map((x) => {
      const s = g.show(x);
      const date = g.store === 'journal' ? '' : x.date || s.date;
      const extra = s.sub ?? x.notes;
      searchHits.push({ g, item: x });
      return `<li data-hit="${searchHits.length - 1}" tabindex="0">
        <span class="row-icon">${icon(g.icon)}</span>
        <span class="row-body"><b>${esc(s.title)}</b><small>${date ? fdate(date) : ''}${extra ? `${date ? ' · ' : ''}${esc(extra)}` : ''}</small></span>
        <span class="row-amount">${s.amount != null && s.amount !== '' ? money(+s.amount) : ''}</span></li>`;
    }).join('')}</ul>${found.length > 30 ? `<p class="muted small">…y ${found.length - 30} más. Escribe algo más específico.</p>` : ''}`;
  }
  return html || '<p class="muted">Sin resultados.</p>';
}
function renderSearch() {
  setHeader({ title: 'Buscar', back: '#/' });
  setFab(null);
  tabs.hidden = true;
  view.innerHTML = `<input type="search" id="q" class="search" placeholder="Buscar en todo…" autocomplete="off" value="${esc(searchQ)}" aria-label="Buscar">
    <div id="hits"></div>`;
  const input = $('#q', view);
  const hits = $('#hits', view);
  const update = () => {
    hits.innerHTML = searchResults(searchQ);
    hits.querySelectorAll('[data-hit]').forEach((li) => {
      const open = () => { const h = searchHits[li.dataset.hit]; h.g.open ? h.g.open(h.item) : openForm(h.g.store, h.item); };
      li.onclick = open;
      li.onkeydown = (e) => { if (e.key === 'Enter') open(); };
    });
  };
  input.oninput = () => { searchQ = input.value; update(); };
  update();
  if (!searchQ) input.focus();
}

// ---------- Pendientes ----------
const dayDiff = (a, b) => Math.round((new Date(a + 'T00:00') - new Date(b + 'T00:00')) / 864e5);
function tasksSummary() {
  const open = state.tasks.filter((x) => !x.done);
  if (!open.length) return 'Nada pendiente';
  const t = today();
  const late = open.filter((x) => x.due && x.due < t).length;
  const now = open.filter((x) => x.due === t).length;
  const parts = [`${open.length} pendiente${open.length > 1 ? 's' : ''}`];
  if (now) parts.push(`${now} para hoy`);
  if (late) parts.push(`<span class="badge">${late} vencido${late > 1 ? 's' : ''}</span>`);
  return parts.join(' · ');
}
function taskRow(x) {
  const t = today();
  const d = x.due ? dayDiff(x.due, t) : null;
  const when = x.done ? `Hecho ${fdate(x.doneAt, { day: 'numeric', month: 'short' })}` : d === null ? '' : d < 0 ? `<span class="badge">Vencido · ${fdate(x.due, { day: 'numeric', month: 'short' })}</span>` : d === 0 ? 'Hoy' : d === 1 ? 'Mañana' : fdate(x.due, { weekday: 'short', day: 'numeric', month: 'short' });
  const sub = [when, x.notes ? esc(x.notes) : ''].filter(Boolean).join(' · ');
  return `<li data-task="${x.id}" tabindex="0" class="${x.done ? 'done' : ''}">
    <button class="tick ${x.done ? 'on' : ''}" data-tick="${x.id}" aria-label="${x.done ? 'Marcar como no hecho' : 'Marcar como hecho'}">${icon('check')}</button>
    <span class="row-body"><b>${esc(x.title)}</b>${sub ? `<small>${sub}</small>` : ''}</span></li>`;
}
function renderTasks() {
  setHeader({ title: 'Pendientes', back: '#/' });
  setFab('tasks');
  tabs.hidden = true;
  const t = today();
  const open = state.tasks.filter((x) => !x.done).sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999') || (a.createdAt || 0) - (b.createdAt || 0));
  const done = state.tasks.filter((x) => x.done).sort((a, b) => String(b.doneAt || '').localeCompare(a.doneAt || ''));
  const groups = [
    ['Vencidos', open.filter((x) => x.due && x.due < t)],
    ['Hoy', open.filter((x) => x.due === t)],
    ['Próximos', open.filter((x) => x.due && x.due > t)],
    ['Sin fecha', open.filter((x) => !x.due)],
  ].filter(([, xs]) => xs.length);
  view.innerHTML = !state.tasks.length
    ? `<div class="empty">${icon('tasks')}<h2>Sin pendientes</h2><p>Anota lo que tengas que hacer. Con fecha, te avisa aquí y en Inicio cuando toque.</p><button class="primary" data-new="tasks">＋ Nuevo pendiente</button></div>`
    : `${groups.map(([l, xs]) => `<p class="group"><span>${l}</span><span>${xs.length}</span></p><ul class="list">${xs.map(taskRow).join('')}</ul>`).join('') || '<p class="muted">Todo hecho 🎉</p>'}
      ${done.length ? `<details class="card"><summary>Hechos (${done.length})</summary><ul class="list flat">${done.slice(0, 50).map(taskRow).join('')}</ul></details>` : ''}`;
  bindMine();
}
async function toggleTask(id) {
  const x = state.tasks.find((y) => y.id === id);
  await db.put('tasks', { ...x, done: !x.done, doneAt: x.done ? '' : today(), updatedAt: Date.now() });
  await refresh();
}

// ---------- Notas ----------
let noteTag = '';
const tagsOf = (x) => String(x.tags || '').split(',').map((t) => t.trim()).filter(Boolean);
function renderNotes() {
  setHeader({ title: 'Notas', back: '#/' });
  setFab('notes');
  tabs.hidden = true;
  const all = uniq(state.notes.flatMap(tagsOf));
  if (noteTag && !all.includes(noteTag)) noteTag = '';
  const notes = state.notes.filter((x) => !noteTag || tagsOf(x).includes(noteTag))
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || (b.updatedAt || 0) - (a.updatedAt || 0));
  view.innerHTML = !state.notes.length
    ? `<div class="empty">${icon('note')}<h2>Sin notas</h2><p>Guarda ideas, datos o lo que quieras recordar. Ponles etiquetas para encontrarlas rápido.</p><button class="primary" data-new="notes">＋ Nueva nota</button></div>`
    : `${all.length ? `<div class="chips">${['', ...all].map((t) => `<button class="${t === noteTag ? 'on' : ''}" data-tagf="${esc(t)}">${t ? esc(t) : 'Todas'}</button>`).join('')}</div>` : ''}
      <ul class="list">${notes.map((x) => `<li data-store="notes" data-id="${x.id}" tabindex="0">
        <span class="row-body"><b>${x.pinned ? '📌 ' : ''}${esc(x.title)}</b>
          <small>${x.body ? esc(x.body.replace(/\s+/g, ' ')) : fdate(new Date(x.updatedAt || x.createdAt).toLocaleDateString('en-CA'))}</small>
          ${tagsOf(x).length ? `<span class="tags">${tagsOf(x).map((t) => `<i>${esc(t)}</i>`).join('')}</span>` : ''}</span></li>`).join('')}</ul>`;
  view.querySelectorAll('[data-tagf]').forEach((b) => (b.onclick = () => { noteTag = b.dataset.tagf; renderNotes(); }));
  bindMine();
}

// ---------- Mi día: diario + hábitos ----------
let dayDate = '';
const MOODS = ['😞', '😕', '😐', '🙂', '😄'];
const addDays = (d, n) => { const x = new Date(d + 'T00:00'); x.setDate(x.getDate() + n); return x.toLocaleDateString('en-CA'); };
function streak(h, from = today()) {
  const done = new Set(h.done || []);
  let d = done.has(from) ? from : addDays(from, -1);
  let n = 0;
  while (done.has(d)) { n++; d = addDays(d, -1); }
  return n;
}
function daySummary() {
  const t = today();
  const parts = [];
  if (state.habits.length) parts.push(`Hábitos ${state.habits.filter((h) => (h.done || []).includes(t)).length}/${state.habits.length} hoy`);
  const j = state.journal.find((x) => x.date === t);
  parts.push(j ? `Diario ${j.mood || '✓'}` : 'Escribe cómo te fue hoy');
  return parts.join(' · ');
}
function renderDay() {
  setHeader({ title: 'Mi día', back: '#/' });
  setFab(null);
  tabs.hidden = true;
  const t = today();
  if (!dayDate || dayDate > t) dayDate = t;
  const d = dayDate;
  const j = state.journal.find((x) => x.date === d) || {};
  const label = d === t ? 'Hoy' : d === addDays(t, -1) ? 'Ayer' : cap(fdate(d, { weekday: 'long', day: 'numeric', month: 'short' }));
  const past = state.journal.filter((x) => x.date !== d && (x.text || x.mood)).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 14);
  view.innerHTML = `
    <div class="monthnav"><button class="ghost" data-dd="-1" aria-label="Día anterior">‹</button><b>${label}</b><button class="ghost" data-dd="1" aria-label="Día siguiente" ${d >= t ? 'disabled' : ''}>›</button></div>
    <section class="card">
      <h3>Hábitos</h3>
      ${state.habits.length ? `<ul class="list flat">${[...state.habits].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)).map((h) => habitRow(h, d)).join('')}</ul>` : '<p class="muted small">Agrega los hábitos que quieras marcar cada día.</p>'}
      <button class="small" data-new="habits">＋ Hábito</button>
    </section>
    <section class="card">
      <h3>Diario</h3>
      <div class="moods" role="radiogroup" aria-label="¿Cómo te sentiste?">${MOODS.map((m) => `<button class="${j.mood === m ? 'on' : ''}" data-mood="${m}" role="radio" aria-checked="${j.mood === m}">${m}</button>`).join('')}</div>
      <textarea id="jtext" rows="5" placeholder="¿Cómo te fue? ¿Qué pasó hoy?">${esc(j.text || '')}</textarea>
      <div class="actions jactions"><button class="primary" data-jsave>Guardar</button></div>
    </section>
    ${past.length ? `<p class="group"><span>Días anteriores</span></p><ul class="list">${past.map((x) => `<li data-jday="${x.date}" tabindex="0">
      <span class="row-icon emoji">${x.mood || '📝'}</span>
      <span class="row-body"><b>${cap(fdate(x.date, { weekday: 'long', day: 'numeric', month: 'short' }))}</b><small>${esc(x.text || '')}</small></span></li>`).join('')}</ul>` : ''}`;
  let mood = j.mood || '';
  view.querySelectorAll('[data-mood]').forEach((b) => (b.onclick = () => {
    mood = mood === b.dataset.mood ? '' : b.dataset.mood;
    view.querySelectorAll('[data-mood]').forEach((o) => { o.classList.toggle('on', o.dataset.mood === mood); o.setAttribute('aria-checked', o.dataset.mood === mood); });
  }));
  $('[data-jsave]', view).onclick = async () => {
    const text = $('#jtext', view).value.trim();
    const id = `dia-${d}`;
    if (!text && !mood) await db.remove('journal', id);
    else await db.put('journal', { ...j, id, date: d, mood, text, createdAt: j.createdAt || Date.now(), updatedAt: Date.now() });
    await refresh();
    toast('Guardado');
  };
  view.querySelectorAll('[data-dd]').forEach((b) => (b.onclick = () => { dayDate = addDays(d, +b.dataset.dd); renderDay(); }));
  view.querySelectorAll('[data-jday]').forEach((li) => (li.onclick = () => { dayDate = li.dataset.jday; renderDay(); }));
  bindMine();
}
function habitRow(h, d) {
  const on = (h.done || []).includes(d);
  const s = streak(h, d);
  return `<li data-store="habits" data-id="${h.id}" tabindex="0">
    <button class="tick ${on ? 'on' : ''}" data-habit="${h.id}" aria-label="${on ? 'Desmarcar' : 'Marcar'} ${esc(h.name)}">${icon('check')}</button>
    <span class="row-body"><b>${h.emoji ? esc(h.emoji) + ' ' : ''}${esc(h.name)}</b><small>${s ? `🔥 ${s} día${s > 1 ? 's' : ''} seguidos` : 'Sin racha'}</small></span></li>`;
}
async function toggleHabit(id) {
  const h = state.habits.find((x) => x.id === id);
  const done = new Set(h.done || []);
  if (done.has(dayDate)) done.delete(dayDate); else done.add(dayDate);
  await db.put('habits', { ...h, done: [...done].sort(), updatedAt: Date.now() });
  await refresh();
}

function bindMine() {
  bindRows();
  view.querySelectorAll('[data-new]').forEach((el) => (el.onclick = () => openForm(el.dataset.new)));
  bindTicks();
}
function bindTicks() {
  view.querySelectorAll('[data-task]').forEach((li) => {
    const open = () => openForm('tasks', state.tasks.find((x) => x.id === li.dataset.task));
    li.onclick = open;
    li.onkeydown = (e) => { if (e.key === 'Enter') open(); };
  });
  view.querySelectorAll('[data-tick]').forEach((b) => (b.onclick = (e) => { e.stopPropagation(); toggleTask(b.dataset.tick); }));
  view.querySelectorAll('[data-habit]').forEach((b) => (b.onclick = (e) => { e.stopPropagation(); toggleHabit(b.dataset.habit); }));
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
  // Rendimiento en gasolina: el que puso en Ajustes; si no, el de sus cargas de gasolina;
  // si tampoco hay, se estima con el de LP (el LP rinde ~20% menos km/l que la gasolina).
  const kmlGas = +state.vehicle.kmlGas || g.avgKml || (l.avgKml ? l.avgKml * 1.25 : 0);
  const kmlGasEst = !+state.vehicle.kmlGas && !g.avgKml;
  const saving = km > 0 && kmlGas && g.lastPrice ? (km / kmlGas) * g.lastPrice - tot.fuel : null;
  const tilesHtml = lp
    ? [
        tile('Rendimiento gas LP', l.avgKml ? `${num(l.avgKml, 1)} <em>km/l</em>` : '—', l.avgKml ? `Última: ${num(l.lastKml, 1)} km/l · ${money(l.lastPrice)}/L` : 'Faltan cargas de LP con tanque lleno'),
        tile('Combustible por km', km > 0 ? money(tot.fuel / km) : '—', km > 0 ? `Todo incluido: ${money(tot.all / km)}/km` : ''),
        tile('Ahorro con LP', saving != null ? money(saving) : '—', saving != null ? `vs. solo gasolina (${kmlGasEst ? '≈' : ''}${num(kmlGas, 1)} km/l${kmlGasEst ? ' estimado' : ''})` : !g.lastPrice ? 'Registra una carga de gasolina para saber su precio' : 'Faltan cargas de LP con tanque lleno'),
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

// ---------- Finanzas (igual que las hojas del Excel: Hoy, hoja del mes y Budget familiar) ----------
const FIN_TABS = [
  { id: '', label: 'Hoy', icon: 'sun', store: 'income' },
  { id: 'mes', label: 'Mes', icon: 'calendar', store: 'bills' },
  { id: 'metas', label: 'Budget familiar', icon: 'target', store: 'goals' },
];
let finMonth = null; // mes que se está viendo (YYYY-MM)
const finRows = new Map(); // id de renglón → pago, para abrirlo al tocarlo
const pad2 = (n) => String(n).padStart(2, '0');
const sum = (xs, f) => xs.reduce((s, x) => s + (+f(x) || 0), 0);
const catEmoji = (c) => (c || '📦').split(' ')[0];
const monthLabel = (key) => cap(fdate(key + '-01', { month: 'long', year: 'numeric' }));
const monthName = (key) => fdate(key + '-01', { month: 'long' });
const daysText = (d) => (d < 0 ? 'Vencido' : d === 0 ? 'vence hoy' : d === 1 ? 'mañana' : `en ${d} días`);
const bar = (pct, cls = '') => `<div class="progress ${cls}"><i style="width:${(Math.min(1, Math.max(0, pct || 0)) * 100).toFixed(1)}%"></i></div>`;
const finTile = (label, value, sub = '', cls = '') => `<div class="tile ${cls}"><small>${label}</small><b>${value}</b>${sub ? `<span>${sub}</span>` : ''}</div>`;
const monthNav = () => `<div class="monthnav"><button class="ghost" data-m="-1" aria-label="Mes anterior">‹</button><b>${monthLabel(finMonth)}</b><button class="ghost" data-m="1" aria-label="Mes siguiente">›</button></div>`;
// OBJETIVO / GENERADO / FALTANTE (o SOBRANTE)
const sheetTiles = (p) => `<section class="tiles three">
  ${finTile('Objetivo', money0(p.objetivo))}
  ${finTile('Generado', money0(p.generado))}
  ${p.faltante > 0 ? finTile('Faltante', money0(p.faltante), '', 'bad') : finTile('Sobrante', money0(-p.faltante), '', 'good')}</section>`;

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
  setFab(tab.store);
  if (tab.id === 'mes') renderMonth();
  else if (tab.id === 'metas') renderGoals();
  else renderFinToday();
  bindFin();
}

// Renglón de pago con sus columnas: abonado, total, días y cuota.
function billRow(b, paid, t) {
  finRows.set(b.id, b);
  const st = billStatus(b, paid, t);
  const label = st.level === 'paid' ? 'Pagado' : `${paid > 0 ? `Abonado ${money(paid)} · ` : ''}${daysText(st.days)}`;
  const daily = st.level !== 'paid' && st.days > 0 ? ` · ${money(st.cuota)}/día` : '';
  const from = b.veh ? ' <span class="rep">· Vehículo</span>' : b.budget ? ` <span class="rep">· resto del tope (${money0(b.spent)} de ${money0(b.limit)})</span>` : '';
  return `<li data-bill="${esc(b.id)}" tabindex="0" class="bill ${st.level}">
    <span class="row-icon emoji">${catEmoji(b.category)}</span>
    <span class="row-body"><b>${esc(b.concept)}${b.bill?.repeat ? ' <span class="rep" title="Se repite">↻</span>' : ''}${from}</b>
      <small><span class="status">${label}</span> · ${fdate(b.date, { day: 'numeric', month: 'short' })}${daily}</small></span>
    <span class="row-amount">${money(st.level === 'paid' ? b.amount : st.pending)}${st.level !== 'paid' && paid > 0 ? `<small>de ${money(b.amount)}</small>` : ''}</span></li>`;
}

function renderFinToday() {
  const t = today();
  if (!state.income.length && !state.bills.length && !state.goals.length) {
    view.innerHTML = `
      <div class="empty">
        ${icon('wallet')}
        <h2>Tus finanzas como tu Excel</h2>
        <p>Anota lo que <b>generas</b> cada día y tus <b>pagos</b> del mes. Te digo cuánto necesitas sacar por día para cubrirlos.</p>
        <button class="primary" data-new="income">Registrar lo de hoy</button>
        <div class="actions"><button data-new="bills">Agregar pago</button><button data-new="goals">Agregar meta</button></div>
      </div>`;
    return;
  }
  const plan = todayPlan(state, t);
  const gp = goalsPlan(state, t);
  const pct = plan.meta ? plan.earnedToday / plan.meta : plan.earnedToday ? 1 : 0;
  const upcoming = plan.items.filter((b) => (plan.paid.get(b.id) || 0) < b.amount).slice(0, 6);
  view.innerHTML = `
    <section class="hero">
      <small>Meta diaria</small>
      <b>${money(plan.meta)}</b>
      ${bar(pct, pct >= 1 ? 'done' : '')}
      <span>Hoy llevas <b>${money(plan.earnedToday)}</b>${plan.meta > plan.earnedToday ? ` · faltan ${money(plan.meta - plan.earnedToday)}` : plan.meta ? ' · ¡meta cumplida! 🎉' : ' · mes cubierto ✓'}</span>
      <span class="small">Faltante del mes entre ${plan.daysLeft} día${plan.daysLeft === 1 ? '' : 's'} que quedan</span>
      <button class="primary" data-new="income">＋ Registrar lo de hoy</button>
    </section>
    ${sheetTiles(plan)}
    <section class="card"><h3>Lo que falta pagar</h3>${upcoming.length ? `<ul class="list flat">${upcoming.map((b) => billRow(b, plan.paid.get(b.id) || 0, t)).join('')}</ul>` : '<p class="muted small">Todo cubierto este mes 🎉</p>'}
      <a class="link" href="#/finanzas/mes">Ver la hoja del mes →</a></section>
    ${gp.goals.length ? `<a class="module" href="#/finanzas/metas"><span class="module-icon">${icon('target')}</span><span class="module-body"><b>Budget familiar</b><small>Apartar ${money(gp.daily)} diario · ${money0(gp.monthly)} al mes</small></span></a>` : ''}`;
}

// Hoja del mes: calendario de lo generado + lista de pagos con abonos.
function renderMonth() {
  const key = finMonth;
  const t = today();
  const plan = monthPlan(state, key, t);
  const incomes = state.income.filter((x) => x.date && incomeMonth(x) === key).sort((a, b) => a.date.localeCompare(b.date));
  const byDay = new Map();
  for (const x of incomes) byDay.set(x.date, (byDay.get(x.date) || 0) + (+x.amount || 0));
  const offset = new Date(key + '-01T00:00').getDay();
  const n = monthDays(key);
  let cells = ['D', 'L', 'M', 'M', 'J', 'V', 'S', 'Total'].map((d) => `<span class="dow">${d}</span>`).join('');
  for (let w = 0; w < Math.ceil((offset + n) / 7); w++) {
    let week = 0;
    for (let d = 0; d < 7; d++) {
      const day = w * 7 + d - offset + 1;
      const dt = new Date(+key.slice(0, 4), +key.slice(5, 7) - 1, day);
      const date = `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
      // Días de otro mes: vacíos, salvo que tengan algo que cuenta para esta hoja (como el 30/9 en octubre).
      if ((day < 1 || day > n) && !byDay.get(date)) { cells += '<span class="day out"></span>'; continue; }
      if (day < 1 || day > n) { week += byDay.get(date); cells += `<span class="day has"><small>${dt.getDate()}/${dt.getMonth() + 1}</small>${compact(byDay.get(date))}</span>`; continue; }
      const v = byDay.get(date) || 0;
      week += v;
      cells += `<button class="day${date === t ? ' today' : ''}${v ? ' has' : ''}" data-day="${date}" aria-label="${fdate(date)}: ${money(v)}"><small>${day}</small>${v ? compact(v) : ''}</button>`;
    }
    cells += `<span class="day week">${week ? compact(week) : '—'}</span>`;
  }
  const cur = monthKey(t);
  const daysLeft = key === cur ? n - +t.slice(8) + 1 : key > cur ? n : 0;
  const next = addMonths(key, 1);
  const carried = state.income.some((x) => x.fromMonth === key);
  const prevOneOff = state.bills.filter((b) => !b.repeat && b.date && monthKey(b.date) === addMonths(key, -1));
  const hasOneOff = state.bills.some((b) => !b.repeat && b.date && monthKey(b.date) === key);
  view.innerHTML = `
    ${monthNav()}
    ${sheetTiles(plan)}
    ${daysLeft && plan.faltante > 0 ? `<p class="muted small center">Meta diaria: <b>${money(plan.faltante / daysLeft)}</b> por ${daysLeft} días</p>` : ''}
    <section class="card"><div class="cal">${cells}</div><p class="muted small center">Toca un día para anotar lo que generaste.</p></section>
    ${plan.items.length ? `<h4 class="group"><span>Pagos</span><span>${plan.items.length}</span></h4>
      <ul class="list">${plan.items.map((b) => billRow(b, plan.paid.get(b.id) || 0, t)).join('')}</ul>`
    : `<div class="empty">${icon('receipt')}<p>Agrega los pagos del mes con <b>＋</b>: colegiatura, tandas, servicios… Si se repite cada mes, márcalo y aparecerá solo.</p></div>`}
    <div class="actions stack">
      ${!hasOneOff && prevOneOff.length ? `<button data-copy="${key}">Copiar ${prevOneOff.length} pago${prevOneOff.length === 1 ? '' : 's'} de ${monthName(addMonths(key, -1))}</button>` : ''}
      ${plan.faltante < 0 && key <= cur && !carried ? `<button data-carry="${key}">Pasar sobrante (${money(-plan.faltante)}) a ${monthName(next)}</button>` : ''}
    </div>
    ${incomes.length ? `<details class="card"><summary>Lo generado en ${monthName(key)} (${incomes.length})</summary><ul class="list flat">${[...incomes].reverse().map((x) => row('income', x)).join('')}</ul></details>` : ''}`;
}

// Budget familiar: lo apartado por mes + metas con abono por fecha.
function renderGoals() {
  const t = today();
  const gp = goalsPlan(state, t);
  const keys = Object.keys(gp.savings);
  const y0 = Math.min(+t.slice(0, 4), ...keys.map((k) => +k.slice(0, 4)));
  const y1 = Math.max(+t.slice(0, 4), ...keys.map((k) => +k.slice(0, 4)));
  const years = [];
  for (let y = y0; y <= y1; y++) years.push(y);
  const mon = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const cur = monthKey(t);
  view.innerHTML = `
    <section class="tiles four">
      ${finTile('Diaria', money0(gp.daily))}
      ${finTile('Semanal', money0(gp.weekly))}
      ${finTile('Mensual', money0(gp.monthly))}
      ${finTile('Anual', gp.yearly >= 1e5 ? '$' + compact(gp.yearly) : money0(gp.yearly))}
    </section>
    <section class="tiles three">
      ${finTile('Objetivo', money0(gp.objetivo))}
      ${finTile('Generado', money0(gp.generado))}
      ${finTile('Faltante', money0(Math.max(0, gp.faltante)), '', gp.faltante > 0 ? 'bad' : 'good')}
    </section>
    <section class="card"><h3>Apartado por mes</h3>
      ${years.map((y) => `<div class="savings"><div class="savings-head"><b>${y}</b><span>${money0(sum(keys.filter((k) => k.startsWith(y + '-')), (k) => gp.savings[k]))}</span></div>
        <div class="savings-grid">${mon.map((m, i) => { const k = `${y}-${pad2(i + 1)}`; const v = +gp.savings[k] || 0;
          return `<button class="${k === cur ? 'today' : ''}${v ? ' has' : ''}" data-save="${k}"><small>${m}</small>${v ? compact(v) : '—'}</button>`; }).join('')}</div></div>`).join('')}
      <p class="muted small center">Toca un mes para anotar lo que apartaste.</p></section>
    <p class="muted small">La diaria suma las metas de los próximos ${GOAL_WINDOW} días; mensual = diaria × ${WORK_DAYS}.</p>
    ${gp.goals.length ? `<ul class="list">${gp.goals.map(({ g, amount, collected, pending, days, cuota }) => {
      const done = pending <= 0;
      const status = done ? 'Pagado' : days < 0 ? 'Vencido' : days <= GOAL_WINDOW ? `${money(cuota)}/día · ${days} días` : `${days} días`;
      return `<li data-goal="${g.id}" tabindex="0" class="goal ${done ? 'paid' : days < 0 ? 'overdue' : ''}">
        <span class="row-icon emoji">${catEmoji(g.category)}</span>
        <span class="row-body"><b>${esc(g.concept)}</b>
          <small><span class="status">${status}</span> · ${fdate(g.date, { day: 'numeric', month: 'short', year: '2-digit' })}</small>
          ${bar(amount ? collected / amount : 0, done ? 'done' : '')}</span>
        <span class="row-amount">${money0(pending)}<small>${collected ? `abonado ${money0(collected)}` : `de ${money0(amount)}`}</small></span></li>`;
    }).join('')}</ul>` : `<div class="empty">${icon('target')}<p>Agrega tus metas con <b>＋</b>: frenos, Navidad, la fiesta… Lo que apartes cada mes se abona en orden de fecha.</p></div>`}`;
}

// Lo apartado en un mes (Budget familiar), en la hoja inferior.
function editSaving(key) {
  const cur = +(state.finance.savings || {})[key] || '';
  sheet.innerHTML = `
    <form method="dialog" class="form">
      <header><h2>Apartado en ${monthLabel(key)}</h2><button type="button" class="ghost" data-close aria-label="Cerrar">✕</button></header>
      <div class="grid"><label class="field wide big"><span>Monto</span><input name="amount" type="number" inputmode="decimal" step="0.01" min="0" value="${cur}"></label></div>
      <footer><button type="submit" class="primary">Guardar</button></footer>
    </form>`;
  const form = $('form', sheet);
  $('[data-close]', form).onclick = () => sheet.close();
  form.onsubmit = async (e) => {
    e.preventDefault();
    const v = parseFloat(form.elements.amount.value) || 0;
    const savings = { ...(state.finance.savings || {}) };
    if (v) savings[key] = v; else delete savings[key];
    await db.setSetting('finance', { ...state.finance, savings });
    sheet.close();
    await refresh();
    toast('Guardado');
  };
  sheet.showModal();
  setTimeout(() => form.elements.amount.select(), 50);
}

function renderFinSettings() {
  const t = today();
  const bs = billsIn(state, monthKey(t), t).filter((b) => b.budget);
  view.innerHTML = `
    <section class="card">
      <h3>Cómo se calcula</h3>
      <p class="muted small">Igual que tu Excel. Lo <b>generado</b> en el mes abona los pagos del mes en orden de fecha. <b>Faltante</b> = objetivo − generado, y la <b>meta diaria</b> es el faltante entre los días que quedan del mes (contando hoy).</p>
      <p class="muted small">Las cargas, servicios y gastos del <b>Vehículo</b> salen solos en la hoja del mes. Si capturas un pago de 🚗 Vehículo aquí, se guarda en el módulo Vehículo para no duplicarlo.</p>
      <p class="muted small">En el <b>Budget familiar</b>, lo que apartas cada mes abona tus metas en orden de fecha.</p>
    </section>
    <section class="card"><h3>Tope de combustible</h3>
      <p class="muted small">Tus cargas del Vehículo van saliendo en la hoja; lo que falte para llegar al tope se reserva como un pago a fin de mes (como tu renglón de "Combustible").</p>
      ${bs.length ? `<ul class="list flat">${bs.map((b) => `<li data-budget="${b.budget.id}" tabindex="0"><span class="row-icon emoji">${catEmoji(b.category)}</span><span class="row-body"><b>${esc(b.concept)}</b><small>Llevas ${money(b.spent)} este mes</small></span><span class="row-amount">${money0(b.limit)}<small>al mes</small></span></li>`).join('')}</ul>`
        : '<button class="small" data-new="budgets">＋ Tope de combustible</button>'}
    </section>
    <section class="card">
      <h3>Importar movimientos</h3>
      <p class="muted small">Agrega registros desde un archivo JSON sin borrar lo que ya tienes. El respaldo completo está en Respaldo.</p>
      <label class="btn">Importar JSON<input type="file" id="finImport" accept="application/json,.json" hidden></label>
    </section>`;
  $('#finImport').onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const n = await db.mergeData(JSON.parse(await file.text()));
      await refresh();
      toast(`${n} movimientos importados`);
    } catch (err) {
      alert('No se pudo importar: ' + err.message);
    }
  };
  bindFin();
}

// Copia los pagos de una sola vez del mes anterior (como copiar la hoja del Excel).
async function copyBills(key) {
  const prev = addMonths(key, -1);
  const list = state.bills.filter((b) => !b.repeat && b.date && monthKey(b.date) === prev);
  if (!confirm(`¿Copiar ${list.length} pagos de ${monthName(prev)} a ${monthName(key)}? Luego puedes ajustar montos.`)) return;
  let i = 0;
  for (const b of list) {
    const day = Math.min(+b.date.slice(8), monthDays(key));
    await db.put('bills', { ...b, id: uid(), date: `${key}-${pad2(day)}`, skip: [], createdAt: Date.now() + i++, updatedAt: Date.now() });
  }
  await refresh();
  toast('Pagos copiados');
}

// El sobrante del mes entra como ingreso el día 1 del siguiente (como "Saldo de septiembre").
async function carryOver(key) {
  const plan = monthPlan(state, key, today());
  const next = addMonths(key, 1);
  await db.put('income', { id: uid(), amount: Math.round(-plan.faltante * 100) / 100, date: `${next}-01`, concept: `Saldo de ${monthName(key)}`, fromMonth: key, createdAt: Date.now(), updatedAt: Date.now() });
  await refresh();
  toast(`Sobrante pasado a ${monthName(next)}`);
}

function bindFin() {
  view.querySelectorAll('[data-bill]').forEach((li) => {
    const b = finRows.get(li.dataset.bill);
    const open = () => {
      if (b.veh) return openForm(b.veh.store, b.veh.item);
      if (b.budget) return openForm('budgets', b.budget);
      const extra = b.bill.repeat
        ? { label: `Omitir el ${fdate(b.date, { day: 'numeric', month: 'short' })}`, run: () => db.put('bills', { ...b.bill, skip: [...(b.bill.skip || []), b.date], updatedAt: Date.now() }) }
        : null;
      openForm('bills', b.bill, { extra });
    };
    li.onclick = open;
    li.onkeydown = (e) => { if (e.key === 'Enter') open(); };
  });
  view.querySelectorAll('[data-budget]').forEach((li) => {
    const open = () => openForm('budgets', state.budgets.find((g) => g.id === li.dataset.budget));
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
  view.querySelectorAll('[data-save]').forEach((el) => (el.onclick = () => editSaving(el.dataset.save)));
  view.querySelectorAll('[data-copy]').forEach((el) => (el.onclick = () => copyBills(el.dataset.copy)));
  view.querySelectorAll('[data-carry]').forEach((el) => (el.onclick = () => carryOver(el.dataset.carry)));
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
        ${f('kmlGas', 'Rendimiento en gasolina (km/l, opcional)', 'number', 'inputmode="decimal" step="0.1" min="0" placeholder="Si no lo sabes, la app lo estima"')}
        ${f('odometer', 'Odómetro inicial (km)', 'number', 'inputmode="numeric" step="1" min="0"')}
        ${f('currency', 'Moneda (código)', 'text', 'maxlength="3" placeholder="MXN"')}
      </div>
      <footer><button class="primary">Guardar</button></footer>
    </form>
    <section class="card">
      <h3>Respaldo</h3>
      <div class="actions"><a class="btn" href="#/respaldo">Respaldo en Google Sheets y JSON</a><button id="exportCsv">Exportar CSV de cargas</button></div>
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
  $('#exportCsv').onclick = () => {
    const cols = ['date', 'fuelType', 'odometer', 'liters', 'pricePerLiter', 'total', 'full', 'station', 'notes'];
    const q = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;
    const csv = [cols.join(','), ...[...state.fuel].sort((a, b) => a.date.localeCompare(b.date)).map((x) => cols.map((c) => q(c === 'fuelType' ? FUELS[fuelTypeOf(x)] : x[c])).join(','))].join('\n');
    download(`cargas-${today()}.csv`, '﻿' + csv, 'text/csv');
  };
  $('#wipe').onclick = async () => {
    if (!confirm('¿Borrar TODOS los datos? Esto no se puede deshacer.')) return;
    await db.clearAll();
    await refresh();
    toast('Datos borrados');
  };
}

// ---------- Respaldo ----------
const ago = (t) => {
  const m = Math.round((Date.now() - t) / 6e4);
  return m < 1 ? 'justo ahora' : m < 60 ? `hace ${m} min` : m < 1440 ? `hace ${Math.round(m / 60)} h` : `hace ${Math.round(m / 1440)} días`;
};
function backupStatus() {
  const b = state.backup || {};
  if (!b.url) return '<span class="badge">Sin configurar</span> · tus datos solo están en este teléfono';
  if (b.error) return `<span class="badge">Falló el respaldo</span> · ${esc(b.error)}${b.last ? ` · último ${ago(b.last)}` : ''}`;
  return b.last ? `Google Sheets · último respaldo ${ago(b.last)}` : 'Google Sheets · pendiente';
}

async function renderBackup() {
  setHeader({ title: 'Respaldo', back: '#/' });
  tabs.hidden = true;
  setFab(null);
  let cfg = await backup.getConfig();
  if (!cfg.token) cfg = await backup.setConfig({ token: backup.newToken() });
  const script = backup.scriptFor(cfg.token);
  view.innerHTML = `
    <section class="card">
      <h3>Google Sheets ${cfg.url ? '✓' : ''}</h3>
      <p class="muted small">${backupStatus()}</p>
      ${cfg.url ? `<div class="actions"><button class="primary" id="bkNow">Respaldar ahora</button><button id="bkRestore">Restaurar desde Drive</button>
        <a class="btn" href="${esc(backup.testUrl(cfg))}" target="_blank" rel="noopener">Probar en el navegador</a></div>
        <p class="muted small">"Probar" debe mostrar un texto como <code>{"ok":true…}</code> o <code>"Aún no hay respaldo"</code>. Si ves una página de Google pidiendo iniciar sesión o un error, la implementación está mal configurada.</p>` : ''}
    </section>
    <section class="card steps">
      <h3>${cfg.url ? 'Configuración' : 'Configurar (una sola vez, ~5 min)'}</h3>
      <ol>
        <li>En tu Drive crea una hoja nueva de <b>Google Sheets</b> (ej. "SecondBrain respaldo").</li>
        <li>En la hoja: <b>Extensiones → Apps Script</b>. Borra lo que haya y pega este código:
          <textarea readonly rows="4" id="bkScript">${esc(script)}</textarea>
          <button class="small" id="bkCopy">Copiar código</button></li>
        <li>Guarda (💾) y luego <b>Implementar → Nueva implementación</b>. En tipo elige <b>Aplicación web</b>; "Ejecutar como": <b>Yo</b>; "Quién tiene acceso": <b>Cualquier persona</b>. Autoriza con tu cuenta (si dice "no verificada": Configuración avanzada → Ir a…).</li>
        <li>Copia la <b>URL de la aplicación web</b> y pégala aquí:
          <form id="bkForm"><div class="bkform"><input name="url" type="url" required placeholder="https://script.google.com/macros/s/…/exec" value="${esc(cfg.url || '')}"><button class="primary">Conectar</button></div>
            <details class="small"><summary>¿Teléfono nuevo? Usa la clave de tu respaldo</summary>
              <p class="muted small">Ábrela en tu Apps Script (línea <code>const TOKEN</code>) y pégala aquí; así no hace falta cambiar el código.</p>
              <input name="token" placeholder="Clave del respaldo anterior"></details></form></li>
      </ol>
      <p class="muted small">El código incluye una clave privada de este teléfono; solo quien la tenga puede escribir o leer tu respaldo. Después se respalda solo cada vez que guardas algo.</p>
    </section>
    <section class="card">
      <h3>Archivo JSON</h3>
      <p class="muted small">Copia completa en un archivo. Úsalo como segundo respaldo (por ejemplo una vez al mes) o para pasar tus datos a otro teléfono.</p>
      <div class="actions">
        <button id="export">Exportar JSON</button>
        <label class="btn">Importar JSON<input type="file" id="import" accept="application/json,.json" hidden></label>
        <label class="btn">Agregar desde archivo<input type="file" id="merge" accept="application/json,.json" hidden></label>
      </div>
      <p class="muted small"><b>Importar</b> reemplaza todo con un respaldo completo; <b>Agregar</b> suma los registros del archivo sin borrar nada. Si no estás segura, usa Agregar.</p>
    </section>`;

  $('#merge').onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const n = await db.mergeData(JSON.parse(await file.text()));
      await refresh();
      toast(`${n} registros agregados`);
    } catch (err) {
      alert('No se pudo agregar: ' + err.message);
    }
  };
  const run = async (btn, fn) => {
    btn.disabled = true;
    try { await fn(); } catch (err) { alert('No se pudo: ' + (err.message || err)); } finally { btn.disabled = false; state.backup = await backup.getConfig(); if (location.hash === '#/respaldo') render(); }
  };
  $('#bkCopy').onclick = async () => {
    try { await navigator.clipboard.writeText(script); toast('Código copiado'); } catch { $('#bkScript').select(); }
  };
  $('#bkForm').onsubmit = (e) => {
    e.preventDefault();
    const url = e.target.elements.url.value.trim();
    if (!/^https:\/\/script\.google(usercontent)?\.com\//.test(url)) return alert('La URL debe empezar con https://script.google.com/');
    const token = e.target.elements.token.value.trim();
    run(e.submitter || $('button', e.target), async () => {
      await backup.setConfig(token ? { url, token } : { url });
      // Si la hoja ya tiene datos (p. ej. teléfono nuevo), nunca se sobrescribe sin preguntar.
      let remote = null;
      try { remote = await backup.fetchBackup(); } catch (err) { if (!/Aún no hay respaldo/.test(err.message)) throw err; }
      const n = remote ? db.STORES.reduce((s, k) => s + (remote[k]?.length || 0), 0) : 0;
      if (n && confirm(`Tu hoja ya tiene un respaldo con ${n} registros. ¿Restaurarlo en este teléfono?`)) {
        await db.importAll(remote);
        await refresh(false);
        return toast('¡Conectado! Datos restaurados');
      }
      if (n && !confirm('¿Reemplazar el respaldo de la hoja con los datos de este teléfono?')) return toast('Conectado, sin cambios');
      await backup.backupNow();
      toast('¡Conectado! Respaldo hecho');
    });
  };
  if (cfg.url) {
    $('#bkNow').onclick = (e) => run(e.target, async () => { await backup.backupNow(); toast('Respaldo hecho'); });
    $('#bkRestore').onclick = (e) => run(e.target, async () => {
      const data = await backup.fetchBackup();
      const n = db.STORES.reduce((s, k) => s + (data[k]?.length || 0), 0);
      if (!confirm(`El respaldo tiene ${n} registros. Esto reemplazará los datos de este teléfono. ¿Continuar?`)) return;
      await db.importAll(data);
      await refresh(false);
      toast('Datos restaurados');
    });
  }
  $('#export').onclick = async () => download(`secondbrain-${today()}.json`, JSON.stringify(await db.exportAll(), null, 2), 'application/json');
  $('#import').onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      // Solo un respaldo completo (exportado por la app) reemplaza todo; cualquier otro archivo se agrega sin borrar.
      if (!data.exportedAt) {
        const n = await db.mergeData(data);
        await refresh();
        return toast(`No es un respaldo completo: se agregaron ${n} registros sin borrar nada`);
      }
      if (!confirm('Esto reemplazará todos los datos actuales por los del respaldo. ¿Continuar?')) return;
      await db.importAll(data);
      await refresh();
      toast('Datos importados');
    } catch (err) {
      alert('No se pudo importar: ' + err.message);
    }
  };
}

function download(name, text, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

const VERSION = '2.4.0';

// changed = hubo un cambio en los datos (dispara el respaldo automático).
async function refresh(changed = true) {
  await load();
  render();
  backup.scheduleBackup(changed, async () => {
    state.backup = await backup.getConfig();
    if (/^#\/(respaldo)?$/.test(location.hash || '#/')) render();
  });
}

window.addEventListener('hashchange', render);
sheet.addEventListener('click', (e) => { if (e.target === sheet) sheet.close(); });

refresh(false);
if (navigator.storage?.persist) navigator.storage.persist();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js');
