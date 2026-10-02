import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { DemoDataContext, type DemoDataContextValue } from './demo-data.context'
import { mockEquipment, mockIncidents } from '@/lib/mockData'
import type { Equipment, Incident } from '@/lib/types'

const STORAGE_KEY = 'stageops.demo.workspace.v1'

const initialIncidents: Incident[] = [
  ...mockIncidents,
  {
    id: 'inc-006',
    title: 'Fuite hydraulique praticable mobile',
    description: 'Fuite détectée au niveau du vérin gauche du praticable mobile. Zone sécurisée.',
    severity: 'critical',
    status: 'open',
    equipmentId: 'eq-005',
    reportedBy: 'Jean Moreau',
    timestamp: new Date('2026-02-11T11:00:00'),
  },
  {
    id: 'inc-007',
    title: 'Câble DMX défaillant perche 3',
    description: 'Signal DMX intermittent sur la perche 3 côté Cour. Câble à remplacer.',
    severity: 'medium',
    status: 'in-progress',
    equipmentId: 'eq-008',
    reportedBy: 'Thomas Dubois',
    timestamp: new Date('2026-02-11T07:30:00'),
  },
  {
    id: 'inc-008',
    title: 'Batterie radio HF faible',
    description: 'Batteries des micros HF tombent sous 30% après 2h. Remplacement préventif.',
    severity: 'low',
    status: 'resolved',
    reportedBy: 'Marie Lambert',
    timestamp: new Date('2026-02-09T20:00:00'),
    resolvedAt: new Date('2026-02-10T08:00:00'),
    resolutionNotes: 'Batteries remplacées. Lot de 12 neuves en stock.',
  },
]

interface StoredDemoData {
  equipment: Array<Omit<Equipment, 'lastCheck'> & { lastCheck?: string }>
  incidents: Array<
    Omit<Incident, 'timestamp' | 'resolvedAt'> & {
      timestamp: string
      resolvedAt?: string
    }
  >
}

function loadStoredData(): { equipment: Equipment[]; incidents: Incident[]; isDirty: boolean } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { equipment: mockEquipment, incidents: initialIncidents, isDirty: false }

    const stored = JSON.parse(raw) as StoredDemoData
    return {
      equipment: stored.equipment.map((item) => ({
        ...item,
        lastCheck: item.lastCheck ? new Date(item.lastCheck) : undefined,
      })),
      incidents: stored.incidents.map((incident) => ({
        ...incident,
        timestamp: new Date(incident.timestamp),
        resolvedAt: incident.resolvedAt ? new Date(incident.resolvedAt) : undefined,
      })),
      isDirty: true,
    }
  } catch {
    return { equipment: mockEquipment, incidents: initialIncidents, isDirty: false }
  }
}

export function DemoDataProvider({ children }: { children: ReactNode }) {
  const stored = useMemo(() => loadStoredData(), [])
  const [equipment, setEquipment] = useState<Equipment[]>(stored.equipment)
  const [incidents, setIncidents] = useState<Incident[]>(stored.incidents)
  const [isDemoDirty, setIsDemoDirty] = useState(stored.isDirty)

  useEffect(() => {
    if (!isDemoDirty) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ equipment, incidents }))
  }, [equipment, incidents, isDemoDirty])

  const addEquipment = useCallback((item: Equipment) => {
    setEquipment((current) => [item, ...current])
    setIsDemoDirty(true)
  }, [])

  const updateEquipment = useCallback((updated: Equipment) => {
    setEquipment((current) => current.map((item) => (item.id === updated.id ? updated : item)))
    setIsDemoDirty(true)
  }, [])

  const addIncident = useCallback((incident: Incident) => {
    setIncidents((current) => [incident, ...current])
    setIsDemoDirty(true)
  }, [])

  const updateIncident = useCallback((id: string, patch: Partial<Incident>) => {
    setIncidents((current) =>
      current.map((incident) => (incident.id === id ? { ...incident, ...patch } : incident)),
    )
    setIsDemoDirty(true)
  }, [])

  const resetDemoData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setEquipment(mockEquipment)
    setIncidents(initialIncidents)
    setIsDemoDirty(false)
  }, [])

  const value = useMemo<DemoDataContextValue>(
    () => ({
      equipment,
      incidents,
      isDemoDirty,
      addEquipment,
      updateEquipment,
      addIncident,
      updateIncident,
      resetDemoData,
    }),
    [
      equipment,
      incidents,
      isDemoDirty,
      addEquipment,
      updateEquipment,
      addIncident,
      updateIncident,
      resetDemoData,
    ],
  )

  return <DemoDataContext.Provider value={value}>{children}</DemoDataContext.Provider>
}
