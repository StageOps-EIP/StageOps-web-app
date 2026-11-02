import { useMemo, useSyncExternalStore, type ReactNode } from 'react'
import { SceneEditorContext, ScenePlaybackContext } from './scene-editor.context'
import type { SceneStore } from '../application/scene-store'

export function SceneEditorProvider({
  children,
  store,
}: {
  children: ReactNode
  store: SceneStore
}) {
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot)
  const playback = useSyncExternalStore(store.subscribePlayback, store.getPlayback)
  const value = useMemo(() => ({ ...snapshot, ...store.commands }), [snapshot, store])
  return (
    <SceneEditorContext.Provider value={value}>
      <ScenePlaybackContext.Provider value={playback}>{children}</ScenePlaybackContext.Provider>
    </SceneEditorContext.Provider>
  )
}
