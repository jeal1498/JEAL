import { useState, useEffect, useRef, type ReactNode } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import {
  MessageCircle, Phone, ChevronDown, AlertTriangle,
  ArrowRight, Brain, Heart, Activity, Zap,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { applySeo, injectSchema } from '@/lib/seo';
import { SITE_URL, SPECIALIST_IMAGE, SPECIALIST_NAME, SPECIALIST_FULL, ADDRESS, GEO, HOURS } from '@/lib/site';
import { PHONE_E164, waUrl, SOCIAL_PROFILES } from '@/lib/contact';

/* ═══════════════════════════════════════════════════════════════
   UTILITY — SectionReveal
   ═══════════════════════════════════════════════════════════════ */

function SectionReveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setRevealed(true); return; }
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setRevealed(true); observer.unobserve(el); } },
      { rootMargin: '0px 0px 60px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={revealed ? { animation: `fadeInUp 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}s both` } : { opacity: 0 }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════ */

const ansiedadSymptoms = [
  'Preocupación constante que cuesta detener',
  'Pecho apretado o tensión física sin causa clara',
  'Anticipar siempre lo peor aunque no tenga evidencia',
  'Evitar situaciones para no sentir la ansiedad',
  'Dificultad para dormir por los pensamientos',
  'Irritabilidad o sensación de estar siempre "al límite"',
];

const depresionSymptoms = [
  'Agotamiento que no mejora con descanso',
  'Pérdida de interés en lo que antes disfrutabas',
  'Días que se sienten "grises" sin razón aparente',
  'Pensamientos negativos persistentes sobre ti mismo/a',
  'Dificultad para concentrarte o tomar decisiones simples',
  'Sentir que eres una carga para los demás',
];

const faqItems = [
  {
    q: '¿La TCC funciona para ansiedad crónica?',
    a: 'Sí. La TCC es el tratamiento con mayor evidencia científica para ansiedad crónica, incluyendo TAG (Trastorno de Ansiedad Generalizada), ataques de pánico y ansiedad social. A diferencia de otros enfoques, enseña herramientas para el largo plazo: no solo cómo manejar la ansiedad en el momento, sino cómo cambiar los patrones de pensamiento que la alimentan.',
  },
  {
    q: '¿Cuántas sesiones necesito para ver resultados?',
    a: 'Los primeros cambios suelen notarse entre las sesiones 4 y 8. Para ansiedad o depresión moderada, un proceso completo toma entre 12 y 20 sesiones. Esto no es indefinido: hay metas concretas y evaluación del progreso en cada sesión. Si después de 8 sesiones no hay avance visible, revisamos el plan.',
  },
  {
    q: '¿TCC vs medicación para ansiedad y depresión?',
    a: 'No son excluyentes. La TCC y la medicación son los dos tratamientos con más evidencia para ansiedad y depresión. En casos moderados, la TCC sola puede ser suficiente. En casos graves o con síntomas físicos intensos, la combinación es lo más efectivo. Si ya estás tomando medicación, la TCC es completamente compatible y refuerza los resultados.',
  },
  {
    q: '¿Qué es una crisis de ansiedad y cómo se trabaja en TCC?',
    a: 'Una crisis de ansiedad (o ataque de pánico) es una descarga intensa de síntomas físicos y cognitivos: palpitaciones, sensación de ahogo, miedo a "volverse loco" o a morir. En TCC, se trabaja desde dos ángulos: las técnicas de regulación inmediata (respiración diafragmática, anclaje sensorial) para el momento de la crisis, y la reestructuración cognitiva para cambiar las interpretaciones catastrofistas que la mantienen.',
  },
  {
    q: '¿La depresión tiene cura?',
    a: 'La depresión es un estado que responde al tratamiento. Con TCC, la mayoría de las personas con depresión moderada logran una remisión significativa de síntomas. "Cura" no es el término más preciso — lo que se logra es aprender a reconocer los patrones, interrumpirlos temprano y prevenir recaídas. Muchas personas viven sin episodios recurrentes después de un proceso de TCC bien trabajado.',
  },
  {
    q: '¿Puedo tener ansiedad Y depresión al mismo tiempo?',
    a: 'Sí, y es más común de lo que se piensa. Se llama comorbilidad ansiedad-depresión y aparece en un 60-70% de los casos de depresión. La TCC trabaja ambos de forma integrada: los mismos patrones de pensamiento (rumia, catastrofismo, evitación) alimentan tanto la ansiedad como la depresión, y las técnicas abordan los dos.',
  },
];

const processSteps = [
  {
    n: '01',
    title: 'Evaluación inicial',
    subtitle: '(primera sesión)',
    desc: 'Historia clínica, evaluación de síntomas con BAI (ansiedad) y BDI-II (depresión). Identificamos qué está pasando y qué tan intenso es.',
    duration: '50 min',
  },
  {
    n: '02',
    title: 'Psicoeducación',
    subtitle: '',
    desc: 'Entiendes cómo funciona el ciclo de tu ansiedad o depresión específica. Cuáles son tus detonantes, qué pensamientos los activan, y qué conductas los mantienen.',
    duration: '1–2 sesiones',
  },
  {
    n: '03',
    title: 'Técnicas cognitivas',
    subtitle: '',
    desc: 'Identificar y cuestionar pensamientos automáticos. Reestructuración cognitiva: cambiar la interpretación, no negar la realidad.',
    duration: '3–6 sesiones',
  },
  {
    n: '04',
    title: 'Técnicas conductuales',
    subtitle: '',
    desc: 'Exposición gradual para la ansiedad. Activación conductual para la depresión. Aplicar lo aprendido en situaciones reales.',
    duration: '3–6 sesiones',
  },
  {
    n: '05',
    title: 'Consolidación y alta',
    subtitle: '',
    desc: 'Plan de prevención de recaída, señales de alerta personalizadas, y herramientas para el largo plazo. El objetivo es que no necesites terapia continua.',
    duration: '1–2 sesiones',
  },
];

const instruments = [
  { name: 'BAI (Inventario de Ansiedad de Beck)', desc: 'Evalúa el nivel e impacto de los síntomas de ansiedad antes y durante el proceso.' },
  { name: 'BDI-II (Inventario de Depresión de Beck)', desc: 'Mide la presencia y severidad de síntomas depresivos con seguimiento a lo largo del proceso.' },
  { name: 'Exposición gradual', desc: 'Técnica de primera línea para ansiedad: afrontar las situaciones evitadas de forma progresiva y controlada.' },
  { name: 'Relajación muscular progresiva', desc: 'Para reducir la tensión física crónica asociada a la ansiedad generalizada.' },
  { name: 'Mindfulness cognitivo', desc: 'Observar los pensamientos sin fusionarse con ellos. Herramienta para prevención de recaída en depresión.' },
  { name: 'Diario de pensamientos automáticos', desc: 'Registro estructurado para identificar patrones y practicar la reestructuración cognitiva entre sesiones.' },
];

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'MedicalTherapy',
      '@id': `${SITE_URL}/terapia-ansiedad-depresion-cancun#service`,
      name: 'Terapia para Ansiedad y Depresión en Cancún — TCC',
      description: 'Terapia cognitivo conductual para ansiedad y depresión en adultos en Cancún. Aprende cómo funcionan los ciclos de ansiedad y depresión, y cómo romperlos.',
      url: `${SITE_URL}/terapia-ansiedad-depresion-cancun`,
      provider: {
        '@type': 'Person',
        name: SPECIALIST_FULL,
        image: SPECIALIST_IMAGE,
        telephone: PHONE_E164,
        address: { '@type': 'PostalAddress', ...ADDRESS },
      },
      areaServed: { '@type': 'City', name: 'Cancún', sameAs: 'https://www.wikidata.org/wiki/Q8969' },
      availableChannel: [
        { '@type': 'ServiceChannel', serviceType: 'Presencial' },
        { '@type': 'ServiceChannel', serviceType: 'En línea' },
      ],
      relevantSpecialty: 'PsychologicalTreatment',
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqItems.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Servicios', item: `${SITE_URL}/#servicios` },
        { '@type': 'ListItem', position: 3, name: 'Ansiedad y Depresión', item: `${SITE_URL}/terapia-ansiedad-depresion-cancun` },
      ],
    },
  ],
};

/* ═══════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function TerapiaAnsiedadDepresionCancun() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const cleanupSeo = applySeo({
      title: 'Terapia para Ansiedad y Depresión en Cancún | Psic. Noemi Eb.',
      description: 'TCC para ansiedad y depresión en Cancún. Aprende cómo funcionan los ciclos de ansiedad y depresión, y cómo romperlos. Psic. Noemi Eb. — agenda por WhatsApp.',
      canonical: `${SITE_URL}/terapia-ansiedad-depresion-cancun`,
    });
    const cleanupSchema = injectSchema('schema-ansiedad-depresion', schema);
    return () => { cleanupSeo(); cleanupSchema(); };
  }, []);

  return (
    <>
      <Head>
        <title>Terapia para Ansiedad y Depresión en Cancún | Psic. Noemi Eb.</title>
        <meta name="description" content="TCC para ansiedad y depresión en Cancún. Aprende cómo funcionan los ciclos de ansiedad y depresión, y cómo romperlos. Psic. Noemi Eb. — agenda por WhatsApp." />
        <link rel="canonical" href={`${SITE_URL}/terapia-ansiedad-depresion-cancun`} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="es_MX" />
        <meta property="og:title" content="Terapia para Ansiedad y Depresión en Cancún | Psic. Noemi Eb." />
        <meta property="og:description" content="TCC para ansiedad y depresión en Cancún. Aprende cómo funcionan los ciclos y cómo romperlos." />
        <meta property="og:url" content={`${SITE_URL}/terapia-ansiedad-depresion-cancun`} />
        <meta property="og:image" content={SPECIALIST_IMAGE} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Terapia para Ansiedad y Depresión en Cancún | Psic. Noemi Eb." />
        <meta name="twitter:description" content="TCC para ansiedad y depresión en Cancún. Agenda por WhatsApp." />
        <meta name="twitter:image" content={SPECIALIST_IMAGE} />
        <meta name="geo.region" content="MX-ROO" />
        <meta name="geo.placename" content="Cancún, Quintana Roo" />
        <meta name="geo.position" content={`${GEO.latitude};${GEO.longitude}`} />
      </Head>

      <div className="antialiased w-full min-w-0 overflow-x-hidden" style={{ color: '#1a4a4a', background: '#fff' }}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold focus:text-sm focus:text-white" style={{ background: '#1a4a4a' }}>
          Saltar al contenido principal
        </a>
        <Navbar />

        <main id="main-content" className="w-full min-w-0 overflow-x-hidden">

          {/* ══════════════════════════════════════════════════════
              HERO
              ══════════════════════════════════════════════════════ */}
          <section
            aria-labelledby="hero-heading"
            className="relative flex flex-col justify-center overflow-hidden"
            style={{ background: '#0d3333', paddingTop: '72px', minHeight: '70vh' }}
          >
            <div aria-hidden="true" className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(45,112,112,0.12) 0%, transparent 70%)' }} />
            <div aria-hidden="true" className="absolute bottom-0 left-0 w-[320px] h-[320px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(26,74,74,0.2) 0%, transparent 70%)' }} />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 w-full py-16 sm:py-20 relative z-10">
              {/* Breadcrumb */}
              <nav aria-label="Migas de pan" className="mb-6">
                <ol className="flex flex-wrap items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <li><Link href="/" className="hover:text-white transition-colors">Inicio</Link></li>
                  <li aria-hidden="true">/</li>
                  <li><Link href="/#servicios" className="hover:text-white transition-colors">Servicios</Link></li>
                  <li aria-hidden="true">/</li>
                  <li style={{ color: 'rgba(255,255,255,0.8)' }}>Ansiedad y Depresión</li>
                </ol>
              </nav>

              {/* Badge */}
              <span
                className="inline-block text-[11px] font-bold tracking-widest uppercase rounded-full px-3 py-1.5 mb-5"
                style={{ background: 'rgba(45,112,112,0.4)', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(45,112,112,0.5)' }}
              >
                Ansiedad · Depresión · TCC
              </span>

              <h1 id="hero-heading" className="font-serif font-bold text-white leading-tight mb-4" style={{ fontSize: 'clamp(2rem,5vw,3.2rem)' }}>
                Terapia para Ansiedad y<br />Depresión en Cancún
              </h1>

              <p className="font-serif italic mb-5" style={{ fontSize: 'clamp(1.1rem,2.5vw,1.4rem)', color: 'rgba(255,255,255,0.7)' }}>
                Entender cómo funciona tu mente — y cambiarla
              </p>

              <p className="text-sm leading-relaxed mb-8 max-w-[58ch]" style={{ color: 'rgba(255,255,255,0.75)', lineHeight: '1.8' }}>
                La ansiedad y la depresión tienen ciclos. Aprenderlos es el primer paso para romperlos.
                La terapia cognitivo conductual (TCC) es el modelo con más evidencia científica para exactamente esto.
                No es sobre pensar positivo — es sobre entender cómo funciona tu mente y qué hacer al respecto.
              </p>

              <div className="flex flex-wrap gap-3">
                <a
                  href={waUrl('Hola Psic. Noemi, estoy buscando ayuda con ansiedad/depresión. ¿Podemos agendar?')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-bold text-sm px-6 py-3.5 rounded-xl text-white transition-all hover:-translate-y-0.5 hover:brightness-110"
                  style={{ background: '#25d366' }}
                  aria-label="Agendar cita por WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" aria-hidden="true" />
                  Agendar por WhatsApp
                </a>
                <a
                  href="#sintomas"
                  onClick={(e) => { e.preventDefault(); document.getElementById('sintomas')?.scrollIntoView({ behavior: 'smooth' }); }}
                  className="inline-flex items-center gap-2 font-semibold text-sm px-6 py-3.5 rounded-xl transition-all hover:bg-white/10"
                  style={{ color: 'rgba(255,255,255,0.88)', border: '1.5px solid rgba(255,255,255,0.32)' }}
                >
                  Reconoce las señales
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          </section>


          {/* ══════════════════════════════════════════════════════
              SYMPTOM RECOGNITION
              ══════════════════════════════════════════════════════ */}
          <section id="sintomas" aria-labelledby="sintomas-heading" className="py-16 sm:py-20 scroll-mt-20" style={{ background: '#f8fafa' }}>
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
              <SectionReveal>
                <p className="text-[10px] font-bold uppercase tracking-widest text-center mb-2" style={{ color: '#2d7070' }}>¿Reconoces estas señales?</p>
                <h2 id="sintomas-heading" className="font-serif font-bold text-center leading-tight mb-3" style={{ fontSize: 'clamp(1.7rem,4vw,2.4rem)', color: '#1a4a4a' }}>
                  Ansiedad vs depresión — cómo se sienten
                </h2>
                <div className="w-10 h-0.5 rounded-full mx-auto mb-4" style={{ background: '#2d7070' }} />
                <p className="text-sm text-center max-w-[50ch] mx-auto mb-10" style={{ color: '#517171' }}>
                  Si llevas más de 2 semanas con 3 o más de estas señales, vale la pena hablar.
                </p>
              </SectionReveal>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Ansiedad */}
                <SectionReveal delay={0.05}>
                  <div className="rounded-2xl p-6 h-full" style={{ background: 'white', border: '1.5px solid rgba(45,112,112,0.2)' }}>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="flex items-center justify-center rounded-xl shrink-0" style={{ width: '42px', height: '42px', background: 'rgba(45,112,112,0.12)' }}>
                        <Zap className="w-5 h-5" style={{ color: '#2d7070' }} aria-hidden="true" />
                      </div>
                      <h3 className="font-bold text-base" style={{ color: '#1a4a4a' }}>Señales de ansiedad</h3>
                    </div>
                    <ul className="space-y-2.5">
                      {ansiedadSymptoms.map((s, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <div className="flex items-center justify-center shrink-0 rounded-full mt-0.5" style={{ width: '18px', height: '18px', background: 'rgba(45,112,112,0.12)' }}>
                            <svg viewBox="0 0 12 12" fill="none" stroke="#2d7070" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '10px', height: '10px' }} aria-hidden="true">
                              <polyline points="2,6 5,9 10,3" />
                            </svg>
                          </div>
                          <span className="text-sm" style={{ color: '#517171' }}>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </SectionReveal>

                {/* Depresión */}
                <SectionReveal delay={0.1}>
                  <div className="rounded-2xl p-6 h-full" style={{ background: 'white', border: '1.5px solid rgba(26,74,74,0.15)' }}>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="flex items-center justify-center rounded-xl shrink-0" style={{ width: '42px', height: '42px', background: 'rgba(26,74,74,0.1)' }}>
                        <Heart className="w-5 h-5" style={{ color: '#1a4a4a' }} aria-hidden="true" />
                      </div>
                      <h3 className="font-bold text-base" style={{ color: '#1a4a4a' }}>Señales de depresión</h3>
                    </div>
                    <ul className="space-y-2.5">
                      {depresionSymptoms.map((s, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <div className="flex items-center justify-center shrink-0 rounded-full mt-0.5" style={{ width: '18px', height: '18px', background: 'rgba(26,74,74,0.1)' }}>
                            <svg viewBox="0 0 12 12" fill="none" stroke="#1a4a4a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '10px', height: '10px' }} aria-hidden="true">
                              <polyline points="2,6 5,9 10,3" />
                            </svg>
                          </div>
                          <span className="text-sm" style={{ color: '#517171' }}>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </SectionReveal>
              </div>
            </div>
          </section>


          {/* ══════════════════════════════════════════════════════
              MODELO COGNITIVO — psicoeducación
              ══════════════════════════════════════════════════════ */}
          <section aria-labelledby="model-heading" className="py-16 sm:py-20 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              <SectionReveal>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#2d7070' }}>Cómo funciona</p>
                <h2 id="model-heading" className="font-serif font-bold leading-tight mb-4" style={{ fontSize: 'clamp(1.7rem,4vw,2.4rem)', color: '#1a4a4a' }}>
                  El ciclo que mantiene la ansiedad y la depresión
                </h2>
                <div className="w-10 h-0.5 rounded-full mb-6" style={{ background: '#2d7070' }} />
                <p className="text-sm leading-relaxed mb-10 max-w-[58ch]" style={{ color: '#517171', lineHeight: '1.8' }}>
                  La TCC interrumpe los ciclos que mantienen la ansiedad y la depresión. No es sobre la infancia ni sobre entenderte a ti mismo. Es sobre cambiar patrones concretos ahora.
                </p>
              </SectionReveal>

              {/* Cognitive model cycle */}
              <SectionReveal delay={0.1}>
                <div className="relative">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
                    {[
                      { label: 'Situación', example: 'Una reunión importante, una notificación, una crítica', icon: Activity, color: '#1a4a4a' },
                      { label: 'Pensamiento automático', example: '"Va a salir mal", "soy un fracaso", "no puedo"', icon: Brain, color: '#2d7070' },
                      { label: 'Emoción', example: 'Ansiedad, tristeza, vergüenza, miedo', icon: Heart, color: '#517171' },
                      { label: 'Conducta', example: 'Evitar, procrastinar, aislarse, atacar', icon: Zap, color: '#1a4a4a' },
                    ].map((node, i, arr) => (
                      <div key={node.label} className="flex items-center gap-1 sm:gap-0">
                        <div
                          className="flex-1 flex flex-col items-center text-center rounded-2xl p-4"
                          style={{ background: `${node.color}08`, border: `1.5px solid ${node.color}20` }}
                        >
                          <node.icon className="w-5 h-5 mb-2" style={{ color: node.color }} aria-hidden="true" />
                          <p className="font-bold text-sm mb-1.5" style={{ color: node.color }}>{node.label}</p>
                          <p className="text-xs italic" style={{ color: '#517171', lineHeight: '1.5' }}>{node.example}</p>
                        </div>
                        {i < arr.length - 1 && (
                          <ArrowRight className="w-4 h-4 shrink-0 mx-1 hidden sm:block" style={{ color: '#2d7070', opacity: 0.5 }} aria-hidden="true" />
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-center text-sm mt-6 font-medium" style={{ color: '#2d7070' }}>
                    La conducta regresa a la situación — y el ciclo se repite. La TCC interrumpe este loop.
                  </p>
                </div>
              </SectionReveal>
            </div>
          </section>


          {/* ══════════════════════════════════════════════════════
              PROCESO — 5 pasos
              ══════════════════════════════════════════════════════ */}
          <section id="proceso" aria-labelledby="proceso-heading" className="py-16 sm:py-20 scroll-mt-20" style={{ background: '#f8fafa' }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              <SectionReveal>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#2d7070' }}>Paso a paso</p>
                <h2 id="proceso-heading" className="font-serif font-bold leading-tight mb-4" style={{ fontSize: 'clamp(1.7rem,4vw,2.4rem)', color: '#1a4a4a' }}>
                  El proceso terapéutico
                </h2>
                <div className="w-10 h-0.5 rounded-full mb-10" style={{ background: '#2d7070' }} />
              </SectionReveal>

              <div className="flex flex-col" style={{ gap: 0 }}>
                {processSteps.map((step, i, arr) => (
                  <SectionReveal key={step.n} delay={i * 0.08}>
                    <div className="grid" style={{ gridTemplateColumns: '68px 1fr', gap: '1.5rem', paddingBottom: i < arr.length - 1 ? '2.5rem' : 0 }}>
                      <div style={{ position: 'relative' }}>
                        <div className="font-serif leading-none" style={{ fontSize: '2.8rem', color: 'rgba(45,112,112,0.3)', lineHeight: '1' }}>{step.n}</div>
                        {i < arr.length - 1 && (
                          <div style={{ position: 'absolute', left: '32px', top: '52px', bottom: '-2rem', width: '1px', background: 'linear-gradient(to bottom, rgba(45,112,112,0.35), transparent)' }} />
                        )}
                      </div>
                      <div style={{ paddingTop: '0.2rem' }}>
                        <h3 className="font-bold mb-1" style={{ fontSize: '1.05rem', color: '#1a4a4a' }}>
                          {step.title}
                          {step.subtitle && <span className="font-normal text-sm ml-1.5" style={{ color: '#517171' }}>{step.subtitle}</span>}
                        </h3>
                        <p className="text-sm leading-relaxed" style={{ color: '#517171', lineHeight: '1.75' }}>{step.desc}</p>
                        {step.duration && (
                          <span className="inline-block text-xs font-semibold rounded-full mt-2.5 px-3 py-1" style={{ color: '#2d7070', background: 'rgba(45,112,112,0.1)', border: '1px solid rgba(45,112,112,0.2)' }}>
                            {step.duration}
                          </span>
                        )}
                      </div>
                    </div>
                  </SectionReveal>
                ))}
              </div>
            </div>
          </section>


          {/* ══════════════════════════════════════════════════════
              INSTRUMENTOS
              ══════════════════════════════════════════════════════ */}
          <section aria-labelledby="instruments-heading" className="py-16 sm:py-20 bg-white">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
              <SectionReveal>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#2d7070' }}>Herramientas</p>
                <h2 id="instruments-heading" className="font-serif font-bold leading-tight mb-4" style={{ fontSize: 'clamp(1.7rem,4vw,2.4rem)', color: '#1a4a4a' }}>
                  Técnicas e instrumentos utilizados
                </h2>
                <div className="w-10 h-0.5 rounded-full mb-10" style={{ background: '#2d7070' }} />
              </SectionReveal>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {instruments.map((item, i) => (
                  <SectionReveal key={i} delay={i * 0.06}>
                    <div className="rounded-2xl p-5 h-full" style={{ background: '#f8fafa', border: '1px solid rgba(26,74,74,0.1)', boxShadow: '0 2px 8px rgba(26,74,74,0.04)' }}>
                      <h3 className="font-bold text-sm mb-2" style={{ color: '#1a4a4a' }}>{item.name}</h3>
                      <p className="text-xs leading-relaxed" style={{ color: '#517171', lineHeight: '1.7' }}>{item.desc}</p>
                    </div>
                  </SectionReveal>
                ))}
              </div>
            </div>
          </section>


          {/* ══════════════════════════════════════════════════════
              AVISO DE CRISIS — señales urgentes
              ══════════════════════════════════════════════════════ */}
          <section aria-label="Señales de crisis — información de ayuda" className="py-8 sm:py-10" style={{ background: '#f8fafa' }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              <SectionReveal>
                <div
                  role="alert"
                  className="flex flex-col sm:flex-row gap-4 items-start rounded-2xl p-5 sm:p-6"
                  style={{ background: '#fff3cd', border: '1.5px solid #e6a817' }}
                >
                  <div className="flex items-center justify-center shrink-0 rounded-xl" style={{ width: '44px', height: '44px', background: 'rgba(230,168,23,0.15)' }}>
                    <AlertTriangle className="w-5 h-5" style={{ color: '#9a6c00' }} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm mb-1.5" style={{ color: '#7a5200' }}>Si tienes pensamientos de hacerte daño</h3>
                    <p className="text-sm leading-relaxed" style={{ color: '#7a5200', lineHeight: '1.7' }}>
                      Busca ayuda inmediata. Llama a la <strong>Línea de la Vida</strong> en México:{' '}
                      <a href="tel:8002900024" className="font-bold underline" style={{ color: '#7a5200' }}>800-290-0024</a>{' '}
                      (disponible las 24 horas). Si hay riesgo inmediato, acude a urgencias de tu hospital más cercano.
                    </p>
                  </div>
                </div>
              </SectionReveal>
            </div>
          </section>


          {/* ══════════════════════════════════════════════════════
              DIFFERENTIATOR — TCC vs otros enfoques
              ══════════════════════════════════════════════════════ */}
          <section aria-labelledby="diff-heading" className="py-16 sm:py-20 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              <SectionReveal>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#2d7070' }}>Por qué TCC</p>
                <h2 id="diff-heading" className="font-serif font-bold leading-tight mb-4" style={{ fontSize: 'clamp(1.7rem,4vw,2.4rem)', color: '#1a4a4a' }}>
                  TCC vs otras aproximaciones para ansiedad y depresión
                </h2>
                <div className="w-10 h-0.5 rounded-full mb-8" style={{ background: '#2d7070' }} />
              </SectionReveal>

              <SectionReveal delay={0.1}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
                    <thead>
                      <tr>
                        <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest" style={{ color: '#517171', borderBottom: '2px solid rgba(26,74,74,0.12)' }}>Aspecto</th>
                        <th className="py-3 px-4 text-xs font-bold uppercase tracking-widest rounded-t-xl" style={{ color: '#fff', background: '#1a4a4a', borderBottom: '2px solid #1a4a4a' }}>TCC</th>
                        <th className="py-3 px-4 text-xs font-bold uppercase tracking-widest text-center" style={{ color: '#517171', borderBottom: '2px solid rgba(26,74,74,0.12)' }}>Terapia de apoyo / no estructurada</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['Evidencia científica', 'Nivel 1 — más estudiada para ansiedad/depresión', 'Variable'],
                        ['Duración', '8–20 sesiones acotadas', 'Indefinida'],
                        ['Técnicas', 'Concretas, enseñables, practicables', 'Genéricas o basadas en relación'],
                        ['Objetivo', 'Cambiar patrones específicos', 'Comprensión general'],
                        ['Resultado medible', 'BAI y BDI-II al inicio y al final', 'Impresión clínica'],
                        ['Prevención de recaída', 'Plan explícito incluido', 'No siempre contemplado'],
                      ].map(([aspect, tcc, other], i) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? '#f8fafa' : '#fff' }}>
                          <td className="py-3 px-4 font-medium text-xs" style={{ color: '#1a4a4a', borderBottom: '1px solid rgba(26,74,74,0.07)' }}>{aspect}</td>
                          <td className="py-3 px-4 text-center text-xs font-semibold" style={{ color: '#1a4a4a', background: 'rgba(26,74,74,0.05)', borderBottom: '1px solid rgba(26,74,74,0.07)' }}>{tcc}</td>
                          <td className="py-3 px-4 text-center text-xs" style={{ color: '#517171', borderBottom: '1px solid rgba(26,74,74,0.07)' }}>{other}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionReveal>
            </div>
          </section>


          {/* ══════════════════════════════════════════════════════
              FAQ
              ══════════════════════════════════════════════════════ */}
          <section aria-labelledby="faq-heading" className="py-16 sm:py-20" style={{ background: '#f8fafa' }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              <SectionReveal>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#2d7070' }}>Dudas frecuentes</p>
                <h2 id="faq-heading" className="font-serif font-bold leading-tight mb-4" style={{ fontSize: 'clamp(1.7rem,4vw,2.4rem)', color: '#1a4a4a' }}>
                  Preguntas sobre ansiedad y depresión
                </h2>
                <div className="w-10 h-0.5 rounded-full mb-10" style={{ background: '#2d7070' }} />
              </SectionReveal>

              <div style={{ maxWidth: '680px' }} role="list">
                {faqItems.map((faq, i) => (
                  <SectionReveal key={i} delay={i * 0.04}>
                    <div role="listitem" style={{ borderBottom: i < faqItems.length - 1 ? '1px solid rgba(26,74,74,0.1)' : 'none' }}>
                      <button
                        id={`faq-btn-${i}`}
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        aria-expanded={openFaq === i}
                        aria-controls={`faq-ans-${i}`}
                        className="w-full flex items-center justify-between gap-4 py-5 text-left transition-colors"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: openFaq === i ? '#2d7070' : '#1a4a4a' }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#2d7070')}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = openFaq === i ? '#2d7070' : '#1a4a4a')}
                      >
                        <span className="font-semibold text-sm sm:text-base">{faq.q}</span>
                        <ChevronDown
                          className="w-5 h-5 shrink-0 transition-transform duration-250"
                          style={{ color: '#2d7070', transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)' }}
                          aria-hidden="true"
                        />
                      </button>
                      <div
                        id={`faq-ans-${i}`}
                        role="region"
                        aria-labelledby={`faq-btn-${i}`}
                        className="grid transition-all duration-300"
                        style={{ gridTemplateRows: openFaq === i ? '1fr' : '0fr', opacity: openFaq === i ? 1 : 0 }}
                      >
                        <div className="overflow-hidden">
                          <p className="text-sm leading-relaxed pb-5 max-w-[66ch]" style={{ color: '#517171', lineHeight: '1.75' }}>
                            {faq.a}
                          </p>
                        </div>
                      </div>
                    </div>
                  </SectionReveal>
                ))}
              </div>
            </div>
          </section>


          {/* ══════════════════════════════════════════════════════
              CTA FINAL
              ══════════════════════════════════════════════════════ */}
          <section id="cta-final" aria-label="Agendar primera sesión" className="py-16 sm:py-20" style={{ background: '#0d3333' }}>
            <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
              <SectionReveal>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>Da el primer paso</p>
                <h2 className="font-serif font-bold text-white mb-4" style={{ fontSize: 'clamp(1.7rem,4vw,2.4rem)' }}>
                  Agenda tu primera sesión
                </h2>
                <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.7)', lineHeight: '1.8' }}>
                  La primera sesión es una evaluación de 50 minutos con BAI y BDI-II.
                  Saldrás con un cuadro claro de qué está pasando y cómo vamos a trabajarlo.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                  <a
                    href={waUrl('Hola Psic. Noemi, estoy buscando ayuda con ansiedad/depresión. ¿Podemos agendar?')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 font-bold text-sm px-7 py-3.5 rounded-xl text-white transition-all hover:-translate-y-0.5 hover:brightness-110"
                    style={{ background: '#25d366' }}
                  >
                    <MessageCircle className="w-4 h-4" aria-hidden="true" />
                    Agendar por WhatsApp
                  </a>
                  <a
                    href={`tel:${PHONE_E164}`}
                    className="inline-flex items-center justify-center gap-2 font-semibold text-sm px-7 py-3.5 rounded-xl transition-all hover:bg-white/10"
                    style={{ color: 'rgba(255,255,255,0.88)', border: '1.5px solid rgba(255,255,255,0.32)' }}
                  >
                    <Phone className="w-4 h-4" aria-hidden="true" />
                    998 850 2475
                  </a>
                </div>

                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  Lunes a Viernes {HOURS.weekdays.display} · Sábados {HOURS.saturday.display}
                </p>
              </SectionReveal>
            </div>
          </section>

        </main>

        <Footer />
      </div>
    </>
  );
}
