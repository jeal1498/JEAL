import { useEffect } from 'react';
import Head from 'next/head';
import BlogLayout from '@/components/BlogLayout';
import { applySeo, injectSchema } from '@/lib/seo';
import { SITE_URL } from '@/lib/site';
import { waUrl } from '@/lib/contact';

const SLUG = '/blog/depresion-vs-tristeza-diferencias';
const HERO_IMAGE = `${SITE_URL}/blog/depresion-tristeza.svg`;

export default function DepresionVsTristeza() {
  useEffect(() => {
    const seoCleanup = applySeo({
      title: 'Depresión vs tristeza: diferencias que debes conocer | Psic. Noemi Eb.',
      description: 'La confusión entre tristeza y depresión hace que mucha gente tarde años en buscar ayuda. Los 9 síntomas del DSM-5 explicados en lenguaje accesible.',
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

    const schemaCleanup = injectSchema('schema-depresion-tristeza', {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: '¿Cuál es la diferencia entre depresión y tristeza?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'La tristeza es una emoción normal, proporcional a una pérdida o decepción, que viene y va. La depresión es persistente (más de 2 semanas), afecta todas las áreas de la vida, incluye síntomas físicos y no necesariamente tiene un "motivo" claro. La depresión no es tristeza intensa — es una condición diferente.',
          },
        },
        {
          '@type': 'Question',
          name: '¿Cuándo sé que tengo depresión y no solo tristeza?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Según los criterios del DSM-5, hay depresión cuando se presentan 5 o más de los 9 síntomas diagnósticos durante más de 2 semanas, y al menos uno de ellos es estado de ánimo deprimido o pérdida de interés/placer. Los síntomas deben representar un cambio respecto al funcionamiento previo.',
          },
        },
        {
          '@type': 'Question',
          name: '¿La depresión tiene tratamiento?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sí. La depresión tiene tratamiento efectivo. La terapia cognitivo conductual (TCC) es el tratamiento con mayor evidencia científica para depresión leve a moderada. En casos severos o cuando la TCC sola no es suficiente, se combina con medicación. La depresión no "se pasa sola" sin intervención en la mayoría de los casos.',
          },
        },
      ],
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
        breadcrumb="Depresión vs tristeza"
        category="Depresión"
        readTime="8 min"
        publishDate="10 de junio de 2026"
        title="Depresión vs tristeza: diferencias que debes conocer"
        subtitle="La confusión entre tristeza y depresión hace que mucha gente tarde años en buscar ayuda. Reconocer la diferencia puede cambiar cómo te cuidas a ti mismo."
        ctaText="Hablar con la Psic. Noemi"
        ctaMessage="Hola%20Psic.%20Noemi%2C%20le%C3%AD%20tu%20art%C3%ADculo%20sobre%20depresi%C3%B3n%20y%20me%20gustar%C3%ADa%20agendar%20una%20consulta"
        relatedArticles={[
          {
            href: '/blog/senales-ansiedad-necesita-atencion',
            label: '8 señales de ansiedad que necesitan atención',
            description: 'La depresión y la ansiedad frecuentemente coexisten. Conoce las señales de la ansiedad clínica.',
          },
          {
            href: '/blog/que-es-terapia-cognitivo-conductual',
            label: '¿Qué es la TCC y cómo funciona?',
            description: 'La primera línea de tratamiento para depresión leve y moderada, explicada sin jerga.',
          },
          {
            href: '/blog/precio-terapia-psicologica-cancun',
            label: '¿Cuánto cuesta la terapia en Cancún?',
            description: 'Precio real de una sesión de psicología y cuántas sesiones necesita el tratamiento.',
          },
        ]}
      >
        <div className="prose-blog">
          <p>
            "Solo estás triste." Es lo que escuchan muchas personas con depresión. Y esa confusión — entre
            una emoción normal y una condición clínica — es una de las razones por las que la depresión
            tarda en promedio <strong>4 años</strong> en recibir tratamiento adecuado.
          </p>
          <p>
            La diferencia no es de intensidad. No es que la depresión sea "tristeza muy profunda".
            Son dos cosas distintas.
          </p>

          <h2>La tristeza es normal</h2>
          <p>
            La tristeza es una emoción adaptativa. Aparece como respuesta a pérdidas reales:
            una ruptura, la muerte de alguien querido, una decepción importante, el fin de una etapa.
          </p>
          <p>
            Las características de la tristeza normal:
          </p>
          <ul>
            <li>Está relacionada con una causa identificable</li>
            <li>Es proporcional a la situación</li>
            <li>Viene y va — no es constante las 24 horas</li>
            <li>No impide funcionar en todas las áreas de la vida</li>
            <li>Disminuye con el tiempo o cuando la situación cambia</li>
          </ul>
          <p>
            Sentir tristeza es sano. Reprimirla o ignorarla no lo es. Pero tampoco necesita terapia
            en la mayoría de los casos — necesita espacio, tiempo y apoyo.
          </p>

          <h2>La depresión es diferente</h2>
          <p>
            La depresión clínica no es tristeza intensa — tiene características propias que la distinguen:
          </p>
          <ul>
            <li><strong>Persistente:</strong> dura más de 2 semanas de forma continua</li>
            <li><strong>Generalizada:</strong> afecta prácticamente todas las áreas de la vida simultáneamente</li>
            <li><strong>Sin "motivo" necesario:</strong> puede aparecer sin una pérdida externa clara</li>
            <li><strong>Con síntomas físicos:</strong> fatiga, cambios en sueño, cambios en apetito, enlentecimiento</li>
            <li><strong>No mejora sola:</strong> en la mayoría de los casos no desaparece sin intervención</li>
          </ul>

          <h2>Los 9 síntomas del DSM-5 explicados</h2>
          <p>
            El Manual Diagnóstico y Estadístico (DSM-5) define la depresión mayor con estos criterios.
            Los explico en lenguaje accesible:
          </p>

          <ol>
            <li>
              <strong>Estado de ánimo deprimido la mayor parte del día.</strong>{' '}
              No solo en momentos difíciles — la mayoría del día, casi todos los días. A veces se siente
              como vacío, no como tristeza activa.
            </li>
            <li>
              <strong>Pérdida de interés o placer en actividades antes disfrutadas.</strong>{' '}
              Las cosas que antes te gustaban — deportes, música, salir, cocinar — ya no te producen nada.
              Este síntoma tiene nombre: <em>anhedonia</em>.
            </li>
            <li>
              <strong>Cambios significativos en peso o apetito.</strong>{' '}
              Aumento o pérdida de peso sin intentarlo. El apetito puede desaparecer o dispararse sin control.
            </li>
            <li>
              <strong>Insomnio o hipersomnia.</strong>{' '}
              Dificultad para dormir, o dormir demasiado (10-12 horas) y seguir sintiéndose agotado/a.
            </li>
            <li>
              <strong>Agitación o enlentecimiento psicomotor.</strong>{' '}
              Inquietud que no permite quedarse quieto/a, o todo lo contrario: movimientos y habla
              más lentos de lo habitual.
            </li>
            <li>
              <strong>Fatiga o pérdida de energía casi diaria.</strong>{' '}
              No es cansancio que se resuelve con descanso. Es una fatiga que está ahí incluso
              después de dormir toda la noche.
            </li>
            <li>
              <strong>Sentimientos de inutilidad o culpa excesiva.</strong>{' '}
              Culparse por cosas desproporcionadas o fuera de control. Sensación persistente de no
              valer lo suficiente.
            </li>
            <li>
              <strong>Dificultad para concentrarse o tomar decisiones.</strong>{' '}
              La mente no retiene información, cuesta tomar decisiones simples, hay sensación de
              estar en la niebla.
            </li>
            <li>
              <strong>Pensamientos recurrentes de muerte o suicidio.</strong>{' '}
              Desde pensar frecuentemente en la muerte hasta ideación activa. Si esto ocurre,
              es el síntoma más urgente de toda la lista.
            </li>
          </ol>

          <h2>¿Cuándo es depresión y no tristeza?</h2>
          <p>
            Según el DSM-5, se considera depresión mayor cuando se presentan <strong>5 o más</strong> de los
            síntomas anteriores durante <strong>más de 2 semanas</strong>, y al menos uno de ellos es el
            síntoma 1 (ánimo deprimido) o el 2 (pérdida de interés/placer).
          </p>
          <p>
            Esto no significa que debas hacer el diagnóstico tú mismo/a. Significa que si te reconoces
            en varios de estos síntomas de forma persistente, merece una evaluación profesional.
          </p>

          {/* Answer box */}
          <div
            className="my-6 rounded-xl p-5 border-l-4"
            style={{ backgroundColor: '#f5fafa', borderColor: '#1a4a4a' }}
          >
            <p className="font-bold text-sm mb-2" style={{ color: '#1a4a4a' }}>Algo importante</p>
            <p className="text-sm m-0" style={{ color: '#517171' }}>
              La depresión no es debilidad ni falta de voluntad. Es una condición de salud mental tratable.
              Y buscar ayuda es la decisión más valiente — no la más fácil.
            </p>
          </div>

          <h2>¿Tiene tratamiento?</h2>
          <p>
            Sí. La depresión es una de las condiciones con más opciones de tratamiento efectivo:
          </p>
          <ul>
            <li>
              <strong>Terapia cognitivo conductual (TCC):</strong> la primera línea de tratamiento para
              depresión leve a moderada. La eficacia está documentada en miles de estudios.
            </li>
            <li>
              <strong>Medicación:</strong> los antidepresivos son efectivos, especialmente en depresión
              moderada a severa. Funcionan mejor cuando se combinan con terapia.
            </li>
            <li>
              <strong>Combinación TCC + medicación:</strong> el enfoque con mayor evidencia para depresión
              moderada a severa.
            </li>
          </ul>
          <p>
            Lo que la depresión <em>no</em> hace es desaparecer sola con fuerza de voluntad.
            No es que "no te esfuerces lo suficiente". Es que el cerebro necesita apoyo especializado
            para cambiar los patrones que mantienen el estado depresivo.
          </p>

          {/* Warning box */}
          <div
            className="my-6 rounded-xl p-5 border-l-4"
            style={{ backgroundColor: '#fff5f5', borderColor: '#dc2626' }}
          >
            <p className="font-bold text-sm mb-1" style={{ color: '#dc2626' }}>Si tienes pensamientos de suicidio</p>
            <p className="text-sm m-0" style={{ color: '#7f1d1d' }}>
              <strong>Línea de Crisis México: 800-290-0024</strong> (gratuita, 24 horas).<br />
              También puedes ir a urgencias del hospital más cercano.
            </p>
          </div>
        </div>
      </BlogLayout>
    </>
  );
}
