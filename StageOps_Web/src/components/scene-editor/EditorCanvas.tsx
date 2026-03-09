import { Suspense, useState } from 'react';
import type { RefObject } from 'react';
import type * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useSceneEditor } from './scene-editor.store';
import { EditableObject } from './EditableObject';
import { EditableLight } from './EditableLight';
import { SurfaceObjects } from './SurfaceObjects';
import { PostProcessingEffects } from './PostProcessingEffects';

interface EditorCanvasProps {
  canvasRef?: RefObject<HTMLCanvasElement>;
  readOnly?: boolean;
}

export function EditorCanvas({ canvasRef, readOnly = false }: EditorCanvasProps) {
  const { state, dispatch } = useSceneEditor();
  const { objects, lights, selectedId, selectedType, transformMode, postProcessing } = state;
  const pp = postProcessing;

  const [isDragging, setIsDragging] = useState(false);

  return (
    <Canvas
      ref={canvasRef ?? null}
      shadows="soft"
      dpr={pp.highQuality ? [1, 2] : [1, 1]}
      frameloop="always"
      gl={{ antialias: true, preserveDrawingBuffer: true, alpha: false }}
      camera={{ position: [0, 7, 20], fov: 55 }}
      style={{ width: '100%', height: '100%', background: '#0a0a0b' }}
      onPointerMissed={readOnly ? undefined : () => dispatch({ type: 'DESELECT' })}
    >
      <fog attach="fog" args={['#0a0a0b', 40, 90]} />
      <hemisphereLight args={['#fff4e0', '#0a0a18', 0.18] as [string, string, number]} />
      <ambientLight intensity={0.12} />

      <SurfaceObjects />

      {lights.map((l) => (
        <EditableLight
          key={l.id}
          light={l}
          isSelected={selectedId === l.id && selectedType === 'light'}
          onDrag={setIsDragging}
          readOnly={readOnly}
        />
      ))}

      {objects.map((o) => (
        <EditableObject
          key={o.id}
          object={o}
          isSelected={selectedId === o.id && selectedType === 'object'}
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
  );
}
