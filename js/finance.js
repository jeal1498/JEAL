// Cálculos puros de finanzas: pagos repetidos, reparto del ingreso y metas.
//
// Reparto (igual que el Excel): el ingreso de cada mes cubre los pagos en orden de
// fecha, empezando por los que quedaron pendientes de meses anteriores. Lo que sobra
// se aparta para las metas, también en orden de fecha.

export const CATEGORIES = ['🚗 Vehículo', '👤 Yo', '👩 Karen', '👧 Julieta', '👨‍👩‍👧‍👦 Familia', '💡 Servicios', '🏛️ Finanzas', '🏠 Casa', '🛒 Súper', '🍽️ Comida fuera', '📦 Otro'];
export const REPEATS = [
  { v: '', l: 'No se repite' },
  { v: 'week', l: 'Cada semana' },
  { v: '2week', l: 'Cada 2 semanas' },
  { v: 'month', l: 'Cada mes' },
];
export const BUDGET_KINDS = [
  { v: 'category', l: 'Todo lo de la categoría' },
  { v: 'fuel', l: 'Cargas de combustible' },
];
export const GOAL_WINDOW = 120; // días: solo las metas cercanas cuentan para la meta diaria

const pad = (n) => String(n).padStart(2, '0');
const parse = (s) => new Date(s + 'T00:00');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const monthKey = (s) => s.slice(0, 7);
export const monthDays = (key) => new Date(+key.slice(0, 4), +key.slice(5, 7), 0).getDate();
export const addMonths = (key, n) => ymd(new Date(+key.slice(0, 4), +key.slice(5, 7) - 1 + n, 1)).slice(0, 7);
export const daysBetween = (a, b) => Math.round((parse(b) - parse(a)) / 864e5);
const localToday = () => ymd(new Date());
const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return ymd(d); };

// Fechas en que cae un pago dentro del mes `key` (considera repetición, "hasta" y omitidos).
export function occurrences(bill, key) {
  const start = bill.date;
  if (!start || monthKey(start) > key) return [];
  const first = `${key}-01`;
  const last = `${key}-${pad(monthDays(key))}`;
  const out = [];
  if (bill.repeat === 'month') {
    out.push(`${key}-${pad(Math.min(+start.slice(8), monthDays(key)))}`);
  } else if (bill.repeat === 'week' || bill.repeat === '2week') {
    const step = bill.repeat === 'week' ? 7 : 14;
    let d = start < first ? addDays(start, Math.ceil(daysBetween(start, first) / step) * step) : start;
    for (; d <= last; d = addDays(d, step)) out.push(d);
  } else if (monthKey(start) === key) {
    out.push(start);
  }
  const skip = bill.skip || [];
  return out.filter((d) => d >= start && (!bill.until || d <= bill.until) && !skip.includes(d));
}

export const VEHICLE_CAT = '🚗 Vehículo';

// Mes en que empezó el control de finanzas (primer ingreso o pago).
const financeStart = (state) => [...state.income, ...state.bills, ...(state.spending || [])].map((x) => x.date).filter(Boolean).map(monthKey).sort()[0];

// Lo registrado en el módulo Vehículo es la única fuente: finanzas solo lo lee.
// Lo anterior al inicio de finanzas (historial del vehículo) no cuenta: se pagó con dinero que no está registrado.
export function vehicleItems(state) {
  const start = financeStart(state);
  if (!start) return [];
  return [
    ...state.fuel.map((x) => ({ store: 'fuel', item: x, amount: +x.total || 0, concept: x.fuelType === 'lp' ? 'Gas LP' : 'Gasolina' })),
    ...state.maintenance.map((x) => ({ store: 'maintenance', item: x, amount: +x.cost || 0, concept: x.type || 'Servicio' })),
    ...state.expenses.map((x) => ({ store: 'expenses', item: x, amount: +x.amount || 0, concept: x.category || 'Gasto' })),
  ].filter((v) => v.item.date && v.amount > 0 && monthKey(v.item.date) >= start);
}

// Pago de vehículo capturado en finanzas que ya existe en Vehículo (misma fecha y monto): no se cuenta doble.
const dupKey = (date, amount) => `${date}|${Math.round(amount * 100)}`;

// Qué movimientos cuentan contra un presupuesto.
const FUEL_RE = /combust|gasolin|\bgas\b|\blp\b/i;
function budgetCounts(g, x) {
  if (x.budget) return false;
  if (g.kind === 'fuel') return x.veh?.store === 'fuel' || (!!x.bill && x.category === VEHICLE_CAT && FUEL_RE.test(x.concept));
  return x.category === g.category;
}

// Pagos del mes como instancias: { id, date, category, concept, amount, bill | veh | spend | budget }.
export function billsIn(state, key, today = localToday()) {
  const veh = vehicleItems(state).filter((v) => monthKey(v.item.date) === key);
  const vehKeys = new Set(veh.map((v) => dupKey(v.item.date, v.amount)));
  const out = [];
  for (const b of state.bills) {
    for (const date of occurrences(b, key)) {
      if (!b.repeat && b.category === VEHICLE_CAT && vehKeys.has(dupKey(date, +b.amount || 0))) continue;
      out.push({ id: `${b.id}@${date}`, date, category: b.category, concept: b.concept, amount: +b.amount || 0, bill: b });
    }
  }
  for (const v of veh) out.push({ id: `${v.store}:${v.item.id}`, date: v.item.date, category: VEHICLE_CAT, concept: v.concept, amount: v.amount, veh: v });
  // Gastos del día a día: ya salieron, cuentan como un pago más (y contra el presupuesto de su categoría).
  for (const s of state.spending || []) {
    if (s.date && monthKey(s.date) === key) out.push({ id: `spend:${s.id}`, date: s.date, category: s.category, concept: s.concept || s.category, amount: +s.amount || 0, spend: s });
  }
  // Presupuesto mensual: lo gastado ya está en la lista; solo se reserva lo que queda (a fin de mes).
  // En meses pasados no se reserva nada: lo que no se gastó, no se debe.
  const end = `${key}-${pad(monthDays(key))}`;
  for (const g of state.budgets || []) {
    const limit = +g.amount || 0;
    const spent = out.filter((x) => budgetCounts(g, x)).reduce((s, x) => s + x.amount, 0);
    const left = key < monthKey(today) ? 0 : Math.max(0, limit - spent);
    out.push({ id: `budget:${g.id}@${key}`, date: end, category: g.category, concept: g.concept, amount: left, budget: g, spent, limit });
  }
  // Mismo día: primero lo que se registró antes (como el orden de filas del Excel).
  const created = (x) => (x.bill || x.veh?.item || x.spend || x.budget).createdAt || x.veh?.item.updatedAt || 0;
  return out.sort((a, b) => a.date.localeCompare(b.date) || created(a) - created(b));
}

// Lo que ya salió en el mes: gastos, registros del vehículo y pagos con fecha hasta hoy.
export function spentIn(state, key, today = localToday()) {
  return billsIn(state, key, today).filter((x) => !x.budget && x.amount > 0 && (x.spend || x.veh || x.date <= today));
}

// Simula mes a mes desde el primer registro hasta hoy.
// `before`: solo cuenta ingresos anteriores a esa fecha (para la meta "al empezar el día").
export function simulate(state, today, { before = null } = {}) {
  const cur = monthKey(today);
  const keys = [
    ...state.income.map((x) => x.date),
    ...state.bills.map((x) => x.date),
    ...vehicleItems(state).map((v) => v.item.date),
    ...(state.spending || []).map((x) => x.date),
  ].filter(Boolean).map(monthKey);
  let key = keys.length ? keys.reduce((a, b) => (a < b ? a : b)) : cur;
  if (key > cur) key = cur;

  const incomeBy = new Map();
  for (const x of state.income) {
    if (!x.date || x.date > today || (before && x.date >= before)) continue;
    const k = monthKey(x.date);
    incomeBy.set(k, (incomeBy.get(k) || 0) + (+x.amount || 0));
  }

  const paid = new Map();
  let carry = [];
  let saved = 0;
  for (; key <= cur; key = addMonths(key, 1)) {
    let pool = incomeBy.get(key) || 0;
    const queue = [...carry, ...billsIn(state, key, today)];
    carry = [];
    for (const b of queue) {
      const p = paid.get(b.id) || 0;
      const pay = Math.min(b.amount - p, pool);
      if (pay > 0) { paid.set(b.id, p + pay); pool -= pay; }
      if ((paid.get(b.id) || 0) < b.amount) carry.push(b);
    }
    saved += pool; // al cerrar el mes lo sobrante se va a metas (el mes actual, de forma provisional)
  }

  let left = saved;
  const goals = [...state.goals].sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999')).map((g) => {
    const amount = +g.amount || 0;
    const have = Math.min(+g.saved || 0, amount);
    const add = Math.min(amount - have, left);
    left -= add;
    const collected = have + add;
    const pending = amount - collected;
    const days = g.date ? daysBetween(today, g.date) : null;
    const cuota = pending > 0 && days > 0 && days <= GOAL_WINDOW ? pending / days : 0;
    return { g, amount, collected, pending, days, cuota };
  });

  return { paid, carry, saved, free: left, goals };
}

// Estado de un pago dado lo cubierto.
export function billStatus(b, paidAmt, today) {
  const pending = Math.max(0, b.amount - paidAmt);
  const days = daysBetween(today, b.date);
  let level = 'ok';
  if (pending <= 0) level = 'paid';
  else if (days < 0) level = 'overdue';
  else if (days <= 7) level = 'soon';
  return { pending, paid: paidAmt, days, level, cuota: pending <= 0 ? 0 : days > 0 ? pending / days : pending };
}

// Resumen del mes actual: lo que falta, meta diaria de pagos y de metas.
export function todayPlan(state, today) {
  const key = monthKey(today);
  const end = `${key}-${pad(monthDays(key))}`;
  const daysLeft = monthDays(key) - +today.slice(8) + 1;
  // Meta calculada al empezar el día (sin lo que entró hoy), así "hoy llevas X de Y" tiene sentido.
  const start = simulate(state, today, { before: today });
  const now = simulate(state, today);
  const pendingOf = (sim) => {
    const list = [...sim.carry.filter((b) => b.date < `${key}-01`), ...billsIn(state, key, today)];
    return list.reduce((s, b) => s + Math.max(0, b.amount - (sim.paid.get(b.id) || 0)), 0);
  };
  const metaBills = pendingOf(start) / daysLeft;
  const metaGoals = start.goals.reduce((s, x) => s + x.cuota, 0);
  const earnedToday = state.income.filter((x) => x.date === today).reduce((s, x) => s + (+x.amount || 0), 0);
  return { key, end, daysLeft, metaBills, metaGoals, meta: metaBills + metaGoals, earnedToday, pending: pendingOf(now), sim: now };
}
