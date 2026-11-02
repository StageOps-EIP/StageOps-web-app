import { Suspense, useState } from 'react'
import type { RefObject } from 'react'
import type * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useSceneEditor } from '@/hooks/useSceneEditor'
import { useDisplayedScene } from '@/hooks/usePlayback'
import { EditableObject } from './EditableObject'
import { EditableLight } from './EditableLight'
import { SurfaceObjects } from './SurfaceObjects'
import { PostProcessingEffects } from './PostProcessingEffects'

interface EditorCanvasProps {
  canvasRef?: RefObject<HTMLCanvasElement>
  readOnly?: boolean
}

export function EditorCanvas({ canvasRef, readOnly = false }: EditorCanvasProps) {
  const { scene, selection, transformMode, clearSelection } = useSceneEditor()
  const { objects, lights } = useDisplayedScene()
  const pp = scene.rendering

  const [isDragging, setIsDragging] = useState(false)

  return (
    <Canvas
      ref={canvasRef ?? null}
      shadows="soft"
      dpr={pp.highQuality ? [1, 2] : [1, 1]}
      frameloop="always"
      gl={{ antialias: true, preserveDrawingBuffer: true, alpha: false }}
      camera={{ position: [0, 7, 20], fov: 55 }}
      style={{ width: '100%', height: '100%', background: '#0a0a0b' }}
      onPointerMissed={readOnly ? undefined : clearSelection}
    >
      <fog attach="fog" args={['#0a0a0b', 40, 90]} />
      <hemisphereLight args={['#fff4e0', '#0a0a18', 0.18] as [string, string, number]} />
      <ambientLight intensity={0.12} />

      <SurfaceObjects readOnly={readOnly} />

      {lights.map((l) => (
        <EditableLight
          key={l.id}
          light={l}
          isSelected={selection?.kind === 'light' && selection.id === l.id}
          onDrag={setIsDragging}
          readOnly={readOnly}
        />
      ))}

      {objects.map((o) => (
        <EditableObject
          key={o.id}
          object={o}
          isSelected={selection?.kind === 'object' && selection.id === o.id}
          transformMode={transformMode}
          onDrag={setIsDragging}
          readOnly={readOnly}
        />
      ))}

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        enabled={!isDragging}
        target={[0, 3, 0] as unknown as THREE.Vector3}
      />

      <Suspense fallback={null}>
        <PostProcessingEffects pp={pp} />
      </Suspense>
    </Canvas>
  )
}
