import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/design-system/Button'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import type { Equipment, EquipmentCategory, EquipmentStatus } from '@/lib/types'

interface FormState {
  name: string
  category: EquipmentCategory
  status: EquipmentStatus
  location: string
  zone: string
  responsiblePerson: string
  notes: string
  qrCode: string
}

const emptyForm: FormState = {
  name: '', category: 'sound', status: 'ok', location: '',
  zone: '', responsiblePerson: '', notes: '', qrCode: '',
}

function generateQrCode(category: EquipmentCategory): string {
  const prefix = category.slice(0, 3).toUpperCase()
  return 'QR-' + prefix + '-' + (Math.floor(Math.random() * 900) + 100)
}

function generateId(): string {
  return 'eq-' + Date.now() + '-' + Math.floor(Math.random() * 1000)
}

export function AddEquipmentModal({
  onClose, onAdd,
}: {
  onClose: () => void
  onAdd: (equipment: Equipment) => void
}) {
  const [form, setForm] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<Partial<Record<'name' | 'location', string>>>({})
  const trapRef = useFocusTrap<HTMLFormElement>(true)
  const nameRef = useRef<HTMLInputElement>(null)
  const locationRef = useRef<HTMLInputElement>(null)

  useEffect(() => nameRef.current?.focus(), [])
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    if (key === 'name' || key === 'location') {
      setErrors((current) => ({ ...current, [key]: undefined }))
    }
  }

  function submit(event: React.FormEvent) {
    event.preventDefault()
    const nextErrors = {
      name: form.name.trim() ? undefined : 'Indiquez le nom de l’équipement.',
      location: form.location.trim() ? undefined : 'Indiquez où se trouve l’équipement.',
    }
    setErrors(nextErrors)
    if (nextErrors.name || nextErrors.location) {
      if (nextErrors.name) nameRef.current?.focus()
      else locationRef.current?.focus()
      return
    }
    onAdd({
      id: generateId(),
      name: form.name.trim(),
      category: form.category,
      status: form.status,
      location: form.location.trim(),
      zone: form.zone.trim() || undefined,
      responsiblePerson: form.responsiblePerson.trim() || undefined,
      notes: form.notes.trim() || undefined,
      qrCode: form.qrCode.trim() || generateQrCode(form.category),
      lastCheck: new Date(),
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(61,13,23,0.4)] p-3 sm:p-6"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <form
        ref={trapRef}
        onSubmit={submit}
        noValidate
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-equipment-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-theme-border bg-theme-base shadow-[0_20px_50px_rgba(61,13,23,0.18)]"
      >
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-theme-border bg-theme-base px-5 py-4 sm:px-7">
          <div>
            <h2 id="add-equipment-title" className="text-xl font-bold text-content-primary">
              Ajouter un équipement
            </h2>
            <p className="mt-1 text-sm text-content-muted">Renseignez le matériel à suivre dans le parc.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer" className="grid h-11 w-11 shrink-0 place-items-center rounded-lg hover:bg-theme-elevated">
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <div className="space-y-5 px-5 py-5 sm:px-7">
          <div>
            <label htmlFor="equipment-name" className="mb-1.5 block text-sm font-semibold text-content-primary">
              Nom de l’équipement <span aria-hidden="true" className="text-[var(--status-danger)]">*</span>
            </label>
            <input
              id="equipment-name" ref={nameRef} required
              value={form.name} onChange={(event) => set('name', event.target.value)}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'equipment-name-error' : undefined}
              placeholder="Ex. Console son DiGiCo SD12" className="form-control px-3"
            />
            {errors.name && <p id="equipment-name-error" role="alert" className="mt-1 text-sm text-red-800">{errors.name}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="equipment-category" className="mb-1.5 block text-sm font-semibold text-content-primary">Catégorie</label>
              <select id="equipment-category" value={form.category} onChange={(event) => set('category', event.target.value as EquipmentCategory)} className="form-control px-3">
                <option value="sound">Son</option><option value="light">Lumière</option>
                <option value="video">Vidéo</option><option value="set">Plateau</option>
                <option value="safety">Sécurité</option><option value="rigging">Accroche</option>
              </select>
            </div>
            <div>
              <label htmlFor="equipment-status" className="mb-1.5 block text-sm font-semibold text-content-primary">État initial</label>
              <select id="equipment-status" value={form.status} onChange={(event) => set('status', event.target.value as EquipmentStatus)} className="form-control px-3">
                <option value="ok">Opérationnel</option><option value="to-check">À vérifier</option>
                <option value="hs">Hors service</option><option value="repair">En réparation</option>
              </select>
            </div>
          </div>

          {(form.status === 'hs' || form.status === 'repair') && (
            <p className="rounded-lg border border-amber-700/30 bg-amber-50 p-3 text-sm text-amber-950">
              Ce matériel sera indiqué comme indisponible. Pensez à associer un incident si un suivi est nécessaire.
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="equipment-location" className="mb-1.5 block text-sm font-semibold text-content-primary">
                Emplacement <span aria-hidden="true" className="text-[var(--status-danger)]">*</span>
              </label>
              <input
                id="equipment-location" ref={locationRef} required
                value={form.location} onChange={(event) => set('location', event.target.value)}
                aria-invalid={Boolean(errors.location)}
                aria-describedby={errors.location ? 'equipment-location-error' : undefined}
                placeholder="Ex. Régie son" className="form-control px-3"
              />
              {errors.location && <p id="equipment-location-error" role="alert" className="mt-1 text-sm text-red-800">{errors.location}</p>}
            </div>
            <div>
              <label htmlFor="equipment-zone" className="mb-1.5 block text-sm font-semibold text-content-primary">Zone</label>
              <input id="equipment-zone" value={form.zone} onChange={(event) => set('zone', event.target.value)} placeholder="Ex. Jardin" className="form-control px-3" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="equipment-responsible" className="mb-1.5 block text-sm font-semibold text-content-primary">Responsable</label>
              <input id="equipment-responsible" value={form.responsiblePerson} onChange={(event) => set('responsiblePerson', event.target.value)} placeholder="Nom du responsable" className="form-control px-3" />
            </div>
            <div>
              <label htmlFor="equipment-qr" className="mb-1.5 block text-sm font-semibold text-content-primary">Code QR</label>
              <input id="equipment-qr" value={form.qrCode} onChange={(event) => set('qrCode', event.target.value)} aria-describedby="equipment-qr-help" placeholder="Généré si vide" className="form-control px-3" />
              <p id="equipment-qr-help" className="mt-1 text-sm text-content-muted">Laissez vide pour générer un identifiant.</p>
            </div>
          </div>

          <div>
            <label htmlFor="equipment-notes" className="mb-1.5 block text-sm font-semibold text-content-primary">Notes</label>
            <textarea id="equipment-notes" value={form.notes} onChange={(event) => set('notes', event.target.value)} rows={3} className="form-control resize-y px-3 py-2.5" />
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-theme-border pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
            <Button type="submit">Ajouter l’équipement</Button>
          </div>
        </div>
      </form>
    </div>
  )
}
