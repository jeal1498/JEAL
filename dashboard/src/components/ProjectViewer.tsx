import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Monitor, ExternalLink } from 'lucide-react';
import type { Project } from '@/types/project';

const STATUS_LABELS: Record<Project['status'], string> = {
  live: 'Live',
  pending: 'En desarrollo',
  'in-progress': 'En progreso',
};

const STATUS_COLORS: Record<Project['status'], string> = {
  live: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  pending: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  'in-progress': 'text-sky-400 bg-sky-400/10 border-sky-400/20',
};

function resolveExternalUrl(project: Project): string | null {
  if (project.liveUrl) return project.liveUrl;
  if (project.previewPath) return project.previewPath;
  return null;
}

interface ProjectViewerProps {
  project: Project;
}

export function ProjectViewer({ project }: ProjectViewerProps) {
  const externalUrl = resolveExternalUrl(project);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[hsl(var(--background))]">
      {/* Top bar */}
      <header className="flex-shrink-0 h-12 bg-[#0a0810] border-b border-[hsl(var(--border))] flex items-center px-4 gap-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors duration-200 shrink-0"
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">Proyectos</span>
        </Link>

        <div className="w-px h-5 bg-[hsl(var(--border))]" />

        <div className="flex-1 flex items-center gap-2 min-w-0">
          <h1 className="text-sm font-semibold text-[hsl(var(--foreground))] truncate">
            {project.name}
          </h1>
          <span
            className={`hidden sm:inline text-[0.6rem] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${STATUS_COLORS[project.status]}`}
          >
            {STATUS_LABELS[project.status]}
          </span>
        </div>

        {externalUrl && (
          <div className="flex items-center gap-1 shrink-0">
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Abrir en nueva pestaña"
              className="p-1.5 rounded text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-white/5 transition-all duration-200"
            >
              <ExternalLink size={14} />
            </a>
          </div>
        )}
      </header>

      {/* Content area */}
      <main className="flex-1 overflow-auto bg-[hsl(var(--background))] relative">
        {externalUrl ? (
          <div className="h-full flex flex-col items-center justify-center gap-6 px-6">
            <div className="relative w-full max-w-2xl aspect-[16/10] rounded-lg overflow-hidden border border-[hsl(var(--border))] shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
              <Image
                src={project.previewImage}
                alt={project.previewAlt}
                fill
                className="object-cover object-top"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <p className="text-xs text-white/60 font-mono">{externalUrl}</p>
                <a
                  href={externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-bold text-white bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 px-3 py-1.5 rounded-full transition-all duration-200"
                >
                  <ExternalLink size={11} />
                  Abrir sitio
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* No URL at all */
          <div className="h-full flex flex-col items-center justify-center gap-4 text-center px-6">
            <div className="w-14 h-14 rounded-full bg-white/5 border border-[hsl(var(--border))] flex items-center justify-center">
              <Monitor size={22} className="text-[hsl(var(--muted-foreground))]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[hsl(var(--foreground))]">Sitio en desarrollo</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                La URL del proyecto aún no está disponible.
              </p>
            </div>
            <Link
              href="/"
              className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] underline underline-offset-2 transition-colors"
            >
              ← Volver a proyectos
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
