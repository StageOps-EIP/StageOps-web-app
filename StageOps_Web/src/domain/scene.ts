import type {
  Cue,
  Keyframe,
  RenderingSettings,
  Scene,
  SceneContent,
  SceneLight,
  SceneMaterial,
  SceneObject,
  SurfaceKey,
  Timeline,
  TransformMode,
  Transition,
} from './scene-models.ts'
import { SURFACE_KEYS } from './scene-models.ts'
import {
  cueAt,
  defaultTransition,
  isSameTarget,
  keyframeFor,
  nextCueNumber,
  roundCueTime,
  splitAnimatedPatch,
  type TimelineTarget,
} from './timeline.ts'

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

/** Décor edits the base set-up; Conduite records changes in the cue at the current time. */
export type EditorMode = 'decor' | 'conduite'

export interface SceneEditorState {
  scene: Scene
  selection: SceneSelection
  transformMode: TransformMode
  mode: EditorMode
  history: SceneHistory
}

/** Where a change made in Conduite mode is recorded; the id is used if a cue must be created. */
export interface TimelinePosition {
  time: number
  newCueId: string
}

export const HISTORY_LIMIT = 50

export type SceneObjectPatch = Partial<Omit<SceneObject, 'id'>>
export type SceneLightPatch = Partial<Omit<SceneLight, 'id'>>

export type SceneAction =
  | { type: 'selection/changed'; selection: SceneSelection }
  | { type: 'transform-mode/changed'; mode: TransformMode }
  | { type: 'object/added'; object: SceneObject }
  | { type: 'mode/changed'; mode: EditorMode }
  | { type: 'object/updated'; id: string; patch: SceneObjectPatch; at?: TimelinePosition }
  | { type: 'object/deleted'; id: string }
  | { type: 'object/duplicated'; id: string; copyId: string }
  | { type: 'light/added'; light: SceneLight }
  | { type: 'light/updated'; id: string; patch: SceneLightPatch; at?: TimelinePosition }
  | { type: 'light/deleted'; id: string }
  | { type: 'surface/updated'; surface: SurfaceKey; patch: Partial<SceneMaterial> }
  | { type: 'surfaces/material-applied'; material: SceneMaterial }
  | { type: 'rendering/updated'; patch: Partial<RenderingSettings> }
  | { type: 'cue/added'; cue: Cue }
  | { type: 'cue/updated'; id: string; patch: Partial<Omit<Cue, 'id'>> }
  | { type: 'cue/deleted'; id: string }
  | {
      type: 'keyframe/transition-changed'
      cueId: string
      target: TimelineTarget
      transition: Transition
    }
  | { type: 'keyframe/deleted'; cueId: string; target: TimelineTarget }
  | { type: 'gesture/started' }
  | { type: 'gesture/ended' }
  | { type: 'history/undone' }
  | { type: 'history/redone' }

export function createSceneEditorState(scene: Scene): SceneEditorState {
  return {
    scene,
    selection: null,
    transformMode: 'translate',
    mode: 'decor',
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
  return {
    objects: scene.objects,
    lights: scene.lights,
    surfaces: scene.surfaces,
    timeline: scene.timeline,
  }
}

function withoutTarget(timeline: Timeline, target: TimelineTarget): Timeline {
  const keyframes = timeline.keyframes.filter((frame) => !isSameTarget(frame, target))
  return keyframes.length === timeline.keyframes.length ? timeline : { ...timeline, keyframes }
}

/**
 * Records the animated part of a patch in the cue at `at.time` (creating the cue if none is
 * there) and applies the rest to the base set-up.
 */
function editAt<T extends SceneObject | SceneLight>(
  content: SceneContent,
  items: T[],
  kind: TimelineTarget['kind'],
  id: string,
  patch: Partial<Omit<T, 'id'>>,
  at: TimelinePosition,
): { items: T[]; timeline: Timeline } {
  if (!items.some((item) => item.id === id)) return { items, timeline: content.timeline }
  const { animated, base } = splitAnimatedPatch(patch, kind)
  const nextItems = replaceById(items, id, base)
  if (Object.keys(animated).length === 0) return { items: nextItems, timeline: content.timeline }

  const target = { kind, id }
  const time = roundCueTime(at.time)
  let timeline = content.timeline
  let cue = cueAt(timeline, time)
  if (!cue) {
    cue = {
      id: at.newCueId,
      number: nextCueNumber(timeline.cues, time),
      time,
      label: 'Nouveau moment',
      note: '',
    }
    timeline = { ...timeline, cues: [...timeline.cues, cue] }
  }
  const existing = keyframeFor(timeline, cue.id, target)
  if (existing) {
    const values = patched(existing.values as Record<string, unknown>, animated)
    if (values === existing.values) return { items: nextItems, timeline: content.timeline }
    timeline = {
      ...timeline,
      keyframes: timeline.keyframes.map((frame) =>
        frame === existing ? ({ ...frame, values } as Keyframe) : frame,
      ),
    }
  } else {
    timeline = {
      ...timeline,
      keyframes: [
        ...timeline.keyframes,
        {
          cueId: cue.id,
          targetKind: kind,
          targetId: id,
          transition: defaultTransition(kind),
          values: animated,
        } as Keyframe,
      ],
    }
  }
  return { items: nextItems, timeline }
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
    next.surfaces === current.surfaces &&
    next.timeline === current.timeline
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
    case 'mode/changed':
      return action.mode === state.mode ? state : { ...state, mode: action.mode }
    case 'object/updated': {
      if (!action.at)
        return edit(state, {
          ...content,
          objects: replaceById(scene.objects, action.id, action.patch),
        })
      const result = editAt(content, scene.objects, 'object', action.id, action.patch, action.at)
      return edit(state, { ...content, objects: result.items, timeline: result.timeline })
    }
    case 'object/deleted':
      if (!scene.objects.some((item) => item.id === action.id)) return state
      return edit(state, {
        ...content,
        objects: scene.objects.filter((item) => item.id !== action.id),
        timeline: withoutTarget(scene.timeline, { kind: 'object', id: action.id }),
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
    case 'light/updated': {
      if (!action.at)
        return edit(state, {
          ...content,
          lights: replaceById(scene.lights, action.id, action.patch),
        })
      const result = editAt(content, scene.lights, 'light', action.id, action.patch, action.at)
      return edit(state, { ...content, lights: result.items, timeline: result.timeline })
    }
    case 'light/deleted':
      if (!scene.lights.some((item) => item.id === action.id)) return state
      return edit(state, {
        ...content,
        lights: scene.lights.filter((item) => item.id !== action.id),
        timeline: withoutTarget(scene.timeline, { kind: 'light', id: action.id }),
      })
    case 'cue/added':
      if (scene.timeline.cues.some((cue) => cue.id === action.cue.id)) return state
      return edit(state, {
        ...content,
        timeline: {
          ...scene.timeline,
          cues: [...scene.timeline.cues, { ...action.cue, time: roundCueTime(action.cue.time) }],
        },
      })
    case 'cue/updated': {
      const patch =
        action.patch.time === undefined
          ? action.patch
          : { ...action.patch, time: roundCueTime(action.patch.time) }
      const cues = replaceById(scene.timeline.cues, action.id, patch)
      return cues === scene.timeline.cues
        ? state
        : edit(state, { ...content, timeline: { ...scene.timeline, cues } })
    }
    case 'cue/deleted':
      if (!scene.timeline.cues.some((cue) => cue.id === action.id)) return state
      return edit(state, {
        ...content,
        timeline: {
          cues: scene.timeline.cues.filter((cue) => cue.id !== action.id),
          keyframes: scene.timeline.keyframes.filter((frame) => frame.cueId !== action.id),
        },
      })
    case 'keyframe/transition-changed': {
      const frame = keyframeFor(scene.timeline, action.cueId, action.target)
      if (!frame || isEqual(frame.transition, action.transition)) return state
      return edit(state, {
        ...content,
        timeline: {
          ...scene.timeline,
          keyframes: scene.timeline.keyframes.map((item) =>
            item === frame ? { ...item, transition: action.transition } : item,
          ),
        },
      })
    }
    case 'keyframe/deleted': {
      const frame = keyframeFor(scene.timeline, action.cueId, action.target)
      if (!frame) return state
      return edit(state, {
        ...content,
        timeline: {
          ...scene.timeline,
          keyframes: scene.timeline.keyframes.filter((item) => item !== frame),
        },
      })
    }
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
