import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import type { MutableRefObject } from 'react'
import * as THREE from 'three'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { EffectComposer as EffectComposerImpl } from 'postprocessing'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { useSceneEditor } from '@/hooks/useSceneEditor'
import { useDisplayedScene, usePlayback } from '@/hooks/usePlayback'
import { AutoQualityMonitor } from './AutoQualityMonitor'
import { captureScenePng } from './capture-scene'
import { EditableObject } from './EditableObject'
import { EditableLight } from './EditableLight'
import { RenderTierContext } from './render-context'
import { StageSet } from './StageSet'
import { QUALITY_PRESETS, realLightIds, shadowCasterIds, type QualityTier } from './render-quality'

// Bloom/vignette and their library are only downloaded when they are actually used.
const HdEnvironment = lazy(() =>
  import('./HdEnvironment').then((module) => ({ default: module.HdEnvironment })),
)
const PostProcessingEffects = lazy(() =>
  import('./PostProcessingEffects').then((module) => ({ default: module.PostProcessingEffects })),
)

export type CameraView = 'ensemble' | 'salle' | 'regie' | 'dessus'
const CAMERA_VIEWS: Record<
  CameraView,
  { label: string; position: [number, number, number]; target: [number, number, number] }
> = {
  ensemble: { label: 'Ensemble', position: [0, 7, 20], target: [0, 3, 0] },
  salle: { label: 'Salle', position: [0, 1.1, 16], target: [0, 2.2, 0] },
  regie: { label: 'Régie', position: [0, 4.5, 22], target: [0, 1.5, 0] },
  dessus: { label: 'Dessus', position: [0, 28, 0.01], target: [0, 0, 0] },
}
const DEFAULT_TARGET = new THREE.Vector3(...CAMERA_VIEWS.ensemble.target)

/** Function returning a PNG of the current view (set by the canvas). */
export type CaptureRef = MutableRefObject<(() => string) | null>

/** Renders one frame on request and reads it: no need to keep the drawing buffer every frame. */
function CaptureBridge({
  captureRef,
  composerRef,
}: {
  captureRef: CaptureRef
  composerRef: MutableRefObject<EffectComposerImpl | null>
}) {
  const { gl, scene, camera } = useThree()
  useEffect(() => {
    captureRef.current = () => {
      return captureScenePng(gl, scene, camera, composerRef.current)
    }
    return () => {
      captureRef.current = null
    }
  }, [captureRef, composerRef, gl, scene, camera])
  return null
}

function CameraRig({ view }: { view: { name: CameraView; request: number } }) {
  const camera = useThree((state) => state.camera)
  const controls = useThree((state) => state.controls) as OrbitControlsImpl | null
  const invalidate = useThree((state) => state.invalidate)
  useEffect(() => {
    if (view.request === 0) return
    const preset = CAMERA_VIEWS[view.name]
    camera.position.set(...preset.position)
    controls?.target.set(...preset.target)
    controls?.update()
    invalidate()
  }, [view, camera, controls, invalidate])
  return null
}

const TIER_LABELS: Record<QualityTier, string> = { eco: 'Éco', standard: 'Standard', hd: 'HD' }

interface EditorCanvasProps {
  captureRef?: CaptureRef
  readOnly?: boolean
}

export function EditorCanvas({ captureRef, readOnly = false }: EditorCanvasProps) {
  const { scene, selection, transformMode, clearSelection } = useSceneEditor()
  const { objects, lights } = useDisplayedScene()
  const { rendering } = scene
  const { playing } = usePlayback()
  const composerRef = useRef<EffectComposerImpl | null>(null)
  const [isOrbiting, setIsOrbiting] = useState(false)

  // In Auto, start at Standard and follow the machine's actual frame rate.
  const [autoTier, setAutoTier] = useState<QualityTier>('standard')
  // Last resort in Auto when even Éco is too slow: render at 75 % of the resolution.
  const [lowResolution, setLowResolution] = useState(false)
  const tier: QualityTier = rendering.quality === 'auto' ? autoTier : rendering.quality
  const preset = QUALITY_PRESETS[tier]

  const selectedLightId = selection?.kind === 'light' ? selection.id : null
  const realLights = useMemo(
    () => realLightIds(lights, preset.realLights, selectedLightId),
    [lights, preset.realLights, selectedLightId],
  )
  const casters = useMemo(
    () => shadowCasterIds(lights, preset.shadowCasters, realLights),
    [lights, preset.shadowCasters, realLights],
  )
  const activeLights = lights.filter((light) => light.visible && light.intensity > 0).length
  const anyShadow = casters.size > 0
  const [isDragging, setIsDragging] = useState(false)
  const [view, setView] = useState<{ name: CameraView; request: number }>({
    name: 'ensemble',
    request: 0,
  })
  const postProcessing = preset.postProcessing && (rendering.bloom || rendering.vignette)

  return (
    <div className="relative h-full w-full">
      <Canvas
        // Frames are only rendered when something changes (edit, camera move, playback).
        frameloop="demand"
        shadows={{ type: THREE.PCFSoftShadowMap, enabled: anyShadow }}
        dpr={rendering.quality === 'auto' && lowResolution ? 0.75 : preset.dpr}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        camera={{ position: CAMERA_VIEWS.ensemble.position, fov: 50, near: 0.1, far: 120 }}
        style={{ width: '100%', height: '100%', background: '#07070a' }}
        onPointerMissed={readOnly ? undefined : clearSelection}
      >
        <RenderTierContext.Provider value={tier}>
          <color attach="background" args={['#07070a']} />
          <fog attach="fog" args={['#07070a', 45, 110]} />
          <AutoQualityMonitor
            active={rendering.quality === 'auto' && (playing || isDragging || isOrbiting)}
            onChange={({ tier, lowResolution }) => {
              setAutoTier(tier)
              setLowResolution(lowResolution)
            }}
          />
          {/* Dim work light: the stage is lit by the scene's own projectors. */}
          <hemisphereLight args={['#c9d2ff', '#1a1612', 0.35]} />
          <ambientLight intensity={0.06} />
          {preset.environment && (
            <Suspense fallback={null}>
              <HdEnvironment />
            </Suspense>
          )}

          <StageSet readOnly={readOnly} dressing={rendering.stageDressing} />

          {lights.map((light) => (
            <EditableLight
              key={light.id}
              light={light}
              isSelected={selection?.kind === 'light' && selection.id === light.id}
              onDrag={setIsDragging}
              readOnly={readOnly}
              real={realLights.has(light.id)}
              castsShadow={casters.has(light.id)}
              shadowMapSize={preset.shadowMapSize}
              showBeam={rendering.beams}
            />
          ))}

          {objects.map((object) => (
            <EditableObject
              key={object.id}
              object={object}
              isSelected={selection?.kind === 'object' && selection.id === object.id}
              transformMode={transformMode}
              onDrag={setIsDragging}
              readOnly={readOnly}
              castShadow={anyShadow}
            />
          ))}

          <OrbitControls
            makeDefault
            enableDamping
            dampingFactor={0.1}
            enabled={!isDragging}
            onStart={() => setIsOrbiting(true)}
            onEnd={() => setIsOrbiting(false)}
            target={DEFAULT_TARGET}
            maxPolarAngle={Math.PI / 2 - 0.02}
            minDistance={2}
            maxDistance={60}
          />
          <CameraRig view={view} />
          {captureRef && <CaptureBridge captureRef={captureRef} composerRef={composerRef} />}

          {postProcessing && (
            <Suspense fallback={null}>
              <PostProcessingEffects
                pp={rendering}
                multisampling={preset.multisampling}
                composerRef={composerRef}
              />
            </Suspense>
          )}
        </RenderTierContext.Provider>
      </Canvas>

      <div
        role="group"
        aria-label="Point de vue"
        className="absolute bottom-3 right-3 z-10 flex overflow-hidden rounded-md border border-theme-border bg-theme-base/90"
      >
        {(Object.keys(CAMERA_VIEWS) as CameraView[]).map((name, i) => (
          <button
            key={name}
            type="button"
            onClick={() => setView((current) => ({ name, request: current.request + 1 }))}
            aria-pressed={view.request > 0 && view.name === name}
            className={`px-2.5 py-1 text-[11px] text-content-muted hover:bg-theme-elevated hover:text-content-primary ${
              i > 0 ? 'border-l border-theme-border' : ''
            }`}
          >
            {CAMERA_VIEWS[name].label}
          </button>
        ))}
        {activeLights > realLights.size && (
          <span
            title="Au-delà de ce nombre, les projecteurs sont simulés (faisceau et tache au sol) pour rester fluide. Le projecteur sélectionné est toujours calculé."
            className="border-l border-theme-border px-2 py-1 text-[10px] text-content-subtle"
          >
            {realLights.size}/{activeLights} en temps réel
          </span>
        )}
        {rendering.quality === 'auto' && (
          <span
            title="Qualité choisie automatiquement selon les performances de l’ordinateur"
            className="border-l border-theme-border px-2 py-1 text-[10px] uppercase tracking-wide text-content-subtle"
          >
            {TIER_LABELS[tier]}
          </span>
        )}
      </div>
    </div>
  )
}
