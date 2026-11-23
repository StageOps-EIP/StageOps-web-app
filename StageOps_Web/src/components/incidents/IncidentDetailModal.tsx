import { useEffect } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/design-system/Button'
import { getSeverityColor, getSeverityLabel, formatRelativeTime } from '@/lib/utils'
import type { Equipment, Incident } from '@/lib/types'
import type { IncidentStatus } from '@/lib/types'
import { STATUS_COLORS } from '@/lib/design-tokens'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { CheckCircle2, Wrench, X, ArrowUpRight } from 'lucide-react'

const statusLabels: Record<string, { label: string; color: string }> = {
  open: { label: 'Ouvert', color: STATUS_COLORS.danger },
  'in-progress': { label: 'En cours', color: STATUS_COLORS.warning },
  resolved: { label: 'Résolu', color: STATUS_COLORS.success },
  closed: { label: 'Clos', color: STATUS_COLORS.neutral },
}

export function IncidentDetailModal({
  incident,
  equipment,
  onClose,
  onStatusChange,
}: {
  incident: Incident
  equipment?: Equipment
  onClose: () => void
  onStatusChange?: (status: IncidentStatus) => void
}) {
  const trapRef = useFocusTrap(true)
  const sevColor = getSeverityColor(incident.severity)
  const statusCol = statusLabels[incident.status]

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(61,13,23,0.4)] p-3 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="incident-modal-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-theme-border bg-theme-base shadow-[0_20px_50px_rgba(61,13,23,0.18)]"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-theme-border bg-theme-base px-5 py-4 sm:px-8 sm:py-5">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 rounded-full" style={{ backgroundColor: sevColor }} />
            <h2 id="incident-modal-title" className="text-lg text-content-primary">
              Détail de l'incident
            </h2>
          </div>
          <button
            aria-label="Fermer"
            onClick={onClose}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl hover:bg-theme-elevated text-content-subtle hover:text-content-primary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6 px-5 py-5 sm:px-8 sm:py-6">
          {/* Status badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-sm font-semibold px-3 py-1.5 rounded-full"
              style={{
                backgroundColor: `${sevColor}15`,
                color: sevColor,
                border: `1px solid ${sevColor}30`,
              }}
            >
              {getSeverityLabel(incident.severity)}
            </span>
            <span
              className="text-sm font-semibold px-3 py-1.5 rounded-full"
              style={{
                backgroundColor: `${statusCol.color}15`,
                color: statusCol.color,
                border: `1px solid ${statusCol.color}30`,
              }}
            >
              {statusCol.label}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xl text-content-primary">{incident.title}</h3>

          {/* Description */}
          <div>
            <p className="text-xs text-content-subtle uppercase tracking-wider mb-2">Description</p>
            <p className="text-sm text-content-muted leading-relaxed">{incident.description}</p>
          </div>

          {/* Info grid */}
          <div>
            <p className="text-xs text-content-subtle uppercase tracking-wider mb-3">
              Informations
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="p-4 bg-theme-elevated rounded-xl">
                <p className="text-sm text-content-muted mb-1">Signalé par</p>
                <p className="text-sm text-content-primary">{incident.reportedBy}</p>
              </div>
              <div className="p-4 bg-theme-elevated rounded-xl">
                <p className="text-sm text-content-muted mb-1">Date du signalement</p>
                <p className="text-sm text-content-primary">
                  {formatRelativeTime(incident.timestamp)}
                </p>
              </div>
              {incident.resolvedAt && (
                <>
                  <div className="p-4 bg-theme-elevated rounded-xl">
                    <p className="text-sm text-content-muted mb-1">Résolu le</p>
                    <p className="text-sm text-content-primary">
                      {formatRelativeTime(incident.resolvedAt)}
                    </p>
                  </div>
                  <div className="p-4 bg-theme-elevated rounded-xl">
                    <p className="text-sm text-content-muted mb-1">Durée de résolution</p>
                    <p className="text-sm text-content-primary">
                      {Math.round(
                        (incident.resolvedAt.getTime() - incident.timestamp.getTime()) / 3600000,
                      )}
                      h
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Linked equipment */}
          {equipment && (
            <div>
              <p className="text-xs text-content-subtle uppercase tracking-wider mb-3">
                Équipement concerné
              </p>
              <Link
                to={`/equipment?equipment=${encodeURIComponent(equipment.id)}`}
                className="flex items-center gap-4 rounded-xl border border-theme-border bg-theme-elevated p-4 hover:border-theme-border-hover"
              >
                <div className="p-2.5 bg-theme-border rounded-lg">
                  <Wrench size={18} className="text-content-muted" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-content-primary">{equipment.name}</p>
                  <p className="text-xs text-content-subtle mt-0.5">
                    {equipment.location}
                    {equipment.zone ? ` · ${equipment.zone}` : ''}
                  </p>
                </div>
                <span className="text-xs font-semibold text-[var(--brand-violet-hover)]">
                  Voir la fiche
                </span>
              </Link>
            </div>
          )}

          {/* Resolution notes */}
          {incident.resolutionNotes && (
            <div>
              <p className="text-xs text-content-subtle uppercase tracking-wider mb-3">
                Résolution
              </p>
              <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 size={14} className="text-emerald-700" />
                  <p className="text-xs text-emerald-700">Résolu</p>
                </div>
                <p className="text-sm text-content-muted leading-relaxed">
                  {incident.resolutionNotes}
                </p>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div>
            <p className="text-xs text-content-subtle uppercase tracking-wider mb-3">Historique</p>
            <div className="space-y-0">
              <TimelineItem
                color={sevColor}
                label={`Incident signalé par ${incident.reportedBy}`}
                time={formatRelativeTime(incident.timestamp)}
              />
              {incident.status === 'in-progress' && (
                <TimelineItem
                  color={STATUS_COLORS.warning}
                  label="Prise en charge"
                  time="En cours"
                />
              )}
              {incident.resolvedAt && (
                <TimelineItem
                  color={STATUS_COLORS.success}
                  label="Incident résolu"
                  time={formatRelativeTime(incident.resolvedAt)}
                />
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-theme-border">
            {incident.status === 'open' && (
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => onStatusChange?.('in-progress')}
              >
                <ArrowUpRight size={16} />
                Prendre en charge
              </Button>
            )}
            {incident.status === 'in-progress' && (
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => onStatusChange?.('resolved')}
              >
                <CheckCircle2 size={16} />
                Marquer résolu
              </Button>
            )}
            <Button variant="ghost" onClick={onClose}>
              Fermer
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function TimelineItem({ color, label, time }: { color: string; label: string; time: string }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="flex flex-col items-center mt-1">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
        <div className="w-px h-6 bg-theme-border" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-content-primary">{label}</p>
        <p className="text-xs text-content-subtle">{time}</p>
      </div>
    </div>
  )
}
