import { Link, useLocation } from 'react-router';
import { 
  LayoutDashboard, 
  Box, 
  Calendar, 
  AlertCircle, 
  Users, 
  Settings,
  Layers
} from 'lucide-react';

const navigation = [
  { name: 'Tableau de bord', href: '/', icon: LayoutDashboard },
  { name: 'Vue Scène', href: '/stage', icon: Layers },
  { name: 'Inventaire', href: '/equipment', icon: Box },
  { name: 'Événements', href: '/events', icon: Calendar },
  { name: 'Incidents', href: '/incidents', icon: AlertCircle },
  { name: 'Équipe', href: '/team', icon: Users },
  { name: 'Paramètres', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  
  return (
    <div className="w-64 h-screen bg-[#131316] border-r border-[#27272e] flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[#27272e]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center">
            <Layers size={24} className="text-black" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#f5f5f7]">StageOps</h1>
            <p className="text-xs text-[#71717a]">Régie Technique</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-cyan-400/10 text-cyan-400 shadow-lg shadow-cyan-400/5'
                  : 'text-[#a1a1aa] hover:text-[#f5f5f7] hover:bg-[#1c1c21]'
              }`}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      {/* Sync status */}
      <div className="p-4 border-t border-[#27272e]">
        <div className="flex items-center gap-2 px-4 py-2 bg-[#1c1c21] rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-[#a1a1aa]">Synchronisé il y a 5s</span>
        </div>
      </div>
    </div>
  );
}
