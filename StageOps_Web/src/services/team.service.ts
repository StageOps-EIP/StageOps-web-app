import type { TeamMember } from '@/lib/types';
import { mockTeamMembers } from '@/lib/mockData';

export async function getTeamMembers(): Promise<TeamMember[]> {
  return Promise.resolve([...mockTeamMembers]);
}

export async function updateTeamMember(id: string, patch: Partial<TeamMember>): Promise<TeamMember> {
  const item = mockTeamMembers.find((m) => m.id === id);
  if (!item) throw new Error(`Membre introuvable: ${id}`);
  return Promise.resolve({ ...item, ...patch });
}
