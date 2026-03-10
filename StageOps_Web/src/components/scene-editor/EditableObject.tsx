import { useRef, useState, useCallback } from 'react';
import type * as THREE from 'three';
import { type ThreeEvent } from '@react-three/fiber';
import { TransformControls } from '@react-three/drei';
import { useSceneEditor } from './scene-editor.store';
import type { SceneObject, TransformMode } from './scene-editor.types';

interface EditableObjectProps {
  object: SceneObject;
  isSelected: boolean;
  transformMode: TransformMode;
  onDrag: (dragging: boolean) => void;
  readOnly?: boolean;
}

export function EditableObject({ object, isSelected, transformMode, onDrag, readOnly = false }: EditableObjectProps) {
  const { dispatch, state } = useSceneEditor();
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  const callbackMeshRef = useCallback((node: THREE.Mesh | null) => {
    meshRef.current = node!;
    setMounted(node !== null);
  }, []);

  const { material, geometry, position, rotation, scale, visible, locked, type } = object;
  const { snapEnabled } = state;

  const SNAP = 0.5;
  function snapVal(v: number) { return Math.round(v / SNAP) * SNAP; }

  function handleClick(e: ThreeEvent<MouseEvent>) {
    if (readOnly) return;
    e.stopPropagation?.();
    if (isSelected) {
      dispatch({ type: 'DESELECT' });
    } else {
      dispatch({ type: 'SELECT_OBJECT', id: object.id });
    }
  }

  function handleObjectChange() {
    if (!meshRef.current) return;
    const mesh = meshRef.current;
    const pos = mesh.position.toArray() as [number, number, number];
    dispatch({
      type: 'UPDATE_OBJECT',
      id: object.id,
      updates: {
        position: snapEnabled ? [snapVal(pos[0]), snapVal(pos[1]), snapVal(pos[2])] : pos,
        rotation: [mesh.rotation.x, mesh.rotation.y, mesh.rotation.z],
        scale: mesh.scale.toArray() as [number, number, number],
      },
    });
  }

  if (!visible) return null;

  // Outline mesh: slightly bigger, wireframe cyan
  const outlineScale: [number, number, number] = [
    scale[0] * 1.02,
    scale[1] * 1.02,
    scale[2] * 1.02,
  ];

  return (
    <group>
      <mesh
        ref={callbackMeshRef}
        position={position}
        rotation={rotation}
        scale={scale}
        castShadow
        receiveShadow
        onClick={handleClick}
        onPointerOver={readOnly ? undefined : () => setHovered(true)}
        onPointerOut={readOnly ? undefined : () => setHovered(false)}
      >
        {type === 'box' || type === 'equipment' ? (
          <boxGeometry args={[geometry.width, geometry.height, geometry.depth]} />
        ) : type === 'plane' ? (
          <planeGeometry args={[geometry.width, geometry.height]} />
        ) : (
          <cylinderGeometry args={[geometry.width / 2, geometry.width / 2, geometry.height, 32]} />
        )}
        <meshStandardMaterial
          color={material.color}
          roughness={material.roughness}
          metalness={material.metalness}
          emissive={material.emissive}
          emissiveIntensity={material.emissiveIntensity}
          transparent={material.opacity < 1}
          opacity={material.opacity}
          wireframe={material.wireframe}
        />
      </mesh>

      {/* Selection outline — hidden in readOnly */}
      {isSelected && !readOnly && (
        <mesh
          position={position}
          rotation={rotation}
          scale={outlineScale}
        >
          {type === 'box' || type === 'equipment' ? (
            <boxGeometry args={[geometry.width, geometry.height, geometry.depth]} />
          ) : type === 'plane' ? (
            <planeGeometry args={[geometry.width, geometry.height]} />
          ) : (
            <cylinderGeometry args={[geometry.width / 2, geometry.width / 2, geometry.height, 32]} />
          )}
          <meshBasicMaterial color="#22d3ee" wireframe transparent opacity={0.6} />
        </mesh>
      )}

      {/* Hover outline — hidden in readOnly */}
      {hovered && !isSelected && !readOnly && (
        <mesh position={position} rotation={rotation} scale={outlineScale}>
          {type === 'box' || type === 'equipment' ? (
            <boxGeometry args={[geometry.width, geometry.height, geometry.depth]} />
          ) : type === 'plane' ? (
            <planeGeometry args={[geometry.width, geometry.height]} />
          ) : (
            <cylinderGeometry args={[geometry.width / 2, geometry.width / 2, geometry.height, 32]} />
          )}
          <meshBasicMaterial color="#71717a" wireframe transparent opacity={0.4} />
        </mesh>
      )}

      {/* Transform gizmo — hidden in readOnly */}
      {isSelected && !locked && mounted && !readOnly && (
        <TransformControls
          object={meshRef}
          mode={transformMode}
          onObjectChange={handleObjectChange}
          onMouseDown={() => onDrag(true)}
          onMouseUp={() => onDrag(false)}
        />
      )}
    </group>
  );
}
