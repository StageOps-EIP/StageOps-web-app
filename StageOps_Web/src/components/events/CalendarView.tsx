import { Card, CardHeader } from '@/components/design-system/Card';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatTime } from '@/lib/utils';
import { EVENT_STATUS_CONFIG, DAYS_FR, MONTHS_FR } from '@/lib/constants';
import { EventDetail } from './EventDetail';
import type { Event } from '@/lib/types';

interface CalendarViewProps {
  days: (number | null)[];
  month: number;
  year: number;
  today: Date;
  eventsThisMonth: Event[];
  selectedEvent: Event | null;
  onSelectEvent: (evt: Event | null) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

function getEventsForDay(events: Event[], day: number, month: number, year: number): Event[] {
  return events.filter((e) => {
    const d = e.startDate;
    return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
  });
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
    <div className="grid grid-cols-[1fr_360px] gap-6">
      {/* Calendar */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl text-content-primary">
            {MONTHS_FR[month]} {year}
          </h2>
          <div className="flex items-center gap-2">
            <button
              aria-label="Mois précédent"
              onClick={onPrevMonth}
              className="p-2 rounded-lg hover:bg-theme-elevated text-content-muted hover:text-content-primary transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              aria-label="Mois suivant"
              onClick={onNextMonth}
              className="p-2 rounded-lg hover:bg-theme-elevated text-content-muted hover:text-content-primary transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS_FR.map((d) => (
            <div key={d} className="text-center text-[11px] font-medium text-content-faint uppercase tracking-wider py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid — no gap, borders provide separation */}
        <div className="grid grid-cols-7 border-l border-t border-theme-border rounded-xl overflow-hidden">
          {days.map((day, idx) => {
            if (day === null)
              return (
                <div
                  key={`empty-${idx}`}
                  className="min-h-[7rem] border-r border-b border-theme-border bg-theme-deeper/40"
                />
              );

            const dayEvents = getEventsForDay(eventsThisMonth, day, month, year);
            const isToday =
              day === today.getDate() &&
              month === today.getMonth() &&
              year === today.getFullYear();

            return (
              <div
                key={`day-${day}`}
                className={`min-h-[7rem] p-2 border-r border-b border-theme-border transition-colors ${
                  isToday
                    ? 'bg-cyan-400/5'
                    : 'bg-transparent hover:bg-theme-elevated/60'
                }`}
              >
                {/* Day number */}
                <div className="flex justify-end mb-1.5">
                  <span
                    className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                      isToday
                        ? 'bg-cyan-400 text-black font-bold'
                        : 'text-content-subtle'
                    }`}
                  >
                    {day}
                  </span>
                </div>

                {/* Events */}
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 3).map((evt) => {
                    const sc = EVENT_STATUS_CONFIG[evt.status];
                    return (
                      <button
                        key={evt.id}
                        onClick={() => onSelectEvent(evt)}
                        className="w-full text-left px-1.5 py-[3px] rounded-md text-[10px] truncate transition-all hover:brightness-125 leading-tight"
                        style={{ backgroundColor: sc.bg, color: sc.color }}
                      >
                        {evt.title}
                      </button>
                    );
                  })}
                  {dayEvents.length > 3 && (
                    <span className="text-[10px] text-content-faint pl-1 block">
                      +{dayEvents.length - 3}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Sidebar — upcoming events */}
      <div className="space-y-4">
        <Card>
          <CardHeader title="Prochains événements" subtitle={`${MONTHS_FR[month]} ${year}`} />
          <div className="space-y-3">
            {eventsThisMonth
              .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
              .map((evt) => {
                const sc = EVENT_STATUS_CONFIG[evt.status];
                return (
                  <button
                    key={evt.id}
                    onClick={() => onSelectEvent(evt)}
                    className={`w-full text-left p-3 rounded-xl transition-colors ${
                      selectedEvent?.id === evt.id
                        ? 'bg-cyan-400/10 border border-cyan-400/20'
                        : 'bg-theme-elevated hover:bg-theme-border border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-content-primary truncate pr-2">{evt.title}</span>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full shrink-0"
                        style={{ backgroundColor: sc.bg, color: sc.color }}
                      >
                        {sc.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-content-subtle">
                      <Calendar size={12} />
                      <span>
                        {evt.startDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </span>
                      <Clock size={12} />
                      <span>
                        {formatTime(evt.startDate)} – {formatTime(evt.endDate)}
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-2 h-1 bg-[#27272e] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${evt.checklistProgress}%`,
                          backgroundColor: evt.checklistProgress > 75 ? '#22c55e' : evt.checklistProgress > 40 ? '#f59e0b' : '#ef4444',
                        }}
                      />
                    </div>
                  </button>
                );
              })}
          </div>
        </Card>

        {/* Selected event detail */}
        {selectedEvent && (
          <EventDetail event={selectedEvent} onClose={() => onSelectEvent(null)} />
        )}
      </div>
    </div>
  );
}
