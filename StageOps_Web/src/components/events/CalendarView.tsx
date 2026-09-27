import { Card, CardHeader } from '@/components/design-system/Card'
import { formatTime, getProgressColor } from '@/lib/utils'
import { EVENT_STATUS_CONFIG, DAYS_FR, MONTHS_FR } from '@/lib/constants'
import { EventDetail } from './EventDetail'
import type { Event } from '@/lib/types'

interface CalendarViewProps {
  days: (number | null)[]
  month: number
  year: number
  today: Date
  eventsThisMonth: Event[]
  selectedEvent: Event | null
  onSelectEvent: (evt: Event | null) => void
  onPrevMonth: () => void
  onNextMonth: () => void
}

function getEventsForDay(events: Event[], day: number, month: number, year: number): Event[] {
  return events.filter((e) => {
    const d = e.startDate
    return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year
  })
}

export function CalendarView({
  days,
  month,
  year,
  today,
  eventsThisMonth,
  selectedEvent,
  onSelectEvent,
  onPrevMonth,
  onNextMonth,
}: CalendarViewProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px] 2xl:grid-cols-[minmax(0,1fr)_340px]">
      {/* Calendar */}
      <Card className="overflow-x-auto">
        <div className="mb-4 flex items-center justify-between border-b border-theme-border pb-3">
          <h2 className="text-sm font-semibold text-content-primary">
            {MONTHS_FR[month]} {year}
          </h2>
          <div className="flex items-center gap-2">
            <button
              aria-label="Mois précédent"
              onClick={onPrevMonth}
              className="p-1.5 text-content-muted transition-colors hover:bg-theme-elevated hover:text-content-primary"
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              aria-label="Mois suivant"
              onClick={onNextMonth}
              className="p-1.5 text-content-muted transition-colors hover:bg-theme-elevated hover:text-content-primary"
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="mb-1 grid min-w-[650px] grid-cols-7">
          {DAYS_FR.map((d) => (
            <div key={d} className="py-2 text-center text-xs font-semibold text-content-subtle">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid — no gap, borders provide separation */}
        <div className="grid min-w-[650px] grid-cols-7 overflow-hidden border-l border-t border-theme-border">
          {days.map((day, idx) => {
            if (day === null)
              return (
                <div
                  key={`empty-${idx}`}
                  className="min-h-[7rem] border-r border-b border-theme-border bg-theme-deeper"
                />
              )

            const dayEvents = getEventsForDay(eventsThisMonth, day, month, year)
            const isToday =
              day === today.getDate() && month === today.getMonth() && year === today.getFullYear()

            return (
              <div
                key={`day-${day}`}
                className={`min-h-[7rem] p-2 border-r border-b border-theme-border transition-colors ${
                  isToday ? 'bg-[var(--brand-soft)]' : 'bg-transparent hover:bg-theme-elevated'
                }`}
              >
                {/* Day number */}
                <div className="flex justify-end mb-1.5">
                  <span
                    className={`flex h-6 w-6 items-center justify-center text-xs font-medium ${
                      isToday
                        ? 'bg-[var(--brand-violet)] text-[#080a10] font-bold'
                        : 'text-content-subtle'
                    }`}
                  >
                    {day}
                  </span>
                </div>

                {/* Events */}
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 3).map((evt) => {
                    const sc = EVENT_STATUS_CONFIG[evt.status]
                    return (
                      <button
                        key={evt.id}
                        onClick={() => onSelectEvent(evt)}
                        className="w-full truncate border-l-2 px-1.5 py-1 text-left text-[11px] leading-tight hover:brightness-125"
                        style={{ backgroundColor: sc.bg, color: sc.color }}
                      >
                        {evt.title}
                      </button>
                    )
                  })}
                  {dayEvents.length > 3 && (
                    <span className="text-[10px] text-content-faint pl-1 block">
                      +{dayEvents.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Sidebar — upcoming events */}
      <div className="space-y-4">
        <Card>
          <CardHeader title="Prochains événements" subtitle={`${MONTHS_FR[month]} ${year}`} />
          <div className="-mx-4 -mb-4 sm:-mx-5 sm:-mb-5">
            {eventsThisMonth
              .slice()
              .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
              .map((evt) => {
                const sc = EVENT_STATUS_CONFIG[evt.status]
                return (
                  <button
                    key={evt.id}
                    onClick={() => onSelectEvent(evt)}
                    className={`w-full border-b p-3 text-left transition-colors ${
                      selectedEvent?.id === evt.id
                        ? 'border-l-2 border-l-[var(--brand-violet)] border-b-theme-border bg-[var(--brand-soft)]'
                        : 'border-l-2 border-l-transparent border-b-theme-border hover:bg-theme-elevated'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-content-primary truncate pr-2">
                        {evt.title}
                      </span>
                      <span
                        className="shrink-0 border-l border-theme-border px-1.5 py-0.5 text-[10px]"
                        style={{ backgroundColor: sc.bg, color: sc.color }}
                      >
                        {sc.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-content-subtle">
                      <span>
                        {evt.startDate.toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {formatTime(evt.startDate)} – {formatTime(evt.endDate)}
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-2 h-1 overflow-hidden bg-theme-raised">
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${evt.checklistProgress}%`,
                          backgroundColor: getProgressColor(evt.checklistProgress),
                        }}
                      />
                    </div>
                  </button>
                )
              })}
          </div>
        </Card>

        {/* Selected event detail */}
        {selectedEvent && <EventDetail event={selectedEvent} onClose={() => onSelectEvent(null)} />}
      </div>
    </div>
  )
}
