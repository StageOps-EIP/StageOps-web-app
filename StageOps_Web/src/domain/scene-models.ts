export type Vector3 = [number, number, number]
export type TransformMode = 'translate' | 'rotate' | 'scale'
export type LightType = 'directional' | 'spot' | 'point' | 'rect-area'
export type ObjectType = 'equipment' | 'box' | 'plane' | 'cylinder'
export type MaterialPreset =
  | 'parquet'
  | 'beton'
  | 'rideau'
  | 'acier'
  | 'peinture-blanche'
  | 'brique'
  | 'bois-brut'
  | 'moquette'
export type SurfaceKey = 'floor' | 'backWall' | 'leftWall' | 'rightWall' | 'ceiling'

export const OBJECT_TYPES: readonly ObjectType[] = ['equipment', 'box', 'plane', 'cylinder']
export const LIGHT_TYPES: readonly LightType[] = ['directional', 'spot', 'point', 'rect-area']
export const SURFACE_KEYS: readonly SurfaceKey[] = [
  'floor',
  'backWall',
  'leftWall',
  'rightWall',
  'ceiling',
]

export interface SceneMaterial {
  preset: MaterialPreset | 'custom'
  color: string
  roughness: number
  metalness: number
  emissive: string
  emissiveIntensity: number
  opacity: number
  wireframe: boolean
}

export interface SceneObject {
  id: string
  name: string
  type: ObjectType
  position: Vector3
  rotation: Vector3
  scale: Vector3
  material: SceneMaterial
  equipmentId?: string
  geometry: { width: number; height: number; depth: number }
  visible: boolean
  locked: boolean
}

export interface SceneLight {
  id: string
  name: string
  type: LightType
  position: Vector3
  targetPosition: Vector3
  color: string
  intensity: number
  temperature: number
  castShadow: boolean
  distance: number
  angle: number
  penumbra: number
  width: number
  height: number
  visible: boolean
}

export type SurfaceMaterials = Record<SurfaceKey, SceneMaterial>

export interface RenderingSettings {
  bloom: boolean
  bloomIntensity: number
  ssao: boolean
  vignette: boolean
  highQuality: boolean
}

/** Editable content: what undo/redo restores. */
export interface SceneContent {
  objects: SceneObject[]
  lights: SceneLight[]
  surfaces: SurfaceMaterials
}

/** Persisted scene: content plus display preferences. */
export interface Scene extends SceneContent {
  rendering: RenderingSettings
}

// Stage volume in Three.js units (metres): width (X), depth (Z), grid height (Y).
export const STAGE_WIDTH = 24
export const STAGE_DEPTH = 18
export const GRID_HEIGHT = 10

export const MATERIAL_PRESETS: Record<MaterialPreset, Omit<SceneMaterial, 'preset'>> = {
  parquet: {
    color: '#6B4F2A',
    roughness: 0.75,
    metalness: 0,
    emissive: '#000000',
    emissiveIntensity: 0,
    opacity: 1,
    wireframe: false,
  },
  beton: {
    color: '#5a5a5a',
    roughness: 0.95,
    metalness: 0,
    emissive: '#000000',
    emissiveIntensity: 0,
    opacity: 1,
    wireframe: false,
  },
  rideau: {
    color: '#222222',
    roughness: 1,
    metalness: 0,
    emissive: '#08082a',
    emissiveIntensity: 0.5,
    opacity: 1,
    wireframe: false,
  },
  acier: {
    color: '#9ca3af',
    roughness: 0.2,
    metalness: 0.9,
    emissive: '#000000',
    emissiveIntensity: 0,
    opacity: 1,
    wireframe: false,
  },
  'peinture-blanche': {
    color: '#e8e8e8',
    roughness: 0.85,
    metalness: 0,
    emissive: '#000000',
    emissiveIntensity: 0,
    opacity: 1,
    wireframe: false,
  },
  brique: {
    color: '#8B3A3A',
    roughness: 0.9,
    metalness: 0,
    emissive: '#000000',
    emissiveIntensity: 0,
    opacity: 1,
    wireframe: false,
  },
  'bois-brut': {
    color: '#5C4A2A',
    roughness: 0.8,
    metalness: 0,
    emissive: '#000000',
    emissiveIntensity: 0,
    opacity: 1,
    wireframe: false,
  },
  moquette: {
    color: '#1a1a1a',
    roughness: 1,
    metalness: 0,
    emissive: '#000000',
    emissiveIntensity: 0,
    opacity: 1,
    wireframe: false,
  },
}
export const MATERIAL_PRESET_KEYS = Object.keys(MATERIAL_PRESETS) as MaterialPreset[]

export function applyPreset(preset: MaterialPreset): SceneMaterial {
  return { preset, ...MATERIAL_PRESETS[preset] }
}

/** Approximate colour of a light source for a temperature in Kelvin. */
export function kelvinToHex(kelvin: number): string {
  const anchors: [number, [number, number, number]][] = [
    [2700, [255, 179, 71]],
    [4000, [255, 250, 240]],
    [6500, [255, 255, 255]],
    [10000, [201, 232, 255]],
  ]
  let lo = anchors[0]
  let hi = anchors[anchors.length - 1]
  for (let i = 0; i < anchors.length - 1; i++) {
    if (kelvin >= anchors[i][0] && kelvin <= anchors[i + 1][0]) {
      lo = anchors[i]
      hi = anchors[i + 1]
      break
    }
  }
  const t = Math.max(0, Math.min(1, (kelvin - lo[0]) / (hi[0] - lo[0])))
  const channel = (index: number) =>
    Math.round(lo[1][index] + t * (hi[1][index] - lo[1][index]))
      .toString(16)
      .padStart(2, '0')
  return `#${channel(0)}${channel(1)}${channel(2)}`
}

const DEFAULT_OBJECT_NAMES: Record<ObjectType, string> = {
  equipment: 'Équipement',
  box: 'Praticable',
  plane: 'Décor plan',
  cylinder: 'Colonne',
}
const DEFAULT_LIGHT_NAMES: Record<LightType, string> = {
  directional: 'Lumière directionnelle',
  spot: 'Spot',
  point: 'Lumière ponctuelle',
  'rect-area': 'Area light',
}

export function createSceneObject(type: ObjectType, id: string): SceneObject {
  const flat = type === 'plane'
  return {
    id,
    name: DEFAULT_OBJECT_NAMES[type],
    type,
    position: [0, flat ? 0.01 : 0.5, 0],
    rotation: flat ? [-Math.PI / 2, 0, 0] : [0, 0, 0],
    scale: [1, 1, 1],
    material: applyPreset('beton'),
    geometry: { width: 2, height: flat ? 2 : 1, depth: 2 },
    visible: true,
    locked: false,
  }
}

export function createSceneLight(type: LightType, id: string): SceneLight {
  return {
    id,
    name: DEFAULT_LIGHT_NAMES[type],
    type,
    position: [0, 8, 0],
    targetPosition: [0, 0, 0],
    color: kelvinToHex(5500),
    intensity: 2,
    temperature: 5500,
    castShadow: false,
    distance: 20,
    angle: Math.PI / 6,
    penumbra: 0.4,
    width: 2,
    height: 2,
    visible: true,
  }
}

export const DEFAULT_RENDERING: RenderingSettings = {
  bloom: true,
  bloomIntensity: 0.4,
  ssao: false,
  vignette: true,
  highQuality: false,
}

/** Empty stage: default surfaces and a three-light rig, no set pieces. */
export function createDefaultScene(): Scene {
  return {
    objects: [],
    lights: [
      {
        ...createSceneLight('directional', 'light-overhead-1'),
        name: 'Lumière générale',
        position: [5, 12, 5],
        intensity: 1.2,
        castShadow: true,
        distance: 0,
        angle: Math.PI / 4,
        penumbra: 0.3,
        width: 5,
        height: 5,
      },
      {
        ...createSceneLight('spot', 'light-jardin-1'),
        name: 'Spot jardin',
        position: [-5, 9, -2],
        targetPosition: [0, 0, 2],
        color: kelvinToHex(3200),
        temperature: 3200,
        intensity: 7,
        castShadow: true,
        distance: 25,
      },
      {
        ...createSceneLight('spot', 'light-cour-1'),
        name: 'Spot cour',
        position: [5, 9, -2],
        targetPosition: [0, 0, 2],
        color: kelvinToHex(5600),
        temperature: 5600,
        intensity: 7,
        castShadow: true,
        distance: 25,
      },
    ],
    surfaces: {
      floor: applyPreset('parquet'),
      backWall: applyPreset('beton'),
      leftWall: applyPreset('rideau'),
      rightWall: applyPreset('rideau'),
      ceiling: applyPreset('beton'),
    },
    rendering: { ...DEFAULT_RENDERING },
  }
}
