import type { Incident } from '@/lib/types';

const KEY = 'stageops-incidents';

function load(): Incident[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]');
  } catch {
    return [];
  }
}

function save(items: Incident[]): void {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export async function getIncidents(): Promise<Incident[]> {
  return load();
}

export async function createIncident(data: Omit<Incident, 'id'>): Promise<Incident> {
  const items = load();
  const newItem: Incident = { ...data, id: `inc-${Date.now()}` };
  save([...items, newItem]);
  return newItem;
}

export async function updateIncident(id: string, patch: Partial<Incident>): Promise<Incident> {
  const items = load();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) throw new Error(`Incident introuvable: ${id}`);
  const updated = { ...items[idx], ...patch };
  items[idx] = updated;
  save(items);
  return updated;
}

export async function deleteIncident(id: string): Promise<void> {
  save(load().filter((i) => i.id !== id));
}
