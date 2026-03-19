import { useAuth } from '@/contexts/AuthContext';

export function useRole() {
  const { user } = useAuth();
  const role = user?.role ?? null;
  const isRG = role === 'rg';

  return {
    role,
    isRG,
    canManageTeam: isRG,
    canDeleteRecords: isRG,
  };
}

