import { useContext } from 'react'
import { SceneEditorContext } from '@/contexts/scene-editor.context'

export function useSceneEditor() {
  const context = useContext(SceneEditorContext)
  if (!context) {
    throw new Error('useSceneEditor doit être utilisé dans SceneEditorProvider')
  }
  return context
}
