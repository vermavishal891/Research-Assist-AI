import Link from "next/link";
import {
  Activity,
  BarChart3,
  Database,
  Gauge,
  Heart,
  Home,
  ListFilter,
  PlayCircle,
  Radar,
  Settings,
  Signal,
  WalletCards,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/research/start", label: "Start Research", icon: PlayCircle },
  { href: "/research/auto-discovery", label: "Auto Discovery", icon: Radar },
  { href: "/research/runs", label: "Research Runs", icon: Activity },
  { href: "/signals", label: "Market Signals", icon: Signal },
  { href: "/opportunities", label: "Opportunities", icon: BarChart3 },
  { href: "/watchlist", label: "Watchlist", icon: Heart },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/data-sources", label: "Data Sources", icon: Database },
  { href: "/usage", label: "Usage", icon: WalletCards },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-slate-800 bg-[#080d16] px-4 py-5 lg:block">
        <Link href="/" className="flex items-center gap-3 px-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-400/30 bg-cyan-400/10 text-cyan-200">
            <Gauge size={20} />
          </span>
          <span>
            <span className="block text-sm font-semibold text-slate-50">AI Market Signal</span>
            <span className="block text-xs text-slate-500">Research Assistant</span>
          </span>
        </Link>
        <nav className="mt-8 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-slate-900 hover:text-slate-50"
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-5 left-4 right-4 rounded-lg border border-amber-400/20 bg-amber-400/10 p-3 text-xs text-amber-100">
          Research-only mode. No website generation, publishing, or deployment actions are available.
        </div>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-slate-800 bg-[#070b12]/90 px-4 py-4 backdrop-blur md:px-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-cyan-300">Investor research console</p>
              <h1 className="text-xl font-semibold text-slate-50">AI Market Signal Research Assistant</h1>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-500">
              <ListFilter size={16} />
              Evidence-first analysis
            </div>
          </div>
        </header>
        <main className="px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
