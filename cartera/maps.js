// Lugares y rutas. Por ahora con OpenStreetMap (gratis, sin clave):
// Nominatim para buscar direcciones y OSRM para distancia y tiempo.
// Cuando haya clave de Google Maps, se cambia aquí sin tocar el resto.

const cache = new Map();
const cached = async (key, fn) => {
  if (!cache.has(key)) cache.set(key, fn().catch((e) => { cache.delete(key); throw e; }));
  return cache.get(key);
};

// Nombre corto y legible a partir del resultado de Nominatim.
function labelOf(r) {
  const a = r.address || {};
  const name = r.name || [a.road, a.house_number].filter(Boolean).join(' ') || r.display_name.split(',')[0];
  const area = a.suburb || a.neighbourhood || a.quarter || a.road || '';
  const city = a.city || a.town || a.village || a.county || '';
  return { label: [name, area && area !== name ? area : ''].filter(Boolean).join(', '), sub: [city, a.state].filter(Boolean).join(', ') };
}

export function searchPlaces(q, near) {
  const p = new URLSearchParams({ q, format: 'jsonv2', addressdetails: '1', limit: '5', 'accept-language': 'es', countrycodes: 'mx' });
  if (near) {
    const d = 0.6;
    p.set('viewbox', [near.lon - d, near.lat + d, near.lon + d, near.lat - d].join(','));
  }
  return cached('s:' + p, async () => {
    const res = await fetch('https://nominatim.openstreetmap.org/search?' + p);
    if (!res.ok) throw new Error('search');
    return (await res.json()).map((r) => ({ ...labelOf(r), lat: +r.lat, lon: +r.lon }));
  });
}

// Dirección a partir de coordenadas (para «Mi ubicación»).
export function reverse(lat, lon) {
  return cached(`v:${lat.toFixed(4)},${lon.toFixed(4)}`, async () => {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=jsonv2&addressdetails=1&accept-language=es`);
    if (!res.ok) throw new Error('reverse');
    const r = await res.json();
    if (!r || r.error) throw new Error('reverse');
    return { ...labelOf(r), lat, lon };
  });
}

export function route(a, b) {
  const k = `r:${a.lon.toFixed(5)},${a.lat.toFixed(5)};${b.lon.toFixed(5)},${b.lat.toFixed(5)}`;
  return cached(k, async () => {
    const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${k.slice(2)}?overview=simplified&geometries=geojson`);
    const d = await res.json();
    if (d.code !== 'Ok' || !d.routes?.length) throw new Error('route');
    const r = d.routes[0];
    // OSRM no conoce el tráfico: se agrega un 25 % para acercarse a lo real en ciudad.
    return { km: Math.round(r.distance / 100) / 10, min: Math.max(1, Math.round((r.duration / 60) * 1.25)), path: r.geometry.coordinates };
  });
}

export const directionsLink = (a, b) => `https://www.google.com/maps/dir/?api=1&origin=${a.lat},${a.lon}&destination=${b.lat},${b.lon}&travelmode=driving`;

// Mini mapa: el trazo de la ruta sobre un fondo neutro (sin mosaicos externos).
export function mapSvg(path, label = 'Ruta') {
  if (!path?.length) return '';
  const W = 360, H = 120, pad = 16;
  const xs = path.map((p) => p[0]), ys = path.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const k = Math.min((W - 2 * pad) / (x1 - x0 || 1e-6), (H - 2 * pad) / (y1 - y0 || 1e-6));
  const ox = (W - (x1 - x0) * k) / 2, oy = (H - (y1 - y0) * k) / 2;
  const pt = ([x, y]) => [ox + (x - x0) * k, H - (oy + (y - y0) * k)].map((n) => n.toFixed(1));
  const pts = path.map(pt);
  const [ax, ay] = pts[0], [bx, by] = pts[pts.length - 1];
  return `<svg class="map" viewBox="0 0 ${W} ${H}" role="img" aria-label="${label}">
    <rect width="${W}" height="${H}" fill="var(--map)"/>
    <g stroke="var(--road)" stroke-width="5" fill="none"><path d="M0 38H${W}M0 86H${W}M80 0V${H}M190 0V${H}M290 0V${H}"/></g>
    <polyline points="${pts.map((p) => p.join(',')).join(' ')}" fill="none" stroke="var(--accent)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${ax}" cy="${ay}" r="7" fill="var(--pin-a)" stroke="var(--surface)" stroke-width="3"/>
    <rect x="${bx - 7}" y="${by - 7}" width="14" height="14" rx="3" fill="var(--pin-b)" stroke="var(--surface)" stroke-width="3"/>
  </svg>`;
}
