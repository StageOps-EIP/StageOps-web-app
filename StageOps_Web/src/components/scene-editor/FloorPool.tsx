import { useMemo } from 'react'
import * as THREE from 'three'
import type { SceneLight } from '@/domain/scene-models'
import { floorPoolPlacement } from './floor-pool-placement'

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
  const placement = useMemo(() => floorPoolPlacement(light), [light])
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
