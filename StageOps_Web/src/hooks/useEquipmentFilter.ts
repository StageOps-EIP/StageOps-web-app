import { useState, useMemo } from 'react';
import type { Equipment } from '@/lib/types';

export function useEquipmentFilter(equipment: Equipment[]) {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = useMemo(() => {
    return equipment.filter((eq) => {
      const matchesSearch =
        search === '' ||
        eq.name.toLowerCase().includes(search.toLowerCase()) ||
        eq.location.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = filterCategory === 'all' || eq.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || eq.status === filterStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [equipment, search, filterCategory, filterStatus]);

  return { search, setSearch, filterCategory, setFilterCategory, filterStatus, setFilterStatus, filtered };
}
