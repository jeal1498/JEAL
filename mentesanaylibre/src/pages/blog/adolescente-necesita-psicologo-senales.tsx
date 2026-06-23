import { useEffect } from 'react';
import Head from 'next/head';
import BlogLayout from '@/components/BlogLayout';
import { applySeo, injectSchema } from '@/lib/seo';
import { SITE_URL } from '@/lib/site';
import { waUrl } from '@/lib/contact';

const SLUG = '/blog/adolescente-necesita-psicologo-senales';
const HERO_IMAGE = `${SITE_URL}/blog/adolescente-psicologo.svg`;

export default function AdolescenteNecesitaPsicologo() {
  useEffect(() => {
    const seoCleanup = applySeo({
      title: 'Cómo saber si tu adolescente necesita apoyo psicológico | Psic. Noemi Eb.',
      description: 'Guía para padres: 8 señales específicas que distinguen una fase difícil de algo que necesita atención profesional. Qué hacer si tu adolescente no quiere ir al psicólogo.',
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

    const schemaCleanup = injectSchema('schema-adolescente-psicologo', {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: '¿Cómo sé si mi adolescente necesita ir al psicólogo?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Hay señales específicas que van más allá de los cambios normales de la adolescencia: aislamiento social prolongado (más de 2-3 semanas), caída significativa en calificaciones, cambios extremos en sueño o alimentación, menciones de sentirse sin valor o "que sería mejor no estar aquí", o autolesiones. Si observas una o más de estas señales, es momento de buscar orientación profesional.',
          },
        },
        {
          '@type': 'Question',
          name: '¿Qué hago si mi adolescente no quiere ir al psicólogo?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No forzar ni amenazar. Explicarle que es un espacio completamente confidencial — lo que hable con el psicólogo no se reporta a los padres. Proponer una primera sesión de "conocer al psicólogo" sin compromiso. A menudo, la resistencia baja cuando el adolescente entiende que tiene control sobre lo que comparte.',
          },
        },
        {
          '@type': 'Question',
          name: '¿Cuándo es urgente buscar ayuda para un adolescente?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'De forma inmediata si el adolescente se autolesiona (cortes, golpes) o menciona pensamientos de hacerse daño o de que sería mejor no estar aquí. En ese caso, contactar la Línea de Crisis México: 800-290-0024 (gratuita, 24 horas) o acudir a urgencias.',
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
        breadcrumb="Señales de que tu adolescente necesita psicólogo"
        category="Adolescentes"
        readTime="8 min"
        publishDate="12 de junio de 2026"
        title="Cómo saber si tu adolescente necesita apoyo psicológico"
        subtitle="Los cambios en la adolescencia son normales. Pero hay señales específicas que los padres deben conocer para saber cuándo es momento de buscar ayuda."
        ctaText="Hablar sobre mi adolescente"
        ctaMessage="Hola%20Psic.%20Noemi%2C%20le%C3%AD%20tu%20art%C3%ADculo%20sobre%20adolescentes%20y%20me%20gustar%C3%ADa%20hablar%20sobre%20mi%20hijo%2Fa"
        relatedArticles={[
          {
            href: '/blog/senales-ansiedad-necesita-atencion',
            label: '8 señales de ansiedad que necesitan atención',
            description: 'Los adolescentes también desarrollan ansiedad clínica. Estas señales aplican para ellos también.',
          },
          {
            href: '/blog/que-es-terapia-cognitivo-conductual',
            label: '¿Qué es la TCC y cómo funciona?',
            description: 'La terapia que más evidencia tiene para adolescentes con ansiedad y depresión.',
          },
          {
            href: '/blog/depresion-vs-tristeza-diferencias',
            label: 'Depresión vs tristeza: diferencias clave',
            description: 'Saber distinguirlas puede ayudarte a entender lo que le pasa a tu adolescente.',
          },
        ]}
      >
        <div className="prose-blog">
          <p>
            La adolescencia implica cambios reales y profundos — emocionales, físicos, sociales. Es normal que
            tu hijo o hija esté más irritable, quiera más privacidad, o pase por momentos de tristeza o
            inseguridad. No todo lo que parece preocupante en un adolescente necesita intervención profesional.
          </p>
          <p>
            Pero hay señales que sí la necesitan. Y reconocerlas a tiempo puede marcar una diferencia significativa.
          </p>

          <h2>Señales que merecen atención</h2>
          <p>
            Estas señales van más allá de los cambios esperados en la adolescencia. Si observas una o más
            de ellas de forma persistente, vale la pena buscar orientación:
          </p>

          <ol>
            <li>
              <strong>Aislamiento social prolongado (más de 2-3 semanas).</strong>{' '}
              Un fin de semana en casa no es señal de alarma. Pero si tu adolescente ha dejado de ver a amigos
              de forma consistente, rechaza actividades que antes disfrutaba y pasa la mayor parte del tiempo
              solo/a en su cuarto, eso merece atención.
            </li>
            <li>
              <strong>Caída significativa en calificaciones sin causa externa clara.</strong>{' '}
              Una baja puntual tiene explicación. Un deterioro sostenido en el rendimiento escolar —
              especialmente si no hay cambio de escuela, conflicto con maestros u otras causas visibles —
              puede indicar que algo está pasando internamente.
            </li>
            <li>
              <strong>Cambios extremos en hábitos de sueño o alimentación.</strong>{' '}
              Dormir 14 horas o apenas 4. Comer mucho más o mucho menos de lo habitual. Cambios bruscos
              y sostenidos en estos patrones son señales de que el sistema nervioso está bajo estrés significativo.
            </li>
            <li>
              <strong>Agresividad o irritabilidad muy frecuente con toda la familia.</strong>{' '}
              Los adolescentes tienen conflictos con sus padres. Es normal. Pero cuando la agresividad es
              constante, desproporcionada y dirigida a todos (no solo a ti), puede ser una señal de algo más.
            </li>
            <li>
              <strong>Menciona sentirse solo/a, sin valor, o "que sería mejor no estar aquí".</strong>{' '}
              Estas frases no deben minimizarse ni interpretarse como "exageración adolescente".
              Son señales que siempre merecen atención directa y una conversación abierta.
            </li>
            <li>
              <strong>Se autolesiona.</strong>{' '}
              Cortes, golpes o cualquier forma de daño físico intencional. Esto es urgente — busca ayuda profesional
              de inmediato. No esperes a la siguiente cita escolar.
            </li>
            <li>
              <strong>Ha dejado por completo actividades que antes disfrutaba.</strong>{' '}
              El deporte que le encantaba, la música, los videojuegos con amigos, la lectura. Cuando una persona
              pierde el interés en las cosas que antes le daban placer, es uno de los síntomas más claros
              de depresión.
            </li>
            <li>
              <strong>Consumo de alcohol u otras sustancias.</strong>{' '}
              Experimentación y consumo frecuente no son lo mismo. Si hay consumo regular o si el adolescente
              usa sustancias para "calmarse" o "desconectarse", es un indicador importante.
            </li>
          </ol>

          {/* Warning box */}
          <div
            className="my-6 rounded-xl p-5 border-l-4"
            style={{ backgroundColor: '#fff5f5', borderColor: '#dc2626' }}
          >
            <p className="font-bold text-sm mb-1" style={{ color: '#dc2626' }}>Señales de urgencia</p>
            <p className="text-sm m-0" style={{ color: '#7f1d1d' }}>
              Autolesiones o cualquier mención de hacerse daño → buscar ayuda inmediata.<br />
              <strong>Línea de Crisis México: 800-290-0024</strong> (gratuita, 24 horas)
            </p>
          </div>

          <h2>¿Cuándo es urgente?</h2>
          <p>
            Las señales 5 y 6 de la lista anterior (menciones de "no querer estar aquí" y autolesiones)
            no son señales de alarma que puedas posponer a la semana siguiente.
            Requieren atención en las próximas 24-48 horas.
          </p>

          <h2>¿Y si no quiere ir al psicólogo?</h2>
          <p>
            Es el miedo más común de los padres — y la resistencia más frecuente de los adolescentes.
            Algunas cosas que funcionan:
          </p>
          <ul>
            <li>
              <strong>No forzar ni amenazar.</strong> La terapia forzada raramente funciona. El adolescente
              necesita sentir que tiene algún nivel de control sobre la situación.
            </li>
            <li>
              <strong>Explicar la confidencialidad.</strong> Lo que el adolescente habla con su terapeuta
              no se reporta a los padres (salvo riesgo de daño). Muchos adolescentes no saben esto.
              Saberlo cambia completamente la disposición a ir.
            </li>
            <li>
              <strong>Proponer una primera sesión sin compromiso.</strong> "Solo vas a conocer a la psicóloga.
              Si no te gusta, no tienes que regresar." El umbral de entrada baja cuando no parece un compromiso permanente.
            </li>
          </ul>

          <h2>Qué esperar de la terapia para adolescentes</h2>
          <p>
            La TCC adaptada para adolescentes es diferente a la terapia de adultos: más activa, más visual,
            con ejemplos que tienen sentido para su mundo. En muchos casos incluye trabajo paralelo con los padres
            — no para "reportar" al adolescente, sino para que los adultos en casa también tengan herramientas
            para acompañar el proceso.
          </p>
          <p>
            El objetivo no es que el adolescente sea "diferente" — es que tenga herramientas para navegar
            lo que está viviendo sin que le lastime.
          </p>
        </div>
      </BlogLayout>
    </>
  );
}
