import type {
  Cue,
  LightType,
  ObjectType,
  RenderingSettings,
  SceneMaterial,
  SurfaceKey,
  TransformMode,
  Transition,
} from '../domain/scene-models.ts'
import { createSceneLight, createSceneObject } from '../domain/scene-models.ts'
import type { SceneRepository } from '../domain/scene-repository.ts'
import {
  createSceneEditorState,
  sceneReducer,
  type EditorMode,
  type SceneAction,
  type SceneEditorState,
  type SceneLightPatch,
  type SceneObjectPatch,
  type SceneSelection,
} from '../domain/scene.ts'
import {
  currentCue,
  nextCueNumber,
  roundCueTime,
  sortCues,
  timelineDuration,
  CUE_TIME_TOLERANCE,
  type TimelineTarget,
} from '../domain/timeline.ts'

export type SceneIdFactory = (kind: 'obj' | 'light' | 'cue') => string

export interface SceneSnapshot extends SceneEditorState {
  canUndo: boolean
  canRedo: boolean
  persistenceIssue: string | null
}

/**
 * Playback position of the cue sheet. It changes on every animation frame while playing,
 * so it is published on its own channel: panels that only read the scene do not re-render.
 */
export interface PlaybackSnapshot {
  time: number
  playing: boolean
  duration: number
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
  let playback: PlaybackSnapshot = {
    time: 0,
    playing: false,
    duration: timelineDuration(state.scene.timeline),
  }
  const listeners = new Set<() => void>()
  const playbackListeners = new Set<() => void>()

  function toSnapshot(): SceneSnapshot {
    return {
      ...state,
      canUndo: state.history.past.length > 0,
      canRedo: state.history.future.length > 0,
      persistenceIssue,
    }
  }
  function setPlayback(patch: Partial<PlaybackSnapshot>) {
    const next = { ...playback, ...patch }
    next.time = Math.min(Math.max(0, next.time), next.duration)
    if (
      next.time === playback.time &&
      next.playing === playback.playing &&
      next.duration === playback.duration
    )
      return
    playback = next
    for (const listener of playbackListeners) listener()
  }
  function dispatch(action: SceneAction) {
    const next = sceneReducer(state, action)
    if (next === state) return
    // Selection, tool mode and gesture boundaries are session state: only the scene is saved.
    if (next.scene !== state.scene && loaded.status !== 'invalid') {
      persistenceIssue = repository.save(next.scene).ok ? null : SAVE_FAILED_ISSUE
    }
    const timelineChanged = next.scene.timeline !== state.scene.timeline
    state = next
    snapshot = toSnapshot()
    for (const listener of listeners) listener()
    if (timelineChanged) setPlayback({ duration: timelineDuration(next.scene.timeline) })
  }
  /** In Conduite mode, changes are recorded at the current playback time. */
  function position() {
    if (state.mode !== 'conduite') return undefined
    setPlayback({ playing: false })
    return { time: playback.time, newCueId: createId('cue') }
  }
  function play() {
    if (state.mode !== 'conduite') dispatch({ type: 'mode/changed', mode: 'conduite' })
    setPlayback({ playing: true, time: playback.time >= playback.duration ? 0 : playback.time })
  }
  function seekToCue(direction: 1 | -1) {
    const cues = sortCues(state.scene.timeline.cues)
    const target =
      direction === 1
        ? cues.find((cue) => cue.time > playback.time + CUE_TIME_TOLERANCE)
        : cues.filter((cue) => cue.time < playback.time - CUE_TIME_TOLERANCE).at(-1)
    setPlayback({ time: target?.time ?? (direction === 1 ? playback.duration : 0), playing: false })
  }

  return {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    getPlayback: () => playback,
    subscribePlayback(listener: () => void) {
      playbackListeners.add(listener)
      return () => {
        playbackListeners.delete(listener)
      }
    },
    commands: {
      select: (selection: SceneSelection) => dispatch({ type: 'selection/changed', selection }),
      clearSelection: () => dispatch({ type: 'selection/changed', selection: null }),
      setTransformMode: (mode: TransformMode) => dispatch({ type: 'transform-mode/changed', mode }),
      setMode: (mode: EditorMode) => {
        if (mode === 'decor') setPlayback({ playing: false })
        dispatch({ type: 'mode/changed', mode })
      },
      addObject: (type: ObjectType) =>
        dispatch({ type: 'object/added', object: createSceneObject(type, createId('obj')) }),
      updateObject: (id: string, patch: SceneObjectPatch) =>
        dispatch({ type: 'object/updated', id, patch, at: position() }),
      deleteObject: (id: string) => dispatch({ type: 'object/deleted', id }),
      duplicateObject: (id: string) =>
        dispatch({ type: 'object/duplicated', id, copyId: createId('obj') }),
      addLight: (type: LightType) =>
        dispatch({ type: 'light/added', light: createSceneLight(type, createId('light')) }),
      updateLight: (id: string, patch: SceneLightPatch) =>
        dispatch({ type: 'light/updated', id, patch, at: position() }),
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

      // ─── Cue sheet ───────────────────────────────────────────────────────
      /** Adds an empty cue at the current time and returns its id (or the existing one). */
      addCueHere: () => {
        const time = roundCueTime(playback.time)
        const existing = state.scene.timeline.cues.find(
          (cue) => Math.abs(cue.time - time) <= CUE_TIME_TOLERANCE,
        )
        if (existing) return existing.id
        const cue: Cue = {
          id: createId('cue'),
          number: nextCueNumber(state.scene.timeline.cues, time),
          time,
          label: 'Nouveau moment',
          note: '',
        }
        dispatch({ type: 'cue/added', cue })
        return cue.id
      },
      updateCue: (id: string, patch: Partial<Omit<Cue, 'id'>>) =>
        dispatch({ type: 'cue/updated', id, patch }),
      deleteCue: (id: string) => dispatch({ type: 'cue/deleted', id }),
      setTransition: (cueId: string, target: TimelineTarget, transition: Transition) =>
        dispatch({ type: 'keyframe/transition-changed', cueId, target, transition }),
      removeFromCue: (cueId: string, target: TimelineTarget) =>
        dispatch({ type: 'keyframe/deleted', cueId, target }),

      // ─── Playback ────────────────────────────────────────────────────────
      play,
      pause: () => setPlayback({ playing: false }),
      togglePlay: () => (playback.playing ? setPlayback({ playing: false }) : play()),
      seek: (time: number) => setPlayback({ time }),
      /** Moves the playhead by `seconds` while playing; stops at the end of the cue sheet. */
      advance: (seconds: number) => {
        if (!playback.playing) return
        const time = playback.time + seconds
        setPlayback({ time, playing: time < playback.duration })
      },
      goToCue: (id: string) => {
        const cue = state.scene.timeline.cues.find((item) => item.id === id)
        if (cue) setPlayback({ time: cue.time, playing: false })
      },
      nextCue: () => seekToCue(1),
      previousCue: () => seekToCue(-1),
      currentCueId: () => currentCue(state.scene.timeline, playback.time)?.id ?? null,
    },
  }
}

export type SceneStore = ReturnType<typeof createSceneStore>
export type SceneCommands = SceneStore['commands']
