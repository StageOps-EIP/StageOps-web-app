import { Card, CardHeader } from '@/components/design-system/Card'
import { Clock, MapPin, Users } from 'lucide-react'
import { mockTeamMembers } from '@/lib/mockData'
import { formatTime, getProgressColor } from '@/lib/utils'
import { EVENT_STATUS_CONFIG } from '@/lib/constants'
import type { Event } from '@/lib/types'

interface EventListViewProps {
  allEvents: Event[]
  onSelectEvent: (evt: Event | null) => void
}

export function EventListView({ allEvents, onSelectEvent }: EventListViewProps) {
  return (
    <Card>
      <CardHeader title="Tous les événements" subtitle={`${allEvents.length} événements`} />
      <div className="-mx-4 -mb-4 sm:-mx-5 sm:-mb-5">
        {allEvents
          .slice()
          .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
          .map((evt) => {
            const sc = EVENT_STATUS_CONFIG[evt.status]
            const team = evt.teamMembers
              .map((id) => mockTeamMembers.find((t) => t.id === id)?.name)
              .filter(Boolean)

            return (
              <button
                key={evt.id}
                onClick={() => onSelectEvent(evt)}
                className="grid w-full grid-cols-[3.5rem_minmax(0,1fr)] gap-3 border-b border-theme-border p-4 text-left transition-colors hover:bg-theme-elevated sm:flex sm:items-center sm:gap-4"
              >
                {/* Date block */}
                <div className="flex w-14 shrink-0 flex-col items-center justify-center self-start sm:self-auto">
                  <span className="text-[10px] text-content-subtle">
                    {evt.startDate.toLocaleDateString('fr-FR', { month: 'short' })}
                  </span>
                  <span className="text-2xl font-bold text-content-primary">
                    {evt.startDate.getDate()}
                  </span>
                </div>

                <div className="hidden h-10 w-px bg-theme-border sm:block" />

                <div className="min-w-0 sm:flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-content-primary">{evt.title}</span>
                    <span
                      className="shrink-0 rounded px-2 py-0.5 text-[10px] font-semibold"
                      style={{ backgroundColor: sc.bg, color: sc.color }}
                    >
                      {sc.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-content-subtle">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {formatTime(evt.startDate)} – {formatTime(evt.endDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {evt.venue}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {team.length}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 sm:hidden">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-theme-raised">
                      <div
                        className="h-full"
                        style={{
                          width: `${evt.checklistProgress}%`,
                          backgroundColor: getProgressColor(evt.checklistProgress),
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-content-muted">
                      {evt.checklistProgress}%
                    </span>
                  </div>
                </div>

                {/* Progress */}
                <div className="hidden shrink-0 flex-col items-end sm:flex">
                  <span className="text-xs text-content-muted mb-1">{evt.checklistProgress}%</span>
                  <div className="h-1 w-20 overflow-hidden bg-theme-raised">
                    <div
                      className="h-full"
                      style={{
                        width: `${evt.checklistProgress}%`,
                        backgroundColor: getProgressColor(evt.checklistProgress),
                      }}
                    />
                  </div>
                </div>
              </button>
            )
          })}
      </div>
    </Card>
  )
}
