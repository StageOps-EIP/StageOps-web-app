import { Outlet } from 'react-router'
import { SceneEditorProvider } from '../contexts/SceneEditorProvider'
import { createSceneStore } from '../application/scene-store'
import { createDefaultScene } from '../domain/scene-models'
import { createLocalSceneRepository } from '../infrastructure/scene/local-scene.repository'
import { createSceneId } from '../infrastructure/scene/scene-ids'

// Loaded with the first 3D route only, so the entry bundle stays free of scene code.
// One store for the module lifetime: the stage view and the editor share the scene and
// its undo history in memory while navigating between them.
const sceneStore = createSceneStore(
  createLocalSceneRepository(() => window.localStorage, createDefaultScene),
  createSceneId,
)

export function SceneWorkspace() {
  return (
    <SceneEditorProvider store={sceneStore}>
      <Outlet />
    </SceneEditorProvider>
  )
}
