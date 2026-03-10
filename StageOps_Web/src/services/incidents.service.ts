import type { Incident } from '@/lib/types';
import { request } from '@/lib/api';

function parseIncident(raw: unknown): Incident {
  const r = raw as Record<string, unknown>;
  return {
    ...r,
    timestamp: new Date(r.timestamp as string),
    resolvedAt: r.resolvedAt ? new Date(r.resolvedAt as string) : undefined,
  } as Incident;
}

export async function getIncidents(): Promise<Incident[]> {
  const items = await request<unknown[]>('/api/incidents/');
  return items.map(parseIncident);
}

export async function createIncident(data: Omit<Incident, 'id'>): Promise<Incident> {
  const raw = await request<unknown>('/api/incidents/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return parseIncident(raw);
}

export async function updateIncident(id: string, patch: Partial<Incident>): Promise<Incident> {
  const raw = await request<unknown>(`/api/incidents/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
  return parseIncident(raw);
}

export async function deleteIncident(id: string): Promise<void> {
  await request<void>(`/api/incidents/${id}`, { method: 'DELETE' });
}
