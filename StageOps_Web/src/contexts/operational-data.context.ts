import { createContext } from 'react'
import type { Equipment, Incident } from '@/lib/types'

export interface OperationalDataContextValue {
  equipment: Equipment[]
  incidents: Incident[]
  addEquipment: (equipment: Equipment) => void
  updateEquipment: (equipment: Equipment) => void
  addIncident: (incident: Incident) => void
  updateIncident: (id: string, patch: Partial<Incident>) => void
}

export const OperationalDataContext = createContext<OperationalDataContextValue | null>(null)
