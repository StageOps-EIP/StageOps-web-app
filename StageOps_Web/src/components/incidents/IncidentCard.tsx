import { Wrench } from 'lucide-react';
import { getSeverityColor, getSeverityLabel, formatRelativeTime } from '../../lib/utils';
import type { Incident } from '../../lib/types';

export function IncidentCard({ incident, onClick }: { incident: Incident; onClick: () => void }) {
  const sevColor = getSeverityColor(incident.severity);
  const equipmentName = '—';

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3 bg-theme-base border border-theme-border rounded-xl hover:bg-theme-elevated hover:border-theme-border-hover transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-sm text-content-primary line-clamp-2">{incident.title}</span>
        <span
          className="text-[10px] px-1.5 py-0.5 rounded-full shrink-0 mt-0.5"
          style={{
            backgroundColor: `${sevColor}15`,
            color: sevColor,
          }}
        >
          {getSeverityLabel(incident.severity)}
        </span>
      </div>
      <p className="text-xs text-content-subtle line-clamp-2 mb-3">{incident.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-content-muted flex items-center gap-1">
          <Wrench size={10} /> {equipmentName}
        </span>
        <span className="text-[10px] text-content-subtle ml-auto">{formatRelativeTime(incident.timestamp)}</span>
      </div>
    </button>
  );
}
