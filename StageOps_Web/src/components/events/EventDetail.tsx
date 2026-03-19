import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { formatEventDateRange, formatEventTimeRange } from '@/lib/utils';
import { EVENT_STATUS_CONFIG } from '@/lib/constants';
import { Calendar, Clock, MapPin, Users, Box, X, Trash2 } from 'lucide-react';
import type { Equipment, Event, TeamMember } from '@/lib/types';

interface EventDetailProps {
  event: Event;
  onClose: () => void;
  onDelete?: (eventId: string) => void;
  equipmentList?: Equipment[];
  teamMembers?: TeamMember[];
}

export function EventDetail({
  event,
  onClose,
  onDelete,
  equipmentList = [],
  teamMembers = [],
}: EventDetailProps) {
  const sc = EVENT_STATUS_CONFIG[event.status];
  const team = event.teamMembers.map((id) => teamMembers.find((t) => t.id === id)).filter(Boolean);
  const equipment = event.equipmentIds.map((id) => equipmentList.find((e) => e.id === id)).filter(Boolean);

  return (
    <Card className="relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-theme-border text-content-subtle hover:text-content-primary transition-colors"
      >
        <X size={16} />
      </button>
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: sc.bg, color: sc.color }}>
              {sc.label}
            </span>
          </div>
          <h3 className="text-lg text-content-primary">{event.title}</h3>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-content-muted">
            <Calendar size={14} />
            <span>
              {formatEventDateRange(event.startDate, event.endDate)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-content-muted">
            <Clock size={14} />
            <span>
              {formatEventTimeRange(event.startDate, event.endDate)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-content-muted">
            <MapPin size={14} />
            <span>
              {event.venue} — {event.stage}
            </span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs text-content-muted mb-1">
            <span>Checklist</span>
            <span>{event.checklistProgress}%</span>
          </div>
          <div className="h-2 bg-[#27272e] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${event.checklistProgress}%`,
                backgroundColor:
                  event.checklistProgress > 75 ? '#22c55e' : event.checklistProgress > 40 ? '#f59e0b' : '#ef4444',
              }}
            />
          </div>
        </div>

        <div>
          <p className="text-xs text-content-subtle mb-2 flex items-center gap-1">
            <Users size={12} /> Équipe ({team.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {team.length === 0 && <span className="text-xs text-content-subtle">—</span>}
            {team.map((m) =>
              m ? (
                <span key={m.id} className="px-2 py-1 bg-theme-elevated border border-theme-border rounded-lg text-xs text-content-primary">
                  {m.name}
                </span>
              ) : null,
            )}
          </div>
        </div>

        <div>
          <p className="text-xs text-content-subtle mb-2 flex items-center gap-1">
            <Box size={12} /> Équipements ({equipment.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {equipment.length === 0 && <span className="text-xs text-content-subtle">—</span>}
            {equipment.map((e) =>
              e ? (
                <span key={e.id} className="px-2 py-1 bg-theme-elevated border border-theme-border rounded-lg text-xs text-content-primary">
                  {e.name}
                </span>
              ) : null,
            )}
          </div>
        </div>

        {onDelete && (
          <div className="flex justify-end pt-2">
            <Button variant="danger" size="sm" onClick={() => onDelete(event.id)}>
              <Trash2 size={14} />
              Supprimer l'événement
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
