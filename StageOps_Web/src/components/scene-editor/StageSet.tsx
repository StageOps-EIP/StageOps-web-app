import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { type ThreeEvent } from '@react-three/fiber'
import { useSceneEditor } from '@/hooks/useSceneEditor'
import {
  GRID_HEIGHT,
  STAGE_DEPTH,
  STAGE_WIDTH,
  type SceneMaterial,
  type SurfaceKey,
} from '@/domain/scene-models'
import { useRenderTier } from './render-context'
import { audienceSeatGeometry } from './scene-geometries'

/*
 * Italian-style theatre built around the editable stage volume (24 × 18 m, grid at 10 m):
 * stage raised 1 m above the house, proscenium, three pairs of legs with borders, grid
 * battens and audience rows. Everything is static and lit only by the scene's own lights;
 * repeated parts (battens, seats) are instanced into a single draw call each.
 */

const HW = STAGE_WIDTH / 2
const HD = STAGE_DEPTH / 2
const STAGE_HEIGHT = 1
const OPENING_WIDTH = 16
const OPENING_HEIGHT = 7.5
const LEG_POSITIONS = [5, 1, -3]
const BATTEN_POSITIONS = [-7.5, -5, -2.5, 0, 2.5, 5, 7.5]
const SEAT_ROWS = 8
const SEATS_PER_ROW = 18

const velvet = new THREE.MeshLambertMaterial({ color: '#0c0c11' })
const houseFloor = new THREE.MeshLambertMaterial({ color: '#16161c' })
const seatFabric = new THREE.MeshLambertMaterial({ color: '#3d1820' })
const battenSteel = new THREE.MeshStandardMaterial({
  color: '#2a2a32',
  roughness: 0.35,
  metalness: 0.8,
})
const marking = new THREE.MeshBasicMaterial({ color: '#3977ff', transparent: true, opacity: 0.18 })

function SurfaceMesh({
  surfaceKey,
  material,
  position,
  rotation,
  size,
  readOnly,
}: {
  surfaceKey: SurfaceKey
  material: SceneMaterial
  position: [number, number, number]
  rotation: [number, number, number]
  size: [number, number]
  readOnly: boolean
}) {
  const { select } = useSceneEditor()
  const eco = useRenderTier() === 'eco'
  // Surfaces face the inside of the stage: seen from outside (top view, behind the set) they
  // disappear, like a cutaway model.
  const side = THREE.FrontSide
  function handleClick(e: ThreeEvent<MouseEvent>) {
    if (readOnly) return
    e.stopPropagation?.()
    select({ kind: 'surface', id: surfaceKey })
  }
  return (
    <mesh position={position} rotation={rotation} receiveShadow onClick={handleClick}>
      <planeGeometry args={size} />
      {eco ? (
        <meshLambertMaterial
          color={material.color}
          emissive={material.emissive}
          emissiveIntensity={material.emissiveIntensity}
          transparent={material.opacity < 1}
          opacity={material.opacity}
          wireframe={material.wireframe}
          side={side}
        />
      ) : (
        <meshStandardMaterial
          color={material.color}
          roughness={material.roughness}
          metalness={material.metalness}
          emissive={material.emissive}
          emissiveIntensity={material.emissiveIntensity}
          transparent={material.opacity < 1}
          opacity={material.opacity}
          wireframe={material.wireframe}
          side={side}
        />
      )}
    </mesh>
  )
}

/** Writes the matrices of an instanced mesh once. */
function useInstances(matrices: THREE.Matrix4[]) {
  const ref = useRef<THREE.InstancedMesh>(null)
  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    matrices.forEach((matrix, i) => mesh.setMatrixAt(i, matrix))
    mesh.instanceMatrix.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [matrices])
  return ref
}

function Audience() {
  const matrices = useMemo(() => {
    const result: THREE.Matrix4[] = []
    for (let row = 0; row < SEAT_ROWS; row++) {
      for (let seat = 0; seat < SEATS_PER_ROW; seat++) {
        const x = (seat - (SEATS_PER_ROW - 1) / 2) * 0.58 + (seat >= SEATS_PER_ROW / 2 ? 0.6 : -0.6)
        result.push(
          new THREE.Matrix4().makeTranslation(x, -STAGE_HEIGHT + row * 0.2, HD + 3 + row * 1.0),
        )
      }
    }
    return result
  }, [])
  const ref = useInstances(matrices)
  return (
    <instancedMesh
      ref={ref}
      args={[audienceSeatGeometry(), seatFabric, matrices.length]}
      raycast={() => null}
      dispose={null}
    />
  )
}

function Battens() {
  const matrices = useMemo(
    () => BATTEN_POSITIONS.map((z) => new THREE.Matrix4().makeTranslation(0, GRID_HEIGHT - 1.2, z)),
    [],
  )
  const ref = useInstances(matrices)
  const geometry = useMemo(
    () => new THREE.CylinderGeometry(0.03, 0.03, 18, 8).rotateZ(Math.PI / 2),
    [],
  )
  return (
    <instancedMesh ref={ref} args={[geometry, battenSteel, matrices.length]} raycast={() => null} />
  )
}

/** Proscenium, legs and borders: black soft goods framing the acting area. */
function Masking() {
  const legX = OPENING_WIDTH / 2 - 1 + 1.25
  return (
    <group>
      {/* Proscenium */}
      {[-1, 1].map((side) => (
        <mesh
          key={`jamb-${side}`}
          material={velvet}
          position={[
            side * (OPENING_WIDTH / 2 + (HW - OPENING_WIDTH / 2) / 2),
            GRID_HEIGHT / 2,
            HD - 0.3,
          ]}
          raycast={() => null}
        >
          <boxGeometry args={[HW - OPENING_WIDTH / 2, GRID_HEIGHT, 0.4]} />
        </mesh>
      ))}
      <mesh
        material={velvet}
        position={[0, OPENING_HEIGHT + (GRID_HEIGHT - OPENING_HEIGHT) / 2, HD - 0.3]}
        raycast={() => null}
      >
        <boxGeometry args={[OPENING_WIDTH, GRID_HEIGHT - OPENING_HEIGHT, 0.4]} />
      </mesh>
      {/* Legs (pendrillons) and borders (frises) */}
      {LEG_POSITIONS.map((z) => (
        <group key={z}>
          {[-1, 1].map((side) => (
            <mesh
              key={side}
              material={velvet}
              position={[side * legX, 4, z]}
              receiveShadow
              raycast={() => null}
            >
              <boxGeometry args={[2.5, 8, 0.04]} />
            </mesh>
          ))}
          <mesh material={velvet} position={[0, 7.6, z]} raycast={() => null}>
            <boxGeometry args={[OPENING_WIDTH + 2, 1.2, 0.04]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export function StageSet({
  readOnly = false,
  dressing,
}: {
  readOnly?: boolean
  dressing: boolean
}) {
  const { surfaces } = useSceneEditor().scene
  return (
    <group>
      <SurfaceMesh
        surfaceKey="floor"
        material={surfaces.floor}
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        size={[STAGE_WIDTH, STAGE_DEPTH]}
        readOnly={readOnly}
      />
      <SurfaceMesh
        surfaceKey="backWall"
        material={surfaces.backWall}
        position={[0, GRID_HEIGHT / 2, -HD]}
        rotation={[0, 0, 0]}
        size={[STAGE_WIDTH, GRID_HEIGHT]}
        readOnly={readOnly}
      />
      <SurfaceMesh
        surfaceKey="leftWall"
        material={surfaces.leftWall}
        position={[-HW, GRID_HEIGHT / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
        size={[STAGE_DEPTH, GRID_HEIGHT]}
        readOnly={readOnly}
      />
      <SurfaceMesh
        surfaceKey="rightWall"
        material={surfaces.rightWall}
        position={[HW, GRID_HEIGHT / 2, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        size={[STAGE_DEPTH, GRID_HEIGHT]}
        readOnly={readOnly}
      />
      <SurfaceMesh
        surfaceKey="ceiling"
        material={surfaces.ceiling}
        position={[0, GRID_HEIGHT, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        size={[STAGE_WIDTH, STAGE_DEPTH]}
        readOnly={readOnly}
      />

      {/* Stage front (nez de scène) and floor markings: centre line and front edge */}
      <mesh material={velvet} position={[0, -STAGE_HEIGHT / 2, HD + 0.02]} raycast={() => null}>
        <boxGeometry args={[STAGE_WIDTH, STAGE_HEIGHT, 0.04]} />
      </mesh>
      <mesh
        material={marking}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.003, 0]}
        raycast={() => null}
      >
        <planeGeometry args={[0.03, STAGE_DEPTH]} />
      </mesh>
      <mesh
        material={marking}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.003, HD - 0.08]}
        raycast={() => null}
      >
        <planeGeometry args={[STAGE_WIDTH, 0.05]} />
      </mesh>

      {/* House */}
      <mesh
        material={houseFloor}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -STAGE_HEIGHT, HD + 7]}
        receiveShadow
        raycast={() => null}
      >
        <planeGeometry args={[30, 14]} />
      </mesh>
      <Audience />

      <Battens />
      {dressing && <Masking />}
    </group>
  )
}
