// Cálculos puros de los movimientos (pagos) para Inicio. Misma cuenta que la pantalla de Finanzas:
// pendiente = importe − abonado; meta diaria = lo pendiente hasta fin de mes (incluye lo vencido)
// entre los días que quedan del mes, contando hoy.
const pad = (n) => String(n).padStart(2, '0');
const parse = (s) => new Date(s + 'T00:00');

export const pendiente = (m) => Math.max(0, (+m.imp || 0) - (+m.abo || 0));
export const daysUntil = (hoy, fecha) => Math.round((parse(fecha) - parse(hoy)) / 864e5);

export function resumenGastos(movimientos, hoy) {
  const [y, mo, d] = hoy.split('-').map(Number);
  const dias = new Date(y, mo, 0).getDate();
  const finMes = `${y}-${pad(mo)}-${pad(dias)}`;
  const diasRestantes = Math.max(1, dias - d + 1);
  const debeMes = movimientos.filter((m) => m.fecha <= finMes).reduce((s, m) => s + pendiente(m), 0);
  const vencido = movimientos.filter((m) => m.fecha < hoy).reduce((s, m) => s + pendiente(m), 0);
  const proximos = movimientos
    .filter((m) => pendiente(m) > 0 && daysUntil(hoy, m.fecha) <= 7)
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || pendiente(a) - pendiente(b));
  return { debeMes, diasRestantes, meta: debeMes / diasRestantes, vencido, proximos };
}
