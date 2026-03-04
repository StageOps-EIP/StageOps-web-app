import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Button } from '../components/design-system/Button';
import { mockTeamMembers } from '../lib/mockData';
import { mockEvents } from '../lib/mockData';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Shield,
  Edit3,
  Save,
  X,
  Calendar,
  ChevronRight,
  LogOut,
  Bell,
  Key,
} from 'lucide-react';

// Simulated current user (Jean Moreau - Régisseur Plateau / admin)
const currentUser = mockTeamMembers[3];

const permissionLabels: Record<string, string> = {
  sound: 'Son',
  light: 'Lumière',
  video: 'Vidéo',
  set: 'Plateau',
  safety: 'Sécurité',
  rigging: 'Accroche',
  incidents: 'Incidents',
  equipment: 'Équipements',
  admin: 'Administration',
};

const roleColor = '#22c55e';

export function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone ?? '');
  const [email, setEmail] = useState(currentUser.email);

  const assignedEvents = mockEvents.filter((e) =>
    e.teamMembers.includes(currentUser.id)
  );

  function handleSave() {
    // In production: PATCH /api/profile
    setIsEditing(false);
  }

  return (
    <div className="p-8 space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#f5f5f7] mb-2">Mon profil</h1>
        <p className="text-[#a1a1aa]">Gérez vos informations personnelles et préférences</p>
      </div>

      <div className="grid grid-cols-[1fr_360px] gap-6">
        {/* Left column */}
        <div className="space-y-6">

          {/* Identity card */}
          <div className="bg-[#131316] border border-[#27272e] rounded-2xl p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold"
                  style={{ backgroundColor: `${roleColor}20`, color: roleColor }}
                >
                  {currentUser.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  {isEditing ? (
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-[#1c1c21] border border-[#27272e] rounded-xl px-3 py-1.5 text-lg font-semibold text-[#f5f5f7] focus:outline-none focus:border-cyan-400/50 w-full"
                    />
                  ) : (
                    <h2 className="text-xl font-semibold text-[#f5f5f7]">{name}</h2>
                  )}
                  <p className="text-sm mt-0.5" style={{ color: roleColor }}>
                    {currentUser.role}
                  </p>
                </div>
              </div>
              {isEditing ? (
                <div className="flex gap-2">
                  <Button variant="primary" size="sm" onClick={handleSave}>
                    <Save size={14} /> Sauvegarder
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                    <X size={14} />
                  </Button>
                </div>
              ) : (
                <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit3 size={14} /> Modifier
                </Button>
              )}
            </div>

            {/* Contact fields */}
            <div className="space-y-3">
              <p className="text-xs text-[#71717a] uppercase tracking-wider">Contact</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-[#1c1c21] rounded-xl">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Mail size={12} className="text-[#71717a]" />
                    <p className="text-[10px] text-[#71717a] uppercase tracking-wider">Email</p>
                  </div>
                  {isEditing ? (
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent text-sm text-[#f5f5f7] border-b border-[#27272e] focus:border-cyan-400 focus:outline-none pb-0.5 transition-colors"
                    />
                  ) : (
                    <p className="text-sm text-[#f5f5f7]">{email}</p>
                  )}
                </div>
                <div className="p-4 bg-[#1c1c21] rounded-xl">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Phone size={12} className="text-[#71717a]" />
                    <p className="text-[10px] text-[#71717a] uppercase tracking-wider">Téléphone</p>
                  </div>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="—"
                      className="w-full bg-transparent text-sm text-[#f5f5f7] placeholder-[#35353e] border-b border-[#27272e] focus:border-cyan-400 focus:outline-none pb-0.5 transition-colors"
                    />
                  ) : (
                    <p className="text-sm text-[#f5f5f7]">{phone || '—'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="bg-[#131316] border border-[#27272e] rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-[#71717a]" />
              <p className="text-xs text-[#71717a] uppercase tracking-wider">Permissions</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentUser.permissions.map((perm) => (
                <span
                  key={perm}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                    perm === 'admin'
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      : 'bg-[#1c1c21] text-[#a1a1aa] border border-[#27272e]'
                  }`}
                >
                  {permissionLabels[perm] || perm}
                </span>
              ))}
            </div>
            <p className="text-xs text-[#71717a]">
              Les permissions sont gérées par l'administrateur du système.
            </p>
          </div>

          {/* Assigned events */}
          <div className="bg-[#131316] border border-[#27272e] rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-[#71717a]" />
              <p className="text-xs text-[#71717a] uppercase tracking-wider">
                Événements assignés
              </p>
            </div>
            <div className="space-y-2">
              {assignedEvents.length === 0 && (
                <p className="text-sm text-[#71717a]">Aucun événement assigné.</p>
              )}
              {assignedEvents.map((evt) => (
                <Link
                  key={evt.id}
                  to="/stage"
                  className="flex items-center gap-4 p-4 bg-[#1c1c21] border border-[#27272e] rounded-xl hover:border-cyan-400/30 transition-colors group"
                >
                  <div className="p-2 bg-cyan-400/10 rounded-lg shrink-0">
                    <Calendar size={16} className="text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#f5f5f7] truncate">{evt.title}</p>
                    <p className="text-xs text-[#71717a]">
                      {evt.venue} · {evt.stage}
                    </p>
                  </div>
                  <ChevronRight size={14} className="text-[#71717a] group-hover:text-cyan-400 transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Security */}
          <div className="bg-[#131316] border border-[#27272e] rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Key size={14} className="text-[#71717a]" />
              <p className="text-xs text-[#71717a] uppercase tracking-wider">Sécurité</p>
            </div>
            <button className="w-full flex items-center justify-between p-3 bg-[#1c1c21] rounded-xl hover:bg-[#27272e] transition-colors group">
              <div>
                <p className="text-sm text-[#f5f5f7] text-left">Changer le mot de passe</p>
                <p className="text-xs text-[#71717a]">Dernière modification : il y a 30 jours</p>
              </div>
              <ChevronRight size={14} className="text-[#71717a] group-hover:text-[#f5f5f7] transition-colors" />
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-[#1c1c21] rounded-xl hover:bg-[#27272e] transition-colors group">
              <div>
                <p className="text-sm text-[#f5f5f7] text-left">Authentification à deux facteurs</p>
                <p className="text-xs text-[#71717a]">Non activée</p>
              </div>
              <ChevronRight size={14} className="text-[#71717a] group-hover:text-[#f5f5f7] transition-colors" />
            </button>
          </div>

          {/* Notifications */}
          <div className="bg-[#131316] border border-[#27272e] rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Bell size={14} className="text-[#71717a]" />
              <p className="text-xs text-[#71717a] uppercase tracking-wider">Notifications</p>
            </div>
            {[
              { label: 'Nouveaux incidents', sub: 'Alertes en temps réel', on: true },
              { label: 'Rappels d\'événements', sub: '1h avant chaque représentation', on: true },
              { label: 'Mises à jour équipements', sub: 'Changements de statut', on: false },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 bg-[#1c1c21] rounded-xl">
                <div>
                  <p className="text-sm text-[#f5f5f7]">{item.label}</p>
                  <p className="text-xs text-[#71717a]">{item.sub}</p>
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
            onClick={() => navigate('/login')}
          >
            <LogOut size={16} />
            Se déconnecter
          </Button>
        </div>
      </div>
    </div>
  );
}
