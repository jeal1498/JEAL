// Renderizado de la agenda y sus acciones de navegación.
export function createAgendaView({ getData, view, header, setTabs, setFab, today, owed, byWhen, money, icon, firstName, esc, weekSummary, weekNudges, addDays, tripCard, bindTrips, $, client, weekForm, refresh, clientForm, tripForm, importContacts }) {
  function renderAgenda() {
    const data = getData();
    header('Agenda', { action: { href: '#/ajustes', icon: 'gear', label: 'Ajustes' } });
    setTabs('agenda');
    const t = today();
    const active = data.trips.filter((x) => x.status !== 'cancelado');
    const todays = active.filter((x) => x.date === t).sort(byWhen);
    const month = t.slice(0, 7);
    const monthDone = active.filter((x) => x.status === 'hecho' && x.date.startsWith(month));
    const debt = data.trips.filter(owed).reduce((s, x) => s + +x.price, 0);
    setFab(data.clients.length ? () => tripForm() : () => clientForm());
    if (!data.clients.length) {
      view.innerHTML = `<div class="empty">${icon('users')}<h2>Tu cartera, en orden</h2>
        <p>Guarda a tus clientes privados, agenda sus viajes, confírmales por WhatsApp y lleva quién te debe.</p>
        <button class="primary" data-newclient>＋ Agregar mi primer cliente</button>
        ${'contacts' in navigator ? '<button data-contacts>Importar de mis contactos</button>' : ''}</div>`;
      $('[data-newclient]', view).onclick = () => clientForm();
      $('[data-contacts]', view)?.addEventListener('click', importContacts);
      return;
    }
    const pending = active.filter((x) => x.status === 'agendado' && x.date < t).sort(byWhen);
    const upcoming = active.filter((x) => x.status === 'agendado' && x.date > t).sort(byWhen);
    const tomorrow = upcoming.filter((x) => x.date === addDays(t, 1));
    const week = upcoming.filter((x) => x.date > addDays(t, 1) && x.date <= addDays(t, 7));
    const later = upcoming.filter((x) => x.date > addDays(t, 7));
    const section = (title, list, opts) => (list.length ? `<p class="group"><span>${title}</span><em>${money(list.reduce((s, x) => s + +x.price, 0))}</em></p>${list.map((x) => tripCard(x, opts)).join('')}` : '');
    const nudges = weekNudges();
    view.innerHTML = `
      <section class="tiles">
        <div class="tile"><small>Hoy</small><b>${todays.length}</b><span>${todays.length ? money(todays.reduce((s, x) => s + +x.price, 0)) : 'sin viajes'}</span></div>
        <a class="tile ${debt ? 'warn' : ''}" href="#/cobros"><small>Por cobrar</small><b>${money(debt)}</b><span>${debt ? 'ver quién' : 'todo al día'}</span></a>
        <a class="tile" href="#/resumen"><small>Este mes</small><b>${money(monthDone.reduce((s, x) => s + +x.price, 0))}</b><span>${monthDone.length} viaje${monthDone.length === 1 ? '' : 's'}</span></a>
      </section>
      ${nudges.map(({ c }) => `<section class="card nudge"><b>¿Agendar la próxima semana de ${esc(firstName(c))}?</b><small class="muted">${esc(weekSummary(c))}</small>
        <div class="actions"><button class="primary" data-nweek="${c.id}">Agendar semana</button><button data-nsnooze="${c.id}">Ahora no</button></div></section>`).join('')}
      ${section('Sin cerrar', pending, { showDate: true })}
      ${todays.length ? section('Hoy', todays) : `<div class="card muted">Hoy no tienes viajes agendados.</div>`}
      ${section('Mañana', tomorrow)}
      ${section('Esta semana', week, { showDate: true })}
      ${section('Más adelante', later, { showDate: true })}`;
    bindTrips();
    view.querySelectorAll('[data-nweek]').forEach((b) => (b.onclick = () => weekForm(client(b.dataset.nweek), { start: 'next' })));
    view.querySelectorAll('[data-nsnooze]').forEach((b) => (b.onclick = () => { const n = nudges.find((x) => x.c.id === b.dataset.nsnooze); client(n.c.id).weekSnooze = n.next; refresh(); }));
  }
  return renderAgenda;
}
