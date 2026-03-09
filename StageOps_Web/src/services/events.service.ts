import type { Event } from '@/lib/types';
import { mockEvents } from '@/lib/mockData';

export async function getEvents(): Promise<Event[]> {
  return Promise.resolve([...mockEvents]);
}

export async function createEvent(data: Omit<Event, 'id'>): Promise<Event> {
  const newItem: Event = { ...data, id: `evt-${Date.now()}` };
  return Promise.resolve(newItem);
}
