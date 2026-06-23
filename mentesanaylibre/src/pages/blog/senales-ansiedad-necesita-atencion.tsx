import { useEffect } from 'react';
import Head from 'next/head';
import BlogLayout from '@/components/BlogLayout';
import { applySeo, injectSchema } from '@/lib/seo';
import { SITE_URL } from '@/lib/site';
import { waUrl } from '@/lib/contact';

const SLUG = '/blog/senales-ansiedad-necesita-atencion';
const HERO_IMAGE = `${SITE_URL}/blog/senales-ansiedad.svg`;

export default function SenalesAnsiedad() {
  useEffect(() => {
    const seoCleanup = applySeo({
      title: '8 señales de ansiedad que necesitan atención profesional | Psic. Noemi Eb.',
      description: 'Preocuparte es normal. Pero hay 8 señales específicas que indican que la ansiedad ya afecta tu vida y no va a desaparecer sola. Aprende a distinguirlas.',
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

    const schemaCleanup = injectSchema('schema-senales-ansiedad', {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: '¿Cuándo la ansiedad necesita atención profesional?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Cuando dura más de 2 semanas y afecta tu funcionamiento diario — trabajo, relaciones, sueño o actividades cotidianas. Si reconoces 3 o más de las 8 señales descritas por más de 2 semanas, una evaluación profesional puede darte claridad.',
          },
        },
        {
          '@type': 'Question',
          name: '¿Cuál es la diferencia entre preocupación normal y ansiedad clínica?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'La preocupación normal es puntual, proporcional a la situación y no paraliza. La ansiedad clínica es persistente (más de 2 semanas), desproporcionada, aparece en múltiples áreas de la vida y afecta tu capacidad de funcionar normalmente.',
          },
        },
        {
          '@type': 'Question',
          name: '¿Qué tipo de terapia funciona para la ansiedad?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'La terapia cognitivo conductual (TCC) es el tratamiento con mayor evidencia científica para trastornos de ansiedad, según la APA y la OMS. En promedio, la mejora significativa ocurre en 8 a 16 sesiones.',
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
        breadcrumb="Señales de ansiedad que necesitan atención"
        category="Ansiedad"
        readTime="9 min"
        publishDate="18 de junio de 2026"
        title="8 señales de ansiedad que sí necesitan atención profesional"
        subtitle="Preocuparte de vez en cuando es normal. Pero hay señales específicas que indican que la ansiedad ya está afectando tu vida — y que no van a desaparecer solas."
        ctaText="Hablar con la Psic. Noemi"
        ctaMessage="Hola%20Psic.%20Noemi%2C%20le%C3%AD%20tu%20art%C3%ADculo%20sobre%20ansiedad%20y%20me%20gustar%C3%ADa%20agendar%20una%20consulta"
        relatedArticles={[
          {
            href: '/blog/que-es-terapia-cognitivo-conductual',
            label: '¿Qué es la TCC y cómo funciona?',
            description: 'El tratamiento con más evidencia para ansiedad, explicado sin jerga.',
          },
          {
            href: '/blog/depresion-vs-tristeza-diferencias',
            label: 'Depresión vs tristeza: diferencias clave',
            description: 'La ansiedad y la depresión a menudo coexisten. Aprende a distinguir la tristeza de la depresión.',
          },
          {
            href: '/blog/precio-terapia-psicologica-cancun',
            label: '¿Cuánto cuesta la terapia en Cancún?',
            description: 'Precio real de una sesión y cuántas sesiones necesitas.',
          },
        ]}
      >
        <div className="prose-blog">
          <p>
            Preocuparte por tu trabajo, tu familia o tu salud no es un problema — es una respuesta humana normal.
            El problema es cuando esa preocupación se convierte en algo que no puedes controlar, que aparece sin
            razón clara, que no te deja dormir ni concentrarte, y que afecta tu vida de formas concretas.
          </p>
          <p>
            La frontera entre preocupación normal y ansiedad clínica no siempre es obvia. Pero existen señales
            específicas que los clínicos usan para identificarla.
          </p>

          <h2>La regla de las 2 semanas</h2>
          <p>
            Una de las guías más útiles para evaluar si algo merece atención profesional es la duración.
            Si los síntomas llevan <strong>más de 2 semanas</strong> y están afectando tu vida diaria
            (trabajo, relaciones, sueño, actividades cotidianas), es una señal de que no van a desaparecer solos
            con el tiempo.
          </p>
          <p>
            Esto no significa que necesites diagnóstico formal — significa que merece la pena evaluar qué está pasando.
          </p>

          <h2>8 señales específicas</h2>
          <p>
            Estas son las señales que más frecuentemente aparecen cuando la ansiedad ha cruzado la línea de la
            preocupación normal:
          </p>

          <ol>
            <li>
              <strong>Te preocupas de forma excesiva por varias cosas al mismo tiempo, la mayoría de los días.</strong>{' '}
              No es una preocupación puntual por algo concreto — es un estado de preocupación constante que salta
              de un tema a otro y que sientes que no puedes controlar.
            </li>
            <li>
              <strong>Tienes episodios donde sientes el corazón acelerado, falta de aire o mareos sin causa médica.</strong>{' '}
              Si el médico ya descartó causas físicas y estos episodios siguen ocurriendo, pueden ser manifestaciones
              físicas de ansiedad o crisis de pánico.
            </li>
            <li>
              <strong>Evitas situaciones, lugares o personas para no sentirte ansioso/a.</strong>{' '}
              La evitación es uno de los mecanismos que mantiene y amplifica la ansiedad. A corto plazo alivia;
              a largo plazo la empeora.
            </li>
            <li>
              <strong>Duermes mal de forma consistente.</strong>{' '}
              Te cuesta conciliar el sueño porque tu mente no para, o te despiertas a las 3 AM con pensamientos
              dando vueltas. El sueño es lo primero que afecta la ansiedad.
            </li>
            <li>
              <strong>Te irrita con facilidad aunque las cosas "no sean para tanto".</strong>{' '}
              La irritabilidad es un síntoma de ansiedad frecuentemente ignorado. El sistema nervioso en estado
              de alerta constante tiene muy poca tolerancia a las frustraciones cotidianas.
            </li>
            <li>
              <strong>Tu concentración ha bajado notablemente.</strong>{' '}
              Cuesta terminar tareas, pierdes el hilo de conversaciones, tienes que releer el mismo párrafo
              varias veces. La mente ansiosa consume recursos cognitivos que antes usabas para pensar con claridad.
            </li>
            <li>
              <strong>Sientes tensión muscular crónica, dolores de cabeza frecuentes o problemas digestivos sin causa médica.</strong>{' '}
              El cuerpo acumula la tensión nerviosa. Dolores de cuello y hombros, molestias estomacales sin explicación
              o cefaleas frecuentes pueden ser la forma en que la ansiedad se manifiesta físicamente.
            </li>
            <li>
              <strong>Has empezado a depender de algo para "apagar" la ansiedad.</strong>{' '}
              Alcohol, comida, redes sociales, series — usados de forma compulsiva como alivio temporal de la ansiedad.
              No es debilidad; es una estrategia de regulación que a largo plazo crea más problemas.
            </li>
          </ol>

          {/* Answer box */}
          <div
            className="my-6 rounded-xl p-5 border-l-4"
            style={{ backgroundColor: '#f5fafa', borderColor: '#1a4a4a' }}
          >
            <p className="font-bold text-sm mb-2" style={{ color: '#1a4a4a' }}>¿Cuándo buscar ayuda?</p>
            <p className="text-sm m-0" style={{ color: '#517171' }}>
              Si reconoces <strong>3 o más de estas señales</strong> que llevan más de 2 semanas, una primera sesión
              de evaluación puede darte mucha claridad sobre lo que está pasando y qué opciones tienes.
            </p>
          </div>

          <h2>¿Cuándo es urgente?</h2>
          <p>
            Hay situaciones que ameritan atención más inmediata:
          </p>
          <ul>
            <li>
              <strong>Crisis de pánico frecuentes</strong> (episodios intensos de miedo con síntomas físicos pronunciados)
              que están aumentando en frecuencia o que te impiden salir de casa.
            </li>
            <li>
              <strong>Pensamientos de hacerte daño</strong> o de que sería mejor no estar aquí. En ese caso,
              contacta la Línea de la Vida al <strong>800 911 2000</strong> (IMSS, 24 horas) o acude a urgencias.
            </li>
          </ul>

          <p>
            La ansiedad clínica responde muy bien al tratamiento. La terapia cognitivo conductual tiene décadas
            de evidencia como el enfoque más efectivo para trastornos de ansiedad. El primer paso es entender
            qué está pasando — y para eso, a veces basta una primera consulta.
          </p>
        </div>
      </BlogLayout>
    </>
  );
}
