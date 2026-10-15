// Autocompletado de lugares, rutas frecuentes y cálculo de ruta entre A y B.
export function createPlaceFields({ getData, client, tripsOf, byWhen, esc, icon, fold, searchPlaces, route, directionsLink, mapSvg, money, suggestPrice, isAirport, priceMath }) {
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
      const words = fold(q).split(/\s+/);
      const local = knownPlaces(typeof clientId === 'function' ? clientId() : clientId).filter((p) => words.every((w) => fold(p.label + ' ' + (p.sub || '')).includes(w))).slice(0, 3);
      show(local, q.length >= 3 ? 'Buscando en el mapa…' : '');
      if (q.length < 3) return;
      timer = setTimeout(async () => {
        try {
          const found = (await searchPlaces(q, nearPoint())).filter((r) => !local.some((l) => l.label === r.label));
          if (input.value.trim() !== q || document.activeElement !== input) return;
          show([...local, ...found].slice(0, 6), found.length ? 'Mapa: OpenStreetMap' : 'Sin resultados en el mapa. Agrega colonia o ciudad.');
        } catch {
          if (input.value.trim() === q) show(local, 'Sin conexión: puedes escribir la dirección y el precio a mano.');
        }
      }, 650);
    });
    input.addEventListener('blur', () => setTimeout(close, 150));
  }
  // Distancia, tiempo, mapa y precio sugerido de A a B.
  async function fillRoute(el, a, b) {
    if (!a || !b) { el.innerHTML = '<div class="empty-route">Elige el punto A y el punto B de la lista para ver distancia, tiempo y precio.</div>'; return null; }
    el.innerHTML = '<div class="empty-route">Calculando ruta…</div>';
    try {
      const r = await route(a, b);
      el.innerHTML = `${mapSvg(r.path, `Ruta de ${esc(a.label)} a ${esc(b.label)}`)}
        <div class="stats"><div><small>Distancia</small><b>${r.km} km</b></div><div><small>Tiempo</small><b>${r.min} min</b></div><div class="price"><small>Sugerido</small><b>${money(suggestPrice(r.km, r.min, { airport: isAirport(a.label, b.label) }))}</b></div></div>
        <div class="how">${priceMath(r.km, r.min, { airport: isAirport(a.label, b.label) })} · <a href="${directionsLink(a, b)}" target="_blank" rel="noopener">Ver en Google Maps</a></div>`;
      return r;
    } catch {
      el.innerHTML = '<div class="empty-route">No se pudo calcular la ruta (¿sin internet?). Pon el precio a mano.</div>';
      return null;
    }
  }
  return { knownPlaces, nearPoint, placeInput, usualFrom, wirePlace, fillRoute };
}
