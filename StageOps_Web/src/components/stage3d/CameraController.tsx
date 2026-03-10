import { useEffect } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { CameraView } from './stage3d.types';

interface CameraControllerProps {
  viewMode: CameraView;
  orbitRef: React.RefObject<OrbitControlsImpl | null>;
}

// Target positions and lookAt per view mode
const CAMERA_CONFIGS: Record<CameraView, { position: THREE.Vector3; target: THREE.Vector3; enableOrbit: boolean }> = {
  '3d': {
    position: new THREE.Vector3(0, 14, 20),
    target:   new THREE.Vector3(0, 2, 0),
    enableOrbit: true,
  },
  'front': {
    position: new THREE.Vector3(0, 5, 22),
    target:   new THREE.Vector3(0, 5, 0),
    enableOrbit: false,
  },
  'top': {
    position: new THREE.Vector3(0, 35, 0.01),
    target:   new THREE.Vector3(0, 0, 0),
    enableOrbit: false,
  },
};

/**
 * Invisible component: animates the camera and toggles OrbitControls
 * based on the active viewMode.
 */
export function CameraController({ viewMode, orbitRef }: CameraControllerProps) {
  const { camera } = useThree();
  const config = CAMERA_CONFIGS[viewMode];

  // Toggle orbit controls enabled state when viewMode changes
  useEffect(() => {
    if (orbitRef.current) {
      orbitRef.current.enabled = config.enableOrbit;
    }
  }, [viewMode, config.enableOrbit, orbitRef]);

  useFrame(() => {
    // Lerp camera position towards target (smooth transition)
    camera.position.lerp(config.position, 0.05);

    // Smoothly update orbitControls target / camera lookAt
    if (orbitRef.current) {
      orbitRef.current.target.lerp(config.target, 0.05);
      orbitRef.current.update();
    } else {
      camera.lookAt(config.target);
    }
  });

  return null;
}
