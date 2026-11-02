import { useMemo } from 'react'
import * as THREE from 'three'
import type { SceneLight } from '@/domain/scene-models'

/*
 * Visible beam of a spot, as seen in a hazy theatre. It is a single open cone with an additive
 * shader (brighter near the lens, fading towards the floor and on the edges), so it costs one
 * draw call and no extra light.
 */

const vertexShader = /* glsl */ `
  varying float vAlong;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vAlong = uv.y;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vNormal = normalize(mat3(modelMatrix) * normal);
    vView = normalize(cameraPosition - world.xyz);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`
const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAlong;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float facing = abs(dot(normalize(vNormal), normalize(vView)));
    float edges = pow(facing, 1.6);
    float falloff = pow(vAlong, 1.4) * 0.85 + 0.15;
    // Seen from above (plan view) haze is not what one looks at: let the stage show through.
    float fromAbove = 1.0 - smoothstep(0.7, 0.95, normalize(vView).y) * 0.85;
    gl_FragColor = vec4(uColor * uOpacity * edges * falloff * fromAbove, 1.0);
  }
`

const LENS_RADIUS = 0.09
const UP = new THREE.Vector3(0, 1, 0)

/** Length from the lens to where the beam meets the floor (or its target if it points upwards). */
function beamLength(light: SceneLight): number {
  const from = new THREE.Vector3(...light.position)
  const to = new THREE.Vector3(...light.targetPosition)
  const direction = to.clone().sub(from)
  const length = direction.length()
  if (length === 0) return 0
  direction.normalize()
  const toFloor = direction.y < -0.05 ? from.y / -direction.y : length
  const max = light.distance > 0 ? light.distance : 30
  return Math.min(Math.max(toFloor, 0.5), max)
}

// Built once per beam; colour and opacity are then set through props (uniforms-*).
function beamMaterialArgs() {
  return [
    {
      vertexShader,
      fragmentShader,
      uniforms: { uColor: { value: new THREE.Color() }, uOpacity: { value: 0 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    },
  ] as [THREE.ShaderMaterialParameters]
}

export function LightBeam({ light, color }: { light: SceneLight; color: string }) {
  const length = beamLength(light)
  const radius = Math.tan(Math.min(light.angle, 1.3)) * length + LENS_RADIUS
  const materialArgs = useMemo(() => beamMaterialArgs(), [])
  const transform = useMemo(() => {
    const from = new THREE.Vector3(...light.position)
    const direction = new THREE.Vector3(...light.targetPosition).sub(from).normalize()
    // The cylinder's top (lens) points to the light; it extends along -direction from there.
    const quaternion = new THREE.Quaternion().setFromUnitVectors(UP, direction.clone().negate())
    const center = from.clone().add(direction.multiplyScalar(length / 2))
    return { position: center.toArray() as [number, number, number], quaternion }
  }, [light.position, light.targetPosition, length])

  if (length === 0 || light.intensity <= 0) return null
  return (
    <mesh
      position={transform.position}
      quaternion={transform.quaternion}
      renderOrder={10}
      raycast={() => null}
    >
      <cylinderGeometry args={[LENS_RADIUS, radius, length, 32, 1, true]} />
      <shaderMaterial
        args={materialArgs}
        uniforms-uColor-value={color}
        uniforms-uOpacity-value={Math.min(light.intensity / 10, 1) * 0.22}
      />
    </mesh>
  )
}
