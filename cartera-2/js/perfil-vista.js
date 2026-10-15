// Vista del perfil del conductor y sus datos compartidos.
export function createProfileView({ getData, header, top, icon, $, shareSheet, setTabs, setFab, today, view, esc, initials, money, EXTRAS_INFO, payTo, toast, editProfile }) {
  function renderProfile() {
    const data = getData();
    const s = data.settings;
    header('Mi perfil', { back: '#/' });
    top.lastElementChild.outerHTML = `<button class="iconbtn" data-share aria-label="Compartir mi página">${icon('share')}</button>`;
    $('[data-share]', top).onclick = shareSheet;
    setTabs('');
    setFab(null);
    const done = data.trips.filter((t) => t.status === 'hecho');
    const month = done.filter((t) => t.date.startsWith(today().slice(0, 7))).reduce((x, t) => x + +t.price, 0);
    const X = s.extra;
    const card = `Hola, soy ${s.driver}${s.city ? ', conductor privado en ' + s.city : ''}. 🚗${s.car ? `\n${s.car} ${s.year} ${s.color}`.trimEnd() + `, ${s.seats} pasajeros` : ''}${s.extras.length ? ` · ${s.extras.join(', ')}` : ''}.\nGuarda mi número y escríbeme por aquí para agendar tus viajes.${s.phone ? `\nWhatsApp: ${s.phone}` : ''}`;
    view.innerHTML = `
      <section class="hero"><span class="avatar big">${esc(initials(s.driver || '?'))}</span><h2>${esc(s.driver || 'Tu nombre')}</h2><span class="muted">Conductor privado${s.city ? ' · ' + esc(s.city) : ''}</span></section>
      <section class="tiles"><div class="tile"><small>Clientes</small><b>${data.clients.length}</b></div><div class="tile"><small>Viajes</small><b>${done.length}</b></div><div class="tile"><small>Este mes</small><b>${money(month)}</b></div></section>
      <section class="card psect"><h3>Mis datos <button data-edit="1">Editar</button></h3>
        <div class="copy"><span>WhatsApp <code>${esc(s.phone || '—')}</code></span>${s.phone ? `<button data-copy="${esc(s.phone)}">Copiar</button>` : ''}</div></section>
      <section class="card psect"><h3>Mi auto <button data-edit="2">Editar</button></h3>
        ${s.car ? `<div class="carrow"><span class="ic">${icon('car')}</span><div><b>${esc(s.car)} ${esc(s.year)}</b><span class="muted">${[s.color, s.plates.toUpperCase(), `${s.seats} pasajeros`].filter(Boolean).map(esc).join(' · ')}</span></div></div>
        ${s.extras.length ? `<div class="tags">${s.extras.map((x) => `<i>${esc(x)}</i>`).join('')}</div>` : ''}` : '<p class="muted">Agrega tu auto para mandarlo en tu tarjeta.</p>'}</section>
      <section class="card psect"><h3>Mi tarifa <button data-edit="3">Editar</button></h3>
        <dl class="kv2"><dt>Por km</dt><dd>$${s.perKm}</dd><dt>Por hora</dt><dd>$${s.perHour}</dd>
        ${EXTRAS_INFO.filter(([k]) => X[k].on).map(([k, l, u]) => `<dt>${l}</dt><dd>${u === '%' ? '+' + X[k].v + '%' : u === '$/min' ? '$' + X[k].v + '/min' : money(X[k].v)}</dd>`).join('')}</dl></section>
      <section class="card psect"><h3>Cómo cobro <button data-edit="4">Editar</button></h3>
        <div class="tags">${s.pays.map((x) => `<i>${esc(x)}</i>`).join('') || '<span class="muted">Sin elegir</span>'}</div>
        ${payTo() ? `<div class="copy"><span>${esc(s.bank)} <code>${esc(s.clabe)}</code>${s.holder ? `<br><small class="muted">A nombre de ${esc(s.holder)}</small>` : ''}</span><button data-copy="${esc(s.clabe)}">Copiar</button></div>` : ''}</section>
      <a class="share" href="https://wa.me/?text=${encodeURIComponent(card)}" target="_blank" rel="noopener">${icon('wa')} Compartir mi tarjeta por WhatsApp</a>`;
    view.querySelectorAll('[data-copy]').forEach((b) => (b.onclick = async () => {
      try { await navigator.clipboard.writeText(b.dataset.copy); toast('Copiado'); } catch { toast('No se pudo copiar'); }
    }));
    view.querySelectorAll('[data-edit]').forEach((b) => (b.onclick = () => editProfile(+b.dataset.edit)));
  }
  return renderProfile;
}
