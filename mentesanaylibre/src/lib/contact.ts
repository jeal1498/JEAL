export const WA_NUMBER = '529988502475';
export const PHONE_NUMBER = '529988502475';
/** Teléfono en formato E.164, para `telephone` en JSON-LD. */
export const PHONE_E164 = '+529988502475';

export function waUrl(message: string): string {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

/* ───────────────────────────────────────────────
   Redes sociales — única fuente de verdad
   ─────────────────────────────────────────────── */
export const SOCIAL = {
  facebook: 'https://www.facebook.com/psic.noemieb',
  // instagram: '',  // agregar cuando esté disponible
  // tiktok:    '',
} as const;

/**
 * URLs de directorios (agregar cuando se creen los perfiles).
 * Propaga automáticamente a sameAs en todos los schemas JSON-LD.
 */
export const DIRECTORY_PROFILES: string[] = [
  // 'https://www.doctoralia.com.mx/psicologos/noemi-eb',
  // 'https://www.psychologytoday.com/mx/therapists/noemi-eb',
  // 'https://maps.google.com/?cid=XXXX',
];

/** Todos los perfiles para `sameAs` en JSON-LD. */
export const SOCIAL_PROFILES: string[] = [
  SOCIAL.facebook,
  ...DIRECTORY_PROFILES,
];
