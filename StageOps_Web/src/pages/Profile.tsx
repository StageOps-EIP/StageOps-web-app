import { useState } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useNavigate } from 'react-router';
import { Button } from '@/components/design-system/Button';
import { useAuth } from '@/contexts/AuthContext';
import {
  Mail,
  Shield,
  Calendar,
  LogOut,
  Bell,
  Key,
  ChevronRight,
} from 'lucide-react';

const ROLE_LABELS: Record<string, string> = {
  rg: 'Régisseur Général',
  lumiere: 'Régisseur Lumière',
  son: 'Régisseur Son',
  plateau: 'Régisseur Plateau',
};

const ROLE_COLOR = '#22c55e';

export function Profile() {
  usePageTitle('Profil');
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isEditing] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const roleLabel = user ? (ROLE_LABELS[user.role] ?? user.role) : '';
  const initials = user?.email.slice(0, 2).toUpperCase() ?? '??';

  return (
    <div className="p-8 space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-content-primary mb-2">Mon profil</h1>
        <p className="text-content-muted">Gérez vos informations personnelles et préférences</p>
      </div>

      <div className="grid grid-cols-[1fr_360px] gap-6">
        {/* Left column */}
        <div className="space-y-6">

          {/* Identity card */}
          <div className="bg-theme-base border border-theme-border rounded-2xl p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold"
                  style={{ backgroundColor: `${ROLE_COLOR}20`, color: ROLE_COLOR }}
                >
                  {initials}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-content-primary">{user?.email ?? '—'}</h2>
                  <p className="text-sm mt-0.5" style={{ color: ROLE_COLOR }}>
                    {roleLabel}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact fields */}
            <div className="space-y-3">
              <p className="text-xs text-content-subtle uppercase tracking-wider">Contact</p>
              <div className="p-4 bg-theme-elevated rounded-xl">
                <div className="flex items-center gap-1.5 mb-2">
                  <Mail size={12} className="text-content-subtle" />
                  <p className="text-[10px] text-content-subtle uppercase tracking-wider">Email</p>
                </div>
                <p className="text-sm text-content-primary">{user?.email ?? '—'}</p>
              </div>
            </div>
          </div>

          {/* Role */}
          <div className="bg-theme-base border border-theme-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-content-subtle" />
              <p className="text-xs text-content-subtle uppercase tracking-wider">Rôle</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-400/10 text-cyan-400 border border-cyan-400/20">
                {roleLabel || '—'}
              </span>
            </div>
            <p className="text-xs text-content-subtle">
              Les rôles sont gérés par l'administrateur du système.
            </p>
          </div>

          {/* Assigned events */}
          <div className="bg-theme-base border border-theme-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-content-subtle" />
              <p className="text-xs text-content-subtle uppercase tracking-wider">
                Événements assignés
              </p>
            </div>
            <p className="text-sm text-content-subtle">Aucun événement assigné.</p>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Security */}
          <div className="bg-theme-base border border-theme-border rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Key size={14} className="text-content-subtle" />
              <p className="text-xs text-content-subtle uppercase tracking-wider">Sécurité</p>
            </div>
            <button className="w-full flex items-center justify-between p-3 bg-theme-elevated rounded-xl hover:bg-theme-border transition-colors group">
              <div>
                <p className="text-sm text-content-primary text-left">Changer le mot de passe</p>
                <p className="text-xs text-content-subtle">Dernière modification : il y a 30 jours</p>
              </div>
              <ChevronRight size={14} className="text-content-subtle group-hover:text-content-primary transition-colors" />
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-theme-elevated rounded-xl hover:bg-theme-border transition-colors group">
              <div>
                <p className="text-sm text-content-primary text-left">Authentification à deux facteurs</p>
                <p className="text-xs text-content-subtle">Non activée</p>
              </div>
              <ChevronRight size={14} className="text-content-subtle group-hover:text-content-primary transition-colors" />
            </button>
          </div>

          {/* Notifications */}
          <div className="bg-theme-base border border-theme-border rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Bell size={14} className="text-content-subtle" />
              <p className="text-xs text-content-subtle uppercase tracking-wider">Notifications</p>
            </div>
            {[
              { label: 'Nouveaux incidents', sub: 'Alertes en temps réel', on: true },
              { label: 'Rappels d\'événements', sub: '1h avant chaque représentation', on: true },
              { label: 'Mises à jour équipements', sub: 'Changements de statut', on: false },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 bg-theme-elevated rounded-xl">
                <div>
                  <p className="text-sm text-content-primary">{item.label}</p>
                  <p className="text-xs text-content-subtle">{item.sub}</p>
                </div>
                <div
                  className={`w-10 h-5 rounded-full relative transition-colors ${
                    item.on ? 'bg-cyan-400' : 'bg-[#27272e]'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      item.on ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Logout */}
          <Button
            variant="danger"
            fullWidth
            onClick={handleLogout}
          >
            <LogOut size={16} />
            Se déconnecter
          </Button>
        </div>
      </div>
    </div>
  );
}
