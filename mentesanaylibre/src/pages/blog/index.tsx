import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight, Clock, Brain, Users, DollarSign, AlertCircle, Heart, MessageCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingButtons from '@/components/FloatingButtons';
import { waUrl } from '@/lib/contact';
import { SITE_URL } from '@/lib/site';

/* ═══════════════════════════════════════════════════════════════
   DATA — ordenados por relevancia SEO
   ═══════════════════════════════════════════════════════════════ */

type FilterCategory = 'Ansiedad' | 'Depresión' | 'TCC' | 'Adolescentes' | 'Precios';

const FILTERS: ('Todos' | FilterCategory)[] = [
  'Todos',
  'Ansiedad',
  'Depresión',
  'TCC',
  'Adolescentes',
  'Precios',
];

const BADGE_BY_FILTER: Record<FilterCategory, string> = {
  Ansiedad: 'bg-teal-100 text-teal-800',
  Depresión: 'bg-rose-100 text-rose-800',
  TCC: 'bg-cyan-100 text-cyan-800',
  Adolescentes: 'bg-amber-100 text-amber-800',
  Precios: 'bg-emerald-100 text-emerald-800',
};

const posts = [
  {
    rank: 1,
    slug: '/blog/precio-terapia-psicologica-cancun',
    category: 'Precios',
    filterCategory: 'Precios' as FilterCategory,
    icon: DollarSign,
    title: '¿Cuánto cuesta la terapia psicológica en Cancún? (2026)',
    excerpt: 'Precio real de una sesión de psicología en Cancún, qué incluye, cuántas sesiones necesitas y cómo evaluarlo como inversión.',
    readTime: '7 min',
    img: '/blog/precio-terapia-cancun.svg',
    popular: true,
  },
  {
    rank: 2,
    slug: '/blog/senales-ansiedad-necesita-atencion',
    category: 'Ansiedad',
    filterCategory: 'Ansiedad' as FilterCategory,
    icon: AlertCircle,
    title: '8 señales de ansiedad que sí necesitan atención profesional',
    excerpt: 'Preocuparte de vez en cuando es normal. Pero hay señales específicas que indican que la ansiedad ya está afectando tu vida — y que no van a desaparecer solas.',
    readTime: '9 min',
    img: '/blog/senales-ansiedad.svg',
    popular: true,
  },
  {
    rank: 3,
    slug: '/blog/que-es-terapia-cognitivo-conductual',
    category: 'TCC',
    filterCategory: 'TCC' as FilterCategory,
    icon: Brain,
    title: '¿Qué es la terapia cognitivo conductual y cómo funciona?',
    excerpt: 'La TCC no es "hablar de tu pasado". Es aprender cómo funciona tu mente y cambiar los patrones que te lastiman. Explicado sin jerga.',
    readTime: '10 min',
    img: '/blog/que-es-tcc.svg',
  },
  {
    rank: 4,
    slug: '/blog/adolescente-necesita-psicologo-senales',
    category: 'Adolescentes',
    filterCategory: 'Adolescentes' as FilterCategory,
    icon: Users,
    title: 'Cómo saber si tu adolescente necesita apoyo psicológico',
    excerpt: 'Los cambios en la adolescencia son normales. Pero hay señales específicas que los padres deben conocer para saber cuándo es momento de buscar ayuda.',
    readTime: '8 min',
    img: '/blog/adolescente-psicologo.svg',
  },
  {
    rank: 5,
    slug: '/blog/depresion-vs-tristeza-diferencias',
    category: 'Depresión',
    filterCategory: 'Depresión' as FilterCategory,
    icon: Heart,
    title: 'Depresión vs tristeza: diferencias que debes conocer',
    excerpt: 'Todo el mundo se siente triste a veces. La depresión es algo diferente — y reconocer la diferencia puede cambiar cómo te cuidas a ti mismo.',
    readTime: '8 min',
    img: '/blog/depresion-tristeza.svg',
  },
];

/* ═══════════════════════════════════════════════════════════════
   ANIMATIONS
   ═══════════════════════════════════════════════════════════════ */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: 'easeOut' as const },
  }),
};

/* ═══════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function BlogIndex() {
  const [activeFilter, setActiveFilter] = useState<'Todos' | FilterCategory>('Todos');

  const featured = posts[0];
  const rest = posts.slice(1);

  const showFeatured = activeFilter === 'Todos' || featured.filterCategory === activeFilter;
  const filteredRest = activeFilter === 'Todos' ? rest : rest.filter((p) => p.filterCategory === activeFilter);
  const isEmpty = !showFeatured && filteredRest.length === 0;

  return (
    <>
      <Head>
        <title>Blog de Psicología en Cancún | Psic. Noemi Eb. — Mente Sana y Libre</title>
        <meta
          name="description"
          content="Artículos sobre ansiedad, depresión, terapia cognitivo conductual y salud mental para adolescentes en Cancún. Escritos por la Psic. Noemi Eb., psicoterapeuta."
        />
        <meta property="og:title" content="Blog de Psicología en Cancún | Psic. Noemi Eb." />
        <meta
          property="og:description"
          content="Recursos sobre ansiedad, depresión, TCC y salud mental para adolescentes. Información clínica basada en evidencia, escrita por la Psic. Noemi Eb. en Cancún."
        />
        <meta property="og:image" content={`${SITE_URL}/Psicologa_Noemi_Eb.webp`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={`${SITE_URL}/Psicologa_Noemi_Eb.webp`} />
        <link rel="canonical" href={`${SITE_URL}/blog`} />
      </Head>

      <Navbar />

      <main className="antialiased min-h-screen bg-background overflow-x-hidden">

        {/* ── Page header + filtros ────────────────────────────── */}
        <section
          className="relative pt-28 pb-12 px-6 overflow-hidden"
          style={{ backgroundColor: '#0d3333' }}
          aria-labelledby="blog-heading"
        >
          <div
            className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] -translate-y-1/3 translate-x-1/4 pointer-events-none"
            style={{ backgroundColor: 'rgba(45,112,112,0.25)' }}
          />

          <div className="relative max-w-6xl mx-auto">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-[0.625rem] font-bold tracking-[0.12em] uppercase mb-3"
              style={{ color: 'rgba(45,112,112,0.9)' }}
            >
              Blog · Psicología Clínica
            </motion.p>
            <motion.h1
              id="blog-heading"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="text-3xl md:text-5xl font-serif font-bold text-white leading-tight mb-4 max-w-xl"
            >
              Recursos sobre Salud Mental
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-sm md:text-base text-white/80 max-w-lg leading-relaxed mb-10"
            >
              Información clínica sobre ansiedad, depresión, terapia cognitivo conductual y salud mental de adolescentes.
              Escrito por la Psic. Noemi Eb.
            </motion.p>

            <div
              role="group"
              aria-label="Filtrar artículos por categoría"
              className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {FILTERS.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  aria-pressed={activeFilter === filter}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                    activeFilter === filter
                      ? 'bg-white border-white'
                      : 'bg-transparent text-white/85 border-white/30 hover:bg-white/10 hover:border-white/50'
                  }`}
                  style={activeFilter === filter ? { color: '#1a4a4a' } : undefined}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Contenido + sidebar ──────────────────────────────── */}
        <div className="px-6 py-12 max-w-6xl mx-auto lg:flex lg:items-start lg:gap-12">

          <div className="flex-1 min-w-0">

            {/* Featured post */}
            {showFeatured && (
              <motion.section
                key={featured.slug}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-10"
                aria-label="Artículo destacado"
              >
                <Link href={featured.slug} className="group block">
                  <article className="relative rounded-2xl bg-card border border-border/60 overflow-hidden flex flex-col lg:flex-row hover:border-primary/30 transition-all duration-300 hover:shadow-[0_20px_60px_-15px_rgba(26,74,74,0.12)]">
                    <div className="lg:w-2/5 shrink-0">
                      <img
                        src={featured.img}
                        alt={`Ilustración del artículo: ${featured.title}`}
                        className="w-full h-full object-cover aspect-video lg:aspect-auto"
                        loading="eager"
                      />
                    </div>
                    <div className="flex-1 p-7 md:p-10 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-5 flex-wrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.625rem] font-bold uppercase tracking-[0.08em] ${BADGE_BY_FILTER[featured.filterCategory]}`}>
                          <featured.icon className="w-3 h-3" aria-hidden="true" />
                          {featured.category}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" aria-hidden="true" /> {featured.readTime} lectura
                        </span>
                        <span className="ml-auto text-[0.625rem] font-bold tracking-[0.1em] uppercase" style={{ color: 'rgba(26,74,74,0.35)' }}>
                          Artículo destacado
                        </span>
                      </div>

                      <h2 className="text-2xl md:text-3xl font-serif font-bold leading-tight mb-4 group-hover:opacity-80 transition-opacity" style={{ color: '#1a4a4a' }}>
                        {featured.title}
                      </h2>
                      <p className="leading-relaxed text-sm md:text-base mb-7 max-w-xl" style={{ color: '#517171' }}>
                        {featured.excerpt}
                      </p>

                      <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold w-fit text-white group-hover:gap-3 transition-all duration-200" style={{ backgroundColor: '#1a4a4a' }}>
                        Leer artículo <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </span>
                    </div>
                  </article>
                </Link>
              </motion.section>
            )}

            {/* Grid de artículos */}
            {!isEmpty ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredRest.map((post, i) => (
                  <motion.div
                    key={post.slug}
                    custom={i}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-60px' }}
                    variants={fadeUp}
                  >
                    <Link href={post.slug} className="group block h-full">
                      <article className="relative h-full rounded-2xl bg-card border border-border/50 overflow-hidden hover:border-primary/20 transition-all duration-300 hover:shadow-md flex flex-col">
                        {post.popular && (
                          <span
                            className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 text-white text-[0.625rem] font-bold uppercase tracking-[0.06em] px-3 py-1 rounded-full"
                            style={{ backgroundColor: '#1a4a4a' }}
                          >
                            <span aria-hidden="true">★</span> Más leído
                          </span>
                        )}
                        <img
                          src={post.img}
                          alt={`Ilustración del artículo: ${post.title}`}
                          className="w-full aspect-video object-cover"
                          loading="lazy"
                        />
                        <div className="p-6 flex flex-col flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.625rem] font-bold uppercase tracking-[0.06em] ${BADGE_BY_FILTER[post.filterCategory]}`}>
                              <post.icon className="w-3 h-3" aria-hidden="true" />
                              {post.category}
                            </span>
                            <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" aria-hidden="true" /> {post.readTime}
                            </span>
                          </div>

                          <h3 className="text-lg font-serif font-bold leading-snug mb-3 group-hover:opacity-80 transition-opacity flex-1" style={{ color: '#1a4a4a' }}>
                            {post.title}
                          </h3>

                          <p className="text-sm leading-relaxed mb-5 line-clamp-3" style={{ color: '#517171' }}>
                            {post.excerpt}
                          </p>

                          <div className="flex items-center justify-end mt-auto">
                            <span className="inline-flex items-center gap-1.5 text-sm font-semibold group-hover:gap-2.5 transition-all duration-200" style={{ color: '#1a4a4a' }}>
                              Leer artículo <ArrowRight className="w-4 h-4" aria-hidden="true" />
                            </span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div role="status" aria-live="polite" className="py-16 text-center">
                <p className="font-serif text-xl mb-2" style={{ color: '#1a4a4a' }}>No hay artículos en esta categoría todavía.</p>
                <button
                  type="button"
                  onClick={() => setActiveFilter('Todos')}
                  className="text-sm font-semibold underline underline-offset-4 hover:opacity-70 transition-opacity"
                  style={{ color: '#517171' }}
                >
                  Ver todos los artículos
                </button>
              </div>
            )}
          </div>

          {/* ── Sidebar ─────────────────────────────────────────── */}
          <aside className="mt-12 lg:mt-0 lg:w-72 lg:shrink-0 lg:sticky lg:top-24 space-y-4" aria-label="Acciones rápidas y servicios">

            <div className="bg-card border border-border/60 rounded-2xl p-6">
              <h2 className="font-serif font-bold mb-3" style={{ color: '#1a4a4a' }}>¿Lista para agendar?</h2>
              <p className="text-sm leading-relaxed mb-5" style={{ color: '#517171' }}>
                Habla directamente con la Psic. Noemi por WhatsApp. Responde tus dudas y agenda la fecha que mejor te funcione.
              </p>
              <a
                href={waUrl('Hola Psic. Noemi, leí tu blog y me gustaría agendar una consulta')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-whatsapp hover:opacity-90 text-primary-foreground py-3 rounded-full text-sm font-bold transition-opacity"
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" /> Escribir por WhatsApp
              </a>
            </div>

            <div className="bg-card border border-border/60 rounded-2xl p-6">
              <h2 className="font-serif font-bold mb-3" style={{ color: '#1a4a4a' }}>Servicios disponibles</h2>
              <nav aria-label="Servicios de psicoterapia" className="flex flex-col">
                {[
                  { href: '/terapia-individual-cancun', label: 'Terapia Individual (TCC)' },
                  { href: '/terapia-adolescentes-cancun', label: 'Terapia para Adolescentes' },
                  { href: '/terapia-ansiedad-depresion-cancun', label: 'Terapia Ansiedad y Depresión' },
                ].map((service, i) => (
                  <Link
                    key={service.href}
                    href={service.href}
                    className={`flex items-center gap-2 py-3 text-sm font-semibold hover:opacity-70 transition-opacity ${i > 0 ? 'border-t border-border' : ''}`}
                    style={{ color: '#1a4a4a' }}
                  >
                    <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                    {service.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, #1a4a4a 0%, #0d3333 100%)' }}>
              <p className="text-[0.625rem] font-bold uppercase tracking-[0.1em] text-white/70 mb-2">
                Especialidad
              </p>
              <p className="font-serif text-lg text-white mb-2">Terapia Cognitivo Conductual</p>
              <p className="text-xs text-white/80 leading-relaxed">
                TCC con evidencia científica · Ansiedad · Depresión · Adolescentes · Cancún
              </p>
            </div>

          </aside>
        </div>

        {/* ── CTA final ─────────────────────────────────────────── */}
        <section className="py-16 px-6 text-center" style={{ backgroundColor: '#0d3333' }}>
          <div className="max-w-lg mx-auto">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-4">
              ¿Tienes dudas sobre si la terapia es para ti?
            </h2>
            <p className="text-white/80 leading-relaxed mb-8">
              Escríbele a la Psic. Noemi por WhatsApp y obtén orientación inicial sin compromiso.
            </p>
            <a
              href={waUrl('Hola Psic. Noemi, leí tu blog y tengo dudas sobre la terapia')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-whatsapp hover:opacity-90 text-primary-foreground px-8 py-4 rounded-full text-sm font-bold transition-opacity"
            >
              <MessageCircle className="w-5 h-5" aria-hidden="true" /> Escribir por WhatsApp
            </a>
          </div>
        </section>

      </main>

      <Footer />
      <FloatingButtons />
    </>
  );
}
