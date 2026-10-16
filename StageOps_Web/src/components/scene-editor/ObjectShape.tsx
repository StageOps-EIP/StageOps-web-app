import type { Posture, SceneObject } from '@/domain/scene-models'

type Geometry = SceneObject['geometry']

function Material({ object }: { object: SceneObject }) {
  const { material } = object
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

/** Simple mannequin built from capsules; it faces +Z (towards the audience by default). */
function Person({ object, posture }: { object: SceneObject; posture: Posture }) {
  const s = object.geometry.height / 1.75
  const part = (
    key: string,
    position: [number, number, number],
    radius: number,
    length: number,
    rotation: [number, number, number] = [0, 0, 0],
  ) => (
    <mesh key={key} position={position} rotation={rotation} castShadow receiveShadow>
      <capsuleGeometry args={[radius * s, length * s, 4, 12]} />
      <Material object={object} />
    </mesh>
  )
  const head = (y: number, z = 0) => (
    <group position={[0, y * s, z * s]}>
      <mesh castShadow>
        <sphereGeometry args={[0.11 * s, 16, 16]} />
        <Material object={object} />
      </mesh>
      {/* Nose: shows where the person is looking */}
      <mesh position={[0, 0, 0.11 * s]}>
        <boxGeometry args={[0.04 * s, 0.04 * s, 0.06 * s]} />
        <meshStandardMaterial color="#1f2430" />
      </mesh>
    </group>
  )

  if (posture === 'sitting') {
    return (
      <group>
        {part('thigh-l', [-0.1, 0.47, 0.2], 0.07, 0.3, [Math.PI / 2, 0, 0])}
        {part('thigh-r', [0.1, 0.47, 0.2], 0.07, 0.3, [Math.PI / 2, 0, 0])}
        {part('shin-l', [-0.1, 0.24, 0.4], 0.06, 0.3)}
        {part('shin-r', [0.1, 0.24, 0.4], 0.06, 0.3)}
        {part('torso', [0, 0.82, 0], 0.16, 0.35)}
        {part('arm-l', [-0.25, 0.78, 0.08], 0.05, 0.4, [0.4, 0, 0])}
        {part('arm-r', [0.25, 0.78, 0.08], 0.05, 0.4, [0.4, 0, 0])}
        {head(1.22)}
      </group>
    )
  }
  const standing = (
    <group>
      {part('leg-l', [-0.1, 0.45, 0], 0.07, 0.7)}
      {part('leg-r', [0.1, 0.45, 0], 0.07, 0.7)}
      {part('torso', [0, 1.15, 0], 0.16, 0.4)}
      {part('arm-l', [-0.26, 1.08, 0], 0.05, 0.5)}
      {part('arm-r', [0.26, 1.08, 0], 0.05, 0.5)}
      {head(1.62)}
    </group>
  )
  if (posture === 'lying') {
    // Lying on the back, head towards the back of the stage.
    return (
      <group position={[0, 0.16 * s, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        {standing}
      </group>
    )
  }
  return standing
}

function Legs({
  object,
  geometry,
  height,
}: {
  object: SceneObject
  geometry: Geometry
  height: number
}) {
  const x = geometry.width / 2 - 0.03
  const z = geometry.depth / 2 - 0.03
  return (
    <>
      {[
        [-x, -z],
        [x, -z],
        [-x, z],
        [x, z],
      ].map(([lx, lz]) => (
        <mesh key={`${lx}:${lz}`} position={[lx, height / 2, lz]} castShadow receiveShadow>
          <boxGeometry args={[0.04, height, 0.04]} />
          <Material object={object} />
        </mesh>
      ))}
    </>
  )
}

function Chair({ object }: { object: SceneObject }) {
  const g = object.geometry
  const seat = g.height * 0.5
  return (
    <group>
      <Legs object={object} geometry={g} height={seat} />
      <mesh position={[0, seat, 0]} castShadow receiveShadow>
        <boxGeometry args={[g.width, 0.05, g.depth]} />
        <Material object={object} />
      </mesh>
      <mesh position={[0, seat + (g.height - seat) / 2, -g.depth / 2 + 0.02]} castShadow>
        <boxGeometry args={[g.width, g.height - seat, 0.04]} />
        <Material object={object} />
      </mesh>
    </group>
  )
}

function Table({ object }: { object: SceneObject }) {
  const g = object.geometry
  return (
    <group>
      <Legs object={object} geometry={g} height={g.height - 0.04} />
      <mesh position={[0, g.height - 0.02, 0]} castShadow receiveShadow>
        <boxGeometry args={[g.width, 0.04, g.depth]} />
        <Material object={object} />
      </mesh>
    </group>
  )
}

function Primitive({ object }: { object: SceneObject }) {
  const { type, geometry } = object
  return (
    <mesh castShadow receiveShadow>
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

export function ObjectShape({ object }: { object: SceneObject }) {
  if (object.type === 'person')
    return <Person object={object} posture={object.posture ?? 'standing'} />
  if (object.type === 'chair') return <Chair object={object} />
  if (object.type === 'table') return <Table object={object} />
  return <Primitive object={object} />
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
  const { type, geometry } = object
  const assembled = type === 'person' || type === 'chair' || type === 'table'
  const lying = type === 'person' && object.posture === 'lying'
  const size: [number, number, number] = lying
    ? [geometry.width, 0.35, geometry.height]
    : [
        geometry.width,
        type === 'person' && object.posture === 'sitting'
          ? 1.35 * (geometry.height / 1.75)
          : geometry.height,
        geometry.depth,
      ]
  return (
    <mesh position={assembled ? [0, size[1] / 2, 0] : [0, 0, 0]} scale={1.02}>
      {type === 'plane' ? (
        <planeGeometry args={[geometry.width, geometry.height]} />
      ) : type === 'cylinder' ? (
        <cylinderGeometry args={[geometry.width / 2, geometry.width / 2, geometry.height, 32]} />
      ) : (
        <boxGeometry args={size} />
      )}
      <meshBasicMaterial color={color} wireframe transparent opacity={opacity} />
    </mesh>
  )
}
