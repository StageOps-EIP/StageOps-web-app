import type { Equipment } from '@/lib/types';
import { mockEquipment } from '@/lib/mockData';

// Stub — replace with fetch('/api/equipment') when backend ready
export async function getEquipment(): Promise<Equipment[]> {
  return Promise.resolve([...mockEquipment]);
}

export async function updateEquipment(id: string, patch: Partial<Equipment>): Promise<Equipment> {
  const item = mockEquipment.find((e) => e.id === id);
  if (!item) throw new Error(`Équipement introuvable: ${id}`);
  return Promise.resolve({ ...item, ...patch });
}

export async function createEquipment(data: Omit<Equipment, 'id'>): Promise<Equipment> {
  const newItem: Equipment = { ...data, id: `eq-${Date.now()}` };
  return Promise.resolve(newItem);
}
