import { Outlet } from 'react-router'
import { Toaster } from 'sonner'
import { CalendarDays, MapPin } from 'lucide-react'
import { MobileHeader, MobileNav, Sidebar } from './Sidebar'

export function DesktopLayout() {
  return (
    <div className="relative flex h-dvh overflow-hidden bg-theme-void">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileHeader />
        <div className="workspace-context-bar hidden lg:flex">
          <div className="flex min-w-0 items-center gap-3">
            <span className="workspace-context-label">Production active</span>
            <strong className="truncate">Hamlet — Représentation</strong>
          </div>
          <div className="ml-auto flex items-center gap-5 text-content-subtle">
            <span className="flex items-center gap-1.5">
              <MapPin size={13} aria-hidden="true" /> Grande Salle
            </span>
            <span className="flex items-center gap-1.5 border-l border-theme-border pl-5">
              <CalendarDays size={13} aria-hidden="true" /> Démonstration · 11 fév. 2026
            </span>
          </div>
        </div>
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
