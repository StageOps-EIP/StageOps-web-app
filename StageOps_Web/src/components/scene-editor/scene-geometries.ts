import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { Posture, SceneObject } from '@/domain/scene-models'

/*
 * Geometries are built once and shared: a mannequin is one mesh (plus its nose), a chair or a
 * table one mesh, instead of one mesh and one material per part. They live for the whole
 * session (a handful of shapes), so they are never disposed.
 */

type Part = {
  geometry: THREE.BufferGeometry
  position: [number, number, number]
  rotation?: [number, number, number]
}

function merge(parts: Part[]): THREE.BufferGeometry {
  const placed = parts.map(({ geometry, position, rotation = [0, 0, 0] }) => {
    const matrix = new THREE.Matrix4().compose(
      new THREE.Vector3(...position),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),
      new THREE.Vector3(1, 1, 1),
    )
    return geometry.applyMatrix4(matrix)
  })
  const merged = mergeGeometries(placed)
  placed.forEach((geometry) => geometry.dispose())
  if (!merged) throw new Error('Incompatible geometries')
  merged.computeBoundingSphere()
  return merged
}

const capsule = (radius: number, length: number) => new THREE.CapsuleGeometry(radius, length, 4, 12)
const HEAD_Y: Record<Posture, number> = { standing: 1.62, sitting: 1.22, lying: 1.62 }

function buildBody(posture: Posture): THREE.BufferGeometry {
  if (posture === 'sitting') {
    return merge([
      { geometry: capsule(0.07, 0.3), position: [-0.1, 0.47, 0.2], rotation: [Math.PI / 2, 0, 0] },
      { geometry: capsule(0.07, 0.3), position: [0.1, 0.47, 0.2], rotation: [Math.PI / 2, 0, 0] },
      { geometry: capsule(0.06, 0.3), position: [-0.1, 0.24, 0.4] },
      { geometry: capsule(0.06, 0.3), position: [0.1, 0.24, 0.4] },
      { geometry: capsule(0.16, 0.35), position: [0, 0.82, 0] },
      { geometry: capsule(0.05, 0.4), position: [-0.25, 0.78, 0.08], rotation: [0.4, 0, 0] },
      { geometry: capsule(0.05, 0.4), position: [0.25, 0.78, 0.08], rotation: [0.4, 0, 0] },
      { geometry: new THREE.SphereGeometry(0.11, 16, 12), position: [0, HEAD_Y.sitting, 0] },
    ])
  }
  return merge([
    { geometry: capsule(0.07, 0.7), position: [-0.1, 0.45, 0] },
    { geometry: capsule(0.07, 0.7), position: [0.1, 0.45, 0] },
    { geometry: capsule(0.16, 0.4), position: [0, 1.15, 0] },
    { geometry: capsule(0.05, 0.5), position: [-0.26, 1.08, 0] },
    { geometry: capsule(0.05, 0.5), position: [0.26, 1.08, 0] },
    { geometry: new THREE.SphereGeometry(0.11, 16, 12), position: [0, HEAD_Y.standing, 0] },
  ])
}

const bodies = new Map<Posture, THREE.BufferGeometry>()
const noses = new Map<Posture, THREE.BufferGeometry>()

/** Mannequin 1.75 m tall facing +Z, feet at the origin; scale it for other heights. */
export function personGeometry(posture: Posture): {
  body: THREE.BufferGeometry
  nose: THREE.BufferGeometry
} {
  // Lying is the standing body turned on its back, head towards the back of the stage.
  const base = posture === 'lying' ? 'standing' : posture
  if (!bodies.has(base)) bodies.set(base, buildBody(base))
  if (!noses.has(base)) {
    const nose = new THREE.BoxGeometry(0.04, 0.04, 0.06)
    nose.translate(0, HEAD_Y[base], 0.11)
    noses.set(base, nose)
  }
  return { body: bodies.get(base)!, nose: noses.get(base)! }
}

const furniture = new Map<string, THREE.BufferGeometry>()

function legs(width: number, depth: number, height: number): Part[] {
  const x = width / 2 - 0.03
  const z = depth / 2 - 0.03
  return [
    [-x, -z],
    [x, -z],
    [-x, z],
    [x, z],
  ].map(([lx, lz]) => ({
    geometry: new THREE.BoxGeometry(0.04, height, 0.04),
    position: [lx, height / 2, lz] as [number, number, number],
  }))
}

/** Chair or table as a single geometry, cached by type and dimensions. */
export function furnitureGeometry(
  type: 'chair' | 'table',
  size: SceneObject['geometry'],
): THREE.BufferGeometry {
  const key = `${type}:${size.width}:${size.height}:${size.depth}`
  const cached = furniture.get(key)
  if (cached) return cached
  const { width, height, depth } = size
  const geometry =
    type === 'chair'
      ? merge([
          ...legs(width, depth, height * 0.5),
          { geometry: new THREE.BoxGeometry(width, 0.05, depth), position: [0, height * 0.5, 0] },
          {
            geometry: new THREE.BoxGeometry(width, height * 0.5, 0.04),
            position: [0, height * 0.75, -depth / 2 + 0.02],
          },
        ])
      : merge([
          ...legs(width, depth, height - 0.04),
          { geometry: new THREE.BoxGeometry(width, 0.04, depth), position: [0, height - 0.02, 0] },
        ])
  furniture.set(key, geometry)
  return geometry
}

/** Seat used for the audience rows, merged once. */
let seat: THREE.BufferGeometry | null = null
export function audienceSeatGeometry(): THREE.BufferGeometry {
  seat ??= merge([
    { geometry: new THREE.BoxGeometry(0.5, 0.12, 0.5), position: [0, 0.42, 0] },
    { geometry: new THREE.BoxGeometry(0.5, 0.5, 0.08), position: [0, 0.72, 0.22] },
    { geometry: new THREE.BoxGeometry(0.5, 0.36, 0.08), position: [0, 0.18, -0.15] },
  ])
  return seat
}
