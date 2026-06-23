/**
 * Datos de identidad del negocio — única fuente de verdad.
 * Usados en JSON-LD (schema.org), meta tags (canonical/OG) y texto visible.
 * Cambiar aquí se propaga a todo el sitio.
 */

/** Dominio canónico, sin barra final. Base para canonical, OG, @id e imágenes. */
export const SITE_URL = 'https://www.mentesanaylibre.com.mx';

/** Cédula profesional (pendiente confirmar con la especialista). */
export const CEDULA = '[CÉDULA_PENDIENTE]';

/** Ruta relativa de la foto de la especialista. */
export const SPECIALIST_IMAGE_PATH = '/Psicologa_Noemi_Eb.webp';

/** URL absoluta de la foto (para schema image, OG y Twitter). */
export const SPECIALIST_IMAGE = `${SITE_URL}${SPECIALIST_IMAGE_PATH}`;

/** Nombre y título profesional. */
export const SPECIALIST_NAME = 'Noemi Eb.';
export const SPECIALIST_TITLE = 'Psic.';
export const SPECIALIST_FULL = `${SPECIALIST_TITLE} ${SPECIALIST_NAME}`;

/** Dirección postal del consultorio. */
export const ADDRESS = {
  streetAddress: '[DIRECCIÓN_PENDIENTE]',
  addressLocality: 'Cancún',
  addressRegion: 'Quintana Roo',
  postalCode: '77539',
  addressCountry: 'MX',
} as const;

/** Coordenadas GPS (centro de Cancún — actualizar con pin verificado en GBP). */
export const GEO = { latitude: 21.1619, longitude: -86.8515 } as const;

/** Horarios de atención. */
export const HOURS = {
  weekdays: { opens: '09:00', closes: '19:00', display: '9:00 AM – 7:00 PM' },
  saturday: { opens: '09:00', closes: '14:00', display: '9:00 AM – 2:00 PM' },
} as const;

/** Calificación agregada — actualizar cuando se acumulen reseñas. */
export const REVIEWS = {
  ratingValue: '5.0',
  reviewCount: '0',
} as const;
