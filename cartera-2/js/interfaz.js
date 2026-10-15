// Controles compartidos del encabezado, navegación inferior, botón flotante y avisos.
export function createShell({ getData, top, tabs, fab, icon, esc, initials, owed, $ }) {
  let toastTimer;
  function header(title, { back, action } = {}) {
    const data = getData();
    top.innerHTML = `${back ? `<a class="iconbtn" href="${back}" aria-label="Volver">${icon('back')}</a>` : `<a class="brand me" href="#/perfil" aria-label="Mi perfil">${data.settings.driver ? esc(initials(data.settings.driver)) : icon('users')}</a>`}
    <h1>${esc(title)}</h1>
    ${action ? `<a class="iconbtn" href="${action.href}" aria-label="${action.label}">${icon(action.icon)}</a>` : '<span></span>'}`;
}
function setTabs(on) {
  const data = getData();
  const n = new Set(data.trips.filter(owed).map((t) => t.clientId)).size;
  const tab = (h, ic, l, k, extra = '') => `<a href="${h}" class="${on === k ? 'on' : ''}" ${on === k ? 'aria-current="page"' : ''}>${icon(ic)}${l}${extra}</a>`;
  tabs.innerHTML = tab('#/', 'calendar', 'Agenda', 'agenda') + tab('#/clientes', 'users', 'Clientes', 'clientes')
    + tab('#/cobros', 'wallet', 'Cobros', 'cobros', n ? `<span class="dot">${n}</span>` : '') + tab('#/resumen', 'chart', 'Resumen', 'resumen');
}
function setFab(fn) {
  fab.hidden = !fn;
  fab.onclick = fn;
}
function toast(msg, act) {
  const t = $('#toast');
  t.textContent = msg;
  if (act) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = act.label;
    b.onclick = () => { clearTimeout(toastTimer); t.classList.remove('on', 'act'); act.fn(); };
    t.append(b);
  }
  t.classList.toggle('act', !!act);
  t.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('on', 'act'), act ? 7000 : 1800);
}
  return { header, setTabs, setFab, toast };
}
