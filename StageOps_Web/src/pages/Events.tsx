import { useEffect, useState } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { AlertTriangle, Plus, List, CalendarDays } from 'lucide-react';
import type { Event } from '@/lib/types';
import { CalendarView, EventListView, NewEventModal, EventDetail } from '@/components/events';
import { deleteEvent, getEvents } from '@/services/events.service';
import { isValidDate } from '@/lib/utils';
import { useRole } from '@/hooks/useRole';

function getCalendarDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  const days: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

function getConflicts(events: Event[]): { a: Event; b: Event }[] {
  const conflicts: { a: Event; b: Event }[] = [];
  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      const a = events[i];
      const b = events[j];
      if (a.stage === b.stage && a.venue === b.venue && a.startDate < b.endDate && b.startDate < a.endDate) {
        conflicts.push({ a, b });
      }
    }
  }
  return conflicts;
}

export function Events() {
  usePageTitle('Événements');
  const { canDeleteRecords } = useRole();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [allEvents, setAllEvents] = useState<Event[]>([]);

  useEffect(() => {
    void loadEvents();
  }, []);

  async function loadEvents() {
    const items = await getEvents();
    setAllEvents(items);
  }

  async function handleDeleteEvent(eventId: string) {
    const confirmed = window.confirm('Supprimer cet événement ? Cette action est irréversible.');
    if (!confirmed) return;

    try {
      await deleteEvent(eventId);
      setAllEvents((prev) => prev.filter((event) => event.id !== eventId));
      setSelectedEvent((prev) => (prev?.id === eventId ? null : prev));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Suppression impossible pour le moment.';
      window.alert(message);
    }
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = getCalendarDays(year, month);
  const conflicts = getConflicts(allEvents);
  const today = new Date();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);
  const eventsThisMonth = allEvents.filter((e) => {
    const endDate = isValidDate(e.endDate) ? e.endDate : e.startDate;
    return e.startDate <= monthEnd && endDate >= monthStart;
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-content-primary mb-2">Événements & Planning</h1>
          <p className="text-content-muted">{eventsThisMonth.length} événements ce mois-ci</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-theme-elevated rounded-xl p-1 border border-theme-border">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                viewMode === 'calendar' ? 'bg-cyan-400/15 text-cyan-400' : 'text-content-muted hover:text-content-primary'
              }`}
            >
              <CalendarDays size={16} />
              Calendrier
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                viewMode === 'list' ? 'bg-cyan-400/15 text-cyan-400' : 'text-content-muted hover:text-content-primary'
              }`}
            >
              <List size={16} />
              Liste
            </button>
          </div>
          <Button variant="primary" onClick={() => setShowNewForm(true)}>
            <Plus size={16} />
            Nouvel événement
          </Button>
        </div>
      </div>

      {conflicts.length > 0 && (
        <Card className="bg-gradient-to-r from-amber-500/10 to-red-500/10 border-amber-500/30">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <AlertTriangle size={20} className="text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-content-primary mb-1">
                {conflicts.length} conflit{conflicts.length > 1 ? 's' : ''} détecté{conflicts.length > 1 ? 's' : ''}
              </p>
              {conflicts.map((c, i) => (
                <p key={i} className="text-xs text-amber-400">
                  « {c.a.title} » et « {c.b.title} » — {c.a.stage}, {c.a.venue}
                </p>
              ))}
            </div>
          </div>
        </Card>
      )}

      {viewMode === 'calendar' ? (
        <CalendarView
          days={days}
          month={month}
          year={year}
          today={today}
          eventsThisMonth={eventsThisMonth}
          selectedEvent={selectedEvent}
          onSelectEvent={setSelectedEvent}
          onDeleteEvent={(eventId) => {
            if (!canDeleteRecords) return;
            void handleDeleteEvent(eventId);
          }}
          onPrevMonth={prevMonth}
          onNextMonth={nextMonth}
        />
      ) : (
        <EventListView allEvents={allEvents} onSelectEvent={setSelectedEvent} />
      )}

      {showNewForm && (
        <NewEventModal onClose={() => setShowNewForm(false)} onAdd={(e) => setAllEvents((prev) => [e, ...prev])} />
      )}

      {selectedEvent && viewMode === 'list' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-lg">
            <EventDetail
              event={selectedEvent}
              onClose={() => setSelectedEvent(null)}
              onDelete={
                canDeleteRecords ? (eventId) => void handleDeleteEvent(eventId) : undefined
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
