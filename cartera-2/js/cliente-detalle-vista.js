// Detalle del cliente, sus servicios y su historial de viajes.
export function createClientDetailView({ client, header, top, icon, esc, $, clientForm, setTabs, tripsOf, byWhen, debtOf, setFab, tripForm, view, initials, firstName, phoneIntl, waLink, MSG, weekSummary, money, dayLabel, autoName, svcPrice, sleeping, tripCard, weekForm, collectForm, quickTrip, fromService, bindTrips }) {
  function renderClient(id) {
    const c = client(id);
    header(c.name, { back: '#/clientes' });
    top.lastElementChild.outerHTML = `<button class="iconbtn" data-editc aria-label="Editar cliente">${icon('edit')}</button>`;
    $('[data-editc]', top).onclick = () => clientForm(c);
    setTabs('clientes');
    const trips = tripsOf(id).sort((a, b) => byWhen(b, a));
    const done = trips.filter((t) => t.status === 'hecho');
    const debt = debtOf(id);
    const last = done[0] || trips[0];
    setFab(() => tripForm(null, { clientId: id }));
    view.innerHTML = `
      <section class="hero"><span class="avatar">${esc(initials(c.name))}</span><h2>${esc(c.name)}</h2>
        ${c.phone ? `<span class="muted">${esc(c.phone)}</span>` : ''}</section>
      <nav class="quick">
        ${c.phone ? `<a class="wa" href="${waLink(c, `Hola ${firstName(c)}, `)}" target="_blank" rel="noopener">${icon('wa')}WhatsApp</a><a href="tel:+${phoneIntl(c.phone)}">${icon('phone')}Llamar</a>` : '<button data-editc2>' + icon('phone') + 'Agregar tel.</button><span></span>'}
        <button data-new>${icon('plus')}Nuevo viaje</button>
        <button data-repeat ${last ? '' : 'disabled'}>${icon('repeat')}Repetir</button>
      </nav>
      ${(c.services || []).length || done.length ? `<button class="cta primary" data-week style="margin-bottom:${c.week ? 4 : 12}px">${icon('repeat')} Agendar semana</button>${c.week ? `<p class="muted" style="margin:0 2px 12px;font-size:12.5px">Tu rutina: ${esc(weekSummary(c))}</p>` : ''}` : ''}
      <section class="tiles">
        <div class="tile"><small>Viajes</small><b>${done.length}</b><span>${last ? 'último ' + dayLabel(last.date) : '—'}</span></div>
        <div class="tile"><small>Total</small><b>${money(done.reduce((s, t) => s + +t.price, 0))}</b><span>${done.length ? 'prom. ' + money(done.reduce((s, t) => s + +t.price, 0) / done.length) : '—'}</span></div>
        <div class="tile ${debt ? 'warn' : ''}"><small>Me debe</small><b>${money(debt)}</b><span>${debt ? `<a href="#/cobros" data-collect>cobrar</a>` : 'al día'}</span></div>
      </section>
      ${(c.services || []).length ? `<p class="group"><span>Sus servicios</span><em>agendar en un toque</em></p>
        <div class="qs">${c.services.map((sv) => `<div class="q"><b>${esc(sv.name || autoName(sv))}</b>${sv.name && sv.name !== autoName(sv) ? `<small>${esc(autoName(sv))}</small>` : ''}
          <span class="meta">${sv.km ? `${sv.km} km · ${sv.min} min · ` : ''}<span class="amt">${money(svcPrice(sv))}</span></span><button data-book="${sv.id}">Agendar</button></div>`).join('')}</div>` : ''}
      ${c.places || c.rate || c.notes ? `<section class="card"><dl class="kv">
        ${c.places ? `<dt>Lugares</dt><dd>${esc(c.places)}</dd>` : ''}
        ${c.rate ? `<dt>Tarifa</dt><dd>${esc(c.rate)}</dd>` : ''}
        ${c.notes ? `<dt>Notas</dt><dd>${esc(c.notes)}</dd>` : ''}</dl></section>` : ''}
      ${c.phone && sleeping(c) && done.length ? `<a class="card wa" style="display:block" href="${waLink(c, MSG.hello(c))}" target="_blank" rel="noopener">${icon('wa')} Lleva más de 30 días sin viajar. Mándale un saludo →</a>` : ''}
      <p class="group"><span>Historial</span><em>${trips.length}</em></p>
      ${trips.length ? trips.map((t) => tripCard(t, { showDate: true, showClient: false })).join('') : '<div class="card muted">Aún no hay viajes con este cliente.</div>'}`;
    $('[data-new]', view).onclick = () => tripForm(null, { clientId: id });
    $('[data-week]', view)?.addEventListener('click', () => weekForm(c));
    $('[data-collect]', view)?.addEventListener('click', (e) => { e.preventDefault(); collectForm(c); });
    view.querySelectorAll('[data-book]').forEach((b) => (b.onclick = () => { const sv = c.services.find((x) => x.id === b.dataset.book); quickTrip(fromService(c, sv), sv.name || autoName(sv)); }));
    const rep = $('[data-repeat]', view);
    if (last) rep.onclick = () => quickTrip({ clientId: id, from: last.from, to: last.to, fromPt: last.fromPt, toPt: last.toPt, price: last.price, time: last.time, km: last.km, min: last.min, path: last.path }, 'Repetir viaje');
    const e2 = $('[data-editc2]', view);
    if (e2) e2.onclick = () => clientForm(c);
    bindTrips();
  }
  return renderClient;
}
