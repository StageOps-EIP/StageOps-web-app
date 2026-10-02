import { createContext } from 'react'
import type { Equipment, Incident } from '@/lib/types'

export interface DemoDataContextValue {
  equipment: Equipment[]
  incidents: Incident[]
  isDemoDirty: boolean
  addEquipment: (equipment: Equipment) => void
  updateEquipment: (equipment: Equipment) => void
  addIncident: (incident: Incident) => void
  updateIncident: (id: string, patch: Partial<Incident>) => void
  resetDemoData: () => void
}

export const DemoDataContext = createContext<DemoDataContextValue | null>(null)
