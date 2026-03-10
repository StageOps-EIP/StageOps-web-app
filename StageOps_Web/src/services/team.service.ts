import type { TeamMember } from '@/lib/types';
import { request } from '@/lib/api';

export async function getTeamMembers(): Promise<TeamMember[]> {
  return request<TeamMember[]>('/api/team/');
}

export async function createTeamMember(data: Omit<TeamMember, 'id'>): Promise<TeamMember> {
  return request<TeamMember>('/api/team/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTeamMember(id: string, patch: Partial<TeamMember>): Promise<TeamMember> {
  return request<TeamMember>(`/api/team/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

export async function deleteTeamMember(id: string): Promise<void> {
  await request<void>(`/api/team/${id}`, { method: 'DELETE' });
}
