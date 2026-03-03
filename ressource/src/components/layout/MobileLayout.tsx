import { Outlet, useLocation } from 'react-router';
import { MobileNav } from './MobileNav';

export function MobileLayout() {
  const location = useLocation();
  const hideNav = location.pathname.includes('/incidents/new');
  
  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <Outlet />
      {!hideNav && <MobileNav />}
    </div>
  );
}
