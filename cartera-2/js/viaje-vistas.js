// Plantilla de una tarjeta de viaje, sin acceso directo al DOM.
export function createTripCard({ client, today, owed, cap, waLink, MSG, icon, directionsLink, hour12, fdate, esc, money }) {
  return function tripCard(t, { showDate = false, showClient = true } = {}) {
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
}
