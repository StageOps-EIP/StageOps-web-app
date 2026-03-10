import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import type { PostProcessingState } from './scene-editor.types';

interface PostProcessingEffectsProps {
  pp: PostProcessingState;
}

// Separate components so EffectComposer always has a fixed set of children
function BloomAndVignette({ pp }: { pp: PostProcessingState }) {
  return (
    <EffectComposer multisampling={0}>
      <Bloom intensity={pp.bloomIntensity} luminanceThreshold={0.6} luminanceSmoothing={0.4} />
      <Vignette eskil={false} offset={0.3} darkness={0.8} />
    </EffectComposer>
  );
}

function BloomOnly({ pp }: { pp: PostProcessingState }) {
  return (
    <EffectComposer multisampling={0}>
      <Bloom intensity={pp.bloomIntensity} luminanceThreshold={0.6} luminanceSmoothing={0.4} />
    </EffectComposer>
  );
}

function VignetteOnly() {
  return (
    <EffectComposer multisampling={0}>
      <Vignette eskil={false} offset={0.3} darkness={0.8} />
    </EffectComposer>
  );
}

export function PostProcessingEffects({ pp }: PostProcessingEffectsProps) {
  if (pp.bloom && pp.vignette) return <BloomAndVignette pp={pp} />;
  if (pp.bloom) return <BloomOnly pp={pp} />;
  if (pp.vignette) return <VignetteOnly />;
  return null;
}
