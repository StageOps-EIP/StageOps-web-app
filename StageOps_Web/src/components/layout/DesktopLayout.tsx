import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';
import { Toaster } from 'sonner';

export function DesktopLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main id="main-content" aria-label="Contenu principal" className="flex-1 overflow-y-auto h-full">
        <Outlet />
      </main>
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
  );
}