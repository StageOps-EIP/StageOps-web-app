import * as THREE from 'three';
import { useMemo } from 'react';
import { type ThreeEvent } from '@react-three/fiber';
import { useSceneEditor } from './scene-editor.store';
import { kelvinToHex } from './scene-editor.materials';
import type { SurfaceKey, SceneMaterial } from './scene-editor.types';

function useLightPoolTexture(hexColor: string) {
  return useMemo(() => {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    grad.addColorStop(0,   `rgba(${r},${g},${b},0.6)`);
    grad.addColorStop(0.4, `rgba(${r},${g},${b},0.25)`);
    grad.addColorStop(1,   `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }, [hexColor]);
}

function LightPool({ hexColor, radius, position }: { hexColor: string; radius: number; position: [number, number, number] }) {
  const tex = useLightPoolTexture(hexColor);
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[radius, 64]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

function DynamicLightPools() {
  const { state } = useSceneEditor();
  const { lights } = state;
  return (
    <>
      {lights
        .filter((l) => l.type === 'spot' && l.visible)
        .map((l) => {
          const [lx, ly, lz] = l.position;
          const [tx, , tz] = l.targetPosition;
          // Project spotlight onto floor: find where the ray hits y=0
          const dx = tx - lx;
          const dz = tz - lz;
          const t = ly > 0 ? ly / ly : 1; // t=1 → target at floor level
          const px = lx + dx * t;
          const pz = lz + dz * t;
          // Radius: tan(angle) * distance from light to target
          const dist = Math.sqrt(dx * dx + ly * ly + dz * dz);
          const radius = Math.tan(l.angle) * dist * 0.65; // penumbra spread
          const hexColor = kelvinToHex(l.temperature);
          return (
            <LightPool
              key={l.id}
              hexColor={hexColor}
              radius={Math.min(radius, 5)}
              position={[px, 0.01, pz]}
            />
          );
        })}
    </>
  );
}

function SurfaceMesh({
  surfaceKey,
  material,
  position,
  rotation,
  geometry,
  side,
}: {
  surfaceKey: SurfaceKey;
  material: SceneMaterial;
  position: [number, number, number];
  rotation: [number, number, number];
  geometry: [number, number];
  side?: THREE.Side;
}) {
  const { dispatch } = useSceneEditor();

  function handleClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation?.();
    dispatch({ type: 'SELECT_SURFACE', surface: surfaceKey });
  }

  return (
    <mesh
      position={position}
      rotation={rotation}
      receiveShadow
      onClick={handleClick}
    >
      <planeGeometry args={geometry} />
      <meshStandardMaterial
        color={material.color}
        roughness={material.roughness}
        metalness={material.metalness}
        emissive={material.emissive}
        emissiveIntensity={material.emissiveIntensity}
        transparent={material.opacity < 1}
        opacity={material.opacity}
        wireframe={material.wireframe}
        side={side ?? THREE.FrontSide}
      />
    </mesh>
  );
}

export function SurfaceObjects() {
  const { state } = useSceneEditor();
  const { surfaces, stageSize } = state;
  const SW = stageSize.width;
  const SD = stageSize.depth;
  const GH = stageSize.height;
  const HW = SW / 2;
  const HD = SD / 2;
  const grilCount = Math.max(2, Math.round(SD / 3) + 1);

  return (
    <group>
      {/* Wall edge pillars */}
      {[[-HW, -HD], [-HW, HD], [HW, -HD], [HW, HD]].map(([x, z], i) => (
        <mesh key={`pillar-${i}`} position={[x, GH / 2, z]}>
          <boxGeometry args={[0.1, GH, 0.1]} />
          <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.3} roughness={0.5} />
        </mesh>
      ))}
      <gridHelper
        args={[SW, Math.max(4, Math.round(SW / 2)), '#3a3a48', '#2a2a36']}
        position={[0, 0.003, 0]}
        scale={[1, 1, SD / SW]}
      />

      {/* Gril bars */}
      {Array.from({ length: grilCount }, (_, i) => {
        const z = -HD + i * (SD / (grilCount - 1));
        return (
          <group key={`pipe-${i}`}>
            <mesh position={[0, GH, z]}>
              <boxGeometry args={[SW, 0.12, 0.12]} />
              <meshStandardMaterial color="#2a2a32" metalness={0.85} roughness={0.25} />
            </mesh>
            <pointLight position={[0, GH - 0.3, z]} color="#00e5ff" intensity={0.1} distance={6} />
          </group>
        );
      })}

      {/* Avant-scène edge */}
      <mesh position={[0, 0.06, HD]}>
        <boxGeometry args={[SW, 0.12, 0.3]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1.2} roughness={0.3} metalness={0.3} />
      </mesh>
      <pointLight position={[0, 0.3, HD]} color="#22d3ee" intensity={0.8} distance={4} />

      {/* Floor */}
      <SurfaceMesh
        surfaceKey="floor"
        material={surfaces.floor}
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        geometry={[SW, SD]}
      />

      <DynamicLightPools />

      {/* Back wall */}
      <SurfaceMesh
        surfaceKey="backWall"
        material={surfaces.backWall}
        position={[0, GH / 2, -HD]}
        rotation={[0, 0, 0]}
        geometry={[SW, GH]}
        side={THREE.DoubleSide}
      />

      {/* Left wall (jardin) */}
      <SurfaceMesh
        surfaceKey="leftWall"
        material={surfaces.leftWall}
        position={[-HW, GH / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
        geometry={[SD, GH]}
        side={THREE.DoubleSide}
      />

      {/* Right wall (cour) */}
      <SurfaceMesh
        surfaceKey="rightWall"
        material={surfaces.rightWall}
        position={[HW, GH / 2, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        geometry={[SD, GH]}
        side={THREE.DoubleSide}
      />

      {/* Ceiling */}
      <SurfaceMesh
        surfaceKey="ceiling"
        material={surfaces.ceiling}
        position={[0, GH, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        geometry={[SW, SD]}
        side={THREE.DoubleSide}
      />
    </group>
  );
}
