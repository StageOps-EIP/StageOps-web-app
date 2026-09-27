import { useEffect, useState } from 'react'
import { usePageTitle } from '@/hooks/usePageTitle'
import { Card, CardHeader } from '@/components/design-system/Card'
import { Button } from '@/components/design-system/Button'
import { DemoNotice, PageHeader } from '@/components/design-system/PageHeader'
import { mockTeamMembers } from '@/lib/mockData'

import type { TeamMember } from '@/lib/types'
import { ROLE_COLORS, PERMISSION_LABELS } from '@/lib/constants'
import { useTeamFilter } from '@/hooks/useTeamFilter'
import { EditMemberModal } from '@/components/team/EditMemberModal'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { Mail, Phone, Search, X, ChevronDown } from 'lucide-react'

export function Team() {
  usePageTitle('Équipe')
  const [teamList, setTeamList] = useState<TeamMember[]>(mockTeamMembers)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(mockTeamMembers[0])
  const [showNewForm, setShowNewForm] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)

  const { search, setSearch, filtered } = useTeamFilter(teamList)

  // Group by role
  const roles = [...new Set(teamList.map((m) => m.role))]

  return (
    <div className="page-shell space-y-5">
      <PageHeader
        context="Théâtre National"
        title="Équipe et droits"
        description={`${teamList.length} membres · ${roles.length} rôles`}
        actions={
          <Button variant="primary" onClick={() => setShowNewForm(true)}>
            Ajouter un membre
          </Button>
        }
      />
      <DemoNotice />

      <div className="toolbar">
        <div className="relative min-w-[16rem] max-w-xl flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-content-subtle"
          />
          <input
            type="text"
            placeholder="Rechercher un membre ou un rôle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Rechercher un membre ou un rôle"
            className="form-control w-full py-2 pl-10 pr-4 text-sm placeholder:text-content-subtle"
          />
        </div>
        <span className="text-xs text-content-subtle">
          {filtered.length} membre{filtered.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px] 2xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* Team grid */}
        <div className="space-y-6">
          {/* Members list */}
          <Card>
            <CardHeader
              title="Membres de l'équipe"
              subtitle={`${filtered.length} membre${filtered.length > 1 ? 's' : ''}`}
            />
            <div className="-mx-4 -mb-4 sm:-mx-5 sm:-mb-5">
              {filtered.map((member) => {
                const color = ROLE_COLORS[member.role] || '#71717a'
                const isSelected = selectedMember?.id === member.id

                return (
                  <button
                    key={member.id}
                    onClick={() => setSelectedMember(member)}
                    className={`flex w-full items-center gap-4 border-b px-4 py-3 text-left transition-colors sm:px-5 ${
                      isSelected
                        ? 'border-l-2 border-l-[var(--brand-violet)] border-b-theme-border bg-[var(--brand-soft)]'
                        : 'border-l-2 border-l-transparent border-b-theme-border hover:bg-theme-elevated'
                    }`}
                  >
                    <div
                      className="font-data flex h-9 w-9 shrink-0 items-center justify-center border-l"
                      style={{ borderColor: color }}
                    >
                      <span className="text-xs font-semibold" style={{ color }}>
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

                    {/* Permissions badges */}
                    <div className="flex gap-1 shrink-0">
                      {member.permissions.includes('admin') && (
                        <span className="border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-500">
                          Admin
                        </span>
                      )}
                    </div>

                    <span className="shrink-0 text-content-faint" aria-hidden="true">
                      →
                    </span>
                  </button>
                )
              })}
              {filtered.length === 0 && (
                <div className="flex flex-col items-center py-12 text-content-subtle">
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
              <p className="text-sm text-content-subtle">
                Sélectionnez un membre pour voir ses détails
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* New member modal */}
      {showNewForm && (
        <NewMemberModal
          onClose={() => setShowNewForm(false)}
          onAdd={(member) => {
            setTeamList((current) => [...current, member])
            setSelectedMember(member)
            setShowNewForm(false)
          }}
        />
      )}

      {/* Edit member modal */}
      {editingMember && (
        <EditMemberModal
          member={editingMember}
          onClose={() => setEditingMember(null)}
          onSave={(updated) => {
            setTeamList((prev) => prev.map((m) => (m.id === updated.id ? updated : m)))
            setSelectedMember(updated)
            setEditingMember(null)
          }}
        />
      )}
    </div>
  )
}

function MemberDetail({
  member,
  onClose,
  onEdit,
}: {
  member: TeamMember
  onClose: () => void
  onEdit: () => void
}) {
  const color = ROLE_COLORS[member.role] || '#71717a'

  return (
    <Card className="sticky top-4">
      <div className="space-y-5">
        {/* Avatar + name */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="font-data border-l-2 py-1 pl-3" style={{ borderColor: color }}>
              <span className="text-base font-semibold" style={{ color }}>
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

        {/* Contact */}
        <div className="space-y-2">
          <p className="text-xs text-content-subtle">Contact</p>
          <div className="grid grid-cols-[4rem_minmax(0,1fr)] gap-2 border-b border-theme-border py-2.5">
            <span className="text-[11px] text-content-subtle">Email</span>
            <span className="text-sm text-content-primary">{member.email}</span>
          </div>
          {member.phone && (
            <div className="grid grid-cols-[4rem_minmax(0,1fr)] gap-2 py-2.5">
              <span className="text-[11px] text-content-subtle">Téléphone</span>
              <span className="text-sm text-content-primary">{member.phone}</span>
            </div>
          )}
        </div>

        {/* Permissions */}
        <div className="space-y-2">
          <p className="text-xs text-content-subtle">Permissions</p>
          <div className="flex flex-wrap gap-2">
            {member.permissions.map((perm) => (
              <span
                key={perm}
                className={`border px-2 py-0.5 text-xs ${
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

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" className="flex-1" onClick={onEdit}>
            Modifier
          </Button>
          <a
            href={`mailto:${member.email}`}
            aria-label="Envoyer un email"
            className="inline-flex items-center justify-center rounded-md border border-transparent px-3 py-2 text-content-muted hover:border-theme-border hover:bg-theme-elevated hover:text-content-primary"
          >
            <Mail size={14} />
          </a>
          {member.phone && (
            <a
              href={`tel:${member.phone.replace(/\s/g, '')}`}
              aria-label="Appeler"
              className="inline-flex items-center justify-center rounded-md border border-transparent px-3 py-2 text-content-muted hover:border-theme-border hover:bg-theme-elevated hover:text-content-primary"
            >
              <Phone size={14} />
            </a>
          )}
        </div>
      </div>
    </Card>
  )
}

function NewMemberModal({
  onClose,
  onAdd,
}: {
  onClose: () => void
  onAdd: (member: TeamMember) => void
}) {
  const trapRef = useFocusTrap<HTMLFormElement>(true)
  const [form, setForm] = useState({ name: '', role: 'Régisseur Son', email: '', phone: '' })
  const [permissions, setPermissions] = useState<string[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!form.name.trim() || !form.email.trim())
      return setError('Le nom et l’adresse e-mail sont requis.')
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError('L’adresse e-mail n’est pas valide.')
    onAdd({
      id: `tm-${Date.now()}`,
      name: form.name.trim(),
      role: form.role,
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      permissions,
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <form
        ref={trapRef}
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-member-title"
        className="panel relative w-full max-w-lg p-5 shadow-2xl sm:p-6"
      >
        <button
          type="button"
          aria-label="Fermer"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-2 text-content-subtle hover:bg-theme-elevated hover:text-content-primary"
        >
          <X size={16} />
        </button>
        <h2 id="new-member-title" className="mb-1 text-lg font-semibold text-content-primary">
          Ajouter un membre
        </h2>
        <p className="mb-5 text-sm text-content-subtle">Le membre sera ajouté à l’équipe locale.</p>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="new-member-name" className="block text-sm text-content-muted mb-1.5">
                Nom complet
              </label>
              <input
                id="new-member-name"
                type="text"
                placeholder="Prénom Nom"
                value={form.name}
                onChange={(event) => {
                  setForm((current) => ({ ...current, name: event.target.value }))
                  setError('')
                }}
                className="form-control px-3"
              />
            </div>
            <div>
              <label htmlFor="new-member-role" className="block text-sm text-content-muted mb-1.5">
                Rôle
              </label>
              <div className="relative">
                <select
                  id="new-member-role"
                  value={form.role}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, role: event.target.value }))
                  }
                  className="form-control appearance-none px-3 pr-9"
                >
                  <option>Régisseur Son</option>
                  <option>Régisseur Lumière</option>
                  <option>Régisseur Vidéo</option>
                  <option>Régisseur Plateau</option>
                  <option>Responsable Sécurité</option>
                  <option>Machiniste</option>
                  <option>Cintrier</option>
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-content-subtle pointer-events-none"
                />
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
              value={form.email}
              onChange={(event) => {
                setForm((current) => ({ ...current, email: event.target.value }))
                setError('')
              }}
              className="form-control px-3"
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
              value={form.phone}
              onChange={(event) =>
                setForm((current) => ({ ...current, phone: event.target.value }))
              }
              className="form-control px-3"
            />
          </div>
          <div>
            <label className="block text-sm text-content-muted mb-1.5">Permissions</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                <label
                  key={key}
                  className="flex cursor-pointer items-center gap-1.5 rounded-md border border-theme-border bg-theme-elevated px-2.5 py-1.5 text-xs text-content-muted hover:border-theme-border-hover"
                >
                  <input
                    type="checkbox"
                    checked={permissions.includes(key)}
                    onChange={() =>
                      setPermissions((current) =>
                        current.includes(key)
                          ? current.filter((permission) => permission !== key)
                          : [...current, key],
                      )
                    }
                    className="accent-[var(--brand-violet)]"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
          {error && (
            <p
              role="alert"
              className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
            >
              {error}
            </p>
          )}
          <div className="flex justify-end gap-3 border-t border-theme-border pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" variant="primary">
              Ajouter
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
