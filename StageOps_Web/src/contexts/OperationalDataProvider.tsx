import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  OperationalDataContext,
  type OperationalDataContextValue,
} from './operational-data.context'
import { mockEquipment, mockIncidents } from '@/lib/mockData'
import type { Equipment, Incident } from '@/lib/types'

const STORAGE_KEY = 'stageops.workspace.v1'
const LEGACY_STORAGE_KEY = 'stageops.demo.workspace.v1'

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

interface StoredOperationalData {
  equipment: Array<Omit<Equipment, 'lastCheck'> & { lastCheck?: string }>
  incidents: Array<
    Omit<Incident, 'timestamp' | 'resolvedAt'> & {
      timestamp: string
      resolvedAt?: string
    }
  >
}

function loadStoredData(): { equipment: Equipment[]; incidents: Incident[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!raw) return { equipment: mockEquipment, incidents: initialIncidents }

    const stored = JSON.parse(raw) as StoredOperationalData
    return {
      equipment: stored.equipment.map((item) => ({
        ...item,
        lastCheck: item.lastCheck ? new Date(item.lastCheck) : undefined,
      })),
      incidents: stored.incidents
        .filter((incident) => incident.title !== 'Test persistance démo')
        .map((incident) => ({
          ...incident,
          timestamp: new Date(incident.timestamp),
          resolvedAt: incident.resolvedAt ? new Date(incident.resolvedAt) : undefined,
        })),
    }
  } catch {
    return { equipment: mockEquipment, incidents: initialIncidents }
  }
}

export function OperationalDataProvider({ children }: { children: ReactNode }) {
  const stored = useMemo(() => loadStoredData(), [])
  const [equipment, setEquipment] = useState<Equipment[]>(stored.equipment)
  const [incidents, setIncidents] = useState<Incident[]>(stored.incidents)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ equipment, incidents }))
    localStorage.removeItem(LEGACY_STORAGE_KEY)
  }, [equipment, incidents])

  const addEquipment = useCallback((item: Equipment) => {
    setEquipment((current) => [item, ...current])
  }, [])

  const updateEquipment = useCallback((updated: Equipment) => {
    setEquipment((current) => current.map((item) => (item.id === updated.id ? updated : item)))
  }, [])

  const addIncident = useCallback((incident: Incident) => {
    setIncidents((current) => [incident, ...current])
    if (incident.equipmentId && incident.status !== 'resolved') {
      setEquipment((current) =>
        current.map((item) =>
          item.id === incident.equipmentId && item.status === 'ok'
            ? { ...item, status: 'to-check' }
            : item,
        ),
      )
    }
  }, [])

  const updateIncident = useCallback((id: string, patch: Partial<Incident>) => {
    setIncidents((current) => {
      const updated = current.map((incident) =>
        incident.id === id ? { ...incident, ...patch } : incident,
      )
      const target = updated.find((incident) => incident.id === id)

      if (target?.equipmentId && patch.status) {
        const hasAnotherActiveIncident = updated.some(
          (incident) =>
            incident.id !== id &&
            incident.equipmentId === target.equipmentId &&
            incident.status !== 'resolved',
        )
        setEquipment((items) =>
          items.map((item) => {
            if (item.id !== target.equipmentId) return item
            if (patch.status !== 'resolved') return { ...item, status: 'to-check' }
            return hasAnotherActiveIncident ? item : { ...item, status: 'ok' }
          }),
        )
      }

      return updated
    })
  }, [])

  const value = useMemo<OperationalDataContextValue>(
    () => ({
      equipment,
      incidents,
      addEquipment,
      updateEquipment,
      addIncident,
      updateIncident,
    }),
    [equipment, incidents, addEquipment, updateEquipment, addIncident, updateIncident],
  )

  return <OperationalDataContext.Provider value={value}>{children}</OperationalDataContext.Provider>
}
