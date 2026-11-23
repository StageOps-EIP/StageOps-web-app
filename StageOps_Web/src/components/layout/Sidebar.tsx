import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { CalendarDays, House, Menu, Package, TriangleAlert, X } from 'lucide-react'
import { StageOpsLogo } from '@/components/brand/StageOpsLogo'
import { useAuth } from '@/contexts/auth.context'

const navigation = [
  { name: 'Vue générale', mobileName: 'Accueil', href: '/' },
  { name: 'Plateau 3D', mobileName: 'Plateau', href: '/stage' },
  { name: 'Parc matériel', mobileName: 'Matériel', href: '/equipment' },
  { name: 'Conducteur', mobileName: 'Planning', href: '/events' },
  { name: 'Incidents', mobileName: 'Incidents', href: '/incidents' },
  { name: 'Équipe', mobileName: 'Équipe', href: '/team' },
  { name: 'Paramètres', mobileName: 'Réglages', href: '/settings' },
]

const mobileNavigation = [
  { name: 'Accueil', href: '/', icon: House },
  { name: 'Incidents', href: '/incidents', icon: TriangleAlert },
  { name: 'Matériel', href: '/equipment', icon: Package },
  { name: 'Planning', href: '/events', icon: CalendarDays },
]

function isCurrentPath(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href)
}

function NavigationLinks({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation()

  return (
    <nav aria-label="Navigation principale" className="space-y-1 px-3">
      {navigation.map((item) => {
        const isActive = isCurrentPath(location.pathname, item.href)
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={onNavigate}
            aria-current={isActive ? 'page' : undefined}
            className={`stage-nav-link ${
              isActive ? 'stage-nav-link--active' : 'text-content-muted hover:text-content-primary'
            }`}
          >
            <span className="stage-nav-mark" aria-hidden="true" />
            <span>{item.name}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export function Sidebar() {
  const { user } = useAuth()

  return (
    <aside
      aria-label="Barre latérale"
      className="hidden h-dvh w-[13.75rem] shrink-0 flex-col border-r border-theme-border bg-theme-base lg:flex"
    >
      <div className="px-5 pb-5 pt-5">
        <StageOpsLogo />
        <div className="mt-6 border-t border-theme-border pt-5">
          <p className="text-sm font-semibold text-content-primary">Scénario d’exemple</p>
          <p className="mt-1 text-xs text-content-muted">Programme de février 2026</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        <NavigationLinks />
      </div>

      <div className="px-5 pb-5 pt-3">
        <Link
          to="/profile"
          className="group flex items-center gap-3 border-t border-theme-border pt-4"
        >
          <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--brand-soft)] text-[10px] font-semibold text-[var(--brand-violet-hover)]">
            SO
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-content-primary">
              {user?.email ?? 'Espace local'}
            </span>
            <span className="block text-[10px] text-content-subtle group-hover:text-content-muted">
              Profil et accès
            </span>
          </span>
        </Link>
      </div>
    </aside>
  )
}

export function MobileHeader() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-theme-border bg-theme-base px-4 lg:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <StageOpsLogo compact />
          <span className="rounded-md bg-[var(--brand-soft)] px-2 py-1 text-xs font-bold text-[var(--brand-violet-hover)]" aria-label="Scénario d’exemple">
            Démo
          </span>
        </div>
        <button
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          className="grid h-11 w-11 place-items-center rounded-lg border border-theme-border text-content-muted"
        >
          {open ? <X size={19} /> : <Menu size={19} />}
        </button>
      </header>
      {open && (
        <div id="mobile-menu" className="absolute inset-x-0 top-16 z-50 border-b border-theme-border bg-theme-base py-4 shadow-xl lg:hidden">
          <NavigationLinks onNavigate={() => setOpen(false)} />
          <div className="mx-4 mt-3 border-t border-theme-border pt-3">
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="flex min-h-11 items-center gap-2 rounded-md px-3 py-2 text-sm text-content-muted hover:bg-theme-elevated"
            >
              Profil
            </Link>
          </div>
        </div>
      )}
    </>
  )
}

export function MobileNav() {
  const location = useLocation()

  return (
    <nav
      aria-label="Raccourcis mobiles"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-theme-border bg-theme-base pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      {mobileNavigation.map((item) => {
        const isActive = isCurrentPath(location.pathname, item.href)
        return (
          <Link
            key={item.href}
            to={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={`relative flex min-h-16 min-w-0 flex-col items-center justify-center gap-1 px-1 py-2 text-xs font-semibold ${
              isActive ? 'text-[var(--brand-violet-hover)]' : 'text-content-subtle'
            }`}
          >
            {isActive && (
              <span className="absolute inset-x-3 top-0 h-0.5 bg-[var(--brand-violet)]" />
            )}
            <item.icon size={19} strokeWidth={1.9} aria-hidden="true" />
            <span className="max-w-full truncate">{item.name}</span>
          </Link>
        )
      })}
    </nav>
  )
}
