// Utilidades puras compartidas por las pantallas de Cartera.
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export const money = (n) => '$' + Math.round(+n || 0).toLocaleString('es-MX');
export const today = () => new Date().toLocaleDateString('en-CA');
export const addDays = (d, n) => { const x = new Date(d + 'T00:00'); x.setDate(x.getDate() + n); return x.toLocaleDateString('en-CA'); };
export const daysBetween = (a, b) => Math.round((new Date(b + 'T00:00') - new Date(a + 'T00:00')) / 864e5);
export const fdate = (d, o = { weekday: 'short', day: 'numeric', month: 'short' }) => new Date(d + 'T00:00').toLocaleDateString('es-MX', o);
export const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
export function dayLabel(d) {
  const n = daysBetween(today(), d);
  return n === 0 ? 'hoy' : n === 1 ? 'mañana' : n === -1 ? 'ayer' : fdate(d, { weekday: 'long', day: 'numeric', month: 'short' });
}
export const hour12 = (t) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;
};
export const initials = (name) => name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
// Nombre para saludar: «Sra. Laura» y «Don Raúl» conservan el trato; «Laura Pérez» queda en «Laura».
export const firstName = (c) => {
  const w = (c?.name || '').trim().split(/\s+/);
  return /^(sr|sra|srta|srita|don|doña|lic|dr|dra|ing|mtro|mtra)\.?$/i.test(w[0] || '') && w[1] ? `${w[0]} ${w[1]}` : w[0] || '';
};
export const byWhen = (a, b) => a.date.localeCompare(b.date) || (a.time || '99').localeCompare(b.time || '99');
export const mondayOf = (d) => addDays(d, -((new Date(d + 'T00:00').getDay() + 6) % 7));
export const fold = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export const shortRoute = (from, to) => `${(from || '…').split(',')[0]} → ${(to || '…').split(',')[0]}`;
