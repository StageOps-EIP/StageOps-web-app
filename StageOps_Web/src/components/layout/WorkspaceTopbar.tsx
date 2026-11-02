import { Link, useLocation } from 'react-router'

const routeNames: Record<string, string> = {
  '/': 'Vue générale',
  '/events': 'Conducteur',
  '/incidents': 'Incidents',
  '/equipment': 'Parc matériel',
  '/stage': 'Plateau 3D',
  '/team': 'Équipe',
  '/settings': 'Paramètres',
  '/profile': 'Profil',
}

export function WorkspaceTopbar() {
  const { pathname } = useLocation()
  const currentPage = routeNames[pathname] ?? 'Espace de régie'

  return (
    <header className="hidden h-[4.5rem] shrink-0 items-center justify-between gap-5 border-b border-theme-border bg-theme-base px-8 lg:flex">
      <p className="min-w-0 truncate text-sm font-semibold text-content-muted">
        Théâtre National <span className="mx-2 text-content-subtle">/</span>
        <span className="text-content-primary">{currentPage}</span>
      </p>
      <div className="flex shrink-0 items-center gap-3">
        <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
          Données locales
        </span>
        {pathname !== '/incidents' && (
          <Link
            to="/incidents?new=1"
            className="inline-flex min-h-10 items-center rounded-lg bg-[var(--brand-violet)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-violet-hover)]"
          >
            + Signaler un incident
          </Link>
        )}
      </div>
    </header>
  )
}
