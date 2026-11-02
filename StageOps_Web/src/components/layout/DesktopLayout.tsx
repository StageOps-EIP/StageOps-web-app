import { Outlet, useNavigation } from 'react-router'
import { Toaster } from 'sonner'
import { MobileHeader, MobileNav, Sidebar } from './Sidebar'
import { WorkspaceTopbar } from './WorkspaceTopbar'
import { useOperationalData } from '@/hooks/useOperationalData'

export function DesktopLayout() {
  const { persistenceIssue } = useOperationalData()
  const navigation = useNavigation()
  return (
    <div className="relative flex h-dvh overflow-hidden bg-theme-void">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileHeader />
        <WorkspaceTopbar />
        <main
          id="main-content"
          aria-label="Contenu principal"
          className="app-surface min-h-0 flex-1 overflow-y-auto pb-20 lg:pb-0"
        >
          {persistenceIssue && (
            <p
              role="alert"
              className="m-4 rounded-lg border border-amber-700/30 bg-amber-50 p-3 text-sm text-amber-900"
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
        theme="light"
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
