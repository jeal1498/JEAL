import Link from 'next/link';
import { Facebook } from 'lucide-react';
import { PHONE_NUMBER, waUrl, SOCIAL } from '@/lib/contact';

const SERVICIOS = [
  { href: '/terapia-individual-cancun', label: 'TCC para adultos' },
  { href: '/terapia-adolescentes-cancun', label: 'Terapia para adolescentes' },
  { href: '/terapia-ansiedad-depresion-cancun', label: 'Ansiedad y depresión' },
];

const INFORMACION = [
  { href: '/blog', label: 'Blog' },
  { href: '/#proceso', label: 'Cómo funciona la TCC' },
  { href: '/#faq', label: 'Preguntas frecuentes' },
  { href: '/psicologo-cancun', label: 'Psicóloga en Cancún' },
];

const FooterCol = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <p className="font-sans text-[0.7rem] font-bold tracking-[0.12em] uppercase text-[#c3e1e1]/50 mb-4">
      {title}
    </p>
    {children}
  </div>
);

const FooterLink = ({ href, className = '', children }: { href: string; className?: string; children: React.ReactNode }) => (
  <Link
    href={href}
    className={`font-sans text-[0.875rem] text-white/70 hover:text-white transition-colors ${className}`}
    style={{ textDecoration: 'none' }}
  >
    {children}
  </Link>
);

const Footer = () => (
  <footer style={{ background: '#0d3333' }} role="contentinfo">
    <div className="max-w-6xl mx-auto px-4 sm:px-6">

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-14 border-b border-white/10">

        {/* Brand */}
        <div>
          <p className="font-serif text-[1.35rem] text-white mb-1 leading-none">Psic. Noemi Eb.</p>
          <p className="font-sans text-[0.75rem] font-bold tracking-[0.06em] uppercase text-[#c3e1e1]/60 mb-3 mt-1">
            Psicoterapeuta en Cancún
          </p>
          <p className="font-sans text-[0.8rem] text-[#c3e1e1]/55">Enfoque cognitivo conductual</p>
          <p className="font-sans text-[0.78rem] text-[#c3e1e1]/40 mt-1">mentesanaylibre.com.mx</p>
        </div>

        {/* Servicios */}
        <FooterCol title="Servicios">
          <ul className="flex flex-col gap-3 list-none m-0 p-0">
            {SERVICIOS.map(({ href, label }) => (
              <li key={href}>
                <FooterLink href={href}>{label}</FooterLink>
              </li>
            ))}
          </ul>
        </FooterCol>

        {/* Información */}
        <FooterCol title="Información">
          <ul className="flex flex-col gap-3 list-none m-0 p-0">
            {INFORMACION.map(({ href, label }) => (
              <li key={href}>
                <FooterLink href={href}>{label}</FooterLink>
              </li>
            ))}
          </ul>
        </FooterCol>

        {/* Contacto */}
        <FooterCol title="Contacto">
          <ul className="flex flex-col gap-3 list-none m-0 p-0">
            <li>
              <a
                href={`tel:+${PHONE_NUMBER}`}
                className="font-sans text-[0.875rem] text-white/70 hover:text-white transition-colors"
                style={{ textDecoration: 'none' }}
              >
                +52 998 850 2475
              </a>
            </li>
            <li>
              <a
                href={waUrl('Hola Psic. Noemi, me interesa agendar una primera sesión')}
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-[0.875rem] font-bold text-[#25d366]"
                style={{ textDecoration: 'none' }}
              >
                WhatsApp
              </a>
            </li>
            <li>
              <span className="font-sans text-[0.875rem] text-white/55">Cancún, Quintana Roo · CP 77539</span>
            </li>
            <li className="pt-2">
              <div className="flex items-center gap-2">
                <a
                  href={SOCIAL.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook de Psic. Noemi Eb."
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-[#c3e1e1]/70 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Facebook className="w-[18px] h-[18px]" />
                </a>
              </div>
            </li>
          </ul>
        </FooterCol>

      </div>

      {/* Copyright */}
      <div className="py-5 text-center">
        <p className="font-sans text-[0.78rem] text-[#c3e1e1]/40 m-0">
          © 2026 Psic. Noemi Eb. — Mente Sana y Libre. Todos los derechos reservados.
        </p>
      </div>

    </div>
  </footer>
);

export default Footer;
