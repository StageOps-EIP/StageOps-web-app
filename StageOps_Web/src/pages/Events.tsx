import { useState } from 'react';
import { Card, CardHeader } from '../components/design-system/Card';
import { Button } from '../components/design-system/Button';
import { mockEvents, mockEquipment, mockTeamMembers } from '../lib/mockData';
import { formatTime } from '../lib/utils';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Box,
  Plus,
  CheckCircle2,
  AlertTriangle,
  List,
  CalendarDays,
  X,
} from 'lucide-react';
import type { Event } from '../lib/types';

const statusConfig: Record<Event['status'], { label: string; color: string; bg: string }> = {
  planning: { label: 'Planification', color: '#f59e0b', bg: '#f59e0b15' },
  setup: { label: 'Installation', color: '#3b82f6', bg: '#3b82f615' },
  running: { label: 'En cours', color: '#22c55e', bg: '#22c55e15' },
  strike: { label: 'Démontage', color: '#a855f7', bg: '#a855f715' },
  completed: { label: 'Terminé', color: '#71717a', bg: '#71717a15' },
};

const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

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

function getCalendarDays(year: number, month: number) {
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

function getEventsForDay(day: number, month: number, year: number) {
  return allEvents.filter((e) => {
    const d = e.startDate;
    return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
  });
}

// Detect conflicts (overlapping events on same stage)
function getConflicts() {
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
          <h1 className="text-3xl text-[#f5f5f7] mb-2">Événements & Planning</h1>
          <p className="text-[#a1a1aa]">{eventsThisMonth.length} événements ce mois-ci</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex bg-[#1c1c21] rounded-xl p-1 border border-[#27272e]">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                viewMode === 'calendar'
                  ? 'bg-cyan-400/15 text-cyan-400'
                  : 'text-[#a1a1aa] hover:text-[#f5f5f7]'
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
                  : 'text-[#a1a1aa] hover:text-[#f5f5f7]'
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
              <p className="text-sm text-[#f5f5f7] mb-1">
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
        <div className="grid grid-cols-[1fr_360px] gap-6">
          {/* Calendar */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-[#f5f5f7]">
                {MONTHS_FR[month]} {year}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={prevMonth}
                  className="p-2 rounded-lg hover:bg-[#1c1c21] text-[#a1a1aa] hover:text-[#f5f5f7] transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 rounded-lg hover:bg-[#1c1c21] text-[#a1a1aa] hover:text-[#f5f5f7] transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS_FR.map((d) => (
                <div key={d} className="text-center text-xs text-[#71717a] py-2">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, idx) => {
                if (day === null)
                  return <div key={`empty-${idx}`} className="h-24" />;

                const dayEvents = getEventsForDay(day, month, year);
                const isToday =
                  day === today.getDate() &&
                  month === today.getMonth() &&
                  year === today.getFullYear();

                return (
                  <div
                    key={`day-${day}`}
                    className={`h-24 p-1.5 rounded-xl border transition-colors ${
                      isToday
                        ? 'border-cyan-400/30 bg-cyan-400/5'
                        : 'border-transparent hover:bg-[#1c1c21]'
                    }`}
                  >
                    <span
                      className={`text-xs ${
                        isToday ? 'text-cyan-400' : 'text-[#a1a1aa]'
                      }`}
                    >
                      {day}
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {dayEvents.slice(0, 2).map((evt) => {
                        const sc = statusConfig[evt.status];
                        return (
                          <button
                            key={evt.id}
                            onClick={() => setSelectedEvent(evt)}
                            className="w-full text-left px-1.5 py-0.5 rounded text-[10px] truncate transition-all hover:brightness-125"
                            style={{ backgroundColor: sc.bg, color: sc.color }}
                          >
                            {evt.title}
                          </button>
                        );
                      })}
                      {dayEvents.length > 2 && (
                        <span className="text-[10px] text-[#71717a] pl-1">
                          +{dayEvents.length - 2}
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
                    const sc = statusConfig[evt.status];
                    return (
                      <button
                        key={evt.id}
                        onClick={() => setSelectedEvent(evt)}
                        className={`w-full text-left p-3 rounded-xl transition-colors ${
                          selectedEvent?.id === evt.id
                            ? 'bg-cyan-400/10 border border-cyan-400/20'
                            : 'bg-[#1c1c21] hover:bg-[#27272e] border border-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-[#f5f5f7] truncate pr-2">{evt.title}</span>
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded-full shrink-0"
                            style={{ backgroundColor: sc.bg, color: sc.color }}
                          >
                            {sc.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#71717a]">
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
              <EventDetail event={selectedEvent} onClose={() => setSelectedEvent(null)} />
            )}
          </div>
        </div>
      ) : (
        /* List view */
        <Card>
          <CardHeader title="Tous les événements" subtitle={`${allEvents.length} événements`} />
          <div className="space-y-2">
            {allEvents
              .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
              .map((evt) => {
                const sc = statusConfig[evt.status];
                const team = evt.teamMembers
                  .map((id) => mockTeamMembers.find((t) => t.id === id)?.name)
                  .filter(Boolean);

                return (
                  <button
                    key={evt.id}
                    onClick={() => setSelectedEvent(evt)}
                    className="w-full text-left flex items-center gap-4 p-4 bg-[#1c1c21] rounded-xl hover:bg-[#27272e] transition-colors"
                  >
                    {/* Date block */}
                    <div className="flex flex-col items-center justify-center w-14 shrink-0">
                      <span className="text-[10px] uppercase text-[#71717a]">
                        {evt.startDate.toLocaleDateString('fr-FR', { month: 'short' })}
                      </span>
                      <span className="text-2xl text-[#f5f5f7]">{evt.startDate.getDate()}</span>
                    </div>

                    <div className="h-10 w-px bg-[#27272e]" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-[#f5f5f7] truncate">{evt.title}</span>
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full shrink-0"
                          style={{ backgroundColor: sc.bg, color: sc.color }}
                        >
                          {sc.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-[#71717a]">
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
                    </div>

                    {/* Progress */}
                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-xs text-[#a1a1aa] mb-1">{evt.checklistProgress}%</span>
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
      )}

      {/* New event dialog (simple modal) */}
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

function EventDetail({ event, onClose }: { event: Event; onClose: () => void }) {
  const sc = statusConfig[event.status];
  const team = event.teamMembers
    .map((id) => mockTeamMembers.find((t) => t.id === id))
    .filter(Boolean);
  const equipment = event.equipmentIds
    .map((id) => mockEquipment.find((e) => e.id === id))
    .filter(Boolean);

  return (
    <Card className="relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[#27272e] text-[#71717a] hover:text-[#f5f5f7] transition-colors"
      >
        <X size={16} />
      </button>
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: sc.bg, color: sc.color }}
            >
              {sc.label}
            </span>
          </div>
          <h3 className="text-lg text-[#f5f5f7]">{event.title}</h3>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-[#a1a1aa]">
            <Calendar size={14} />
            <span>
              {event.startDate.toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[#a1a1aa]">
            <Clock size={14} />
            <span>
              {formatTime(event.startDate)} – {formatTime(event.endDate)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[#a1a1aa]">
            <MapPin size={14} />
            <span>
              {event.venue} — {event.stage}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="flex items-center justify-between text-xs text-[#a1a1aa] mb-1">
            <span>Checklist</span>
            <span>{event.checklistProgress}%</span>
          </div>
          <div className="h-2 bg-[#27272e] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${event.checklistProgress}%`,
                backgroundColor: event.checklistProgress > 75 ? '#22c55e' : event.checklistProgress > 40 ? '#f59e0b' : '#ef4444',
              }}
            />
          </div>
        </div>

        {/* Team */}
        <div>
          <p className="text-xs text-[#71717a] mb-2 flex items-center gap-1">
            <Users size={12} /> Équipe ({team.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {team.map((m) =>
              m ? (
                <span
                  key={m.id}
                  className="px-2 py-1 bg-[#1c1c21] border border-[#27272e] rounded-lg text-xs text-[#f5f5f7]"
                >
                  {m.name}
                </span>
              ) : null
            )}
          </div>
        </div>

        {/* Equipment */}
        <div>
          <p className="text-xs text-[#71717a] mb-2 flex items-center gap-1">
            <Box size={12} /> Équipements ({equipment.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {equipment.map((e) =>
              e ? (
                <span
                  key={e.id}
                  className="px-2 py-1 bg-[#1c1c21] border border-[#27272e] rounded-lg text-xs text-[#f5f5f7]"
                >
                  {e.name}
                </span>
              ) : null
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function NewEventModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[#27272e] text-[#71717a] hover:text-[#f5f5f7] transition-colors"
        >
          <X size={16} />
        </button>
        <h2 className="text-xl text-[#f5f5f7] mb-6">Nouvel événement</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[#a1a1aa] mb-1.5">Titre</label>
            <input
              type="text"
              placeholder="Ex: Carmen - Répétition Générale"
              className="w-full bg-[#1c1c21] border border-[#27272e] rounded-xl px-4 py-2.5 text-sm text-[#f5f5f7] placeholder:text-[#71717a] focus:outline-none focus:border-cyan-400/50"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#a1a1aa] mb-1.5">Date de début</label>
              <input
                type="datetime-local"
                className="w-full bg-[#1c1c21] border border-[#27272e] rounded-xl px-4 py-2.5 text-sm text-[#f5f5f7] focus:outline-none focus:border-cyan-400/50 [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#a1a1aa] mb-1.5">Date de fin</label>
              <input
                type="datetime-local"
                className="w-full bg-[#1c1c21] border border-[#27272e] rounded-xl px-4 py-2.5 text-sm text-[#f5f5f7] focus:outline-none focus:border-cyan-400/50 [color-scheme:dark]"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#a1a1aa] mb-1.5">Lieu</label>
              <input
                type="text"
                placeholder="Théâtre National"
                className="w-full bg-[#1c1c21] border border-[#27272e] rounded-xl px-4 py-2.5 text-sm text-[#f5f5f7] placeholder:text-[#71717a] focus:outline-none focus:border-cyan-400/50"
              />
            </div>
            <div>
              <label className="block text-sm text-[#a1a1aa] mb-1.5">Scène</label>
              <input
                type="text"
                placeholder="Grande Salle"
                className="w-full bg-[#1c1c21] border border-[#27272e] rounded-xl px-4 py-2.5 text-sm text-[#f5f5f7] placeholder:text-[#71717a] focus:outline-none focus:border-cyan-400/50"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-[#a1a1aa] mb-1.5">Statut</label>
            <select className="w-full bg-[#1c1c21] border border-[#27272e] rounded-xl px-4 py-2.5 text-sm text-[#f5f5f7] focus:outline-none focus:border-cyan-400/50 [color-scheme:dark]">
              <option value="planning">Planification</option>
              <option value="setup">Installation</option>
              <option value="running">En cours</option>
              <option value="strike">Démontage</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={onClose}>
              Annuler
            </Button>
            <Button variant="primary" onClick={onClose}>
              <CheckCircle2 size={16} />
              Créer l'événement
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
