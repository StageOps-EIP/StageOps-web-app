import React, { memo, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import {
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  STATUS_COLORS,
  mapPosition,
} from './stage3d.constants';
import type { EquipmentMarkerProps } from './stage3d.types';

export const EquipmentMarker = memo(function EquipmentMarker({
  equipment,
  isSelected,
  onSelect,
}: EquipmentMarkerProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const [isHovered, setIsHovered] = useState(false);

  // All hooks BEFORE any early return
  useFrame(() => {
    if (!meshRef.current || !equipment.position) return;
    const target = isSelected ? 1.4 : isHovered ? 1.15 : 1.0;
    meshRef.current.scale.lerp(
      new THREE.Vector3(target, target, target),
      0.12,
    );
  });

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      onSelect(equipment);
    },
    [equipment, onSelect],
  );

  const handlePointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsHovered(true);
    document.body.style.cursor = 'pointer';
  }, []);

  const handlePointerOut = useCallback(() => {
    setIsHovered(false);
    document.body.style.cursor = 'auto';
  }, []);

  // Guard AFTER all hooks
  if (!equipment.position) return null;

  const [px, py, pz] = mapPosition(equipment.position);
  const categoryColor = CATEGORY_COLORS[equipment.category] ?? '#ffffff';
  const statusColor   = STATUS_COLORS[equipment.status]     ?? '#ffffff';
  const icon          = CATEGORY_ICONS[equipment.category]  ?? '?';

  const emissiveIntensity = isSelected ? 1.5 : isHovered ? 0.8 : 0.2;

  return (
    <group position={[px, py + 0.4, pz]}>
      {/* Main cube */}
      <mesh
        ref={meshRef}
        castShadow
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial
          color={categoryColor}
          emissive={statusColor}
          emissiveIntensity={emissiveIntensity}
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>

      {/* Selection ring */}
      {isSelected && (
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.7, 0.06, 8, 32]} />
          <meshStandardMaterial
            color={statusColor}
            emissive={statusColor}
            emissiveIntensity={2}
            wireframe={false}
          />
        </mesh>
      )}

      {/* Category icon — always visible, above cube */}
      <Html center distanceFactor={10} position={[0, 0.8, 0]}>
        <div
          className="text-base leading-none pointer-events-none select-none"
          style={{ textShadow: '0 0 6px rgba(0,0,0,0.8)' }}
        >
          {icon}
        </div>
      </Html>

      {/* Hover tooltip */}
      {isHovered && (
        <Html center distanceFactor={8} position={[0, 1.4, 0]}>
          <div className="px-2 py-1 bg-theme-base/90 border border-theme-border rounded text-xs text-content-primary whitespace-nowrap pointer-events-none select-none shadow-lg">
            <span className="font-medium">{equipment.name}</span>
            <br />
            <span className="text-content-subtle">{equipment.location}</span>
          </div>
        </Html>
      )}
    </group>
  );
});
