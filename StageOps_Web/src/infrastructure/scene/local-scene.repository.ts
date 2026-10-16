import type {
  RenderingSettings,
  Scene,
  SceneLight,
  SceneMaterial,
  SceneObject,
  SurfaceMaterials,
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
  const result: Scene = {
    objects: stored.objects.map(sceneObject),
    lights: stored.lights.map(sceneLight),
    surfaces: surfaces(stored.surfaces),
    rendering: rendering(stored.version === 1 ? stored.rendering : stored.postProcessing),
  }
  uniqueIds(result.objects)
  uniqueIds(result.lights)
  return result
}
export function serializeScene(scene: Scene): string {
  return JSON.stringify({
    version: 1,
    objects: scene.objects,
    lights: scene.lights,
    surfaces: scene.surfaces,
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
