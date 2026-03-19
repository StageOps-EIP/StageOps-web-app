import { Component, type ErrorInfo, type ReactNode, Suspense, useState, useEffect } from 'react';
import type { RefObject } from 'react';
import type * as THREE from 'three';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useSceneEditor } from './scene-editor.store';
import { EditableObject } from './EditableObject';
import { EditableLight } from './EditableLight';
import { SurfaceObjects } from './SurfaceObjects';
import { PostProcessingEffects } from './PostProcessingEffects';

export type CameraView = { type: 'top' | 'front' | 'side' | 'persp' | 'focus'; target?: [number, number, number] } | null;

interface EditorCanvasProps {
  canvasRef?: RefObject<HTMLCanvasElement>;
  readOnly?: boolean;
  cameraView?: CameraView;
  onCameraViewHandled?: () => void;
}

interface WebGLErrorBoundaryProps {
  children: ReactNode;
}

interface WebGLErrorBoundaryState {
  hasError: boolean;
}

class WebGLErrorBoundary extends Component<WebGLErrorBoundaryProps, WebGLErrorBoundaryState> {
  state: WebGLErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): WebGLErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('webgl_context_error', {
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-full flex items-center justify-center bg-[#0a0a0b] border border-theme-border rounded-xl p-6">
          <div className="text-center space-y-2 max-w-md">
            <p className="text-base text-content-primary">WebGL indisponible sur cet appareil</p>
            <p className="text-sm text-content-muted">
              La vue 3D ne peut pas démarrer (contexte WebGL non créé). Essaie un autre navigateur ou active
              l&apos;accélération matérielle.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ─── Inner R3F component — controls camera from outside Canvas ────────────────
function CameraController({ view, onDone }: { view: CameraView; onDone?: () => void }) {
  const { camera, controls } = useThree();

  useEffect(() => {
    if (!view) return;
    const orbit = controls as unknown as { target: THREE.Vector3; update: () => void } | null;

    switch (view.type) {
      case 'top':
        camera.position.set(0, 28, 0.01);
        orbit?.target?.set(0, 0, 0);
        break;
      case 'front':
        camera.position.set(0, 5, 26);
        orbit?.target?.set(0, 3, 0);
        break;
      case 'side':
        camera.position.set(26, 5, 0);
        orbit?.target?.set(0, 3, 0);
        break;
      case 'persp':
        camera.position.set(0, 7, 20);
        orbit?.target?.set(0, 3, 0);
        break;
      case 'focus':
        if (view.target) {
          const [tx, ty, tz] = view.target;
          camera.position.set(tx + 4, ty + 5, tz + 10);
          orbit?.target?.set(tx, ty, tz);
        }
        break;
    }

    orbit?.update?.();
    camera.updateProjectionMatrix();
    onDone?.();
  }, [view]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

export function EditorCanvas({ canvasRef, readOnly = false, cameraView, onCameraViewHandled }: EditorCanvasProps) {
  const { state, dispatch } = useSceneEditor();
  const { objects, lights, selectedId, selectedType, transformMode, postProcessing } = state;
  const pp = postProcessing;

  const [isDragging, setIsDragging] = useState(false);

  return (
    <WebGLErrorBoundary>
      <Canvas
        ref={canvasRef ?? null}
        shadows="soft"
        dpr={pp.highQuality ? [1, 2] : [1, 1]}
        frameloop="always"
        gl={{ antialias: true, preserveDrawingBuffer: true, alpha: false }}
        fallback={
          <div className="h-full w-full flex items-center justify-center text-sm text-content-muted">
            WebGL non supporté par ce navigateur.
          </div>
        }
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

        {cameraView && (
          <CameraController view={cameraView} onDone={onCameraViewHandled} />
        )}

        <Suspense fallback={null}>
          <PostProcessingEffects pp={pp} />
        </Suspense>
      </Canvas>
    </WebGLErrorBoundary>
  );
}
