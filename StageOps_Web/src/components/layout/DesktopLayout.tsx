import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';
import { Toaster } from 'sonner';

export function DesktopLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#131316',
            border: '1px solid #27272e',
            color: '#f5f5f7',
          },
        }}
      />
    </div>
  );
}