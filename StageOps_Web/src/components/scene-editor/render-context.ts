import { createContext, useContext } from 'react'
import type { QualityTier } from './render-quality'

/** Quality tier in effect inside the canvas (resolved from Auto). */
export const RenderTierContext = createContext<QualityTier>('standard')

export function useRenderTier(): QualityTier {
  return useContext(RenderTierContext)
}
