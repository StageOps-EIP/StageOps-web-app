import type { Event } from '@/lib/types';
import { request } from '@/lib/api';

const INVALID_DATE = new Date(Number.NaN);

function toDate(value: unknown): Date {
  if (value instanceof Date) {
    return new Date(value);
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? new Date(INVALID_DATE) : parsed;
  }

  return new Date(INVALID_DATE);
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

function toEventStatus(value: unknown): Event['status'] {
  if (value === 'planning' || value === 'setup' || value === 'running' || value === 'strike' || value === 'completed') {
    return value;
  }

  return 'planning';
}

function parseEvent(raw: unknown): Event {
  const r = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};

  return {
    id: typeof r.id === 'string' ? r.id : '',
    title: typeof r.title === 'string' ? r.title : '',
    startDate: toDate(r.startDate),
    endDate: toDate(r.endDate),
    venue: typeof r.venue === 'string' ? r.venue : '',
    stage: typeof r.stage === 'string' ? r.stage : '',
    checklistProgress: typeof r.checklistProgress === 'number' ? r.checklistProgress : 0,
    equipmentIds: toStringArray(r.equipmentIds),
    teamMembers: toStringArray(r.teamMembers),
    status: toEventStatus(r.status),
  };
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
