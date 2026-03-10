import type { TeamMember } from '@/lib/types';

const KEY = 'stageops-team';

function load(): TeamMember[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]');
  } catch {
    return [];
  }
}

function save(items: TeamMember[]): void {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  return load();
}

export async function createTeamMember(data: Omit<TeamMember, 'id'>): Promise<TeamMember> {
  const items = load();
  const newItem: TeamMember = { ...data, id: `tm-${Date.now()}` };
  save([...items, newItem]);
  return newItem;
}

export async function updateTeamMember(id: string, patch: Partial<TeamMember>): Promise<TeamMember> {
  const items = load();
  const idx = items.findIndex((m) => m.id === id);
  if (idx === -1) throw new Error(`Membre introuvable: ${id}`);
  const updated = { ...items[idx], ...patch };
  items[idx] = updated;
  save(items);
  return updated;
}

export async function deleteTeamMember(id: string): Promise<void> {
  save(load().filter((m) => m.id !== id));
}
