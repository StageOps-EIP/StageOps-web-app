import { getSeverityColor, getSeverityLabel, formatRelativeTime } from '../../lib/utils'
import type { Equipment, Incident } from '../../lib/types'

export function IncidentCard({
  incident,
  equipment,
  onClick,
}: {
  incident: Incident
  equipment?: Equipment
  onClick: () => void
}) {
  const sevColor = getSeverityColor(incident.severity)

  return (
    <button
      onClick={onClick}
      className="w-full border-b border-theme-border px-3 py-3 text-left transition-colors hover:bg-theme-elevated"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="line-clamp-2 text-sm font-semibold text-content-primary">
          {incident.title}
        </span>
        <span className="mt-0.5 shrink-0 text-[10px] font-semibold" style={{ color: sevColor }}>
          {getSeverityLabel(incident.severity)}
        </span>
      </div>
      <p className="mb-3 line-clamp-2 text-xs text-content-subtle">{incident.description}</p>
      <div className="space-y-1.5 border-t border-theme-border pt-2.5">
        {equipment && <p className="text-[11px] text-content-muted">Matériel · {equipment.name}</p>}
        <div className="flex items-center justify-between gap-2 text-[11px] text-content-subtle">
          <span>{incident.reportedBy}</span>
          <span>{formatRelativeTime(incident.timestamp)}</span>
        </div>
        {(incident.status === 'open' || incident.status === 'in-progress') && (
          <p className="text-[11px] font-medium text-content-muted">
            Suite · {incident.status === 'open' ? 'prise en charge' : 'résolution'}
          </p>
        )}
      </div>
    </button>
  )
}
