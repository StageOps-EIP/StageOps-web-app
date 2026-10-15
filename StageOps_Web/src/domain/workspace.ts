import type { Equipment, Incident } from './models.ts'

export interface Workspace {
  equipment: Equipment[]
  incidents: Incident[]
}
export type WorkspaceAction =
  | { type: 'equipment/added'; equipment: Equipment }
  | { type: 'equipment/updated'; equipment: Equipment }
  | { type: 'incident/added'; incident: Incident }
  | { type: 'incident/updated'; id: string; patch: Partial<Omit<Incident, 'id'>> }

export function isActiveIncident(incident: Incident): boolean {
  return incident.status === 'open' || incident.status === 'in-progress'
}
function reconcileEquipment(
  equipment: Equipment[],
  before: Incident[],
  after: Incident[],
  affectedIds: Set<string>,
): Equipment[] {
  return equipment.map((item) => {
    if (!affectedIds.has(item.id) || item.status === 'hs' || item.status === 'repair') return item
    const hasActive = after.some(
      (incident) => incident.equipmentId === item.id && isActiveIncident(incident),
    )
    if (hasActive) return item.status === 'ok' ? { ...item, status: 'to-check' } : item
    const hadActive = before.some(
      (incident) => incident.equipmentId === item.id && isActiveIncident(incident),
    )
    return hadActive && item.status === 'to-check' ? { ...item, status: 'ok' } : item
  })
}
// One pure transition updates both registers atomically, without nested React updates.
export function workspaceReducer(state: Workspace, action: WorkspaceAction): Workspace {
  switch (action.type) {
    case 'equipment/added':
      if (state.equipment.some((item) => item.id === action.equipment.id)) return state
      return { ...state, equipment: [action.equipment, ...state.equipment] }
    case 'equipment/updated':
      return {
        ...state,
        equipment: state.equipment.map((item) =>
          item.id === action.equipment.id ? action.equipment : item,
        ),
      }
    case 'incident/added': {
      if (state.incidents.some((item) => item.id === action.incident.id)) return state
      const incidents = [action.incident, ...state.incidents]
      const ids = new Set(action.incident.equipmentId ? [action.incident.equipmentId] : [])
      return {
        incidents,
        equipment: reconcileEquipment(state.equipment, state.incidents, incidents, ids),
      }
    }
    case 'incident/updated': {
      const previous = state.incidents.find((item) => item.id === action.id)
      if (!previous) return state
      const next = { ...previous, ...action.patch, id: previous.id }
      const incidents = state.incidents.map((item) => (item.id === action.id ? next : item))
      const ids = new Set(
        [previous.equipmentId, next.equipmentId].filter((id): id is string => Boolean(id)),
      )
      return {
        incidents,
        equipment: reconcileEquipment(state.equipment, state.incidents, incidents, ids),
      }
    }
  }
}
