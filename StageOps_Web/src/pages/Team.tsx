import { useEffect, useState } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Card, CardHeader } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';

import type { TeamMember } from '@/lib/types';
import { ROLE_COLORS, PERMISSION_LABELS } from '@/lib/constants';
import { useTeamFilter } from '@/hooks/useTeamFilter';
import { useRole } from '@/hooks/useRole';
import { EditMemberModal } from '@/components/team/EditMemberModal';
import { getTeamMembers, updateTeamMember, createTeamMember } from '@/services/team.service';
import {
  Users,
  Mail,
  Phone,
  Shield,
  Plus,
  Search,
  X,
  Edit3,
  ChevronRight,
  ChevronDown,
  UserCircle,
} from 'lucide-react';

export function Team() {
  usePageTitle('Équipe');
  const { canManageTeam } = useRole();
  const [teamList, setTeamList] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  const { search, setSearch, filtered } = useTeamFilter(teamList);
  
  useEffect(() => {
    void loadTeamMembers();
  }, []);

  async function loadTeamMembers() {
    const items = await getTeamMembers();
    setTeamList(items);
  }

  const roles = [...new Set(teamList.map((m) => m.role))];

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-content-primary mb-2">Équipe & Rôles</h1>
          <p className="text-content-muted">
            {teamList.length} membres · {roles.length} rôles
          </p>
        </div>
        {canManageTeam && (
          <Button variant="primary" onClick={() => setShowNewForm(true)}>
            <Plus size={16} />
            Ajouter un membre
          </Button>
        )}
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-subtle" />
        <input
          type="text"
          placeholder="Rechercher un membre ou un rôle..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Rechercher un membre ou un rôle"
          className="w-full bg-theme-base border border-theme-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-content-primary placeholder:text-content-subtle focus:outline-none focus:border-cyan-400/50"
        />
      </div>

      <div className="grid grid-cols-[1fr_400px] gap-6">
        <div className="space-y-6">
          <div className="flex gap-3 flex-wrap">
            {roles.map((role) => {
              const count = teamList.filter((m) => m.role === role).length;
              const color = ROLE_COLORS[role] || '#71717a';
              return (
                <div
                  key={role}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border"
                  style={{
                    backgroundColor: `${color}08`,
                    borderColor: `${color}25`,
                  }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-sm text-content-primary">{role}</span>
                  <span className="text-xs text-content-subtle">({count})</span>
                </div>
              );
            })}
          </div>

          <Card>
            <CardHeader title="Membres de l'équipe" subtitle={`${filtered.length} membre${filtered.length > 1 ? 's' : ''}`} />
            <div className="space-y-2">
              {filtered.map((member) => {
                const color = ROLE_COLORS[member.role] || '#71717a';
                const isSelected = selectedMember?.id === member.id;

                return (
                  <button
                    key={member.id}
                    onClick={() => setSelectedMember(member)}
                    className={`w-full text-left flex items-center gap-4 p-4 rounded-xl transition-all ${
                      isSelected
                        ? 'bg-cyan-400/10 border border-cyan-400/20'
                        : 'hover:bg-theme-elevated border border-transparent'
                    }`}
                  >
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}20` }}>
                      <span className="text-lg" style={{ color }}>
                        {member.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-content-primary">{member.name}</p>
                      <p className="text-xs text-content-subtle">{member.role}</p>
                    </div>

                    <div className="flex gap-1 shrink-0">
                      {member.permissions.includes('admin') && (
                        <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-500 rounded text-[10px]">Admin</span>
                      )}
                    </div>

                    <ChevronRight size={14} className="text-content-subtle shrink-0" />
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <div className="flex flex-col items-center py-12 text-content-subtle">
                  <Users size={32} className="mb-3 opacity-30" />
                  <p className="text-sm">Aucun membre trouvé</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div>
          {selectedMember ? (
            <MemberDetail
              member={selectedMember}
              onClose={() => setSelectedMember(null)}
              onEdit={() => setEditingMember(selectedMember)}
              canEdit={canManageTeam}
            />
          ) : (
            <Card className="flex flex-col items-center justify-center py-16">
              <UserCircle size={48} className="text-[#27272e] mb-4" />
              <p className="text-sm text-content-subtle">Sélectionnez un membre pour voir ses détails</p>
            </Card>
          )}
        </div>
      </div>

      {showNewForm && canManageTeam && (
        <NewMemberModal
          onClose={() => setShowNewForm(false)}
          onAdd={(m) => { setTeamList((prev) => [...prev, m]); setShowNewForm(false); }}
        />
      )}

      {editingMember && canManageTeam && (
        <EditMemberModal
          member={editingMember}
          onClose={() => setEditingMember(null)}
          onSave={async (updated) => {
            await updateTeamMember(updated.id, updated);
            await loadTeamMembers();
            setSelectedMember(updated);
            setEditingMember(null);
          }}
        />
      )}
    </div>
  );
}

function MemberDetail({
  member,
  onClose,
  onEdit,
  canEdit,
}: {
  member: TeamMember;
  onClose: () => void;
  onEdit: () => void;
  canEdit: boolean;
}) {
  const color = ROLE_COLORS[member.role] || '#71717a';

  return (
    <Card className="sticky top-8">
      <div className="space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
              <span className="text-2xl" style={{ color }}>
                {member.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </span>
            </div>
            <div>
              <h3 className="text-lg text-content-primary">{member.name}</h3>
              <p className="text-sm" style={{ color }}>
                {member.role}
              </p>
            </div>
          </div>
          <button
            aria-label="Fermer le détail"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-theme-border text-content-subtle hover:text-content-primary transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-content-subtle uppercase tracking-wider">Contact</p>
          <div className="flex items-center gap-2 p-3 bg-theme-elevated rounded-xl">
            <Mail size={14} className="text-content-muted" />
            <span className="text-sm text-content-primary">{member.email}</span>
          </div>
          {member.phone && (
            <div className="flex items-center gap-2 p-3 bg-theme-elevated rounded-xl">
              <Phone size={14} className="text-content-muted" />
              <span className="text-sm text-content-primary">{member.phone}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-xs text-content-subtle uppercase tracking-wider flex items-center gap-1">
            <Shield size={12} />
            Permissions
          </p>
          <div className="flex flex-wrap gap-2">
            {member.permissions.map((perm) => (
              <span
                key={perm}
                className={`px-2.5 py-1 rounded-lg text-xs ${
                  perm === 'admin'
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    : 'bg-theme-elevated text-content-muted border border-theme-border'
                }`}
              >
                {PERMISSION_LABELS[perm] || perm}
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          {canEdit && (
            <Button variant="secondary" className="flex-1" onClick={onEdit}>
              <Edit3 size={14} />
              Modifier
            </Button>
          )}
          <Button variant="ghost" aria-label="Envoyer un email">
            <Mail size={14} />
          </Button>
          {member.phone && (
            <Button variant="ghost" aria-label="Appeler">
              <Phone size={14} />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

function NewMemberModal({ onClose, onAdd }: { onClose: () => void; onAdd: (m: TeamMember) => void }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Régisseur Son');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  function togglePermission(key: string) {
    setPermissions((prev) => prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]);
  }

  async function handleSubmit() {
    if (!name.trim() || !email.trim()) { setError('Nom et email requis.'); return; }
    setError(null);
    try {
      const m = await createTeamMember({ name: name.trim(), role, email: email.trim(), phone: phone.trim(), permissions });
      onAdd(m);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la création.');
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="new-member-title" className="w-full max-w-lg">
        <Card className="relative">
          <button
            aria-label="Fermer"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-theme-border text-content-subtle hover:text-content-primary transition-colors"
          >
            <X size={16} />
          </button>
          <h2 id="new-member-title" className="text-xl text-content-primary mb-6">
            Ajouter un membre
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="new-member-name" className="block text-sm text-content-muted mb-1.5">
                  Nom complet
                </label>
                <input
                  id="new-member-name"
                  type="text"
                  placeholder="Prénom Nom"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-theme-elevated border border-theme-border rounded-xl px-4 py-2.5 text-sm text-content-primary placeholder:text-content-subtle focus:outline-none focus:border-cyan-400/50"
                />
              </div>
              <div>
                <label htmlFor="new-member-role" className="block text-sm text-content-muted mb-1.5">
                  Rôle
                </label>
                <div className="relative">
                  <select
                    id="new-member-role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-2.5 bg-theme-elevated border border-theme-border rounded-xl text-content-primary text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent cursor-pointer hover:border-[#52525b] transition-colors appearance-none pr-9 [color-scheme:dark]"
                  >
                    <option>Régisseur Son</option>
                    <option>Régisseur Lumière</option>
                    <option>Régisseur Vidéo</option>
                    <option>Régisseur Plateau</option>
                    <option>Responsable Sécurité</option>
                    <option>Machiniste</option>
                    <option>Cintrier</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-content-subtle pointer-events-none" />
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="new-member-email" className="block text-sm text-content-muted mb-1.5">
                Email
              </label>
              <input
                id="new-member-email"
                type="email"
                placeholder="nom@theatre.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-theme-elevated border border-theme-border rounded-xl px-4 py-2.5 text-sm text-content-primary placeholder:text-content-subtle focus:outline-none focus:border-cyan-400/50"
              />
            </div>
            <div>
              <label htmlFor="new-member-phone" className="block text-sm text-content-muted mb-1.5">
                Téléphone
              </label>
              <input
                id="new-member-phone"
                type="tel"
                placeholder="+33 6 00 00 00 00"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-theme-elevated border border-theme-border rounded-xl px-4 py-2.5 text-sm text-content-primary placeholder:text-content-subtle focus:outline-none focus:border-cyan-400/50"
              />
            </div>
            <div>
              <label className="block text-sm text-content-muted mb-1.5">Permissions</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-theme-elevated border border-theme-border rounded-lg text-xs text-content-muted cursor-pointer hover:border-cyan-400/30 transition-colors"
                  >
                    <input type="checkbox" className="accent-cyan-400" checked={permissions.includes(key)} onChange={() => togglePermission(key)} />
                    {label}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              {error && <p className="text-red-400 text-sm self-center mr-auto">{error}</p>}
              <Button variant="secondary" onClick={onClose}>
                Annuler
              </Button>
              <Button variant="primary" onClick={() => void handleSubmit()}>
                <Plus size={16} />
                Ajouter
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
