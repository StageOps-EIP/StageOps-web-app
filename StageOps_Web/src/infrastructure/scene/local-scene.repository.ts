import type {
  Cue,
  Keyframe,
  LightKeyValues,
  ObjectKeyValues,
  RenderingSettings,
  Scene,
  SceneLight,
  SceneMaterial,
  SceneObject,
  SurfaceMaterials,
  Timeline,
  Transition,
  Vector3,
} from '../../domain/scene-models.ts'
import {
  DEFAULT_RENDERING,
  LIGHT_TYPES,
  MATERIAL_PRESET_KEYS,
  OBJECT_TYPES,
  POSTURES,
  SURFACE_KEYS,
} from '../../domain/scene-models.ts'
import type { SceneRepository } from '../../domain/scene-repository.ts'

export const SCENE_STORAGE_KEY = 'stageops.scene.v1'
/** Key written by the editor before the layered architecture (whole React state). */
export const LEGACY_SCENE_STORAGE_KEY = 'stageops-scene'
type StoragePort = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

function record(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    throw new Error('Invalid object')
  return value as Record<string, unknown>
}
function text(value: unknown): string {
  if (typeof value !== 'string') throw new Error('Invalid string')
  return value
}
function color(value: unknown): string {
  const hex = text(value)
  if (!/^#[0-9a-f]{6}$/i.test(hex)) throw new Error('Invalid colour')
  return hex
}
function number(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error('Invalid number')
  return value
}
function bool(value: unknown): boolean {
  if (typeof value !== 'boolean') throw new Error('Invalid boolean')
  return value
}
function enumeration<T extends string>(value: unknown, allowed: readonly T[]): T {
  if (!allowed.includes(value as T)) throw new Error('Invalid enum')
  return value as T
}
function vector(value: unknown): Vector3 {
  if (!Array.isArray(value) || value.length !== 3) throw new Error('Invalid vector')
  return [number(value[0]), number(value[1]), number(value[2])]
}
function material(value: unknown): SceneMaterial {
  const item = record(value)
  return {
    preset: enumeration(item.preset, [...MATERIAL_PRESET_KEYS, 'custom'] as const),
    color: color(item.color),
    roughness: number(item.roughness),
    metalness: number(item.metalness),
    emissive: color(item.emissive),
    emissiveIntensity: number(item.emissiveIntensity),
    opacity: number(item.opacity),
    wireframe: bool(item.wireframe),
  }
}
function sceneObject(value: unknown): SceneObject {
  const item = record(value)
  const geometry = record(item.geometry)
  return {
    id: text(item.id),
    name: text(item.name),
    type: enumeration(item.type, OBJECT_TYPES),
    position: vector(item.position),
    rotation: vector(item.rotation),
    scale: vector(item.scale),
    material: material(item.material),
    ...(item.equipmentId === undefined ? {} : { equipmentId: text(item.equipmentId) }),
    ...(item.posture === undefined ? {} : { posture: enumeration(item.posture, POSTURES) }),
    geometry: {
      width: number(geometry.width),
      height: number(geometry.height),
      depth: number(geometry.depth),
    },
    visible: bool(item.visible),
    locked: bool(item.locked),
  }
}
function sceneLight(value: unknown): SceneLight {
  const item = record(value)
  return {
    id: text(item.id),
    name: text(item.name),
    type: enumeration(item.type, LIGHT_TYPES),
    position: vector(item.position),
    targetPosition: vector(item.targetPosition),
    color: color(item.color),
    intensity: number(item.intensity),
    temperature: number(item.temperature),
    castShadow: bool(item.castShadow),
    distance: number(item.distance),
    angle: number(item.angle),
    penumbra: number(item.penumbra),
    width: number(item.width),
    height: number(item.height),
    visible: bool(item.visible),
  }
}
function surfaces(value: unknown): SurfaceMaterials {
  const item = record(value)
  return Object.fromEntries(
    SURFACE_KEYS.map((key) => [key, material(item[key])]),
  ) as SurfaceMaterials
}
function rendering(value: unknown): RenderingSettings {
  // Older saves may predate these preferences; they are not scene content.
  if (value === undefined) return { ...DEFAULT_RENDERING }
  const item = record(value)
  return {
    bloom: bool(item.bloom),
    bloomIntensity: number(item.bloomIntensity),
    ssao: bool(item.ssao),
    vignette: bool(item.vignette),
    highQuality: bool(item.highQuality),
  }
}
function cue(value: unknown): Cue {
  const item = record(value)
  const time = number(item.time)
  if (time < 0) throw new Error('Invalid cue time')
  return {
    id: text(item.id),
    number: number(item.number),
    time,
    label: text(item.label),
    note: text(item.note),
  }
}
function transition(value: unknown): Transition {
  const item = record(value)
  if (item.kind === 'cut') return { kind: 'cut' }
  if (item.kind !== 'smooth') throw new Error('Invalid transition')
  if (item.duration === null) return { kind: 'smooth', duration: null }
  const duration = number(item.duration)
  if (duration < 0) throw new Error('Invalid duration')
  return { kind: 'smooth', duration }
}
/** Copies only the keys present, validated with the same rules as the base element. */
function keyValues<T>(value: unknown, readers: Record<string, (raw: unknown) => unknown>): T {
  const item = record(value)
  const result: Record<string, unknown> = {}
  for (const [key, raw] of Object.entries(item)) {
    if (!Object.hasOwn(readers, key)) throw new Error('Unknown animated value')
    result[key] = readers[key](raw)
  }
  return result as T
}
const OBJECT_KEY_READERS = {
  position: vector,
  rotation: vector,
  visible: bool,
  posture: (raw: unknown) => enumeration(raw, POSTURES),
}
const LIGHT_KEY_READERS = {
  position: vector,
  targetPosition: vector,
  intensity: number,
  temperature: number,
  color,
  angle: number,
  visible: bool,
}
function keyframe(value: unknown): Keyframe {
  const item = record(value)
  const common = {
    cueId: text(item.cueId),
    targetId: text(item.targetId),
    transition: transition(item.transition),
  }
  if (item.targetKind === 'object')
    return {
      ...common,
      targetKind: 'object',
      values: keyValues<ObjectKeyValues>(item.values, OBJECT_KEY_READERS),
    }
  if (item.targetKind === 'light')
    return {
      ...common,
      targetKind: 'light',
      values: keyValues<LightKeyValues>(item.values, LIGHT_KEY_READERS),
    }
  throw new Error('Invalid keyframe target')
}
/** Older saves have no cue sheet. Keyframes must point to existing cues and elements. */
function timeline(value: unknown, objects: SceneObject[], lights: SceneLight[]): Timeline {
  if (value === undefined) return { cues: [], keyframes: [] }
  const item = record(value)
  if (!Array.isArray(item.cues) || !Array.isArray(item.keyframes))
    throw new Error('Invalid timeline')
  const result = { cues: item.cues.map(cue), keyframes: item.keyframes.map(keyframe) }
  uniqueIds(result.cues)
  const cueIds = new Set(result.cues.map((entry) => entry.id))
  const targets = new Set([
    ...objects.map((entry) => `object:${entry.id}`),
    ...lights.map((entry) => `light:${entry.id}`),
  ])
  const seen = new Set<string>()
  for (const frame of result.keyframes) {
    const target = `${frame.targetKind}:${frame.targetId}`
    const key = `${frame.cueId}|${target}`
    if (!cueIds.has(frame.cueId) || !targets.has(target) || seen.has(key))
      throw new Error('Invalid keyframe reference')
    seen.add(key)
  }
  return result
}
function uniqueIds(items: { id: string }[]): void {
  if (
    items.some((item) => !item.id) ||
    new Set(items.map((item) => item.id)).size !== items.length
  ) {
    throw new Error('Invalid or duplicate identifier')
  }
}

/**
 * Reads the current format ({ version: 1, ... }) and the legacy one, which stored
 * the whole editor state with `postProcessing` instead of `rendering`.
 */
export function deserializeScene(raw: string): Scene {
  const stored = record(JSON.parse(raw))
  if (stored.version !== undefined && stored.version !== 1) throw new Error('Unknown version')
  if (!Array.isArray(stored.objects) || !Array.isArray(stored.lights))
    throw new Error('Invalid scene')
  const objects = stored.objects.map(sceneObject)
  const lights = stored.lights.map(sceneLight)
  uniqueIds(objects)
  uniqueIds(lights)
  return {
    objects,
    lights,
    surfaces: surfaces(stored.surfaces),
    timeline: timeline(stored.timeline, objects, lights),
    rendering: rendering(stored.version === 1 ? stored.rendering : stored.postProcessing),
  }
}
export function serializeScene(scene: Scene): string {
  return JSON.stringify({
    version: 1,
    objects: scene.objects,
    lights: scene.lights,
    surfaces: scene.surfaces,
    timeline: scene.timeline,
    rendering: scene.rendering,
  })
}

export function createLocalSceneRepository(
  getStorage: () => StoragePort,
  createSeed: () => Scene,
): SceneRepository {
  let writable = true
  return {
    load() {
      let raw: string | null
      try {
        const storage = getStorage()
        raw = storage.getItem(SCENE_STORAGE_KEY) ?? storage.getItem(LEGACY_SCENE_STORAGE_KEY)
      } catch {
        writable = false
        return { status: 'unavailable', scene: createSeed() }
      }
      if (raw === null) return { status: 'ready', scene: createSeed() }
      try {
        return { status: 'ready', scene: deserializeScene(raw) }
      } catch {
        // Preserve the original payload for recovery instead of overwriting it with defaults.
        writable = false
        return { status: 'invalid', scene: createSeed() }
      }
    },
    save(scene) {
      if (!writable) return { ok: false }
      try {
        const storage = getStorage()
        storage.setItem(SCENE_STORAGE_KEY, serializeScene(scene))
        storage.removeItem(LEGACY_SCENE_STORAGE_KEY)
        return { ok: true }
      } catch {
        return { ok: false }
      }
    },
  }
}
