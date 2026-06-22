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
    devPort: 3001,
    status: 'live',
    year: 2025,
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
    devPort: null,
    status: 'pending',
    year: 2025,
  },
];
