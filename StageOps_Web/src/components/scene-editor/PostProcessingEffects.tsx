import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import type { RenderingSettings } from '@/domain/scene-models'

interface PostProcessingEffectsProps {
  pp: RenderingSettings
  /** MSAA samples of the composer; the canvas' own antialiasing does not apply here. */
  multisampling: number
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

export function PostProcessingEffects({ pp, multisampling }: PostProcessingEffectsProps) {
  if (pp.bloom && pp.vignette)
    return (
      <EffectComposer multisampling={multisampling}>
        <Glow pp={pp} />
        <Vignette eskil={false} offset={0.3} darkness={0.7} />
      </EffectComposer>
    )
  if (pp.bloom)
    return (
      <EffectComposer multisampling={multisampling}>
        <Glow pp={pp} />
      </EffectComposer>
    )
  if (pp.vignette)
    return (
      <EffectComposer multisampling={multisampling}>
        <Vignette eskil={false} offset={0.3} darkness={0.7} />
      </EffectComposer>
    )
  return null
}
