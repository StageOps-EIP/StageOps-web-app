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

  // Source helper sphere
  const helperRef = useRef<THREE.Mesh>(null!);
  const [helperMounted, setHelperMounted] = useState(false);

  // Target octahedron (spot / directional)
  const targetRef = useRef<THREE.Mesh>(null!);
  const [targetMounted, setTargetMounted] = useState(false);

  // SpotLight target object — useState so R3F keeps it wired (position prop, no TC conflict)
  const [spotTargetObj, setSpotTargetObj] = useState<THREE.Object3D | null>(null);

  const [movingTarget, setMovingTarget] = useState(false);

  const finalColor = kelvinToHex(light.temperature);
  const hasTarget = light.type === 'spot' || light.type === 'directional';

  // Callback refs: fire once on mount, give us typed Three.js refs
  const callbackHelperRef = useCallback((node: THREE.Mesh | null) => {
    helperRef.current = node!;
    setHelperMounted(node !== null);
  }, []);

  const callbackTargetRef = useCallback((node: THREE.Mesh | null) => {
    targetRef.current = node!;
    setTargetMounted(node !== null);
  }, []);

  // Real-time dispatch on every TC move (same pattern as EditableObject)
  function handlePositionChange() {
    if (!helperRef.current) return;
    dispatch({
      type: 'UPDATE_LIGHT', id: light.id,
      updates: { position: helperRef.current.position.toArray() as [number, number, number] },
    });
  }
  function handleTargetChange() {
    if (!targetRef.current) return;
    dispatch({
      type: 'UPDATE_LIGHT', id: light.id,
      updates: { targetPosition: targetRef.current.position.toArray() as [number, number, number] },
    });
  }

  function handleHelperClick(e: ThreeEvent<MouseEvent>) {
    if (readOnly) return;
    e.stopPropagation?.();
    dispatch({ type: 'SELECT_LIGHT', id: isSelected && !movingTarget ? null : light.id });
    setMovingTarget(false);
  }
  function handleTargetClick(e: ThreeEvent<MouseEvent>) {
    if (readOnly) return;
    e.stopPropagation?.();
    if (!isSelected) dispatch({ type: 'SELECT_LIGHT', id: light.id });
    setMovingTarget(true);
  }

  if (!light.visible) return null;

  return (
    <group>
      {/* ── Actual Three.js lights (position from store, no TC conflict) ── */}
      {light.type === 'directional' && (
        <directionalLight
          position={light.position}
          color={finalColor}
          intensity={light.intensity}
          castShadow={light.castShadow}
          shadow-mapSize={[2048, 2048]}
          shadow-normalBias={0.05}
        />
      )}

      {light.type === 'spot' && (
        <>
          {/*
           * SpotLight target anchor. Uses `position` PROP (not TC-controlled).
           * setSpotTargetObj is a useState setter → triggers re-render when wired.
           * R3F adds this object3D to the scene, Three.js uses it as spotLight.target.
           */}
          <object3D ref={setSpotTargetObj} position={light.targetPosition} />
          <spotLight
            position={light.position}
            color={finalColor}
            intensity={light.intensity}
            castShadow={light.castShadow}
            distance={light.distance}
            angle={light.angle}
            penumbra={light.penumbra}
            target={spotTargetObj ?? undefined}
            shadow-mapSize={[2048, 2048]}
            shadow-normalBias={0.05}
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

      {/* ── Helpers (editor only) ─────────────────────────────────────── */}
      {!readOnly && (
        <>
          {/* Source sphere — position prop syncs with store between drags */}
          <mesh
            ref={callbackHelperRef}
            position={light.position}
            onClick={handleHelperClick}
          >
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshBasicMaterial color={finalColor} transparent opacity={isSelected && !movingTarget ? 1.0 : 0.85} />
          </mesh>

          {/* Halo */}
          <mesh position={light.position}>
            <sphereGeometry args={[0.65, 16, 16]} />
            <meshBasicMaterial color={finalColor} transparent opacity={0.1} />
          </mesh>

          {/* Selection ring */}
          {isSelected && !movingTarget && (
            <mesh position={light.position}>
              <sphereGeometry args={[0.55, 16, 16]} />
              <meshBasicMaterial color="#22d3ee" wireframe transparent opacity={0.5} />
            </mesh>
          )}

          {/* Target octahedron — position prop syncs with store */}
          {hasTarget && (
            <mesh
              ref={callbackTargetRef}
              position={light.targetPosition}
              onClick={handleTargetClick}
            >
              <octahedronGeometry args={[0.3, 0]} />
              <meshBasicMaterial
                color={isSelected && movingTarget ? '#22d3ee' : finalColor}
                transparent opacity={isSelected ? 0.9 : 0.35}
                wireframe={isSelected && movingTarget}
              />
            </mesh>
          )}

          {/* Line source → target */}
          {hasTarget && isSelected && (() => {
            const from = new THREE.Vector3(...light.position);
            const to   = new THREE.Vector3(...light.targetPosition);
            const dir  = to.clone().sub(from);
            const len  = dir.length();
            if (len < 0.01) return null;
            const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0), dir.clone().normalize());
            const e = new THREE.Euler().setFromQuaternion(q);
            return (
              <mesh position={from.clone().lerp(to, 0.5).toArray() as [number,number,number]} rotation={[e.x,e.y,e.z]}>
                <cylinderGeometry args={[0.02, 0.02, len, 4]} />
                <meshBasicMaterial color={finalColor} transparent opacity={0.35} />
              </mesh>
            );
          })()}

          {/* Spot cone wireframe */}
          {light.type === 'spot' && (() => {
            const from = new THREE.Vector3(...light.position);
            const to   = new THREE.Vector3(...light.targetPosition);
            const dir  = to.clone().sub(from);
            const len  = dir.length();
            if (len < 0.01) return null;
            const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0), dir.clone().normalize());
            const e = new THREE.Euler().setFromQuaternion(q);
            const coneLen = Math.min(len, 8);
            const coneR   = Math.tan(light.angle) * coneLen;
            return (
              <mesh
                position={from.clone().add(dir.clone().normalize().multiplyScalar(coneLen/2)).toArray() as [number,number,number]}
                rotation={[e.x,e.y,e.z]}
              >
                <coneGeometry args={[coneR, coneLen, 12, 1, true]} />
                <meshBasicMaterial color={finalColor} wireframe transparent opacity={0.14} />
              </mesh>
            );
          })()}

          {/* Directional arrow */}
          {light.type === 'directional' && (
            <group position={light.position}>
              <mesh rotation={[Math.PI/2,0,0]}>
                <circleGeometry args={[0.5, 16]} />
                <meshBasicMaterial color={finalColor} transparent opacity={0.25} side={THREE.DoubleSide} />
              </mesh>
              <mesh>
                <cylinderGeometry args={[0.03,0.03,2,6]} />
                <meshBasicMaterial color={finalColor} transparent opacity={0.4} />
              </mesh>
              <mesh position={[0,-1.3,0]}>
                <coneGeometry args={[0.12,0.4,6]} />
                <meshBasicMaterial color={finalColor} transparent opacity={0.5} />
              </mesh>
            </group>
          )}

          {/* Point octahedron */}
          {light.type === 'point' && (
            <mesh position={light.position}>
              <octahedronGeometry args={[0.7, 0]} />
              <meshBasicMaterial color={finalColor} wireframe transparent opacity={0.2} />
            </mesh>
          )}

          {/* TC on SOURCE — real-time dispatch (same as EditableObject) */}
          {isSelected && !movingTarget && helperMounted && (
            <TransformControls
              object={helperRef}
              mode="translate"
              onObjectChange={handlePositionChange}
              onMouseDown={() => onDrag(true)}
              onMouseUp={() => onDrag(false)}
            />
          )}

          {/* TC on TARGET */}
          {isSelected && movingTarget && hasTarget && targetMounted && (
            <TransformControls
              object={targetRef}
              mode="translate"
              onObjectChange={handleTargetChange}
              onMouseDown={() => onDrag(true)}
              onMouseUp={() => onDrag(false)}
            />
          )}
        </>
      )}
    </group>
  );
}
