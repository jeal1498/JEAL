import type { Project } from '@/types/project';

export const projects: Project[] = [
  {
    id: 'portfolio-karen-trujillo',
    name: 'Psicóloga Karen Trujillo',
    description:
      'Sitio clínico para neuropsicóloga especialista en TDAH y autismo en Cancún. Convierte familias con dudas en consultas agendadas.',
    category: 'Portafolio Clínico',
    previewImage: '/previews/karen-trujillo.png',
    previewAlt: 'Sitio web de la Psicóloga Karen Trujillo',
    techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'React', 'Framer Motion', 'shadcn/ui'],
    liveUrl: 'https://www.psicologakarentrujillo.com.mx',
    previewPath: null,
    status: 'live',
    year: 2025,
  },
  {
    id: 'mentesanaylibre',
    name: 'Psic. Noemi Eb. — Mente Sana y Libre',
    description:
      'Sitio clínico para psicoterapeuta con enfoque cognitivo conductual en Cancún. Convierte adultos con ansiedad o depresión en primeras sesiones agendadas.',
    category: 'Portafolio Clínico',
    previewImage: '/previews/mentesanaylibre.svg',
    previewAlt: 'Sitio web de Psic. Noemi Eb. — Mente Sana y Libre',
    techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'React', 'Framer Motion', 'shadcn/ui'],
    liveUrl: null,
    previewPath: '/projects/mentesanaylibre',
    status: 'in-progress',
    year: 2026,
  },
  {
    id: 'hotel-jireh',
    name: 'Hotel Jireh Bacalar',
    description:
      'Sitio web para hotel boutique familiar en Bacalar, Quintana Roo. Orientado a reservas directas y visibilidad local.',
    category: 'Hotel & Hospitalidad',
    previewImage: '/previews/hotel-jireh.png',
    previewAlt: 'Sitio web del Hotel Jireh en Bacalar',
    techStack: ['HTML', 'CSS', 'JavaScript'],
    liveUrl: null,
    previewPath: '/projects/hotel-jireh/index.html',
    status: 'pending',
    year: 2025,
  },
];
