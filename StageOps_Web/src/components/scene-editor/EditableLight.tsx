import { useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { type ThreeEvent } from '@react-three/fiber';
import { TransformControls } from '@react-three/drei';
import { useSceneEditor } from './scene-editor.store';
import { kelvinToHex } from './scene-editor.materials';
import type { SceneLight } from './scene-editor.types';

interface EditableLightProps {
  light: SceneLight;
  isSelected: boolean;
  onDrag: (dragging: boolean) => void;
  readOnly?: boolean;
}

export function EditableLight({ light, isSelected, onDrag, readOnly = false }: EditableLightProps) {
  const { dispatch } = useSceneEditor();
  const helperRef = useRef<THREE.Mesh>(null!);
  const [helperMounted, setHelperMounted] = useState(false);
  const [spotTarget, setSpotTarget] = useState<THREE.Object3D | null>(null);

  const callbackHelperRef = useCallback((node: THREE.Mesh | null) => {
    helperRef.current = node!;
    setHelperMounted(node !== null);
  }, []);

  // Temperature drives colour; light.color is an override tint
  const finalColor = kelvinToHex(light.temperature);

  function handleHelperClick(e: ThreeEvent<MouseEvent>) {
    if (readOnly) return;
    e.stopPropagation?.();
    dispatch({ type: 'SELECT_LIGHT', id: isSelected ? null : light.id });
  }

  function handleObjectChange() {
    if (!helperRef.current) return;
    const pos = helperRef.current.position.toArray() as [number, number, number];
    dispatch({ type: 'UPDATE_LIGHT', id: light.id, updates: { position: pos } });
  }

  if (!light.visible) return null;

  return (
    <group>
      {/* ─ Actual light ─────────────────────────────────────────────── */}
      {light.type === 'directional' && (
        <directionalLight
          position={light.position}
          color={finalColor}
          intensity={light.intensity}
          castShadow={light.castShadow}
          shadow-mapSize={[2048, 2048]}
        />
      )}

      {light.type === 'spot' && (
        <>
          <object3D ref={setSpotTarget} position={light.targetPosition} />
          <spotLight
            position={light.position}
            color={finalColor}
            intensity={light.intensity}
            castShadow={light.castShadow}
            distance={light.distance}
            angle={light.angle}
            penumbra={light.penumbra}
            target={spotTarget ?? undefined}
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.001}
          />
        </>
      )}

      {light.type === 'point' && (
        <pointLight
          position={light.position}
          color={finalColor}
          intensity={light.intensity}
          castShadow={light.castShadow}
          distance={light.distance}
        />
      )}

      {/* rect-area rendered as wide spot */}
      {light.type === 'rect-area' && (
        <spotLight
          position={light.position}
          color={finalColor}
          intensity={light.intensity}
          castShadow={false}
          distance={light.distance || 20}
          angle={Math.PI / 3}
          penumbra={0.9}
        />
      )}

      {/* ─ Helper sphere (hidden in readOnly) ───────────────────────── */}
      {!readOnly && (
        <>
          <mesh
            ref={callbackHelperRef}
            position={light.position}
            onClick={handleHelperClick}
          >
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshBasicMaterial
              color={finalColor}
              transparent
              opacity={isSelected ? 1.0 : 0.85}
            />
          </mesh>

          {/* Halo around helper */}
          <mesh position={light.position}>
            <sphereGeometry args={[0.65, 16, 16]} />
            <meshBasicMaterial color={finalColor} transparent opacity={0.08} />
          </mesh>

          {/* Selection ring around helper */}
          {isSelected && (
            <mesh position={light.position}>
              <sphereGeometry args={[0.55, 16, 16]} />
              <meshBasicMaterial color="#22d3ee" wireframe transparent opacity={0.5} />
            </mesh>
          )}

          {/* ─ SpotLight cone — oriented toward target ─────────────────── */}
          {light.type === 'spot' && (() => {
            const from = new THREE.Vector3(...light.position);
            const to = new THREE.Vector3(...light.targetPosition);
            const dir = to.clone().sub(from).normalize();
            const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
            const euler = new THREE.Euler().setFromQuaternion(q);
            const coneLen = 5;
            const coneR = Math.tan(light.angle) * coneLen;
            const midPos = from.clone().add(dir.clone().multiplyScalar(coneLen / 2));
            return (
              <mesh position={midPos.toArray() as [number, number, number]} rotation={[euler.x, euler.y, euler.z]}>
                <coneGeometry args={[coneR, coneLen, 12, 1, true]} />
                <meshBasicMaterial color={finalColor} wireframe transparent opacity={0.12} />
              </mesh>
            );
          })()}

          {/* ─ DirectionalLight disk + direction arrow ───────────────────── */}
          {light.type === 'directional' && (
            <group position={light.position}>
              {/* Flat disk */}
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.5, 16]} />
                <meshBasicMaterial color={finalColor} transparent opacity={0.25} side={THREE.DoubleSide} />
              </mesh>
              {/* Direction line (towards target) */}
              <mesh rotation={[0, 0, 0]}>
                <cylinderGeometry args={[0.03, 0.03, 2, 6]} />
                <meshBasicMaterial color={finalColor} transparent opacity={0.4} />
              </mesh>
              {/* Arrowhead */}
              <mesh position={[0, -1.3, 0]}>
                <coneGeometry args={[0.12, 0.4, 6]} />
                <meshBasicMaterial color={finalColor} transparent opacity={0.5} />
              </mesh>
            </group>
          )}

          {/* ─ PointLight octahedron ────────────────────────────────────── */}
          {light.type === 'point' && (
            <mesh position={light.position}>
              <octahedronGeometry args={[0.7, 0]} />
              <meshBasicMaterial color={finalColor} wireframe transparent opacity={0.2} />
            </mesh>
          )}

          {/* Transform gizmo on helper */}
          {isSelected && helperMounted && (
            <TransformControls
              object={helperRef}
              mode="translate"
              onObjectChange={handleObjectChange}
              onMouseDown={() => onDrag(true)}
              onMouseUp={() => onDrag(false)}
            />
          )}
        </>
      )}
    </group>
  );
}
