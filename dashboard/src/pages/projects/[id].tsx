import type { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { ProjectViewer } from '@/components/ProjectViewer';
import { projects } from '@/data/projects';
import type { Project } from '@/types/project';

interface Props {
  project: Project;
}

export default function ProjectPage({ project }: Props) {
  return (
    <>
      <Head>
        <title>{project.name} — JEAL</title>
        <meta name="description" content={project.description} />
      </Head>
      <ProjectViewer project={project} />
    </>
  );
}

export const getStaticPaths: GetStaticPaths = () => ({
  paths: projects.map((p) => ({ params: { id: p.id } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<Props> = ({ params }) => {
  const project = projects.find((p) => p.id === params?.id);
  if (!project) return { notFound: true };
  return { props: { project } };
};
