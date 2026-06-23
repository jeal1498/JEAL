import { useState, useEffect, useRef, type ReactNode } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import {
  MessageCircle, Phone, ChevronDown, Users,
  ArrowRight, Brain, FileText, Heart, BadgeCheck,
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

const faqItems = [
  {
    q: '¿Qué pasa si mi hijo no quiere ir?',
    a: 'Es muy común. La resistencia inicial no significa que la terapia no funcionará. En la primera sesión trabajo en crear un espacio donde el/la adolescente sienta que viene por sí mismo, no arrastrado. Hablar con los padres antes para entender la situación ayuda a diseñar ese primer encuentro.',
  },
  {
    q: '¿Me van a contar lo que dice mi hijo en sesión?',
    a: 'No. La confidencialidad con el/la adolescente es no negociable — es la base de la alianza terapéutica. Hay una única excepción: si hay riesgo real para la integridad del joven o de terceros, sí informo. Fuera de eso, lo que se habla en sesión se queda en sesión. Los check-ins con padres son para hablar de avances generales y orientación del entorno, no de contenido de las sesiones.',
  },
  {
    q: '¿A qué edad se puede empezar?',
    a: 'Atiendo adolescentes desde los 12 años. Para edades más pequeñas (6-11 años) el enfoque es diferente y requiere una valoración específica. Contáctame para orientarte según la edad y la situación de tu hijo/a.',
  },
  {
    q: '¿Cuándo vería resultados?',
    a: 'Los primeros cambios observables suelen aparecer entre las sesiones 4 y 8: el/la adolescente empieza a comunicarse diferente en casa, a regular mejor sus reacciones, o a recuperar interés en actividades. Los cambios más profundos toman entre 3 y 6 meses de trabajo consistente.',
  },
  {
    q: '¿Qué problemas puede ayudar la TCC en adolescentes?',
    a: 'Ansiedad escolar y social, depresión, bajo rendimiento escolar relacionado con estado emocional, problemas de conducta, dificultades de comunicación en casa, duelo, autolesiones (sin riesgo vital), inseguridad y baja autoestima. Si tienes dudas sobre si aplica para la situación de tu hijo/a, escríbeme.',
  },
  {
    q: '¿El proceso incluye hablar con los padres?',
    a: 'Sí, y es parte esencial. Hay una sesión inicial con los padres antes de conocer al adolescente. Después, una sesión de check-in con padres cada 4-6 semanas para orientar el entorno familiar. Los cambios en el consultorio necesitan un entorno que los sostenga en casa.',
  },
];

const processSteps = [
  {
    n: '01',
    title: 'Sesión inicial con padres',
    desc: 'Recabo el contexto familiar: historial, preocupaciones específicas, dinámica en casa. El/la adolescente no participa en esta sesión.',
    duration: '50 min',
  },
  {
    n: '02',
    title: 'Construcción de alianza con el/la adolescente',
    desc: 'Primera sesión con el/la joven. El objetivo no es empezar a "trabajar" — es que sienta que este es un espacio suyo, sin juicio y sin reportes a sus padres.',
    duration: '1–2 sesiones',
  },
  {
    n: '03',
    title: 'Psicoeducación adaptada',
    desc: 'Explicamos cómo funciona la ansiedad o la tristeza en un lenguaje que tenga sentido para su edad y su mundo. Los adolescentes responden mejor cuando entienden el mecanismo.',
    duration: '1–2 sesiones',
  },
  {
    n: '04',
    title: 'TCC activa — técnicas adaptadas',
    desc: 'Trabajo de reestructuración cognitiva, regulación emocional y habilidades de comunicación adaptadas al contexto adolescente: redes sociales, presión de pares, entorno escolar.',
    duration: '4–8 sesiones',
  },
  {
    n: '05',
    title: 'Check-in con padres + cierre',
    desc: 'Revisión de avances con los padres, orientación para sostener los cambios en casa, y plan de mantenimiento para el/la adolescente.',
    duration: 'Cada 4–6 semanas + sesión final',
  },
];

const instruments = [
  { name: 'BDI-Y (Beck Depression Inventory for Youth)', desc: 'Evalúa síntomas depresivos específicos para población joven.' },
  { name: 'MASC (Multidimensional Anxiety Scale for Children)', desc: 'Mide ansiedad en múltiples dimensiones: social, escolar, física.' },
  { name: 'Regulación emocional (DBT-adaptada)', desc: 'Técnicas del modelo DBT adaptadas para adolescentes con alta reactividad emocional.' },
  { name: 'Entrenamiento en habilidades sociales', desc: 'Para dificultades de relación con pares y situaciones de presión social.' },
  { name: 'Reestructuración cognitiva adaptada', desc: 'Identificar y cuestionar pensamientos automáticos en el lenguaje del/la adolescente.' },
  { name: 'Comunicación asertiva', desc: 'Herramientas para expresar necesidades y límites tanto en casa como en el entorno escolar.' },
];

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'MedicalTherapy',
      '@id': `${SITE_URL}/terapia-adolescentes-cancun#service`,
      name: 'Terapia Cognitivo Conductual para Adolescentes — Cancún',
      description: 'Terapia psicológica para adolescentes de 12 a 18 años en Cancún. Trabajo con el joven y con los padres para cambios que se sostienen en casa.',
      url: `${SITE_URL}/terapia-adolescentes-cancun`,
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
        { '@type': 'ListItem', position: 3, name: 'Terapia Adolescentes', item: `${SITE_URL}/terapia-adolescentes-cancun` },
      ],
    },
  ],
};

/* ═══════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function TerapiaAdolescentesCancun() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const cleanupSeo = applySeo({
      title: 'Terapia para Adolescentes en Cancún | Psic. Noemi Eb.',
      description: 'Terapia cognitivo conductual para adolescentes de 12 a 18 años en Cancún. Trabaja con el joven Y con los padres para cambios que duran. Psic. Noemi Eb.',
      canonical: `${SITE_URL}/terapia-adolescentes-cancun`,
    });
    const cleanupSchema = injectSchema('schema-terapia-adolescentes', schema);
    return () => { cleanupSeo(); cleanupSchema(); };
  }, []);

  return (
    <>
      <Head>
        <title>Terapia para Adolescentes en Cancún | Psic. Noemi Eb.</title>
        <meta name="description" content="Terapia cognitivo conductual para adolescentes de 12 a 18 años en Cancún. Trabaja con el joven Y con los padres para cambios que duran. Psic. Noemi Eb." />
        <link rel="canonical" href={`${SITE_URL}/terapia-adolescentes-cancun`} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="es_MX" />
        <meta property="og:title" content="Terapia para Adolescentes en Cancún | Psic. Noemi Eb." />
        <meta property="og:description" content="Terapia cognitivo conductual para adolescentes de 12 a 18 años en Cancún. Con resultados que se sostienen en casa." />
        <meta property="og:url" content={`${SITE_URL}/terapia-adolescentes-cancun`} />
        <meta property="og:image" content={SPECIALIST_IMAGE} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Terapia para Adolescentes en Cancún | Psic. Noemi Eb." />
        <meta name="twitter:description" content="TCC para adolescentes de 12 a 18 años. Trabaja con el joven y con los padres." />
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
                  <li style={{ color: 'rgba(255,255,255,0.8)' }}>Terapia Adolescentes</li>
                </ol>
              </nav>

              {/* Badge */}
              <span
                className="inline-block text-[11px] font-bold tracking-widest uppercase rounded-full px-3 py-1.5 mb-5"
                style={{ background: 'rgba(45,112,112,0.4)', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(45,112,112,0.5)' }}
              >
                TCC · 12 a 18 años
              </span>

              <h1 id="hero-heading" className="font-serif font-bold text-white leading-tight mb-4" style={{ fontSize: 'clamp(2rem,5vw,3.2rem)' }}>
                Terapia para Adolescentes<br />en Cancún
              </h1>

              <p className="font-serif italic mb-5" style={{ fontSize: 'clamp(1.1rem,2.5vw,1.4rem)', color: 'rgba(255,255,255,0.7)' }}>
                Para jóvenes de 12 a 18 años — con resultados que se sostienen en casa
              </p>

              <p className="text-sm leading-relaxed mb-8 max-w-[58ch]" style={{ color: 'rgba(255,255,255,0.75)', lineHeight: '1.8' }}>
                Ver a tu hijo/a cambiar — volverse más ansioso/a, agresivo/a, o simplemente dejar de ser el mismo
                — es de las experiencias más difíciles de un padre o madre. La terapia cognitivo conductual para
                adolescentes trabaja tanto con el/la joven como con los padres. Porque los cambios en el consultorio
                se caen si el entorno no acompaña.
              </p>

              <div className="flex flex-wrap gap-3">
                <a
                  href={waUrl('Hola Psic. Noemi, tengo un/a adolescente que podría necesitar apoyo. ¿Podemos hablar?')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-bold text-sm px-6 py-3.5 rounded-xl text-white transition-all hover:-translate-y-0.5 hover:brightness-110"
                  style={{ background: '#25d366' }}
                  aria-label="Contactar por WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" aria-hidden="true" />
                  Hablar por WhatsApp
                </a>
                <a
                  href="#proceso"
                  onClick={(e) => { e.preventDefault(); document.getElementById('proceso')?.scrollIntoView({ behavior: 'smooth' }); }}
                  className="inline-flex items-center gap-2 font-semibold text-sm px-6 py-3.5 rounded-xl transition-all hover:bg-white/10"
                  style={{ color: 'rgba(255,255,255,0.88)', border: '1.5px solid rgba(255,255,255,0.32)' }}
                >
                  Ver el proceso
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          </section>


          {/* ══════════════════════════════════════════════════════
              PAIN POINTS — para padres
              ══════════════════════════════════════════════════════ */}
          <section aria-labelledby="pain-heading" className="py-16 sm:py-20" style={{ background: '#f8fafa' }}>
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
              <SectionReveal>
                <p className="text-[10px] font-bold uppercase tracking-widest text-center mb-2" style={{ color: '#2d7070' }}>Lo que dicen los padres</p>
                <h2 id="pain-heading" className="font-serif font-bold text-center leading-tight mb-4" style={{ fontSize: 'clamp(1.7rem,4vw,2.4rem)', color: '#1a4a4a' }}>
                  ¿Reconoces alguna de estas situaciones?
                </h2>
                <div className="w-10 h-0.5 rounded-full mx-auto mb-10" style={{ background: '#2d7070' }} />
              </SectionReveal>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: FileText, text: 'Mi hijo/a ya no quiere ir a la escuela o su rendimiento bajó de golpe' },
                  { icon: Brain, text: 'Cambios de humor extremos, agresividad o aislamiento que no entiendo' },
                  { icon: BadgeCheck, text: 'El orientador o pediatra me recomendó buscar apoyo psicológico' },
                  { icon: Heart, text: 'Siento que ya no podemos hablar sin que termine en discusión' },
                ].map((item, i) => (
                  <SectionReveal key={i} delay={i * 0.08}>
                    <div
                      className="flex items-start gap-4 p-5 rounded-2xl bg-white transition-all"
                      style={{ border: '1px solid rgba(26,74,74,0.1)', boxShadow: '0 2px 12px rgba(26,74,74,0.04)' }}
                    >
                      <div
                        className="flex items-center justify-center shrink-0 rounded-xl"
                        style={{ width: '44px', height: '44px', background: 'rgba(45,112,112,0.1)', border: '1px solid rgba(45,112,112,0.2)' }}
                      >
                        <item.icon className="w-5 h-5" style={{ color: '#2d7070' }} aria-hidden="true" />
                      </div>
                      <p className="text-sm leading-relaxed font-medium pt-2.5" style={{ color: '#1a4a4a' }}>&ldquo;{item.text}&rdquo;</p>
                    </div>
                  </SectionReveal>
                ))}
              </div>
            </div>
          </section>


          {/* ══════════════════════════════════════════════════════
              CÓMO FUNCIONA — 3 fases
              ══════════════════════════════════════════════════════ */}
          <section aria-labelledby="how-heading" className="py-16 sm:py-20 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              <SectionReveal>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#2d7070' }}>Estructura del proceso</p>
                <h2 id="how-heading" className="font-serif font-bold leading-tight mb-4" style={{ fontSize: 'clamp(1.7rem,4vw,2.4rem)', color: '#1a4a4a' }}>
                  ¿Cómo funciona la terapia para adolescentes?
                </h2>
                <div className="w-10 h-0.5 rounded-full mb-8" style={{ background: '#2d7070' }} />
              </SectionReveal>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  {
                    phase: 'Fase 1',
                    title: 'Evaluación con padres',
                    desc: 'Contexto familiar, historia y preocupaciones específicas. Sin el/la adolescente presente.',
                    color: '#1a4a4a',
                  },
                  {
                    phase: 'Fase 2',
                    title: 'Alianza con el/la adolescente',
                    desc: 'Espacio seguro, sin juicio, sin reportes a padres. La confianza es lo primero.',
                    color: '#2d7070',
                  },
                  {
                    phase: 'Fase 3',
                    title: 'Trabajo conjunto',
                    desc: 'TCC activa con el/la joven + check-ins periódicos con padres para sostener los cambios en casa.',
                    color: '#517171',
                  },
                ].map((phase, i) => (
                  <SectionReveal key={i} delay={i * 0.08}>
                    <div
                      className="rounded-2xl p-6 h-full"
                      style={{ background: `${phase.color}08`, border: `1.5px solid ${phase.color}20` }}
                    >
                      <span className="inline-block text-[10px] font-bold uppercase tracking-widest rounded-full px-2.5 py-1 mb-3" style={{ background: `${phase.color}15`, color: phase.color }}>
                        {phase.phase}
                      </span>
                      <h3 className="font-bold text-base mb-2" style={{ color: '#1a4a4a' }}>{phase.title}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: '#517171', lineHeight: '1.75' }}>{phase.desc}</p>
                    </div>
                  </SectionReveal>
                ))}
              </div>
            </div>
          </section>


          {/* ══════════════════════════════════════════════════════
              PROCESO — 5 pasos detallados
              ══════════════════════════════════════════════════════ */}
          <section id="proceso" aria-labelledby="proceso-heading" className="py-16 sm:py-20 scroll-mt-20" style={{ background: '#f8fafa' }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              <SectionReveal>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#2d7070' }}>Paso a paso</p>
                <h2 id="proceso-heading" className="font-serif font-bold leading-tight mb-4" style={{ fontSize: 'clamp(1.7rem,4vw,2.4rem)', color: '#1a4a4a' }}>
                  El proceso en detalle
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
                        <h3 className="font-bold mb-1" style={{ fontSize: '1.05rem', color: '#1a4a4a' }}>{step.title}</h3>
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
              LO QUE HACE DIFERENTE — trabajo con padres
              ══════════════════════════════════════════════════════ */}
          <section aria-labelledby="diff-heading" className="py-16 sm:py-20 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              <SectionReveal>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#2d7070' }}>Qué hace la diferencia</p>
                <h2 id="diff-heading" className="font-serif font-bold leading-tight mb-4" style={{ fontSize: 'clamp(1.7rem,4vw,2.4rem)', color: '#1a4a4a' }}>
                  ¿Por qué incluir a los padres?
                </h2>
                <div className="w-10 h-0.5 rounded-full mb-6" style={{ background: '#2d7070' }} />
                <p className="text-sm leading-relaxed mb-8 max-w-[60ch]" style={{ color: '#517171', lineHeight: '1.8' }}>
                  Los cambios en el consultorio se caen si el entorno no cambia. Un adolescente que aprende a regular sus
                  emociones en sesión, pero llega a casa a un entorno de alta tensión, no puede consolidar eso.
                  Por eso trabajo con los padres.
                </p>
              </SectionReveal>

              <SectionReveal delay={0.1}>
                <div
                  className="rounded-2xl p-6 sm:p-8"
                  style={{ background: 'rgba(26,74,74,0.04)', border: '1.5px solid rgba(26,74,74,0.12)' }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Users className="w-5 h-5" style={{ color: '#2d7070' }} aria-hidden="true" />
                        <span className="font-bold text-sm" style={{ color: '#1a4a4a' }}>Sesiones con el/la adolescente</span>
                      </div>
                      <p className="text-sm" style={{ color: '#517171', lineHeight: '1.7' }}>4 sesiones individuales por cada ciclo de check-in. Trabajo de TCC activo: pensamientos, emociones, conductas.</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Heart className="w-5 h-5" style={{ color: '#2d7070' }} aria-hidden="true" />
                        <span className="font-bold text-sm" style={{ color: '#1a4a4a' }}>Sesiones con los padres</span>
                      </div>
                      <p className="text-sm" style={{ color: '#517171', lineHeight: '1.7' }}>1 sesión cada 4–6 semanas. Avances generales, orientación de comunicación en casa, y ajustes al entorno familiar.</p>
                    </div>
                  </div>
                </div>
              </SectionReveal>
            </div>
          </section>


          {/* ══════════════════════════════════════════════════════
              INSTRUMENTOS
              ══════════════════════════════════════════════════════ */}
          <section aria-labelledby="instruments-heading" className="py-16 sm:py-20" style={{ background: '#f8fafa' }}>
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
              <SectionReveal>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#2d7070' }}>Herramientas</p>
                <h2 id="instruments-heading" className="font-serif font-bold leading-tight mb-4" style={{ fontSize: 'clamp(1.7rem,4vw,2.4rem)', color: '#1a4a4a' }}>
                  Técnicas e instrumentos para adolescentes
                </h2>
                <div className="w-10 h-0.5 rounded-full mb-10" style={{ background: '#2d7070' }} />
              </SectionReveal>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {instruments.map((item, i) => (
                  <SectionReveal key={i} delay={i * 0.06}>
                    <div className="bg-white rounded-2xl p-5 h-full" style={{ border: '1px solid rgba(26,74,74,0.1)', boxShadow: '0 2px 8px rgba(26,74,74,0.04)' }}>
                      <h3 className="font-bold text-sm mb-2" style={{ color: '#1a4a4a' }}>{item.name}</h3>
                      <p className="text-xs leading-relaxed" style={{ color: '#517171', lineHeight: '1.7' }}>{item.desc}</p>
                    </div>
                  </SectionReveal>
                ))}
              </div>
            </div>
          </section>


          {/* ══════════════════════════════════════════════════════
              ABOUT NOEMI — compact
              ══════════════════════════════════════════════════════ */}
          <section aria-labelledby="about-heading" className="py-16 sm:py-20 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              <SectionReveal>
                <div className="flex flex-col sm:flex-row gap-8 items-start">
                  <div className="shrink-0 flex justify-center sm:justify-start w-full sm:w-auto">
                    <Image
                      src={SPECIALIST_IMAGE}
                      alt={`${SPECIALIST_FULL} — Psicoterapeuta adolescentes Cancún`}
                      width={200}
                      height={240}
                      className="object-cover object-top"
                      style={{ borderRadius: '16px 40px 16px 16px', maxWidth: '180px', boxShadow: '0 12px 40px rgba(26,74,74,0.18)' }}
                      loading="lazy"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#2d7070' }}>Sobre la terapeuta</p>
                    <h2 id="about-heading" className="font-serif font-bold mb-3" style={{ fontSize: 'clamp(1.4rem,3vw,1.9rem)', color: '#1a4a4a' }}>
                      {SPECIALIST_FULL}
                    </h2>
                    <p className="text-sm leading-relaxed mb-4" style={{ color: '#517171', lineHeight: '1.8' }}>
                      Psicoterapeuta cognitivo conductual con práctica clínica en Cancún, especializada en trabajo con
                      adolescentes y sus familias. Formada en TCC adaptada para jóvenes y técnicas de regulación emocional.
                    </p>
                    <p className="text-sm leading-relaxed mb-5" style={{ color: '#517171', lineHeight: '1.8' }}>
                      Mi enfoque con adolescentes empieza por ganar su confianza, no por &ldquo;arreglarlos&rdquo;.
                      Cuando el/la joven siente que el espacio es suyo, el trabajo real puede comenzar.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        'Licenciada en Psicología',
                        'TCC adaptada para adolescentes',
                        'Trabajo sistémico con familias',
                        'Atención presencial y en línea',
                      ].map((cred, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="flex items-center justify-center shrink-0 rounded-full" style={{ width: '18px', height: '18px', background: 'rgba(45,112,112,0.15)' }}>
                            <svg viewBox="0 0 12 12" fill="none" stroke="#2d7070" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '10px', height: '10px' }} aria-hidden="true">
                              <polyline points="2,6 5,9 10,3" />
                            </svg>
                          </div>
                          <span className="text-xs" style={{ color: '#1a4a4a' }}>{cred}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </SectionReveal>
            </div>
          </section>


          {/* ══════════════════════════════════════════════════════
              FAQ — para padres
              ══════════════════════════════════════════════════════ */}
          <section aria-labelledby="faq-heading" className="py-16 sm:py-20" style={{ background: '#f8fafa' }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              <SectionReveal>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#2d7070' }}>Dudas frecuentes</p>
                <h2 id="faq-heading" className="font-serif font-bold leading-tight mb-4" style={{ fontSize: 'clamp(1.7rem,4vw,2.4rem)', color: '#1a4a4a' }}>
                  Preguntas de padres y madres
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
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>El primer paso</p>
                <h2 className="font-serif font-bold text-white mb-4" style={{ fontSize: 'clamp(1.7rem,4vw,2.4rem)' }}>
                  ¿Quieres hablar de la situación de tu hijo/a?
                </h2>
                <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.7)', lineHeight: '1.8' }}>
                  Empezamos con una sesión contigo como padre o madre. Me cuentas lo que está pasando
                  y definimos juntos si la terapia y el momento son los adecuados.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                  <a
                    href={waUrl('Hola Psic. Noemi, tengo un/a adolescente que podría necesitar apoyo. ¿Podemos hablar?')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 font-bold text-sm px-7 py-3.5 rounded-xl text-white transition-all hover:-translate-y-0.5 hover:brightness-110"
                    style={{ background: '#25d366' }}
                  >
                    <MessageCircle className="w-4 h-4" aria-hidden="true" />
                    Hablar por WhatsApp
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
