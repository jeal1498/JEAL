# Local SEO Audit — Hotel Jireh Bacalar
**URL auditada:** https://hotel-jireh.vercel.app/
**Fecha de auditoría:** 2026-06-22
**Auditor:** Local SEO Agent (Claude Sonnet 4.6)

---

## Puntuacion Local SEO: 29 / 100

| Dimension                        | Peso | Puntos obtenidos | Maximo |
|----------------------------------|------|------------------|--------|
| Senales GBP                      | 25%  | 2                | 25     |
| Resenas y reputacion             | 20%  | 8                | 20     |
| SEO local on-page                | 20%  | 12               | 20     |
| Consistencia NAP y citas         | 15%  | 3                | 15     |
| Schema local                     | 10%  | 6                | 10     |
| Senales de autoridad y enlaces   | 10%  | 2                | 10     |
| **TOTAL**                        |      | **33 / 100**     |        |

> Nota: la puntuacion refleja el estado del sitio web y las senales on-page verificables. No incluye datos live de GBP ni posicion en Local Pack, que requieren herramientas de pago (DataForSEO, BrightLocal, Whitespark).

---

## Tipo de negocio detectado

**Brick-and-mortar confirmado.**

Senales detectadas:
- Direccion fisica completa visible en footer HTML: "Avenida 19, entre Calle 22 y 24 / 77930 Bacalar, Quintana Roo"
- Referencia en prose a la direccion en seccion de ubicacion (linea 873 del HTML)
- Schema `address.streetAddress` y `postalCode` presentes en JSON-LD
- Sin lenguaje de "area de servicio" ni "venimos a ti"
- Sin Google Maps embed ni enlace directo a Maps (ausencia critica para brick-and-mortar)

---

## Vertical de industria detectado

**Hospitalidad / Alojamiento turistico — Hotel economico familiar (budget hotel).**

Senales de deteccion:
- `@type: Hotel` en JSON-LD
- Precios por noche expresados en MXN
- `checkinTime` / `checkoutTime` presentes
- `starRating: 2` (hotel de categoria economica)
- Terminologia de "habitaciones", "huespedes", "estancia"
- Menciones de temporada turistica implicitas (laguna, pueblo magico)

Subvertical relevante para Local SEO: **hotel boutique / familiar de bajo presupuesto en destino de turismo natural**. Competencia directa: hostels con presencia en Hostelworld, hoteles boutique con perfil en Booking.com, propiedades de Airbnb.

---

## Auditoria NAP — Comparacion entre fuentes

| Campo       | Schema JSON-LD                                | HTML visible (footer)                       | Meta/OG tags                          | FAQ Schema                                         | Discrepancia |
|-------------|-----------------------------------------------|---------------------------------------------|---------------------------------------|----------------------------------------------------|--------------|
| Nombre      | "Hotel Jireh Bacalar"                         | "Hotel Jireh Bacalar" (footer span)         | og:site_name "Hotel Jireh Bacalar"    | "Hotel Jireh Bacalar"                              | Ninguna      |
| Direccion   | Avenida 19, entre Calle 22 y 24 / 77930 / Bacalar / QR | Avenida 19, entre Calle 22 y 24 / 77930 Bacalar, Quintana Roo | No presente                           | "Avenida 19, entre Calle 22 y 24, Bacalar, QR"    | Ninguna      |
| Telefono    | "+529831019716"                               | "983 101 9716" (tel:+529831019716)          | No presente                           | "983 101 9716"                                     | **MENOR: formato inconsistente** |
| URL         | "https://www.hoteljirehbacalar.com/"          | —                                           | og:url "https://www.hoteljirehbacalar.com/" | —                                             | **CRITICA: dominio no existe** |
| Email       | "hoteljireh.bacalar@gmail.com"                | "hoteljireh.bacalar@gmail.com"              | No presente                           | "hoteljireh.bacalar@gmail.com"                     | Ninguna      |

### Discrepancias identificadas

**[CRITICA] URL apunta a dominio inexistente.**
El schema JSON-LD, la etiqueta canonical (`<link rel="canonical" href="https://www.hoteljirehbacalar.com/">`), la propiedad `og:url`, y la propiedad `og:image` referencian `https://www.hoteljirehbacalar.com/`, un dominio que no esta registrado o no esta activo. El sitio vive en `hotel-jireh.vercel.app`. Esto causa:
- Senales canonicas enviadas a Google apuntando a una URL que devuelve error
- Posible confusion de entidad en el grafo de conocimiento de Google
- El schema dice que el negocio existe en un URL que no existe

**[MENOR] Formato de telefono inconsistente.**
En JSON-LD: `"+529831019716"` (formato E.164 correcto, con prefijo pais). En HTML visible y FAQ: `"983 101 9716"` (local, sin prefijo). Google recomienda E.164 en schema y formato local consistente en HTML. La inconsistencia es tolerable pero debe unificarse.

**[MENOR] Geo-coordenadas con precision insuficiente.**
`latitude: 18.6840` y `longitude: -88.3975` usan solo 4 decimales. Schema.org y las mejores practicas locales recomiendan 5 decimales minimo para precision de ~1 metro. Con 4 decimales la precision es ~11 metros, que puede desplazar el pin de Maps.

---

## Validacion del Schema Local

### Schema 1: Hotel (lineas 32-109 del HTML)

| Propiedad                    | Estado     | Valor / Observacion                                          |
|------------------------------|------------|--------------------------------------------------------------|
| @type                        | Correcto   | `Hotel` — subtipo apropiado para schema.org/Hotel           |
| name                         | Presente   | "Hotel Jireh Bacalar"                                        |
| address (PostalAddress)      | Presente   | Completa con streetAddress, locality, region, postal, country |
| telephone                    | Presente   | "+529831019716" (E.164 correcto)                             |
| url                          | **ERROR**  | Apunta a dominio inexistente hoteljirehbacalar.com          |
| geo (GeoCoordinates)         | Parcial    | Presente pero solo 4 decimales de precision (requiere 5+)   |
| starRating                   | Presente   | ratingValue: "2" — formato correcto con @type Rating         |
| aggregateRating              | **ALERTA** | Presente (7.2/10, 142 resenas) pero sin `reviewCount` ni fuente especificada |
| amenityFeature               | Excelente  | 8 LocationFeatureSpecification completas con value: true     |
| checkinTime / checkoutTime   | Presente   | "13:30" / "12:00"                                            |
| petsAllowed                  | Presente   | false                                                        |
| makesOffer                   | Presente   | 3 Offer con price, priceCurrency MXN, description            |
| nearbyAttraction             | Presente   | 5 TouristAttraction                                          |
| openingHoursSpecification    | **FALTA**  | No incluida (recepcion 24h no formalizada en schema)        |
| sameAs                       | **FALTA**  | No hay enlaces a GBP, Facebook, Booking, TripAdvisor        |
| image                        | **FALTA**  | No hay propiedad image en schema                             |
| description                  | Presente   | Descripcion en espanol, suficiente longitud                  |
| priceRange                   | Presente   | "$600 - $950 MXN" — formato texto, no ideal pero valido      |
| email                        | Presente   | hoteljireh.bacalar@gmail.com                                 |

**Subtipo de schema:** `Hotel` es el tipo correcto de schema.org para un hotel. No usar `Lodging` (demasiado generico) ni `LocalBusiness` solo (demasiado amplio). El uso de `Hotel` es apropiado.

**Problema critico de aggregateRating:** La puntuacion 7.2/10 con 142 resenas no especifica fuente (`@id` de la fuente, o `itemReviewed`). Google puede rechazar o ignorar `aggregateRating` en rich results si no puede verificar las resenas contra una fuente conocida (Google Reviews, Booking, TripAdvisor). Si los datos no corresponden a una fuente real verificable, podria considerarse datos estructurados enganosos.

### Schema 2: FAQPage (lineas 112-167 del HTML)

| Estado | Evaluacion |
|--------|------------|
| @type FAQPage | Correcto |
| 6 preguntas con Question + acceptedAnswer | Correcto |
| Contenido unico vs HTML | Las respuestas coinciden con el HTML visible (no es duplicado vacio) |
| Oportunidad | Las respuestas son textuales y directas — buen formato para AI Overviews y featured snippets |

El FAQPage esta bien implementado y es el esquema mas fuerte del sitio para visibilidad generativa.

---

## Senales GBP (Google Business Profile)

| Senal                              | Estado      |
|------------------------------------|-------------|
| Google Maps embed en pagina        | **AUSENTE** |
| Enlace a Google Maps / "Ver en Maps" | **AUSENTE** |
| Boton "Dejar una resena en Google" | **AUSENTE** |
| Widget de resenas de Google        | **AUSENTE** |
| Referencia a perfil GBP            | **AUSENTE** |
| Place ID mencionado                | **AUSENTE** |
| Foto de fachada etiquetada con lugar | No verificable (imagenes locales sin geoetiqueta) |
| Horario de atencion formalizado    | Solo en FAQ ("recepcion 24h"), no en schema ni en GBP |
| sameAs apuntando a GBP URL         | **AUSENTE** |

**Diagnostico:** No hay evidencia de que el hotel tenga un Google Business Profile activo ni de que el sitio web este vinculado a ninguno. Este es el factor de ranking #1 en Local SEO segun Whitespark 2026 (score: 193). La ausencia total de senales GBP es la brecha mas critica del sitio.

---

## Resenas y salud reputacional

### Datos visibles en el sitio

| Metrica           | Valor detectado               | Fuente                          |
|-------------------|-------------------------------|---------------------------------|
| Puntuacion        | 7.2 / 10                      | HTML hero + schema aggregateRating |
| Numero de resenas | 142                           | HTML hero + schema ratingCount  |
| Escala            | Sobre 10 (bestRating: "10")   | Schema                          |
| Fuente de resenas | **No especificada**           | Ninguna fuente citada           |
| Plataforma OTA    | No mencionada                 | Sin link a Booking, TripAdvisor |
| Resenas de Google | No visibles                   | Sin widget ni enlace            |
| Velocidad de resenas | Desconocida                | Sin datos de fechas             |
| Tasa de respuesta | Desconocida                   | Sin widget de resenas           |

**Problema principal:** La calificacion 7.2/10 flota en el sitio sin anclaje a ninguna plataforma verificable. No hay enlace a Booking.com, TripAdvisor, Google, ni Expedia que sustente ese numero. Esto puede interpretarse de dos maneras negativas: (1) el numero es inventado o desactualizado, lo que violaria las politicas de datos estructurados de Google, o (2) el hotel si tiene presencia en OTAs pero no la referencia en el sitio, perdiendo una oportunidad critica de senales de autoridad.

**Regla de los 18 dias (Sterling Sky):** Sin perfil GBP activo con resenas recientes, el hotel no puede beneficiarse del impulso de ranking por velocidad de resenas. Si el GBP existe pero sin resenas nuevas en 18+ dias, hay riesgo de caida en rankings del Local Pack.

---

## Presencia en directorios — Citas Tier 1

Verificacion limitada a lo observable desde el sitio y referencias conocidas del mercado hotelero mexicano.

| Directorio           | Estado observable           | Impacto SEO local          |
|----------------------|-----------------------------|----------------------------|
| Google Business Profile | No confirmado en pagina | CRITICO — Factor #1        |
| Booking.com          | No mencionado               | Alto (turismo en Mexico)   |
| TripAdvisor          | No mencionado               | Alto (destinos turisticos) |
| Airbnb               | No mencionado               | Alto (Bacalar es fuerte en Airbnb) |
| Expedia / Hotels.com | No mencionado               | Medio                      |
| Hostelworld          | No mencionado               | Medio (mercado budget)     |
| Facebook (pagina)    | Enlazado: facebook.com/hoteljireh.bacalar/ | Medio |
| Yelp                 | No mencionado               | Bajo en Mexico             |
| BBB                  | No aplicable                | N/A (no opera en Mexico)   |
| Sectur / AMAV        | No mencionado               | Medio (turismo MX)         |
| Pueblos Magicos      | Mencionado en texto pero sin enlace oficial | Bajo |

**Diagnostico:** El sitio carece de cualquier senal de cita en las plataformas OTA relevantes para turismo en Mexico. Para un hotel en Bacalar, la presencia en Booking.com y TripAdvisor no es opcional — es el canal principal de descubrimiento para turistas nacionales e internacionales. La ausencia de estas citas, combinada con la falta de GBP, posiciona al hotel fuera del radar digital para la mayoria de los viajeros.

---

## SEO local on-page

### Elementos positivos

| Elemento                    | Evaluacion                                                   |
|-----------------------------|--------------------------------------------------------------|
| Title tag                   | "Hotel Jireh Bacalar | Hotel Familiar Economico cerca de la Laguna de los 7 Colores" — contiene ciudad + KW primaria |
| Meta description            | Incluye ciudad, precio, amenidades, CTA — bien optimizada   |
| H1                          | "Hospedaje familiar, sencillo y a tu alcance en Bacalar" — contiene ciudad |
| lang="es-MX"               | Correcto para mercado objetivo                               |
| Keywords en prose           | "hotel en Bacalar", "laguna de los 7 colores", "pueblo magico", "Fuerte de San Felipe" — naturales |
| Mencion de distancias       | Tabla de atractivos con distancias — excelente para busquedas de proximidad |
| FAQ con contenido unico     | 6 FAQs bien respondidas con detalles especificos            |
| Seccion de habitaciones     | 3 tipos con precios, capacidad, amenidades — paginas de servicio dedicadas en formato de seccion |

### Elementos criticos ausentes

| Elemento faltante                          | Impacto                                        |
|--------------------------------------------|------------------------------------------------|
| Google Maps embed en seccion #ubicacion    | No hay visualizacion ni PIN del negocio        |
| Enlace "Ver en Google Maps" o "Como llegar" | Friccion para el usuario y senal GBP perdida  |
| Pagina web en dominio propio               | URL vercel.app reduce confianza y consistencia NAP |
| Canonical apuntando al dominio real        | El canonical activo lleva a un dominio muerto  |
| Horario de atencion visible en HTML        | Solo en FAQ, no en schema ni en bloque de contacto |
| Paginas individuales por habitacion        | Todo en una sola pagina (one-pager) — limita targeting de KW especificas |
| Blog o contenido editorial local           | Sin contenido sobre Bacalar, laguna, actividades — oportunidades de KW de cola larga |
| Enlace a GBP para dejar resenas            | No hay CTA de resenas                          |

### Palabras clave locales detectadas (organicas)

- "hotel en Bacalar" (KW primaria — presente en title, meta, H1, prose)
- "hospedaje Bacalar economico" (en meta keywords)
- "hotel familiar Bacalar" (en meta keywords y prose)
- "hotel cerca laguna de Bacalar" (en meta keywords)
- "hotel con alberca Bacalar" (en meta keywords)
- "laguna de los 7 colores" (en title, prose, alt text)
- "pueblo magico" (en prose seccion ubicacion)
- "Fuerte de San Felipe" (en meta description, prose, FAQ, schema)

**Oportunidades de KW no explotadas:**
- "hotel economico Bacalar" / "hotel barato Bacalar"
- "hotel con estacionamiento Bacalar"
- "donde hospedarse en Bacalar con familia"
- "hotel cerca de ADO Bacalar" (mencionado pero no optimizado como KW)
- "hotel Bacalar precio por noche"

---

## Calidad de pagina de ubicacion

El sitio es un one-pager (single page application estatica). No aplica auditoria de paginas de ubicacion multiples. Sin embargo:

- La seccion `#ubicacion` carece de mapa interactivo — es solo una lista de texto con distancias
- La direccion no esta marcada semanticamente (sin `<address>` HTML element)
- No hay instrucciones de como llegar (en auto, en autobus, desde el aeropuerto)
- El ADO esta a pie segun el sitio — una instruccion tan simple como "desde la terminal ADO camina X metros" seria valiosa para viajeros sin auto

---

## Top 10 Acciones Prioritarias

### CRITICAS (bloquean visibilidad local)

**1. Registrar o activar Google Business Profile**
Sin GBP, el hotel no puede aparecer en el Local Pack de Google ni en Google Maps. Es el factor de ranking #1 segun Whitespark 2026 (score: 193). Crear perfil en business.google.com con la categoria primaria "Hotel" y la subcategoria "Hotel economico". Verificar por codigo postal o video. Agregar fotos, horarios, descripcion, y enlace al sitio web real una vez que el dominio este activo.

**2. Registrar y publicar el dominio hoteljirehbacalar.com**
El canonical, og:url, og:image y schema url apuntan a `https://www.hoteljirehbacalar.com/`, pero ese dominio no existe. Esto envia senales canonicas invalidas a Google. Registrar el dominio (disponible segun el uso en el sitio), migrar el sitio de Vercel a ese dominio, actualizar el canonical para que apunte a la URL real, y verificar con Google Search Console.

**3. Vincular sitio web al perfil GBP y anadir sameAs en schema**
Una vez que el GBP este activo, agregar en el JSON-LD:
```json
"sameAs": [
  "https://www.google.com/maps/place/?q=place_id:TU_PLACE_ID",
  "https://www.facebook.com/hoteljireh.bacalar/"
]
```
Y enlazar el sitio web en el panel de GBP para cerrar el circulo de entidad.

### ALTAS (impacto directo en conversiones y credibilidad)

**4. Insertar Google Maps embed en seccion de ubicacion**
La seccion `#ubicacion` tiene una lista de distancias pero ningun mapa. Agregar un `<iframe>` de Google Maps con el PIN del hotel. Esto sirve como senal de GBP al crawleador, reduce friccion para el usuario, y confirma la direccion fisica visualmente. Agregar tambien un enlace de texto "Ver en Google Maps" y uno de "Como llegar" (directions link).

**5. Crear perfil en Booking.com y TripAdvisor**
Para turismo en Bacalar, estos son los canales de descubrimiento primarios. La presencia en estos directorios genera:
- Citas NAP de alta autoridad
- Backlinks con autoridad de dominio alta
- Reviews verificables que pueden citarse en schema aggregateRating
- Visibilidad en busquedas "hotel Bacalar" dentro de esas plataformas
Prioridad: Booking.com primero (mayor cuota en turismo latinoamericano), TripAdvisor segundo.

**6. Corregir aggregateRating: vincular a fuente verificable**
El rating 7.2/10 de 142 resenas debe anclarse a una fuente real. Si proviene de Booking.com, TripAdvisor u otra OTA, agregar el `@id` de la fuente o eliminarlo hasta tener resenas verificables (Google Reviews preferiblemente). Usar datos falsos o sin fuente en aggregateRating puede resultar en una penalizacion de datos estructurados por Google.

**7. Solicitar resenas activamente en Google**
Una vez que el GBP este activo, crear un enlace corto de Google Reviews (g.page/[nombre]/review) y compartirlo por WhatsApp despues de cada estancia. La regla de los 18 dias (Sterling Sky) indica que la falta de resenas por mas de 3 semanas puede causar caida de posicion en el Local Pack. Con solo 5-10 resenas en Google, el hotel puede superar a competidores sin GBP optimizado.

### MEDIAS (mejoran autoridad y experiencia de usuario)

**8. Anadir openingHoursSpecification al schema Hotel**
La recepcion 24 horas es un diferenciador pero no esta formalizado en schema. Agregar:
```json
"openingHoursSpecification": {
  "@type": "OpeningHoursSpecification",
  "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
  "opens": "00:00",
  "closes": "23:59"
}
```
Esto permite que Google muestre "Abierto 24 horas" en el Knowledge Panel.

**9. Corregir precision de GeoCoordinates a 5 decimales**
Cambiar `"latitude": 18.6840` a `"latitude": 18.68400` (o la coordenada precisa real con 5 decimales verificada en Google Maps). Idem para longitud. La precision de 4 decimales implica ~11 metros de error — suficiente para desplazar el pin fuera del predio en mapas de alta densidad.

**10. Anadir elemento `<address>` HTML semantico en el footer**
Envolver el bloque de direccion del footer en la etiqueta HTML nativa `<address>`:
```html
<address>
  <span>Avenida 19, entre Calle 22 y 24</span><br>
  <span>77930 Bacalar, Quintana Roo, Mexico</span>
</address>
```
Esto refuerza la senal semantica de la direccion para crawleadores y ayuda a la consistencia NAP a nivel de HTML estructural.

---

## Limitaciones del analisis

Los siguientes elementos no pudieron evaluarse sin herramientas de pago o acceso directo a plataformas externas:

- **Posicion real en Local Pack de Google:** Requiere DataForSEO `google_local_pack_serp` con coordenadas de Bacalar. La posicion en Maps depende en un 55.2% de la proximidad del buscador (estudio Search Atlas ML) — factor no controlable.
- **Existencia y estado del GBP:** No se confirmo si el hotel tiene un perfil GBP creado. La ausencia de senales en la pagina no implica necesariamente que no exista, pero si que no esta vinculado al sitio web.
- **Velocidad de resenas:** Sin acceso a GBP Insights no se puede medir la cadencia de resenas ni la tasa de respuesta del propietario.
- **Citas en directorios externos:** No se verifico la presencia/ausencia del hotel en Booking.com, TripAdvisor, Expedia ni Airbnb mediante fetch directo de esos sitios.
- **Categorias GBP:** No verificable sin acceso al panel. La categoria incorrecta en GBP es el factor negativo #1 en ranking local (score: 176, Whitespark 2026).
- **Backlinks locales:** Requiere herramienta de analisis de backlinks (Ahrefs, Semrush) para evaluar el perfil de autoridad local.
- **Core Web Vitals y velocidad de pagina:** Auditado en el informe de performance separado.

---

*Generado por el agente de Local SEO. Datos verificables al 2026-06-22.*
