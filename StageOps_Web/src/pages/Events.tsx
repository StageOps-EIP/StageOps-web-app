import { useState } from 'react';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { mockEvents } from '@/lib/mockData';
import { AlertTriangle, Plus, List, CalendarDays } from 'lucide-react';
import type { Event } from '@/lib/types';
import { CalendarView, EventListView, NewEventModal, EventDetail } from '@/components/events';

// Extra mock events for a richer calendar
const allEvents: Event[] = [
  ...mockEvents,
  {
    id: 'evt-004',
    title: 'Don Giovanni - Représentation',
    startDate: new Date('2026-02-11T14:00:00'),
    endDate: new Date('2026-02-11T17:00:00'),
    venue: 'Théâtre National',
    stage: 'Grande Salle',
    checklistProgress: 92,
    equipmentIds: ['eq-001', 'eq-006'],
    teamMembers: ['tm-001', 'tm-002'],
    status: 'running',
  },
  {
    id: 'evt-005',
    title: 'Cyrano - Répétition',
    startDate: new Date('2026-02-15T09:00:00'),
    endDate: new Date('2026-02-15T13:00:00'),
    venue: 'Théâtre National',
    stage: 'Salle Studio',
    checklistProgress: 30,
    equipmentIds: ['eq-003'],
    teamMembers: ['tm-003', 'tm-004'],
    status: 'planning',
  },
  {
    id: 'evt-006',
    title: 'Maintenance Générale',
    startDate: new Date('2026-02-17T08:00:00'),
    endDate: new Date('2026-02-17T18:00:00'),
    venue: 'Théâtre National',
    stage: 'Toutes salles',
    checklistProgress: 0,
    equipmentIds: [],
    teamMembers: ['tm-001', 'tm-002', 'tm-003', 'tm-004', 'tm-005'],
    status: 'planning',
  },
  {
    id: 'evt-007',
    title: 'La Traviata - Démontage',
    startDate: new Date('2026-02-20T10:00:00'),
    endDate: new Date('2026-02-20T16:00:00'),
    venue: 'Salle Pleyel',
    stage: 'Scène Principale',
    checklistProgress: 100,
    equipmentIds: ['eq-004', 'eq-008'],
    teamMembers: ['tm-002', 'tm-005'],
    status: 'strike',
  },
];

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

// Detect conflicts (overlapping events on same stage)
function getConflicts(): { a: Event; b: Event }[] {
  const conflicts: { a: Event; b: Event }[] = [];
  for (let i = 0; i < allEvents.length; i++) {
    for (let j = i + 1; j < allEvents.length; j++) {
      const a = allEvents[i];
      const b = allEvents[j];
      if (
        a.stage === b.stage &&
        a.venue === b.venue &&
        a.startDate < b.endDate &&
        b.startDate < a.endDate
      ) {
        conflicts.push({ a, b });
      }
    }
  }
  return conflicts;
}

export function Events() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 1)); // Feb 2026
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = getCalendarDays(year, month);
  const conflicts = getConflicts();
  const today = new Date();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const eventsThisMonth = allEvents.filter(
    (e) => e.startDate.getMonth() === month && e.startDate.getFullYear() === year
  );

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-content-primary mb-2">Événements & Planning</h1>
          <p className="text-content-muted">{eventsThisMonth.length} événements ce mois-ci</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex bg-theme-elevated rounded-xl p-1 border border-theme-border">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                viewMode === 'calendar'
                  ? 'bg-cyan-400/15 text-cyan-400'
                  : 'text-content-muted hover:text-content-primary'
              }`}
            >
              <CalendarDays size={16} />
              Calendrier
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                viewMode === 'list'
                  ? 'bg-cyan-400/15 text-cyan-400'
                  : 'text-content-muted hover:text-content-primary'
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

      {/* Conflicts warning */}
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
          onPrevMonth={prevMonth}
          onNextMonth={nextMonth}
        />
      ) : (
        <EventListView allEvents={allEvents} onSelectEvent={setSelectedEvent} />
      )}

      {/* New event modal */}
      {showNewForm && <NewEventModal onClose={() => setShowNewForm(false)} />}

      {/* Event detail modal on list view */}
      {selectedEvent && viewMode === 'list' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-lg">
            <EventDetail event={selectedEvent} onClose={() => setSelectedEvent(null)} />
          </div>
        </div>
      )}
    </div>
  );
}
