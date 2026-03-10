import { useState, useMemo } from 'react';
import type { TeamMember } from '@/lib/types';

export function useTeamFilter(members: TeamMember[]) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return members;
    const q = search.toLowerCase();
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q),
    );
  }, [members, search]);

  return { search, setSearch, filtered };
}
