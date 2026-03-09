import * as THREE from 'three';
import { useMemo } from 'react';
import { type ThreeEvent } from '@react-three/fiber';
import { useSceneEditor } from './scene-editor.store';
import { STAGE_WIDTH, STAGE_DEPTH, GRID_HEIGHT } from '../stage3d/stage3d.constants';
import { kelvinToHex } from './scene-editor.materials';
import type { SurfaceKey, SceneMaterial } from './scene-editor.types';

const HW = STAGE_WIDTH / 2;  // 12
const HD = STAGE_DEPTH / 2;  // 9

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
  const { surfaces } = state;

  return (
    <group>
      {/* Wall edge pillars — architectural definition */}
      {[[-HW, -HD], [-HW, HD], [HW, -HD], [HW, HD]].map(([x, z], i) => (
        <mesh key={`pillar-${i}`} position={[x, GRID_HEIGHT / 2, z]}>
          <boxGeometry args={[0.1, GRID_HEIGHT, 0.1]} />
          <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.3} roughness={0.5} />
        </mesh>
      ))}
      <gridHelper
        args={[STAGE_WIDTH, STAGE_WIDTH / 2, '#2a2a32', '#1e1e26']}
        position={[0, 0.003, 0]}
        scale={[1, 1, STAGE_DEPTH / STAGE_WIDTH]}
      />

      {/* Gril bars */}
      {Array.from({ length: 7 }, (_, i) => {
        const z = -HD + i * 3;
        return (
          <group key={`pipe-${i}`}>
            <mesh position={[0, GRID_HEIGHT, z]} castShadow>
              <boxGeometry args={[STAGE_WIDTH, 0.12, 0.12]} />
              <meshStandardMaterial color="#2a2a32" metalness={0.85} roughness={0.25} />
            </mesh>
            {/* PAR simulation: subtle cyan fill under each bar */}
            <pointLight
              position={[0, GRID_HEIGHT - 0.3, z]}
              color="#00e5ff"
              intensity={0.1}
              distance={6}
            />
          </group>
        );
      })}

      {/* Avant-scène edge */}
      <mesh position={[0, 0.06, HD]} castShadow>
        <boxGeometry args={[STAGE_WIDTH, 0.12, 0.3]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#22d3ee"
          emissiveIntensity={1.2}
          roughness={0.3}
          metalness={0.3}
        />
      </mesh>
      <pointLight position={[0, 0.3, HD]} color="#22d3ee" intensity={0.8} distance={4} />

      {/* Floor */}
      <SurfaceMesh
        surfaceKey="floor"
        material={surfaces.floor}
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        geometry={[STAGE_WIDTH, STAGE_DEPTH]}
      />

      {/* Light pools — dynamic, follow spot positions from store */}
      <DynamicLightPools />

      {/* Back wall */}
      <SurfaceMesh
        surfaceKey="backWall"
        material={surfaces.backWall}
        position={[0, GRID_HEIGHT / 2, -HD]}
        rotation={[0, 0, 0]}
        geometry={[STAGE_WIDTH, GRID_HEIGHT]}
        side={THREE.DoubleSide}
      />

      {/* Left wall (jardin, -X) */}
      <SurfaceMesh
        surfaceKey="leftWall"
        material={surfaces.leftWall}
        position={[-HW, GRID_HEIGHT / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
        geometry={[STAGE_DEPTH, GRID_HEIGHT]}
        side={THREE.DoubleSide}
      />

      {/* Right wall (cour, +X) */}
      <SurfaceMesh
        surfaceKey="rightWall"
        material={surfaces.rightWall}
        position={[HW, GRID_HEIGHT / 2, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        geometry={[STAGE_DEPTH, GRID_HEIGHT]}
        side={THREE.DoubleSide}
      />

      {/* Ceiling */}
      <SurfaceMesh
        surfaceKey="ceiling"
        material={surfaces.ceiling}
        position={[0, GRID_HEIGHT, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        geometry={[STAGE_WIDTH, STAGE_DEPTH]}
        side={THREE.DoubleSide}
      />
    </group>
  );
}
