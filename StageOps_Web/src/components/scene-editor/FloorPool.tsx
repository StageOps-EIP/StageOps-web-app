import { useMemo } from 'react'
import * as THREE from 'three'
import type { SceneLight } from '@/domain/scene-models'

/*
 * Pool of light on the floor for a simulated spot (outside the real-time light budget).
 * One radial texture is shared by every pool for the whole session.
 */
let poolTexture: THREE.CanvasTexture | null = null
function sharedPoolTexture(): THREE.CanvasTexture {
  if (poolTexture) return poolTexture
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')!
  const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.6, 'rgba(255,255,255,0.75)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, size, size)
  poolTexture = new THREE.CanvasTexture(canvas)
  poolTexture.colorSpace = THREE.SRGBColorSpace
  return poolTexture
}

export function FloorPool({ light, color }: { light: SceneLight; color: string }) {
  const placement = useMemo(() => {
    const from = new THREE.Vector3(...light.position)
    const direction = new THREE.Vector3(...light.targetPosition).sub(from).normalize()
    if (direction.y > -0.05 || from.y <= 0) return null
    const distance = from.y / -direction.y
    const hit = from.add(direction.multiplyScalar(distance))
    const angle = light.type === 'rect-area' ? Math.PI / 3 : light.angle
    return {
      position: [hit.x, 0.012, hit.z] as [number, number, number],
      radius: Math.min(Math.tan(Math.min(angle, 1.3)) * distance * (1 + light.penumbra * 0.3), 8),
    }
  }, [light.position, light.targetPosition, light.angle, light.penumbra, light.type])
  if (!placement || light.intensity <= 0) return null
  return (
    <mesh position={placement.position} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
      <circleGeometry args={[placement.radius, 48]} />
      <meshBasicMaterial
        map={sharedPoolTexture()}
        color={color}
        transparent
        opacity={Math.min(light.intensity / 10, 1) * 0.55}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  )
}
