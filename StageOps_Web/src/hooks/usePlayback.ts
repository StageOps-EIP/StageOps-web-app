import { useContext, useMemo } from 'react'
import { ScenePlaybackContext } from '@/contexts/scene-editor.context'
import { evaluateScene } from '@/domain/timeline'
import { useSceneEditor } from './useSceneEditor'

export function usePlayback() {
  const context = useContext(ScenePlaybackContext)
  if (!context) throw new Error('usePlayback doit être utilisé dans SceneEditorProvider')
  return context
}

/**
 * Objects and lights as displayed: the base set-up in Décor mode, the state at the
 * playhead in Conduite mode.
 */
export function useDisplayedScene() {
  const { scene, mode } = useSceneEditor()
  const { time } = usePlayback()
  return useMemo(
    () =>
      mode === 'conduite'
        ? evaluateScene(scene, time)
        : { objects: scene.objects, lights: scene.lights },
    [scene, mode, time],
  )
}
