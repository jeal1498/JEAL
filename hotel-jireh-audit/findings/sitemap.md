# Sitemap Audit — Hotel Jireh Bacalar
**URL auditada:** https://hotel-jireh.vercel.app/  
**Fecha:** 2026-06-22  
**Auditor:** Sitemap Architecture Agent

---

## 1. Evaluacion de situacion actual

### Validation Report

| Check | Severidad | Estado | Detalle |
|-------|-----------|--------|---------|
| sitemap.xml existe | Critical | FAIL | 404 NOT FOUND |
| robots.txt existe | High | FAIL | 404 NOT FOUND |
| XML valido | N/A | N/A | No hay archivo que validar |
| URLs > 50,000 | N/A | PASS | Solo 1 URL indexable |
| Canonical coherente | Critical | FAIL | Apunta a hoteljirehbacalar.com (dominio inexistente) |
| priority / changefreq | Info | N/A | No aplica aun |
| Image sitemap | High | MISSING | 7 imagenes sin declarar |
| Location pages quality gate | N/A | PASS | No hay paginas de ubicacion programaticas |

### Diagnostico

El sitio es un HTML estatico de una sola pagina (SPA-like) alojado en Vercel. La ausencia de sitemap.xml y robots.txt no es catastrofica para un sitio de 1 URL, pero si tiene consecuencias reales:

**Problema 1 — Canonical roto (severidad critica)**  
La etiqueta `<link rel="canonical">` apunta a `https://www.hoteljirehbacalar.com/`, un dominio que no existe. Esto le dice a Google que la version "oficial" del contenido esta en otro lugar. Si Google respeta ese canonical, podria dejar de indexar `hotel-jireh.vercel.app` por completo, o indexar ninguno de los dos (el destino 404 invalida la señal). Este es el problema mas urgente de todo el sitio.

**Problema 2 — Sin sitemap.xml**  
Googlebot puede encontrar y rastrear la pagina directamente, pero sin sitemap no hay declaracion explicita de lastmod, lo que significa que Google no sabe con que frecuencia revisa el contenido. Para un hotel con precios y disponibilidad, esto importa.

**Problema 3 — Sin robots.txt**  
Sin robots.txt, Vercel devuelve 404 en esa ruta. Algunos crawlers tratan un 404 en robots.txt como "sin restricciones" (comportamiento correcto segun RFC), pero genera ruido en Search Console y puede confundir herramientas de auditoria de terceros.

**Problema 4 — Imagenes sin Image Sitemap**  
Las 7 imagenes del sitio (fachada, habitaciones, alberca, palapa, logo) son contenido de alta intencion de busqueda para un hotel. Sin Image Sitemap, Google Image Search tiene menos señales para indexarlas y asociarlas a busquedas de "hotel Bacalar" con contenido visual.

### Pages: Crawl vs Sitemap Coverage

| URL | En crawl | En sitemap | Estado |
|-----|----------|------------|--------|
| https://hotel-jireh.vercel.app/ | SI | NO | Missing from sitemap |

Anchor links (`/#habitaciones`, `/#galeria`, etc.) NO son URLs independientes para propositos de sitemap — son fragmentos de la misma pagina. No deben incluirse como entradas `<url>` separadas.

### Quality Gate — Location Pages

No aplica. El sitio tiene 1 sola pagina de ubicacion integrada como seccion (no como pagina independiente). No se activa ningun umbral de alerta.

---

## 2. Archivos propuestos

### 2a. sitemap.xml

El sitemap incluye la URL raiz y declara las 7 imagenes mediante el namespace de Image Sitemap de Google. `lastmod` usa la fecha de auditoria como aproximacion; debe actualizarse cada vez que se modifique contenido real.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

  <url>
    <loc>https://hotel-jireh.vercel.app/</loc>
    <lastmod>2026-06-22</lastmod>

    <image:image>
      <image:loc>https://hotel-jireh.vercel.app/facade-day.jpg</image:loc>
      <image:title>Hotel Jireh Bacalar — Fachada de dia</image:title>
      <image:caption>Vista exterior del Hotel Jireh en Bacalar, Quintana Roo, durante el dia</image:caption>
    </image:image>

    <image:image>
      <image:loc>https://hotel-jireh.vercel.app/facade-night.jpg</image:loc>
      <image:title>Hotel Jireh Bacalar — Fachada de noche</image:title>
      <image:caption>Vista exterior iluminada del Hotel Jireh en Bacalar, Quintana Roo</image:caption>
    </image:image>

    <image:image>
      <image:loc>https://hotel-jireh.vercel.app/room-simple.jpg</image:loc>
      <image:title>Habitacion Sencilla — Hotel Jireh Bacalar</image:title>
      <image:caption>Habitacion sencilla con cama individual, A/C y wifi. Precio desde $600 MXN por noche</image:caption>
    </image:image>

    <image:image>
      <image:loc>https://hotel-jireh.vercel.app/room-king.jpg</image:loc>
      <image:title>Habitacion King — Hotel Jireh Bacalar</image:title>
      <image:caption>Habitacion King size con cama matrimonial, A/C y wifi. Precio desde $850 MXN por noche</image:caption>
    </image:image>

    <image:image>
      <image:loc>https://hotel-jireh.vercel.app/pool.jpg</image:loc>
      <image:title>Alberca — Hotel Jireh Bacalar</image:title>
      <image:caption>Alberca exterior del Hotel Jireh en Bacalar, Quintana Roo</image:caption>
    </image:image>

    <image:image>
      <image:loc>https://hotel-jireh.vercel.app/palapa.jpg</image:loc>
      <image:title>Palapa — Hotel Jireh Bacalar</image:title>
      <image:caption>Area de palapa y descanso del Hotel Jireh en Bacalar</image:caption>
    </image:image>

    <image:image>
      <image:loc>https://hotel-jireh.vercel.app/logo.jpg</image:loc>
      <image:title>Logo Hotel Jireh Bacalar</image:title>
      <image:caption>Logotipo oficial del Hotel Jireh, ubicado en Av. 19 entre C22 y C24, Bacalar, Quintana Roo</image:caption>
    </image:image>

  </url>

</urlset>
```

**Notas sobre el sitemap:**
- Se omiten `priority` y `changefreq` — ambas etiquetas son ignoradas por Google desde hace anos y generan peso XML sin valor.
- Los anchor links (`/#habitaciones`, `/#galeria`, etc.) no se incluyen — son fragmentos, no paginas distintas.
- `lastmod` debe actualizarse manualmente (o via CI/CD) cuando cambie el contenido de la pagina.
- Cuando el dominio definitivo este activo, reemplazar todas las ocurrencias de `hotel-jireh.vercel.app` con ese dominio.

---

### 2b. robots.txt

```
User-agent: *
Allow: /

Sitemap: https://hotel-jireh.vercel.app/sitemap.xml
```

**Notas sobre robots.txt:**
- `Allow: /` explicito sobre un sitio sin restricciones es redundante pero mejora la legibilidad y evita ambiguedad con herramientas de auditoria.
- La directiva `Sitemap:` en robots.txt es una segunda via de descubrimiento — complementa (no reemplaza) el envio manual en Search Console.
- No se bloquea ningun directorio porque el sitio es estatico y no tiene areas privadas, panel de admin, ni staging paths en este dominio.

---

## 3. Correcciones urgentes (fuera del scope de sitemap pero criticas)

Estos dos problemas deben resolverse antes o en paralelo con el despliegue del sitemap, porque sin ellos el sitemap tiene impacto reducido:

**Accion 1 — Corregir el canonical (URGENTE)**  
En el `<head>` del index.html, cambiar:
```html
<!-- ANTES (ROTO) -->
<link rel="canonical" href="https://www.hoteljirehbacalar.com/">

<!-- DESPUES — si el dominio definitivo aun no existe, usar la URL actual -->
<link rel="canonical" href="https://hotel-jireh.vercel.app/">

<!-- DESPUES — cuando el dominio definitivo este activo -->
<link rel="canonical" href="https://www.hoteljirehbacalar.com/">
```

Si el dominio `hoteljirehbacalar.com` esta planificado pero no activo todavia, el canonical debe apuntar a la URL real que sirve contenido hoy.

**Accion 2 — Declarar el sitemap en Search Console**  
Una vez desplegado el sitemap.xml en Vercel, registrar la propiedad `hotel-jireh.vercel.app` en Google Search Console y enviar la URL del sitemap manualmente. Esto acelera la indexacion y da visibilidad sobre errores de rastreo.

---

## 4. Recomendaciones para estructura futura

Si el sitio crece — ya sea con paginas independientes de habitaciones, blog, reservaciones directas, o versiones en ingles — estas son las consideraciones de arquitectura de sitemap:

### Escenario A — Expansion moderada (2-20 URLs)

Un solo `sitemap.xml` sigue siendo suficiente. Agregar cada nueva URL como entrada `<url>` adicional. Ejemplos de paginas que tendrian valor SEO real como URLs independientes:

| URL propuesta | Justificacion |
|---------------|---------------|
| `/habitaciones/sencilla/` | Permite targeting de "habitacion sencilla Bacalar" |
| `/habitaciones/king/` | Permite targeting de "cuarto king Bacalar" |
| `/habitaciones/familiar/` | Permite targeting de "hotel familiar Bacalar" |
| `/galeria/` | Contenido visual indexable por Google Images |
| `/preguntas-frecuentes/` | FAQ schema + rich results |
| `/contacto/` | Local SEO + Google Business signals |

Cada una de estas paginas debe tener contenido sustancialmente unico (minimo 300 palabras + fotos propias) para no crear thin content.

### Escenario B — Blog o contenido editorial (20-200 URLs)

Mantener sitemap principal + sitemap de blog separado, con un sitemap index:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://www.hoteljirehbacalar.com/sitemap-main.xml</loc>
    <lastmod>2026-06-22</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://www.hoteljirehbacalar.com/sitemap-blog.xml</loc>
    <lastmod>2026-06-22</lastmod>
  </sitemap>
</sitemapindex>
```

### Escenario C — Paginas de ubicacion o "mejores hoteles en X" (RIESGO)

Si se consideran paginas programaticas del tipo `/hotel-cerca-de-laguna-bacalar/`, `/hotel-bacalar-luna-de-miel/`, etc., aplicar los quality gates del agente:

- Menos de 30 paginas de este tipo: permitido con 60%+ contenido unico por pagina.
- 30 a 50 paginas: advertencia — requerir justificacion y auditoria de contenido.
- Mas de 50 paginas de este tipo: HARD STOP — riesgo real de penalizacion por doorway pages.

Para un hotel boutique en Bacalar, la estrategia correcta es profundidad sobre amplitud: 5 paginas excelentes con contenido real (fotos propias, resenas verificadas, descripcion detallada) valen mas que 50 paginas generadas con solo el nombre de la ciudad cambiado.

### Migration path cuando el dominio definitivo este activo

Cuando `hoteljirehbacalar.com` este en produccion:

1. Configurar redireccion 301 permanente de todas las URLs de `hotel-jireh.vercel.app` al dominio definitivo.
2. Actualizar el canonical en el HTML al dominio nuevo.
3. Actualizar todas las `<loc>` en sitemap.xml al dominio nuevo.
4. Actualizar la directiva `Sitemap:` en robots.txt.
5. Registrar el dominio nuevo en Search Console y enviar el sitemap nuevamente.
6. NO eliminar la propiedad de Vercel en Search Console hasta que Google haya procesado las redirecciones (esperar ~4-6 semanas).

---

## Resumen ejecutivo

| Prioridad | Accion | Impacto |
|-----------|--------|---------|
| 1 - URGENTE | Corregir canonical a URL real | Evita que Google deje de indexar el sitio |
| 2 - Alta | Desplegar sitemap.xml con Image Sitemap | Mejora indexacion de imagenes en Google Images |
| 3 - Alta | Desplegar robots.txt | Elimina 404 en ruta estandar, declara sitemap |
| 4 - Alta | Registrar sitio en Search Console | Visibilidad de errores y envio de sitemap |
| 5 - Media | Activar dominio hoteljirehbacalar.com | Consolidar autoridad en dominio propio |
| 6 - Futura | Separar secciones en paginas independientes | Ampliar superficie de ranking por keyword |
