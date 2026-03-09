import { useState, useMemo } from 'react';
import type { Incident, IncidentStatus } from '@/lib/types';
import { SEVERITY_ORDER } from '@/lib/constants';

export function useIncidentFilter(incidents: Incident[]) {
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const byStatus = useMemo(() => {
    const base =
      severityFilter === 'all'
        ? incidents
        : incidents.filter((i) => i.severity === severityFilter);

    return (status: IncidentStatus) =>
      base
        .filter((i) => i.status === status)
        .sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 99) - (SEVERITY_ORDER[b.severity] ?? 99));
  }, [incidents, severityFilter]);

  return { severityFilter, setSeverityFilter, byStatus };
}
