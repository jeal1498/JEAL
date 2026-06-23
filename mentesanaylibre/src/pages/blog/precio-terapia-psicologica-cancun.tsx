import { useEffect } from 'react';
import Head from 'next/head';
import BlogLayout from '@/components/BlogLayout';
import { applySeo, injectSchema } from '@/lib/seo';
import { SITE_URL } from '@/lib/site';
import { waUrl } from '@/lib/contact';
import Link from 'next/link';

const SLUG = '/blog/precio-terapia-psicologica-cancun';
const HERO_IMAGE = `${SITE_URL}/blog/precio-terapia-cancun.svg`;

export default function PrecioTerapiaCancun() {
  useEffect(() => {
    const seoCleanup = applySeo({
      title: '¿Cuánto cuesta la terapia psicológica en Cancún? (2026) | Psic. Noemi Eb.',
      description: 'Precio real de una sesión de psicología en Cancún: $800–$1,200 MXN. Qué incluye, cuántas sesiones necesitas y cómo evaluarlo como inversión en tu salud mental.',
      canonical: `${SITE_URL}${SLUG}`,
    });

    // Set og:image to the article hero image (not the specialist photo)
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

    const schemaCleanup = injectSchema('schema-precio-terapia', {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: '¿Cuánto cuesta una sesión de terapia psicológica en Cancún?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'El rango en Cancún es de $600 a $1,500 MXN por sesión de 50 minutos. Con la Psic. Noemi Eb., el precio es de $800 a $1,200 MXN por sesión. No hay cuota de inscripción ni costo adicional por la primera sesión.',
          },
        },
        {
          '@type': 'Question',
          name: '¿Cuántas sesiones de terapia necesito?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Con terapia cognitivo conductual (TCC), la mayoría de los casos de ansiedad o depresión moderada se trabajan en 8 a 20 sesiones. El objetivo de la TCC es que en algún momento no necesites la terapia para funcionar bien.',
          },
        },
        {
          '@type': 'Question',
          name: '¿Hay opciones de terapia más económicas en Cancún?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sí. La Clínica de Psicología de la UQROO ofrece atención a bajo costo. También existen centros comunitarios del DIF y la opción de terapia en línea, que suele tener un precio menor al presencial.',
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
        breadcrumb="Precio terapia psicológica Cancún"
        category="Precios"
        readTime="7 min"
        publishDate="20 de junio de 2026"
        title="¿Cuánto cuesta la terapia psicológica en Cancún? (2026)"
        subtitle="Precio real de una sesión, qué incluye, cuántas sesiones necesitas y cómo evaluarlo como inversión en tu salud mental."
        ctaText="Consultar precio"
        ctaMessage="Hola%20Psic.%20Noemi%2C%20le%C3%AD%20tu%20art%C3%ADculo%20sobre%20precios%20y%20me%20gustar%C3%ADa%20agendar%20una%20consulta"
        relatedArticles={[
          {
            href: '/blog/senales-ansiedad-necesita-atencion',
            label: '8 señales de ansiedad que sí necesitan atención',
            description: 'Señales concretas para saber si tu ansiedad merece atención profesional.',
          },
          {
            href: '/blog/que-es-terapia-cognitivo-conductual',
            label: '¿Qué es la TCC y cómo funciona?',
            description: 'La terapia con mayor evidencia científica explicada sin jerga.',
          },
          {
            href: '/blog/depresion-vs-tristeza-diferencias',
            label: 'Depresión vs tristeza: diferencias clave',
            description: 'Reconocer la diferencia puede cambiar cómo te cuidas a ti mismo.',
          },
        ]}
      >
        <div className="prose-blog">
          <p>
            La pregunta más buscada antes de agendar una cita con un psicólogo en Cancún no es "¿qué tipo de terapia necesito?" — es
            "¿cuánto cuesta?". Es una pregunta completamente válida, y merece una respuesta directa.
          </p>

          <h2>Precio promedio de una sesión en Cancún</h2>
          <p>
            El rango real en Cancún oscila entre <strong>$600 y $1,500 MXN</strong> por sesión de 50 minutos, dependiendo
            de la formación del terapeuta, el tipo de intervención y la zona de la ciudad.
          </p>
          <p>
            Con la <strong>Psic. Noemi Eb.</strong>, el precio por sesión es de <strong>$800 a $1,200 MXN</strong>.
            No hay cuota de inscripción. La primera sesión tiene el mismo precio que las siguientes — sin cargos adicionales
            por "evaluación inicial".
          </p>

          {/* Answer box */}
          <div
            className="my-6 rounded-xl p-5 border-l-4"
            style={{ backgroundColor: '#f5fafa', borderColor: '#1a4a4a' }}
          >
            <p className="font-bold text-sm mb-1" style={{ color: '#1a4a4a' }}>En Psic. Noemi Eb.:</p>
            <ul className="text-sm space-y-1 m-0 pl-0 list-none" style={{ color: '#517171' }}>
              <li>• <strong>Precio por sesión:</strong> $800–$1,200 MXN</li>
              <li>• <strong>Duración:</strong> 50 minutos</li>
              <li>• <strong>Primera sesión:</strong> mismo precio, sin cargos extra</li>
              <li>• <strong>Sin cuota de inscripción</strong></li>
            </ul>
          </div>

          <h2>¿Qué incluye cada sesión?</h2>
          <p>Una sesión de terapia cognitivo conductual no es solo "hablar". Cada sesión de 50 minutos incluye:</p>
          <ul>
            <li><strong>Evaluación continua</strong> del progreso desde la sesión anterior</li>
            <li><strong>Trabajo sobre pensamientos y conductas</strong> específicos identificados en la sesión</li>
            <li><strong>Psicoeducación</strong>: entender qué está pasando en tu mente y por qué</li>
            <li><strong>Técnicas concretas</strong>: reestructuración cognitiva, exposición gradual, técnicas de relajación</li>
            <li><strong>Tarea entre sesiones</strong>: ejercicios para practicar lo trabajado en tu vida diaria</li>
          </ul>
          <p>
            La tarea entre sesiones no es opcional — es donde ocurre la mayor parte del cambio real. La terapia no funciona
            solo dentro del consultorio.
          </p>

          <h2>¿Cuántas sesiones necesitas?</h2>
          <p>
            La terapia cognitivo conductual es una de las pocas modalidades con protocolos de duración definida.
            Para ansiedad generalizada o depresión moderada, la evidencia indica que la mayoría de los casos
            mejoran significativamente en <strong>8 a 20 sesiones</strong>.
          </p>
          <p>
            Esto no es una promesa de "cura en 8 sesiones" — es el rango real que la investigación documenta.
            Casos más complejos o con varias condiciones simultáneas pueden requerir más tiempo.
            Pero el objetivo de la TCC es claro: que en algún punto no necesites la terapia para funcionar bien.
          </p>

          <h2>¿Es cara la terapia?</h2>
          <p>
            Depende de con qué la compares. El costo real de <em>no</em> ir a terapia incluye:
          </p>
          <ul>
            <li>Días perdidos de trabajo o estudio por ansiedad o depresión no tratada</li>
            <li>Relaciones afectadas por patrones que no se trabajan</li>
            <li>Medicación sin acompañamiento psicológico (que puede funcionar, pero es menos efectiva sola)</li>
            <li>El peso acumulado de años funcionando por debajo de tu capacidad</li>
          </ul>
          <p>
            Comparar el costo de 12 sesiones de TCC ($9,600–$14,400 MXN en rango completo) con el costo de
            un año más funcionando con ansiedad no tratada cambia completamente el cálculo.
          </p>

          <h2>¿Hay opciones más económicas?</h2>
          <p>Sí. Si el costo es una barrera real, existen alternativas:</p>
          <ul>
            <li>
              <strong>Clínica de Psicología UQROO:</strong> la Universidad de Quintana Roo ofrece atención psicológica
              a bajo costo a cargo de estudiantes supervisados por profesores.
            </li>
            <li>
              <strong>Centros comunitarios del DIF:</strong> atención psicológica gratuita o de bajo costo en algunos municipios.
            </li>
            <li>
              <strong>Terapia en línea:</strong> suele tener un precio entre 20–40% menor al presencial y tiene
              la misma efectividad según múltiples estudios.
            </li>
          </ul>

          <p>
            Si tienes dudas sobre si la terapia es la opción correcta para tu situación, puedes escribir directamente
            por{' '}
            <a
              href={waUrl('Hola Psic. Noemi, leí tu artículo sobre precios y tengo una duda')}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#1a4a4a', fontWeight: 600 }}
            >
              WhatsApp
            </a>
            {' '}antes de agendar. La primera orientación no tiene costo.
          </p>
        </div>
      </BlogLayout>
    </>
  );
}
