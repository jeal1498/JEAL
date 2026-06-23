# Psic. Noemi Eb. — Psicoterapeuta en Cancún · Claude Instructions

## Contexto del Producto

**Propósito:** Sitio web clínico para Psic. Noemi Eb., psicoterapeuta con enfoque cognitivo conductual en Cancún. Convierte personas con ansiedad, depresión o estrés en consultas agendadas estableciendo credibilidad profesional y claridad sobre el proceso TCC.

**Usuario objetivo:** Adultos de 25–45 años con ansiedad o depresión que no lograron mejorar solos, y padres de adolescentes (13–18 años) que detectan señales de alerta. Llegan con dudas sobre si la terapia funciona y si vale la pena el costo. La pregunta real: *"¿puedo confiarle mi bienestar mental a esta persona?"*

**La respuesta correcta:** Proceso TCC explicado en pasos concretos, especialidades claras (adultos + adolescentes + ansiedad/depresión), primer contacto sin barreras por WhatsApp.

## Stack Técnico

- **Framework:** Next.js 14 (Pages Router) + React 18 + TypeScript
- **Styling:** Tailwind CSS v3 + CSS custom properties
- **UI:** shadcn/ui (Radix primitives) + `class-variance-authority` + `tailwind-merge`
- **Animaciones:** Framer Motion 12 — con soporte obligatorio de `prefers-reduced-motion`
- **Iconos:** Lucide React
- **SEO:** `lib/seo.ts` — `applySeo()` y `injectSchema()` gestionan meta tags y JSON-LD por ruta
- **Contacto:** `lib/contact.ts` — `WA_NUMBER`, `PHONE_NUMBER`, `waUrl()` son la única fuente de verdad
- **Identidad:** `lib/site.ts` — `SPECIALIST_IMAGE`, `ADDRESS`, `GEO`, `HOURS`, `REVIEWS` son la SSOT

## Estructura de Páginas

| Ruta | Propósito |
|------|-----------|
| `/` | Landing principal — hero, servicios, proceso TCC, sobre Noemi, trust section, FAQ, ubicación |
| `/terapia-individual-cancun` | Servicio: TCC para adultos (+18) |
| `/terapia-adolescentes-cancun` | Servicio: terapia para adolescentes (13–18) |
| `/terapia-ansiedad-depresion-cancun` | Servicio: ansiedad y depresión |
| `/psicologo-cancun` | SEO local — psicóloga en Cancún |
| `/blog/*` | 5 artículos SEO sobre TCC, ansiedad, depresión y adolescentes |

## Componentes Activos

| Componente | Función |
|------------|---------|
| `Navbar.tsx` | Sticky, backdrop-blur, se opaca al scroll. Logo: "Psic. Noemi Eb." |
| `Footer.tsx` | Fondo `#0d3333`. Solo Facebook (no Instagram/TikTok) |
| `FloatingButtons.tsx` | CTAs flotantes WhatsApp + teléfono (solo mobile) |
| `BlogLayout.tsx` | Layout compartido para artículos del blog |
| `ReadingProgressBar.tsx` | Barra de progreso de lectura (usada por BlogLayout) |
| `TableOfContents.tsx` | Tabla de contenidos sticky en artículos de blog |

## Paleta de Color

- **Primario:** `#1a4a4a` (Deep Teal) — el único color saturado
- **Hero/Footer:** `#0d3333`
- **Texto secundario:** `#517171`
- **Acento:** `#2d7070`
- **Sage mint (TCC adultos):** tarjeta con fondo `#d0e7d4`
- **Sky blue (ansiedad):** tarjeta con fondo `#c5ddf0`
- **Warm amber (adolescentes):** tarjeta con fondo `#f5e4c5`

Los acentos son solo fondos de tarjeta — nunca texto sobre blanco.

## Pendientes (completar con datos reales de Noemi)

- `lib/site.ts`: Reemplazar `[DIRECCIÓN_PENDIENTE]` con dirección real del consultorio
- `lib/site.ts`: Reemplazar `[CÉDULA_PENDIENTE]` con número de cédula profesional
- `lib/site.ts`: Actualizar `GEO` con coordenadas exactas del consultorio
- `lib/site.ts`: Actualizar `REVIEWS` cuando tenga reseñas en Google
- `public/Psicologa_Noemi_Eb.webp`: Reemplazar con foto real de Noemi (actualmente es placeholder)
- `public/blog/*.svg`: Las imágenes SVG del blog son de Karen — crear nuevas para Noemi
- `_document.tsx`: Actualizar `hasCredential` cuando se tenga la cédula

## Reglas de Código

**Antes de modificar:**
- Datos de contacto → solo editar `lib/contact.ts`
- Meta SEO → solo a través de `applySeo()` en `lib/seo.ts`
- Dirección, geo, horarios → solo en `lib/site.ts`

**Al agregar una página:**
1. Llamar `applySeo()` al montar con canonical correcto
2. Llamar `injectSchema()` con JSON-LD apropiado (MedicalBusiness, FAQPage, etc.)
3. Limpiar en el return del `useEffect`

**Al agregar animaciones con Framer Motion:**
- Siempre envolver con `useReducedMotion()` o condicionar con variante sin animación
- Duraciones entre 220–380ms; easing `ease-out` preferido

## Lessons Learned (heredadas del proyecto Karen)

### 1. Verificación visual sin navegador
Las herramientas Playwright fallan en este entorno remoto. Verificar con `next dev` + `curl` al HTML SSR.

### 2. `tsconfig.tsbuildinfo` está versionado
No descartar — incluirlo en commits después de correr `tsc`/`next build`.

### 3. og:image de blog → imagen del artículo, no foto del especialista
Cada artículo de blog debe tener `og:image` apuntando a su imagen hero (`/blog/[slug]-1200x675.svg`), no a `SPECIALIST_IMAGE`.

### 4. Componentes de Karen eliminados
`Hero.tsx`, `AboutSection.tsx`, `ServicesSection.tsx`, `TestimonialsSection.tsx`, `FAQSection.tsx`, `SymptomChecker.tsx`, `SymptomCheckerHome.tsx`, `LocationSection.tsx` fueron eliminados. Todas las secciones de las páginas están inline en cada página respectiva.
