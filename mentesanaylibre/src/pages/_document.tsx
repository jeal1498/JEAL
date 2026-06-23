import { Html, Head, Main, NextScript } from 'next/document';
import { PHONE_E164, SOCIAL_PROFILES } from '@/lib/contact';
import { SITE_URL, CEDULA, SPECIALIST_IMAGE, ADDRESS, GEO, HOURS, REVIEWS } from '@/lib/site';

const medicalBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': ['MedicalBusiness', 'MedicalClinic'],
  '@id': `${SITE_URL}/#clinic`,
  name: 'Psic. Noemi Eb. — Terapia Cognitivo Conductual en Cancún',
  alternateName: 'Mente Sana y Libre — Psicoterapeuta Cancún',
  image: SPECIALIST_IMAGE,
  address: {
    '@type': 'PostalAddress',
    ...ADDRESS,
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: GEO.latitude,
    longitude: GEO.longitude,
  },
  url: SITE_URL,
  telephone: PHONE_E164,
  priceRange: '$$',
  medicalSpecialty: 'Psychiatry',
  currenciesAccepted: 'MXN',
  paymentAccepted: 'Efectivo, Transferencia bancaria, Tarjeta',
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: HOURS.weekdays.opens,
      closes: HOURS.weekdays.closes,
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Saturday',
      opens: HOURS.saturday.opens,
      closes: HOURS.saturday.closes,
    },
  ],
  areaServed: [
    { '@type': 'City', name: 'Cancún', sameAs: 'https://www.wikidata.org/wiki/Q8969' },
    { '@type': 'City', name: 'Playa del Carmen', sameAs: 'https://www.wikidata.org/wiki/Q505403' },
    { '@type': 'City', name: 'Tulum', sameAs: 'https://www.wikidata.org/wiki/Q697023' },
    { '@type': 'AdministrativeArea', name: 'Quintana Roo', sameAs: 'https://www.wikidata.org/wiki/Q10507' },
    { '@type': 'AdministrativeArea', name: 'Riviera Maya' },
  ],
  sameAs: SOCIAL_PROFILES,
};

const professionalSchema = {
  '@context': 'https://schema.org',
  '@type': ['Physician', 'HealthcareProfessional'],
  '@id': `${SITE_URL}/#physician`,
  name: 'Noemi Eb.',
  jobTitle: 'Psicoterapeuta — Especialista en Terapia Cognitivo Conductual',
  url: SITE_URL,
  image: SPECIALIST_IMAGE,
  description: `Psicoterapeuta especializada en terapia cognitivo conductual (TCC) para adultos y adolescentes en Cancún. Tratamiento de ansiedad, depresión y estrés con enfoque basado en evidencia.${CEDULA !== '[CÉDULA_PENDIENTE]' ? ` Cédula Federal ${CEDULA}.` : ''}`,
  hasCredential: CEDULA !== '[CÉDULA_PENDIENTE]' ? {
    '@type': 'EducationalOccupationalCredential',
    credentialCategory: 'Cédula Profesional Federal',
    credentialId: CEDULA,
    issuedBy: { '@type': 'Organization', name: 'Secretaría de Educación Pública, México' },
  } : undefined,
  hasOccupation: {
    '@type': 'Occupation',
    name: 'Psicoterapeuta',
    skills: ['Terapia cognitivo conductual', 'TCC', 'Ansiedad', 'Depresión', 'Terapia para adolescentes', 'Reestructuración cognitiva', 'Exposición gradual', 'Activación conductual'],
  },
  aggregateRating: parseInt(REVIEWS.reviewCount) > 0 ? {
    '@type': 'AggregateRating',
    ratingValue: REVIEWS.ratingValue,
    reviewCount: REVIEWS.reviewCount,
    bestRating: '5',
    worstRating: '1',
  } : undefined,
  sameAs: SOCIAL_PROFILES,
};

export default function Document() {
  return (
    <Html lang="es-MX" className="scroll-smooth">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Gloock&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="dns-prefetch" href="https://wa.me" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalBusinessSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(professionalSchema) }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
