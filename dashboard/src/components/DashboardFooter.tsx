export function DashboardFooter() {
  return (
    <footer className="bg-[#0a0810] border-t border-[hsl(var(--border))]">
      <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between">
        <span className="text-sm text-[hsl(var(--muted-foreground))]">
          © {new Date().getFullYear()} JEAL — Diseño & Desarrollo Web
        </span>
        <span className="text-xs text-[hsl(var(--muted-foreground))]/50 font-mono">
          v1.0
        </span>
      </div>
    </footer>
  );
}
