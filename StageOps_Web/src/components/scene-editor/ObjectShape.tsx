import * as THREE from 'three'
import type { SceneObject } from '@/domain/scene-models'
import { useRenderTier } from './render-context'
import { furnitureGeometry, personGeometry } from './scene-geometries'

// Shared by every mannequin; never disposed (dispose={null} on its mesh).
const NOSE_MATERIAL = new THREE.MeshLambertMaterial({ color: '#1f2430' })

/**
 * One material per object; React Three Fiber updates it in place and disposes it.
 * In Éco, Lambert shading replaces physically based shading: much cheaper per pixel and per
 * light, at the cost of glossy reflections.
 */
function Material({ object }: { object: SceneObject }) {
  const { material } = object
  const tier = useRenderTier()
  if (tier === 'eco')
    return (
      <meshLambertMaterial
        color={material.color}
        emissive={material.emissive}
        emissiveIntensity={material.emissiveIntensity}
        transparent={material.opacity < 1}
        opacity={material.opacity}
        wireframe={material.wireframe}
      />
    )
  return (
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
  )
}

export function ObjectShape({ object, castShadow }: { object: SceneObject; castShadow: boolean }) {
  const { type, geometry } = object
  if (type === 'person') {
    const posture = object.posture ?? 'standing'
    const { body, nose } = personGeometry(posture)
    const scale = geometry.height / 1.75
    return (
      <group
        scale={scale}
        position={posture === 'lying' ? [0, 0.16 * scale, 0] : [0, 0, 0]}
        rotation={posture === 'lying' ? [-Math.PI / 2, 0, 0] : [0, 0, 0]}
      >
        {/* Shared geometries are passed as props: they are not disposed with the mesh. */}
        <mesh geometry={body} castShadow={castShadow} receiveShadow>
          <Material object={object} />
        </mesh>
        <mesh geometry={nose} material={NOSE_MATERIAL} dispose={null} />
      </group>
    )
  }
  if (type === 'chair' || type === 'table') {
    return (
      <mesh geometry={furnitureGeometry(type, geometry)} castShadow={castShadow} receiveShadow>
        <Material object={object} />
      </mesh>
    )
  }
  return (
    <mesh castShadow={castShadow} receiveShadow>
      {type === 'plane' ? (
        <planeGeometry args={[geometry.width, geometry.height]} />
      ) : type === 'cylinder' ? (
        <cylinderGeometry args={[geometry.width / 2, geometry.width / 2, geometry.height, 32]} />
      ) : (
        <boxGeometry args={[geometry.width, geometry.height, geometry.depth]} />
      )}
      <Material object={object} />
    </mesh>
  )
}

/** Wireframe used for hover and selection; matches the object's footprint. */
export function ObjectOutline({
  object,
  color,
  opacity,
}: {
  object: SceneObject
  color: string
  opacity: number
}) {
  const { type, geometry, posture } = object
  const assembled = type === 'person' || type === 'chair' || type === 'table'
  const scale = geometry.height / 1.75
  const size: [number, number, number] =
    type === 'person' && posture === 'lying'
      ? [geometry.width, 0.35 * scale, geometry.height]
      : type === 'person' && posture === 'sitting'
        ? [geometry.width, 1.35 * scale, 0.7 * scale]
        : [geometry.width, geometry.height, type === 'plane' ? 0.02 : geometry.depth]
  return (
    <mesh position={assembled ? [0, size[1] / 2, 0] : [0, 0, 0]} scale={1.02}>
      {type === 'cylinder' ? (
        <cylinderGeometry args={[geometry.width / 2, geometry.width / 2, geometry.height, 24]} />
      ) : (
        <boxGeometry args={size} />
      )}
      <meshBasicMaterial color={color} wireframe transparent opacity={opacity} />
    </mesh>
  )
}
