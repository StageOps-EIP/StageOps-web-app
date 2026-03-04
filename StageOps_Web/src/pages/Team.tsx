import { useState } from 'react';
import { Card, CardHeader } from '../components/design-system/Card';
import { Button } from '../components/design-system/Button';
import { mockTeamMembers } from '../lib/mockData';
import { getCategoryLabel } from '../lib/utils';
import type { TeamMember } from '../lib/types';
import { EditMemberModal } from '../components/EditMemberModal';
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
  UserCircle,
} from 'lucide-react';

const roleColors: Record<string, string> = {
  'Régisseur Son': '#3b82f6',
  'Régisseur Lumière': '#f59e0b',
  'Régisseur Vidéo': '#a855f7',
  'Régisseur Plateau': '#22c55e',
  'Responsable Sécurité': '#ef4444',
};

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

export function Team() {
  const [teamList, setTeamList] = useState<TeamMember[]>(mockTeamMembers);
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  const filtered = search
    ? teamList.filter(
        (m) =>
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          m.role.toLowerCase().includes(search.toLowerCase())
      )
    : teamList;

  // Group by role
  const roles = [...new Set(teamList.map((m) => m.role))];

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-[#f5f5f7] mb-2">Équipe & Rôles</h1>
          <p className="text-[#a1a1aa]">
            {teamList.length} membres · {roles.length} rôles
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowNewForm(true)}>
          <Plus size={16} />
          Ajouter un membre
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717a]" />
        <input
          type="text"
          placeholder="Rechercher un membre ou un rôle..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#131316] border border-[#27272e] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#f5f5f7] placeholder:text-[#71717a] focus:outline-none focus:border-cyan-400/50"
        />
      </div>

      <div className="grid grid-cols-[1fr_400px] gap-6">
        {/* Team grid */}
        <div className="space-y-6">
          {/* role summary */}
          <div className="flex gap-3 flex-wrap">
            {roles.map((role) => {
              const count = teamList.filter((m) => m.role === role).length;
              const color = roleColors[role] || '#71717a';
              return (
                <div
                  key={role}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border"
                  style={{
                    backgroundColor: `${color}08`,
                    borderColor: `${color}25`,
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm text-[#f5f5f7]">{role}</span>
                  <span className="text-xs text-[#71717a]">({count})</span>
                </div>
              );
            })}
          </div>

          {/* Members list */}
          <Card>
            <CardHeader
              title="Membres de l'équipe"
              subtitle={`${filtered.length} membre${filtered.length > 1 ? 's' : ''}`}
            />
            <div className="space-y-2">
              {filtered.map((member) => {
                const color = roleColors[member.role] || '#71717a';
                const isSelected = selectedMember?.id === member.id;

                return (
                  <button
                    key={member.id}
                    onClick={() => setSelectedMember(member)}
                    className={`w-full text-left flex items-center gap-4 p-4 rounded-xl transition-all ${
                      isSelected
                        ? 'bg-cyan-400/10 border border-cyan-400/20'
                        : 'hover:bg-[#1c1c21] border border-transparent'
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      <span className="text-lg" style={{ color }}>
                        {member.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#f5f5f7]">{member.name}</p>
                      <p className="text-xs text-[#71717a]">{member.role}</p>
                    </div>

                    {/* Permissions badges */}
                    <div className="flex gap-1 shrink-0">
                      {member.permissions.includes('admin') && (
                        <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-500 rounded text-[10px]">
                          Admin
                        </span>
                      )}
                    </div>

                    <ChevronRight size={14} className="text-[#71717a] shrink-0" />
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <div className="flex flex-col items-center py-12 text-[#71717a]">
                  <Users size={32} className="mb-3 opacity-30" />
                  <p className="text-sm">Aucun membre trouvé</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Detail panel */}
        <div>
          {selectedMember ? (
            <MemberDetail
              member={selectedMember}
              onClose={() => setSelectedMember(null)}
              onEdit={() => setEditingMember(selectedMember)}
            />
          ) : (
            <Card className="flex flex-col items-center justify-center py-16">
              <UserCircle size={48} className="text-[#27272e] mb-4" />
              <p className="text-sm text-[#71717a]">
                Sélectionnez un membre pour voir ses détails
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* New member modal */}
      {showNewForm && <NewMemberModal onClose={() => setShowNewForm(false)} />}

      {/* Edit member modal */}
      {editingMember && (
        <EditMemberModal
          member={editingMember}
          onClose={() => setEditingMember(null)}
          onSave={(updated) => {
            setTeamList((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
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
}: {
  member: TeamMember;
  onClose: () => void;
  onEdit: () => void;
}) {
  const color = roleColors[member.role] || '#71717a';

  return (
    <Card className="sticky top-8">
      <div className="space-y-5">
        {/* Avatar + name */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: `${color}20` }}
            >
              <span className="text-2xl" style={{ color }}>
                {member.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </span>
            </div>
            <div>
              <h3 className="text-lg text-[#f5f5f7]">{member.name}</h3>
              <p className="text-sm" style={{ color }}>
                {member.role}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#27272e] text-[#71717a] hover:text-[#f5f5f7] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Contact */}
        <div className="space-y-2">
          <p className="text-xs text-[#71717a] uppercase tracking-wider">Contact</p>
          <div className="flex items-center gap-2 p-3 bg-[#1c1c21] rounded-xl">
            <Mail size={14} className="text-[#a1a1aa]" />
            <span className="text-sm text-[#f5f5f7]">{member.email}</span>
          </div>
          {member.phone && (
            <div className="flex items-center gap-2 p-3 bg-[#1c1c21] rounded-xl">
              <Phone size={14} className="text-[#a1a1aa]" />
              <span className="text-sm text-[#f5f5f7]">{member.phone}</span>
            </div>
          )}
        </div>

        {/* Permissions */}
        <div className="space-y-2">
          <p className="text-xs text-[#71717a] uppercase tracking-wider flex items-center gap-1">
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
                    : 'bg-[#1c1c21] text-[#a1a1aa] border border-[#27272e]'
                }`}
              >
                {permissionLabels[perm] || perm}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" className="flex-1" onClick={onEdit}>
            <Edit3 size={14} />
            Modifier
          </Button>
          <Button variant="ghost">
            <Mail size={14} />
          </Button>
          {member.phone && (
            <Button variant="ghost">
              <Phone size={14} />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

function NewMemberModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[#27272e] text-[#71717a] hover:text-[#f5f5f7] transition-colors"
        >
          <X size={16} />
        </button>
        <h2 className="text-xl text-[#f5f5f7] mb-6">Ajouter un membre</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#a1a1aa] mb-1.5">Nom complet</label>
              <input
                type="text"
                placeholder="Prénom Nom"
                className="w-full bg-[#1c1c21] border border-[#27272e] rounded-xl px-4 py-2.5 text-sm text-[#f5f5f7] placeholder:text-[#71717a] focus:outline-none focus:border-cyan-400/50"
              />
            </div>
            <div>
              <label className="block text-sm text-[#a1a1aa] mb-1.5">Rôle</label>
              <select className="w-full bg-[#1c1c21] border border-[#27272e] rounded-xl px-4 py-2.5 text-sm text-[#f5f5f7] focus:outline-none focus:border-cyan-400/50 [color-scheme:dark]">
                <option>Régisseur Son</option>
                <option>Régisseur Lumière</option>
                <option>Régisseur Vidéo</option>
                <option>Régisseur Plateau</option>
                <option>Responsable Sécurité</option>
                <option>Machiniste</option>
                <option>Cintrier</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-[#a1a1aa] mb-1.5">Email</label>
            <input
              type="email"
              placeholder="nom@theatre.fr"
              className="w-full bg-[#1c1c21] border border-[#27272e] rounded-xl px-4 py-2.5 text-sm text-[#f5f5f7] placeholder:text-[#71717a] focus:outline-none focus:border-cyan-400/50"
            />
          </div>
          <div>
            <label className="block text-sm text-[#a1a1aa] mb-1.5">Téléphone</label>
            <input
              type="tel"
              placeholder="+33 6 00 00 00 00"
              className="w-full bg-[#1c1c21] border border-[#27272e] rounded-xl px-4 py-2.5 text-sm text-[#f5f5f7] placeholder:text-[#71717a] focus:outline-none focus:border-cyan-400/50"
            />
          </div>
          <div>
            <label className="block text-sm text-[#a1a1aa] mb-1.5">Permissions</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(permissionLabels).map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1c1c21] border border-[#27272e] rounded-lg text-xs text-[#a1a1aa] cursor-pointer hover:border-cyan-400/30 transition-colors"
                >
                  <input type="checkbox" className="accent-cyan-400" />
                  {label}
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={onClose}>
              Annuler
            </Button>
            <Button variant="primary" onClick={onClose}>
              <Plus size={16} />
              Ajouter
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
