import type {
  RenderingSettings,
  Scene,
  SceneContent,
  SceneLight,
  SceneMaterial,
  SceneObject,
  SurfaceKey,
  TransformMode,
} from './scene-models.ts'
import { SURFACE_KEYS } from './scene-models.ts'

export type SceneSelection =
  | { kind: 'object'; id: string }
  | { kind: 'light'; id: string }
  | { kind: 'surface'; id: SurfaceKey }
  | null

/**
 * `gesture` groups continuous edits (gizmo drag, slider, typing) into one undo step:
 * - idle: every change is its own step;
 * - open: a gesture started, its first change will record a step;
 * - recorded: the step exists, later changes of the gesture extend it.
 */
export interface SceneHistory {
  past: SceneContent[]
  future: SceneContent[]
  gesture: 'idle' | 'open' | 'recorded'
}

export interface SceneEditorState {
  scene: Scene
  selection: SceneSelection
  transformMode: TransformMode
  history: SceneHistory
}

export const HISTORY_LIMIT = 50

export type SceneObjectPatch = Partial<Omit<SceneObject, 'id'>>
export type SceneLightPatch = Partial<Omit<SceneLight, 'id'>>

export type SceneAction =
  | { type: 'selection/changed'; selection: SceneSelection }
  | { type: 'transform-mode/changed'; mode: TransformMode }
  | { type: 'object/added'; object: SceneObject }
  | { type: 'object/updated'; id: string; patch: SceneObjectPatch }
  | { type: 'object/deleted'; id: string }
  | { type: 'object/duplicated'; id: string; copyId: string }
  | { type: 'light/added'; light: SceneLight }
  | { type: 'light/updated'; id: string; patch: SceneLightPatch }
  | { type: 'light/deleted'; id: string }
  | { type: 'surface/updated'; surface: SurfaceKey; patch: Partial<SceneMaterial> }
  | { type: 'surfaces/material-applied'; material: SceneMaterial }
  | { type: 'rendering/updated'; patch: Partial<RenderingSettings> }
  | { type: 'gesture/started' }
  | { type: 'gesture/ended' }
  | { type: 'history/undone' }
  | { type: 'history/redone' }

export function createSceneEditorState(scene: Scene): SceneEditorState {
  return {
    scene,
    selection: null,
    transformMode: 'translate',
    history: { past: [], future: [], gesture: 'idle' },
  }
}

function isEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false
  if (Array.isArray(a) !== Array.isArray(b)) return false
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  return (
    keysA.length === keysB.length &&
    keysA.every((key) =>
      isEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]),
    )
  )
}

/** Applies a patch; returns the same reference when nothing actually changes. */
function patched<T extends object>(item: T, patch: Partial<T>): T {
  const changed = (Object.keys(patch) as (keyof T)[]).some(
    (key) => patch[key] !== undefined && !isEqual(item[key], patch[key]),
  )
  return changed ? { ...item, ...patch } : item
}

function replaceById<T extends { id: string }>(
  items: T[],
  id: string,
  patch: Partial<Omit<T, 'id'>>,
): T[] {
  let changed = false
  const next = items.map((item) => {
    if (item.id !== id) return item
    const updated = patched(item, patch as Partial<T>)
    changed ||= updated !== item
    return updated
  })
  return changed ? next : items
}

function contentOf(scene: Scene): SceneContent {
  return { objects: scene.objects, lights: scene.lights, surfaces: scene.surfaces }
}

function validSelection(selection: SceneSelection, content: SceneContent): SceneSelection {
  if (selection?.kind === 'object')
    return content.objects.some((item) => item.id === selection.id) ? selection : null
  if (selection?.kind === 'light')
    return content.lights.some((item) => item.id === selection.id) ? selection : null
  return selection
}

/** Records an undo step (unless the current gesture already has one) and applies new content. */
function edit(
  state: SceneEditorState,
  next: SceneContent,
  selection: SceneSelection = state.selection,
): SceneEditorState {
  const current = contentOf(state.scene)
  if (
    next.objects === current.objects &&
    next.lights === current.lights &&
    next.surfaces === current.surfaces
  )
    return state
  const { history } = state
  const record = history.gesture !== 'recorded'
  return {
    ...state,
    scene: { ...state.scene, ...next },
    selection: validSelection(selection, next),
    history: {
      past: record ? [...history.past, current].slice(-HISTORY_LIMIT) : history.past,
      future: [],
      gesture: history.gesture === 'idle' ? 'idle' : 'recorded',
    },
  }
}

export function sceneReducer(state: SceneEditorState, action: SceneAction): SceneEditorState {
  const { scene } = state
  const content = contentOf(scene)
  switch (action.type) {
    case 'selection/changed': {
      const selection = validSelection(action.selection, content)
      return isEqual(selection, state.selection) ? state : { ...state, selection }
    }
    case 'transform-mode/changed':
      return action.mode === state.transformMode ? state : { ...state, transformMode: action.mode }
    case 'object/added':
      if (scene.objects.some((item) => item.id === action.object.id)) return state
      return edit(state, { ...content, objects: [...scene.objects, action.object] })
    case 'object/updated':
      return edit(state, {
        ...content,
        objects: replaceById(scene.objects, action.id, action.patch),
      })
    case 'object/deleted':
      if (!scene.objects.some((item) => item.id === action.id)) return state
      return edit(state, {
        ...content,
        objects: scene.objects.filter((item) => item.id !== action.id),
      })
    case 'object/duplicated': {
      const original = scene.objects.find((item) => item.id === action.id)
      if (!original || scene.objects.some((item) => item.id === action.copyId)) return state
      const [x, y, z] = original.position
      const copy: SceneObject = {
        ...structuredClone(original),
        id: action.copyId,
        name: `${original.name} (copie)`,
        position: [x + 1, y, z + 1],
      }
      return edit(
        state,
        { ...content, objects: [...scene.objects, copy] },
        {
          kind: 'object',
          id: copy.id,
        },
      )
    }
    case 'light/added':
      if (scene.lights.some((item) => item.id === action.light.id)) return state
      return edit(state, { ...content, lights: [...scene.lights, action.light] })
    case 'light/updated':
      return edit(state, { ...content, lights: replaceById(scene.lights, action.id, action.patch) })
    case 'light/deleted':
      if (!scene.lights.some((item) => item.id === action.id)) return state
      return edit(state, {
        ...content,
        lights: scene.lights.filter((item) => item.id !== action.id),
      })
    case 'surface/updated': {
      const material = patched(scene.surfaces[action.surface], action.patch)
      if (material === scene.surfaces[action.surface]) return state
      return edit(state, {
        ...content,
        surfaces: { ...scene.surfaces, [action.surface]: material },
      })
    }
    case 'surfaces/material-applied': {
      if (SURFACE_KEYS.every((key) => isEqual(scene.surfaces[key], action.material))) return state
      const surfaces = { ...scene.surfaces }
      for (const key of SURFACE_KEYS) surfaces[key] = { ...action.material }
      return edit(state, { ...content, surfaces })
    }
    case 'rendering/updated': {
      // Display preferences are saved but are not part of the undo history.
      const rendering = patched(scene.rendering, action.patch)
      return rendering === scene.rendering ? state : { ...state, scene: { ...scene, rendering } }
    }
    case 'gesture/started':
      // A new gesture always starts a new step, even if the previous one was not closed.
      return state.history.gesture === 'open'
        ? state
        : { ...state, history: { ...state.history, gesture: 'open' } }
    case 'gesture/ended':
      return state.history.gesture === 'idle'
        ? state
        : { ...state, history: { ...state.history, gesture: 'idle' } }
    case 'history/undone': {
      const previous = state.history.past.at(-1)
      if (!previous) return state
      return {
        ...state,
        scene: { ...scene, ...previous },
        selection: validSelection(state.selection, previous),
        history: {
          past: state.history.past.slice(0, -1),
          future: [content, ...state.history.future],
          gesture: 'idle',
        },
      }
    }
    case 'history/redone': {
      const [next, ...future] = state.history.future
      if (!next) return state
      return {
        ...state,
        scene: { ...scene, ...next },
        selection: validSelection(state.selection, next),
        history: {
          past: [...state.history.past, content].slice(-HISTORY_LIMIT),
          future,
          gesture: 'idle',
        },
      }
    }
    default:
      return state
  }
}
