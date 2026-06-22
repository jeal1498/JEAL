import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Monitor, Tablet, Smartphone, ExternalLink, Loader2 } from 'lucide-react';
import type { Project, DeviceMode } from '@/types/project';

const DEVICE_WIDTHS: Record<DeviceMode, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};

const DEVICE_ICONS = {
  desktop: Monitor,
  tablet: Tablet,
  mobile: Smartphone,
} as const;

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

function resolveIframeSrc(project: Project): string | null {
  if (project.previewPath) return project.previewPath;
  if (project.devPort && process.env.NODE_ENV === 'development')
    return `http://localhost:${project.devPort}`;
  return project.liveUrl;
}

interface ProjectViewerProps {
  project: Project;
}

export function ProjectViewer({ project }: ProjectViewerProps) {
  const [device, setDevice] = useState<DeviceMode>('desktop');
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const iframeSrc = resolveIframeSrc(project);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    if ((iframe.contentDocument?.readyState ?? '') === 'complete') {
      setLoading(false);
      return;
    }
    const onLoad = () => setLoading(false);
    iframe.addEventListener('load', onLoad);
    return () => iframe.removeEventListener('load', onLoad);
  }, [iframeSrc]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[hsl(var(--background))]">
      {/* Top bar */}
      <header className="flex-shrink-0 h-12 bg-[#0a0810] border-b border-[hsl(var(--border))] flex items-center px-4 gap-4">
        {/* Left: back button */}
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors duration-200 shrink-0"
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">Proyectos</span>
        </Link>

        <div className="w-px h-5 bg-[hsl(var(--border))]" />

        {/* Center: project name + status */}
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

        {/* Right: device switcher + external link */}
        <div className="flex items-center gap-1 shrink-0">
          {(['desktop', 'tablet', 'mobile'] as DeviceMode[]).map((mode) => {
            const Icon = DEVICE_ICONS[mode];
            return (
              <button
                key={mode}
                onClick={() => setDevice(mode)}
                title={mode.charAt(0).toUpperCase() + mode.slice(1)}
                className={`p-1.5 rounded transition-all duration-200 ${
                  device === mode
                    ? 'text-[hsl(var(--foreground))] bg-white/10 border border-white/20'
                    : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-white/5'
                }`}
              >
                <Icon size={14} />
              </button>
            );
          })}

          {project.liveUrl && (
            <>
              <div className="w-px h-5 bg-[hsl(var(--border))] mx-1" />
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Abrir en nueva pestaña"
                className="p-1.5 rounded text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-white/5 transition-all duration-200"
              >
                <ExternalLink size={14} />
              </a>
            </>
          )}
        </div>
      </header>

      {/* Iframe area */}
      <main className="flex-1 overflow-auto bg-[hsl(var(--background))] relative">
        {iframeSrc ? (
          <div
            className="h-full transition-all duration-300 ease-in-out mx-auto"
            style={{ width: DEVICE_WIDTHS[device], minWidth: device === 'desktop' ? '100%' : undefined }}
          >
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-[hsl(var(--background))] z-10">
                <Loader2 className="animate-spin text-[hsl(var(--muted-foreground))]" size={24} />
              </div>
            )}
            <iframe
              ref={iframeRef}
              src={iframeSrc}
              title={project.name}
              className="w-full h-full border-0"
              style={{ display: 'block' }}
            />
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-4 text-center px-6">
            <div className="w-14 h-14 rounded-full bg-white/5 border border-[hsl(var(--border))] flex items-center justify-center">
              <Monitor size={22} className="text-[hsl(var(--muted-foreground))]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                Sitio en desarrollo
              </p>
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
