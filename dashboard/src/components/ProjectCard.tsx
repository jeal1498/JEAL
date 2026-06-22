import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import type { Project, TechName } from '@/types/project';

const TECH_COLORS: Record<TechName, { bg: string; text: string }> = {
  'Next.js':        { bg: '#000000', text: '#ffffff' },
  'TypeScript':     { bg: '#3178c6', text: '#ffffff' },
  'React':          { bg: '#61dafb', text: '#1e2a3a' },
  'Tailwind CSS':   { bg: '#0ea5e9', text: '#ffffff' },
  'HTML':           { bg: '#e34f26', text: '#ffffff' },
  'CSS':            { bg: '#264de4', text: '#ffffff' },
  'JavaScript':     { bg: '#f7df1e', text: '#1a1a1a' },
  'Framer Motion':  { bg: '#0055ff', text: '#ffffff' },
  'shadcn/ui':      { bg: '#18181b', text: '#ffffff' },
};

const STATUS_LABELS: Record<Project['status'], { label: string; color: string }> = {
  live:         { label: 'Live',           color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  pending:      { label: 'En desarrollo',  color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  'in-progress':{ label: 'En progreso',    color: 'text-sky-400 bg-sky-400/10 border-sky-400/20' },
};

interface ProjectCardProps {
  project: Project;
  priority?: boolean;
}

export function ProjectCard({ project, priority = false }: ProjectCardProps) {
  const status = STATUS_LABELS[project.status];

  return (
    <article className="group relative bg-[hsl(var(--card))] rounded-[var(--radius)] border border-[hsl(var(--border))] overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-[0_20px_60px_rgba(208,208,231,0.06)]">
      {/* Screenshot zone */}
      <Link href={`/projects/${project.id}`} className="block relative aspect-[16/10] overflow-hidden bg-[#0a0810]">
        <Image
          src={project.previewImage}
          alt={project.previewAlt}
          fill
          className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
          priority={priority}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        {/* Category pill */}
        <span className="absolute top-3 left-3 text-[0.65rem] font-bold uppercase tracking-widest text-white/90 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
          {project.category}
        </span>
        {/* Status pill */}
        {project.status !== 'live' && (
          <span className={`absolute top-3 right-3 text-[0.65rem] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${status.color}`}>
            {status.label}
          </span>
        )}
      </Link>

      {/* Content zone */}
      <div className="p-5 flex flex-col gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[hsl(var(--card-foreground))] leading-tight">
            {project.name}
          </h2>
          <p className="mt-1.5 text-sm text-[hsl(var(--muted-foreground))] line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Tech badges */}
        <div className="flex flex-wrap gap-1.5">
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="text-[0.65rem] font-bold px-2 py-0.5 rounded"
              style={{ backgroundColor: TECH_COLORS[tech].bg, color: TECH_COLORS[tech].text }}
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-[hsl(var(--muted-foreground))]/60 font-mono">
            {project.year}
          </span>
          <div className="flex items-center gap-2">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors duration-200"
                onClick={(e) => e.stopPropagation()}
                title="Abrir sitio live"
              >
                <ExternalLink size={12} />
              </a>
            )}
            <Link
              href={`/projects/${project.id}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[hsl(var(--foreground))] bg-white/8 hover:bg-white/15 px-3 py-1.5 rounded transition-colors duration-200"
            >
              Ver Proyecto
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
