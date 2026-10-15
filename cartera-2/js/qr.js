// Utilidades para crear el enlace comprimido y los recursos QR de la página del conductor.
const b64u = (bytes) => { let b = ''; for (const x of bytes) b += String.fromCharCode(x); return btoa(b).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
// Los datos viajan dentro del enlace (sin servidor); se comprimen cuando el navegador puede.
export async function encodePage(obj) {
  const raw = new TextEncoder().encode(JSON.stringify(obj));
  let best = 'j' + b64u(raw);
  if ('CompressionStream' in window) {
    try {
      const z = new Uint8Array(await new Response(new Blob([raw]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer());
      const c = 'z' + b64u(z);
      if (c.length < best.length) best = c;
    } catch {}
  }
  return best;
}

export function qrSvg(qr) {
  const n = qr.getModuleCount(), m = 4;
  let d = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c + m} ${r + m}h1v1h-1z`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n + 2 * m} ${n + 2 * m}" shape-rendering="crispEdges" role="img" aria-label="Código QR de mi página"><rect width="100%" height="100%" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
}
export function qrBlob(qr, title) {
  const n = qr.getModuleCount(), m = 4, W = 900, H = 1060;
  const cell = Math.floor(780 / (n + 2 * m));
  const size = cell * (n + 2 * m);
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#000';
  const x0 = (W - size) / 2 + m * cell, y0 = 50 + m * cell;
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) g.fillRect(x0 + c * cell, y0 + r * cell, cell, cell);
  g.textAlign = 'center';
  g.font = '700 54px system-ui, sans-serif';
  g.fillText(title, W / 2, 50 + size + 90, W - 60);
  g.font = '500 34px system-ui, sans-serif';
  g.fillStyle = '#444';
  g.fillText('Escanea para pedir tu viaje', W / 2, 50 + size + 140, W - 60);
  return new Promise((res) => cv.toBlob(res, 'image/png'));
}
