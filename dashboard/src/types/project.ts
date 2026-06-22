export type TechName =
  | 'Next.js'
  | 'TypeScript'
  | 'Tailwind CSS'
  | 'React'
  | 'HTML'
  | 'CSS'
  | 'JavaScript'
  | 'Framer Motion'
  | 'shadcn/ui';

export type ProjectStatus = 'live' | 'pending' | 'in-progress';

export type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  previewImage: string;
  previewAlt: string;
  techStack: TechName[];
  liveUrl: string | null;
  previewPath: string | null;
  devPort: number | null;
  status: ProjectStatus;
  year: number;
}
