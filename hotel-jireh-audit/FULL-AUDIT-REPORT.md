# Auditoría SEO Completa — Hotel Jireh Bacalar

**URL auditada:** https://hotel-jireh.vercel.app/  
**Fecha:** 22 de junio 2026  
**Tipo de negocio:** Hotel familiar económico · Brick-and-mortar · Bacalar, Quintana Roo, México  

---

## Puntuación Global de Salud SEO

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│          SEO HEALTH SCORE: 44 / 100                     │
│                                                         │
│  Technical SEO       34/100  ████░░░░░░  (22%)          │
│  Content / E-E-A-T   47/100  █████░░░░░  (23%)          │
│  On-Page SEO         48/100  █████░░░░░  (20%)          │
│  Schema              42/100  ████░░░░░░  (10%)          │
│  Performance CWV     65/100  ██████░░░░  (10%)          │
│  AI Search (GEO)     52/100  █████░░░░░  (10%)          │
│  Imágenes            58/100  ██████░░░░  ( 5%)          │
│                                                         │
│  Local SEO           33/100  (referencial)              │
│  SXO                 41/100  (referencial)              │
└─────────────────────────────────────────────────────────┘
```

**Diagnóstico:** El sitio tiene una arquitectura técnica limpia (HTML estático, HTTPS/HSTS, sin JavaScript bloqueante) pero está severamente limitado por **un solo problema que se ramifica en cascada**: el canonical apunta a un dominio que no existe (`hoteljirehbacalar.com`). Este error único arrastra los scores de Technical, Schema, GEO, Local SEO y SXO. Corregirlo toma 30 minutos y es el fix de mayor ROI del sitio.

---

## Top 5 Problemas Críticos

| # | Problema | Área | Impacto |
|---|----------|------|---------|
| 1 | Canonical apunta a dominio inexistente | Técnico + Schema + GEO | Posible deindexación |
| 2 | robots.txt y sitemap.xml — 404 | Técnico | Crawl sin guía |
| 3 | OG image rota (mismo dominio muerto) | Técnico | Previsualizaciones en blanco en WhatsApp/Facebook |
| 4 | Sin GBP vinculado ni presencia en OTAs | Local SEO | Invisible en Local Pack y Google Hotels |
| 5 | Keywords objetivo no competibles vs OTAs | SXO | Estrategia de keywords sin resultados posibles |

## Top 5 Quick Wins (< 2 horas total)

| # | Acción | Tiempo | Impacto |
|---|--------|--------|---------|
| 1 | Corregir canonical en 4 lugares (`<link>`, `og:url`, `og:image`, schema `url`) | 15 min | Desbloquea indexación y AI citations |
| 2 | Crear `robots.txt` + `sitemap.xml` con Image Sitemap | 20 min | Crawl guiado + descubrimiento de imágenes |
| 3 | Corregir `@id`, `url` e `image` en Hotel schema | 20 min | Desbloquea rich results de Hotel |
| 4 | Atribuir rating: '7.2/10 en Booking.com' con enlace | 5 min | Convierte self-claim en cita verificable |
| 5 | Añadir `fetchpriority="high"` en imagen hero | 5 min | Mejora LCP estimado 200-400ms |

---

## Hallazgos Detallados por Categoría

### 1. Technical SEO — 34/100

#### Lo que funciona bien
- HTTPS con HSTS (max-age=63072000, includeSubDomains, preload)
- HTML estático — Googlebot lee sin necesidad de JavaScript
- `lang="es-MX"` correcto, viewport y charset UTF-8 presentes
- 1 H1 limpio, estructura H2/H3 lógica sin duplicados

#### Problemas

**🔴 CRÍTICO — Canonical a dominio inexistente**  
`<link rel="canonical" href="https://www.hoteljirehbacalar.com/">` apunta a un dominio inactivo que devuelve NXDOMAIN. Google puede estar ignorando o desindexando la página. El mismo error se repite en `og:url`, `og:image` y en el campo `url` del Hotel schema — cuatro referencias al mismo dominio muerto.

*Fix:* Cambiar las 4 referencias a `https://hotel-jireh.vercel.app/` hasta que `hoteljirehbacalar.com` esté activo y con el sitio migrado.

**🔴 CRÍTICO — robots.txt y sitemap.xml no existen (404)**  
Los crawlers de Google, GPTBot, ClaudeBot y PerplexityBot trabajan sin guía. Las 7 imágenes del sitio no son descubiertas proactivamente por Google Images al no haber Image Sitemap.

*Fix:* Crear ambos archivos. Ver propuestas en `findings/sitemap.md`.

**🔴 CRÍTICO — OG image rota**  
`og:image` apunta a `https://www.hoteljirehbacalar.com/images/facade-day.jpg`. Cada vez que el URL se comparte en WhatsApp, Facebook o Messenger, aparece sin imagen de previsualización. Para un hotel que depende de recomendaciones boca a boca, esto destruye la presentación del enlace compartido.

*Fix:* Cambiar a `https://hotel-jireh.vercel.app/images/facade-day.jpg`.

**🟠 ALTO — Title 82 chars (máx recomendado: 60-70)**  
"Hotel Jireh Bacalar | Hotel Familiar Económico cerca de la Laguna de los 7 Colores" — el diferenciador "Laguna de los 7 Colores" se trunca en el snippet de Google.

*Fix:* "Hotel Jireh Bacalar | Hospedaje Familiar con Alberca · Bacalar" (62 chars).

**🟠 ALTO — Meta description 240 chars (máx: 155)**  
El CTA "Reserva por WhatsApp o teléfono" queda fuera del snippet visible.

*Fix:* Reducir a ≤155 chars incluyendo keyword, diferenciador y CTA.

**🟡 MEDIO — 5 headers de seguridad HTTP faltantes**  
Faltan: `X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`, `Referrer-Policy`, `Permissions-Policy`. Se agregan con un solo bloque en `vercel.json`.

---

### 2. Content Quality / E-E-A-T — 47/100

| Dimensión | Score | Nota |
|-----------|-------|------|
| Experience | 3/10 | Sin fotos con personas, sin historia del propietario |
| Expertise | 4/10 | Datos verificables pero sin identidad profesional |
| Authoritativeness | 3/10 | Rating sin fuente = self-claim |
| Trustworthiness | 5/10 | Contacto completo pero sin política de cancelación |

#### Problemas

**🔴 CRÍTICO — Sin política de cancelación**  
En páginas transaccionales, la ausencia de política de cancelación es el bloqueador de confianza más importante. El usuario no puede comprometerse a reservar si no sabe qué pasa si necesita cancelar.

*Fix:* Añadir sección de mínimo 100 palabras con: plazo de cancelación sin costo, penalización por cancelación tardía y proceso de reembolso.

**🟠 ALTO — Thin content: 725 palabras**  
Booking.com y TripAdvisor sirven 1,000-3,000 palabras por propiedad. La brecha de contenido es real. El 12% del texto actual es copy genérico ("Todo lo esencial, sin complicaciones") que no aporta información.

*Fix:* Expandir a 1,200-1,500 palabras: historia del hotel (150w), guía de zona (250w), descripciones detalladas de habitación (200w), testimonios reales con nombre y fecha (150w).

**🟠 ALTO — Rating 7.2/10 sin fuente + expuesto en ATF**  
Un rating de 7.2/10 sin plataforma de origen es un self-claim no verificable. Además, visible justo bajo los CTAs genera fricción de duda antes de la reserva. Un rating bajo 8.0 en el hero necesita contextualizarse con testimonios que lo expliquen.

*Fix:* "7.2/10 en Booking.com (142 reseñas)" con enlace. Añadir 2-3 citas textuales de huéspedes reales debajo.

**🟠 ALTO — Cero señales de experiencia humana**  
Sin nombre del propietario, sin fecha de fundación, sin fotos con personas. E-E-A-T requiere identidad humana verificable detrás del contenido.

*Fix:* Sección "Nuestra historia" de 100-150 palabras con nombre del propietario y año de apertura.

**🟡 MEDIO — Pasajes FAQ demasiado cortos para LLMs**  
Las respuestas FAQ tienen 17-38 palabras. El rango óptimo de citación para ChatGPT/Gemini/Perplexity es 134-167 palabras. Las respuestas cortas no son citadas proactivamente por AI.

*Fix:* Expandir cada respuesta FAQ con contexto completo, instrucciones de llegada y datos comparativos.

---

### 3. Schema / Structured Data — 42/100

#### Implementación actual
- `Hotel` con amenidades, coordenadas, 3 Offers, 5 atracciones cercanas ✓
- `FAQPage` con 6 Q&A bien estructuradas ✓

#### Problemas

**🔴 CRÍTICO — url, @id e image en Hotel schema**
- `"url"` apunta a dominio muerto — bloquea asociación de entidad
- Sin `"@id"` — entidad no referenciable desde Knowledge Graph
- Sin `"image"` — Google requiere este campo para activar rich result de Hotel

**🟠 ALTO — checkinTime/checkoutTime no ISO 8601**  
`"13:30"` debe ser `"T13:30:00"` según schema:Time.

**🟠 ALTO — aggregateRating sin fuente atribuible**  
Riesgo de penalización por datos no verificables. Requiere `"url"` con enlace a la plataforma de origen.

**🟡 MEDIO — Faltan WebSite, WebPage, BreadcrumbList**  
Estos 3 schemas anclan la identidad del sitio, declaran fecha de actualización y habilitan breadcrumb snippets.

**ℹ️ INFO — FAQPage: Google eliminó rich results el 7 mayo 2026**  
Sin impacto en AI citations (ChatGPT, Gemini, Perplexity). Mantener sin cambios.

---

### 4. Performance (Core Web Vitals) — 65/100

| Métrica | Estimación | Umbral Google | Estado |
|---------|-----------|---------------|--------|
| LCP | 1.6-2.2s (4G móvil) | <2.5s | ⚠️ Condicional |
| INP | <50ms | <200ms | ✅ Bueno |
| CLS | 0.02-0.05 | <0.1 | ✅ Bueno |
| TTFB | 290ms | <800ms | ✅ Bueno |

#### Lo que funciona
HTML estático + CSS inline + sin JS externo + Vercel CDN = arquitectura ideal para performance. El TTFB de 290ms es excelente para un servidor edge.

#### Problemas

**🟠 ALTO — Sin `fetchpriority="high"` en imagen hero LCP**  
facade-day.jpg (177KB) compite en descarga con 6 imágenes más. Impacto estimado de la corrección: -200 a -400ms en LCP.

**🟠 ALTO — Imágenes en JPEG sin WebP/AVIF**  
- `facade-day.jpg`: 177KB → 124KB WebP (-30%) → 97KB AVIF (-45%)
- Total 7 imágenes: 548KB → 165-295KB con formato moderno

**🟠 ALTO — Sin `loading="lazy"` en imágenes below-the-fold**  
Las 5 imágenes de galería y habitaciones se descargan simultáneamente con el hero.

Con las 3 correcciones: LCP estimado baja de 1.6-2.2s a **0.9-1.4s** — margen cómodo incluso en 3G.

---

### 5. AI Search Readiness (GEO) — 52/100

| Plataforma | Score | Bloqueador principal |
|-----------|-------|---------------------|
| Google AI Overviews | 44/100 | Canonical roto — posible deindexación |
| ChatGPT / Bing Copilot | 35/100 | Sin llms.txt, subdominio vercel.app |
| Perplexity | 48/100 | FAQ útil; canonical roto tiene menor impacto |
| Gemini | 42/100 | Comparte corpus con Google |

#### Señales positivas
- FAQPage schema: el formato más citado por LLMs
- Hotel schema con precios exactos, dirección y coordenadas verificables
- HTML semántico con headings bien estructurados

#### Problemas críticos
1. Canonical roto bloquea AI Overviews y Gemini (comparte índice con Google)
2. Sin robots.txt — crawlers AI sin guía de acceso
3. Sin llms.txt — no hay declaración de contexto y política para LLMs
4. FAQ de 17-38 palabras — por debajo del umbral de citación óptima

Con fixes 1-3 implementados: score estimado sube a **68-72/100**.

---

### 6. Local SEO — 33/100

#### Problemas críticos

**Sin Google Business Profile vinculado**  
El GBP es el factor #1 de ranking local (Whitespark 2026). Sin él, el hotel es invisible en el Local Pack para "hotel en Bacalar".

No hay: Maps embed, enlace a GBP, widget de reseñas Google, `sameAs` en schema apuntando al perfil.

**Sin presencia en OTAs (0 citas Tier 1)**  
Booking.com, TripAdvisor, Expedia y Agoda ni están mencionados ni vinculados. Para un hotel en Bacalar, el 80%+ de reservas de viajeros nuevos pasa por OTAs o Google Hotels.

*Consecuencia doble:* pérdida de canal de reservas Y pérdida de citas de autoridad que alimentan el Knowledge Graph y el GBP.

---

### 7. SXO — 41/100

#### Hallazgo primario: desajuste de tipo de página (CRÍTICO estratégico)

**El hotel no puede rankear posiciones 1-5 para "hotel en Bacalar" independientemente de las mejoras técnicas.** El top-10 orgánico está compuesto 100% por OTAs y guías editoriales. El Google Hotels Pack ocupa las posiciones premium sobre los orgánicos. Ningún hotel directo aparece.

**Estrategia de keywords recomendada:**
| Keyword | Tipo | Competencia | Acción |
|---------|------|-------------|--------|
| "Hotel Jireh Bacalar" | Marca | Baja | Optimizar sitio directo |
| "hotel cerca Fuerte San Felipe Bacalar" | Geolocal exacto | Baja | Página/sección dedicada |
| "hotel Bacalar 600 pesos" | Long-tail precio | Media | Añadir en contenido |
| "hotel Bacalar con alberca y estacionamiento" | Amenidad específica | Media | FAQ + schema |
| "hotel en Bacalar" | Volumen alto | Muy alta (OTAs) | Aparecer en las OTAs que rankean |

#### Fricciones de conversión resueltas con texto
1. Sin tiempo de respuesta WhatsApp → Añadir "Respondemos en <30 min · 8am-10pm"
2. Sin política de cancelación → Añadir en FAQ
3. Rating sin fuente → Atribuir a Booking.com con enlace
4. Sin urgencia → "Julio-Agosto: temporada alta — disponibilidad limitada"

---

### 8. Imágenes — 58/100

| Imagen | Peso actual | Estado |
|--------|------------|--------|
| facade-day.jpg | 177KB | Imagen hero - demasiado pesada |
| facade-night.jpg | 142KB | Pesada |
| room-simple.jpg | 116KB | Pesada |
| room-king.jpg | 27KB | Aceptable |
| pool.jpg | 27KB | Aceptable |
| palapa.jpg | 48KB | Aceptable |
| logo.jpg | 22KB | Debe ser SVG/PNG |

**✅ Bien:** todas tienen atributo `alt`, todas accesibles (HTTP 200)  
**❌ Mal:** JPEG sin WebP, sin srcset, sin lazy loading, sin Image Sitemap, logo en JPEG

**Problema de conversión:** La imagen hero (fachada frontal) no vende la experiencia de Bacalar. Una foto de la alberca o de la Laguna de los 7 Colores transformaría el deseo de reservar.

---

## Screenshots

| Viewport | ATF | Página completa |
|----------|-----|-----------------|
| Desktop (1920px) | screenshots/desktop_atf.png | screenshots/desktop_full.png |
| Laptop (1440px) | screenshots/laptop_atf.png | screenshots/laptop_full.png |
| Tablet (768px) | screenshots/tablet_atf.png | screenshots/tablet_full.png |
| Móvil (375px) | screenshots/mobile_atf.png | screenshots/mobile_full.png |

**Observaciones visuales clave:**
- ATF desktop sólido: H1, precio $600/noche y CTA naranja visibles sin scroll
- Móvil: doble CTA WhatsApp en ATF — buena decisión de conversión
- Rating 7.2/10 expuesto justo bajo los CTAs — genera fricción antes de la reserva
- Layout mobile apilado correctamente, sin scroll horizontal

---

## Archivos de hallazgos por especialidad

| Archivo | Especialidad | Score |
|---------|-------------|-------|
| `findings/technical.md` | Technical SEO | 34/100 |
| `findings/content.md` | Content / E-E-A-T | 47/100 |
| `findings/schema.md` | Schema Markup | 42/100 |
| `findings/sitemap.md` | Sitemap + robots.txt | — |
| `findings/performance.md` | Core Web Vitals | 65/100 |
| `findings/visual.md` | Visual / Mobile | — |
| `findings/geo.md` | GEO / AI Search | 52/100 |
| `findings/local.md` | Local SEO | 33/100 |
| `findings/sxo.md` | SXO | 41/100 |

---

*Auditoría generada el 22 de junio 2026 sobre versión provisional en Vercel.*  
*Todos los scores deben re-evaluarse tras migrar al dominio definitivo `hoteljirehbacalar.com`.*
