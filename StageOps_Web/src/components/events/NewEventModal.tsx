import { useEffect, useState } from 'react'
import { Button } from '@/components/design-system/Button'
import { X, CheckCircle2 } from 'lucide-react'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import type { Event } from '@/lib/types'

export function NewEventModal({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (event: Event) => void
}) {
  const trapRef = useFocusTrap<HTMLFormElement>(true)
  const [form, setForm] = useState({
    title: '',
    start: '2026-02-11T20:00',
    end: '2026-02-11T23:00',
    venue: 'Théâtre National',
    stage: 'Grande Salle',
    status: 'planning' as Event['status'],
  })
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
    const startDate = new Date(form.start)
    const endDate = new Date(form.end)
    if (!form.title.trim() || !form.venue.trim() || !form.stage.trim())
      return setError('Renseignez le titre, le lieu et la scène.')
    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime()) ||
      endDate <= startDate
    )
      return setError('La date de fin doit être postérieure au début.')
    onCreate({
      id: `evt-${Date.now()}`,
      title: form.title.trim(),
      startDate,
      endDate,
      venue: form.venue.trim(),
      stage: form.stage.trim(),
      status: form.status,
      checklistProgress: 0,
      equipmentIds: [],
      teamMembers: [],
    })
  }

  const set = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }))
    setError('')
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
        aria-labelledby="new-event-title"
        className="panel w-full max-w-lg p-5 shadow-2xl sm:p-6"
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 id="new-event-title" className="text-lg font-semibold text-content-primary">
              Nouvel événement
            </h2>
            <p className="mt-1 text-sm text-content-subtle">
              L’événement sera ajouté au planning opérationnel.
            </p>
          </div>
          <button
            type="button"
            aria-label="Fermer"
            onClick={onClose}
            className="rounded-md p-2 text-content-subtle hover:bg-theme-elevated hover:text-content-primary"
          >
            <X size={17} />
          </button>
        </div>
        <div className="space-y-4">
          <Field label="Titre">
            <input
              className="form-control px-3"
              value={form.title}
              onChange={(event) => set('title', event.target.value)}
              placeholder="Carmen — Répétition générale"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Date de début">
              <input
                type="datetime-local"
                className="form-control px-3 [color-scheme:dark]"
                value={form.start}
                onChange={(event) => set('start', event.target.value)}
              />
            </Field>
            <Field label="Date de fin">
              <input
                type="datetime-local"
                className="form-control px-3 [color-scheme:dark]"
                value={form.end}
                onChange={(event) => set('end', event.target.value)}
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Lieu">
              <input
                className="form-control px-3"
                value={form.venue}
                onChange={(event) => set('venue', event.target.value)}
              />
            </Field>
            <Field label="Scène">
              <input
                className="form-control px-3"
                value={form.stage}
                onChange={(event) => set('stage', event.target.value)}
              />
            </Field>
          </div>
          <Field label="Statut">
            <select
              className="form-control px-3"
              value={form.status}
              onChange={(event) => set('status', event.target.value)}
            >
              <option value="planning">Planification</option>
              <option value="setup">Installation</option>
              <option value="running">En cours</option>
              <option value="strike">Démontage</option>
            </select>
          </Field>
          {error && (
            <p
              role="alert"
              className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
            >
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2 border-t border-theme-border pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              <CheckCircle2 size={16} /> Créer l’événement
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-content-muted">{label}</span>
      {children}
    </label>
  )
}
