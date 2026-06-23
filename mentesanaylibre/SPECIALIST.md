# Psic. Noemi Eb. — Psicoterapeuta en Cancún · Briefing de Producto

## Contexto del Producto
Sitio web clínico para Noemi Eb., psicoterapeuta con enfoque cognitivo conductual en Cancún. Convierte adultos con ansiedad o depresión y padres de adolescentes en consultas agendadas, estableciendo credibilidad clínica (TCC basada en evidencia) y calidez profesional simultáneamente.

## Buyer Persona

**Perfil principal:** Mujer de 28–42 años, empleada o profesionista en Cancún (turismo, servicios, negocio propio). Funciona "bien" en el exterior pero carga internamente con ansiedad, tristeza o agotamiento que ya no puede ignorar.

**Detonador:** Episodio de ansiedad aguda, semanas seguidas sin energía, crisis de pareja, o reconocer que "llevar esto sola ya no está funcionando".

**Historia previa:** Meditación en YouTube, podcasts de bienestar, hablar con amigos o pareja, yoga, "echarle más ganas". Funciona unos días y el ciclo regresa.

**Miedo principal:** "¿Y si estoy peor de lo que creo? ¿Va a ser caro y largo? ¿La terapia de verdad sirve para algo concreto?"

**La pregunta real del sitio:** "¿Esta psicóloga realmente me puede ayudar a sentirme mejor, o voy a pagar por desahogarme sin resultados?"

**Perfil secundario:** Padre o madre de adolescente de 13–18 años con aislamiento, ansiedad escolar, agresividad o caída en rendimiento. Trigger: orientador escolar o pediatra recomienda apoyo. Miedo: "¿Qué tan grave está mi hijo? ¿Va a querer ir?"

## Servicios

### Terapia Cognitivo Conductual — Adultos
- **Problema que resuelve:** Ansiedad, depresión, estrés o pensamientos que no pueden parar
- **Transformación:** Días en piloto automático ansioso → Herramientas concretas para romper el ciclo
- **Diferenciador:** La TCC es la terapia con más evidencia científica para ansiedad y depresión — el trabajo es en el presente, con herramientas que sigues usando sola al terminar
- **Proceso:** Evaluación inicial → Establecer metas medibles → Sesiones semanales (TCC activa) → Práctica entre sesiones → Alta con plan de mantenimiento
- **Entregable:** Plan personalizado de herramientas cognitivo conductuales para aplicar de forma autónoma
- **Instrumentos:** BAI, BDI-II, registro de pensamientos automáticos, reestructuración cognitiva, exposición gradual, activación conductual
- **Precio / Duración:** $800–$1,200 MXN / sesión de 50 min

### Terapia para Adolescentes
- **Problema que resuelve:** Adolescente con ansiedad escolar, aislamiento, agresividad o bajo rendimiento
- **Transformación:** Conflicto familiar constante → Comunicación mejorada y herramientas de manejo emocional
- **Diferenciador:** Incluye trabajo con padres — los cambios se sostienen en casa, no solo en el consultorio
- **Proceso:** Sesión inicial con padres → Sesión individual con adolescente → Metas compartidas → Sesiones semanales → Check-in con padres cada 4–6 semanas
- **Entregable:** Guía de comunicación familiar + herramientas específicas para el adolescente
- **Instrumentos:** BDI-Y, MASC, regulación emocional, habilidades sociales, TCC adaptada a adolescentes
- **Precio / Duración:** $800–$1,200 MXN / sesión de 50 min

### Terapia para Ansiedad y Depresión
- **Problema que resuelve:** Crisis de pánico, pensamientos catastróficos, días sin poder salir de la cama
- **Transformación:** Ansiedad o depresión que paraliza → Entender los ciclos y romperlos con técnicas específicas
- **Diferenciador:** La TCC tiene 500+ estudios que la avalan — no es "hablar del pasado indefinidamente": es aprender cómo funciona tu mente y cambiarla
- **Proceso:** Evaluación → Psicoeducación → Regulación fisiológica → Reestructuración cognitiva → Exposición gradual o activación conductual → Plan de prevención de recaída
- **Entregable:** Plan de prevención de recaída + registro de herramientas que funcionaron
- **Instrumentos:** BAI, BDI-II, exposición gradual, relajación muscular progresiva, mindfulness cognitivo, diario de pensamientos
- **Precio / Duración:** $800–$1,200 MXN / sesión de 50 min

## La Respuesta Correcta a la Pregunta Real
La TCC es la terapia con mayor evidencia científica para ansiedad y depresión. El sitio responde eso con: enfoque explicado paso a paso, instrumentos nombrados, proceso visible, y CTAs en lenguaje del paciente ("Quiero dejar de sentirme así"), no del especialista.

## Stack Técnico
Next.js 14 (Pages Router) · TypeScript · Tailwind CSS v3 · shadcn/ui · Framer Motion · Lucide React

## Estructura de Páginas
| Ruta | Propósito |
|------|-----------|
| `/` | Landing principal |
| `/terapia-individual-cancun` | TCC para adultos |
| `/terapia-adolescentes-cancun` | TCC para adolescentes |
| `/terapia-ansiedad-depresion-cancun` | Ansiedad y depresión |
| `/psicologo-cancun` | SEO local |
| `/blog` | Blog index |
| `/blog/precio-terapia-psicologica-cancun` | Artículo precio |
| `/blog/senales-ansiedad-necesita-atencion` | Artículo señales de ansiedad |
| `/blog/que-es-terapia-cognitivo-conductual` | Artículo qué es TCC |
| `/blog/adolescente-necesita-psicologo-senales` | Artículo adolescentes |
| `/blog/depresion-vs-tristeza-diferencias` | Artículo depresión vs tristeza |

## Paleta de Color
- **Primary (Deep Teal):** `#1a4a4a` → HSL 180 48% 20%
- **Primary Light:** `#2d7070` → HSL 180 44% 31%
- **Primary Dark (hero bg):** `#0d3333` → HSL 180 52% 13%
- **Accent Sage** (TCC individual): `hsl(150 35% 83%)` — verde salvia suave
- **Accent Sky** (ansiedad/depresión): `hsl(200 50% 87%)` — azul cielo suave
- **Accent Sand** (adolescentes): `hsl(30 53% 90%)` — ámbar cálido

## Principios de Diseño
1. **Claridad sobre ornamento** — El buyer persona está ansioso. Layout limpio, sin ruido visual.
2. **Evidencia sobre aspiración** — Nombrar la TCC, sus instrumentos, su base científica. No promesas vagas.
3. **El proceso calma** — Mostrar los pasos reduce el miedo a "no saber qué esperar".
4. **Lenguaje del paciente** — Copy en primera persona del buyer persona: "Quiero dejar de sentirme así".
5. **Calidez a través de la especificidad** — No imágenes cálidas genéricas: respuestas concretas.

## Anti-referencias
- Wellness blogs con tipografía delgada y frases aspiracionales vagas
- Clínicas hospitalarias frías con azul corporativo
- Apps de meditación (tono etéreo, naturaleza, "encuentra tu paz")
- Psicólogos genéricos sin especialidad clara ni enfoque definido
