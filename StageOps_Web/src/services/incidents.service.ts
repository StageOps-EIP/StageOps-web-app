import type { Incident } from '@/lib/types';
import { mockIncidents } from '@/lib/mockData';

export async function getIncidents(): Promise<Incident[]> {
  return Promise.resolve([...mockIncidents]);
}

export async function updateIncident(id: string, patch: Partial<Incident>): Promise<Incident> {
  const item = mockIncidents.find((i) => i.id === id);
  if (!item) throw new Error(`Incident introuvable: ${id}`);
  return Promise.resolve({ ...item, ...patch });
}

export async function createIncident(data: Omit<Incident, 'id'>): Promise<Incident> {
  const newItem: Incident = { ...data, id: `inc-${Date.now()}` };
  return Promise.resolve(newItem);
}
