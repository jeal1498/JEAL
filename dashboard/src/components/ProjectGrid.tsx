import { ProjectCard } from '@/components/ProjectCard';
import type { Project } from '@/types/project';

interface ProjectGridProps {
  projects: Project[];
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  return (
    <section className="max-w-5xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {projects.map((project, i) => (
          <ProjectCard key={project.id} project={project} priority={i === 0} />
        ))}
      </div>
    </section>
  );
}
