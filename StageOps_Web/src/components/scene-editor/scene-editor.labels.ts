import type { MaterialPreset, SurfaceKey } from '@/domain/scene-models'

export const SURFACE_LABELS: Record<SurfaceKey, string> = {
  floor: 'Sol',
  backWall: 'Fond de scène',
  leftWall: 'Jardin (gauche)',
  rightWall: 'Cour (droite)',
  ceiling: 'Plafond',
}

export const PRESET_LABELS: Record<MaterialPreset, string> = {
  parquet: 'Parquet',
  beton: 'Béton',
  rideau: 'Rideau noir',
  acier: 'Acier brossé',
  'peinture-blanche': 'Peinture blanche',
  brique: 'Brique',
  'bois-brut': 'Bois brut',
  moquette: 'Moquette noire',
}
