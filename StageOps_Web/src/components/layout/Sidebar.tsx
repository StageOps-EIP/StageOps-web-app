import { Link, useLocation } from 'react-router';
import {
  AlertTriangle,
  Box,
  Boxes,
  Calendar,
  LayoutDashboard,
  Moon,
  Radio,
  Settings,
  Sun,
  UserCircle,
  Users,
} from 'lucide-react';
import { StageOpsLogo } from '@/components/brand/StageOpsLogo';
import { useAuth } from '@/contexts/auth.context';
import { useTheme } from '@/lib/use-theme';

const navigation = [
  { name: 'Tableau de bord', mobileName: 'Accueil', href: '/', icon: LayoutDashboard },
  { name: 'Vue scène', mobileName: 'Scène', href: '/stage', icon: Boxes },
  { name: 'Inventaire', mobileName: 'Matériel', href: '/equipment', icon: Box },
  { name: 'Événements', mobileName: 'Agenda', href: '/events', icon: Calendar },
  { name: 'Incidents', mobileName: 'Alertes', href: '/incidents', icon: AlertTriangle },
  { name: 'Équipe', mobileName: 'Équipe', href: '/team', icon: Users },
  { name: 'Paramètres', mobileName: 'Réglages', href: '/settings', icon: Settings },
];

const mobileNavigation = navigation.slice(0, 5);

function isCurrentPath(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

export function Sidebar() {
  const location = useLocation();
  const { theme, toggle } = useTheme();
  const { user } = useAuth();

  return (
    <aside aria-label="Navigation principale" className="relative hidden h-dvh w-[17.5rem] shrink-0 flex-col border-r border-theme-border bg-theme-deeper lg:flex">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-cyan-400/10 to-transparent" />

      <div className="relative px-6 pb-5 pt-6">
        <StageOpsLogo />
        <div className="mt-5 flex items-center gap-2 rounded-xl border border-cyan-400/15 bg-cyan-400/[0.07] px-3 py-2">
          <Radio size={13} className="text-cyan-400" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-content-muted">
            Centre de régie
          </span>
        </div>
      </div>

      <nav aria-label="Navigation principale" className="relative flex-1 space-y-1 px-4 py-2">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-content-faint">Pilotage</p>
        {navigation.map((item) => {
          const isActive = isCurrentPath(location.pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              to={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-400/15 to-brand-violet/5 text-cyan-300 shadow-sm'
                  : 'text-content-muted hover:bg-theme-elevated hover:text-content-primary'
              }`}
            >
              {isActive && <span className="absolute -left-4 h-6 w-0.5 rounded-r-full bg-cyan-400 shadow-[0_0_12px_rgba(120,133,255,0.8)]" />}
              <span className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${isActive ? 'bg-cyan-400/15' : 'group-hover:bg-theme-base'}`}>
                <Icon size={17} strokeWidth={1.9} />
              </span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-theme-border p-4">
        <button
          onClick={toggle}
          aria-label={theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-content-muted transition-all duration-200 hover:bg-theme-elevated hover:text-content-primary"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
        </button>
        <Link
          to="/profile"
          className={`flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm font-medium transition-all duration-200 ${
            location.pathname === '/profile'
              ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300'
              : 'border-theme-border bg-theme-base text-content-muted hover:border-theme-border-hover hover:text-content-primary'
          }`}
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-brand-violet text-white shadow-brand">
            <UserCircle size={19} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs text-content-primary">{user?.email ?? 'Session de démonstration'}</span>
            <span className="mt-0.5 flex items-center gap-1.5 text-[10px] text-content-subtle">
              <span className="h-1.5 w-1.5 animate-soft-pulse rounded-full bg-emerald-400" />
              Système opérationnel
            </span>
          </span>
        </Link>
      </div>
    </aside>
  );
}

export function MobileHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-theme-border bg-theme-deeper px-4 backdrop-blur-xl lg:hidden">
      <StageOpsLogo />
      <Link
        to="/profile"
        aria-label="Ouvrir le profil"
        className="grid h-10 w-10 place-items-center rounded-xl border border-theme-border bg-theme-base text-content-muted"
      >
        <UserCircle size={20} />
      </Link>
    </header>
  );
}

export function MobileNav() {
  const location = useLocation();

  return (
    <nav
      aria-label="Navigation mobile"
      className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-2xl border border-theme-border bg-theme-deeper p-1.5 shadow-2xl backdrop-blur-xl lg:hidden"
    >
      {mobileNavigation.map((item) => {
        const Icon = item.icon;
        const isActive = isCurrentPath(location.pathname, item.href);
        return (
          <Link
            key={item.href}
            to={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={`flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[9px] font-semibold transition-colors ${
              isActive ? 'bg-cyan-400/15 text-cyan-300' : 'text-content-subtle'
            }`}
          >
            <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
            <span className="max-w-full truncate">{item.mobileName}</span>
          </Link>
        );
      })}
    </nav>
  );
}
