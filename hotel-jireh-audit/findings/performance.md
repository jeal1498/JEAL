# Performance Analysis — Hotel Jireh Bacalar
**URL:** https://hotel-jireh.vercel.app/  
**Fecha de analisis:** 2026-06-22  
**Metodo:** Inspeccion de codigo fuente + datos de red medidos

---

## Resumen ejecutivo

La pagina tiene una arquitectura excepcionalmente limpia: HTML estatico sin JS externo, sin CSS externo, sin Google Fonts remotos y servida desde Vercel CDN edge. Esto elimina la mayoria de los problemas tipicos de LCP y CLS. El unico cuello de botella real es el tamano y formato de las imagenes, en particular la imagen hero (`facade-day.jpg`, 177 KB en JPEG sin preload declarado). El INP deberia ser practicamente perfecto dado que no hay JavaScript en la pagina.

---

## Core Web Vitals — Estimaciones

> Sin datos de campo CrUX disponibles (trafico insuficiente para que Google genere percentiles). Las estimaciones se basan en TTFB medido, tamano de recursos y analisis del codigo fuente.

| Metrica | Umbral "Bueno" | Estimacion | Estado |
|---------|---------------|------------|--------|
| **LCP** | <= 2.5 s | ~1.6 – 2.2 s | CONDICIONAL — depende de red del usuario |
| **INP** | <= 200 ms | < 50 ms | BUENO (sin JS) |
| **CLS** | <= 0.1 | ~0.02 – 0.05 | BUENO con riesgo menor |

### Desglose LCP

El elemento LCP candidato es `<img src="images/facade-day.jpg">` en el hero, dentro de `.hero-photo-frame`. Es la imagen mas grande en viewport inicial en desktop.

| Subparte LCP | Valor estimado | Notas |
|-------------|----------------|-------|
| TTFB | 290 ms | Medido. Vercel edge, aceptable |
| Resource Load Delay | ~0 ms | No hay render-blocking resources; HTML descubre la imagen de inmediato |
| Resource Load Time | ~800 – 1400 ms | 177 KB JPEG en conexion 4G tipica (~1.5 Mbps efectivo movil) = ~950 ms |
| Element Render Delay | ~50 – 100 ms | Paint inmediato tras descarga; sin JS que bloquee |
| **LCP total estimado** | **~1.1 – 1.8 s desktop / ~1.6 – 2.2 s movil** | Aceptable pero mejorable |

**Riesgo:** En redes 3G lentas (~400 Kbps) la imagen hero tarda ~3.5 s sola, lo que empujaria el LCP a zona "Needs Improvement" (>2.5 s). Con formato WebP/AVIF y preload, el margen de seguridad mejora sustancialmente.

### Razonamiento CLS

- Las imagenes `<img class="room-photo">` y las de galeria NO tienen atributos `width`/`height` ni `aspect-ratio` en el elemento `<img>` directamente (aunque el CSS aplica `aspect-ratio:4/3` o `aspect-ratio:4/5` a los contenedores).
- Las imagenes hero y de galeria tienen `object-fit:cover` en contenedores con dimensiones CSS fijas, lo que **previene el layout shift** efectivamente.
- Logo en header: `height:44px; width:44px` definidos en CSS — estable.
- No hay anuncios, iframes ni contenido inyectado dinamicamente.
- **Riesgo residual:** Las imagenes de galeria en mobile usan `grid-auto-rows:150px` y los `<img>` internos tienen `height:100%` — estable. El CLS deberia ser muy bajo.

### Razonamiento INP

La pagina no tiene JavaScript. Las unicas interacciones son:
- Links `<a href="...">` — respuesta nativa del browser, <50 ms.
- Links de ancla con `scroll-behavior:smooth` — nativo CSS, sin JS.
- WhatsApp float button — link nativo.

INP estimado: **< 50 ms**. No hay riesgo.

---

## Problemas identificados por impacto

### P1 — CRITICO: Imagen hero sin `fetchpriority="high"` ni `<link rel="preload">`

**Archivo:** `index.html` linea 711  
**Codigo actual:**
```html
<img src="images/facade-day.jpg" alt="...">
```

El navegador no sabe que esta imagen es el LCP hasta que parsea el HTML y procesa el layout. Sin `fetchpriority="high"`, la imagen compite con otros recursos durante el discovery. En conexiones moviles lentas esto puede costar 200-400 ms adicionales de LCP.

**Impacto estimado:** -200 a -400 ms en LCP movil.

---

### P2 — ALTO: Todas las imagenes en JPEG; sin WebP ni AVIF

**Ahorro potencial:**

| Imagen | JPEG actual | WebP estimado (-30%) | AVIF estimado (-45%) |
|--------|------------|----------------------|----------------------|
| facade-day.jpg (hero/LCP) | 177 KB | 124 KB | 97 KB |
| facade-night.jpg | 142 KB | 99 KB | 78 KB |
| room-simple.jpg | 116 KB | 81 KB | 64 KB |
| palapa.jpg | 48 KB | 34 KB | 26 KB |
| pool.jpg | 27 KB | 19 KB | 15 KB |
| room-king.jpg | 27 KB | 19 KB | 15 KB |
| logo.jpg | 22 KB | — | — (ver P4) |
| **Total** | **548 KB** | **~376 KB** | **~295 KB** |

Solo convirtiendo la imagen hero a WebP se ahorra ~53 KB, lo que en movil 4G representa ~280 ms menos de tiempo de carga. Con AVIF el ahorro es ~80 KB (~420 ms).

---

### P3 — ALTO: Imagenes below-the-fold sin `loading="lazy"`

Las imagenes de galeria y habitaciones cargan en el request inicial junto con la imagen hero, compitiendo por ancho de banda. Las siguientes imagenes son claramente below-the-fold:

- `images/facade-night.jpg` — galeria (linea 727)
- `images/room-simple.jpg` — galeria + seccion habitaciones (lineas 729, 808)
- `images/room-king.jpg` — galeria + seccion habitaciones (lineas 731, 828)
- `images/pool.jpg` — galeria (linea 734)
- `images/palapa.jpg` — galeria + habitacion Familiar (lineas 737, 846)

Sin lazy loading, el browser descarga ~460 KB de imagenes que el usuario puede no ver nunca. Esto consume ancho de banda que ralentiza la descarga de la imagen hero (LCP).

**Impacto estimado en LCP:** -150 a -300 ms al reducir contention de red.

---

### P4 — MEDIO: Logo en formato JPEG

**Archivo:** `images/logo.jpg` (22 KB)  
El logo tiene fondo solido (object-fit:contain en un cuadro de 44x44 px). Un JPEG no puede tener transparencia. Deberia ser SVG (ideal, vectorial, ~1-3 KB) o PNG con transparencia si tiene capas. Ademas, el logo se carga en el `<header>` sticky y en el `<footer>` — dos peticiones al mismo archivo (aunque el browser cachea, ambas referencias existen en el DOM).

**Impacto:** Menor en bytes, pero importante para calidad visual y flexibilidad de diseno (el fondo crema actual puede no coincidir en todos los contextos).

---

### P5 — MEDIO: Sin atributos `width`/`height` explicitos en elementos `<img>`

Aunque el CSS establece dimensiones via `aspect-ratio` y `height` en los contenedores, los elementos `<img>` en si no tienen `width` y `height` como atributos HTML. Segun la especificacion, el browser calcula el aspect ratio reservado a partir de estos atributos antes de que cargue el CSS. Sin ellos, hay una ventana donde el browser no sabe cuanto espacio reservar.

Afecta a:
- `<img class="room-photo">` — 3 instancias en seccion habitaciones
- `<img>` en `.gallery-grid` — 5 instancias
- `<img>` en `.hero-photo-frame` — 1 instancia (la mas importante)

En la practica el CSS mitiga esto, pero el riesgo de CLS en conexiones lentas donde CSS carga antes que el layout se calcula persiste.

---

### P6 — BAJO: `logo.jpg` cargado dos veces en el DOM (header + footer)

```html
<!-- Header, linea 675 -->
<img src="images/logo.jpg" alt="Logo Hotel Jireh Bacalar">

<!-- Footer, linea 943 -->
<img src="images/logo.jpg" alt="Logo Hotel Jireh" style="height:40px;width:40px;...">
```

El navegador cachea el recurso, pero ambas instancias disparan el primer request. El de footer deberia tener `loading="lazy"` ya que esta al final de la pagina y no es parte del LCP.

---

### P7 — BAJO: `scroll-behavior:smooth` sin respeto a preferencias de movimiento reducido

El CSS define `scroll-behavior:smooth` en `html{}`, y la media query `prefers-reduced-motion` solo lo sobreescribe con `scroll-behavior:auto`. Esto esta bien implementado. Sin embargo, la propiedad `transition` en `.btn` y `.wa-float` **no** esta anidada dentro de la media query de movimiento reducido — el override `*{transition:none !important}` la cubre. Correcto, pero verificar que no haya JS futuro que rompa esto.

---

## Recomendaciones priorizadas

### 1. Anadir `fetchpriority="high"` a la imagen hero (5 minutos, impacto alto)

```html
<!-- index.html, linea 711 -->
<img src="images/facade-day.jpg"
     alt="Fachada y entrada del Hotel Jireh en Bacalar, Quintana Roo"
     fetchpriority="high">
```

Opcionalmente, anadir un `<link rel="preload">` en el `<head>`:

```html
<link rel="preload" as="image" href="images/facade-day.jpg" fetchpriority="high">
```

---

### 2. Convertir imagenes a WebP/AVIF con `<picture>` fallback (1-2 horas, impacto alto)

Proceso de conversion:
```bash
# Requiere cwebp (libwebp) o squoosh-cli
cwebp -q 82 facade-day.jpg -o facade-day.webp
# Para AVIF: avifenc o squoosh
```

Implementacion en HTML para la imagen hero:
```html
<picture>
  <source srcset="images/facade-day.avif" type="image/avif">
  <source srcset="images/facade-day.webp" type="image/webp">
  <img src="images/facade-day.jpg"
       alt="Fachada y entrada del Hotel Jireh en Bacalar, Quintana Roo"
       fetchpriority="high"
       width="800" height="1000">
</picture>
```

Para imagenes de galeria y habitaciones usar el mismo patron con `loading="lazy"`.

---

### 3. Anadir `loading="lazy"` a imagenes below-the-fold (15 minutos, impacto alto)

```html
<!-- Galeria — todas excepto la primera si fuera LCP -->
<img src="images/facade-night.jpg" alt="..." loading="lazy">
<img src="images/room-simple.jpg" alt="..." loading="lazy">
<img src="images/room-king.jpg" alt="..." loading="lazy">
<img src="images/pool.jpg" alt="..." loading="lazy">
<img src="images/palapa.jpg" alt="..." loading="lazy">

<!-- Seccion habitaciones -->
<img class="room-photo" src="images/room-simple.jpg" alt="..." loading="lazy">
<img class="room-photo" src="images/room-king.jpg" alt="..." loading="lazy">
<img class="room-photo" src="images/palapa.jpg" alt="..." loading="lazy">

<!-- Logo en footer -->
<img src="images/logo.jpg" alt="Logo Hotel Jireh" loading="lazy" ...>
```

---

### 4. Anadir `width` y `height` a todos los elementos `<img>` (20 minutos, impacto medio)

Permite que el browser reserve espacio antes de que carguen las imagenes, eliminando el riesgo residual de CLS.

```html
<!-- Hero -->
<img src="images/facade-day.jpg" width="800" height="1000" ...>

<!-- Room cards (aspect-ratio 4/3) -->
<img class="room-photo" src="images/room-simple.jpg" width="400" height="300" ...>

<!-- Gallery (dimensiones aproximadas segun la imagen real) -->
<img src="images/facade-night.jpg" width="600" height="400" ...>
```

Usar las dimensiones reales de los archivos originales (o proximas al aspect ratio del CSS).

---

### 5. Reemplazar logo.jpg por SVG o PNG con transparencia (30-60 min, impacto medio)

Si existe el archivo fuente del logo (AI, Figma, etc.), exportarlo como SVG inline o como `<img>` SVG. Ventajas:
- Peso: de 22 KB a ~2-5 KB
- Transparencia real (no fondo blanco/crema)
- Nitidez perfecta en pantallas Retina/HiDPI
- Sin request HTTP si se usa SVG inline

---

## Impacto esperado acumulado

| Accion | LCP mejora estimada | CLS | INP |
|--------|--------------------|----|-----|
| fetchpriority="high" en hero | -200 a -400 ms | — | — |
| WebP para hero | -250 a -400 ms | — | — |
| loading="lazy" en below-the-fold | -100 a -250 ms (al reducir contention) | — | — |
| width/height en img | — | riesgo residual eliminado | — |
| **Combinado** | **LCP estimado: ~0.9 – 1.4 s** | **< 0.02** | **< 50 ms** |

---

## Lo que ya esta bien

- Sin JavaScript externo: INP excelente garantizado.
- Sin Google Fonts remotos: elimina tipico retardo de 200-500 ms.
- Sin CSS externo: sin render-blocking stylesheets.
- TTFB de 290 ms desde Vercel CDN edge: dentro del umbral recomendado (<800 ms para bueno, <200 ms ideal).
- HSTS habilitado: sin redirects HTTP->HTTPS.
- CSS inline: descarga y parseo en un solo roundtrip con el HTML.
- `prefers-reduced-motion` implementado en CSS.
- Skip link de accesibilidad presente.
- Schema.org JSON-LD completo (no afecta performance).
- `scroll-behavior:smooth` nativo CSS, sin JS.

---

## Configuracion de cache recomendada

El header actual `Cache-Control: public, max-age=0, must-revalidate` significa que las imagenes se revalidan en cada visita. Para activos estaticos con hash en el nombre, lo ideal seria `max-age=31536000, immutable`. En Vercel esto se configura en `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/images/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

Esto elimina la revalidacion de imagenes en visitas repetidas, mejorando el LCP para usuarios que regresan.

---

## Metricas objetivo post-optimizacion

| Metrica | Actual (estimado) | Objetivo post-fix |
|---------|------------------|-------------------|
| LCP desktop | ~1.1 – 1.6 s | < 1.0 s |
| LCP movil (4G) | ~1.6 – 2.2 s | < 1.3 s |
| LCP movil (3G lento) | ~3.0 – 4.0 s | < 2.0 s |
| INP | < 50 ms | < 50 ms (sin cambio) |
| CLS | ~0.02 – 0.05 | < 0.02 |
| Bytes de imagen totales | 548 KB | ~165 – 220 KB (WebP lazy) |
