import { useState, useEffect } from 'react';
import { Button } from '@/components/design-system/Button';
import type { TeamMember } from '@/lib/types';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import {
  X,
  User,
  Mail,
  Phone,
  Briefcase,
  Shield,
  Save,
} from 'lucide-react';

const roleOptions = [
  'Régisseur Général',
  'Régisseur Son',
  'Régisseur Lumière',
  'Régisseur Vidéo',
  'Régisseur Plateau',
  'Responsable Sécurité',
  'Machiniste',
  'Cintrier',
  'Technicien',
];

const allPermissions: { key: string; label: string }[] = [
  { key: 'sound', label: 'Son' },
  { key: 'light', label: 'Lumière' },
  { key: 'video', label: 'Vidéo' },
  { key: 'set', label: 'Plateau' },
  { key: 'safety', label: 'Sécurité' },
  { key: 'rigging', label: 'Accroche' },
  { key: 'incidents', label: 'Incidents' },
  { key: 'equipment', label: 'Équipements' },
  { key: 'admin', label: 'Administration' },
];

const roleColors: Record<string, string> = {
  'Régisseur Son': '#3b82f6',
  'Régisseur Lumière': '#f59e0b',
  'Régisseur Vidéo': '#a855f7',
  'Régisseur Plateau': '#22c55e',
  'Responsable Sécurité': '#ef4444',
};

export function EditMemberModal({
  member,
  onClose,
  onSave,
}: {
  member: TeamMember;
  onClose: () => void;
  onSave: (updated: TeamMember) => void;
}) {
  const [name, setName] = useState(member.name);
  const [email, setEmail] = useState(member.email);
  const [phone, setPhone] = useState(member.phone ?? '');
  const [role, setRole] = useState(member.role);
  const [permissions, setPermissions] = useState<string[]>(member.permissions);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const trapRef = useFocusTrap(true);

  const roleColor = roleColors[role] || '#71717a';

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function togglePermission(key: string) {
    setPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  }

  function validate() {
    const e: typeof errors = {};
    if (!name.trim()) e.name = 'Le nom est requis';
    if (!email.trim()) e.email = "L'email est requis";
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = 'Email invalide';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    onSave({
      ...member,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      role,
      permissions,
    });
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-member-title"
        className="w-full max-w-lg bg-theme-base border border-theme-border rounded-2xl shadow-2xl shadow-black/50 max-h-[85vh] overflow-y-auto"
      >

        {/* Header */}
        <div className="sticky top-0 z-10 bg-theme-base flex items-center justify-between px-8 py-5 border-b border-theme-border">
          <div className="flex items-center gap-3">
            <div
              className="w-2 h-8 rounded-full transition-colors duration-300"
              style={{ backgroundColor: roleColor }}
            />
            <div>
              <h2 id="edit-member-title" className="text-lg font-semibold text-content-primary">Modifier le membre</h2>
              <p className="text-xs text-content-subtle">{member.name}</p>
            </div>
          </div>
          <button
            aria-label="Fermer"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-theme-border text-content-subtle hover:text-content-primary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-8 py-6 space-y-6">

          {/* Avatar preview */}
          <div className="flex justify-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold transition-colors duration-300"
              style={{ backgroundColor: `${roleColor}20`, color: roleColor }}
            >
              {name.split(' ').filter(Boolean).map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
            </div>
          </div>

          {/* Nom */}
          <div>
            <p className="text-xs text-content-subtle uppercase tracking-wider mb-3">Nom complet *</p>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-subtle pointer-events-none" />
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); if (errors.name) setErrors((p) => ({ ...p, name: undefined })); }}
                placeholder="Prénom Nom"
                aria-label="Nom complet"
                className={`w-full bg-theme-elevated border rounded-xl pl-9 pr-4 py-3 text-sm text-content-primary placeholder-[#35353e] focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-colors ${
                  errors.name ? 'border-red-500/60' : 'border-theme-border focus:border-cyan-400/50'
                }`}
              />
            </div>
            {errors.name && <p className="text-xs text-red-400 mt-1.5">{errors.name}</p>}
          </div>

          {/* Rôle */}
          <div>
            <p className="text-xs text-content-subtle uppercase tracking-wider mb-3">Rôle</p>
            <div className="relative">
              <Briefcase size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-subtle pointer-events-none" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                aria-label="Rôle"
                className="w-full bg-theme-elevated border border-theme-border rounded-xl pl-9 pr-4 py-3 text-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-colors [color-scheme:dark]"
              >
                {roleOptions.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs text-content-subtle uppercase tracking-wider mb-3">Contact</p>
            <div className="space-y-3">
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-subtle pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: undefined })); }}
                  placeholder="email@theatre.fr"
                  aria-label="Email"
                  className={`w-full bg-theme-elevated border rounded-xl pl-9 pr-4 py-3 text-sm text-content-primary placeholder-[#35353e] focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-colors ${
                    errors.email ? 'border-red-500/60' : 'border-theme-border focus:border-cyan-400/50'
                  }`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-400 -mt-1">{errors.email}</p>}
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-subtle pointer-events-none" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+33 6 00 00 00 00"
                  aria-label="Téléphone"
                  className="w-full bg-theme-elevated border border-theme-border rounded-xl pl-9 pr-4 py-3 text-sm text-content-primary placeholder-[#35353e] focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield size={14} className="text-content-subtle" />
              <p className="text-xs text-content-subtle uppercase tracking-wider">Permissions</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {allPermissions.map(({ key, label }) => {
                const active = permissions.includes(key);
                return (
                  <button
                    key={key}
                    onClick={() => togglePermission(key)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200"
                    style={
                      active
                        ? key === 'admin'
                          ? { backgroundColor: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.4)', color: '#f59e0b' }
                          : { backgroundColor: 'rgba(0,255,255,0.08)', borderColor: 'rgba(0,255,255,0.4)', color: '#00ffff' }
                        : { backgroundColor: 'transparent', borderColor: '#27272e', color: '#71717a' }
                    }
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: active ? (key === 'admin' ? '#f59e0b' : '#00ffff') : '#71717a' }}
                    />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-theme-border">
            <Button variant="primary" className="flex-1" onClick={handleSave}>
              <Save size={16} />
              Enregistrer
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Annuler
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
