import { Link, useLocation } from 'react-router';
import {
  AlertTriangle,
  Box,
  Boxes,
  Calendar,
  LayoutDashboard,
  Moon,
  Settings,
  Sun,
  UserCircle,
  Users,
} from 'lucide-react';
import { StageOpsLogo } from '@/components/brand/StageOpsLogo';
import { useAuth } from '@/contexts/auth.context';
import { useTheme } from '@/lib/use-theme';

const navigation = [
  { code: '01', name: 'Vue générale', mobileName: 'Accueil', href: '/', icon: LayoutDashboard },
  { code: '02', name: 'Plateau 3D', mobileName: 'Scène', href: '/stage', icon: Boxes },
  { code: '03', name: 'Parc matériel', mobileName: 'Matériel', href: '/equipment', icon: Box },
  { code: '04', name: 'Conducteur', mobileName: 'Agenda', href: '/events', icon: Calendar },
  { code: '05', name: 'Alertes', mobileName: 'Alertes', href: '/incidents', icon: AlertTriangle },
  { code: '06', name: 'Équipe', mobileName: 'Équipe', href: '/team', icon: Users },
  { code: '07', name: 'Système', mobileName: 'Réglages', href: '/settings', icon: Settings },
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
    <aside aria-label="Navigation principale" className="relative hidden h-dvh w-[15.5rem] shrink-0 flex-col border-r border-theme-border bg-theme-deeper lg:flex">
      <div className="absolute right-0 top-0 h-28 w-px bg-gradient-to-b from-cyan-400 to-transparent" />

      <div className="border-b border-theme-border px-5 py-5">
        <StageOpsLogo />
        <div className="mt-5 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.18em] text-content-faint">
          <span>Ops console</span>
          <span>v.01</span>
        </div>
      </div>

      <nav aria-label="Navigation principale" className="flex-1 py-4">
        <p className="control-label mb-3 px-5 text-content-faint">Modules</p>
        {navigation.map((item) => {
          const isActive = isCurrentPath(location.pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              to={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={`group relative grid grid-cols-[2.25rem_1fr_1.75rem] items-center border-y border-transparent px-5 py-3 text-sm transition-all duration-200 ${
                isActive
                  ? 'border-theme-border bg-cyan-400/[0.08] text-content-primary'
                  : 'text-content-muted hover:border-theme-border hover:bg-theme-base hover:text-content-primary'
              }`}
            >
              <span className={`font-mono text-[9px] tracking-wider ${isActive ? 'text-cyan-300' : 'text-content-faint'}`}>{item.code}</span>
              <span className="font-semibold">{item.name}</span>
              <Icon size={16} strokeWidth={1.6} className={isActive ? 'text-cyan-300' : 'text-content-faint group-hover:text-content-muted'} />
              {isActive && <span className="absolute inset-y-0 left-0 w-[3px] bg-cyan-400" />}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-theme-border">
        <div className="grid grid-cols-2 border-b border-theme-border">
          <button
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'}
            className="flex items-center gap-2 border-r border-theme-border px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-content-subtle transition-colors hover:bg-theme-elevated hover:text-content-primary"
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            {theme === 'dark' ? 'Clair' : 'Sombre'}
          </button>
          <div className="flex items-center justify-end gap-2 px-4 py-3 font-mono text-[9px] uppercase tracking-wider text-content-subtle">
            <span className="signal-dot" /> Live
          </div>
        </div>
        <Link to="/profile" className="group flex items-center gap-3 px-5 py-4 transition-colors hover:bg-theme-base">
          <span className="grid h-8 w-8 place-items-center border border-theme-border text-content-muted group-hover:border-cyan-400/40 group-hover:text-cyan-300">
            <UserCircle size={17} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[11px] font-semibold text-content-primary">{user?.email ?? 'Mode démonstration'}</span>
            <span className="control-label mt-1 block text-[8px] text-content-faint">Accès local</span>
          </span>
          <span className="font-mono text-[10px] text-content-faint">↗</span>
        </Link>
      </div>
    </aside>
  );
}

export function MobileHeader() {
  return (
    <header className="flex h-[4.25rem] shrink-0 items-center justify-between border-b border-theme-border bg-theme-deeper px-4 lg:hidden">
      <StageOpsLogo />
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-wider text-content-subtle"><span className="signal-dot" />Live</span>
        <Link to="/profile" aria-label="Ouvrir le profil" className="grid h-9 w-9 place-items-center border border-theme-border text-content-muted">
          <UserCircle size={17} />
        </Link>
      </div>
    </header>
  );
}

export function MobileNav() {
  const location = useLocation();

  return (
    <nav aria-label="Navigation mobile" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-theme-border bg-theme-deeper lg:hidden">
      {mobileNavigation.map((item) => {
        const Icon = item.icon;
        const isActive = isCurrentPath(location.pathname, item.href);
        return (
          <Link
            key={item.href}
            to={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={`relative flex min-w-0 flex-col items-center gap-1 border-r border-theme-border px-1 py-2.5 text-[8px] font-bold uppercase tracking-wide transition-colors last:border-r-0 ${
              isActive ? 'bg-cyan-400/[0.1] text-cyan-300' : 'text-content-subtle'
            }`}
          >
            {isActive && <span className="absolute inset-x-0 top-0 h-0.5 bg-cyan-400" />}
            <Icon size={17} strokeWidth={isActive ? 2 : 1.5} />
            <span className="max-w-full truncate">{item.mobileName}</span>
          </Link>
        );
      })}
    </nav>
  );
}
