import Head from 'next/head';
import { SiteNav } from '@/components/SiteNav';
import { ServiciosContent } from '@/components/ServiciosContent';
import { DashboardFooter } from '@/components/DashboardFooter';

export default function ServiciosPage() {
  return (
    <>
      <Head>
        <title>Servicios — JAKE | Diseño Web para Profesionales de la Salud</title>
        <meta
          name="description"
          content="Diseño web, SEO, GEO y AEO para psicólogos, dentistas y profesionales de la salud en México. Sitios que posicionan desde el día uno."
        />
        <meta property="og:title" content="Servicios — JAKE" />
        <meta
          property="og:description"
          content="Webs que posicionan para profesionales de la salud en México."
        />
      </Head>
      <div className="min-h-screen flex flex-col">
        <SiteNav />
        <main className="flex-1">
          <ServiciosContent />
        </main>
        <DashboardFooter />
      </div>
    </>
  );
}
