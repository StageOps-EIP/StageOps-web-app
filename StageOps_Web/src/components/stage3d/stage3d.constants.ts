// Mapping: données métier → Three.js (Y-up)
// position.x (0-250) → THREE.x: (x - 125) / 10
// position.y (0-200) → THREE.z: (y - 100) / 10
// position.z (hauteur 0-10) → THREE.y: z ?? 0

export const STAGE_WIDTH = 24;   // unités Three.js
export const STAGE_DEPTH = 18;
export const GRID_HEIGHT = 10;

export const STATUS_COLORS: Record<string, string> = {
  'ok':       '#22c55e',
  'to-check': '#f59e0b',
  'hs':       '#ef4444',
  'repair':   '#8b5cf6',
};

export const CATEGORY_COLORS: Record<string, string> = {
  'sound':   '#22d3ee',
  'light':   '#facc15',
  'video':   '#a855f7',
  'set':     '#4ade80',
  'safety':  '#fb923c',
  'rigging': '#94a3b8',
};

export const CATEGORY_ICONS: Record<string, string> = {
  'sound':   'SPK',
  'light':   'LUM',
  'video':   'VID',
  'set':     'SCN',
  'safety':  'SEC',
  'rigging': 'GRE',
};

export function mapPosition(pos: { x: number; y: number; z?: number }): [number, number, number] {
  return [
    (pos.x - 125) / 10,
    pos.z ?? 0,
    (pos.y - 100) / 10,
  ];
}
