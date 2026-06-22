import Head from 'next/head';
import { DashboardHeader } from '@/components/DashboardHeader';
import { ProjectGrid } from '@/components/ProjectGrid';
import { DashboardFooter } from '@/components/DashboardFooter';
import { projects } from '@/data/projects';

export default function Home() {
  return (
    <>
      <Head>
        <title>Proyectos — JEAL</title>
        <meta
          name="description"
          content="Portafolio de proyectos web desarrollados por JEAL. Diseño y desarrollo web para negocios en México."
        />
        <meta property="og:title" content="Proyectos — JEAL" />
        <meta
          property="og:description"
          content="Portafolio de proyectos web desarrollados por JEAL."
        />
      </Head>
      <div className="min-h-screen flex flex-col">
        <DashboardHeader />
        <main className="flex-1">
          <ProjectGrid projects={projects} />
        </main>
        <DashboardFooter />
      </div>
    </>
  );
}
