import { Outlet } from 'react-router'
import { Toaster } from 'sonner'
import { MobileHeader, MobileNav, Sidebar } from './Sidebar'

export function DesktopLayout() {
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
