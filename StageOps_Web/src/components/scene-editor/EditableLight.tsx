import { useRef, useState, useCallback, useMemo } from 'react'
import * as THREE from 'three'
import { type ThreeEvent } from '@react-three/fiber'
import { TransformControls } from '@react-three/drei'
import { useSceneEditor } from '@/hooks/useSceneEditor'
import type { SceneLight } from '@/domain/scene-models'
import { FloorPool } from './FloorPool'
import { LightBeam } from './LightBeam'
import { physicalIntensity } from './render-quality'

interface EditableLightProps {
  light: SceneLight
  isSelected: boolean
  onDrag: (dragging: boolean) => void
  readOnly?: boolean
  /** Within the real-time light budget; otherwise simulated by its beam and floor pool. */
  real: boolean
  /** Whether this light is within the shadow budget of the current quality level. */
  castsShadow: boolean
  shadowMapSize: number
  showBeam: boolean
}

const UP = new THREE.Vector3(0, 1, 0)

/** Wireframe cone showing where a spot points, only in the editor. */
function SpotGuide({ light, color }: { light: SceneLight; color: string }) {
  const { position, quaternion, radius } = useMemo(() => {
    const from = new THREE.Vector3(...light.position)
    const direction = new THREE.Vector3(...light.targetPosition).sub(from).normalize()
    const length = 5
    return {
      position: from.add(direction.clone().multiplyScalar(length / 2)).toArray() as [
        number,
        number,
        number,
      ],
      quaternion: new THREE.Quaternion().setFromUnitVectors(UP, direction.negate()),
      radius: Math.tan(Math.min(light.angle, 1.3)) * length,
    }
  }, [light.position, light.targetPosition, light.angle])
  return (
    <mesh position={position} quaternion={quaternion} raycast={() => null}>
      <coneGeometry args={[radius, 5, 12, 1, true]} />
      <meshBasicMaterial color={color} wireframe transparent opacity={0.12} />
    </mesh>
  )
}

export function EditableLight({
  light,
  isSelected,
  onDrag,
  readOnly = false,
  real,
  castsShadow,
  shadowMapSize,
  showBeam,
}: EditableLightProps) {
  const { select, clearSelection, updateLight, beginGesture, endGesture } = useSceneEditor()
  const helperRef = useRef<THREE.Mesh>(null!)
  const [helperMounted, setHelperMounted] = useState(false)
  const [spotTarget, setSpotTarget] = useState<THREE.Object3D | null>(null)

  const callbackHelperRef = useCallback((node: THREE.Mesh | null) => {
    helperRef.current = node!
    setHelperMounted(node !== null)
  }, [])

  // The colour follows the temperature when it is set and can be overridden (gel filter).
  const color = light.color
  const intensity = physicalIntensity(light)
  const shadow = {
    castShadow: castsShadow,
    'shadow-mapSize': [shadowMapSize, shadowMapSize] as [number, number],
    'shadow-bias': -0.0005,
    'shadow-normalBias': 0.02,
  }

  function handleHelperClick(e: ThreeEvent<MouseEvent>) {
    if (readOnly) return
    e.stopPropagation?.()
    if (isSelected) clearSelection()
    else select({ kind: 'light', id: light.id })
  }

  function handleObjectChange() {
    if (!helperRef.current) return
    const pos = helperRef.current.position.toArray() as [number, number, number]
    updateLight(light.id, { position: pos })
  }

  if (!light.visible) return null
  const isSpot = light.type === 'spot' || light.type === 'rect-area'

  return (
    <group>
      {real && light.type === 'directional' && (
        <directionalLight
          position={light.position}
          color={color}
          intensity={intensity}
          {...shadow}
          shadow-camera-left={-14}
          shadow-camera-right={14}
          shadow-camera-top={12}
          shadow-camera-bottom={-12}
          shadow-camera-far={60}
        />
      )}

      {isSpot && (
        <>
          <object3D ref={setSpotTarget} position={light.targetPosition} />
          {real ? (
            <spotLight
              position={light.position}
              color={color}
              intensity={intensity}
              distance={light.distance || 30}
              decay={2}
              // A "rect-area" light is rendered as a wide, soft spot.
              angle={light.type === 'rect-area' ? Math.PI / 3 : light.angle}
              penumbra={light.type === 'rect-area' ? 0.9 : light.penumbra}
              target={spotTarget ?? undefined}
              {...shadow}
              shadow-camera-near={0.5}
              shadow-camera-far={light.distance || 30}
            />
          ) : (
            <FloorPool light={light} color={color} />
          )}
          {showBeam && <LightBeam light={light} color={color} />}
        </>
      )}

      {real && light.type === 'point' && (
        <pointLight
          position={light.position}
          color={color}
          intensity={intensity}
          distance={light.distance}
          decay={2}
        />
      )}

      {/* ─ Editor helpers (hidden in the read-only stage view) ─────────── */}
      {!readOnly && (
        <>
          <mesh ref={callbackHelperRef} position={light.position} onClick={handleHelperClick}>
            <sphereGeometry args={[0.3, 12, 8]} />
            <meshBasicMaterial color={color} transparent opacity={isSelected ? 1 : 0.8} />
          </mesh>
          {isSelected && (
            <mesh position={light.position} raycast={() => null}>
              <sphereGeometry args={[0.45, 12, 8]} />
              <meshBasicMaterial color="#7964ff" wireframe transparent opacity={0.6} />
            </mesh>
          )}
          {light.type === 'spot' && isSelected && <SpotGuide light={light} color={color} />}
          {light.type === 'point' && (
            <mesh position={light.position} raycast={() => null}>
              <octahedronGeometry args={[0.55, 0]} />
              <meshBasicMaterial color={color} wireframe transparent opacity={0.2} />
            </mesh>
          )}
          {light.type === 'directional' && (
            <mesh position={light.position} rotation={[Math.PI / 2, 0, 0]} raycast={() => null}>
              <circleGeometry args={[0.5, 16]} />
              <meshBasicMaterial color={color} transparent opacity={0.25} side={THREE.DoubleSide} />
            </mesh>
          )}

          {isSelected && helperMounted && (
            <TransformControls
              object={helperRef}
              mode="translate"
              onObjectChange={handleObjectChange}
              onMouseDown={() => {
                beginGesture()
                onDrag(true)
              }}
              onMouseUp={() => {
                endGesture()
                onDrag(false)
              }}
            />
          )}
        </>
      )}
    </group>
  )
}
