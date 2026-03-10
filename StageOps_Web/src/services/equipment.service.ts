import type { Equipment } from '@/lib/types';

const KEY = 'stageops-equipment';

function load(): Equipment[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]');
  } catch {
    return [];
  }
}

function save(items: Equipment[]): void {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export async function getEquipment(): Promise<Equipment[]> {
  return load();
}

export async function createEquipment(data: Omit<Equipment, 'id'>): Promise<Equipment> {
  const items = load();
  const newItem: Equipment = { ...data, id: `eq-${Date.now()}` };
  save([...items, newItem]);
  return newItem;
}

export async function updateEquipment(id: string, patch: Partial<Equipment>): Promise<Equipment> {
  const items = load();
  const idx = items.findIndex((e) => e.id === id);
  if (idx === -1) throw new Error(`Équipement introuvable: ${id}`);
  const updated = { ...items[idx], ...patch };
  items[idx] = updated;
  save(items);
  return updated;
}

export async function deleteEquipment(id: string): Promise<void> {
  save(load().filter((e) => e.id !== id));
}
