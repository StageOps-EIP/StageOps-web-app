import { useState, useSyncExternalStore, type ReactNode } from 'react'
import { OperationalDataContext } from './operational-data.context'
import type { WorkspaceRepository } from '../domain/workspace-repository'
import { createWorkspaceStore } from '../application/workspace-store'

export function OperationalDataProvider({
  children,
  repository,
}: {
  children: ReactNode
  repository: WorkspaceRepository
}) {
  const [store] = useState(() => createWorkspaceStore(repository))
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot)
  return (
    <OperationalDataContext.Provider value={{ ...snapshot, ...store.commands }}>
      {children}
    </OperationalDataContext.Provider>
  )
}
