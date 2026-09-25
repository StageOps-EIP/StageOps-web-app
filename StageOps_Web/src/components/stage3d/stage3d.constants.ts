// Mapping: données métier → Three.js (Y-up)
// position.x (0-250) → THREE.x: (x - 125) / 10
// position.y (0-200) → THREE.z: (y - 100) / 10
// position.z (hauteur 0-10) → THREE.y: z ?? 0
import { BRAND_COLORS, STATUS_COLORS as SEMANTIC_COLORS, TEXT_COLORS } from '@/lib/design-tokens'

export const STAGE_WIDTH = 24 // unités Three.js
export const STAGE_DEPTH = 18
export const GRID_HEIGHT = 10

export const STATUS_COLORS: Record<string, string> = {
  ok: SEMANTIC_COLORS.success,
  'to-check': SEMANTIC_COLORS.warning,
  hs: SEMANTIC_COLORS.danger,
  repair: SEMANTIC_COLORS.warning,
}

export const CATEGORY_COLORS: Record<string, string> = {
  sound: BRAND_COLORS.blue,
  light: BRAND_COLORS.violet,
  video: BRAND_COLORS.violetHover,
  set: TEXT_COLORS.muted,
  safety: TEXT_COLORS.subtle,
  rigging: TEXT_COLORS.primary,
}

export const CATEGORY_ICONS: Record<string, string> = {
  sound: 'SPK',
  light: 'LUM',
  video: 'VID',
  set: 'SCN',
  safety: 'SEC',
  rigging: 'GRE',
}

export function mapPosition(pos: { x: number; y: number; z?: number }): [number, number, number] {
  return [(pos.x - 125) / 10, pos.z ?? 0, (pos.y - 100) / 10]
}
