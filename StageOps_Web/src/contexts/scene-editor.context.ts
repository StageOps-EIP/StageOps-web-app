import { createContext } from 'react'
import type { PlaybackSnapshot, SceneCommands, SceneSnapshot } from '../application/scene-store'

export type SceneEditorContextValue = SceneSnapshot & SceneCommands

export const SceneEditorContext = createContext<SceneEditorContextValue | null>(null)

/** Separate context: it changes on every frame during playback. */
export const ScenePlaybackContext = createContext<PlaybackSnapshot | null>(null)
