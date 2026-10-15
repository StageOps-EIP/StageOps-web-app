import type { Equipment, Incident } from '../domain/models.ts'
import type { WorkspaceRepository } from '../domain/workspace-repository.ts'
import { workspaceReducer, type Workspace, type WorkspaceAction } from '../domain/workspace.ts'

export interface WorkspaceSnapshot extends Workspace {
  persistenceIssue: string | null
}
export function createWorkspaceStore(repository: WorkspaceRepository) {
  const loaded = repository.load()
  let snapshot: WorkspaceSnapshot = {
    ...loaded.workspace,
    persistenceIssue:
      loaded.status === 'invalid'
        ? 'Le registre local est illisible. Les données originales sont conservées ; les changements de cette session ne seront pas enregistrés.'
        : loaded.status === 'unavailable'
          ? 'Le stockage local est indisponible. Les changements de cette session peuvent être perdus au rechargement.'
          : null,
  }
  const listeners = new Set<() => void>()
  function dispatch(action: WorkspaceAction) {
    const workspace = workspaceReducer(snapshot, action)
    if (workspace === snapshot) return
    const persistence = loaded.status === 'invalid' ? { ok: false } : repository.save(workspace)
    snapshot = {
      equipment: workspace.equipment,
      incidents: workspace.incidents,
      persistenceIssue:
        loaded.status === 'invalid'
          ? snapshot.persistenceIssue
          : persistence.ok
            ? null
            : 'La sauvegarde locale a échoué. Gardez cette page ouverte et exportez vos données avant de recharger.',
    }
    for (const listener of listeners) listener()
  }
  return {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    commands: {
      addEquipment: (equipment: Equipment) => dispatch({ type: 'equipment/added', equipment }),
      updateEquipment: (equipment: Equipment) => dispatch({ type: 'equipment/updated', equipment }),
      addIncident: (incident: Incident) => dispatch({ type: 'incident/added', incident }),
      updateIncident: (id: string, patch: Partial<Omit<Incident, 'id'>>) =>
        dispatch({ type: 'incident/updated', id, patch }),
    },
  }
}
