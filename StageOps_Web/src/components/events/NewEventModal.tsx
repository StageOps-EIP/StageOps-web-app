import { useEffect, useState } from 'react';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { X, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import type { Event } from '@/lib/types';
import { createEvent } from '@/services/events.service';

type NewEventStatus = 'planning' | 'setup' | 'running' | 'strike';

export function NewEventModal({ onClose, onAdd }: { onClose: () => void; onAdd: (event: Event) => void }) {
  const trapRef = useFocusTrap(true);
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [venue, setVenue] = useState('');
  const [stage, setStage] = useState('');
  const [status, setStatus] = useState<NewEventStatus>('planning');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleCreate() {
    if (!title.trim()) {
      return;
    }

    const createdEvent = await createEvent({
      title: title.trim(),
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : (startDate ? new Date(startDate) : new Date()),
      venue: venue.trim(),
      stage: stage.trim(),
      status,
      checklistProgress: 0,
      equipmentIds: [],
      teamMembers: [],
    });

    onAdd(createdEvent);
    onClose();
  }

  return (
    <div
      ref={trapRef}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div role="dialog" aria-modal="true" aria-labelledby="new-event-title" className="w-full max-w-lg">
      <Card className="relative">
        <button
          aria-label="Fermer"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-theme-border text-content-subtle hover:text-content-primary transition-colors"
        >
          <X size={16} />
        </button>
        <h2 id="new-event-title" className="text-xl text-content-primary mb-6">Nouvel événement</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="event-title" className="block text-sm text-content-muted mb-1.5">Titre</label>
              <input
                id="event-title"
                type="text"
                placeholder="Ex: Carmen - Répétition Générale"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-theme-elevated border border-theme-border rounded-xl px-4 py-2.5 text-sm text-content-primary placeholder:text-content-subtle focus:outline-none focus:border-cyan-400/50"
              />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="event-start" className="block text-sm text-content-muted mb-1.5">Date de début</label>
              <input
                id="event-start"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-theme-elevated border border-theme-border rounded-xl px-4 py-2.5 text-sm text-content-primary focus:outline-none focus:border-cyan-400/50 [color-scheme:dark]"
              />
            </div>
            <div>
              <label htmlFor="event-end" className="block text-sm text-content-muted mb-1.5">Date de fin</label>
              <input
                id="event-end"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-theme-elevated border border-theme-border rounded-xl px-4 py-2.5 text-sm text-content-primary focus:outline-none focus:border-cyan-400/50 [color-scheme:dark]"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="event-venue" className="block text-sm text-content-muted mb-1.5">Lieu</label>
              <input
                id="event-venue"
                type="text"
                placeholder="Théâtre National"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full bg-theme-elevated border border-theme-border rounded-xl px-4 py-2.5 text-sm text-content-primary placeholder:text-content-subtle focus:outline-none focus:border-cyan-400/50"
              />
            </div>
            <div>
              <label htmlFor="event-stage" className="block text-sm text-content-muted mb-1.5">Scène</label>
              <input
                id="event-stage"
                type="text"
                placeholder="Grande Salle"
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full bg-theme-elevated border border-theme-border rounded-xl px-4 py-2.5 text-sm text-content-primary placeholder:text-content-subtle focus:outline-none focus:border-cyan-400/50"
              />
            </div>
          </div>
          <div>
            <label htmlFor="event-status" className="block text-sm text-content-muted mb-1.5">Statut</label>
            <div className="relative">
              <select
                id="event-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as NewEventStatus)}
                className="w-full px-4 py-2.5 bg-theme-elevated border border-theme-border rounded-xl text-content-primary text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent cursor-pointer hover:border-[#52525b] transition-colors appearance-none pr-9 [color-scheme:dark]">
                <option value="planning">Planification</option>
                <option value="setup">Installation</option>
                <option value="running">En cours</option>
                <option value="strike">Démontage</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-content-subtle pointer-events-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={onClose}>
              Annuler
            </Button>
            <Button variant="primary" onClick={() => void handleCreate()}>
              <CheckCircle2 size={16} />
              Créer l'événement
            </Button>
          </div>
        </div>
      </Card>
      </div>
    </div>
  );
}
