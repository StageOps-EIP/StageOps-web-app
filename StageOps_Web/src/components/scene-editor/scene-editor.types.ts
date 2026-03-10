export type TransformMode = 'translate' | 'rotate' | 'scale';
export type LightType = 'directional' | 'spot' | 'point' | 'rect-area';
export type ObjectType = 'equipment' | 'box' | 'plane' | 'cylinder';
export type MaterialPreset = 'parquet' | 'beton' | 'rideau' | 'acier' | 'peinture-blanche' | 'brique' | 'bois-brut' | 'moquette';
export type SurfaceKey = 'floor' | 'backWall' | 'leftWall' | 'rightWall' | 'ceiling';

export interface SceneMaterial {
  preset: MaterialPreset | 'custom';
  color: string;
  roughness: number;
  metalness: number;
  emissive: string;
  emissiveIntensity: number;
  opacity: number;
  wireframe: boolean;
}

export interface SceneObject {
  id: string;
  name: string;
  type: ObjectType;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  material: SceneMaterial;
  equipmentId?: string;
  geometry: { width: number; height: number; depth: number };
  visible: boolean;
  locked: boolean;
}

export interface SceneLight {
  id: string;
  name: string;
  type: LightType;
  position: [number, number, number];
  targetPosition: [number, number, number];
  color: string;
  intensity: number;
  temperature: number;
  castShadow: boolean;
  distance: number;
  angle: number;
  penumbra: number;
  width: number;
  height: number;
  visible: boolean;
}

export interface SurfaceMaterials {
  floor: SceneMaterial;
  backWall: SceneMaterial;
  leftWall: SceneMaterial;
  rightWall: SceneMaterial;
  ceiling: SceneMaterial;
}

export interface PostProcessingState {
  bloom: boolean;
  bloomIntensity: number;
  ssao: boolean;
  vignette: boolean;
  highQuality: boolean;
}

export interface HistoryEntry {
  objects: SceneObject[];
  lights: SceneLight[];
  surfaces: SurfaceMaterials;
}

export interface SceneEditorState {
  objects: SceneObject[];
  lights: SceneLight[];
  surfaces: SurfaceMaterials;
  stageSize: { width: number; depth: number; height: number };
  selectedId: string | null;
  selectedType: 'object' | 'light' | 'surface' | null;
  selectedSurface: SurfaceKey | null;
  transformMode: TransformMode;
  snapEnabled: boolean;
  postProcessing: PostProcessingState;
  history: HistoryEntry[];
  historyIndex: number;
}

export type SceneAction =
  | { type: 'SELECT_OBJECT'; id: string | null }
  | { type: 'SELECT_LIGHT'; id: string | null }
  | { type: 'SELECT_SURFACE'; surface: SurfaceKey }
  | { type: 'DESELECT' }
  | { type: 'SET_TRANSFORM_MODE'; mode: TransformMode }
  | { type: 'TOGGLE_SNAP' }
  | { type: 'UPDATE_STAGE_SIZE'; updates: Partial<{ width: number; depth: number; height: number }> }
  | { type: 'ADD_OBJECT'; object: SceneObject }
  | { type: 'UPDATE_OBJECT'; id: string; updates: Partial<SceneObject> }
  | { type: 'DELETE_OBJECT'; id: string }
  | { type: 'DUPLICATE_OBJECT'; id: string }
  | { type: 'ADD_LIGHT'; light: SceneLight }
  | { type: 'UPDATE_LIGHT'; id: string; updates: Partial<SceneLight> }
  | { type: 'DELETE_LIGHT'; id: string }
  | { type: 'UPDATE_SURFACE'; surface: SurfaceKey; material: Partial<SceneMaterial> }
  | { type: 'UPDATE_POSTPROCESSING'; updates: Partial<PostProcessingState> }
  | { type: 'UNDO' }
  | { type: 'REDO' };
