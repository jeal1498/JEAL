# GEO / AI Search Readiness — Hotel Jireh Bacalar
**URL auditada:** https://hotel-jireh.vercel.app/
**Fecha de auditoría:** 2026-06-22
**Auditor:** GEO Specialist (Claude Sonnet 4.6)

---

## GEO Health Score: 52 / 100

| Dimension | Peso | Puntuacion | Aporte |
|---|---|---|---|
| Citability | 25% | 60 / 100 | 15.0 pts |
| Structural Readability | 20% | 82 / 100 | 16.4 pts |
| Multi-Modal Content | 15% | 42 / 100 | 6.3 pts |
| Authority & Brand Signals | 20% | 38 / 100 | 7.6 pts |
| Technical Accessibility | 20% | 32 / 100 | 6.4 pts |
| **TOTAL** | 100% | | **51.7 / 100** |

**Lectura:** El sitio tiene una base tecnica HTML solida y un schema correcto, pero tres problemas criticos bloquean la visibilidad en motores generativos: el canonical apunta a un dominio inexistente, no existen robots.txt ni llms.txt, y ningun pasaje de texto alcanza la longitud optima de citacion (134-167 palabras).

---

## AI Crawler Access Status

| Crawler | Robots.txt encontrado | Acceso permitido | Notas |
|---|---|---|---|
| GPTBot (OpenAI) | NO (404) | Sin reglas — permisivo por defecto | Sin guia explícita |
| OAI-SearchBot (OpenAI) | NO (404) | Sin reglas — permisivo por defecto | Sin guia explícita |
| ClaudeBot (Anthropic) | NO (404) | Sin reglas — permisivo por defecto | Sin guia explícita |
| PerplexityBot | NO (404) | Sin reglas — permisivo por defecto | Sin guia explícita |
| CCBot (Common Crawl) | NO (404) | Sin reglas — permisivo por defecto | Sin guia explícita |

**Resultado:** La ausencia de robots.txt no bloquea el acceso, pero si el proyecto escala o cambia de dominio, cualquier error de configuracion podria bloquear todos los crawlers sin advertencia. Es mejor declarar los permisos explicitamente.

---

## llms.txt Status

**Estado: AUSENTE (404)**

No existe `/llms.txt` en el dominio. Este archivo, especificado por el estandar emergente de Anthropic/comunidad, permite comunicar a los LLMs el proposito del sitio, la estructura de contenido autorizado y restricciones de uso.

**Impacto:** Perplexity, Claude y modelos que lo soporten no reciben orientacion sobre como agregar o citar el contenido. La ausencia no penaliza directamente el rastreo, pero si elimina una ventaja diferencial frente a competidores que lo implementen.

**RSL 1.0 / licencia de contenido:** No declarada en ningun encabezado HTTP ni meta tag.

---

## Citability Analysis

### Longitud de pasajes (objetivo: 134-167 palabras)

Todos los pasajes extraibles del HTML estan muy por debajo del rango optimo:

| Pasaje | Palabras | En rango? |
|---|---|---|
| Parrafo lead del hero | 31 | NO — muy corto |
| Intro seccion servicios | 17 | NO — muy corto |
| Intro seccion ubicacion | 32 | NO — muy corto |
| FAQ HTML: ubicacion | 22 | NO — muy corto |
| FAQ HTML: precios | 25 | NO — muy corto |
| FAQ HTML: servicios | 27 | NO — muy corto |
| FAQ HTML: distancias | 25 | NO — muy corto |
| FAQ HTML: reservas | 21 | NO — muy corto |
| FAQ HTML: check-in | 24 | NO — muy corto |
| FAQ Schema: precios (mas largo) | 38 | NO — muy corto |

**Ninguno de los 14 pasajes analizados supera las 40 palabras.** El rango optimo de citacion (134-167) esta a 3-4x la longitud actual de las respuestas FAQ. Los LLMs pueden citar fragmentos muy cortos, pero la probabilidad de inclusion en respuestas generadas aumenta significativamente con pasajes auto-contenidos y explicativos de mayor longitud.

### Senales positivas de citabilidad

- H3 como preguntas literales en la seccion FAQ: cumple el patron pregunta-respuesta que prefieren los motores generativos.
- Respuestas FAQ en schema (application/ld+json) duplican las respuestas HTML: el motor puede extraer el dato desde el JSON-LD sin procesar el DOM.
- Datos facticos exactos: precios en MXN, distancias en km/minutos, telefono, horarios de check-in/out, coordenadas geograficas.
- Los bloques son auto-contenidos: cada FAQ tiene sentido sin leer el resto de la pagina.
- Primer parrafo del hero entrega el dato clave (precio, ubicacion, servicios) en las primeras 31 palabras — eficiente, pero necesita expansion para maximizar citacion.

### Senales negativas de citabilidad

- Ningun parrafo descriptivo supera 40 palabras: los motores generativos tienen poco texto para formar respuestas ricas.
- No hay estadisticas con fuente atribuida (el AggregateRating 7.2/142 resenas esta en schema pero no se explica de donde proviene la fuente).
- No hay fecha de publicacion ni de actualizacion de precios: los LLMs penalizan contenido sin timestamp cuando compiten por citar datos de precios.
- No hay contenido tipo "guia" o "como llegar" que genere pasajes de longitud citacion optima.

---

## Structural Readability

**Puntuacion: 82 / 100 — Nivel bueno**

### Lo que funciona bien

- `<html lang="es-MX">`: correcto, indica idioma y localidad.
- HTML estatico (SSR): el contenido completo esta en el HTML inicial, sin dependencia de JavaScript para renderizar texto. Los crawlers de AI obtienen el contenido en la primera solicitud HTTP.
- Jerarquia de headings limpia: H1 unico y descriptivo ("Hospedaje familiar, sencillo y a tu alcance en Bacalar"), seis H2 de seccion, H3 para FAQ y amenidades.
- Elementos semanticos: `<main>`, `<header>`, `<footer>`, `<nav>`, `<section>` — estructura predecible para parsers.
- Skip link y `aria-label` en nav: accesibilidad cuidada, sena que el codigo fue escrito con atencion al detalle.
- `<meta name="description">` completo y con precios: Google lo puede usar en snippets.

### Oportunidades de mejora

- Las secciones de amenidades usan emojis como "iconos" (`🏊`, `❄️`): no generan problema de parseo pero tampoco aportan estructura semantica.
- El mapa de ubicacion no existe: la seccion de ubicacion es solo texto y lista, sin `<iframe>` de Google Maps ni coordenadas visibles en HTML (solo en schema). Limita la riqueza de la respuesta de AI para consultas de tipo "como llegar a".
- No hay `<time datetime="">` en ninguna parte del documento.

---

## Multi-Modal Content

**Puntuacion: 42 / 100 — Nivel debil**

| Elemento | Estado | Impacto GEO |
|---|---|---|
| Imagenes con alt text descriptivo | SI (9 imagenes, todos con alt especifico) | Positivo |
| Video embebido (YouTube) | NO | Perdida critica: correlacion YouTube ~0.737 |
| Mapa interactivo / embed | NO | Perdida moderada |
| Tabla de comparacion de habitaciones | NO | Oportunidad de estructura parseable |
| Infografia o datos visuales | NO | Oportunidad |
| Galeria de fotos | SI (5 fotos) | Positivo menor |

La ausencia de video de YouTube es la mayor oportunidad perdida en esta dimension. La correlacion de menciones de YouTube con citaciones de AI es la mas alta documentada (~0.737). Un recorrido virtual del hotel o un video de "como llegar" publicado en YouTube, embebido en la pagina y con el nombre del hotel en el titulo, aumentaria el perfil de entidad de "Hotel Jireh Bacalar" de forma measurable.

---

## Authority & Brand Signals

**Puntuacion: 38 / 100 — Nivel debil**

### Presencia de entidad en plataformas de alta correlacion con citacion AI

| Plataforma | Estado | Correlacion con citacion AI |
|---|---|---|
| Wikipedia (entidad propia o mencion) | No detectada | Alta |
| YouTube (canal o videos del hotel) | No detectado | ~0.737 (la mas fuerte) |
| Reddit (menciones organicas) | No verificable desde el sitio | Alta |
| Facebook | SI — enlazado desde footer y schema | Moderada |
| LinkedIn | No detectado | Moderada |
| Google Business Profile | No enlazado desde el sitio | Alta (local SEO) |
| Booking.com / TripAdvisor / Expedia | No enlazados ni mencionados | Alta (fuente de resenas) |

### Senales de autoridad en el contenido

- AggregateRating 7.2/10 de 142 resenas: declarado en schema, pero la **fuente no se indica ni en schema ni en el HTML visible**. Los LLMs y Google necesitan saber si es Booking, TripAdvisor, Google, u otra plataforma para darle credibilidad. Sin attribution, la resena es tecnicamente invalida para Google Rich Results.
- No hay nombre de autor ni equipo propietario mencionado en el contenido.
- No hay fecha de "ultima actualizacion de tarifas" ni año de apertura del hotel.
- starRating: 2 estrellas declarado — correcto y honesto, pero sin vinculo a una certificacion oficial de Sectur u organismo turístico mexicano.
- Facebook es la unica plataforma externa enlazada y verificable.

### Recomendacion critica de entidad

El nombre "Hotel Jireh Bacalar" no aparece como entidad verificable en Wikipedia ni en Wikidata. Para hoteles de nicho local esto es normal, pero la consistencia del NAP (Name-Address-Phone) entre el sitio web, Google Business Profile, Facebook y plataformas de reservas es el sustituto funcional. Actualmente solo Facebook y el sitio son verificables — GBP no esta vinculado.

---

## Technical Accessibility for AI Crawlers

**Puntuacion: 32 / 100 — Nivel critico**

### Problema 1 (CRITICO): Canonical a dominio inexistente

```html
<link rel="canonical" href="https://www.hoteljirehbacalar.com/">
```

El dominio `hoteljirehbacalar.com` no existe o no esta activo. Esto le dice a Google (y a cualquier motor que respete canonicals) que la pagina "real" esta en otro lugar que no responde. Efecto: Google puede **deindexar** o ignorar el contenido de `hotel-jireh.vercel.app` porque la canonical lo apunta a una pagina muerta.

**Impacto en AI Overviews:** Directo. Si Google no indexa la URL correctamente por el canonical roto, el contenido no entra al corpus de AIO.

**Solucion:** Cambiar canonical a `https://hotel-jireh.vercel.app/` de forma inmediata, o bien activar el dominio `hoteljirehbacalar.com` y apuntar el DNS correctamente.

### Problema 2 (CRITICO): OG image a dominio inexistente

```html
<meta property="og:image" content="https://www.hoteljirehbacalar.com/images/facade-day.jpg">
```

La imagen no carga. Cuando Perplexity, ChatGPT o cualquier parser extrae la pagina para construir una vista previa, la imagen social es un enlace roto. Afecta la confianza del crawler y la riqueza del snippet en plataformas sociales y de AI.

### Problema 3 (CRITICO): Schema url y og:url a dominio muerto

```json
"url": "https://www.hoteljirehbacalar.com/"
```

El campo `url` del schema Hotel y los meta OG apuntan al dominio sin activar. Google valida que la URL declarada en schema coincida con la URL canonica e indexada. Este desacuerdo puede hacer que el schema sea ignorado completamente.

### Problema 4 (ALTO): Ausencia de robots.txt

HTTP 404 en `/robots.txt`. Los crawlers de AI (GPTBot, ClaudeBot, PerplexityBot) reciben un error 404 en lugar de un archivo permisivo. Aunque la mayoria de los crawlers interpretan la ausencia como "permitido", genera una solicitud de error en los logs y puede confundir implementaciones estrictas.

**Solucion minima:**
```
User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: OAI-SearchBot
Allow: /
```

### Problema 5 (MEDIO): Ausencia de llms.txt

HTTP 404 en `/llms.txt`. No hay declaracion de proposito, estructura ni permisos para LLMs.

### Problema 6 (MEDIO): Sitio en subdominio vercel.app sin dominio propio

El subdominio `vercel.app` tiene menor autoridad de dominio percibida que un dominio propio. Los sistemas de ranking de fuentes de los LLMs correlacionan fuertemente con Domain Rating y trust signals. Un dominio propio como `hoteljirehbacalar.com` o `hoteljireh.mx` activo y con DNS correcto mejoraria el trust score.

### Lo que funciona

- HTML estatico: sin JavaScript necesario para renderizar contenido. Los crawlers ven el mismo HTML que un navegador — ventaja significativa frente a sitios SPA/React.
- Sin `<meta name="robots" content="noindex">`: la pagina esta indexable.
- Sin bloqueos de IP conocidos en Vercel para crawlers principales.

---

## Platform-Specific Scores

| Plataforma | Score | Razon principal |
|---|---|---|
| Google AI Overviews | 44 / 100 | Canonical roto es el bloqueador principal; schema y FAQ ayudan pero pueden ser ignorados si la URL no esta bien indexada |
| ChatGPT / Bing Copilot | 35 / 100 | Sin robots.txt, sin llms.txt, sin senales de brand (YouTube, Wikipedia); subdominio vercel.app con bajo trust percibido |
| Perplexity | 48 / 100 | Accede a HTML directamente; el HTML estatico y el FAQPage schema son ventajas reales; canonical roto es menor impacto aqui |
| Gemini | 42 / 100 | Comparte corpus con Google; mismos problemas de canonical; schema Hotel bien formado ayuda al Knowledge Graph |

---

## Top 5 Cambios de Mayor Impacto

### Prioridad 1 — Corregir canonical, og:url, og:image y schema url (IMPACTO CRITICO / ESFUERZO BAJO)

**Estimado:** 30 minutos de desarrollo.

Cambiar todas las referencias de `https://www.hoteljirehbacalar.com/` por `https://hotel-jireh.vercel.app/` (o por el dominio propio una vez activado) en:
- `<link rel="canonical">`
- `<meta property="og:url">`
- `<meta property="og:image">` — cambiar a `https://hotel-jireh.vercel.app/images/facade-day.jpg`
- Schema Hotel: campo `"url"`
- Meta `twitter:image` si se agrega

Este es el cambio de mayor ROI de todo el sitio. Mientras el canonical apunte a un dominio muerto, todos los demas esfuerzos GEO tienen rendimiento reducido.

### Prioridad 2 — Crear robots.txt y llms.txt (IMPACTO ALTO / ESFUERZO MUY BAJO)

**Estimado:** 15 minutos.

Crear `/robots.txt` con permisos explícitos para todos los crawlers AI relevantes (ver ejemplo en la seccion tecnica arriba).

Crear `/llms.txt` con estructura minima:
```
# Hotel Jireh Bacalar
> Hotel familiar economico en Bacalar, Quintana Roo, Mexico.
> Habitaciones desde $600 MXN/noche. Reservas por WhatsApp al +529831019716.

## Informacion del hotel
- Direccion: Avenida 19, entre Calle 22 y 24, Bacalar, QR 77930
- Telefono: +529831019716
- Email: hoteljireh.bacalar@gmail.com
- Precios: Sencilla $600, King $850, Familiar $950 MXN por noche
- Check-in: 13:30 | Check-out: 12:00
- Servicios: alberca, A/C, wifi gratuito, estacionamiento gratuito, recepcion 24h
```

### Prioridad 3 — Expandir respuestas FAQ a 80-150 palabras cada una (IMPACTO ALTO / ESFUERZO MEDIO)

**Estimado:** 2-3 horas de redaccion.

Actualmente todas las respuestas FAQ tienen entre 20 y 38 palabras. Para alcanzar el rango de citacion optima (134-167 palabras a nivel de pasaje completo incluyendo pregunta + contexto), las respuestas del HTML deben expandirse con:
- Contexto util: "La Laguna de Bacalar, conocida como la Laguna de los 7 Colores, esta a..."
- Informacion actionable: instrucciones de llegada, alternativas de transporte
- Datos comparativos: por que $600 es accesible vs. la media de hospedaje en Bacalar

Ejemplo de expansion para la FAQ de precios (actualmente 25 palabras):

> "El Hotel Jireh ofrece tres tipos de habitacion con precios fijos por noche en pesos mexicanos. La habitacion Sencilla incluye una cama matrimonial con capacidad para dos personas y cuesta $600 MXN por noche. La habitacion King Size, mas amplia, con cama king size, cuesta $850 MXN por noche. La habitacion Familiar, disenada para grupos y familias, incluye dos camas king size mas una cama matrimonial con capacidad para hasta 6 personas y cuesta $950 MXN por noche. Todos los tipos de habitacion incluyen aire acondicionado, ventilador, agua fria y caliente, TV por cable y acceso al estacionamiento privado gratuito. No se cobra cargo adicional por el wifi ni por el uso de la alberca. Para confirmar disponibilidad y reservar, comunicate por WhatsApp al 983 101 9716."

Esa expansion pasa de 25 a ~130 palabras y es completamente auto-contenida para citacion.

Ambas versiones (HTML visible y schema JSON-LD) deben actualizarse en paralelo.

### Prioridad 4 — Vincular y verificar Google Business Profile + attribution de resenas (IMPACTO ALTO / ESFUERZO MEDIO)

**Estimado:** 1 dia (incluyendo verificacion de GBP).

- Verificar o crear el perfil de Google Business Profile para "Hotel Jireh Bacalar". GBP es la fuente que Google AI Overviews consulta para responder preguntas locales tipo "hoteles economicos en Bacalar".
- En el schema, anadir `"sameAs"` con las URLs de GBP, Facebook y cualquier perfil de Booking/TripAdvisor:
  ```json
  "sameAs": [
    "https://www.facebook.com/hoteljireh.bacalar/",
    "https://maps.google.com/?cid=XXXX"
  ]
  ```
- Corregir la attribution de `aggregateRating`: anadir `"ratingExplanation"` o al menos mencionar en el HTML visible de donde provienen las 142 resenas (Booking, Google, TripAdvisor). Sin attribution, Google puede ignorar este dato en rich results.

### Prioridad 5 — Publicar video en YouTube y embeber en la pagina (IMPACTO MEDIO-ALTO / ESFUERZO MEDIO)

**Estimado:** 1-2 dias (grabar, editar, publicar, embeber).

La correlacion de menciones de YouTube con citaciones de AI es la mas documentada (~0.737). Un video corto (60-90 segundos) con el titulo "Hotel Jireh Bacalar - Hotel familiar economico cerca de la Laguna de los 7 Colores" publicado en YouTube y embebido con `<iframe>` en la seccion de galeria o ubicacion cumple dos funciones:
1. Crea una entidad de "Hotel Jireh Bacalar" en YouTube que los LLMs pueden cruzar con el sitio web.
2. Aumenta el tiempo en pagina y la riqueza multi-modal que los crawlers valoran.

El video debe incluir el nombre del hotel, ciudad, precios y datos de contacto hablados y en pantalla para reforzar la entidad.

---

## Resumen Ejecutivo

El Hotel Jireh Bacalar tiene una base GEO sorprendentemente solida para un hotel familiar pequeno: HTML estatico completamente renderizado, schema de Hotel y FAQPage bien estructurado, datos facticos verificables (precios exactos, coordenadas, distancias, horarios) y una jerarquia de headings limpia. Estos elementos colocan al sitio por encima del promedio de competidores locales que dependen de sitios generados por plataformas (Booking, Tripadvisor) sin pagina propia.

Sin embargo, tres problemas tecnicos bloquean la conversion de esa base en visibilidad real en motores generativos:

1. El canonical apunta a un dominio muerto — Google puede estar ignorando la pagina completa.
2. No existe robots.txt ni llms.txt — los crawlers de AI trabajan sin guia.
3. Ningun pasaje de texto tiene la longitud suficiente para entrar en el rango optimo de citacion de LLMs.

Los puntos 1 y 2 se resuelven en menos de una hora de trabajo. El punto 3 requiere redaccion, pero el esqueleto (preguntas FAQ como H3, estructura Q/A en schema) ya esta listo — solo falta expandir las respuestas.

Con las prioridades 1-3 implementadas, la estimacion de score GEO sube de 52 a aproximadamente 68-72 sobre 100.

---

*Auditoria realizada el 2026-06-22. Fuente HTML analizada: `/home/user/JEAL/hotel-jireh/index.html` (version local del sitio en `https://hotel-jireh.vercel.app/`). robots.txt y llms.txt confirmados como 404 contra el servidor en produccion.*
