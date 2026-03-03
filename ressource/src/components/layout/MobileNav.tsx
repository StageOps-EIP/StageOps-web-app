import { Link, useLocation } from 'react-router';
import { 
  LayoutDashboard, 
  Layers, 
  Box, 
  AlertCircle,
  QrCode
} from 'lucide-react';

const mobileNavigation = [
  { name: 'Accueil', href: '/mobile', icon: LayoutDashboard },
  { name: 'Scène', href: '/mobile/stage', icon: Layers },
  { name: 'Scanner', href: '/mobile/scan', icon: QrCode },
  { name: 'Équipement', href: '/mobile/equipment', icon: Box },
  { name: 'Incidents', href: '/mobile/incidents', icon: AlertCircle },
];

export function MobileNav() {
  const location = useLocation();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#131316] border-t border-[#27272e] safe-area-bottom z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {mobileNavigation.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 min-w-[64px] ${
                isActive
                  ? 'text-cyan-400'
                  : 'text-[#71717a]'
              }`}
            >
              <Icon size={24} />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
