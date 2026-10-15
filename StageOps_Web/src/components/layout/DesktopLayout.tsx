import { Outlet, useNavigation } from 'react-router'
import { Toaster } from 'sonner'
import { MobileHeader, MobileNav, Sidebar } from './Sidebar'
import { useOperationalData } from '@/hooks/useOperationalData'

export function DesktopLayout() {
  const { persistenceIssue } = useOperationalData()
  const navigation = useNavigation()
  return (
    <div className="relative flex h-dvh overflow-hidden bg-theme-void">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileHeader />
        <main
          id="main-content"
          aria-label="Contenu principal"
          className="app-surface min-h-0 flex-1 overflow-y-auto pb-20 lg:pb-0"
        >
          {persistenceIssue && (
            <p
              role="alert"
              className="m-4 border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-300"
            >
              {persistenceIssue}
            </p>
          )}
          {navigation.state === 'loading' && (
            <p role="status" className="px-4 pt-4 text-sm text-content-muted">
              Chargement de la page…
            </p>
          )}
          <Outlet />
        </main>
      </div>
      <MobileNav />
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--bg-base)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
          },
        }}
      />
    </div>
  )
}
