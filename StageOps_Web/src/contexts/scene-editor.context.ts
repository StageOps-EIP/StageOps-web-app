import { createContext } from 'react'
import type { SceneCommands, SceneSnapshot } from '../application/scene-store'

export type SceneEditorContextValue = SceneSnapshot & SceneCommands

export const SceneEditorContext = createContext<SceneEditorContextValue | null>(null)
