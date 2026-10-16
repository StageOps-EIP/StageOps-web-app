import { useMemo, useSyncExternalStore, type ReactNode } from 'react'
import { SceneEditorContext } from './scene-editor.context'
import type { SceneStore } from '../application/scene-store'

export function SceneEditorProvider({
  children,
  store,
}: {
  children: ReactNode
  store: SceneStore
}) {
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot)
  const value = useMemo(() => ({ ...snapshot, ...store.commands }), [snapshot, store])
  return <SceneEditorContext.Provider value={value}>{children}</SceneEditorContext.Provider>
}
