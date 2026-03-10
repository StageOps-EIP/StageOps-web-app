import { Card, CardHeader } from '@/components/design-system/Card';
import { Clock, MapPin, Users } from 'lucide-react';
import { formatTime } from '@/lib/utils';
import { EVENT_STATUS_CONFIG } from '@/lib/constants';
import type { Event, TeamMember } from '@/lib/types';

interface EventListViewProps {
  allEvents: Event[];
  onSelectEvent: (evt: Event | null) => void;
  teamMembers?: TeamMember[];
}

export function EventListView({ allEvents, onSelectEvent, teamMembers = [] }: EventListViewProps) {
  return (
    <Card>
      <CardHeader title="Tous les événements" subtitle={`${allEvents.length} événements`} />
      <div className="space-y-2">
        {allEvents
          .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
          .map((evt) => {
            const sc = EVENT_STATUS_CONFIG[evt.status];
            const teamDisplay = evt.teamMembers.map((id) => teamMembers.find((t) => t.id === id)?.name ?? id ?? '—');

            return (
              <button
                key={evt.id}
                onClick={() => onSelectEvent(evt)}
                className="w-full text-left flex items-center gap-4 p-4 bg-theme-elevated rounded-xl hover:bg-theme-border transition-colors"
              >
                <div className="flex flex-col items-center justify-center w-14 shrink-0">
                  <span className="text-[10px] uppercase text-content-subtle">{evt.startDate.toLocaleDateString('fr-FR', { month: 'short' })}</span>
                  <span className="text-2xl text-content-primary">{evt.startDate.getDate()}</span>
                </div>

                <div className="h-10 w-px bg-[#27272e]" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-content-primary truncate">{evt.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: sc.bg, color: sc.color }}>
                      {sc.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-content-subtle">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {formatTime(evt.startDate)} – {formatTime(evt.endDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {evt.venue}
                    </span>
                    <span className="flex items-center gap-1" title={teamDisplay.length ? teamDisplay.join(', ') : '—'}>
                      <Users size={12} />
                      {teamDisplay.length || '—'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <span className="text-xs text-content-muted mb-1">{evt.checklistProgress}%</span>
                  <div className="w-20 h-1.5 bg-[#27272e] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${evt.checklistProgress}%`,
                        backgroundColor: evt.checklistProgress > 75 ? '#22c55e' : evt.checklistProgress > 40 ? '#f59e0b' : '#ef4444',
                      }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
      </div>
    </Card>
  );
}
