import * as THREE from 'three'
import type { SceneLight } from '../../domain/scene-models.ts'

export function floorPoolPlacement(light: SceneLight): {
  position: [number, number, number]
  radius: number
} | null {
  const from = new THREE.Vector3(...light.position)
  const direction = new THREE.Vector3(...light.targetPosition).sub(from).normalize()
  if (direction.y > -0.05 || from.y <= 0) return null
  const distance = from.y / -direction.y
  // Match the finite range used by EditableLight and LightBeam (zero currently defaults to 30).
  const range = light.distance > 0 ? light.distance : 30
  if (distance >= range) return null
  const hit = from.add(direction.multiplyScalar(distance))
  const angle = light.type === 'rect-area' ? Math.PI / 3 : light.angle
  return {
    position: [hit.x, 0.012, hit.z],
    radius: Math.min(Math.tan(Math.min(angle, 1.3)) * distance * (1 + light.penumbra * 0.3), 8),
  }
}
