# Technical SEO Audit — Hotel Jireh Bacalar
**URL auditada:** https://hotel-jireh.vercel.app/  
**Fecha:** 2026-06-22  
**Puntuacion tecnica:** 34 / 100

---

## Resumen ejecutivo

El sitio es una pagina estatica HTML single-page alojada en Vercel. Los problemas criticos dominan el perfil: el canonical apunta a un dominio que no existe ni responde, no hay robots.txt ni sitemap.xml, y los recursos sociales (OG image) apuntan igualmente al dominio fantasma. Estos tres factores solos son suficientes para impedir la indexacion correcta y cualquier aparicion enriquecida en resultados de busqueda.

---

## Hallazgos por severidad

### CRITICAL

---

#### C-1: Canonical apunta a un dominio inexistente

**Evidencia:**  
```html
<link rel="canonical" href="https://www.hoteljirehbacalar.com/" />
```
El dominio `hoteljirehbacalar.com` devuelve error / no responde. El sitio real esta en `https://hotel-jireh.vercel.app/`.

**Impacto:**  
Google trata el canonical como una declaracion de "el contenido original esta aqui". Al apuntar a un dominio muerto, Google puede desindexar `hotel-jireh.vercel.app` por considerar que no es la URL autoritativa, o simplemente ignorar el canonical y generar senales de canonicalizacion inconsistentes. Es el problema mas grave del sitio.

**Recomendacion:**  
Opcion A (ideal): registrar y poner en produccion `hoteljirehbacalar.com`, redirigir 301 desde ahi a ese dominio o viceversa, y alinear el canonical con la URL que sirve trafico real.  
Opcion B (urgente mientras tanto): cambiar el canonical para que apunte a si mismo:
```html
<link rel="canonical" href="https://hotel-jireh.vercel.app/" />
```

---

#### C-2: robots.txt ausente (404)

**Evidencia:**  
`GET https://hotel-jireh.vercel.app/robots.txt` → 404 Not Found

**Impacto:**  
Sin robots.txt, los crawlers no tienen instrucciones sobre que rastrear ni como. No es un bloqueo directo, pero la ausencia del archivo es una senal de abandono tecnico y puede confundir bots que esperan el archivo. Ademas impide declarar la ubicacion del sitemap.

**Recomendacion:**  
Crear `/public/robots.txt` con contenido minimo:
```
User-agent: *
Allow: /

Sitemap: https://hotel-jireh.vercel.app/sitemap.xml
```
Si el dominio definitivo es `hoteljirehbacalar.com`, ajustar la URL del sitemap cuando ese dominio este activo.

---

#### C-3: sitemap.xml ausente (404)

**Evidencia:**  
`GET https://hotel-jireh.vercel.app/sitemap.xml` → 404 Not Found

**Impacto:**  
Google y Bing no tienen un punto de descubrimiento declarado. Para un sitio de una sola pagina el impacto es menor en cantidad de URLs, pero el sitemap tambien comunica la frecuencia de actualizacion y la ultima modificacion, lo cual es relevante para un negocio de hospedaje con precios o disponibilidad cambiantes.

**Recomendacion:**  
Crear `/public/sitemap.xml`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://hotel-jireh.vercel.app/</loc>
    <lastmod>2026-06-22</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```
Enviar el sitemap a Google Search Console y Bing Webmaster Tools.

---

#### C-4: OG image apunta al dominio muerto

**Evidencia:**  
```html
<meta property="og:image" content="https://www.hoteljirehbacalar.com/images/facade-day.jpg" />
```

**Impacto:**  
Cuando el enlace se comparte en WhatsApp, Facebook o iMessage, la imagen de previsualizacion esta rota. Para un negocio hotelero que depende de recomendaciones sociales, esto destruye la credibilidad del enlace compartido.

**Recomendacion:**  
Alojar la imagen en Vercel (dentro del propio repositorio o en un CDN como Cloudinary) y actualizar la meta tag:
```html
<meta property="og:image" content="https://hotel-jireh.vercel.app/images/facade-day.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Fachada del Hotel Jireh Bacalar" />
```
Dimensiones recomendadas para OG image: 1200x630 px.

---

### HIGH

---

#### H-1: Title tag demasiado largo (82 caracteres)

**Evidencia:**  
```
Hotel Jireh Bacalar | Hotel Familiar Económico cerca de la Laguna de los 7 Colores
```
82 caracteres. Google trunca a ~60-70 caracteres en SERPs.

**Impacto:**  
La parte truncada "cerca de la Laguna de los 7 Colores" es el principal diferenciador de ubicacion y no se mostrara en la mayoria de los resultados moviles.

**Recomendacion:**  
Acortar manteniendo las palabras clave principales:
```
Hotel Jireh Bacalar | Familiar y Económico en la Laguna
```
(56 caracteres) o:
```
Hotel Familiar Económico en Bacalar | Hotel Jireh
```
(50 caracteres)

---

#### H-2: Meta description demasiado larga (240 caracteres)

**Evidencia:**  
La meta description supera los 160 caracteres recomendados. Google la truncara automaticamente en SERPs.

**Impacto:**  
El call-to-action y los datos de contacto que aparecen al final de la descripcion seran cortados antes de que el usuario los vea.

**Recomendacion:**  
Reescribir entre 140-155 caracteres, priorizando el beneficio principal y un CTA claro:
```
Hospedaje familiar en Bacalar con alberca, AC y WiFi. A minutos de la Laguna de los 7 Colores. Reserva directa por WhatsApp. Precios economicos.
```
(148 caracteres)

---

#### H-3: Meta keywords con riesgo de keyword stuffing

**Evidencia:**  
```html
<meta name="keywords" content="hotel en Bacalar, hospedaje Bacalar económico, hotel familiar Bacalar..." />
```

**Impacto:**  
Google ignora el meta keywords desde 2009. Bing lo usa como senal negativa si detecta stuffing. El tag no aporta valor y puede generar riesgo con Bing.

**Recomendacion:**  
Eliminar completamente el tag `<meta name="keywords">`.

---

#### H-4: Cabeceras de seguridad HTTP faltantes

**Evidencia:**  
Presentes: `Strict-Transport-Security` (HSTS correcto).  
Ausentes:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY` (o `SAMEORIGIN`)
- `Content-Security-Policy`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`
- `X-XSS-Protection: 0` (deprecado pero esperado)

**Impacto:**  
Ausencia de X-Content-Type-Options y X-Frame-Options son las mas criticas desde el punto de vista de seguridad. CSP previene ataques XSS. Estos headers tambien son evaluados por herramientas como Google Lighthouse (afecta la puntuacion de Best Practices) y securityheaders.com, ambos consultados frecuentemente en auditorias de clientes.

**Recomendacion:**  
En Vercel, agregar en `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://wa.me https://api.whatsapp.com"
        }
      ]
    }
  ]
}
```

---

#### H-5: Cache-Control no optimizado para assets estaticos

**Evidencia:**  
`Cache-Control: public, max-age=0, must-revalidate`

**Impacto:**  
`max-age=0` obliga al navegador a revalidar cada recurso en cada visita. Para un sitio estatico que no cambia frecuentemente, esto genera latencia innecesaria y puede impactar LCP en visitas recurrentes.

**Recomendacion:**  
En `vercel.json`, establecer cache largo para assets con hash en el nombre (CSS, JS, imagenes):
```json
{
  "source": "/images/(.*)",
  "headers": [
    { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
  ]
}
```
Y para el HTML:
```json
{
  "source": "/",
  "headers": [
    { "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" }
  ]
}
```

---

### MEDIUM

---

#### M-1: Ausencia de datos estructurados (Schema.org)

**Evidencia:**  
No se detecta ningun bloque `<script type="application/ld+json">` ni atributos `itemscope`/`itemtype` en el HTML.

**Impacto:**  
Google puede mostrar rich results para hoteles (nombre, precio, valoraciones, disponibilidad). Sin schema, el sitio compite en SERPs unicamente con texto plano frente a competidores que tienen resultados enriquecidos.

**Recomendacion:**  
Implementar al menos `Hotel` + `LodgingBusiness` con `LocalBusiness`:
```json
{
  "@context": "https://schema.org",
  "@type": ["Hotel", "LodgingBusiness"],
  "name": "Hotel Jireh Bacalar",
  "description": "Hospedaje familiar económico cerca de la Laguna de los 7 Colores en Bacalar, Quintana Roo.",
  "url": "https://hotel-jireh.vercel.app/",
  "telephone": "+52-XXXXXXXXXX",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "[direccion]",
    "addressLocality": "Bacalar",
    "addressRegion": "Quintana Roo",
    "postalCode": "[CP]",
    "addressCountry": "MX"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "[lat]",
    "longitude": "[lon]"
  },
  "priceRange": "$$",
  "amenityFeature": [
    {"@type": "LocationFeatureSpecification", "name": "Alberca", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Aire acondicionado", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "WiFi", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Estacionamiento", "value": true}
  ]
}
```
Adicionalmente, implementar `FAQPage` schema para los 6 FAQs ya presentes en la pagina.

---

#### M-2: Ausencia de enlace a Google Maps

**Evidencia:**  
Los 7 enlaces del sitio son: 6 a WhatsApp y 1 a Facebook. No hay enlace a Google Maps ni coordenadas georreferenciadas.

**Impacto:**  
Para un hotel, la ubicacion es un factor de decision primario. La ausencia de un enlace a Maps aumenta la friccion del usuario y reduce las senales de relevancia local para Google.

**Recomendacion:**  
Agregar en la seccion de contacto/reservas:
```html
<a href="https://maps.google.com/?q=[lat],[lon]" target="_blank" rel="noopener">
  Ver en Google Maps
</a>
```
Si el hotel tiene ficha en Google Business Profile, enlazar directamente a la ficha.

---

#### M-3: og:url apunta al dominio muerto

**Evidencia:**  
(Derivado de C-1) Si existe un tag `<meta property="og:url">` apuntando a `hoteljirehbacalar.com`, o si ese dominio es el canonico declarado, los scrapers de Facebook/Twitter/LinkedIn tomaran esa URL como la URL a asociar al contenido compartido.

**Recomendacion:**  
Verificar y corregir:
```html
<meta property="og:url" content="https://hotel-jireh.vercel.app/" />
```

---

#### M-4: Sin IndexNow implementado

**Evidencia:**  
No se detecta ningun archivo de verificacion de IndexNow (`[api-key].txt` en la raiz) ni llamadas al endpoint `https://api.indexnow.org/indexnow`.

**Impacto:**  
IndexNow permite notificar instantaneamente a Bing, Yandex y Naver cuando el contenido cambia, acelerando la reindexacion. Para un sitio en Vercel que puede actualizarse frecuentemente, esto reduce el tiempo entre deploy y aparicion en SERPs de Bing.

**Recomendacion:**  
1. Generar una API key (string aleatorio de 32-128 caracteres hexadecimales).
2. Crear `/public/[api-key].txt` con el mismo valor.
3. Hacer una solicitud GET o POST a:
   ```
   https://api.indexnow.org/indexnow?url=https://hotel-jireh.vercel.app/&key=[api-key]
   ```
4. Automatizar este llamado en el pipeline de CI/CD de Vercel post-deploy.

---

#### M-5: Sitio single-page sin URLs independientes por habitacion

**Evidencia:**  
El sitio usa anclas (`#habitaciones`, `#galeria`) en lugar de URLs propias para cada tipo de habitacion.

**Impacto:**  
Google puede indexar anclas de pagina pero no las trata como URLs canonicas independientes. Las busquedas de alta intencion como "habitacion familiar Bacalar precio" o "cuarto king size Bacalar" no encontraran una URL dedicada que pueda posicionarse.

**Recomendacion:**  
A mediano plazo, considerar crear paginas independientes para cada tipo de habitacion (`/habitacion-sencilla/`, `/habitacion-king-size/`, `/habitacion-familiar/`) con contenido dedicado, precios, galeria y schema `HotelRoom`.

---

### LOW

---

#### L-1: Ausencia de breadcrumbs

**Evidencia:**  
Single-page sin estructura de navegacion jerarquica.

**Impacto:**  
Menor en un sitio de una pagina. Sin embargo, si en el futuro se crean subpaginas, la ausencia de breadcrumbs dificultara el entendimiento de la arquitectura por parte de Google.

**Recomendacion:**  
No aplicable en la estructura actual. Implementar cuando se creen subpaginas.

---

#### L-2: WhatsApp enlazado 6 veces con el mismo anchor text

**Evidencia:**  
6 enlaces a `https://wa.me/[numero]` con texto similar ("Reservar por WhatsApp", "Contactar", etc.).

**Impacto:**  
Senales de enlace internas diluidas. No es un problema grave en sitios de una pagina, pero desde el punto de vista de la experiencia de usuario, podria simplificarse a un boton flotante + un enlace en la seccion de reservas.

**Recomendacion:**  
Consolidar a maximo 2 puntos de contacto WhatsApp: uno en el header/hero y uno en la seccion de reservas. Agregar `rel="noopener noreferrer"` si no esta presente.

---

#### L-3: Ausencia de link a hoteljirehbacalar.com

**Evidencia:**  
El dominio canonico declarado es `hoteljirehbacalar.com` pero el sitio no enlaza a el en ninguna parte.

**Nota:** Esto es derivado del problema C-1. Una vez que ese dominio este activo, el flujo correcto es que ese dominio sirva el contenido (o redirija 301), no que aparezca solo en el canonical.

---

## Tabla resumen de categorias

| Categoria | Estado | Puntuacion |
|---|---|---|
| Crawlabilidad (robots.txt, sitemap) | FALLA | 0/15 |
| Indexabilidad (canonical, duplicados) | FALLA CRITICA | 0/20 |
| Seguridad (HTTPS, headers) | PARCIAL | 8/15 |
| Estructura de URL | ACEPTABLE | 8/10 |
| Mobile (viewport, lang) | PASA | 8/10 |
| Core Web Vitals (potencial) | REVISAR | 5/10 |
| Datos estructurados | FALLA | 0/10 |
| JavaScript / Rendering | PASA (HTML estatico) | 5/5 |
| IndexNow | FALLA | 0/5 |
| **TOTAL** | | **34/100** |

---

## Core Web Vitals — evaluacion desde el codigo fuente

No se ejecuto un test de Lighthouse/CrUX en esta auditoria, pero se identifican los siguientes riesgos desde la inspeccion del HTML:

**LCP (Largest Contentful Paint):**  
- Si la imagen principal del hero (`facade-day.jpg`) esta alojada en el dominio muerto `hoteljirehbacalar.com`, el navegador intentara cargarla, fallara (timeout/error 404), y el LCP se disparara o quedara sin imagen. Riesgo ALTO mientras C-4 no se resuelva.  
- Si la imagen esta correctamente alojada en Vercel: verificar que tenga `loading="eager"` y `fetchpriority="high"` para la imagen LCP.

**INP (Interaction to Next Paint):**  
- Sitio HTML estatico sin frameworks pesados. Riesgo bajo en principio.  
- Verificar que no haya scripts de terceros (analytics, chat widgets) bloqueando el hilo principal.

**CLS (Cumulative Layout Shift):**  
- Verificar que las imagenes tengan atributos `width` y `height` declarados en el HTML para que el navegador reserve espacio antes de cargarlas.  
- Fuentes web sin `font-display: swap` pueden causar FOIT/FOUT que contribuye al CLS.

---

## JavaScript Rendering

**Veredicto: HTML estatico — sin requisitos de rendering del lado del cliente.**

El sitio es una pagina estatica en Vercel. El contenido critico (H1, meta tags, texto de habitaciones) esta presente en el HTML fuente sin dependencia de JavaScript. Googlebot puede indexar el contenido sin necesidad de renderizado. Sin observaciones adicionales en esta categoria.

---

## Prioridad de implementacion

| Prioridad | Tarea | Esfuerzo estimado |
|---|---|---|
| 1 (Critico) | Resolver dominio canonical (C-1): activar `hoteljirehbacalar.com` o cambiar canonical a URL de Vercel | 1-4 horas |
| 2 (Critico) | Corregir OG image a URL funcional (C-4) | 30 minutos |
| 3 (Critico) | Crear robots.txt (C-2) | 15 minutos |
| 4 (Critico) | Crear sitemap.xml (C-3) | 30 minutos |
| 5 (Alto) | Acortar title tag (H-1) | 15 minutos |
| 6 (Alto) | Acortar meta description (H-2) | 15 minutos |
| 7 (Alto) | Agregar headers de seguridad via vercel.json (H-4) | 1 hora |
| 8 (Alto) | Eliminar meta keywords (H-3) | 5 minutos |
| 9 (Medio) | Implementar schema Hotel + FAQPage (M-1) | 2-3 horas |
| 10 (Medio) | Agregar enlace a Google Maps (M-2) | 30 minutos |
| 11 (Medio) | Implementar IndexNow (M-4) | 1 hora |
