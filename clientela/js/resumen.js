// Vista del resumen mensual y acciones de navegación por mes.
export function createSummaryView({ getData, view, header, setTabs, today, lastTrip, sleeping, icon, money, esc, cap, fdate, initials, dayLabel, waLink, MSG, client }) {
  let sumMonth = '';
  function renderSummary() {
    const data = getData();
    header('Resumen', { action: { href: '#/ajustes', icon: 'gear', label: 'Ajustes' } });
    setTabs('resumen');
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
  return renderSummary;
}
