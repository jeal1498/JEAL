import { useState, useEffect, useRef, type ReactNode } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import {
  MessageCircle, Phone, ChevronDown, MapPin, Clock,
  ArrowRight, Brain, Users, Heart, Navigation,
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

const services = [
  {
    href: '/terapia-individual-cancun',
    icon: Brain,
    label: 'TCC Adultos',
    title: 'Terapia Cognitivo Conductual',
    desc: 'Para ansiedad, depresión y estrés. Proceso estructurado, herramientas basadas en evidencia, duración definida.',
    badge: '#1a4a4a',
    badgeBg: 'rgba(26,74,74,0.12)',
  },
  {
    href: '/terapia-adolescentes-cancun',
    icon: Users,
    label: 'Adolescentes',
    title: 'Terapia para Adolescentes',
    desc: 'Para jóvenes de 12 a 18 años. Trabaja con el/la joven Y con los padres para resultados que duran.',
    badge: '#2d7070',
    badgeBg: 'rgba(45,112,112,0.12)',
  },
  {
    href: '/terapia-ansiedad-depresion-cancun',
    icon: Heart,
    label: 'Ansiedad · Depresión',
    title: 'Terapia para Ansiedad y Depresión',
    desc: 'El tratamiento con más evidencia científica para los ciclos de ansiedad y depresión. BAI y BDI-II incluidos.',
    badge: '#517171',
    badgeBg: 'rgba(81,113,113,0.12)',
  },
];

const faqItems = [
  {
    q: '¿Dónde encontrar psicólogo en Cancún?',
    a: 'Puedes buscar psicólogos en Cancún a través de directorios como Doctoralia, Google Maps o la recomendación de tu médico de cabecera. Al buscar, verifica que el profesional tenga cédula profesional federal (emitida por la SEP), que especifique su enfoque terapéutico y que explique qué condiciones trata. La Psic. Noemi Eb. atiende en Cancún con enfoque cognitivo conductual para ansiedad, depresión y adolescentes.',
  },
  {
    q: '¿Cuánto cuesta el psicólogo en Cancún?',
    a: 'El costo de la terapia psicológica en Cancún varía entre $600 y $1,500 MXN por sesión, dependiendo de la formación y especialidad del terapeuta. Para conocer el costo exacto de las sesiones con Psic. Noemi Eb., contáctala directamente por WhatsApp. Muchos procesos de TCC son más cortos (8-20 sesiones) que las terapias indefinidas, lo que representa un costo total más accesible.',
  },
  {
    q: '¿La terapia presencial es mejor que en línea?',
    a: 'Para la terapia cognitivo conductual (TCC), la evidencia muestra que los resultados son equivalentes en formato presencial y en línea para ansiedad y depresión. La modalidad depende de tu preferencia, disponibilidad de tiempo y si vives en Cancún o en otra ciudad. Psic. Noemi Eb. atiende en ambas modalidades.',
  },
  {
    q: '¿Qué es la TCC y por qué es la más recomendada?',
    a: 'La terapia cognitivo conductual (TCC) es un enfoque psicoterapéutico estructurado que trabaja la relación entre pensamientos, emociones y conductas. Es la terapia con más evidencia científica para ansiedad y depresión según la OMS y las guías clínicas internacionales. A diferencia de otros enfoques, tiene duración definida, objetivos concretos y técnicas enseñables que el paciente puede usar de forma autónoma al terminar el proceso.',
  },
  {
    q: '¿Psicólogo o psiquiatra — cuál necesito?',
    a: 'Un psicólogo clínico trabaja con terapia (TCC u otros enfoques) sin recetar medicamentos. Un psiquiatra es médico especializado en salud mental y puede prescribir medicación. Para ansiedad y depresión moderada, la terapia psicológica suele ser suficiente. Para casos graves o con síntomas físicos intensos, puede ser necesaria la combinación de ambos. Si tienes dudas, empieza por consultar con un psicólogo clínico que pueda orientarte.',
  },
];

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['LocalBusiness', 'MedicalBusiness'],
      '@id': `${SITE_URL}/psicologo-cancun#business`,
      name: 'Psic. Noemi Eb. — Psicoterapeuta TCC en Cancún · Mente Sana y Libre',
      alternateName: 'Mente Sana y Libre',
      url: `${SITE_URL}/psicologo-cancun`,
      telephone: PHONE_E164,
      image: SPECIALIST_IMAGE,
      description: 'Psicóloga en Cancún con enfoque cognitivo conductual. Terapia para ansiedad, depresión y adolescentes. Psic. Noemi Eb.',
      address: {
        '@type': 'PostalAddress',
        ...ADDRESS,
      },
      geo: { '@type': 'GeoCoordinates', latitude: GEO.latitude, longitude: GEO.longitude },
      openingHoursSpecification: [
        { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: HOURS.weekdays.opens, closes: HOURS.weekdays.closes },
        { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: HOURS.saturday.opens, closes: HOURS.saturday.closes },
      ],
      areaServed: [
        { '@type': 'City', name: 'Cancún', sameAs: 'https://www.wikidata.org/wiki/Q8969' },
        { '@type': 'AdministrativeArea', name: 'Quintana Roo', sameAs: 'https://www.wikidata.org/wiki/Q10507' },
      ],
      medicalSpecialty: 'Psychiatry',
      currenciesAccepted: 'MXN',
      sameAs: SOCIAL_PROFILES,
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
        { '@type': 'ListItem', position: 2, name: 'Psicóloga en Cancún', item: `${SITE_URL}/psicologo-cancun` },
      ],
    },
  ],
};

/* ═══════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function PsicologoCancun() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const cleanupSeo = applySeo({
      title: 'Psicóloga en Cancún — TCC para Ansiedad y Depresión | Psic. Noemi Eb.',
      description: 'Psicóloga en Cancún con enfoque cognitivo conductual. Terapia para ansiedad, depresión y adolescentes. Psic. Noemi Eb. — agenda por WhatsApp: 998 850 2475.',
      canonical: `${SITE_URL}/psicologo-cancun`,
    });
    const cleanupSchema = injectSchema('schema-psicologo-cancun', schema);
    return () => { cleanupSeo(); cleanupSchema(); };
  }, []);

  return (
    <>
      <Head>
        <title>Psicóloga en Cancún — TCC para Ansiedad y Depresión | Psic. Noemi Eb.</title>
        <meta name="description" content="Psicóloga en Cancún con enfoque cognitivo conductual. Terapia para ansiedad, depresión y adolescentes. Psic. Noemi Eb. — agenda por WhatsApp: 998 850 2475." />
        <link rel="canonical" href={`${SITE_URL}/psicologo-cancun`} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="es_MX" />
        <meta property="og:site_name" content="Mente Sana y Libre" />
        <meta property="og:title" content="Psicóloga en Cancún — TCC para Ansiedad y Depresión | Psic. Noemi Eb." />
        <meta property="og:description" content="Atención psicológica profesional en Cancún con enfoque cognitivo conductual. Para ansiedad, depresión y adolescentes." />
        <meta property="og:url" content={`${SITE_URL}/psicologo-cancun`} />
        <meta property="og:image" content={SPECIALIST_IMAGE} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Psicóloga en Cancún | Psic. Noemi Eb." />
        <meta name="twitter:description" content="TCC para ansiedad, depresión y adolescentes en Cancún. Agenda por WhatsApp: 998 850 2475." />
        <meta name="twitter:image" content={SPECIALIST_IMAGE} />
        <meta name="geo.region" content="MX-ROO" />
        <meta name="geo.placename" content="Cancún, Quintana Roo" />
        <meta name="geo.position" content={`${GEO.latitude};${GEO.longitude}`} />
        <meta name="ICBM" content={`${GEO.latitude}, ${GEO.longitude}`} />
      </Head>

      <div className="antialiased w-full min-w-0 overflow-x-hidden" style={{ color: '#1a4a4a', background: '#fff' }}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold focus:text-sm focus:text-white" style={{ background: '#1a4a4a' }}>
          Saltar al contenido principal
        </a>
        <Navbar />

        <main id="main-content" className="w-full min-w-0 overflow-x-hidden">

          {/* ══════════════════════════════════════════════════════
              HERO — lighter bg for local SEO page
              ══════════════════════════════════════════════════════ */}
          <section
            aria-labelledby="hero-heading"
            className="relative flex flex-col justify-center overflow-hidden"
            style={{ background: '#f0f6f6', paddingTop: '72px', minHeight: '60vh', borderBottom: '1px solid rgba(26,74,74,0.1)' }}
          >
            <div aria-hidden="true" className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(45,112,112,0.08) 0%, transparent 70%)' }} />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 w-full py-14 sm:py-18 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 items-center">
                <div>
                  {/* Local SEO tags */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {['Cancún, Q. Roo', 'TCC · Evidencia', 'Presencial y en línea'].map((tag) => (
                      <span key={tag} className="text-[11px] font-semibold px-3 py-1 rounded-full" style={{ background: 'rgba(45,112,112,0.12)', color: '#2d7070' }}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h1 id="hero-heading" className="font-serif font-bold leading-tight mb-4" style={{ fontSize: 'clamp(2rem,5vw,3rem)', color: '#1a4a4a' }}>
                    Psicóloga en Cancún<br />
                    <span style={{ color: '#2d7070' }}>Terapia Cognitivo Conductual</span>
                  </h1>

                  <p className="text-base leading-relaxed mb-8 max-w-[56ch]" style={{ color: '#517171', lineHeight: '1.8' }}>
                    Atención psicológica profesional en Cancún con enfoque cognitivo conductual (TCC).
                    Para ansiedad, depresión, estrés y adolescentes. Proceso estructurado, resultados
                    concretos, duración definida.
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <a
                      href={waUrl('Hola Psic. Noemi, vi tu página y me gustaría saber más sobre la terapia que ofreces.')}
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
                      href={`tel:${PHONE_E164}`}
                      className="inline-flex items-center gap-2 font-semibold text-sm px-6 py-3.5 rounded-xl transition-all"
                      style={{ color: '#1a4a4a', border: '1.5px solid rgba(26,74,74,0.3)' }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = '#1a4a4a')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(26,74,74,0.3)')}
                    >
                      <Phone className="w-4 h-4" aria-hidden="true" />
                      998 850 2475
                    </a>
                  </div>
                </div>

                {/* Photo — visible on large screens */}
                <div className="hidden lg:block">
                  <Image
                    src={SPECIALIST_IMAGE}
                    alt={`${SPECIALIST_FULL} — Psicóloga en Cancún`}
                    width={280}
                    height={340}
                    className="object-cover object-top"
                    style={{ borderRadius: '20px 60px 20px 20px', boxShadow: '0 20px 60px rgba(26,74,74,0.18)' }}
                    priority
                    unoptimized
                  />
                </div>
              </div>
            </div>
          </section>


          {/* ══════════════════════════════════════════════════════
              SERVICIOS — 3 cards
              ══════════════════════════════════════════════════════ */}
          <section aria-labelledby="servicios-heading" className="py-16 sm:py-20" style={{ background: '#fff' }}>
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
              <SectionReveal>
                <p className="text-[10px] font-bold uppercase tracking-widest text-center mb-2" style={{ color: '#2d7070' }}>Especialidades</p>
                <h2 id="servicios-heading" className="font-serif font-bold text-center leading-tight mb-4" style={{ fontSize: 'clamp(1.7rem,4vw,2.4rem)', color: '#1a4a4a' }}>
                  Servicios de psicología en Cancún
                </h2>
                <div className="w-10 h-0.5 rounded-full mx-auto mb-10" style={{ background: '#2d7070' }} />
              </SectionReveal>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {services.map((svc, i) => (
                  <SectionReveal key={svc.href} delay={i * 0.08}>
                    <div
                      className="bg-white rounded-2xl p-6 flex flex-col h-full transition-all hover:-translate-y-1"
                      style={{ border: '1px solid rgba(26,74,74,0.1)', boxShadow: '0 2px 12px rgba(26,74,74,0.04)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 10px 32px rgba(26,74,74,0.1)')}
                      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(26,74,74,0.04)')}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center justify-center rounded-xl shrink-0" style={{ width: '44px', height: '44px', background: svc.badgeBg }}>
                          <svc.icon className="w-5 h-5" style={{ color: svc.badge }} aria-hidden="true" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest rounded-full px-2.5 py-1" style={{ background: svc.badgeBg, color: svc.badge }}>
                          {svc.label}
                        </span>
                      </div>
                      <h3 className="font-serif font-bold text-base mb-2" style={{ color: '#1a4a4a' }}>{svc.title}</h3>
                      <p className="text-sm leading-relaxed flex-1 mb-5" style={{ color: '#517171', lineHeight: '1.7' }}>{svc.desc}</p>
                      <Link
                        href={svc.href}
                        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest transition-all hover:gap-2.5"
                        style={{ color: '#2d7070' }}
                      >
                        Ver servicio
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </Link>
                    </div>
                  </SectionReveal>
                ))}
              </div>
            </div>
          </section>


          {/* ══════════════════════════════════════════════════════
              CONTEXT LOCAL — por qué Cancún
              ══════════════════════════════════════════════════════ */}
          <section aria-labelledby="local-heading" className="py-16 sm:py-20" style={{ background: '#f8fafa' }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              <SectionReveal>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#2d7070' }}>Contexto local</p>
                <h2 id="local-heading" className="font-serif font-bold leading-tight mb-4" style={{ fontSize: 'clamp(1.7rem,4vw,2.4rem)', color: '#1a4a4a' }}>
                  Salud mental en Cancún — un contexto específico
                </h2>
                <div className="w-10 h-0.5 rounded-full mb-6" style={{ background: '#2d7070' }} />
                <div className="prose-sm max-w-[60ch]" style={{ color: '#517171' }}>
                  <p className="text-sm leading-relaxed mb-4" style={{ lineHeight: '1.85' }}>
                    Cancún tiene una de las industrias de turismo y servicios más intensas de México.
                    El estrés laboral, la inestabilidad económica por temporadas y estar lejos de familia
                    de origen son factores que afectan la salud mental de muchos residentes.
                  </p>
                  <p className="text-sm leading-relaxed mb-4" style={{ lineHeight: '1.85' }}>
                    La rotación laboral alta, los horarios irregulares y la presión del sector servicios
                    crean un entorno donde la ansiedad y el agotamiento crónico son más comunes de lo que se habla.
                  </p>
                  <p className="text-sm leading-relaxed font-medium" style={{ lineHeight: '1.85', color: '#1a4a4a' }}>
                    La terapia psicológica no es un lujo — es salud. Y en Cancún, hay contextos específicos
                    que vale la pena trabajar con alguien que entiende este entorno.
                  </p>
                </div>
              </SectionReveal>
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
                      alt={`${SPECIALIST_FULL} — Psicóloga en Cancún`}
                      width={200}
                      height={240}
                      className="object-cover object-top"
                      style={{ borderRadius: '16px 40px 16px 16px', maxWidth: '180px', boxShadow: '0 12px 40px rgba(26,74,74,0.18)' }}
                      loading="lazy"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#2d7070' }}>Sobre la especialista</p>
                    <h2 id="about-heading" className="font-serif font-bold mb-3" style={{ fontSize: 'clamp(1.4rem,3vw,1.9rem)', color: '#1a4a4a' }}>
                      {SPECIALIST_FULL}
                    </h2>
                    <p className="text-sm leading-relaxed mb-4" style={{ color: '#517171', lineHeight: '1.8' }}>
                      Psicoterapeuta en Cancún con formación en terapia cognitivo conductual. Atiende adultos con ansiedad,
                      depresión y estrés, y adolescentes de 12 a 18 años. Práctica presencial y en línea.
                    </p>
                    <p className="text-sm leading-relaxed mb-5" style={{ color: '#517171', lineHeight: '1.8' }}>
                      La TCC es el enfoque que uso porque tiene resultados medibles, duración definida y
                      porque el objetivo es que al terminar no necesites terapia continua.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        'Licenciada en Psicología',
                        'Especialización en TCC',
                        'Adultos y adolescentes',
                        'Presencial y en línea — Cancún',
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
              FAQ — local SEO questions
              ══════════════════════════════════════════════════════ */}
          <section aria-labelledby="faq-heading" className="py-16 sm:py-20" style={{ background: '#f8fafa' }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              <SectionReveal>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#2d7070' }}>Dudas frecuentes</p>
                <h2 id="faq-heading" className="font-serif font-bold leading-tight mb-4" style={{ fontSize: 'clamp(1.7rem,4vw,2.4rem)', color: '#1a4a4a' }}>
                  Preguntas sobre psicología en Cancún
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
              LOCATION — address + hours
              ══════════════════════════════════════════════════════ */}
          <section id="ubicacion" aria-labelledby="ubicacion-heading" className="py-16 sm:py-20 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              <SectionReveal>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#2d7070' }}>Consultorio</p>
                <h2 id="ubicacion-heading" className="font-serif font-bold leading-tight mb-4" style={{ fontSize: 'clamp(1.7rem,4vw,2.4rem)', color: '#1a4a4a' }}>
                  Dónde y cuándo
                </h2>
                <div className="w-10 h-0.5 rounded-full mb-8" style={{ background: '#2d7070' }} />
              </SectionReveal>

              <SectionReveal delay={0.1}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                  {[
                    {
                      icon: MapPin,
                      label: 'Dirección',
                      content: (
                        <div className="text-sm" style={{ color: '#1a4a4a', lineHeight: '1.65' }}>
                          <p>{ADDRESS.streetAddress}</p>
                          <p>{ADDRESS.addressLocality}, {ADDRESS.addressRegion}</p>
                          <p style={{ color: '#517171' }}>C.P. {ADDRESS.postalCode}</p>
                        </div>
                      ),
                    },
                    {
                      icon: Clock,
                      label: 'Horario',
                      content: (
                        <div className="text-sm" style={{ color: '#1a4a4a', lineHeight: '1.65' }}>
                          <p>Lun–Vie &nbsp;{HOURS.weekdays.display}</p>
                          <p>Sábados &nbsp;{HOURS.saturday.display}</p>
                          <p style={{ color: '#517171' }}>Domingos: cerrado</p>
                        </div>
                      ),
                    },
                    {
                      icon: Phone,
                      label: 'Contacto',
                      content: (
                        <div className="flex flex-col gap-2">
                          <a href={`tel:${PHONE_E164}`} className="text-sm font-medium hover:underline" style={{ color: '#1a4a4a' }}>
                            998 850 2475
                          </a>
                          <a
                            href={waUrl('Hola Psic. Noemi, me gustaría agendar una cita.')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium hover:underline"
                            style={{ color: '#25d366' }}
                          >
                            WhatsApp →
                          </a>
                        </div>
                      ),
                    },
                  ].map(({ icon: Icon, label, content }) => (
                    <div key={label} className="flex gap-4 p-5 rounded-2xl items-start" style={{ background: '#f8fafa', border: '1px solid rgba(26,74,74,0.1)' }}>
                      <div className="flex items-center justify-center shrink-0 rounded-xl" style={{ width: '40px', height: '40px', background: 'rgba(45,112,112,0.12)' }}>
                        <Icon className="w-4 h-4" style={{ color: '#2d7070' }} aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#2d7070' }}>{label}</p>
                        {content}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${GEO.latitude},${GEO.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-xl transition-all"
                    style={{ color: '#1a4a4a', border: '1.5px solid rgba(26,74,74,0.25)', background: '#fff' }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = '#1a4a4a')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(26,74,74,0.25)')}
                  >
                    <Navigation className="w-4 h-4" aria-hidden="true" />
                    Cómo llegar
                  </a>
                  <a
                    href={waUrl('Hola Psic. Noemi, me gustaría agendar una cita en tu consultorio de Cancún.')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-xl text-white transition-all hover:opacity-90"
                    style={{ background: '#25d366' }}
                  >
                    <MessageCircle className="w-4 h-4" aria-hidden="true" />
                    WhatsApp
                  </a>
                </div>
              </SectionReveal>
            </div>
          </section>


          {/* ══════════════════════════════════════════════════════
              CTA FINAL
              ══════════════════════════════════════════════════════ */}
          <section id="cta-final" aria-label="Agendar cita" className="py-16 sm:py-20" style={{ background: '#0d3333' }}>
            <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
              <SectionReveal>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>Agenda en Cancún</p>
                <h2 className="font-serif font-bold text-white mb-4" style={{ fontSize: 'clamp(1.7rem,4vw,2.4rem)' }}>
                  ¿Buscas psicólogo en Cancún?
                </h2>
                <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.7)', lineHeight: '1.8' }}>
                  Escríbeme por WhatsApp para orientación inicial. Sin costo, sin compromiso.
                  Te cuento qué enfoque es el más adecuado para tu situación.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                  <a
                    href={waUrl('Hola Psic. Noemi, estoy buscando psicólogo en Cancún. ¿Podría orientarme?')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 font-bold text-sm px-7 py-3.5 rounded-xl text-white transition-all hover:-translate-y-0.5 hover:brightness-110"
                    style={{ background: '#25d366' }}
                  >
                    <MessageCircle className="w-4 h-4" aria-hidden="true" />
                    Escribir por WhatsApp
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
