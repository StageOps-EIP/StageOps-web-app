import { Wrench, GripVertical } from 'lucide-react';
import { getSeverityColor, getSeverityLabel, formatRelativeTime } from '../../lib/utils';
import type { Incident } from '../../lib/types';

export function IncidentCard({
  incident,
  onClick,
  onDragStart,
}: {
  incident: Incident;
  onClick: () => void;
  onDragStart?: (e: React.DragEvent) => void;
}) {
  const sevColor = getSeverityColor(incident.severity);
  const equipmentName = '—';

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="group w-full text-left p-3 bg-theme-base border border-theme-border rounded-xl hover:bg-theme-elevated hover:border-theme-border-hover transition-all cursor-grab active:cursor-grabbing active:opacity-50 active:scale-95"
    >
      <div className="flex items-start gap-1.5">
        <GripVertical size={14} className="shrink-0 mt-0.5 text-content-subtle opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <button onClick={onClick} className="text-sm text-content-primary line-clamp-2 text-left hover:text-cyan-400 transition-colors">
              {incident.title}
            </button>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full shrink-0 mt-0.5"
              style={{ backgroundColor: `${sevColor}15`, color: sevColor }}
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
        </div>
      </div>
    </div>
  );
}
