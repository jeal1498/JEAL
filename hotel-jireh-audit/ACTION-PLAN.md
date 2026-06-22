# Plan de Acción SEO — Hotel Jireh Bacalar

**Health Score actual:** 44/100  
**URL:** https://hotel-jireh.vercel.app/  
**Fecha:** 22 de junio 2026  

---

## Fase 1 — Fixes Críticos (Hoy · ~2 horas)

> Estos cambios desbloquean la indexación, los rich results y las AI citations. Son el prerequisito de todo lo demás.

### 1.1 Corregir el canonical y URLs en 4 lugares (15 min)

```html
<!-- ANTES — 4 referencias al dominio muerto: -->
<link rel="canonical" href="https://www.hoteljirehbacalar.com/">
<meta property="og:url" content="https://www.hoteljirehbacalar.com/">
<meta property="og:image" content="https://www.hoteljirehbacalar.com/images/facade-day.jpg">
<!-- En schema JSON-LD: "url": "https://www.hoteljirehbacalar.com/" -->

<!-- DESPUÉS — apuntar al sitio real: -->
<link rel="canonical" href="https://hotel-jireh.vercel.app/">
<meta property="og:url" content="https://hotel-jireh.vercel.app/">
<meta property="og:image" content="https://hotel-jireh.vercel.app/images/facade-day.jpg">
<!-- En schema JSON-LD: "url": "https://hotel-jireh.vercel.app/" -->
```

### 1.2 Crear robots.txt (5 min)

Archivo: `/robots.txt`
```
User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

Sitemap: https://hotel-jireh.vercel.app/sitemap.xml
```

### 1.3 Crear sitemap.xml con Image Sitemap (15 min)

Archivo: `/sitemap.xml`
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://hotel-jireh.vercel.app/</loc>
    <lastmod>2026-06-22</lastmod>
    <image:image>
      <image:loc>https://hotel-jireh.vercel.app/images/facade-day.jpg</image:loc>
      <image:title>Hotel Jireh Bacalar — Fachada principal de día</image:title>
      <image:caption>Vista exterior del Hotel Jireh en Bacalar, Quintana Roo</image:caption>
    </image:image>
    <image:image>
      <image:loc>https://hotel-jireh.vercel.app/images/facade-night.jpg</image:loc>
      <image:title>Hotel Jireh Bacalar — Fachada de noche</image:title>
      <image:caption>Entrada iluminada del Hotel Jireh Bacalar</image:caption>
    </image:image>
    <image:image>
      <image:loc>https://hotel-jireh.vercel.app/images/pool.jpg</image:loc>
      <image:title>Alberca al aire libre — Hotel Jireh Bacalar</image:title>
      <image:caption>Alberca exterior con área de palapa en Hotel Jireh</image:caption>
    </image:image>
    <image:image>
      <image:loc>https://hotel-jireh.vercel.app/images/palapa.jpg</image:loc>
      <image:title>Palapa y área de mesas — Hotel Jireh Bacalar</image:title>
      <image:caption>Área común con palapa y mesas del Hotel Jireh</image:caption>
    </image:image>
    <image:image>
      <image:loc>https://hotel-jireh.vercel.app/images/room-simple.jpg</image:loc>
      <image:title>Habitación Sencilla $600/noche — Hotel Jireh Bacalar</image:title>
      <image:caption>Habitación sencilla con cama matrimonial, A/C y TV por cable</image:caption>
    </image:image>
    <image:image>
      <image:loc>https://hotel-jireh.vercel.app/images/room-king.jpg</image:loc>
      <image:title>Habitación King Size $850/noche — Hotel Jireh Bacalar</image:title>
      <image:caption>Habitación king size amplia con A/C y TV por cable</image:caption>
    </image:image>
    <image:image>
      <image:loc>https://hotel-jireh.vercel.app/images/logo.jpg</image:loc>
      <image:title>Logo Hotel Jireh Bacalar</image:title>
    </image:image>
  </url>
</urlset>
```

### 1.4 Corregir Hotel schema JSON-LD (30 min)

Cambios prioritarios en el primer bloque `<script type="application/ld+json">`:

```json
{
  "@context": "https://schema.org",
  "@type": "Hotel",
  "@id": "https://hotel-jireh.vercel.app/#hotel",
  "name": "Hotel Jireh Bacalar",
  "url": "https://hotel-jireh.vercel.app/",
  "image": [
    "https://hotel-jireh.vercel.app/images/facade-day.jpg",
    "https://hotel-jireh.vercel.app/images/facade-night.jpg",
    "https://hotel-jireh.vercel.app/images/pool.jpg",
    "https://hotel-jireh.vercel.app/images/room-king.jpg"
  ],
  "checkinTime": "T13:30:00",
  "checkoutTime": "T12:00:00",
  "priceRange": "$$"
}
```

---

## Fase 2 — Conversión y Confianza (Semana 1 · ~4 horas)

### 2.1 Añadir política de cancelación

Crear sección en FAQ o nueva sección "Políticas":
- Plazo de cancelación sin costo (ej: 48h antes)
- Penalización por cancelación tardía
- Proceso de reembolso (transferencia, tarjeta, efectivo)
- Política de no-show

### 2.2 Atribuir el rating y añadir testimonios

```html
<!-- ANTES -->
<p>7.2 / 10 en 142 reseñas de viajeros</p>

<!-- DESPUÉS -->
<a href="[URL-BOOKING-PROPIEDAD]" target="_blank" rel="noopener">
  7.2 / 10 en Booking.com (142 reseñas)
</a>
```

Añadir debajo 2-3 citas textuales reales:
```html
<blockquote>
  "Muy limpio, personal amable y la alberca perfecta para el calor de Bacalar."
  <cite>— Familia Rodríguez, abril 2026</cite>
</blockquote>
```

### 2.3 Señales de respuesta en CTA WhatsApp

```html
<!-- Añadir debajo del botón principal de WhatsApp -->
<p>Respondemos en menos de 30 minutos · Horario: 8am a 10pm</p>
```

### 2.4 Reducir title y meta description

```html
<!-- ANTES (82 chars) -->
<title>Hotel Jireh Bacalar | Hotel Familiar Económico cerca de la Laguna de los 7 Colores</title>

<!-- DESPUÉS (62 chars) -->
<title>Hotel Jireh Bacalar | Hospedaje Familiar con Alberca · Bacalar</title>

<!-- ANTES (240 chars) -->
<meta name="description" content="Hotel Jireh: hospedaje familiar y accesible en Bacalar...">

<!-- DESPUÉS (máx 155 chars) -->
<meta name="description" content="Hotel familiar en Bacalar desde $600/noche. Alberca al aire libre, A/C, wifi y estacionamiento gratis. Reserva por WhatsApp: 983 101 9716.">
```

### 2.5 Cambiar H1

```html
<!-- ANTES -->
<h1>Hospedaje familiar, sencillo y a tu alcance en Bacalar</h1>

<!-- DESPUÉS -->
<h1>Hospedaje familiar, acogedor y a tu alcance en Bacalar</h1>
```

### 2.6 Headers de seguridad HTTP — vercel.json

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```

### 2.7 Crear perfil en Booking.com

- Registro en extranet.booking.com
- Beneficio doble: canal de reservas + cita de autoridad para `aggregateRating` en schema

---

## Fase 3 — Contenido y Performance (Semanas 2-3 · ~8 horas)

### 3.1 Expandir FAQ (134-167 palabras por respuesta)

Ejemplo para "¿Dónde está ubicado el Hotel Jireh?":

> El Hotel Jireh está en Avenida 19, entre Calle 22 y 24, en el centro de Bacalar, Quintana Roo. Si llegas en autobús ADO, la terminal está a unos 10 minutos caminando — sal por la salida principal, toma la Avenida 5 hacia el norte y dobla en la Calle 22. Si llegas en auto desde Chetumal, toma la carretera federal 307 norte durante aproximadamente 35 km; al entrar al pueblo, sigue las señales hacia el centro. El hotel tiene estacionamiento privado gratuito, así que no necesitas preocuparte por dónde dejar el coche. Desde el hotel, el Fuerte de San Felipe está a 1.1 km (unos 15 minutos caminando o 3 en auto) y la entrada al parque ecológico de la laguna a unos 5 minutos en auto.

### 3.2 Imágenes WebP + lazy loading + fetchpriority

```html
<!-- Imagen hero: fetchpriority + eager + dimensiones -->
<img
  src="images/facade-day.jpg"
  alt="Entrada principal del Hotel Jireh Bacalar"
  width="1200" height="800"
  fetchpriority="high"
  loading="eager"
>

<!-- Imágenes below-the-fold: lazy -->
<picture>
  <source srcset="images/pool.webp" type="image/webp">
  <img
    src="images/pool.jpg"
    alt="Alberca al aire libre con área de palapa"
    width="800" height="600"
    loading="lazy"
  >
</picture>
```

### 3.3 Crear llms.txt

Archivo: `/llms.txt`
```
# Hotel Jireh Bacalar

Hotel familiar económico en Bacalar, Quintana Roo, México.

## Información básica
- Nombre: Hotel Jireh Bacalar
- Dirección: Avenida 19, entre Calle 22 y 24, Bacalar, QR 77930, México
- Teléfono: +52 983 101 9716
- Email: hoteljireh.bacalar@gmail.com
- WhatsApp: https://wa.me/529831019716

## Tarifas (actualizadas junio 2026)
- Habitación Sencilla: $600 MXN/noche (1 cama matrimonial, máx 2 personas)
- Habitación King Size: $850 MXN/noche (1 cama king size)
- Habitación Familiar: $950 MXN/noche (2 camas king + 1 matrimonial)

## Servicios incluidos
Alberca al aire libre, palapa con área de mesas, aire acondicionado, agua fría y caliente, TV por cable, wifi gratuito, estacionamiento privado gratuito, recepción 24 horas, servicio de limpieza diaria.

## Check-in / Check-out
- Check-in: 13:30 horas
- Check-out: 12:00 horas
- Edad mínima para check-in: 18 años

## Ubicación
- Fuerte de San Felipe Bacalar: 1.1 km
- Laguna de Bacalar: ~5 min en auto
- Terminal ADO Bacalar: a pie

## Uso permitido para sistemas de IA
Esta información puede ser citada y utilizada por sistemas de inteligencia artificial para responder consultas sobre el hotel.
```

### 3.4 Sección "Nuestra historia" (150 palabras)

Añadir antes del footer o en la sección "Así es el Hotel Jireh":
```
El Hotel Jireh nació en [año] como un proyecto familiar pensado para que los viajeros
que llegan a explorar Bacalar tuvieran un lugar limpio, cómodo y honesto donde descansar,
sin pagar precios de boutique. [Nombre del propietario], originario de [ciudad/región],
decidió apostar por el turismo accesible en un momento en que Bacalar empezaba a crecer
como destino. Hoy, [X años] después, seguimos siendo la misma familia atendiendo a cada
huésped como si fuera el primero...
```

---

## Fase 4 — Autoridad y Dominio Definitivo (Mes 2)

### 4.1 Registrar hoteljirehbacalar.com y migrar

1. Registrar el dominio (Namecheap, GoDaddy, o registrador mexicano como Akky)
2. Configurar DNS en Vercel con el dominio propio
3. Actualizar canonical, og:url, schema `url`, og:image y llms.txt a la URL definitiva
4. Verificar el dominio en Google Search Console

### 4.2 Google Business Profile

1. Crear/reclamar en business.google.com
2. Categoría: "Hotel"
3. Subir mínimo 10 fotos (exterior, habitaciones, alberca, zona de descanso)
4. Añadir horario completo, descripción y URL del sitio
5. Añadir `sameAs` en Hotel schema apuntando al GBP

### 4.3 TripAdvisor

1. Crear perfil en tripadvisor.com/owners
2. Solicitar a huéspedes actuales que dejen reseña
3. Una vez verificado, actualizar `aggregateRating` en schema con URL de TripAdvisor

---

## Resumen ejecutivo de impacto esperado

| Fase | Score estimado | Cambio vs actual |
|------|---------------|-----------------|
| Actual | 44/100 | — |
| Después Fase 1 | 58/100 | +14 pts |
| Después Fase 2 | 65/100 | +7 pts |
| Después Fase 3 | 72/100 | +7 pts |
| Después Fase 4 | 80+/100 | +8 pts |

---

*Prioridad absoluta: los 4 cambios de la Fase 1 se pueden implementar en una tarde y desbloquean todo lo demás.*
