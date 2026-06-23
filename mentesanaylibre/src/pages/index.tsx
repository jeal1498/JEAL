import { useState, useRef, useEffect, type ReactNode } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight, Brain, FileText, CheckCircle2,
  ShieldCheck, MessageCircle, Phone, Clock, Award,
  Star, Users, CalendarCheck, Stethoscope, ChevronDown,
  Shield, BadgeCheck, Briefcase, HeartHandshake,
  MapPin, Navigation, ClipboardList,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { WA_NUMBER, PHONE_NUMBER, PHONE_E164, waUrl, SOCIAL_PROFILES } from '@/lib/contact';
import { SITE_URL, CEDULA, SPECIALIST_IMAGE, SPECIALIST_NAME, SPECIALIST_FULL, REVIEWS, GEO, ADDRESS } from '@/lib/site';
import type { Service, Credential, Review, FaqItem } from '@/types/portfolio';

/* ═══════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════ */

const services: Service[] = [
  {
    slug: '/terapia-individual-cancun',
    icon: Briefcase,
    label: 'TCC Adultos',
    title: 'Terapia Cognitivo Conductual',
    age: '+18 años',
    desc: 'Ansiedad, depresión o estrés que ya no puedes manejar sola. TCC estructurada con técnicas concretas — no sesiones indefinidas de desahogo.',
    price: '$800–$1,200 MXN / sesión',
    tests: ['BAI', 'BDI-II', 'Reestructuración cognitiva', 'Exposición gradual'],
    cta: '¿Quieres saber si la TCC es para ti?',
    color: 'from-accent-blue/15 to-primary/10',
    borderHover: 'hover:border-accent-blue/50',
  },
  {
    slug: '/terapia-adolescentes-cancun',
    icon: Users,
    label: 'Adolescentes',
    title: 'Terapia para Adolescentes',
    age: '12–18 años',
    desc: 'Aislamiento, ansiedad escolar, agresividad o caída en rendimiento. Incluye trabajo con padres para sostener los cambios en casa.',
    price: '$800–$1,200 MXN / sesión',
    tests: ['BDI-Y', 'MASC', 'Regulación emocional', 'Habilidades sociales'],
    cta: '¿Preocupado/a por tu adolescente?',
    color: 'from-accent-sand/20 to-primary/10',
    borderHover: 'hover:border-accent-sand/60',
  },
  {
    slug: '/terapia-ansiedad-depresion-cancun',
    icon: HeartHandshake,
    label: 'Ansiedad y Depresión',
    title: 'Terapia para Ansiedad y Depresión',
    age: 'Adolescentes y adultos',
    desc: 'Crisis de pánico, pensamientos que no paran, o días sin energía. TCC con 500+ estudios que la avalan para ansiedad y depresión.',
    price: '$800–$1,200 MXN / sesión',
    tests: ['BAI', 'BDI-II', 'Exposición gradual', 'Mindfulness cognitivo'],
    cta: 'Quiero dejar de sentirme así',
    color: 'from-accent-pink/15 to-primary/10',
    borderHover: 'hover:border-accent-pink/50',
  },
];

const faqItems: FaqItem[] = [
  {
    q: '¿Qué es la terapia cognitivo conductual (TCC)?',
    a: 'La TCC es un modelo de psicoterapia basado en evidencia científica que trabaja la relación entre pensamientos, emociones y conductas. A diferencia de otras terapias, la TCC es estructurada, orientada a metas concretas y tiene un proceso con inicio y fin definidos. Está avalada por más de 500 estudios clínicos y es el tratamiento de primera línea para ansiedad, depresión, TOC y fobia social según la OMS y la APA.',
  },
  {
    q: '¿Cuántas sesiones voy a necesitar?',
    a: 'Depende de lo que estés viviendo. Para ansiedad o depresión moderada, la mayoría de personas ve cambios significativos entre la sesión 6 y la 12. Para casos más complejos o con mayor historia, el proceso puede extenderse. En la primera sesión establecemos metas concretas y te doy una estimación realista del tiempo.',
  },
  {
    q: '¿Cuánto cuesta la terapia?',
    a: 'Cada sesión tiene un costo de $800 a $1,200 MXN (50 minutos). El precio depende del tipo de consulta y si es presencial o en línea. La primera sesión de evaluación tiene el mismo costo que las demás sesiones regulares.',
  },
  {
    q: '¿Puedo hacer terapia en línea?',
    a: 'Sí. Las sesiones en línea tienen la misma efectividad que las presenciales para la mayoría de los problemas que atiende la TCC. Solo necesitas un espacio privado y conexión estable a internet. Si estás en Cancún y prefieres presencial, también puedo atenderte en el consultorio.',
  },
  {
    q: '¿La TCC funciona para adolescentes?',
    a: 'Sí, y es uno de los enfoques con más evidencia para esta edad. La TCC adaptada a adolescentes incluye técnicas de regulación emocional, habilidades sociales y trabajo con los padres para que los cambios se sostengan en casa. La participación de los padres en algunas sesiones hace que los resultados sean más duraderos.',
  },
  {
    q: '¿Qué pasa si mi hijo/a no quiere ir al psicólogo?',
    a: 'Es normal. Muchos adolescentes llegan resistentes y cambian cuando experimentan que el espacio es seguro y no se les juzga. Lo primero que trabajamos es generar confianza. También puedo orientarte primero a ti como padre/madre sobre cómo manejar la situación antes de que el/la adolescente venga.',
  },
  {
    q: '¿Cómo sé si lo que siento necesita terapia o es algo que "se me va a pasar"?',
    a: 'Una buena regla: si lo que sientes lleva más de 2 semanas afectando tu trabajo, tus relaciones o tu calidad de vida — ya merece atención profesional. La ansiedad y la depresión no "se van solas" con el tiempo si no se trabajan. Y entre más tiempo pasa, más arraigados se vuelven los patrones. Una primera sesión de evaluación puede darte mucha claridad.',
  },
  {
    q: '¿Puedo cancelar o reprogramar una cita?',
    a: 'Sí, con al menos 24 horas de anticipación. Fuera de ese plazo se aplica cargo por cancelación. Me comprometo a ser flexible ante emergencias reales — solo avísame lo antes posible por WhatsApp.',
  },
];

/* ═══════════════════════════════════════════════════════════════
   SCHEMA LD+JSON
   ═══════════════════════════════════════════════════════════════ */

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['MedicalBusiness', 'MedicalClinic'],
      '@id': `${SITE_URL}/#clinic`,
      name: 'Psic. Noemi Eb. — Mente Sana y Libre · Terapia Cognitivo Conductual en Cancún',
      alternateName: 'Mente Sana y Libre',
      url: SITE_URL,
      telephone: PHONE_E164,
      image: SPECIALIST_IMAGE,
      description: 'Consultorio de psicología con enfoque cognitivo conductual (TCC) en Cancún, Quintana Roo. Especialista en ansiedad, depresión y terapia para adolescentes.',
      address: {
        '@type': 'PostalAddress',
        ...ADDRESS,
      },
      geo: { '@type': 'GeoCoordinates', latitude: GEO.latitude, longitude: GEO.longitude },
      openingHoursSpecification: [
        { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '19:00' },
        { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '09:00', closes: '14:00' },
      ],
      priceRange: '$800 - $1,200 MXN por sesión',
      medicalSpecialty: 'Psychiatry',
      currenciesAccepted: 'MXN',
      paymentAccepted: 'Efectivo, Transferencia bancaria, Tarjeta',
      areaServed: [
        { '@type': 'City', name: 'Cancún', sameAs: 'https://www.wikidata.org/wiki/Q8969' },
        { '@type': 'AdministrativeArea', name: 'Quintana Roo', sameAs: 'https://www.wikidata.org/wiki/Q10507' },
        { '@type': 'AdministrativeArea', name: 'Riviera Maya' },
      ],
      member: { '@id': `${SITE_URL}/#physician` },
      sameAs: SOCIAL_PROFILES,
    },
    {
      '@type': 'Physician',
      '@id': `${SITE_URL}/#physician`,
      name: SPECIALIST_FULL,
      jobTitle: 'Psicoterapeuta con enfoque cognitivo conductual',
      url: SITE_URL,
      image: SPECIALIST_IMAGE,
      telephone: PHONE_E164,
      hasCredential: {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'Cédula Profesional Federal',
        credentialId: CEDULA,
        issuedBy: { '@type': 'Organization', name: 'Secretaría de Educación Pública, México' },
      },
      medicalSpecialty: 'Psychiatry',
      knowsAbout: [
        { '@type': 'MedicalCondition', name: 'Trastorno de ansiedad generalizada' },
        { '@type': 'MedicalCondition', name: 'Depresión mayor', sameAs: 'https://www.wikidata.org/wiki/Q42844' },
        { '@type': 'MedicalCondition', name: 'Fobia social' },
      ],
      areaServed: [
        { '@type': 'City', name: 'Cancún', sameAs: 'https://www.wikidata.org/wiki/Q8969' },
        { '@type': 'AdministrativeArea', name: 'Quintana Roo', sameAs: 'https://www.wikidata.org/wiki/Q10507' },
      ],
      sameAs: SOCIAL_PROFILES,
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: 'Psic. Noemi Eb. — Mente Sana y Libre',
      url: SITE_URL,
      inLanguage: 'es-MX',
      publisher: { '@id': `${SITE_URL}/#physician` },
    },
    {
      '@type': 'MedicalWebPage',
      name: 'Psicóloga en Cancún — TCC para Ansiedad y Depresión | Psic. Noemi Eb.',
      url: SITE_URL,
      description: `Terapia cognitivo conductual (TCC) para ansiedad, depresión y adolescentes en Cancún. Proceso estructurado con técnicas basadas en evidencia. ${SPECIALIST_FULL}, cédula ${CEDULA}.`,
      inLanguage: 'es-MX',
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: [
        { '@type': 'MedicalCondition', name: 'Trastorno de ansiedad' },
        { '@type': 'MedicalCondition', name: 'Depresión mayor' },
      ],
      reviewedBy: { '@id': `${SITE_URL}/#physician` },
      lastReviewed: '2026-06-23',
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
        ],
      },
    },
    {
      '@type': 'MedicalProcedure',
      name: 'Terapia Cognitivo Conductual para Adultos',
      url: `${SITE_URL}/terapia-individual-cancun`,
      procedureType: 'TherapeuticProcedure',
      provider: { '@id': `${SITE_URL}/#physician` },
      location: { '@id': `${SITE_URL}/#clinic` },
      offers: { '@type': 'Offer', price: '800', priceCurrency: 'MXN' },
    },
    {
      '@type': 'MedicalProcedure',
      name: 'Terapia Cognitivo Conductual para Adolescentes',
      url: `${SITE_URL}/terapia-adolescentes-cancun`,
      procedureType: 'TherapeuticProcedure',
      provider: { '@id': `${SITE_URL}/#physician` },
      location: { '@id': `${SITE_URL}/#clinic` },
      offers: { '@type': 'Offer', price: '800', priceCurrency: 'MXN' },
    },
    {
      '@type': 'MedicalProcedure',
      name: 'Terapia para Ansiedad y Depresión',
      url: `${SITE_URL}/terapia-ansiedad-depresion-cancun`,
      procedureType: 'TherapeuticProcedure',
      provider: { '@id': `${SITE_URL}/#physician` },
      location: { '@id': `${SITE_URL}/#clinic` },
      offers: { '@type': 'Offer', price: '800', priceCurrency: 'MXN' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqItems.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ],
};

/* ═══════════════════════════════════════════════════════════════
   UTILITY COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function SectionReveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setRevealed(true); observer.unobserve(el); } },
      { rootMargin: '0px 0px 50px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={revealed ? { animation: `sectionReveal 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s both` } : undefined}
    >
      {children}
    </div>
  );
}

/* ─── service badge colours ─── */
const svcBadge = [
  { bg: '#d0e7d4', color: '#1a4a4a', hoverBorder: '#d0e7d4cc' },
  { bg: '#f5e4c5', color: '#6b4e1a', hoverBorder: '#f5e4c5cc' },
  { bg: '#c5ddf0', color: '#1a3a6a', hoverBorder: '#c5ddf0cc' },
];

/* ─── about section credential list ─── */
const aboutCreds = [
  'Psicóloga con enfoque cognitivo conductual (TCC)',
  'Especializada en ansiedad, depresión y terapia con adolescentes',
  'Aplicación de BAI, BDI-II y escalas de evaluación clínica',
  'Atención presencial en Cancún y en línea',
  'Consulta psicológica profesional adolescentes y adultos',
  'Cancún, Quintana Roo',
];

/* ─── symptom list ─── */
const symptoms = [
  'Me cuesta trabajo dejar de preocuparme por cosas del día a día',
  'Me siento agotada/o aunque no haya hecho nada físicamente exigente',
  'Tengo episodios donde siento el corazón acelerado o dificultad para respirar',
  'He dejado de hacer cosas que antes disfrutaba',
  'Mis pensamientos negativos se repiten aunque intente detenerlos',
  'Me irrito con facilidad o tengo cambios de humor frecuentes',
  'Me cuesta concentrarme o tomar decisiones simples',
  'He pensado que estaría mejor si simplemente no sintieras nada',
];

function getSymptomResult(count: number): { text: string; level: 'low' | 'mid' | 'high' } {
  if (count <= 2) return { text: 'Parece que estás manejando bien el momento. Si algo cambia, aquí estamos.', level: 'low' };
  if (count <= 5) return { text: 'Estas señales merecen atención. Una evaluación inicial puede darte claridad.', level: 'mid' };
  return { text: 'Lo que describes sugiere que la terapia puede ayudarte significativamente. No tienes que seguir así.', level: 'high' };
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE — HOME
   ═══════════════════════════════════════════════════════════════ */

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showStickyCta, setShowStickyCta] = useState(false);
  const [checkedSymptoms, setCheckedSymptoms] = useState<boolean[]>(Array(symptoms.length).fill(false));
  const [showSymptomResult, setShowSymptomResult] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = 600;
      const footerCta = document.getElementById('cta-final');
      const footerCtaTop = footerCta?.getBoundingClientRect().top ?? Infinity;
      setShowStickyCta(window.scrollY > heroHeight && footerCtaTop > window.innerHeight);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSymptom = (i: number) => {
    setCheckedSymptoms((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
    setShowSymptomResult(false);
  };

  const symptomCount = checkedSymptoms.filter(Boolean).length;
  const symptomResult = getSymptomResult(symptomCount);

  return (
    <>
      <Head>
        <title>{`Psicóloga en Cancún — TCC para Ansiedad y Depresión | ${SPECIALIST_FULL} · Mente Sana y Libre`}</title>
        <meta name="description" content="Terapia cognitivo conductual (TCC) para ansiedad, depresión y adolescentes en Cancún. Proceso estructurado con técnicas basadas en evidencia. Primera sesión sin compromiso — Psic. Noemi Eb." />
        <link rel="canonical" href={`${SITE_URL}/`} />

        <meta name="geo.region" content="MX-ROO" />
        <meta name="geo.placename" content="Cancún, Quintana Roo" />
        <meta name="geo.position" content={`${GEO.latitude};${GEO.longitude}`} />
        <meta name="ICBM" content={`${GEO.latitude}, ${GEO.longitude}`} />

        <meta property="og:type" content="website" />
        <meta property="og:locale" content="es_MX" />
        <meta property="og:site_name" content="Mente Sana y Libre — Psic. Noemi Eb." />
        <meta property="og:title" content={`Psicóloga en Cancún — TCC para Ansiedad y Depresión | ${SPECIALIST_FULL}`} />
        <meta property="og:description" content="Terapia cognitivo conductual para ansiedad, depresión y adolescentes en Cancún. Un proceso claro con técnicas basadas en evidencia. No sesiones indefinidas." />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:image" content={SPECIALIST_IMAGE} />
        <meta property="og:image:width" content="465" />
        <meta property="og:image:height" content="533" />
        <meta property="og:image:alt" content={`${SPECIALIST_FULL} — Psicóloga con enfoque cognitivo conductual en Cancún`} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Psicóloga en Cancún — TCC | ${SPECIALIST_FULL}`} />
        <meta name="twitter:description" content="Terapia cognitivo conductual para ansiedad, depresión y adolescentes. Cancún, Q. Roo." />
        <meta name="twitter:image" content={SPECIALIST_IMAGE} />

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          speakable: { '@type': 'SpeakableSpecification', cssSelector: ['#servicios', '#sobre-mi', '#ubicacion'] },
          url: SITE_URL,
        }) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </Head>

      <div className="antialiased w-full min-w-0 overflow-x-hidden" style={{ color: '#1a4a4a', background: '#fff' }}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:font-bold focus:text-sm">
          Saltar al contenido principal
        </a>
        <Navbar />

        <main id="main-content" className="w-full min-w-0 overflow-x-hidden">

          {/* ══════════════════════════════════════════════════════
              1 · HERO — dark teal, routing cards, photo badge
              ══════════════════════════════════════════════════════ */}
          <section
            id="inicio"
            aria-label="Presentación principal"
            className="relative min-h-screen flex flex-col justify-center overflow-hidden"
            style={{ background: '#0d3333', paddingTop: '72px' }}
          >
            {/* Radial glow decorations */}
            <div aria-hidden="true" className="absolute top-0 right-0 w-[480px] h-[480px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(195,225,225,0.07) 0%, transparent 70%)' }} />
            <div aria-hidden="true" className="absolute bottom-0 left-0 w-[320px] h-[320px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(45,112,112,0.18) 0%, transparent 70%)' }} />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full py-16 sm:py-20 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                {/* Left: copy */}
                <div className="animate-[fadeInUp_0.8s_ease-out_both]">
                  <div className="text-center">
                    {/* Credential bar */}
                    <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 mb-6">
                      {['Psic. Noemi Eb.', 'Cancún, Q. Roo', 'Enfoque cognitivo conductual'].map((item, i) => (
                        <span key={item} className="flex items-center gap-1.5 text-xs font-semibold tracking-wide" style={{ color: 'rgba(195,225,225,0.8)' }}>
                          {i > 0 && <span aria-hidden="true" className="inline-block w-1 h-1 rounded-full" style={{ background: 'rgba(195,225,225,0.45)' }} />}
                          {item}
                        </span>
                      ))}
                    </div>

                    <h1 className="font-serif font-bold text-white leading-[1.08] mb-4" style={{ fontSize: 'clamp(1.9rem, 9vw, 5rem)' }}>
                      Psicóloga<br />en Cancún
                    </h1>

                    <p className="font-serif font-normal italic leading-snug mb-5" style={{ fontSize: 'clamp(1.3rem, 3vw, 1.75rem)', color: 'rgba(195,225,225,0.72)' }}>
                      Mente sana y libre — sin atajos, con herramientas reales
                    </p>

                    <p className="text-base leading-relaxed mb-8 max-w-[54ch] mx-auto" style={{ color: 'rgba(195,225,225,0.82)' }}>
                      <strong className="text-white font-semibold">TCC</strong> para ansiedad, depresión y adolescentes.
                      Un proceso claro con técnicas basadas en evidencia.
                      No sesiones indefinidas.
                    </p>
                  </div>

                  {/* Routing cards — vertical column */}
                  <div className="flex flex-col gap-2.5 mb-8 animate-[fadeIn_0.8s_ease-out_0.35s_both]">
                    {[
                      { href: '/terapia-ansiedad-depresion-cancun', label: 'Para mí', text: 'Siento ansiedad, estrés o tristeza que ya no puedo ignorar' },
                      { href: '/terapia-adolescentes-cancun', label: 'Para mi hijo/a', text: 'Mi adolescente tiene cambios de conducta, ansiedad o bajo rendimiento' },
                      { href: '/terapia-individual-cancun', label: 'TCC', text: 'Quiero entender qué es la terapia cognitivo conductual y cómo funciona' },
                    ].map((card) => (
                      <Link
                        key={card.href}
                        href={card.href}
                        className="group flex items-center gap-3 p-4 rounded-xl transition-all duration-200 hover:translate-x-1"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(195,225,225,0.18)' }}
                      >
                        <div className="flex-1 min-w-0">
                          <span className="block text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'rgba(195,225,225,0.65)' }}>{card.label}</span>
                          <span className="block text-sm font-medium leading-snug" style={{ color: 'rgba(255,255,255,0.88)' }}>{card.text}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color: 'rgba(195,225,225,0.5)' }} aria-hidden="true" />
                      </Link>
                    ))}
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-wrap gap-3 justify-center animate-[fadeIn_0.8s_ease-out_0.5s_both]">
                    <a
                      href={waUrl('Hola Psic. Noemi, vi tu página y me gustaría agendar una primera sesión')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 font-bold text-sm px-7 py-3.5 rounded-xl text-white transition-all hover:-translate-y-0.5 hover:brightness-110"
                      style={{ background: '#25d366' }}
                      aria-label="Agendar primera sesión por WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" aria-hidden="true" />
                      Agendar primera sesión
                    </a>
                    <a
                      href="#servicios"
                      onClick={(e) => { e.preventDefault(); document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' }); }}
                      className="inline-flex items-center gap-2 font-semibold text-sm px-7 py-3.5 rounded-xl transition-all hover:bg-white/10"
                      style={{ color: 'rgba(255,255,255,0.88)', border: '1.5px solid rgba(255,255,255,0.32)' }}
                    >
                      Ver servicios
                    </a>
                  </div>
                </div>

                {/* Right: photo + badge */}
                <div className="hidden lg:flex justify-end animate-[fadeIn_1s_ease-out_0.4s_both]">
                  <div className="relative inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={SPECIALIST_IMAGE}
                      alt={`${SPECIALIST_FULL} — Psicóloga con enfoque cognitivo conductual en Cancún`}
                      width={440}
                      height={587}
                      className="block w-full object-cover object-top"
                      style={{ maxWidth: '420px', borderRadius: '20px 20px 80px 20px', boxShadow: '0 30px 80px rgba(0,0,0,0.3)' }}
                    />
                    {/* Photo badge */}
                    <div
                      className="absolute bg-white rounded-2xl"
                      style={{ bottom: '24px', left: '-20px', padding: '14px 18px', minWidth: '210px', boxShadow: '0 8px 32px rgba(26,74,74,0.22)' }}
                    >
                      <p className="text-[11px] font-bold tracking-wide mb-1" style={{ color: '#2d7070' }}>WhatsApp · 998 850 2475</p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: '#25d366' }} />
                        <p className="text-[11px]" style={{ color: '#517171' }}>Primera sesión disponible</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>


          {/* ══════════════════════════════════════════════════════
              2 · STATS BAR — social proof strip
              ══════════════════════════════════════════════════════ */}
          <section aria-label="Métricas de experiencia" className="bg-white border-b border-border">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 divide-x divide-border">
                {[
                  { number: '6+',    label: 'Años de experiencia', mono: false },
                  { number: '300+',  label: 'Pacientes atendidos',  mono: false },
                  { number: 'TCC',   label: 'Enfoque basado en evidencia', mono: false },
                  { number: CEDULA,  label: 'Cédula Profesional SEP', mono: true },
                ].map((stat) => (
                  <div key={stat.label} className="flex flex-col items-center justify-center py-5 px-4 text-center">
                    <span className={`font-serif font-bold leading-none ${stat.mono ? 'text-lg sm:text-2xl' : 'text-[2.25rem]'}`} style={{ color: '#1a4a4a' }}>
                      {stat.number}
                    </span>
                    <span className="text-[10px] font-semibold tracking-widest mt-2 uppercase" style={{ color: '#517171' }}>
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>


          {/* ══════════════════════════════════════════════════════
              3 · SYMPTOM CHECKER — inline interactive
              ══════════════════════════════════════════════════════ */}
          <section className="py-14 sm:py-20 border-b border-border" style={{ background: '#f5fafa' }}>
            <div className="max-w-3xl mx-auto px-6">
              <SectionReveal>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-3 text-center" style={{ color: '#1a4a4a' }}>
                  ¿Reconoces estas señales?
                </h2>
                <p className="text-center max-w-lg mx-auto mb-8 font-light" style={{ color: '#517171' }}>
                  Marca las que sientas con frecuencia. No es un diagnóstico — es un punto de partida.
                </p>
              </SectionReveal>

              <SectionReveal delay={0.1}>
                <div className="bg-white rounded-2xl p-6 sm:p-8" style={{ border: '1px solid rgba(26,74,74,0.1)', boxShadow: '0 4px 24px rgba(26,74,74,0.06)' }}>
                  <div className="flex flex-col gap-3 mb-6">
                    {symptoms.map((symptom, i) => (
                      <label
                        key={i}
                        className="flex items-start gap-3 cursor-pointer group"
                        style={{ padding: '10px 12px', borderRadius: '10px', background: checkedSymptoms[i] ? 'rgba(26,74,74,0.06)' : 'transparent', transition: 'background 0.15s' }}
                      >
                        <div className="relative shrink-0 mt-0.5">
                          <input
                            type="checkbox"
                            checked={checkedSymptoms[i]}
                            onChange={() => toggleSymptom(i)}
                            className="sr-only"
                          />
                          <div
                            className="w-5 h-5 rounded flex items-center justify-center transition-all duration-150"
                            style={{
                              border: checkedSymptoms[i] ? '2px solid #1a4a4a' : '2px solid rgba(26,74,74,0.25)',
                              background: checkedSymptoms[i] ? '#1a4a4a' : 'transparent',
                            }}
                          >
                            {checkedSymptoms[i] && (
                              <svg viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '10px', height: '10px' }} aria-hidden="true">
                                <polyline points="2,6 5,9 10,3" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <span className="text-sm leading-relaxed" style={{ color: checkedSymptoms[i] ? '#1a4a4a' : '#517171', fontWeight: checkedSymptoms[i] ? '500' : '400' }}>
                          {symptom}
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* Counter + action */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-4" style={{ borderTop: '1px solid rgba(26,74,74,0.08)' }}>
                    <div className="text-sm font-medium" style={{ color: '#517171' }}>
                      {symptomCount === 0
                        ? 'Selecciona las que apliquen'
                        : `${symptomCount} de ${symptoms.length} señales marcadas`}
                    </div>
                    <button
                      onClick={() => setShowSymptomResult(true)}
                      disabled={symptomCount === 0}
                      className="sm:ml-auto inline-flex items-center gap-2 font-bold text-sm px-5 py-2.5 rounded-xl text-white transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: '#1a4a4a' }}
                    >
                      Ver qué significa
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>

                  {/* Result message */}
                  {showSymptomResult && symptomCount > 0 && (
                    <div
                      className="mt-4 rounded-xl p-4"
                      style={{
                        background: symptomResult.level === 'high' ? 'rgba(26,74,74,0.08)' : symptomResult.level === 'mid' ? 'rgba(45,112,112,0.07)' : 'rgba(195,225,225,0.2)',
                        border: `1px solid ${symptomResult.level === 'high' ? 'rgba(26,74,74,0.2)' : 'rgba(45,112,112,0.12)'}`,
                      }}
                    >
                      <p className="text-sm font-medium leading-relaxed mb-3" style={{ color: '#1a4a4a' }}>
                        {symptomResult.text}
                      </p>
                      {symptomResult.level !== 'low' && (
                        <a
                          href={waUrl('Hola Psic. Noemi, vi tu página y me gustaría agendar una primera sesión')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 font-bold text-xs uppercase tracking-widest px-4 py-2 rounded-lg text-white transition-all hover:opacity-90"
                          style={{ background: '#25d366' }}
                        >
                          <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                          Hablar con Psic. Noemi
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </SectionReveal>
            </div>
          </section>


          {/* ══════════════════════════════════════════════════════
              4 · SERVICES — clean pill-badge cards
              ══════════════════════════════════════════════════════ */}
          <section id="servicios" aria-labelledby="servicios-heading" className="py-20 scroll-mt-20" style={{ background: '#fff' }}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <SectionReveal>
                <p className="text-[10px] font-bold uppercase tracking-widest text-center mb-2" style={{ color: '#2d7070' }}>Servicios disponibles</p>
                <h2 id="servicios-heading" className="font-serif font-bold text-center leading-tight mb-4" style={{ fontSize: 'clamp(1.9rem,4vw,2.6rem)', color: '#1a4a4a' }}>
                  Terapia con propósito claro
                </h2>
                <div className="w-10 h-0.5 rounded-full mx-auto mb-5" style={{ background: '#2d7070' }} />
                <p className="text-base font-light text-center max-w-xl mx-auto mb-12" style={{ color: '#517171' }}>
                  Cada proceso tiene un inicio, un desarrollo y un cierre. Herramientas concretas que sigues usando sola al terminar.
                </p>
              </SectionReveal>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {services.map((service, i) => (
                  <SectionReveal key={service.slug} delay={i * 0.1}>
                    <div
                      className="bg-white rounded-2xl p-7 flex flex-col transition-all duration-250 hover:-translate-y-1"
                      style={{ border: '1px solid rgba(26,74,74,0.07)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.border = `1px solid ${svcBadge[i].hoverBorder}`)}
                      onMouseLeave={(e) => (e.currentTarget.style.border = '1px solid rgba(26,74,74,0.07)')}
                    >
                      <span
                        className="inline-block text-[11px] font-bold tracking-widest uppercase rounded-full px-3 py-1.5 mb-4 w-fit"
                        style={{ background: svcBadge[i].bg, color: svcBadge[i].color }}
                      >
                        {service.label}
                      </span>
                      <h3 className="font-serif font-bold text-xl mb-1" style={{ color: '#1a4a4a' }}>{service.title}</h3>
                      <p className="text-xs font-bold mb-4" style={{ color: '#517171', letterSpacing: '0.02em' }}>
                        {service.age}&nbsp;&nbsp;·&nbsp;&nbsp;{service.price}
                      </p>
                      <p className="text-sm leading-relaxed mb-5 flex-1" style={{ color: '#517171', lineHeight: '1.7' }}>
                        {service.desc}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {service.tests.map((test) => (
                          <span
                            key={test}
                            className="text-[11px] font-bold px-2.5 py-1 rounded-md"
                            style={{ background: '#f5fafa', color: '#2d7070', border: '1px solid rgba(45,112,112,0.15)' }}
                          >
                            {test}
                          </span>
                        ))}
                      </div>
                      <Link
                        href={service.slug}
                        className="block text-center text-xs font-bold uppercase tracking-widest py-2.5 px-5 rounded-lg transition-all"
                        style={{ color: '#1a4a4a', border: '1.5px solid #1a4a4a' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#1a4a4a'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#1a4a4a'; }}
                      >
                        Saber más
                      </Link>
                    </div>
                  </SectionReveal>
                ))}
              </div>

              <SectionReveal delay={0.35}>
                <div className="mt-10 text-center">
                  <p className="text-sm font-light mb-4" style={{ color: '#517171' }}>¿No sabes por dónde empezar?</p>
                  <a
                    href={waUrl('Hola Psic. Noemi, vi tu página y tengo dudas sobre qué tipo de terapia necesito. ¿Podrías orientarme?')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-xl transition-all"
                    style={{ border: '2px solid rgba(26,74,74,0.2)', color: '#1a4a4a' }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(26,74,74,0.5)')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(26,74,74,0.2)')}
                  >
                    <MessageCircle className="w-4 h-4" aria-hidden="true" />
                    Orientación por WhatsApp
                  </a>
                </div>
              </SectionReveal>
            </div>
          </section>


          {/* ══════════════════════════════════════════════════════
              5 · PROCESS — numbered timeline 01-04
              ══════════════════════════════════════════════════════ */}
          <section id="proceso" aria-labelledby="proceso-heading" className="py-20" style={{ background: '#f5fafa' }}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <SectionReveal>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#2d7070' }}>Paso a paso</p>
                <h2 id="proceso-heading" className="font-serif font-bold leading-tight mb-4" style={{ fontSize: 'clamp(1.9rem,4vw,2.6rem)', color: '#1a4a4a' }}>
                  ¿Cómo funciona el proceso?
                </h2>
                <div className="w-10 h-0.5 rounded-full mb-5" style={{ background: '#2d7070' }} />
                <p className="text-base font-light max-w-[52ch] mb-14" style={{ color: '#517171', lineHeight: '1.7' }}>
                  Un proceso estructurado, con objetivos concretos y herramientas que se quedan contigo.
                </p>
              </SectionReveal>

              <div className="flex flex-col max-w-[680px]" style={{ gap: 0 }}>
                {[
                  {
                    n: '01',
                    title: 'Primera sesión',
                    desc: 'Hablamos de lo que estás viviendo, tus metas y resolvemos tus dudas. Sin compromiso.',
                    tag: '50 min · Sin compromiso',
                  },
                  {
                    n: '02',
                    title: 'Evaluación y plan',
                    desc: 'Aplicamos instrumentos (BAI, BDI-II) y diseñamos un plan de trabajo con metas concretas.',
                    tag: 'BAI · BDI-II',
                  },
                  {
                    n: '03',
                    title: 'Sesiones semanales',
                    desc: 'TCC activa: aprendes a identificar y cambiar patrones de pensamiento y conducta.',
                    tag: 'Sesiones semanales',
                  },
                  {
                    n: '04',
                    title: 'Herramientas para siempre',
                    desc: 'Al terminar tienes un plan de mantenimiento y las herramientas para aplicar sola/o.',
                    tag: 'Cierre y autonomía',
                  },
                ].map((step, i, arr) => (
                  <SectionReveal key={step.n} delay={i * 0.1}>
                    <div className="grid" style={{ gridTemplateColumns: '72px 1fr', gap: '1.5rem', paddingBottom: i < arr.length - 1 ? '2.5rem' : 0 }}>
                      {/* Number + connector */}
                      <div style={{ position: 'relative' }}>
                        <div className="font-serif leading-none" style={{ fontSize: '3rem', color: 'rgba(26,74,74,0.18)', lineHeight: '1' }}>{step.n}</div>
                        {i < arr.length - 1 && (
                          <div
                            style={{
                              position: 'absolute',
                              left: '36px',
                              top: '58px',
                              bottom: '-2rem',
                              width: '1px',
                              background: 'linear-gradient(to bottom, rgba(26,74,74,0.2), transparent)',
                            }}
                          />
                        )}
                      </div>
                      {/* Content */}
                      <div style={{ paddingTop: '0.25rem' }}>
                        <h3 className="font-bold mb-2" style={{ fontSize: '1.1rem', color: '#1a4a4a' }}>
                          {step.title}
                        </h3>
                        <p className="text-sm leading-relaxed" style={{ color: '#517171', lineHeight: '1.7' }}>{step.desc}</p>
                        <span
                          className="inline-block text-xs font-semibold rounded-full mt-2.5"
                          style={{ color: '#2d7070', background: '#f0f9f9', border: '1px solid rgba(45,112,112,0.2)', padding: '4px 12px', letterSpacing: '0.06em' }}
                        >
                          {step.tag}
                        </span>
                      </div>
                    </div>
                  </SectionReveal>
                ))}
              </div>
            </div>
          </section>


          {/* ══════════════════════════════════════════════════════
              6 · WHY TCC — differentiator cards
              ══════════════════════════════════════════════════════ */}
          <section id="que-es-tcc" className="py-14 sm:py-20 bg-white">
            <div className="max-w-4xl mx-auto px-6">
              <SectionReveal>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-4 text-center text-balance" style={{ color: '#1a4a4a' }}>
                  ¿Por qué terapia cognitivo conductual?
                </h2>
                <p className="font-light text-center max-w-2xl mx-auto mb-12" style={{ color: '#517171' }}>
                  No es la única terapia que existe. Pero sí la que tiene más estudios, más estructura y más resultados medibles.
                </p>
              </SectionReveal>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  {
                    title: 'La terapia con más evidencia científica',
                    desc: 'Más de 500 estudios clínicos controlados avalan la TCC para ansiedad y depresión. No es una tendencia: es el estándar internacional.',
                  },
                  {
                    title: 'Un proceso con inicio, desarrollo y cierre',
                    desc: 'No son sesiones indefinidas. La TCC tiene un proceso estructurado con metas concretas y herramientas que sigues usando sola al terminar.',
                  },
                  {
                    title: 'Trabaja el presente, no el pasado',
                    desc: 'La TCC no es arqueología emocional. Trabajamos qué pasa HOY: tus pensamientos automáticos, tus reacciones y cómo cambiarlos.',
                  },
                  {
                    title: 'Para ansiedad, depresión, fobias y más',
                    desc: 'Un mismo enfoque, múltiples aplicaciones: trastornos de ansiedad, depresión mayor, TOC, estrés postraumático, fobia social.',
                  },
                ].map((item, i) => (
                  <SectionReveal key={item.title} delay={i * 0.08}>
                    <div
                      className="flex gap-4 p-5 sm:p-6 rounded-2xl border transition-all duration-300 group h-full"
                      style={{ background: '#f5fafa', border: '1px solid rgba(26,74,74,0.08)' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(45,112,112,0.3)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(26,74,74,0.07)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(26,74,74,0.08)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
                        style={{ background: 'rgba(26,74,74,0.1)', border: '1px solid rgba(26,74,74,0.15)' }}
                      >
                        <CheckCircle2 className="w-4 h-4" style={{ color: '#2d7070' }} aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="font-bold mb-1 text-sm" style={{ color: '#1a4a4a' }}>{item.title}</h3>
                        <p className="text-sm font-light leading-relaxed" style={{ color: '#517171' }}>{item.desc}</p>
                      </div>
                    </div>
                  </SectionReveal>
                ))}
              </div>
            </div>
          </section>


          {/* ══════════════════════════════════════════════════════
              7 · ABOUT — dark teal, photo + credentials list
              ══════════════════════════════════════════════════════ */}
          <section id="sobre-mi" aria-labelledby="sobre-heading" className="py-20 scroll-mt-20" style={{ background: '#0d3333' }}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

                {/* Photo */}
                <SectionReveal className="flex justify-center lg:justify-start">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={SPECIALIST_IMAGE}
                    alt={`${SPECIALIST_FULL} — Psicóloga en Cancún`}
                    width={400}
                    height={467}
                    className="block w-full object-cover object-top"
                    style={{ maxWidth: '380px', borderRadius: '20px 80px 20px 20px', boxShadow: '0 24px 64px rgba(0,0,0,0.28)' }}
                    loading="lazy"
                  />
                </SectionReveal>

                {/* Content */}
                <SectionReveal delay={0.1}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(195,225,225,0.6)' }}>
                    Psicoterapeuta certificada
                  </p>
                  <h2 id="sobre-heading" className="font-serif font-bold text-white leading-tight mb-4" style={{ fontSize: 'clamp(1.9rem,4vw,2.6rem)' }}>
                    {SPECIALIST_FULL}
                  </h2>
                  <p className="text-sm font-light mb-2" style={{ color: 'rgba(195,225,225,0.7)' }}>
                    Psicoterapeuta con enfoque cognitivo conductual en Cancún
                  </p>
                  <div className="w-10 h-0.5 rounded-full mb-6" style={{ background: 'rgba(195,225,225,0.4)' }} />

                  <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '1.8' }}>
                    Trabajo con adolescentes y adultos que sienten que la ansiedad, la tristeza o el estrés ya no los dejan vivir como quieren. Mi enfoque es la terapia cognitivo conductual (TCC): el modelo terapéutico con mayor evidencia científica para los problemas emocionales más comunes.
                  </p>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '1.8' }}>
                    Creo que la terapia debe tener un propósito claro y herramientas concretas. No sesiones para hablar del pasado indefinidamente, sino un proceso donde aprendes a entender cómo funciona tu mente y a cambiar los patrones que te están lastimando.
                  </p>
                  <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '1.8' }}>
                    Mi consultorio está en Cancún, donde atiendo de forma presencial. También ofrezco sesiones en línea cuando la situación lo permite.
                  </p>

                  {/* Credentials list */}
                  <div className="mb-8">
                    {aboutCreds.map((cred, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 py-2.5"
                        style={{ borderBottom: i < aboutCreds.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}
                      >
                        <div
                          className="flex items-center justify-center shrink-0 mt-0.5 rounded-full"
                          style={{ width: '20px', height: '20px', background: 'rgba(195,225,225,0.14)' }}
                        >
                          <svg viewBox="0 0 12 12" fill="none" stroke="rgba(195,225,225,0.8)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '11px', height: '11px' }} aria-hidden="true">
                            <polyline points="2,6 5,9 10,3" />
                          </svg>
                        </div>
                        <span className="text-sm" style={{ color: 'rgba(255,255,255,0.78)' }}>{cred}</span>
                      </div>
                    ))}
                  </div>

                  {/* Mini stats */}
                  <div className="flex flex-wrap gap-6 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    {[{ v: '6+', l: 'Años' }, { v: '300+', l: 'Pacientes' }, { v: 'TCC', l: 'Evidencia' }].map((s) => (
                      <div key={s.l}>
                        <p className="font-serif font-bold text-white" style={{ fontSize: '1.8rem', lineHeight: '1' }}>{s.v}</p>
                        <p className="text-[11px] font-semibold uppercase tracking-widest mt-1" style={{ color: 'rgba(195,225,225,0.65)' }}>{s.l}</p>
                      </div>
                    ))}
                  </div>
                </SectionReveal>

              </div>
            </div>
          </section>


          {/* ══════════════════════════════════════════════════════
              8 · TRUST — no-fake-reviews section
              ══════════════════════════════════════════════════════ */}
          <section id="confianza" aria-labelledby="confianza-heading" className="py-20 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              <SectionReveal>
                <p className="text-[10px] font-bold uppercase tracking-widest text-center mb-2" style={{ color: '#2d7070' }}>Por qué elegirnos</p>
                <h2 id="confianza-heading" className="font-serif font-bold text-center leading-tight mb-4" style={{ fontSize: 'clamp(1.9rem,4vw,2.6rem)', color: '#1a4a4a' }}>
                  Primeras 5 sesiones con atención prioritaria
                </h2>
                <div className="w-10 h-0.5 rounded-full mx-auto mb-6" style={{ background: '#2d7070' }} />
                <p className="text-base font-light text-center max-w-xl mx-auto mb-12" style={{ color: '#517171' }}>
                  Agenda en los próximos días y accede a atención preferencial: respuesta en menos de 2 horas, flexibilidad de horario y seguimiento personalizado.
                </p>
              </SectionReveal>

              <div className="grid sm:grid-cols-3 gap-6 mb-12">
                {[
                  {
                    icon: CalendarCheck,
                    title: 'Primera sesión sin compromiso',
                    desc: 'Conóceme, cuéntame lo que estás viviendo y decide si la TCC es para ti. Sin presión, sin compromiso de continuidad.',
                  },
                  {
                    icon: ClipboardList,
                    title: 'Plan personalizado desde la sesión 2',
                    desc: 'Aplicamos instrumentos validados (BAI, BDI-II) y diseñamos un plan de trabajo con metas que puedes ver y medir.',
                  },
                  {
                    icon: ShieldCheck,
                    title: 'Confidencialidad garantizada',
                    desc: 'Todo lo que se habla en sesión está protegido por el secreto profesional y las normas deontológicas de la psicología.',
                  },
                ].map((item, i) => (
                  <SectionReveal key={item.title} delay={i * 0.1}>
                    <div
                      className="flex flex-col items-center text-center p-6 rounded-2xl h-full"
                      style={{ background: '#f5fafa', border: '1px solid rgba(26,74,74,0.08)' }}
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                        style={{ background: 'rgba(26,74,74,0.1)' }}
                      >
                        <item.icon className="w-5 h-5" style={{ color: '#2d7070' }} aria-hidden="true" />
                      </div>
                      <h3 className="font-bold text-sm mb-2" style={{ color: '#1a4a4a' }}>{item.title}</h3>
                      <p className="text-sm font-light leading-relaxed" style={{ color: '#517171' }}>{item.desc}</p>
                    </div>
                  </SectionReveal>
                ))}
              </div>

              {/* Google review CTA */}
              <SectionReveal delay={0.3}>
                <div
                  className="rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6"
                  style={{ background: '#f5fafa', border: '1px dashed rgba(26,74,74,0.2)' }}
                >
                  <div className="flex-1 text-center sm:text-left">
                    <p className="font-serif font-bold text-lg mb-1" style={{ color: '#1a4a4a' }}>
                      ¿Ya trabajaste con Psic. Noemi?
                    </p>
                    <p className="text-sm font-light" style={{ color: '#517171' }}>
                      Pronto aquí aparecerán las experiencias reales de mis pacientes. Tu reseña ayuda a que más personas en Cancún encuentren apoyo profesional.
                    </p>
                  </div>
                  <a
                    href="https://g.page/r/review"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-full transition-all"
                    style={{ color: '#1a4a4a', border: '1px solid rgba(26,74,74,0.2)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(26,74,74,0.5)')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(26,74,74,0.2)')}
                  >
                    <Star className="w-3.5 h-3.5" style={{ color: '#f59e0b' }} aria-hidden="true" />
                    Dejar reseña en Google
                  </a>
                </div>
              </SectionReveal>
            </div>
          </section>


          {/* ══════════════════════════════════════════════════════
              9 · FAQ — clean border-bottom accordion
              ══════════════════════════════════════════════════════ */}
          <section id="faq" aria-labelledby="faq-heading" className="py-20" style={{ background: '#f5fafa' }}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <SectionReveal>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#2d7070' }}>Dudas frecuentes</p>
                <h2 id="faq-heading" className="font-serif font-bold leading-tight mb-4" style={{ fontSize: 'clamp(1.9rem,4vw,2.6rem)', color: '#1a4a4a' }}>
                  Preguntas frecuentes
                </h2>
                <div className="w-10 h-0.5 rounded-full mb-10" style={{ background: '#2d7070' }} />
              </SectionReveal>

              <div style={{ maxWidth: '720px' }} role="list">
                {faqItems.map((faq, i) => (
                  <SectionReveal key={i} delay={i * 0.04}>
                    <div role="listitem" style={{ borderBottom: i < faqItems.length - 1 ? '1px solid rgba(26,74,74,0.09)' : 'none' }}>
                      <button
                        id={`faq-btn-${i}`}
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        aria-expanded={openFaq === i}
                        aria-controls={`faq-ans-${i}`}
                        className="w-full flex items-center justify-between gap-4 py-5 text-left transition-colors"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: openFaq === i ? '#2d7070' : '#1a4a4a' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#2d7070')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = openFaq === i ? '#2d7070' : '#1a4a4a')}
                      >
                        <span className="font-semibold text-sm sm:text-base" style={{ fontFamily: 'Montserrat, sans-serif' }}>{faq.q}</span>
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
                        style={{ gridTemplateRows: openFaq === i ? '1fr' : '0fr', opacity: openFaq === i ? 1 : 0, transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
                      >
                        <div className="overflow-hidden">
                          <p className="text-sm leading-relaxed pb-5" style={{ color: '#517171', lineHeight: '1.75', maxWidth: '70ch' }}>
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
              10 · LOCATION — Google Maps + address + hours
              ══════════════════════════════════════════════════════ */}
          <section id="ubicacion" aria-labelledby="ubicacion-heading" className="py-20 bg-white border-t border-border scroll-mt-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <SectionReveal>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#2d7070' }}>Dónde encontrarnos</p>
                <h2 id="ubicacion-heading" className="font-serif font-bold leading-tight mb-4" style={{ fontSize: 'clamp(1.9rem,4vw,2.6rem)', color: '#1a4a4a' }}>
                  Consultorio en Cancún
                </h2>
                <div className="w-10 h-0.5 rounded-full mb-10" style={{ background: '#2d7070' }} />
              </SectionReveal>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
                {/* Map */}
                <SectionReveal>
                  <div className="rounded-2xl overflow-hidden border-2 border-border shadow-lg" style={{ minHeight: '380px' }}>
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d59538.00!2d-86.8515!3d21.1619!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1ses-419!2smx!4v1719100000000"
                      className="w-full border-0"
                      style={{ minHeight: '380px', display: 'block' }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={`Ubicación del consultorio de ${SPECIALIST_FULL} en Cancún`}
                    />
                  </div>
                </SectionReveal>

                {/* Info */}
                <SectionReveal delay={0.1}>
                  <div className="flex flex-col gap-6">
                    {[
                      {
                        Icon: MapPin,
                        label: 'Dirección',
                        content: (
                          <p className="text-sm leading-relaxed" style={{ color: '#1a4a4a', lineHeight: '1.6' }}>
                            Cancún, Quintana Roo · CP 77539
                          </p>
                        ),
                      },
                      {
                        Icon: Clock,
                        label: 'Horario',
                        content: (
                          <div className="text-sm" style={{ color: '#1a4a4a', lineHeight: '1.65' }}>
                            <p>Lunes–Viernes &nbsp;9:00 – 19:00</p>
                            <p>Sábados &nbsp;9:00 – 14:00</p>
                            <p style={{ color: '#517171' }}>Domingos: cerrado</p>
                          </div>
                        ),
                      },
                      {
                        Icon: Phone,
                        label: 'Teléfono',
                        content: (
                          <a href={`tel:${PHONE_E164}`} className="text-sm font-medium hover:underline" style={{ color: '#1a4a4a' }}>
                            998 850 2475
                          </a>
                        ),
                      },
                    ].map(({ Icon, label, content }) => (
                      <div key={label} className="flex gap-4 items-start">
                        <div
                          className="flex items-center justify-center shrink-0 rounded-xl"
                          style={{ width: '42px', height: '42px', background: '#f5fafa', border: '1px solid rgba(26,74,74,0.15)' }}
                        >
                          <Icon className="w-4 h-4" style={{ color: '#2d7070' }} aria-hidden="true" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#2d7070' }}>{label}</p>
                          {content}
                        </div>
                      </div>
                    ))}

                    <div className="flex flex-col gap-2.5 pt-2">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${GEO.latitude},${GEO.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                        style={{ color: '#1a4a4a', background: '#fff', border: '2px solid rgba(26,74,74,0.15)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(26,74,74,0.4)')}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(26,74,74,0.15)')}
                      >
                        <Navigation className="w-4 h-4" aria-hidden="true" />
                        Cómo llegar
                      </a>
                      <a
                        href={waUrl('Hola Psic. Noemi, me gustaría agendar una primera sesión en tu consultorio de Cancún.')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-white transition-all hover:opacity-90"
                        style={{ background: '#25d366' }}
                      >
                        <MessageCircle className="w-4 h-4" aria-hidden="true" />
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </SectionReveal>
              </div>
            </div>
          </section>


          {/* ══════════════════════════════════════════════════════
              11 · CTA FINAL — closing conversion (dark teal)
              ══════════════════════════════════════════════════════ */}
          <section id="cta-final" className="py-14 sm:py-20" style={{ background: '#0d3333' }}>
            <div className="max-w-3xl mx-auto px-6">
              <SectionReveal>
                <div className="text-center mb-10">
                  <h2 className="text-4xl sm:text-5xl font-serif font-bold text-white mb-4">¿Lista para empezar?</h2>
                  <p className="font-light max-w-xl mx-auto" style={{ color: 'rgba(195,225,225,0.8)' }}>
                    Una primera sesión puede darte más claridad de la que imaginas.
                  </p>
                </div>
              </SectionReveal>

              <SectionReveal delay={0.1}>
                <div className="grid sm:grid-cols-3 gap-3 mb-10">
                  {services.map((service, i) => (
                    <Link
                      key={service.slug}
                      href={service.slug}
                      className="group flex flex-col items-center gap-3 p-5 rounded-2xl hover:-translate-y-0.5 transition-all duration-300"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(195,225,225,0.15)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(195,225,225,0.35)')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(195,225,225,0.15)')}
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                        style={{ background: 'rgba(195,225,225,0.1)' }}
                      >
                        <service.icon className="w-5 h-5" style={{ color: 'rgba(195,225,225,0.8)' }} aria-hidden="true" />
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-white text-sm mb-0.5">{service.label}</p>
                        <p className="text-xs font-light" style={{ color: 'rgba(195,225,225,0.65)' }}>{service.age}</p>
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: 'rgba(195,225,225,0.55)' }}>
                        Ver más <ArrowRight className="w-3 h-3" aria-hidden="true" />
                      </span>
                    </Link>
                  ))}
                </div>
              </SectionReveal>

              <SectionReveal delay={0.2}>
                <div className="pt-8" style={{ borderTop: '1px solid rgba(195,225,225,0.12)' }}>
                  <p className="text-center text-sm font-light mb-5" style={{ color: 'rgba(195,225,225,0.7)' }}>Escríbeme directamente por WhatsApp o llámame</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <a
                      href={waUrl('Hola Psic. Noemi, vi tu página y me gustaría agendar una primera sesión')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest text-white transition-all hover:opacity-90"
                      style={{ background: '#25d366' }}
                    >
                      <MessageCircle className="w-4 h-4" aria-hidden="true" />
                      WhatsApp
                    </a>
                    <a
                      href={`tel:${PHONE_E164}`}
                      className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                      style={{ color: 'rgba(255,255,255,0.88)', border: '1.5px solid rgba(195,225,225,0.3)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(195,225,225,0.6)')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(195,225,225,0.3)')}
                    >
                      <Phone className="w-4 h-4" aria-hidden="true" />
                      Llamar
                    </a>
                  </div>
                  <p className="text-xs text-center mt-4" style={{ color: 'rgba(195,225,225,0.45)' }}>
                    Lunes a Viernes 9:00–19:00 · Sábados 9:00–14:00
                  </p>
                </div>
              </SectionReveal>

              <SectionReveal delay={0.3}>
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs" style={{ color: 'rgba(195,225,225,0.65)' }}>
                  <span className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(195,225,225,0.07)', border: '1px solid rgba(195,225,225,0.12)' }}>
                    <Shield className="w-3.5 h-3.5" style={{ color: 'rgba(195,225,225,0.5)' }} aria-hidden="true" /> Cancelación con 24 hrs
                  </span>
                  <span className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(195,225,225,0.07)', border: '1px solid rgba(195,225,225,0.12)' }}>
                    <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'rgba(195,225,225,0.5)' }} aria-hidden="true" /> Primera sesión sin compromiso
                  </span>
                  <span className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(195,225,225,0.07)', border: '1px solid rgba(195,225,225,0.12)' }}>
                    <BadgeCheck className="w-3.5 h-3.5" style={{ color: 'rgba(195,225,225,0.5)' }} aria-hidden="true" /> Cédula {CEDULA}
                  </span>
                </div>
              </SectionReveal>
            </div>
          </section>

        </main>

        <Footer />

        {/* ── Sticky CTA — mobile only, appears after hero ── */}
        <div
          className={`fixed bottom-0 left-0 right-0 z-50 md:hidden transition-all duration-300 ${showStickyCta ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}
          style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
        >
          <div className="bg-white/95 backdrop-blur-lg border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-3">
            <div className="flex gap-2.5 max-w-lg mx-auto">
              <a
                href="#servicios"
                onClick={(e) => { e.preventDefault(); document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 font-bold text-xs uppercase tracking-widest rounded-xl transition-all active:scale-[0.97]"
                style={{ border: '2px solid rgba(26,74,74,0.2)', color: '#1a4a4a' }}
              >
                <Brain className="w-4 h-4" aria-hidden="true" />
                Servicios
              </a>
              <a
                href={waUrl('Hola Psic. Noemi, vi tu página y me gustaría agendar una primera sesión')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:opacity-90 transition-all active:scale-[0.97]"
                style={{ background: '#25d366' }}
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
