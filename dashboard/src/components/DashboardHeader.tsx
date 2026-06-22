import { projects } from '@/data/projects';

export function DashboardHeader() {
  const liveCount = projects.filter((p) => p.status === 'live').length;

  return (
    <header className="bg-[#0a0810] border-b border-[hsl(var(--border))]">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="text-[0.65rem] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
              {projects.length} proyecto{projects.length !== 1 ? 's' : ''}
            </span>
            {liveCount > 0 && (
              <span className="text-[0.65rem] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full">
                {liveCount} en vivo
              </span>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[hsl(var(--foreground))]">
            Proyectos de Clientes
          </h1>
          <p className="text-lg text-[hsl(var(--muted-foreground))] max-w-xl">
            Diseño y desarrollo web para negocios en México. Cada proyecto es único, construido con atención al detalle.
          </p>
        </div>
      </div>
    </header>
  );
}
