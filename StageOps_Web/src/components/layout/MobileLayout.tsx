import { Outlet, useLocation } from 'react-router';
import { MobileNav } from './MobileNav';

export function MobileLayout() {
  const location = useLocation();
  const hideNav = location.pathname.includes('/incidents/new');
  
  return (
    <div className="min-h-screen bg-theme-void">
      <Outlet />
      {!hideNav && <MobileNav />}
    </div>
  );
}
