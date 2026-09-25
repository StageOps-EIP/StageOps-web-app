import { ArrowRight, UserRound, Wrench } from 'lucide-react'
import { mockEquipment } from '../../lib/mockData'
import { getSeverityColor, getSeverityLabel, formatRelativeTime } from '../../lib/utils'
import type { Incident } from '../../lib/types'

export function IncidentCard({ incident, onClick }: { incident: Incident; onClick: () => void }) {
  const sevColor = getSeverityColor(incident.severity)
  const eq = incident.equipmentId ? mockEquipment.find((e) => e.id === incident.equipmentId) : null

  return (
    <button
      onClick={onClick}
      className="w-full border-b border-theme-border bg-theme-base p-3 text-left transition-colors last:border-b-0 hover:bg-theme-elevated"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-sm text-content-primary line-clamp-2">{incident.title}</span>
        <span
          className="mt-0.5 shrink-0 border px-1.5 py-0.5 text-[10px] font-semibold"
          style={{
            backgroundColor: `${sevColor}15`,
            color: sevColor,
            borderColor: `${sevColor}35`,
          }}
        >
          {getSeverityLabel(incident.severity)}
        </span>
      </div>
      <p className="text-xs text-content-subtle line-clamp-2 mb-3">{incident.description}</p>
      <div className="space-y-1.5 border-t border-theme-border pt-2.5">
        {eq && (
          <span className="flex items-center gap-1 text-[11px] text-content-muted">
            <Wrench size={10} /> {eq.name}
          </span>
        )}
        <div className="flex items-center justify-between gap-2 text-[11px] text-content-subtle">
          <span className="flex items-center gap-1">
            <UserRound size={10} /> {incident.reportedBy}
          </span>
          <span>{formatRelativeTime(incident.timestamp)}</span>
        </div>
        {(incident.status === 'open' || incident.status === 'in-progress') && (
          <span className="flex items-center gap-1 text-[11px] font-medium text-content-muted">
            <ArrowRight size={10} />{' '}
            {incident.status === 'open'
              ? 'Prochaine action : prise en charge'
              : 'Prochaine action : résolution'}
          </span>
        )}
      </div>
    </button>
  )
}
