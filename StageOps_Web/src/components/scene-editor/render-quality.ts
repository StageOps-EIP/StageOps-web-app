import type { RenderQuality, SceneLight } from '@/domain/scene-models'

export type QualityTier = Exclude<RenderQuality, 'auto'>

export interface QualityPreset {
  /** Device pixel ratio range. */
  dpr: [number, number]
  /**
   * Lights computed in real time. Each one adds work for every pixel on screen, which is what
   * makes low-end machines slow; the others are simulated (beam + floor pool).
   */
  realLights: number
  /** Lights allowed to cast shadows; every caster renders the scene once more per frame. */
  shadowCasters: number
  shadowMapSize: number
  /** Bloom/vignette; skipped entirely on low-end machines. */
  postProcessing: boolean
  multisampling: number
  /** Image-based reflections (steel, polished floors). */
  environment: boolean
}

export const QUALITY_PRESETS: Record<QualityTier, QualityPreset> = {
  eco: {
    dpr: [1, 1],
    realLights: 4,
    shadowCasters: 0,
    shadowMapSize: 512,
    postProcessing: false,
    multisampling: 0,
    environment: false,
  },
  standard: {
    dpr: [1, 1.5],
    realLights: 8,
    shadowCasters: 2,
    shadowMapSize: 1024,
    postProcessing: true,
    multisampling: 0,
    environment: false,
  },
  hd: {
    dpr: [1, 2],
    realLights: 16,
    shadowCasters: 4,
    shadowMapSize: 2048,
    postProcessing: true,
    multisampling: 4,
    environment: true,
  },
}

export const QUALITY_LABELS: Record<RenderQuality, string> = {
  auto: 'Auto',
  eco: 'Éco',
  standard: 'Standard',
  hd: 'HD',
}

/**
 * Picks the lights computed in real time: the selected one first, then the brightest.
 * Hidden or switched-off lights never count.
 */
export function realLightIds(
  lights: SceneLight[],
  budget: number,
  selectedId: string | null,
): Set<string> {
  return new Set(
    lights
      .filter((light) => light.visible && light.intensity > 0)
      .sort(
        (a, b) =>
          Number(b.id === selectedId) - Number(a.id === selectedId) ||
          physicalWeight(b) - physicalWeight(a),
      )
      .slice(0, budget)
      .map((light) => light.id),
  )
}

/** Rough visual importance used to rank lights: a wash covers more than a narrow spot. */
function physicalWeight(light: SceneLight): number {
  if (light.type === 'directional') return light.intensity * 100
  const spread = light.type === 'spot' ? Math.min(light.angle, 1.2) : 1
  return light.intensity * (0.5 + spread)
}

/**
 * Picks the lights that cast shadows: visible spots and directional lights asking for it,
 * brightest first. Point lights are excluded: their shadows cost six renders each.
 */
export function shadowCasterIds(
  lights: SceneLight[],
  budget: number,
  realIds?: Set<string>,
): Set<string> {
  if (budget <= 0) return new Set()
  return new Set(
    lights
      .filter(
        (light) =>
          (!realIds || realIds.has(light.id)) &&
          light.visible &&
          light.castShadow &&
          light.intensity > 0 &&
          (light.type === 'spot' || light.type === 'directional'),
      )
      .sort((a, b) => b.intensity - a.intensity)
      .slice(0, budget)
      .map((light) => light.id),
  )
}

/**
 * Converts the 0–10 level shown in the editor into Three.js physical units
 * (candela for spots and points, lux for directional light), so a level means the same
 * brightness whatever the light type.
 */
export function physicalIntensity(light: SceneLight): number {
  switch (light.type) {
    case 'spot':
      return light.intensity * 45
    case 'point':
      return light.intensity * 25
    case 'rect-area':
      return light.intensity * 30
    case 'directional':
      return light.intensity * 0.6
  }
}
