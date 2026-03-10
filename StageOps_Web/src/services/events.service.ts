import type { Event } from '@/lib/types';

const KEY = 'stageops-events';

function load(): Event[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]');
  } catch {
    return [];
  }
}

function save(items: Event[]): void {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export async function getEvents(): Promise<Event[]> {
  return load();
}

export async function createEvent(data: Omit<Event, 'id'>): Promise<Event> {
  const items = load();
  const newItem: Event = { ...data, id: `evt-${Date.now()}` };
  save([...items, newItem]);
  return newItem;
}

export async function updateEvent(id: string, patch: Partial<Event>): Promise<Event> {
  const items = load();
  const idx = items.findIndex((e) => e.id === id);
  if (idx === -1) throw new Error(`Événement introuvable: ${id}`);
  const updated = { ...items[idx], ...patch };
  items[idx] = updated;
  save(items);
  return updated;
}

export async function deleteEvent(id: string): Promise<void> {
  save(load().filter((e) => e.id !== id));
}
