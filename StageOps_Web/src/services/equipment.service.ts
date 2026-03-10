import type { Equipment } from '@/lib/types';
import { request } from '@/lib/api';

function parseEquipment(raw: unknown): Equipment {
  const r = raw as Record<string, unknown>;
  return {
    ...r,
    lastCheck: r.lastCheck ? new Date(r.lastCheck as string) : undefined,
  } as Equipment;
}

export async function getEquipment(): Promise<Equipment[]> {
  const items = await request<unknown[]>('/api/equipment/');
  return items.map(parseEquipment);
}

export async function createEquipment(data: Omit<Equipment, 'id'>): Promise<Equipment> {
  const raw = await request<unknown>('/api/equipment/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return parseEquipment(raw);
}

export async function updateEquipment(id: string, patch: Partial<Equipment>): Promise<Equipment> {
  const raw = await request<unknown>(`/api/equipment/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
  return parseEquipment(raw);
}

export async function deleteEquipment(id: string): Promise<void> {
  await request<void>(`/api/equipment/${id}`, { method: 'DELETE' });
}
