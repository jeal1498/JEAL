import { Globe, Search, MapPin, Bot, CheckCircle2, Target, Zap } from 'lucide-react';

const WA_HREF = `https://wa.me/529985594723?text=${encodeURIComponent('Hola, me interesa una cotización para mi sitio web')}`;

const SERVICES = [
  {
    icon: Globe,
    title: 'Diseño Web Profesional',
    tag: { label: 'Sitio web', color: 'text-[hsl(var(--muted-foreground))] bg-white/5 border-white/10' },
    description:
      'Sitio rápido, accesible y mobile-first en Next.js + Tailwind. Transmite confianza y convierte visitas en consultas agendadas.',
  },
  {
    icon: Search,
    title: 'SEO — Posicionamiento Orgánico',
    tag: { label: 'SEO', color: 'text-sky-400 bg-sky-400/10 border-sky-400/20' },
    description:
      'Aparece en Google cuando alguien busca tu especialidad en tu ciudad. Investigación de keywords, estructura técnica y contenido optimizado.',
  },
  {
    icon: MapPin,
    title: 'GEO — Visibilidad Local',
    tag: { label: 'GEO', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
    description:
      'Google Maps y búsquedas "cerca de mí". Google Business Profile optimizado y citaciones en directorios de salud.',
  },
  {
    icon: Bot,
    title: 'Presencia en IA',
    tag: { label: 'AEO', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
    description:
      'ChatGPT, Perplexity y Google AI mencionan tu nombre cuando un paciente pregunta por especialistas. Schema markup médico especializado.',
  },
];

const WHY_ITEMS = [
  {
    icon: Target,
    title: 'Solo salud',
    description:
      'Nos especializamos exclusivamente en profesionales de la salud. Conocemos tu industria, tu competencia y tus pacientes.',
  },
  {
    icon: Zap,
    title: 'Posicionamiento integrado',
    description:
      'SEO + GEO + AEO está en el código desde el primer commit. No es un complemento posterior.',
  },
  {
    icon: CheckCircle2,
    title: 'Proyectos que terminamos',
    description:
      'Cada proyecto de nuestro portafolio está vivo o en fase final. Sin proyectos fantasma.',
  },
];

const PROCESS_STEPS = [
  {
    n: '01',
    title: 'Diagnóstico',
    description: 'Llamada de 30 min. Entendemos tu especialidad, ciudad y objetivos de pacientes.',
  },
  {
    n: '02',
    title: 'Propuesta',
    description: 'Cotización clara con alcance, timeline y entregables. Sin letra chica.',
  },
  {
    n: '03',
    title: 'Diseño y contenido',
    description: 'Wireframes, copy en español optimizado para SEO y estructura de páginas.',
  },
  {
    n: '04',
    title: 'Desarrollo',
    description: 'Next.js con velocidad, accesibilidad y SEO técnico integrados desde el código.',
  },
  {
    n: '05',
    title: 'Lanzamiento',
    description:
      'Deploy, Google Search Console y Google Business configurados. Seguimiento el primer mes.',
  },
];

function HeroSection() {
  return (
    <section className="bg-[#0a0810] border-b border-[hsl(var(--border))]">
      <div className="max-w-5xl mx-auto px-6 py-24 md:py-32 flex flex-col items-center text-center gap-6">
        <span className="text-[0.65rem] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
          Agencia web para profesionales de la salud
        </span>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[hsl(var(--foreground))] max-w-2xl leading-tight">
          Webs que posicionan para profesionales de la salud
        </h1>
        <p className="text-lg text-[hsl(var(--muted-foreground))] max-w-xl leading-relaxed">
          Diseñamos y desarrollamos sitios web para psicólogos, psiquiatras, dentistas y
          ortodoncistas en México. Con SEO, GEO y AEO integrados desde el primer día.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
          <a
            href={WA_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm px-5 py-2.5 rounded transition-colors duration-200"
          >
            Solicitar cotización — WhatsApp
          </a>
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors duration-200"
          >
            Ver proyectos →
          </a>
        </div>
      </div>
    </section>
  );
}

function ServicesGrid() {
  return (
    <section className="py-16 border-b border-[hsl(var(--border))]">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-2xl font-bold tracking-tight text-[hsl(var(--foreground))] mb-8">
          Lo que construimos para ti
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SERVICES.map(({ icon: Icon, title, tag, description }) => (
            <article
              key={title}
              className="group bg-[hsl(var(--card))] rounded-[var(--radius)] border border-[hsl(var(--border))] p-6 flex flex-col gap-4 transition-all duration-300 hover:border-white/20 hover:shadow-[0_20px_60px_rgba(208,208,231,0.06)]"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-[var(--radius)] bg-white/5 border border-white/10">
                  <Icon size={18} className="text-[hsl(var(--foreground))]" />
                </div>
                <span
                  className={`text-[0.65rem] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${tag.color}`}
                >
                  {tag.label}
                </span>
              </div>
              <div>
                <h3 className="text-base font-semibold text-[hsl(var(--card-foreground))] mb-1.5">
                  {title}
                </h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                  {description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyJAKE() {
  return (
    <section className="py-16 border-b border-[hsl(var(--border))]">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-2xl font-bold tracking-tight text-[hsl(var(--foreground))] mb-8">
          Por qué elegirnos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {WHY_ITEMS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex flex-col gap-3">
              <div className="p-2.5 rounded-[var(--radius)] bg-white/5 border border-white/10 w-fit">
                <Icon size={16} className="text-emerald-400" />
              </div>
              <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">{title}</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessSteps() {
  return (
    <section className="py-16 border-b border-[hsl(var(--border))]">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-2xl font-bold tracking-tight text-[hsl(var(--foreground))] mb-8">
          Cómo trabajamos
        </h2>
        <div className="flex flex-col gap-0">
          {PROCESS_STEPS.map(({ n, title, description }, i) => (
            <div key={n} className="flex gap-6 group">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-9 h-9 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] flex-shrink-0">
                  <span className="text-[0.65rem] font-bold text-emerald-400 font-mono">{n}</span>
                </div>
                {i < PROCESS_STEPS.length - 1 && (
                  <div className="w-px flex-1 bg-[hsl(var(--border))] my-1" />
                )}
              </div>
              <div className="pb-8 flex flex-col gap-1 pt-1.5">
                <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">{title}</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-16">
      <div className="max-w-5xl mx-auto px-6">
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[var(--radius)] py-16 px-8 flex flex-col items-center text-center gap-5">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[hsl(var(--foreground))] max-w-md">
            ¿Listo para tener más pacientes?
          </h2>
          <p className="text-[hsl(var(--muted-foreground))] max-w-sm leading-relaxed">
            Cuéntanos sobre tu práctica. La cotización es gratuita y sin compromiso.
          </p>
          <a
            href={WA_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm px-6 py-3 rounded transition-colors duration-200 mt-1"
          >
            Escríbenos por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

export function ServiciosContent() {
  return (
    <>
      <HeroSection />
      <ServicesGrid />
      <WhyJAKE />
      <ProcessSteps />
      <FinalCTA />
    </>
  );
}
