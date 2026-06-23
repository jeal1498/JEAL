import Link from 'next/link';
import { useRouter } from 'next/router';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/', label: 'Proyectos' },
  { href: '/servicios', label: 'Servicios' },
];

export function SiteNav() {
  const { pathname } = useRouter();

  return (
    <nav className="bg-[#0a0810] border-b border-[hsl(var(--border))]">
      <div className="max-w-5xl mx-auto px-6 h-12 flex items-center justify-between">
        <Link
          href="/"
          className="text-sm font-bold tracking-tight text-[hsl(var(--foreground))] hover:opacity-80 transition-opacity duration-200"
        >
          JAKE
        </Link>
        <div className="flex items-center gap-6">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'text-sm font-medium transition-colors duration-200 pb-0.5',
                  isActive
                    ? 'text-[hsl(var(--foreground))] border-b-2 border-emerald-400'
                    : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                )}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
