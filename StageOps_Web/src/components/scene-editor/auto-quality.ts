export type AutoTier = 'eco' | 'standard' | 'hd'
export interface AutoQualityState {
  tier: AutoTier
  lowResolution: boolean
  active: boolean
  elapsed: number
  frames: number
  slowWindows: number
  fastWindows: number
}
export function createAutoQualityState(): AutoQualityState {
  return {
    tier: 'standard',
    lowResolution: false,
    active: false,
    elapsed: 0,
    frames: 0,
    slowWindows: 0,
    fastWindows: 0,
  }
}
// Sample only sustained interactions/playback. Idle demand-rendering is not low FPS.
export function sampleAutoQuality(
  state: AutoQualityState,
  delta: number,
  active: boolean,
): AutoQualityState {
  if (!active || !state.active) {
    return { ...state, active, elapsed: 0, frames: 0, slowWindows: 0, fastWindows: 0 }
  }
  if (!Number.isFinite(delta) || delta <= 0) return state
  const next = { ...state, elapsed: state.elapsed + delta, frames: state.frames + 1 }
  if (next.elapsed < 1) return next
  const fps = next.frames / next.elapsed
  next.elapsed = 0
  next.frames = 0
  next.slowWindows = fps < 30 ? next.slowWindows + 1 : 0
  next.fastWindows = fps > 55 ? next.fastWindows + 1 : 0
  const tiers: AutoTier[] = ['eco', 'standard', 'hd']
  if (next.slowWindows >= 2) {
    if (next.tier === 'eco') next.lowResolution = true
    else next.tier = tiers[tiers.indexOf(next.tier) - 1]
    next.slowWindows = 0
  } else if (next.fastWindows >= 4) {
    if (next.lowResolution) next.lowResolution = false
    else next.tier = tiers[Math.min(2, tiers.indexOf(next.tier) + 1)]
    next.fastWindows = 0
  }
  return next
}
