import { useEffect, useRef, useState } from 'react'
import { AlertCircle, X } from 'lucide-react'
import { Button } from '../design-system/Button'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import type { Equipment, Incident, IncidentSeverity } from '@/lib/types'

export function NewIncidentModal({
  onClose,
  onCreate,
  onOpenIncident,
  equipment,
  incidents,
  initialEquipmentId,
}: {
  onClose: () => void
  onCreate: (incident: Incident) => void
  onOpenIncident: (id: string) => void
  equipment: Equipment[]
  incidents: Incident[]
  initialEquipmentId?: string
}) {
  const trapRef = useFocusTrap<HTMLFormElement>(true)
  const [form, setForm] = useState({
    title: '',
    description: '',
    severity: 'medium' as IncidentSeverity,
    equipmentId: initialEquipmentId ?? '',
    reportedBy: '',
  })
  const [errors, setErrors] = useState<Partial<Record<'title' | 'description' | 'reportedBy', string>>>({})
  const titleRef = useRef<HTMLInputElement>(null)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)
  const reporterRef = useRef<HTMLInputElement>(null)
  const existingIncidents = incidents.filter(
    (incident) =>
      incident.equipmentId === form.equipmentId &&
      (incident.status === 'open' || incident.status === 'in-progress'),
  )

  useEffect(() => titleRef.current?.focus(), [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function submit(event: React.FormEvent) {
    event.preventDefault()
    const nextErrors = {
      title: form.title.trim() ? undefined : 'Indiquez ce qui s’est passé.',
      description: form.description.trim() ? undefined : 'Décrivez le problème et son impact.',
      reportedBy: form.reportedBy.trim() ? undefined : 'Indiquez qui signale l’incident.',
    }
    setErrors(nextErrors)
    if (nextErrors.title || nextErrors.description || nextErrors.reportedBy) {
      if (nextErrors.title) titleRef.current?.focus()
      else if (nextErrors.description) descriptionRef.current?.focus()
      else reporterRef.current?.focus()
      return
    }
    onCreate({
      id: `inc-${Date.now()}`,
      title: form.title.trim(),
      description: form.description.trim(),
      severity: form.severity,
      status: 'open',
      equipmentId: form.equipmentId || undefined,
      reportedBy: form.reportedBy.trim(),
      timestamp: new Date(),
    })
  }

  const set = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }))
    if (key === 'title' || key === 'description' || key === 'reportedBy') {
      setErrors((current) => ({ ...current, [key]: undefined }))
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(61,13,23,0.4)] p-4"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <form
        ref={trapRef}
        onSubmit={submit}
        noValidate
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-incident-title"
        className="panel max-h-[90vh] w-full max-w-lg overflow-y-auto p-5 shadow-[0_20px_50px_rgba(61,13,23,0.18)] sm:p-6"
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
            className="grid h-11 w-11 place-items-center rounded-md text-content-subtle hover:bg-theme-elevated"
          >
            <X size={17} />
          </button>
        </div>
        <div className="space-y-4">
          <Field id="incident-title" label="Titre" error={errors.title} required>
            <input
              id="incident-title"
              ref={titleRef}
              required
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? 'incident-title-error' : undefined}
              className="form-control px-3"
              value={form.title}
              onChange={(event) => set('title', event.target.value)}
              placeholder="Panne projecteur perche 2"
            />
          </Field>
          <Field id="incident-description" label="Description" error={errors.description} required>
            <textarea
              id="incident-description"
              ref={descriptionRef}
              required
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? 'incident-description-error' : undefined}
              className="form-control min-h-24 resize-none px-3 py-2.5"
              value={form.description}
              onChange={(event) => set('description', event.target.value)}
              placeholder="Décrivez le problème et son impact…"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="incident-priority" label="Priorité">
              <select
                id="incident-priority"
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
            <Field id="incident-equipment" label="Équipement">
              <select
                id="incident-equipment"
                className="form-control px-3"
                value={form.equipmentId}
                onChange={(event) => set('equipmentId', event.target.value)}
              >
                <option value="">Aucun</option>
                {equipment.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          {existingIncidents.length > 0 && (
            <div className="rounded-lg border border-amber-700/30 bg-amber-50 p-3 text-sm text-amber-950">
              <p className="font-semibold">
                {existingIncidents.length} incident{existingIncidents.length > 1 ? 's' : ''} déjà
                actif{existingIncidents.length > 1 ? 's' : ''} pour ce matériel
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {existingIncidents.map((incident) => (
                  <button
                    key={incident.id}
                    type="button"
                    onClick={() => onOpenIncident(incident.id)}
                    className="min-h-11 rounded-md border border-amber-700/30 bg-white px-3 py-2 text-left text-sm font-semibold hover:bg-amber-100"
                  >
                    Voir « {incident.title} »
                  </button>
                ))}
              </div>
            </div>
          )}
          <Field id="incident-reporter" label="Signalé par" error={errors.reportedBy} required>
            <input
              id="incident-reporter"
              ref={reporterRef}
              required
              aria-invalid={Boolean(errors.reportedBy)}
              aria-describedby={errors.reportedBy ? 'incident-reporter-error' : undefined}
              className="form-control px-3"
              value={form.reportedBy}
              onChange={(event) => set('reportedBy', event.target.value)}
              placeholder="Prénom Nom"
            />
          </Field>
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

function Field({
  id, label, children, error, required = false,
}: {
  id: string
  label: string
  children: React.ReactNode
  error?: string
  required?: boolean
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-content-primary">
        {label}{required && <span className="ml-1 text-[var(--status-danger)]" aria-hidden="true">*</span>}
      </label>
      {children}
      {error && <p id={id + '-error'} role="alert" className="mt-1 text-sm font-medium text-red-800">{error}</p>}
    </div>
  )
}
