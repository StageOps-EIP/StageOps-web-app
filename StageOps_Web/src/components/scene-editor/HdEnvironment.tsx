import { Environment, Lightformer } from '@react-three/drei'

/** Soft reflections for steel and glossy surfaces; HD only, loaded on demand. */
export function HdEnvironment() {
  return (
    <Environment frames={1} resolution={64} environmentIntensity={0.2}>
      <Lightformer intensity={2} position={[0, 8, 10]} scale={[12, 4, 1]} />
      <Lightformer
        intensity={1}
        position={[-10, 5, 0]}
        rotation-y={Math.PI / 2}
        scale={[8, 3, 1]}
      />
    </Environment>
  )
}
