// Renderizado de cobros pendientes por cliente.
export function createChargesView({ getData, view, header, setTabs, setFab, tripsOf, owed, byWhen, money, icon, esc, waLink, MSG, cap, fdate, daysBetween, today, bindTrips, $, collectForm, client }) {
  function renderCharges() {
    const data = getData();
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
            <button data-payall="${c.id}">${icon('cash')}Cobrar</button></div></section>`).join('')}`;
    bindTrips();
    view.querySelectorAll('[data-payall]').forEach((b) => (b.onclick = () => collectForm(client(b.dataset.payall))));
  }
  return renderCharges;
}
