import type { SceneMaterial, MaterialPreset } from './scene-editor.types';

export const MATERIAL_PRESETS: Record<MaterialPreset, Omit<SceneMaterial, 'preset'>> = {
  'parquet':          { color: '#6B4F2A', roughness: 0.75, metalness: 0.0, emissive: '#000000', emissiveIntensity: 0, opacity: 1, wireframe: false },
  'beton':            { color: '#5a5a5a', roughness: 0.95, metalness: 0.0, emissive: '#000000', emissiveIntensity: 0, opacity: 1, wireframe: false },
  'rideau':           { color: '#222222', roughness: 1.0, metalness: 0.0, emissive: '#08082a', emissiveIntensity: 0.5, opacity: 1, wireframe: false },
  'acier':            { color: '#9ca3af', roughness: 0.2, metalness: 0.9, emissive: '#000000', emissiveIntensity: 0, opacity: 1, wireframe: false },
  'peinture-blanche': { color: '#e8e8e8', roughness: 0.85, metalness: 0.0, emissive: '#000000', emissiveIntensity: 0, opacity: 1, wireframe: false },
  'brique':           { color: '#8B3A3A', roughness: 0.9, metalness: 0.0, emissive: '#000000', emissiveIntensity: 0, opacity: 1, wireframe: false },
  'bois-brut':        { color: '#5C4A2A', roughness: 0.8, metalness: 0.0, emissive: '#000000', emissiveIntensity: 0, opacity: 1, wireframe: false },
  'moquette':         { color: '#1a1a1a', roughness: 1.0, metalness: 0.0, emissive: '#000000', emissiveIntensity: 0, opacity: 1, wireframe: false },
};

export const PRESET_LABELS: Record<MaterialPreset, string> = {
  'parquet': 'Parquet',
  'beton': 'Béton',
  'rideau': 'Rideau noir',
  'acier': 'Acier brossé',
  'peinture-blanche': 'Peinture blanche',
  'brique': 'Brique',
  'bois-brut': 'Bois brut',
  'moquette': 'Moquette noire',
};

export function applyPreset(preset: MaterialPreset): SceneMaterial {
  return { preset, ...MATERIAL_PRESETS[preset] };
}

export function kelvinToHex(kelvin: number): string {
  // Anchor points: 2700K=warm, 4000K=neutral, 6500K=white, 10000K=cool blue
  const anchors: [number, [number, number, number]][] = [
    [2700,  [255, 179, 71]],
    [4000,  [255, 250, 240]],
    [6500,  [255, 255, 255]],
    [10000, [201, 232, 255]],
  ];

  let lo = anchors[0], hi = anchors[anchors.length - 1];
  for (let i = 0; i < anchors.length - 1; i++) {
    if (kelvin >= anchors[i][0] && kelvin <= anchors[i + 1][0]) {
      lo = anchors[i];
      hi = anchors[i + 1];
      break;
    }
  }
  const t = Math.max(0, Math.min(1, (kelvin - lo[0]) / (hi[0] - lo[0])));
  const r = Math.round(lo[1][0] + t * (hi[1][0] - lo[1][0]));
  const g = Math.round(lo[1][1] + t * (hi[1][1] - lo[1][1]));
  const b = Math.round(lo[1][2] + t * (hi[1][2] - lo[1][2]));
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

export const DEFAULT_MATERIAL: SceneMaterial = {
  preset: 'beton',
  ...MATERIAL_PRESETS['beton'],
};
