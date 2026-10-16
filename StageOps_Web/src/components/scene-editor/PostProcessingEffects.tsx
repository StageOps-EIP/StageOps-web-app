import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import type { RenderingSettings } from '@/domain/scene-models'
import type { MutableRefObject } from 'react'
import type { EffectComposer as EffectComposerImpl } from 'postprocessing'

interface PostProcessingEffectsProps {
  pp: RenderingSettings
  /** MSAA samples of the composer; the canvas' own antialiasing does not apply here. */
  multisampling: number
  composerRef: MutableRefObject<EffectComposerImpl | null>
}

// EffectComposer needs a fixed set of children, hence one variant per combination.
function Glow({ pp }: { pp: RenderingSettings }) {
  return (
    <Bloom
      mipmapBlur
      intensity={pp.bloomIntensity}
      luminanceThreshold={0.75}
      luminanceSmoothing={0.3}
    />
  )
}

export function PostProcessingEffects({
  pp,
  multisampling,
  composerRef,
}: PostProcessingEffectsProps) {
  if (pp.bloom && pp.vignette)
    return (
      <EffectComposer ref={composerRef} multisampling={multisampling}>
        <Glow pp={pp} />
        <Vignette eskil={false} offset={0.3} darkness={0.7} />
      </EffectComposer>
    )
  if (pp.bloom)
    return (
      <EffectComposer ref={composerRef} multisampling={multisampling}>
        <Glow pp={pp} />
      </EffectComposer>
    )
  if (pp.vignette)
    return (
      <EffectComposer ref={composerRef} multisampling={multisampling}>
        <Vignette eskil={false} offset={0.3} darkness={0.7} />
      </EffectComposer>
    )
  return null
}
