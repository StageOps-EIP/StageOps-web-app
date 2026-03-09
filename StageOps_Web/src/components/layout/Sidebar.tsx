import { Link, useLocation } from 'react-router';
import { 
  LayoutDashboard, 
  Box, 
  Calendar, 
  AlertCircle, 
  Users, 
  Settings,
  Layers,
  UserCircle,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from '@/lib/use-theme';

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
  const { theme, toggle } = useTheme();
  
  return (
    <aside aria-label="Navigation principale" className="w-64 h-screen bg-theme-base border-r border-theme-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-theme-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center">
            <Layers size={24} className="text-black" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-content-primary">StageOps</h1>
            <p className="text-xs text-content-subtle">Régie Technique</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav aria-label="Navigation principale" className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-cyan-400/10 text-cyan-400 shadow-lg shadow-cyan-400/5'
                  : 'text-content-muted hover:text-content-primary hover:bg-theme-elevated'
              }`}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-theme-border space-y-2">
        <button
          onClick={toggle}
          aria-label={theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'}
          className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-sm font-medium transition-all duration-200 text-content-muted hover:text-content-primary hover:bg-theme-elevated"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
        </button>
        <Link
          to="/profile"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
            location.pathname === '/profile'
              ? 'bg-cyan-400/10 text-cyan-400'
              : 'text-content-muted hover:text-content-primary hover:bg-theme-elevated'
          }`}
        >
          <UserCircle size={20} />
          <span>Jean Moreau</span>
        </Link>
        <div className="flex items-center gap-2 px-4 py-2 bg-theme-elevated rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-content-muted">Synchronisé il y a 5s</span>
        </div>
      </div>
    </aside>
  );
}
