import type { Incident } from './types'

export const SEVERITY_ORDER: Record<Incident['severity'], number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
}

export function isActiveIncident(incident: Incident): boolean {
  return incident.status === 'open' || incident.status === 'in-progress'
}

export function sortIncidentsForAttention(incidents: Incident[]): Incident[] {
  return [...incidents].sort((a, b) => {
    const activeOrder = Number(isActiveIncident(b)) - Number(isActiveIncident(a))
    return (
      activeOrder ||
      SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] ||
      b.timestamp.getTime() - a.timestamp.getTime()
    )
  })
}
