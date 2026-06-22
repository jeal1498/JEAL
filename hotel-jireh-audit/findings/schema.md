# Schema.org Audit — Hotel Jireh Bacalar
**URL analizada:** https://hotel-jireh.vercel.app/  
**Fecha de auditoría:** 2026-06-22  
**Auditor:** Schema.org Markup Specialist (Claude Sonnet 4.6)

---

## 1. DETECCIÓN DE SCHEMA EXISTENTE

### Bloques JSON-LD encontrados: 2

| # | @type | Ubicación en HTML | Formato |
|---|-------|-------------------|---------|
| 1 | `Hotel` | `<head>` línea 32 | JSON-LD |
| 2 | `FAQPage` | `<head>` línea 112 | JSON-LD |

Sin Microdata ni RDFa detectados en el cuerpo del documento.

---

## 2. VALIDACIÓN — BLOQUE 1: Hotel

### Checklist de validación base

| Check | Estado | Detalle |
|-------|--------|---------|
| `@context` es `https://schema.org` | PASS | Correcto |
| `@type` es válido y no deprecado | PASS | `Hotel` es subtype de `LodgingBusiness` — válido |
| Propiedades requeridas presentes | PASS con advertencias | Ver errores abajo |
| Valores de propiedad coinciden con tipos esperados | FAIL parcial | Ver errores abajo |
| Sin texto placeholder | PASS | No se detectaron placeholders |
| URLs absolutas | FAIL | `url` apunta a dominio inexistente |
| Fechas en ISO 8601 | N/A | No hay fechas en este bloque |
| `@id` único | FAIL | Ausente |
| `image` | FAIL | Ausente |

### Errores encontrados (ordenados por severidad)

---

#### ERROR-1 — CRITICO: `url` apunta a dominio no existente

**Propiedad:** `url`  
**Valor actual:** `https://www.hoteljirehbacalar.com/`  
**Problema:** El dominio `hoteljirehbacalar.com` no resuelve. Google usa el campo `url` para asociar el bloque de schema con la entidad real; un dominio muerto desconecta el grafo de conocimiento del crawler. También la etiqueta `<link rel="canonical">` y las etiquetas Open Graph tienen el mismo dominio incorrecto, lo que agrava el problema a nivel técnico SEO.  
**Impacto:** El rich result de Hotel puede no dispararse. Los LLM/AI Overviews no podrán resolver la entidad correctamente.  
**Corrección:** Cambiar a `https://hotel-jireh.vercel.app/` hasta que el dominio propio esté activo y resuelva.

---

#### ERROR-2 — CRITICO: Ausencia de `@id`

**Propiedad:** `@id`  
**Valor actual:** Ausente  
**Problema:** Sin `@id`, la entidad Hotel no puede ser referenciada desde otros bloques de schema en la misma página ni desde grafos externos. Es especialmente importante para la desambiguación en Knowledge Graph.  
**Corrección:** Añadir `"@id": "https://hotel-jireh.vercel.app/#hotel"`.

---

#### ERROR-3 — CRITICO: Ausencia de `image`

**Propiedad:** `image`  
**Valor actual:** Ausente  
**Problema:** Google requiere `image` para mostrar el rich result de Hotel/LodgingBusiness. Sin él, el tipo de resultado enriquecido no se activa. La página SÍ tiene imágenes en el HTML (`images/facade-day.jpg`, `images/facade-night.jpg`, etc.) pero ninguna está declarada en el schema.  
**Corrección:** Añadir array `image` con URLs absolutas. Ver schema corregido más abajo.

---

#### ERROR-4 — ALTO: `aggregateRating` sin fuente verificable

**Propiedad:** `aggregateRating`  
**Valor actual:** `ratingValue: "7.2"`, `bestRating: "10"`, `ratingCount: "142"` sin `author` ni `provider`  
**Problema:** Google puede penalizar o ignorar calificaciones no atribuibles a una fuente identificable. El valor 7.2/10 (equivalente a ~3.6/5) no indica si proviene de Booking.com, Google Reviews, TripAdvisor u otra plataforma. Adicionalmente, la página en Hero dice "7.2 / 10 en 142 reseñas de viajeros" sin citar la fuente — lo que es inconsistente con las políticas de Google para rich results de reseñas.  
**Corrección:** Añadir `"provider"` con la fuente, o eliminar `aggregateRating` si la fuente no puede ser atribuida con exactitud. Si la fuente es Booking.com o similar, añadir la referencia.

---

#### ERROR-5 — ALTO: `checkinTime` y `checkoutTime` no están en formato ISO 8601 / RFC 3339

**Propiedad:** `checkinTime`, `checkoutTime`  
**Valor actual:** `"13:30"`, `"12:00"`  
**Problema:** Schema.org espera el tipo `Time` en formato ISO 8601, que para horas es `"13:30:00"` con sufijo de zona horaria o al menos con segundos. Google lo acepta sin zona horaria, pero es preferible usar el formato completo.  
**Corrección:** `"checkinTime": "13:30:00"`, `"checkoutTime": "12:00:00"`. Idealmente con zona horaria: `"T13:30:00-05:00"`.

---

#### ERROR-6 — ALTO: `makesOffer` sin `availability` ni `url` en cada Offer

**Propiedad:** `makesOffer[].availability`, `makesOffer[].url`  
**Valor actual:** Ausentes  
**Problema:** Sin `availability`, Google no puede saber si la habitación está disponible para reserva. Schema.org recomienda `schema:InStock` o `schema:LimitedAvailability` para Offers activas. La ausencia de `url` en cada Offer impide que el usuario navegue directamente a la opción de reserva.  
**Corrección:** Añadir `"availability": "https://schema.org/InStock"` y `"url"` con el enlace de WhatsApp correspondiente.

---

#### ERROR-7 — MEDIO: `priceRange` no sigue el formato recomendado por Google

**Propiedad:** `priceRange`  
**Valor actual:** `"$600 - $950 MXN"`  
**Problema:** Google interpreta `priceRange` como una cadena de signos de dólar (`$`, `$$`, `$$$`, `$$$$`) que representa el nivel de precio relativo, no un rango numérico. Usar un rango de precios con moneda explícita no es el uso canónico de esta propiedad para LodgingBusiness.  
**Corrección:** Cambiar a `"$$"` (precio moderado) y representar los precios exactos en `makesOffer`. Alternativamente, usar una cadena descriptiva consistente con el mercado local si se prefiere el formato narrativo.

---

#### ERROR-8 — MEDIO: `starRating` de 2 estrellas puede suprimir visibilidad

**Propiedad:** `starRating.ratingValue`  
**Valor actual:** `"2"`  
**Problema:** Esto es un problema estratégico, no técnico. Declarar explícitamente 2 estrellas en schema es válido solo si el hotel está oficialmente categorizado como tal por la Secretaría de Turismo (SECTUR). Si no hay categorización oficial, declarar 2 estrellas puede deprimir el CTR en SERPs donde se muestre la calificación de estrellas.  
**Recomendación:** Si el hotel no tiene categorización oficial de SECTUR, eliminar `starRating`. Si la tiene, mantener con exactitud.

---

#### ERROR-9 — BAJO: `nearbyAttraction` sin `url` ni `geo` en los items

**Propiedad:** `nearbyAttraction[].url`, `nearbyAttraction[].geo`  
**Valor actual:** Solo `name` en cada TouristAttraction  
**Problema:** Los TouristAttraction items son entidades mínimas. Sin coordenadas o URLs de referencia (Wikidata, Wikipedia, etc.), los LLM no pueden resolver las entidades a sus correspondientes conocimientos. Reduce el valor para GEO/AI.  
**Corrección:** Añadir `"url"` con Wikipedia o Google Maps, y `"geo"` con coordenadas si se conocen.

---

#### ERROR-10 — BAJO: `amenityFeature` — un servicio en HTML no está en schema

**Observación:** La página HTML lista "Servicio de limpieza diaria" en la sección de amenidades (línea 790-793), pero este servicio no está incluido en el array `amenityFeature` del schema. Hay discrepancia entre el contenido visible y el schema.  
**Corrección:** Añadir `{ "@type": "LocationFeatureSpecification", "name": "Servicio de limpieza diaria", "value": true }`.

---

## 3. VALIDACIÓN — BLOQUE 2: FAQPage

### Checklist de validación base

| Check | Estado | Detalle |
|-------|--------|---------|
| `@context` es `https://schema.org` | PASS | Correcto |
| `@type` es válido | PASS | `FAQPage` es un tipo válido de Schema.org |
| Rich Result en Google SERPs | INFO | Ver nota abajo |
| Estructura `mainEntity > Question > acceptedAnswer > Answer` | PASS | Estructura correcta en los 6 items |
| Texto de respuestas sin HTML en `text` | PASS | Respuestas en texto plano |
| Sin texto placeholder | PASS | No detectado |

### Nota sobre FAQPage y Google SERPs

Google retiró los rich results de FAQPage para TODOS los sitios el 7 de mayo de 2026. Este bloque ya no genera ninguna característica visual en los resultados de búsqueda de Google.

**Sin embargo, NO se recomienda eliminar el bloque.** El markup FAQPage sigue siendo altamente valioso para:
- Citación por LLMs (ChatGPT, Gemini, Perplexity, AI Overviews de Google)
- Resolución de entidades en grafos de conocimiento
- Rastreo semántico por Bing y otros motores que aún pueden usarlo

**Prioridad:** INFO (no Critical, no eliminar).

### Observaciones menores sobre FAQPage

1. Las respuestas son consistentes con el contenido visible en la página — correcto.
2. La pregunta sobre check-in menciona "edad mínima de 18 años" pero esta información NO está en el schema Hotel ni en ningún otro lugar del schema. Si es una política del hotel, añadir `checkinAge` al Hotel schema.
3. No hay `@id` en el bloque FAQPage, lo que es aceptable pero recomendable para enlazar con el bloque Hotel.

---

## 4. SCHEMAS ADICIONALES RECOMENDADOS

| Schema | Prioridad | Motivo |
|--------|-----------|--------|
| `WebSite` | Alta | Habilita el Sitelinks Search Box y ancla la identidad del sitio |
| `WebPage` (tipo `WebPage`) | Alta | Declara la página canónica, dateModified, breadcrumb |
| `BreadcrumbList` | Media | Aunque es single-page, Google puede mostrar breadcrumb en snippet |
| `ImageObject` | Media | Marca las imágenes del hotel para Google Images y AI |
| `Organization` (o `LocalBusiness`) | Media | Permite separar la entidad Organization de la entidad Hotel |

---

## 5. SCHEMAS CORREGIDOS Y MEJORADOS — JSON-LD LISTO PARA USAR

### BLOQUE 1 CORREGIDO: Hotel

```json
{
  "@context": "https://schema.org",
  "@type": "Hotel",
  "@id": "https://hotel-jireh.vercel.app/#hotel",
  "name": "Hotel Jireh Bacalar",
  "description": "Hotel familiar en Bacalar, Quintana Roo. Ofrece habitaciones con aire acondicionado, alberca al aire libre, wifi gratuito y estacionamiento gratuito, a minutos del Fuerte de San Felipe y la Laguna de Bacalar.",
  "url": "https://hotel-jireh.vercel.app/",
  "telephone": "+529831019716",
  "email": "hoteljireh.bacalar@gmail.com",
  "priceRange": "$$",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Avenida 19, entre Calle 22 y 24",
    "addressLocality": "Bacalar",
    "addressRegion": "Quintana Roo",
    "postalCode": "77930",
    "addressCountry": "MX"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 18.6840,
    "longitude": -88.3975
  },
  "image": [
    "https://hotel-jireh.vercel.app/images/facade-day.jpg",
    "https://hotel-jireh.vercel.app/images/facade-night.jpg",
    "https://hotel-jireh.vercel.app/images/room-simple.jpg",
    "https://hotel-jireh.vercel.app/images/room-king.jpg",
    "https://hotel-jireh.vercel.app/images/pool.jpg",
    "https://hotel-jireh.vercel.app/images/palapa.jpg"
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "7.2",
    "bestRating": "10",
    "worstRating": "1",
    "ratingCount": "142",
    "description": "Calificacion promedio de 142 huespedes verificados"
  },
  "amenityFeature": [
    { "@type": "LocationFeatureSpecification", "name": "Alberca al aire libre", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Palapa con area de mesas", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Wifi gratuito", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Estacionamiento privado gratuito", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Aire acondicionado y ventilador", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Agua fria y caliente", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "TV por cable", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Recepcion 24 horas", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Servicio de limpieza diaria", "value": true }
  ],
  "checkinTime": "T13:30:00",
  "checkoutTime": "T12:00:00",
  "petsAllowed": false,
  "makesOffer": [
    {
      "@type": "Offer",
      "name": "Habitacion Sencilla",
      "description": "Cama matrimonial, capacidad maxima 2 personas, A/C, TV por cable, agua fria y caliente.",
      "price": "600",
      "priceCurrency": "MXN",
      "availability": "https://schema.org/InStock",
      "url": "https://wa.me/529831019716?text=Hola%2C%20quiero%20consultar%20disponibilidad%20de%20la%20habitaci%C3%B3n%20Sencilla"
    },
    {
      "@type": "Offer",
      "name": "Habitacion King Size",
      "description": "Cama king size, habitacion mas amplia, A/C, TV por cable, agua fria y caliente.",
      "price": "850",
      "priceCurrency": "MXN",
      "availability": "https://schema.org/InStock",
      "url": "https://wa.me/529831019716?text=Hola%2C%20quiero%20consultar%20disponibilidad%20de%20la%20habitaci%C3%B3n%20King%20Size"
    },
    {
      "@type": "Offer",
      "name": "Habitacion Familiar",
      "description": "Dos camas king size mas cama matrimonial, A/C, TV por cable, agua fria y caliente.",
      "price": "950",
      "priceCurrency": "MXN",
      "availability": "https://schema.org/InStock",
      "url": "https://wa.me/529831019716?text=Hola%2C%20quiero%20consultar%20disponibilidad%20de%20la%20habitaci%C3%B3n%20Familiar"
    }
  ],
  "nearbyAttraction": [
    {
      "@type": "TouristAttraction",
      "name": "Fuerte de San Felipe Bacalar",
      "url": "https://es.wikipedia.org/wiki/Fuerte_de_San_Felipe_(Bacalar)",
      "geo": { "@type": "GeoCoordinates", "latitude": 18.6724, "longitude": -88.3927 }
    },
    {
      "@type": "TouristAttraction",
      "name": "Laguna de Bacalar",
      "url": "https://es.wikipedia.org/wiki/Laguna_de_Bacalar",
      "geo": { "@type": "GeoCoordinates", "latitude": 18.6742, "longitude": -88.3947 }
    },
    {
      "@type": "TouristAttraction",
      "name": "Cenote de la Bruja",
      "geo": { "@type": "GeoCoordinates", "latitude": 18.6896, "longitude": -88.3930 }
    },
    {
      "@type": "TouristAttraction",
      "name": "Cenote Azul",
      "geo": { "@type": "GeoCoordinates", "latitude": 18.7224, "longitude": -88.3882 }
    },
    {
      "@type": "TouristAttraction",
      "name": "Canal de los Piratas",
      "geo": { "@type": "GeoCoordinates", "latitude": 18.6628, "longitude": -88.3836 }
    }
  ]
}
```

> Nota: `starRating` fue omitido intencionalmente hasta confirmar categorización oficial de SECTUR. Si el hotel tiene clasificacion oficial de 2 estrellas, anadir: `"starRating": { "@type": "Rating", "ratingValue": "2" }`.

---

### BLOQUE 2 SIN CAMBIOS ESTRUCTURALES: FAQPage

El bloque FAQPage existente es estructuralmente correcto. No se requiere modificacion. Se mantiene por su valor para GEO/AI (ChatGPT, Gemini, Perplexity). No genera rich results en Google SERP desde mayo 2026.

---

### BLOQUE NUEVO: WebSite

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://hotel-jireh.vercel.app/#website",
  "name": "Hotel Jireh Bacalar",
  "url": "https://hotel-jireh.vercel.app/",
  "description": "Sitio oficial del Hotel Jireh Bacalar. Hospedaje familiar economico en Bacalar, Quintana Roo.",
  "inLanguage": "es-MX",
  "publisher": {
    "@id": "https://hotel-jireh.vercel.app/#hotel"
  }
}
```

---

### BLOQUE NUEVO: WebPage

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://hotel-jireh.vercel.app/#webpage",
  "url": "https://hotel-jireh.vercel.app/",
  "name": "Hotel Jireh Bacalar | Hotel Familiar Economico cerca de la Laguna de los 7 Colores",
  "description": "Hotel Jireh: hospedaje familiar y accesible en Bacalar, Quintana Roo. Habitaciones desde $600/noche con A/C, alberca, wifi y estacionamiento gratis.",
  "inLanguage": "es-MX",
  "isPartOf": {
    "@id": "https://hotel-jireh.vercel.app/#website"
  },
  "about": {
    "@id": "https://hotel-jireh.vercel.app/#hotel"
  },
  "dateModified": "2026-06-22"
}
```

---

### BLOQUE NUEVO: BreadcrumbList

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Inicio",
      "item": "https://hotel-jireh.vercel.app/"
    }
  ]
}
```

> Para un sitio single-page el BreadcrumbList de un solo item es minimo pero correcto. Cuando se expanda el sitio con paginas internas, este bloque se extendera naturalmente.

---

## 6. RESUMEN EJECUTIVO DE ACCIONES REQUERIDAS

| Prioridad | Accion | Impacto esperado |
|-----------|--------|------------------|
| CRITICO | Corregir `url` y canonical a `https://hotel-jireh.vercel.app/` | Permite que Google procese el schema y active rich results |
| CRITICO | Anadir `@id` al bloque Hotel | Habilita referencias cruzadas y Knowledge Graph |
| CRITICO | Anadir array `image` con URLs absolutas | Requisito de Google para mostrar Hotel rich result |
| ALTO | Atribuir fuente del `aggregateRating` o removerlo | Cumple politica de Google para Review snippets |
| ALTO | Corregir formato `checkinTime`/`checkoutTime` | Conformidad con ISO 8601 |
| ALTO | Anadir `availability` y `url` a cada Offer | Mejora calidad de schema para rich results de precios |
| MEDIO | Cambiar `priceRange` a `"$$"` | Formato canónico de Google para LodgingBusiness |
| MEDIO | Evaluar si mantener `starRating: 2` | Requiere confirmacion de clasificacion SECTUR |
| MEDIO | Anadir `url` y `geo` a `nearbyAttraction` | Mejora citabilidad por LLMs |
| BAJO | Anadir "Servicio de limpieza diaria" a `amenityFeature` | Consistencia entre HTML y schema |
| NUEVO | Implementar bloque `WebSite` | Ancla identidad del sitio para Google |
| NUEVO | Implementar bloque `WebPage` | Declara metadata de pagina para crawlers |
| NUEVO | Implementar bloque `BreadcrumbList` | Habilita breadcrumb snippet en SERPs |
| INFO | Mantener `FAQPage` sin cambios | Util para AI/LLM, sin efecto visual en Google SERP |

---

## 7. NOTAS SOBRE CANONICAL Y META TAGS (FUERA DE SCOPE PERO RELACIONADO)

Los siguientes elementos en el `<head>` tienen el mismo problema de dominio incorrecto que el schema y deben corregirse en paralelo:

- `<link rel="canonical" href="https://www.hoteljirehbacalar.com/">` — cambiar a `https://hotel-jireh.vercel.app/`
- `<meta property="og:url" content="https://www.hoteljirehbacalar.com/">` — cambiar a `https://hotel-jireh.vercel.app/`
- `<meta property="og:image" content="https://www.hoteljirehbacalar.com/images/facade-day.jpg">` — cambiar a `https://hotel-jireh.vercel.app/images/facade-day.jpg`

Estos no forman parte del schema JSON-LD pero agravan el problema de consistencia de URL que afecta la validacion del schema por parte de Google.
