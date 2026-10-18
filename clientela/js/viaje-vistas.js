// Tarjeta de viaje: muestra solo el siguiente paso (confirmar → ya llegué → terminar, o «¿se hizo?»).
export function createTripCard({ client, today, owed, lateDebt, cap, waLink, MSG, icon, hour12, dayLabel, esc, money }) {
  return function tripCard(t, { showDate = false, showClient = true } = {}) {
    const c = client(t.clientId) || { name: 'Sin cliente' };
    const isToday = t.date === today();
    const past = t.status === 'agendado' && t.date < today();
    const day = showDate || past ? cap(dayLabel(t.date)) : '';
    const when = [day, t.time ? hour12(t.time) : day ? '' : 'Sin hora'].filter(Boolean).join(' · ');
    let tag = '';
    if (t.status === 'cancelado') tag = '<span class="pill">Cancelado</span>';
    else if (owed(t)) tag = lateDebt(t) ? '<span class="pill late">Atrasado</span>' : '<span class="pill debe">Te debe</span>';
    else if (t.status === 'hecho') tag = `<span class="pill ok">${esc(cap(t.pay || 'cobrado'))}</span>`;
    else if (!past) tag = `<span class="pill">${t.confirmedAt ? 'Confirmado' : 'Agendado'}</span>`;
    let actions = '';
    if (past) {
      actions = `<button type="button" data-notdone="${t.id}">No se hizo</button><button type="button" class="primary" data-finish="${t.id}">${icon('check')}Sí, terminar</button>`;
    } else if (t.status === 'agendado') {
      const confirm = c.phone && !t.confirmedAt
        ? `<a class="btn primary" data-confirm="${t.id}" href="${waLink(c, MSG.confirm(c, t))}" target="_blank" rel="noopener">${icon('wa')}Confirmar por WhatsApp</a>` : '';
      if (isToday) {
        const arrived = c.phone && t.confirmedAt ? `<a class="btn" href="${waLink(c, MSG.arrived(c, t))}" target="_blank" rel="noopener">${icon('pin')}Ya llegué</a>` : '';
        actions = confirm + arrived + `<button type="button" class="${confirm ? '' : 'primary'}" data-finish="${t.id}">${icon('check')}Terminar</button>`;
      } else actions = confirm;
    } else if (owed(t)) actions = `<button type="button" data-paid="${t.id}">${icon('cash')}Ya me pagó</button>`;
    const way = t.from || t.to ? `${esc(t.from || '…')} → ${esc(t.to || '…')}` : 'Sin ruta';
    return `<article class="trip ${t.status !== 'agendado' ? 'done' : ''}" data-trip="${t.id}" tabindex="0">
    <div class="t1"><span class="when">${when}</span>${tag}</div>
    <div class="t2"><b class="who">${showClient ? esc(c.name) : way}</b><span class="price">${money(t.price)}</span></div>
    ${showClient ? `<div class="way">${way}</div>` : ''}
    ${actions ? `<div class="actions">${actions}</div>` : ''}
  </article>`;
  };
}
