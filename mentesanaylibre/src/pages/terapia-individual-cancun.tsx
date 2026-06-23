import { useState, useEffect, useRef, type ReactNode } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import {
  MessageCircle, Phone, ChevronDown, CheckCircle2,
  ArrowRight, Brain, FileText, Award, BadgeCheck, Clock,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { applySeo, injectSchema } from '@/lib/seo';
import { SITE_URL, SPECIALIST_IMAGE, SPECIALIST_NAME, SPECIALIST_FULL, ADDRESS, GEO, HOURS } from '@/lib/site';
import { WA_NUMBER, PHONE_E164, waUrl, SOCIAL_PROFILES } from '@/lib/contact';

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
    q: '¿Cuánto dura un proceso de TCC?',
    a: 'La TCC es una terapia estructurada y acotada. La mayoría de los procesos para ansiedad o depresión moderada duran entre 8 y 20 sesiones. En casos más complejos o con condiciones coexistentes puede extenderse, pero siempre con metas claras y revisión periódica del progreso.',
  },
  {
    q: '¿La TCC funciona para ansiedad crónica?',
    a: 'Sí. La TCC es el tratamiento con mayor evidencia para ansiedad, incluyendo ansiedad generalizada, ataques de pánico, fobias y TOC. La ventaja frente a la ansiedad crónica es que el proceso enseña herramientas para el largo plazo, no solo manejo inmediato de síntomas.',
  },
  {
    q: '¿Hay tarea entre sesiones?',
    a: 'Sí, y es parte importante del proceso. La TCC requiere práctica fuera del consultorio: registros de pensamientos, experimentos conductuales, exposición gradual. Esto no es una carga adicional — es cómo se consolidan los cambios. Las tareas se diseñan de acuerdo a tu ritmo y situación.',
  },
  {
    q: '¿Puedo hacer TCC en línea?',
    a: 'Sí, la TCC funciona efectivamente en formato online. Las sesiones se realizan por videollamada con la misma estructura y herramientas que las presenciales. Muchos estudios muestran que los resultados son equivalentes para ansiedad y depresión.',
  },
  {
    q: '¿Qué pasa si no mejoro?',
    a: 'Si no hay avance después de 6-8 sesiones, revisamos juntos el plan: puede ser necesario ajustar las técnicas, trabajar en otros factores que no habíamos identificado, o explorar si hay otro diagnóstico que esté interfiriendo. La TCC incluye evaluación continua del progreso, no es un proceso a ciegas.',
  },
  {
    q: '¿La TCC es compatible con medicación?',
    a: 'Completamente. La TCC y la medicación pueden trabajar juntas y en muchos casos se complementan. Si estás tomando medicación prescrita por un psiquiatra, el tratamiento paralelo con TCC es la combinación recomendada por las guías clínicas para ansiedad y depresión moderada-grave.',
  },
];

const processSteps = [
  {
    n: '01',
    title: 'Evaluación inicial',
    subtitle: '(primera sesión)',
    desc: 'Historia clínica, metas terapéuticas y evaluación con instrumentos estandarizados BAI y BDI-II para medir el nivel de ansiedad y depresión.',
    duration: '50 min',
  },
  {
    n: '02',
    title: 'Psicoeducación',
    subtitle: '',
    desc: 'Entiendes cómo funciona la ansiedad o depresión en tu caso específico. Cuáles son tus patrones, qué los activa y cómo se mantienen.',
    duration: '1–2 sesiones',
  },
  {
    n: '03',
    title: 'Técnicas activas',
    subtitle: '',
    desc: 'Aprendes a identificar pensamientos automáticos, cuestionarlos y sustituirlos por interpretaciones más realistas. Inicio de exposición si aplica.',
    duration: '4–8 sesiones',
  },
  {
    n: '04',
    title: 'Práctica y consolidación',
    subtitle: '',
    desc: 'Aplicas las herramientas en situaciones reales de tu vida. Se ajustan las técnicas según tu evolución y contexto.',
    duration: '2–4 sesiones',
  },
  {
    n: '05',
    title: 'Alta y mantenimiento',
    subtitle: '',
    desc: 'Plan personalizado para sostener los cambios sin terapia continua. Identificación de señales de alerta y estrategias de prevención de recaída.',
    duration: '1 sesión',
  },
];

const instruments = [
  { name: 'BAI (Inventario de Ansiedad de Beck)', desc: 'Mide el nivel e impacto de los síntomas de ansiedad de forma objetiva.' },
  { name: 'BDI-II (Inventario de Depresión de Beck)', desc: 'Evalúa la presencia y gravedad de síntomas depresivos.' },
  { name: 'Registro de pensamientos automáticos', desc: 'Herramienta para identificar y rastrear los patrones cognitivos negativos.' },
  { name: 'Reestructuración cognitiva', desc: 'Técnica central de la TCC: cuestionar y modificar creencias distorsionadas.' },
  { name: 'Exposición gradual', desc: 'Para superar fobias, evitación y conductas de escape relacionadas con la ansiedad.' },
  { name: 'Activación conductual', desc: 'Para depresión y desmotivación: recuperar actividades significativas paso a paso.' },
];

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'MedicalTherapy',
      '@id': `${SITE_URL}/terapia-individual-cancun#service`,
      name: 'Terapia Cognitivo Conductual (TCC) para Adultos — Cancún',
      description: 'Terapia cognitivo conductual para ansiedad, depresión y estrés en adultos. Proceso estructurado, técnicas basadas en evidencia, resultados concretos.',
      url: `${SITE_URL}/terapia-individual-cancun`,
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
        { '@type': 'ListItem', position: 3, name: 'TCC Adultos', item: `${SITE_URL}/terapia-individual-cancun` },
      ],
    },
  ],
};

/* ═══════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function TerapiaIndividualCancun() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const cleanupSeo = applySeo({
      title: 'Terapia Cognitivo Conductual en Cancún | Psic. Noemi Eb.',
      description: 'TCC para ansiedad, depresión y estrés en Cancún. Proceso estructurado, técnicas basadas en evidencia, resultados concretos. Agenda tu primera sesión con Psic. Noemi Eb.',
      canonical: `${SITE_URL}/terapia-individual-cancun`,
    });
    const cleanupSchema = injectSchema('schema-terapia-individual', schema);
    return () => { cleanupSeo(); cleanupSchema(); };
  }, []);

  return (
    <>
      <Head>
        <title>Terapia Cognitivo Conductual en Cancún | Psic. Noemi Eb.</title>
        <meta name="description" content="TCC para ansiedad, depresión y estrés en Cancún. Proceso estructurado, técnicas basadas en evidencia, resultados concretos. Agenda tu primera sesión con Psic. Noemi Eb." />
        <link rel="canonical" href={`${SITE_URL}/terapia-individual-cancun`} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="es_MX" />
        <meta property="og:title" content="Terapia Cognitivo Conductual en Cancún | Psic. Noemi Eb." />
        <meta property="og:description" content="TCC para ansiedad, depresión y estrés en Cancún. Proceso estructurado con herramientas que te duran toda la vida." />
        <meta property="og:url" content={`${SITE_URL}/terapia-individual-cancun`} />
        <meta property="og:image" content={SPECIALIST_IMAGE} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Terapia Cognitivo Conductual en Cancún | Psic. Noemi Eb." />
        <meta name="twitter:description" content="TCC para ansiedad, depresión y estrés en Cancún. Agenda tu primera sesión." />
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
            {/* Subtle glow */}
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
                  <li style={{ color: 'rgba(255,255,255,0.8)' }}>TCC Adultos</li>
                </ol>
              </nav>

              {/* Badge */}
              <span
                className="inline-block text-[11px] font-bold tracking-widest uppercase rounded-full px-3 py-1.5 mb-5"
                style={{ background: 'rgba(45,112,112,0.4)', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(45,112,112,0.5)' }}
              >
                TCC · Adultos
              </span>

              <h1 id="hero-heading" className="font-serif font-bold text-white leading-tight mb-4" style={{ fontSize: 'clamp(2rem,5vw,3.2rem)' }}>
                Terapia Cognitivo Conductual<br />en Cancún
              </h1>

              <p className="font-serif italic mb-5" style={{ fontSize: 'clamp(1.1rem,2.5vw,1.4rem)', color: 'rgba(255,255,255,0.7)' }}>
                Para ansiedad, depresión y estrés — un proceso estructurado con herramientas que te duran toda la vida
              </p>

              <p className="text-sm leading-relaxed mb-8 max-w-[56ch]" style={{ color: 'rgba(255,255,255,0.75)', lineHeight: '1.8' }}>
                Si llegas a terapia es porque algo ya no está funcionando — y sabes que no es solo &ldquo;pensar positivo&rdquo;.
                La terapia cognitivo conductual no te da frases de motivación. Te enseña exactamente
                cómo tus pensamientos crean tus emociones, y qué hacer al respecto. Con técnicas
                concretas, practicables y basadas en evidencia.
              </p>

              <div className="flex flex-wrap gap-3">
                <a
                  href={waUrl('Hola Psic. Noemi, me interesa la terapia cognitivo conductual para adultos. ¿Podemos agendar?')}
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
              PAIN POINTS
              ══════════════════════════════════════════════════════ */}
          <section aria-labelledby="pain-heading" className="py-16 sm:py-20" style={{ background: '#f8fafa' }}>
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
              <SectionReveal>
                <p className="text-[10px] font-bold uppercase tracking-widest text-center mb-2" style={{ color: '#2d7070' }}>¿Te identificas?</p>
                <h2 id="pain-heading" className="font-serif font-bold text-center leading-tight mb-4" style={{ fontSize: 'clamp(1.7rem,4vw,2.4rem)', color: '#1a4a4a' }}>
                  Lo que traen quienes llegan a consulta
                </h2>
                <div className="w-10 h-0.5 rounded-full mx-auto mb-10" style={{ background: '#2d7070' }} />
              </SectionReveal>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: Brain, text: 'Me preocupo por todo, aunque sepa que es irracional' },
                  { icon: FileText, text: 'Me siento emocionalmente agotada/o sin motivo claro' },
                  { icon: CheckCircle2, text: 'Tengo episodios de ansiedad que no puedo controlar' },
                  { icon: ArrowRight, text: 'Sé que algo tiene que cambiar pero no sé por dónde empezar' },
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
              QUÉ ES LA TCC
              ══════════════════════════════════════════════════════ */}
          <section aria-labelledby="tcc-heading" className="py-16 sm:py-20 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              <SectionReveal>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#2d7070' }}>Fundamentos</p>
                <h2 id="tcc-heading" className="font-serif font-bold leading-tight mb-4" style={{ fontSize: 'clamp(1.7rem,4vw,2.4rem)', color: '#1a4a4a' }}>
                  ¿Qué es la terapia cognitivo conductual?
                </h2>
                <div className="w-10 h-0.5 rounded-full mb-6" style={{ background: '#2d7070' }} />
                <p className="text-sm leading-relaxed mb-10 max-w-[60ch]" style={{ color: '#517171', lineHeight: '1.8' }}>
                  La TCC trabaja la relación entre tus pensamientos, emociones y conductas. Está basada en
                  evidencia científica y es el tratamiento de primera línea para ansiedad y depresión según la OMS.
                  No es introspección indefinida: es un proceso activo con técnicas concretas y resultados medibles.
                </p>
              </SectionReveal>

              {/* Triangle / flow */}
              <SectionReveal delay={0.1}>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-0">
                  {[
                    { label: 'Pensamientos automáticos', sub: '"Nunca lo voy a lograr"', color: '#1a4a4a' },
                    { label: 'Emociones', sub: 'Ansiedad, tristeza, frustración', color: '#2d7070' },
                    { label: 'Conductas', sub: 'Evitación, aislamiento, procrastinación', color: '#517171' },
                  ].map((pillar, i, arr) => (
                    <div key={pillar.label} className="flex items-center gap-0 sm:gap-0">
                      <div
                        className="flex flex-col items-center justify-center text-center rounded-2xl p-5"
                        style={{ background: `${pillar.color}14`, border: `1.5px solid ${pillar.color}30`, minWidth: '160px', minHeight: '100px' }}
                      >
                        <p className="font-bold text-sm mb-1" style={{ color: pillar.color }}>{pillar.label}</p>
                        <p className="text-xs italic" style={{ color: '#517171' }}>{pillar.sub}</p>
                      </div>
                      {i < arr.length - 1 && (
                        <div className="flex items-center justify-center w-10 sm:w-12 shrink-0">
                          <ArrowRight className="w-5 h-5 rotate-0 sm:rotate-0 hidden sm:block" style={{ color: '#2d7070' }} aria-hidden="true" />
                          <ArrowRight className="w-5 h-5 rotate-90 sm:hidden" style={{ color: '#2d7070' }} aria-hidden="true" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-center text-sm mt-6" style={{ color: '#517171' }}>
                  La TCC interrumpe estos ciclos con técnicas específicas para cada eslabón de la cadena.
                </p>
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
                  ¿Cómo funciona el proceso?
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
              DELIVERABLES — lo que te llevas
              ══════════════════════════════════════════════════════ */}
          <section aria-labelledby="deliverables-heading" className="py-16 sm:py-20 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              <SectionReveal>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#2d7070' }}>Al finalizar</p>
                <h2 id="deliverables-heading" className="font-serif font-bold leading-tight mb-4" style={{ fontSize: 'clamp(1.7rem,4vw,2.4rem)', color: '#1a4a4a' }}>
                  Lo que te llevas al terminar
                </h2>
                <div className="w-10 h-0.5 rounded-full mb-8" style={{ background: '#2d7070' }} />
              </SectionReveal>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  'Plan de herramientas personalizado para tu caso',
                  'Registro de tus patrones de pensamiento específicos',
                  'Técnicas de exposición gradual adaptadas a ti',
                  'Plan de prevención de recaída para el largo plazo',
                ].map((item, i) => (
                  <SectionReveal key={i} delay={i * 0.07}>
                    <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: '#f8fafa', border: '1px solid rgba(26,74,74,0.1)' }}>
                      <div className="flex items-center justify-center shrink-0 rounded-full mt-0.5" style={{ width: '22px', height: '22px', background: 'rgba(45,112,112,0.15)' }}>
                        <svg viewBox="0 0 12 12" fill="none" stroke="#2d7070" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '11px', height: '11px' }} aria-hidden="true">
                          <polyline points="2,6 5,9 10,3" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium" style={{ color: '#1a4a4a' }}>{item}</p>
                    </div>
                  </SectionReveal>
                ))}
              </div>
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
                  Técnicas e instrumentos utilizados
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
              COMPARISON TABLE — TCC vs otras terapias
              ══════════════════════════════════════════════════════ */}
          <section aria-labelledby="comparison-heading" className="py-16 sm:py-20 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              <SectionReveal>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#2d7070' }}>Por qué TCC</p>
                <h2 id="comparison-heading" className="font-serif font-bold leading-tight mb-4" style={{ fontSize: 'clamp(1.7rem,4vw,2.4rem)', color: '#1a4a4a' }}>
                  TCC vs otras aproximaciones terapéuticas
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
                        <th className="py-3 px-4 text-xs font-bold uppercase tracking-widest text-center" style={{ color: '#517171', borderBottom: '2px solid rgba(26,74,74,0.12)' }}>Otras terapias</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['Duración', '8–20 sesiones', 'Indefinida'],
                        ['Objetivo', 'Metas concretas y medibles', 'Insight general'],
                        ['Técnicas', 'Específicas y enseñables', 'Variable'],
                        ['Evidencia científica', '500+ estudios clínicos', 'Variable'],
                        ['Al terminar', 'Herramientas propias', 'Posible dependencia del terapeuta'],
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
              ABOUT NOEMI — compact
              ══════════════════════════════════════════════════════ */}
          <section aria-labelledby="about-heading" className="py-16 sm:py-20" style={{ background: '#f8fafa' }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              <SectionReveal>
                <div className="flex flex-col sm:flex-row gap-8 items-start">
                  {/* Photo */}
                  <div className="shrink-0 flex justify-center sm:justify-start w-full sm:w-auto">
                    <Image
                      src={SPECIALIST_IMAGE}
                      alt={`${SPECIALIST_FULL} — Psicoterapeuta TCC en Cancún`}
                      width={200}
                      height={240}
                      className="object-cover object-top"
                      style={{ borderRadius: '16px 40px 16px 16px', maxWidth: '180px', boxShadow: '0 12px 40px rgba(26,74,74,0.18)' }}
                      loading="lazy"
                      unoptimized
                    />
                  </div>
                  {/* Content */}
                  <div className="flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#2d7070' }}>Sobre la terapeuta</p>
                    <h2 id="about-heading" className="font-serif font-bold mb-3" style={{ fontSize: 'clamp(1.4rem,3vw,1.9rem)', color: '#1a4a4a' }}>
                      {SPECIALIST_FULL}
                    </h2>
                    <p className="text-sm leading-relaxed mb-4" style={{ color: '#517171', lineHeight: '1.8' }}>
                      Psicoterapeuta cognitivo conductual con práctica clínica en Cancún. Formada en TCC con enfoque en ansiedad,
                      depresión y regulación emocional en adultos.
                    </p>
                    <p className="text-sm leading-relaxed mb-5" style={{ color: '#517171', lineHeight: '1.8' }}>
                      Creo en la terapia como un proceso con inicio y fin, donde el objetivo es que aprendas a ser tu propio terapeuta.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        'Licenciada en Psicología',
                        'Especialización en TCC',
                        'Evaluación con BAI y BDI-II',
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
              FAQ
              ══════════════════════════════════════════════════════ */}
          <section aria-labelledby="faq-heading" className="py-16 sm:py-20 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              <SectionReveal>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#2d7070' }}>Dudas frecuentes</p>
                <h2 id="faq-heading" className="font-serif font-bold leading-tight mb-4" style={{ fontSize: 'clamp(1.7rem,4vw,2.4rem)', color: '#1a4a4a' }}>
                  Preguntas sobre la TCC
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
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>Empieza hoy</p>
                <h2 className="font-serif font-bold text-white mb-4" style={{ fontSize: 'clamp(1.7rem,4vw,2.4rem)' }}>
                  ¿Lista/o para dar el primer paso?
                </h2>
                <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.7)', lineHeight: '1.8' }}>
                  La primera sesión es una evaluación inicial de 50 minutos. Definimos juntos el plan,
                  las metas y si la TCC es el enfoque correcto para ti.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                  <a
                    href={waUrl('Hola Psic. Noemi, me interesa la terapia cognitivo conductual para adultos. ¿Podemos agendar?')}
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
