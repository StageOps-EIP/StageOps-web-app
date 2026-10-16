import type {
  Cue,
  Keyframe,
  SceneContent,
  SceneLight,
  SceneObject,
  Timeline,
  Transition,
} from './scene-models.ts'
import { LIGHT_ANIMATED_KEYS, OBJECT_ANIMATED_KEYS } from './scene-models.ts'

/** Two times closer than this designate the same moment of the show (seconds). */
export const CUE_TIME_TOLERANCE = 0.05

export type TimelineTarget = { kind: 'object' | 'light'; id: string }

export function roundCueTime(time: number): number {
  return Math.max(0, Math.round(time * 10) / 10)
}

export function sortCues(cues: Cue[]): Cue[] {
  return [...cues].sort((a, b) => a.time - b.time || a.number - b.number)
}

export function cueAt(timeline: Timeline, time: number): Cue | undefined {
  return sortCues(timeline.cues).find((cue) => Math.abs(cue.time - time) <= CUE_TIME_TOLERANCE)
}

/** Last cue reached at `time`, i.e. the line of the cue sheet the show is on. */
export function currentCue(timeline: Timeline, time: number): Cue | undefined {
  return sortCues(timeline.cues)
    .filter((cue) => cue.time <= time + CUE_TIME_TOLERANCE)
    .at(-1)
}

/** Number for a cue inserted at `time`: next integer at the end, otherwise between neighbours. */
export function nextCueNumber(cues: Cue[], time: number): number {
  const sorted = sortCues(cues)
  const previous = sorted.filter((cue) => cue.time <= time).at(-1)
  const next = sorted.find((cue) => cue.time > time)
  if (!previous && !next) return 1
  if (!next) return Math.floor(previous!.number) + 1
  if (!previous) return Math.round((next.number / 2) * 100) / 100
  const middle = Math.round(((previous.number + next.number) / 2) * 100) / 100
  return middle > previous.number && middle < next.number ? middle : previous.number + 0.01
}

/** Length of the timeline shown to the user: last cue plus a margin, at least one minute. */
export function timelineDuration(timeline: Timeline): number {
  const last = Math.max(0, ...timeline.cues.map((cue) => cue.time))
  return Math.max(60, Math.ceil((last + 30) / 10) * 10)
}

export function formatShowTime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds))
  const minutes = Math.floor(total / 60)
  const rest = total % 60
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`
}

/** Parses "mm:ss", "m:ss" or a number of seconds; returns null when invalid. */
export function parseShowTime(value: string): number | null {
  const match = /^\s*(?:(\d+):)?(\d+(?:[.,]\d+)?)\s*$/.exec(value)
  if (!match) return null
  const seconds = Number(match[2].replace(',', '.'))
  if (match[1] !== undefined && seconds >= 60) return null
  return (match[1] ? Number(match[1]) * 60 : 0) + seconds
}

export function keyframeFor(
  timeline: Timeline,
  cueId: string,
  target: TimelineTarget,
): Keyframe | undefined {
  return timeline.keyframes.find(
    (frame) =>
      frame.cueId === cueId && frame.targetKind === target.kind && frame.targetId === target.id,
  )
}

export function isSameTarget(frame: Keyframe, target: TimelineTarget): boolean {
  return frame.targetKind === target.kind && frame.targetId === target.id
}

export function defaultTransition(kind: TimelineTarget['kind']): Transition {
  // People and set pieces usually move between two cues; lighting states are cut unless faded.
  return kind === 'object' ? { kind: 'smooth', duration: null } : { kind: 'cut' }
}

/** Splits a patch into the part stored in cues and the part that changes the base set-up. */
export function splitAnimatedPatch<T extends object>(
  patch: T,
  kind: TimelineTarget['kind'],
): { animated: Partial<T>; base: Partial<T> } {
  const keys: readonly string[] = kind === 'object' ? OBJECT_ANIMATED_KEYS : LIGHT_ANIMATED_KEYS
  const animated: Record<string, unknown> = {}
  const base: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue
    if (keys.includes(key)) animated[key] = value
    else base[key] = value
  }
  return { animated: animated as Partial<T>, base: base as Partial<T> }
}

// ─── Evaluation ──────────────────────────────────────────────────────────────

function lerp(a: number, b: number, p: number): number {
  return a + (b - a) * p
}
function mixColor(a: string, b: string, p: number): string {
  const channel = (hex: string, i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16)
  return `#${[0, 1, 2]
    .map((i) =>
      Math.round(lerp(channel(a, i), channel(b, i), p))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`
}
function mixValue(key: string, from: unknown, to: unknown, p: number): unknown {
  if (typeof from === 'number' && typeof to === 'number') return lerp(from, to, p)
  if (Array.isArray(from) && Array.isArray(to))
    return from.map((value, i) => lerp(value as number, to[i] as number, p))
  if (typeof from === 'string' && typeof to === 'string' && key === 'color')
    return mixColor(from, to, p)
  // Discrete values: an element appears when its entrance starts; everything else
  // (disappearing, posture changes) happens when the cue is reached.
  if (key === 'visible' && to === true) return true
  return from
}

interface TrackFrame<V> {
  time: number
  transition: Transition
  values: V
}

/** State of one element at `time`, from its base state and its keyframes sorted by time. */
export function evaluateTrack<T extends object, V extends Partial<T>>(
  base: T,
  frames: TrackFrame<V>[],
  time: number,
): T {
  let value = base
  let previousTime: number | null = null
  for (const frame of frames) {
    if (time >= frame.time - 1e-9) {
      value = { ...value, ...frame.values }
      previousTime = frame.time
      continue
    }
    if (frame.transition.kind === 'smooth') {
      const since = previousTime ?? 0
      const start =
        frame.transition.duration === null
          ? since
          : Math.max(previousTime ?? -Infinity, frame.time - frame.transition.duration)
      if (time > start && frame.time > start) {
        const progress = (time - start) / (frame.time - start)
        const mixed = { ...value } as Record<string, unknown>
        for (const [key, target] of Object.entries(frame.values)) {
          if (target === undefined) continue
          mixed[key] = mixValue(key, (value as Record<string, unknown>)[key], target, progress)
        }
        value = mixed as T
      }
    }
    break
  }
  return value
}

/** Objects and lights as they are at `time` in the show. */
export function evaluateScene(
  content: Pick<SceneContent, 'objects' | 'lights' | 'timeline'>,
  time: number,
): { objects: SceneObject[]; lights: SceneLight[] } {
  const cueTimes = new Map(content.timeline.cues.map((cue) => [cue.id, cue]))
  const tracks = new Map<string, TrackFrame<Keyframe['values']>[]>()
  for (const frame of content.timeline.keyframes) {
    const cue = cueTimes.get(frame.cueId)
    if (!cue) continue
    const key = `${frame.targetKind}:${frame.targetId}`
    const track = tracks.get(key) ?? []
    track.push({ time: cue.time, transition: frame.transition, values: frame.values })
    tracks.set(key, track)
  }
  for (const track of tracks.values()) track.sort((a, b) => a.time - b.time)
  const evaluate = <T extends { id: string }>(kind: string, items: T[]) =>
    items.map((item) => {
      const track = tracks.get(`${kind}:${item.id}`)
      return track ? evaluateTrack(item, track as TrackFrame<Partial<T>>[], time) : item
    })
  return { objects: evaluate('object', content.objects), lights: evaluate('light', content.lights) }
}
