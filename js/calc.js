// Cálculos puros: rendimiento, costos, recordatorios.

export const FUELS = { gasolina: 'Gasolina', lp: 'Gas LP' };
export const fuelTypeOf = (f) => f.fuelType || 'gasolina';

const byOdo = (a, b) => a.odometer - b.odometer || a.date.localeCompare(b.date);

// Rendimiento por método de "tanque lleno a tanque lleno":
// km entre dos llenados completos / litros cargados después del primero.
export function fuelStats(fuel) {
  const list = [...fuel].sort(byOdo);
  const series = [];
  let lastFull = null;
  let liters = 0;
  for (const f of list) {
    liters += +f.liters || 0;
    if (!f.full) continue;
    if (lastFull) {
      const km = f.odometer - lastFull.odometer;
      if (km > 0 && liters > 0) series.push({ id: f.id, date: f.date, km, liters, kml: km / liters });
    }
    lastFull = f;
    liters = 0;
  }
  const sumKm = series.reduce((s, x) => s + x.km, 0);
  const sumL = series.reduce((s, x) => s + x.liters, 0);
  const last = list.at(-1);
  return {
    series,
    byId: new Map(series.map((x) => [x.id, x.kml])),
    avgKml: sumL ? sumKm / sumL : null,
    lastKml: series.at(-1)?.kml ?? null,
    lastPrice: last ? +last.pricePerLiter || (last.liters ? last.total / last.liters : null) : null,
    totalLiters: list.reduce((s, f) => s + (+f.liters || 0), 0),
  };
}

// Auto con gas LP como combustible principal: el rendimiento se calcula solo con
// las cargas de LP; la gasolina (arranque/respaldo) se cuenta como gasto.
export function fuelStatsByType(fuel) {
  const out = {};
  for (const k of Object.keys(FUELS)) out[k] = fuelStats(fuel.filter((f) => fuelTypeOf(f) === k));
  return out;
}

export function currentOdometer(state) {
  const vals = [
    ...state.fuel.map((f) => +f.odometer),
    ...state.maintenance.map((m) => +m.odometer),
    +state.vehicle.odometer || 0,
  ].filter((n) => Number.isFinite(n));
  return vals.length ? Math.max(...vals) : 0;
}

export function firstOdometer(state) {
  const vals = [...state.fuel, ...state.maintenance].map((x) => +x.odometer).filter((n) => n > 0);
  return vals.length ? Math.min(...vals) : 0;
}

export const amountOf = {
  fuel: (x) => +x.total || 0,
  maintenance: (x) => +x.cost || 0,
  expenses: (x) => +x.amount || 0,
};

export function totals(state) {
  const t = {};
  for (const k of Object.keys(amountOf)) t[k] = state[k].reduce((s, x) => s + amountOf[k](x), 0);
  t.all = t.fuel + t.maintenance + t.expenses;
  return t;
}

// Gasto por mes (últimos n meses), separado por categoría.
export function monthlySpend(state, n = 6) {
  const now = new Date();
  const months = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months.push({ key, date: d, fuel: 0, gasolina: 0, lp: 0, maintenance: 0, expenses: 0 });
  }
  const idx = new Map(months.map((m) => [m.key, m]));
  for (const k of Object.keys(amountOf)) {
    for (const x of state[k]) {
      const m = idx.get((x.date || '').slice(0, 7));
      if (!m) continue;
      m[k] += amountOf[k](x);
      if (k === 'fuel') m[fuelTypeOf(x)] += amountOf[k](x);
    }
  }
  for (const m of months) m.total = m.fuel + m.maintenance + m.expenses;
  return months;
}

// Estado de un recordatorio periódico (por km y/o por meses).
export function reminderStatus(r, odo, today = new Date()) {
  let kmLeft = null;
  let daysLeft = null;
  let dueDate = null;
  if (+r.everyKm && r.lastKm !== '' && r.lastKm != null) kmLeft = +r.lastKm + +r.everyKm - odo;
  if (+r.everyMonths && r.lastDate) {
    dueDate = new Date(r.lastDate + 'T00:00');
    dueDate.setMonth(dueDate.getMonth() + +r.everyMonths);
    const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    daysLeft = Math.round((dueDate - t0) / 864e5);
  }
  let level = 'ok';
  if ((kmLeft != null && kmLeft <= 0) || (daysLeft != null && daysLeft < 0)) level = 'overdue';
  else if ((kmLeft != null && kmLeft <= Math.max(500, +r.everyKm * 0.1)) || (daysLeft != null && daysLeft <= 15)) level = 'soon';
  return { kmLeft, daysLeft, dueDate, level };
}
