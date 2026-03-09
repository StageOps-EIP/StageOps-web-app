import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { GRID_HEIGHT } from './stage3d.constants';
import { StageGeometry } from './StageGeometry';
import { EquipmentMarker } from './EquipmentMarker';
import { CameraController } from './CameraController';
import type { Stage3DCanvasProps } from './stage3d.types';

/**
 * Main Three.js canvas for the stage view.
 * preserveDrawingBuffer: true is required for PNG export via canvas.toDataURL().
 */
export function Stage3DCanvas({
  equipment,
  selectedEquipment,
  onSelectEquipment,
  viewMode,
  canvasRef,
}: Stage3DCanvasProps) {
  const orbitRef = useRef<OrbitControlsImpl | null>(null);

  return (
    <Canvas
      ref={canvasRef as React.RefObject<HTMLCanvasElement>}
      shadows
      dpr={[1, 2]}
      frameloop="demand"
      gl={{
        antialias: true,
        alpha: false,
        preserveDrawingBuffer: true,
      }}
      camera={{ position: [0, 14, 20], fov: 50, near: 0.1, far: 200 }}
      style={{ background: '#0a0a0b', width: '100%', height: '100%' }}
      onPointerMissed={() => onSelectEquipment(null)}
    >
      <Suspense fallback={null}>
        {/* Depth fog for atmosphere */}
        <fog attach="fog" args={['#0a0a0b', 25, 65]} />

        {/* Camera animation + orbit toggle */}
        <CameraController viewMode={viewMode} orbitRef={orbitRef} />

        {/* ── Lighting ── */}
        {/* Soft ambient fill */}
        <ambientLight intensity={0.25} />

        {/* Main key light (slightly warm) */}
        <directionalLight
          position={[8, 18, 8]}
          intensity={0.9}
          color="#fff5e6"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.5}
          shadow-camera-far={80}
          shadow-camera-left={-15}
          shadow-camera-right={15}
          shadow-camera-top={15}
          shadow-camera-bottom={-15}
        />

        {/* Cyan overhead wash — mimics stage wash from gril */}
        <pointLight position={[0, GRID_HEIGHT, 0]} intensity={0.7} color="#22d3ee" distance={40} />

        {/* Warm lateral spot — Jardin (left) */}
        <spotLight
          position={[-14, 12, 0]}
          target-position={[0, 0, 0]}
          intensity={0.8}
          color="#ffb347"
          angle={0.55}
          penumbra={0.6}
          distance={40}
          castShadow={false}
        />

        {/* Cool lateral spot — Cour (right) */}
        <spotLight
          position={[14, 12, 0]}
          target-position={[0, 0, 0]}
          intensity={0.6}
          color="#7ec8e3"
          angle={0.55}
          penumbra={0.6}
          distance={40}
          castShadow={false}
        />

        {/* Theatre geometry */}
        <StageGeometry />

        {/* Equipment markers */}
        {equipment.map((eq) =>
          eq.position ? (
            <EquipmentMarker
              key={eq.id}
              equipment={eq}
              isSelected={selectedEquipment?.id === eq.id}
              onSelect={onSelectEquipment}
            />
          ) : null,
        )}

        {/* Orbit controls */}
        <OrbitControls
          ref={orbitRef}
          makeDefault
          enableDamping
          dampingFactor={0.08}
        />
      </Suspense>
    </Canvas>
  );
}
