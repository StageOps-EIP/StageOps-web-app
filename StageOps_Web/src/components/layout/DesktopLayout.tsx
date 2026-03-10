import { Outlet, Navigate } from 'react-router';
import { Sidebar } from './Sidebar';
import { Toaster } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export function DesktopLayout() {
  const { token, isLoading } = useAuth();

  if (isLoading) return null;
  if (!token) return <Navigate to="/login" replace />;

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