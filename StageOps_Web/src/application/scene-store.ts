import type {
  LightType,
  ObjectType,
  RenderingSettings,
  SceneMaterial,
  SurfaceKey,
  TransformMode,
} from '../domain/scene-models.ts'
import { createSceneLight, createSceneObject } from '../domain/scene-models.ts'
import type { SceneRepository } from '../domain/scene-repository.ts'
import {
  createSceneEditorState,
  sceneReducer,
  type SceneAction,
  type SceneEditorState,
  type SceneLightPatch,
  type SceneObjectPatch,
  type SceneSelection,
} from '../domain/scene.ts'

export type SceneIdFactory = (kind: 'obj' | 'light') => string

export interface SceneSnapshot extends SceneEditorState {
  canUndo: boolean
  canRedo: boolean
  persistenceIssue: string | null
}

const INVALID_ISSUE =
  'La scène enregistrée est illisible. Elle est conservée telle quelle ; les changements de cette session ne seront pas enregistrés.'
const UNAVAILABLE_ISSUE =
  'Le stockage local est indisponible. Les changements de la scène peuvent être perdus au rechargement.'
const SAVE_FAILED_ISSUE =
  'La sauvegarde de la scène a échoué. Gardez cette page ouverte et exportez une capture avant de recharger.'

export function createSceneStore(repository: SceneRepository, createId: SceneIdFactory) {
  const loaded = repository.load()
  let state = createSceneEditorState(loaded.scene)
  let persistenceIssue =
    loaded.status === 'invalid'
      ? INVALID_ISSUE
      : loaded.status === 'unavailable'
        ? UNAVAILABLE_ISSUE
        : null
  let snapshot = toSnapshot()
  const listeners = new Set<() => void>()

  function toSnapshot(): SceneSnapshot {
    return {
      ...state,
      canUndo: state.history.past.length > 0,
      canRedo: state.history.future.length > 0,
      persistenceIssue,
    }
  }
  function dispatch(action: SceneAction) {
    const next = sceneReducer(state, action)
    if (next === state) return
    // Selection, tool mode and gesture boundaries are session state: only the scene is saved.
    if (next.scene !== state.scene && loaded.status !== 'invalid') {
      persistenceIssue = repository.save(next.scene).ok ? null : SAVE_FAILED_ISSUE
    }
    state = next
    snapshot = toSnapshot()
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
      select: (selection: SceneSelection) => dispatch({ type: 'selection/changed', selection }),
      clearSelection: () => dispatch({ type: 'selection/changed', selection: null }),
      setTransformMode: (mode: TransformMode) => dispatch({ type: 'transform-mode/changed', mode }),
      addObject: (type: ObjectType) =>
        dispatch({ type: 'object/added', object: createSceneObject(type, createId('obj')) }),
      updateObject: (id: string, patch: SceneObjectPatch) =>
        dispatch({ type: 'object/updated', id, patch }),
      deleteObject: (id: string) => dispatch({ type: 'object/deleted', id }),
      duplicateObject: (id: string) =>
        dispatch({ type: 'object/duplicated', id, copyId: createId('obj') }),
      addLight: (type: LightType) =>
        dispatch({ type: 'light/added', light: createSceneLight(type, createId('light')) }),
      updateLight: (id: string, patch: SceneLightPatch) =>
        dispatch({ type: 'light/updated', id, patch }),
      deleteLight: (id: string) => dispatch({ type: 'light/deleted', id }),
      updateSurface: (surface: SurfaceKey, patch: Partial<SceneMaterial>) =>
        dispatch({ type: 'surface/updated', surface, patch }),
      applyMaterialToAllSurfaces: (material: SceneMaterial) =>
        dispatch({ type: 'surfaces/material-applied', material }),
      updateRendering: (patch: Partial<RenderingSettings>) =>
        dispatch({ type: 'rendering/updated', patch }),
      beginGesture: () => dispatch({ type: 'gesture/started' }),
      endGesture: () => dispatch({ type: 'gesture/ended' }),
      undo: () => dispatch({ type: 'history/undone' }),
      redo: () => dispatch({ type: 'history/redone' }),
    },
  }
}

export type SceneStore = ReturnType<typeof createSceneStore>
export type SceneCommands = SceneStore['commands']
