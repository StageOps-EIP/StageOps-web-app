import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { Menu, X } from 'lucide-react'
import { StageOpsLogo } from '@/components/brand/StageOpsLogo'
import { useAuth } from '@/contexts/auth.context'
import { useTheme } from '@/lib/use-theme'

const navigation = [
  { name: 'Vue générale', mobileName: 'Accueil', href: '/' },
  { name: 'Plateau 3D', mobileName: 'Plateau', href: '/stage' },
  { name: 'Parc matériel', mobileName: 'Matériel', href: '/equipment' },
  { name: 'Conducteur', mobileName: 'Planning', href: '/events' },
  { name: 'Incidents', mobileName: 'Incidents', href: '/incidents' },
  { name: 'Équipe', mobileName: 'Équipe', href: '/team' },
  { name: 'Paramètres', mobileName: 'Réglages', href: '/settings' },
]

const mobileNavigation = navigation.slice(0, 5)

function isCurrentPath(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href)
}

function NavigationLinks({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation()

  return (
    <nav aria-label="Navigation principale" className="space-y-px">
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
  const { theme, toggle } = useTheme()
  const { user } = useAuth()

  return (
    <aside
      aria-label="Navigation principale"
      className="hidden h-dvh w-[13.75rem] shrink-0 flex-col bg-theme-deeper lg:flex"
    >
      <div className="px-5 pb-7 pt-5">
        <StageOpsLogo />
        <div className="stage-production-context mt-9">
          <p className="text-[10px] font-semibold text-[var(--brand-violet-hover)]">À l’affiche</p>
          <p className="mt-2 font-editorial text-[1.7rem] leading-none text-content-primary">
            Hamlet
          </p>
          <p className="mt-2 text-[11px] leading-4 text-content-muted">
            Représentation
            <br />
            Théâtre National · Grande Salle
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-3">
        <NavigationLinks />
      </div>

      <div className="px-5 pb-5 pt-3">
        <button
          onClick={toggle}
          className="mb-4 text-left text-[11px] text-content-subtle transition-colors hover:text-content-primary"
        >
          {theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
        </button>
        <Link
          to="/profile"
          className="group flex items-center gap-3 border-t border-theme-border/70 pt-4"
        >
          <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--brand-soft)] text-[10px] font-semibold text-[var(--brand-violet-hover)]">
            SO
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-content-primary">
              {user?.email ?? 'Mode démonstration'}
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
  const { toggle } = useTheme()

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-theme-border bg-theme-deeper px-4 lg:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <StageOpsLogo compact />
          <div className="hidden min-w-0 border-l border-theme-border pl-3 sm:block">
            <p className="truncate text-[11px] font-semibold text-content-primary">Hamlet</p>
            <p className="truncate text-[10px] text-content-subtle">Grande Salle</p>
          </div>
        </div>
        <button
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          className="grid h-9 w-9 place-items-center border border-theme-border text-content-muted"
        >
          {open ? <X size={19} /> : <Menu size={19} />}
        </button>
      </header>
      {open && (
        <div className="absolute inset-x-0 top-16 z-50 border-b border-theme-border bg-theme-deeper p-4 shadow-xl lg:hidden">
          <NavigationLinks onNavigate={() => setOpen(false)} />
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-theme-border pt-3">
            <button
              onClick={toggle}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-content-muted hover:bg-theme-elevated"
            >
              Apparence
            </button>
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-content-muted hover:bg-theme-elevated"
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
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-theme-border bg-theme-deeper lg:hidden"
    >
      {mobileNavigation.map((item) => {
        const isActive = isCurrentPath(location.pathname, item.href)
        return (
          <Link
            key={item.href}
            to={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={`relative flex min-w-0 items-center justify-center px-1 py-3 text-[10px] font-medium ${
              isActive ? 'text-[var(--brand-violet-hover)]' : 'text-content-subtle'
            }`}
          >
            {isActive && (
              <span className="absolute inset-x-3 top-0 h-0.5 bg-[var(--brand-violet)]" />
            )}
            <span className="max-w-full truncate">{item.mobileName}</span>
          </Link>
        )
      })}
    </nav>
  )
}
