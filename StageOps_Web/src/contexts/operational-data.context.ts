import { createContext } from 'react'
import type { Equipment, Incident } from '@/lib/types'

export interface OperationalDataContextValue {
  equipment: Equipment[]
  incidents: Incident[]
  persistenceIssue: string | null
  addEquipment: (equipment: Equipment) => void
  updateEquipment: (equipment: Equipment) => void
  addIncident: (incident: Incident) => void
  updateIncident: (id: string, patch: Partial<Omit<Incident, 'id'>>) => void
}

export const OperationalDataContext = createContext<OperationalDataContextValue | null>(null)
