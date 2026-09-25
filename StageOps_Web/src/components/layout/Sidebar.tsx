import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import {
  AlertTriangle,
  Box,
  Boxes,
  Calendar,
  LayoutDashboard,
  Menu,
  Moon,
  Settings,
  Sun,
  UserCircle,
  Users,
  X,
} from 'lucide-react'
import { StageOpsLogo } from '@/components/brand/StageOpsLogo'
import { useAuth } from '@/contexts/auth.context'
import { useTheme } from '@/lib/use-theme'

const navigation = [
  { name: 'Vue générale', mobileName: 'Accueil', href: '/', icon: LayoutDashboard },
  { name: 'Plateau 3D', mobileName: 'Plateau', href: '/stage', icon: Boxes },
  { name: 'Parc matériel', mobileName: 'Matériel', href: '/equipment', icon: Box },
  { name: 'Conducteur', mobileName: 'Planning', href: '/events', icon: Calendar },
  { name: 'Incidents', mobileName: 'Incidents', href: '/incidents', icon: AlertTriangle },
  { name: 'Équipe', mobileName: 'Équipe', href: '/team', icon: Users },
  { name: 'Paramètres', mobileName: 'Réglages', href: '/settings', icon: Settings },
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
        const Icon = item.icon
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={onNavigate}
            aria-current={isActive ? 'page' : undefined}
            className={`group relative flex items-center gap-3 border-l-2 px-4 py-2.5 text-[13px] font-medium transition-colors ${
              isActive
                ? 'border-[var(--brand-violet)] bg-[var(--brand-soft)] text-content-primary'
                : 'border-transparent text-content-muted hover:border-theme-border-hover hover:bg-theme-elevated hover:text-content-primary'
            }`}
          >
            <Icon size={18} strokeWidth={isActive ? 2 : 1.7} aria-hidden="true" />
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
      className="hidden h-dvh w-[13.5rem] shrink-0 flex-col border-r border-theme-border bg-theme-deeper lg:flex"
    >
      <div className="border-b border-theme-border px-4 py-4">
        <StageOpsLogo />
        <div className="mt-4 border-l-2 border-[var(--brand-blue)] pl-3">
          <p className="text-[11px] text-content-subtle">Lieu de travail</p>
          <p className="mt-0.5 text-xs font-semibold text-content-primary">Théâtre National</p>
          <p className="mt-0.5 text-[11px] text-content-muted">Grande Salle</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <p className="mb-2 px-4 text-[10px] font-semibold text-content-subtle">
          Espaces de travail
        </p>
        <NavigationLinks />
      </div>

      <div className="border-t border-theme-border py-2">
        <button
          onClick={toggle}
          className="flex w-full items-center gap-3 px-4 py-2.5 text-xs text-content-muted transition-colors hover:bg-theme-elevated hover:text-content-primary"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
        </button>
        <Link
          to="/profile"
          className="flex items-center gap-3 border-t border-theme-border px-4 py-3 transition-colors hover:bg-theme-elevated"
        >
          <UserCircle size={19} className="text-content-subtle" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-content-primary">
              {user?.email ?? 'Mode démonstration'}
            </span>
            <span className="block text-xs text-content-subtle">Profil et accès</span>
          </span>
        </Link>
      </div>
    </aside>
  )
}

export function MobileHeader() {
  const [open, setOpen] = useState(false)
  const { theme, toggle } = useTheme()

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
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              Apparence
            </button>
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-content-muted hover:bg-theme-elevated"
            >
              <UserCircle size={16} /> Profil
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
        const Icon = item.icon
        const isActive = isCurrentPath(location.pathname, item.href)
        return (
          <Link
            key={item.href}
            to={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={`flex min-w-0 flex-col items-center gap-1 px-1 py-2 text-[10px] font-medium ${
              isActive ? 'text-[var(--brand-violet-hover)]' : 'text-content-subtle'
            }`}
          >
            <Icon size={17} strokeWidth={isActive ? 2 : 1.6} />
            <span className="max-w-full truncate">{item.mobileName}</span>
          </Link>
        )
      })}
    </nav>
  )
}
