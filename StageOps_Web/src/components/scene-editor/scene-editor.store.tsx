import { createContext, useContext } from 'react';
import type {
  SceneEditorState,
  SceneAction,
  SceneObject,
  SceneLight,
  SurfaceMaterials,
  HistoryEntry,
} from './scene-editor.types';
import { applyPreset, kelvinToHex } from './scene-editor.materials';

// ─── Initial surfaces ─────────────────────────────────────────────────────────

const initialSurfaces: SurfaceMaterials = {
  floor:     applyPreset('parquet'),
  backWall:  applyPreset('beton'),
  leftWall:  applyPreset('rideau'),
  rightWall: applyPreset('rideau'),
  ceiling:   applyPreset('beton'),
};

// ─── Initial lights ───────────────────────────────────────────────────────────

const initialLights: SceneLight[] = [
  {
    id: 'light-overhead-1',
    name: 'Lumière générale',
    type: 'directional',
    position: [5, 14, 8],
    targetPosition: [0, 1, 0],
    color: kelvinToHex(5500),
    intensity: 1.5,
    temperature: 5500,
    castShadow: false,
    distance: 0,
    angle: Math.PI / 4,
    penumbra: 0.3,
    width: 5,
    height: 5,
    visible: true,
  },
  {
    id: 'light-jardin-1',
    name: 'Spot jardin',
    type: 'spot',
    position: [-6, 9, 0],
    targetPosition: [0, 2, -2],
    color: kelvinToHex(3200),
    intensity: 8.0,
    temperature: 3200,
    castShadow: false,
    distance: 25,
    angle: Math.PI / 5,
    penumbra: 0.4,
    width: 2,
    height: 2,
    visible: true,
  },
  {
    id: 'light-cour-1',
    name: 'Spot cour',
    type: 'spot',
    position: [6, 9, 0],
    targetPosition: [0, 2, -2],
    color: kelvinToHex(5600),
    intensity: 8.0,
    temperature: 5600,
    castShadow: false,
    distance: 25,
    angle: Math.PI / 5,
    penumbra: 0.4,
    width: 2,
    height: 2,
    visible: true,
  },
];

// ─── Initial state ────────────────────────────────────────────────────────────

const initialState: SceneEditorState = {
  objects: [],
  lights: initialLights,
  surfaces: initialSurfaces,
  stageSize: { width: 24, depth: 18, height: 10 },
  selectedId: null,
  selectedType: null,
  selectedSurface: null,
  transformMode: 'translate',
  snapEnabled: false,
  postProcessing: {
    bloom: true,
    bloomIntensity: 0.4,
    ssao: false,
    vignette: true,
    highQuality: false,
  },
  history: [],
  historyIndex: -1,
};

// ─── localStorage persistence helpers ────────────────────────────────────────

export const STORAGE_KEY = 'stageops-scene';

export function loadPersistedState(): SceneEditorState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as SceneEditorState;
    // Merge with initialState so new fields added in the future are present
    return { ...initialState, ...parsed, selectedId: null, selectedType: null, selectedSurface: null };
  } catch {
    return initialState;
  }
}

// ─── History helpers ──────────────────────────────────────────────────────────

function makeSnapshot(state: SceneEditorState): HistoryEntry {
  return {
    objects: state.objects.map(o => ({ ...o, position: [...o.position] as [number,number,number], rotation: [...o.rotation] as [number,number,number], scale: [...o.scale] as [number,number,number] })),
    lights: state.lights.map(l => ({ ...l, position: [...l.position] as [number,number,number], targetPosition: [...l.targetPosition] as [number,number,number] })),
    surfaces: {
      floor:     { ...state.surfaces.floor },
      backWall:  { ...state.surfaces.backWall },
      leftWall:  { ...state.surfaces.leftWall },
      rightWall: { ...state.surfaces.rightWall },
      ceiling:   { ...state.surfaces.ceiling },
    },
  };
}

function pushHistory(state: SceneEditorState): SceneEditorState {
  const snapshot = makeSnapshot(state);
  // Trim future entries if we're mid-history
  const trimmed = state.history.slice(0, state.historyIndex + 1);
  // Max 50 entries
  const newHistory = [...trimmed, snapshot].slice(-50);
  return { ...state, history: newHistory, historyIndex: newHistory.length - 1 };
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

export function reducer(state: SceneEditorState, action: SceneAction): SceneEditorState {
  switch (action.type) {

    case 'SELECT_OBJECT':
      return { ...state, selectedId: action.id, selectedType: action.id ? 'object' : null, selectedSurface: null };

    case 'SELECT_LIGHT':
      return { ...state, selectedId: action.id, selectedType: action.id ? 'light' : null, selectedSurface: null };

    case 'SELECT_SURFACE':
      return { ...state, selectedId: action.surface, selectedType: 'surface', selectedSurface: action.surface };

    case 'DESELECT':
      return { ...state, selectedId: null, selectedType: null, selectedSurface: null };

    case 'SET_TRANSFORM_MODE':
      return { ...state, transformMode: action.mode };

    case 'TOGGLE_SNAP':
      return { ...state, snapEnabled: !state.snapEnabled };

    case 'UPDATE_STAGE_SIZE':
      return { ...state, stageSize: { ...state.stageSize, ...action.updates } };
    case 'ADD_OBJECT': {
      const withHistory = pushHistory(state);
      return { ...withHistory, objects: [...withHistory.objects, action.object] };
    }

    case 'UPDATE_OBJECT': {
      const withHistory = pushHistory(state);
      return {
        ...withHistory,
        objects: withHistory.objects.map(o =>
          o.id === action.id ? { ...o, ...action.updates } : o
        ),
      };
    }

    case 'DELETE_OBJECT': {
      const withHistory = pushHistory(state);
      return {
        ...withHistory,
        objects: withHistory.objects.filter(o => o.id !== action.id),
        selectedId: withHistory.selectedId === action.id ? null : withHistory.selectedId,
        selectedType: withHistory.selectedId === action.id ? null : withHistory.selectedType,
      };
    }

    case 'DUPLICATE_OBJECT': {
      const original = state.objects.find(o => o.id === action.id);
      if (!original) return state;
      const withHistory = pushHistory(state);
      const copy: SceneObject = {
        ...original,
        id: `obj-${Date.now()}`,
        name: `${original.name} (copie)`,
        position: [original.position[0] + 1, original.position[1], original.position[2] + 1],
        rotation: [...original.rotation] as [number,number,number],
        scale: [...original.scale] as [number,number,number],
        material: { ...original.material },
        geometry: { ...original.geometry },
      };
      return { ...withHistory, objects: [...withHistory.objects, copy], selectedId: copy.id, selectedType: 'object' };
    }

    case 'ADD_LIGHT': {
      const withHistory = pushHistory(state);
      return { ...withHistory, lights: [...withHistory.lights, action.light] };
    }

    case 'UPDATE_LIGHT': {
      const withHistory = pushHistory(state);
      return {
        ...withHistory,
        lights: withHistory.lights.map(l =>
          l.id === action.id ? { ...l, ...action.updates } : l
        ),
      };
    }

    case 'DELETE_LIGHT': {
      const withHistory = pushHistory(state);
      return {
        ...withHistory,
        lights: withHistory.lights.filter(l => l.id !== action.id),
        selectedId: withHistory.selectedId === action.id ? null : withHistory.selectedId,
        selectedType: withHistory.selectedId === action.id ? null : withHistory.selectedType,
      };
    }

    case 'UPDATE_SURFACE': {
      const withHistory = pushHistory(state);
      return {
        ...withHistory,
        surfaces: {
          ...withHistory.surfaces,
          [action.surface]: { ...withHistory.surfaces[action.surface], ...action.material },
        },
      };
    }

    case 'UPDATE_POSTPROCESSING':
      return { ...state, postProcessing: { ...state.postProcessing, ...action.updates } };

    case 'UNDO': {
      if (state.historyIndex < 0) return state;
      const entry = state.history[state.historyIndex];
      if (!entry) return state;
      return {
        ...state,
        objects: entry.objects,
        lights: entry.lights,
        surfaces: entry.surfaces,
        historyIndex: state.historyIndex - 1,
        selectedId: null,
        selectedType: null,
        selectedSurface: null,
      };
    }

    case 'REDO': {
      const nextIndex = state.historyIndex + 1;
      if (nextIndex >= state.history.length) return state;
      const entry = state.history[nextIndex];
      if (!entry) return state;
      return {
        ...state,
        objects: entry.objects,
        lights: entry.lights,
        surfaces: entry.surfaces,
        historyIndex: nextIndex,
        selectedId: null,
        selectedType: null,
        selectedSurface: null,
      };
    }

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface SceneEditorContextValue {
  state: SceneEditorState;
  dispatch: React.Dispatch<SceneAction>;
}

// Exported so SceneEditorProvider (scene-editor.provider.tsx) can wrap it.
// All component-layer access goes through useSceneEditor().
export const SceneEditorContext = createContext<SceneEditorContextValue | null>(null);

export function useSceneEditor(): SceneEditorContextValue {
  const ctx = useContext(SceneEditorContext);
  if (!ctx) throw new Error('useSceneEditor must be used within SceneEditorProvider');
  return ctx;
}
