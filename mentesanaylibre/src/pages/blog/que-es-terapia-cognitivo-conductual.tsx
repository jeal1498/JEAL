import { useEffect } from 'react';
import Head from 'next/head';
import BlogLayout from '@/components/BlogLayout';
import { applySeo, injectSchema } from '@/lib/seo';
import { SITE_URL } from '@/lib/site';
import { waUrl } from '@/lib/contact';

const SLUG = '/blog/que-es-terapia-cognitivo-conductual';
const HERO_IMAGE = `${SITE_URL}/blog/que-es-tcc.svg`;

export default function QueEsTCC() {
  useEffect(() => {
    const seoCleanup = applySeo({
      title: '¿Qué es la terapia cognitivo conductual y cómo funciona? | Psic. Noemi Eb.',
      description: 'La TCC no es "hablar de tu pasado". Es aprender cómo funciona tu mente y cambiar los patrones que te lastiman. Explicado sin jerga técnica.',
      canonical: `${SITE_URL}${SLUG}`,
    });

    const setOgImage = (url: string) => {
      let el = document.querySelector('meta[property="og:image"]') as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', 'og:image');
        document.head.appendChild(el);
      }
      el.setAttribute('content', url);
      let twEl = document.querySelector('meta[name="twitter:image"]') as HTMLMetaElement | null;
      if (!twEl) {
        twEl = document.createElement('meta');
        twEl.setAttribute('name', 'twitter:image');
        document.head.appendChild(twEl);
      }
      twEl.setAttribute('content', url);
    };
    setOgImage(HERO_IMAGE);

    const schemaCleanup = injectSchema('schema-que-es-tcc', {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: '¿Qué es la terapia cognitivo conductual y cómo funciona?',
      description: 'Explicación clara de la TCC: qué es, cómo funciona, para qué condiciones sirve y cuánto dura el tratamiento.',
      image: HERO_IMAGE,
      datePublished: '2026-06-15',
      dateModified: '2026-06-23',
      author: {
        '@type': 'Person',
        name: 'Psic. Noemi Eb.',
        url: SITE_URL,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Mente Sana y Libre',
        url: SITE_URL,
      },
    });

    return () => {
      seoCleanup();
      schemaCleanup();
    };
  }, []);

  return (
    <>
      <Head>
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <BlogLayout
        breadcrumb="¿Qué es la TCC?"
        category="TCC"
        readTime="10 min"
        publishDate="15 de junio de 2026"
        title="¿Qué es la terapia cognitivo conductual y cómo funciona?"
        subtitle="La TCC no es 'hablar de tu pasado'. Es aprender cómo funciona tu mente y cambiar los patrones que te lastiman. Explicado sin jerga."
        ctaText="Empezar TCC con la Psic. Noemi"
        ctaMessage="Hola%20Psic.%20Noemi%2C%20le%C3%AD%20sobre%20la%20TCC%20y%20me%20gustar%C3%ADa%20saber%20si%20es%20lo%20que%20necesito"
        relatedArticles={[
          {
            href: '/blog/senales-ansiedad-necesita-atencion',
            label: '8 señales de ansiedad que necesitan atención',
            description: 'Señales concretas de cuándo la ansiedad ya merece atención profesional.',
          },
          {
            href: '/blog/depresion-vs-tristeza-diferencias',
            label: 'Depresión vs tristeza: diferencias clave',
            description: 'Reconocer la diferencia puede cambiar cómo te cuidas a ti mismo.',
          },
          {
            href: '/blog/precio-terapia-psicologica-cancun',
            label: '¿Cuánto cuesta la terapia en Cancún?',
            description: 'Precio real por sesión y cuántas sesiones necesita la TCC.',
          },
        ]}
      >
        <div className="prose-blog">
          <p>
            "TCC" es el acrónimo más mencionado en psicología clínica — y también uno de los más mal entendidos.
            Mucha gente cree que es lo mismo que "pensar positivo" o que es una versión más rápida de la terapia
            tradicional. No es ninguna de las dos cosas.
          </p>

          <h2>Qué NO es la TCC</h2>
          <p>
            Antes de explicar qué es, vale la pena aclarar qué no es — porque los malentendidos hacen que muchas
            personas descarten la opción antes de entenderla:
          </p>
          <ul>
            <li>
              <strong>No es "hablar de tu infancia durante años".</strong> La TCC trabaja principalmente en el
              presente: los patrones de pensamiento y conducta actuales que generan malestar hoy.
            </li>
            <li>
              <strong>No es "pensar positivo".</strong> No se trata de reemplazar pensamientos negativos por
              positivos. Se trata de identificar pensamientos distorsionados y sustituirlos por pensamientos
              más precisos — que a veces son positivos, y a veces son simplemente más realistas.
            </li>
            <li>
              <strong>No es indefinida.</strong> La TCC tiene protocolos de duración definida. El objetivo
              es que no necesites la terapia para siempre.
            </li>
          </ul>

          <h2>Qué SÍ es la TCC</h2>
          <p>
            La terapia cognitivo conductual trabaja el vínculo entre tres elementos que se influyen mutuamente:
          </p>
          <ul>
            <li><strong>Pensamientos</strong> (lo que piensas sobre una situación)</li>
            <li><strong>Emociones</strong> (cómo te sientes como consecuencia)</li>
            <li><strong>Conductas</strong> (lo que haces en respuesta a esas emociones)</li>
          </ul>
          <p>
            El modelo central es el <strong>ABC</strong>:
          </p>
          <ul>
            <li><strong>A</strong> — <em>Activating event</em>: la situación que desencadena la respuesta</li>
            <li><strong>B</strong> — <em>Beliefs/Thoughts</em>: los pensamientos automáticos que aparecen</li>
            <li><strong>C</strong> — <em>Consequences</em>: las emociones y conductas que resultan</li>
          </ul>
          <p>
            La TCC interviene principalmente en el punto B — los pensamientos — porque cambiar cómo
            interpretamos una situación cambia cómo nos sentimos y cómo actuamos ante ella.
          </p>

          <h2>Cómo funciona en la práctica</h2>
          <p>Un ejemplo concreto:</p>
          <div
            className="my-5 rounded-xl p-5 border"
            style={{ backgroundColor: '#f5fafa', borderColor: '#2d7070' }}
          >
            <p className="text-sm m-0" style={{ color: '#517171' }}>
              <strong style={{ color: '#1a4a4a' }}>Situación:</strong> Envías un mensaje a una persona y no responde en 2 horas.<br />
              <strong style={{ color: '#1a4a4a' }}>Pensamiento automático:</strong> "Está molesta conmigo. La decepcioné."<br />
              <strong style={{ color: '#1a4a4a' }}>Emoción:</strong> Ansiedad, culpa.<br />
              <strong style={{ color: '#1a4a4a' }}>Conducta:</strong> Envías 3 mensajes más, revisas su perfil, no puedes concentrarte.<br /><br />
              <strong style={{ color: '#1a4a4a' }}>La TCC te ayuda a:</strong> Identificar el pensamiento automático, evaluar su precisión
              ("¿Tengo evidencia real de que está molesta?"), y generar una interpretación más realista
              ("Probablemente está ocupada"). El resultado: la emoción se regula y la conducta cambia.
            </p>
          </div>

          <h2>Para qué condiciones funciona la TCC</h2>
          <p>
            La TCC tiene el mayor cuerpo de evidencia científica entre todas las psicoterapias. Funciona especialmente
            bien para:
          </p>
          <ul>
            <li>Ansiedad generalizada</li>
            <li>Depresión mayor y distimia</li>
            <li>Trastorno obsesivo-compulsivo (TOC)</li>
            <li>Fobia social y otras fobias específicas</li>
            <li>Estrés postraumático (TEPT)</li>
            <li>Trastorno de pánico</li>
            <li>Insomnio (existe un protocolo específico: TCC-I)</li>
          </ul>

          <h2>¿Cuánto dura?</h2>
          <p>
            Para la mayoría de los trastornos de ansiedad y depresión moderada, los protocolos de TCC
            tienen una duración de <strong>8 a 20 sesiones</strong>. Esto no significa que todos los casos
            sean iguales — la complejidad, la presencia de comorbilidades y el nivel de compromiso con
            las tareas entre sesiones influyen en la duración real.
          </p>
          <p>
            Lo que sí es claro: la TCC tiene una fecha de salida. El objetivo no es que sigas en terapia
            indefinidamente — es que aprendas a aplicar las herramientas por ti mismo/a.
          </p>

          <h2>TCC en línea vs presencial</h2>
          <p>
            Múltiples estudios — incluyendo metaanálisis publicados en el <em>Journal of Anxiety Disorders</em>
            y el <em>British Journal of Psychiatry</em> — han encontrado que la TCC en línea tiene la misma
            efectividad que la presencial para la mayoría de los trastornos de ansiedad y depresión.
            La clave es la adherencia al proceso, no el canal.
          </p>

          {/* Answer box */}
          <div
            className="my-6 rounded-xl p-5 border-l-4"
            style={{ backgroundColor: '#f5fafa', borderColor: '#1a4a4a' }}
          >
            <p className="font-bold text-sm mb-2" style={{ color: '#1a4a4a' }}>Evidencia científica</p>
            <p className="text-sm m-0" style={{ color: '#517171' }}>
              La TCC es actualmente el modelo con mayor evidencia científica para trastornos de ansiedad y depresión,
              según la <strong>APA</strong> (American Psychological Association), la <strong>OMS</strong> y la
              guía <strong>NICE</strong> del NHS del Reino Unido. Es la primera línea de tratamiento recomendada
              antes de la medicación en casos de ansiedad y depresión leve a moderada.
            </p>
          </div>
        </div>
      </BlogLayout>
    </>
  );
}
