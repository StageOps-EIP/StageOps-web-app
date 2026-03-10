import type { Event } from '@/lib/types';
import { request } from '@/lib/api';

function parseEvent(raw: unknown): Event {
  const r = raw as Record<string, unknown>;
  return {
    ...r,
    startDate: new Date(r.startDate as string),
    endDate: new Date(r.endDate as string),
  } as Event;
}

export async function getEvents(): Promise<Event[]> {
  const items = await request<unknown[]>('/api/events/');
  return items.map(parseEvent);
}

export async function createEvent(data: Omit<Event, 'id'>): Promise<Event> {
  const raw = await request<unknown>('/api/events/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return parseEvent(raw);
}

export async function updateEvent(id: string, patch: Partial<Event>): Promise<Event> {
  const raw = await request<unknown>(`/api/events/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
  return parseEvent(raw);
}

export async function deleteEvent(id: string): Promise<void> {
  await request<void>(`/api/events/${id}`, { method: 'DELETE' });
}
