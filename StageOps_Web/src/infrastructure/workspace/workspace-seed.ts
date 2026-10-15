import { mockEquipment, mockIncidents } from '../../lib/mockData'
import type { Incident } from '../../domain/models'
import type { Workspace } from '../../domain/workspace'
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
export function createWorkspaceSeed(): Workspace {
  return structuredClone({ equipment: mockEquipment, incidents: initialIncidents })
}
