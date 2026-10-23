// Autocompletado de lugares, rutas frecuentes y cálculo de ruta entre A y B.
export function createPlaceFields({ getData, client, tripsOf, byWhen, esc, icon, fold, searchPlaces, reverse, parseMapLink, route, directionsLink, mapSvg, money, suggestPrice, isAirport, priceMath }) {
  function knownPlaces(clientId) {
    const data = getData();
    const out = new Map();
    const add = (p) => { if (p?.label && p.lat != null && !out.has(p.label)) out.set(p.label, p); };
    const cs = clientId ? [client(clientId)] : data.clients;
    cs.forEach((c) => (c?.services || []).forEach((sv) => { add(sv.a); add(sv.b); }));
    data.trips.filter((t) => !clientId || t.clientId === clientId).forEach((t) => { add(t.fromPt); add(t.toPt); });
    if (clientId) knownPlaces().forEach((p) => add(p));
    return [...out.values()];
  }
  const nearPoint = () => knownPlaces()[0] || null;
  
  
  function placeInput(pt, which, placeholder, locate = false) {
    return `<div class="stop ${locate ? 'has-loc' : ''}"><span class="dot ${which}"></span><input data-pt="${which}" value="${esc(pt?.label || '')}" placeholder="${placeholder}" autocomplete="off" enterkeyhint="search">${locate ? `<button type="button" class="loc" data-loc aria-label="Usar mi ubicación">${icon('pin')}</button>` : ''}</div>`;
  }
  // Origen habitual del cliente: el que más usa; si no hay viajes, el de su primer servicio.
  function usualFrom(id) {
    const c = client(id);
    if (!c) return null;
    const n = new Map();
    tripsOf(id).filter((x) => x.status !== 'cancelado' && x.fromPt?.label).sort(byWhen).forEach((x) => {
      const e = n.get(x.fromPt.label) || { p: x.fromPt, n: 0 };
      e.n++; e.p = x.fromPt; n.set(x.fromPt.label, e);
    });
    const best = [...n.values()].sort((a, b) => b.n - a.n)[0];
    return best?.p || (c.services || []).find((sv) => sv.a)?.a || null;
  }
  // Sugerencias al escribir; al elegir una, guarda el punto con sus coordenadas.
  function wirePlace(input, clientId, onPick) {
    let timer, box;
    const close = () => { box?.remove(); box = null; };
    const show = (items, note) => {
      close();
      if (!items.length && !note) return;
      box = document.createElement('div');
      box.className = 'sugg';
      box.innerHTML = items.map((p, i) => `<button type="button" data-i="${i}"><span>${esc(p.label)}</span><small>${esc(p.sub || 'Usado antes')}</small></button>`).join('') + (note ? `<div class="g">${note}</div>` : '');
      box.onpointerdown = (e) => e.preventDefault();
      box.onclick = (e) => {
        const b = e.target.closest('[data-i]');
        if (!b) return;
        const p = items[+b.dataset.i];
        input.value = p.label;
        close();
        onPick({ label: p.label, lat: p.lat, lon: p.lon });
      };
      input.parentElement.append(box);
    };
    input.addEventListener('input', () => {
      onPick(null, true);
      clearTimeout(timer);
      const q = input.value.trim();
      if (!q) return close();
      const link = parseMapLink(q);
      if (link) {
        if (link.unreadable) return show([], 'Ese enlace no trae la ubicación. Los cortos (maps.app.goo.gl) no se pueden leer: ábrelo en el navegador y pega el enlace largo, o pega las coordenadas.');
        const fallback = `Ubicación ${link.lat.toFixed(5)}, ${link.lon.toFixed(5)}`;
        const one = (label) => [{ label, sub: 'Del enlace pegado', lat: link.lat, lon: link.lon }];
        show(one(link.name || fallback), '');
        if (!link.name) reverse(link.lat, link.lon).then((r) => {
          if (input.value.trim() === q && document.activeElement === input) show(one(r.label || fallback), '');
        }).catch(() => {});
        return;
      }
      const words = fold(q).split(/\s+/);
      const local = knownPlaces(typeof clientId === 'function' ? clientId() : clientId).filter((p) => words.every((w) => fold(p.label + ' ' + (p.sub || '')).includes(w))).slice(0, 3);
      show(local, q.length >= 3 ? 'Buscando en el mapa…' : '');
      if (q.length < 3) return;
      timer = setTimeout(async () => {
        try {
          const city = (getData().settings.city || '').trim();
          const found = (await searchPlaces(q, nearPoint(), city)).filter((r) => !local.some((l) => l.label === r.label));
          if (input.value.trim() !== q || document.activeElement !== input) return;
          show([...local, ...found].slice(0, 6), found.length ? 'Mapa: OpenStreetMap' : `No lo encuentro en el mapa. Prueba otra parte del nombre o la calle, o pega un enlace de Google Maps${city ? '' : '. Pon tu ciudad en Yo → Mis datos para buscar mejor'}.`);
        } catch {
          if (input.value.trim() === q) show(local, 'Sin conexión: puedes escribir la dirección y el precio a mano.');
        }
      }, 650);
    });
    input.addEventListener('blur', () => setTimeout(close, 150));
  }
  // Distancia, tiempo, mapa y precio sugerido de A a B.
  async function fillRoute(el, a, b, via = []) {
    if (!a || !b) { el.innerHTML = '<div class="empty-route">Elige el punto A y el punto B de la lista para ver distancia, tiempo y precio.</div>'; return null; }
    el.innerHTML = '<div class="empty-route">Calculando ruta…</div>';
    try {
      const r = await route(a, b, via);
      el.innerHTML = `${mapSvg(r.path, `Ruta de ${esc(a.label)} a ${esc(b.label)}${via.length ? ` con ${via.length} parada${via.length > 1 ? 's' : ''}` : ''}`, via)}
        <div class="stats"><div><small>Distancia</small><b>${r.km} km</b></div><div><small>Tiempo</small><b>${r.min} min</b></div><div class="price"><small>Sugerido</small><b>${money(suggestPrice(r.km, r.min, { airport: isAirport(a.label, b.label) }))}</b></div></div>
        <div class="how">${priceMath(r.km, r.min, { airport: isAirport(a.label, b.label) })} · <a href="${directionsLink(a, b, via)}" target="_blank" rel="noopener">Ver en Google Maps</a></div>`;
      return r;
    } catch {
      el.innerHTML = '<div class="empty-route">No se pudo calcular la ruta (¿sin internet?). Pon el precio a mano.</div>';
      return null;
    }
  }
  // Paradas entre A y B: el «+» queda justo arriba de B y cada parada nueva se agrega antes de él.
  // Cada parada se elige igual que A y B (lista, enlace de Google Maps o coordenadas).
  function stopsField(box, { clientId, onChange, initial = [] }) {
    const bRow = box.querySelector('[data-pt=b]').parentElement;
    const add = document.createElement('button');
    add.type = 'button'; add.className = 'addstop';
    add.innerHTML = '<span class="plus" aria-hidden="true">+</span><span>Agregar parada</span>';
    box.insertBefore(add, bRow);
    const rows = [];
    const addRow = (pt) => {
      const row = document.createElement('div');
      row.className = 'stop has-x';
      row.innerHTML = `<span class="dot s"></span><input data-pt="s" value="${esc(pt?.label || '')}" placeholder="Parada ${rows.length + 1}" autocomplete="off" enterkeyhint="search"><button type="button" class="loc rm" aria-label="Quitar parada">×</button>`;
      row._pt = pt && pt.lat != null ? { label: pt.label, lat: pt.lat, lon: pt.lon } : null;
      box.insertBefore(row, add);
      rows.push(row);
      const input = row.querySelector('input');
      wirePlace(input, clientId, (p, typing) => { row._pt = p; if (!typing || !p) onChange(); });
      row.querySelector('.rm').onclick = () => { row.remove(); rows.splice(rows.indexOf(row), 1); onChange(); };
      return input;
    };
    const renumber = () => rows.forEach((r, i) => { r.querySelector('input').placeholder = `Parada ${i + 1}`; });
    add.onclick = () => addRow(null).focus();
    box.addEventListener('click', (e) => { if (e.target.closest('.rm')) renumber(); });
    initial.forEach((p) => addRow(p));
    return {
      get: () => rows.map((r) => r._pt).filter(Boolean).map(({ label, lat, lon }) => ({ label, lat, lon })),
      // Hay una parada escrita a medias (sin elegir de la lista): la ruta aún no se puede calcular.
      bad: () => rows.some((r) => r.querySelector('input').value.trim() && !r._pt),
      set: (list) => { rows.splice(0).forEach((r) => r.remove()); (list || []).forEach((p) => addRow(p)); },
    };
  }
  return { knownPlaces, nearPoint, placeInput, usualFrom, wirePlace, fillRoute, stopsField };
}
