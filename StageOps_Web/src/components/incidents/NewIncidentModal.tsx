import { useEffect, useState } from 'react'
import { AlertCircle, X } from 'lucide-react'
import { Button } from '../design-system/Button'
import { mockEquipment } from '../../lib/mockData'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import type { Incident, IncidentSeverity } from '@/lib/types'

export function NewIncidentModal({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (incident: Incident) => void
}) {
  const trapRef = useFocusTrap<HTMLFormElement>(true)
  const [form, setForm] = useState({
    title: '',
    description: '',
    severity: 'medium' as IncidentSeverity,
    equipmentId: '',
    reportedBy: '',
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
    if (!form.title.trim() || !form.description.trim() || !form.reportedBy.trim())
      return setError('Renseignez le titre, la description et la personne qui signale l’incident.')
    onCreate({
      id: `inc-${Date.now()}`,
      title: form.title.trim(),
      description: form.description.trim(),
      severity: form.severity,
      status: 'open',
      equipmentId: form.equipmentId || undefined,
      reportedBy: form.reportedBy.trim(),
      timestamp: new Date('2026-02-11T12:00:00'),
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
        aria-labelledby="new-incident-title"
        className="panel w-full max-w-lg p-5 shadow-2xl sm:p-6"
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 id="new-incident-title" className="text-lg font-semibold text-content-primary">
              Signaler un incident
            </h2>
            <p className="mt-1 text-sm text-content-subtle">
              Le nouvel incident sera ajouté au scénario local.
            </p>
          </div>
          <button
            type="button"
            aria-label="Fermer"
            onClick={onClose}
            className="rounded-md p-2 text-content-subtle hover:bg-theme-elevated"
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
              placeholder="Panne projecteur perche 2"
            />
          </Field>
          <Field label="Description">
            <textarea
              className="form-control min-h-24 resize-none px-3 py-2.5"
              value={form.description}
              onChange={(event) => set('description', event.target.value)}
              placeholder="Décrivez le problème et son impact…"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Priorité">
              <select
                className="form-control px-3"
                value={form.severity}
                onChange={(event) => set('severity', event.target.value)}
              >
                <option value="low">Faible</option>
                <option value="medium">Moyenne</option>
                <option value="high">Élevée</option>
                <option value="critical">Critique</option>
              </select>
            </Field>
            <Field label="Équipement">
              <select
                className="form-control px-3"
                value={form.equipmentId}
                onChange={(event) => set('equipmentId', event.target.value)}
              >
                <option value="">Aucun</option>
                {mockEquipment.map((equipment) => (
                  <option key={equipment.id} value={equipment.id}>
                    {equipment.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Signalé par">
            <input
              className="form-control px-3"
              value={form.reportedBy}
              onChange={(event) => set('reportedBy', event.target.value)}
              placeholder="Prénom Nom"
            />
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
            <Button type="submit" variant="danger">
              <AlertCircle size={16} /> Signaler l’incident
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
