import React, { memo } from 'react';
import { Html } from '@react-three/drei';
import { STAGE_WIDTH, STAGE_DEPTH, GRID_HEIGHT } from './stage3d.constants';

const HW = STAGE_WIDTH / 2;   // 12 — half width
const HD = STAGE_DEPTH / 2;   // 9  — half depth

/**
 * Static theatre geometry: floor, walls, gril, zone markers, labels.
 * Enhanced with subtle checkerboard floor, zone delimiters, and atmospheric lights.
 */
export const StageGeometry = memo(function StageGeometry() {
  const CHECKER_SIZE = 3; // size of each checker tile in Three.js units

  return (
    <group>

      {/* ── Floor base ──────────────────────────────────────────────── */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[STAGE_WIDTH, STAGE_DEPTH]} />
        <meshStandardMaterial color="#17171c" roughness={0.95} metalness={0.05} />
      </mesh>

      {/* ── Checkerboard overlay (subtle) ────────────────────────────── */}
      {/* We use alternating thin panels as checker tiles */}
      {Array.from({ length: Math.ceil(STAGE_WIDTH / CHECKER_SIZE) }, (_, col) =>
        Array.from({ length: Math.ceil(STAGE_DEPTH / CHECKER_SIZE) }, (_, row) => {
          const isEven  = (col + row) % 2 === 0;
          if (!isEven) return null; // only render "dark" tiles; base = light enough
          const x = -HW + col * CHECKER_SIZE + CHECKER_SIZE / 2;
          const z = -HD + row * CHECKER_SIZE + CHECKER_SIZE / 2;
          return (
            <mesh
              key={`tile-${col}-${row}`}
              receiveShadow
              rotation={[-Math.PI / 2, 0, 0]}
              position={[x, 0.001, z]}
            >
              <planeGeometry args={[CHECKER_SIZE, CHECKER_SIZE]} />
              <meshStandardMaterial
                color="#121218"
                roughness={0.95}
                metalness={0.0}
                transparent
                opacity={0.6}
              />
            </mesh>
          );
        })
      )}

      {/* ── Fine grid ────────────────────────────────────────────────── */}
      <gridHelper
        args={[STAGE_WIDTH, STAGE_WIDTH, '#27272e', '#1e1e24']}
        position={[0, 0.003, 0]}
      />

      {/* ── Zone delimiters (very subtle cyan lines) ─────────────────── */}
      {/* Centre line (Cour / Jardin axis) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <planeGeometry args={[0.04, STAGE_DEPTH]} />
        <meshStandardMaterial color="#22d3ee" transparent opacity={0.08} />
      </mesh>

      {/* Front/back thirds delimiter — avant-scène zone */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, HD - 3]}>
        <planeGeometry args={[STAGE_WIDTH, 0.04]} />
        <meshStandardMaterial color="#22d3ee" transparent opacity={0.06} />
      </mesh>

      {/* Fond de scène zone delimiter */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -HD + 3]}>
        <planeGeometry args={[STAGE_WIDTH, 0.04]} />
        <meshStandardMaterial color="#22d3ee" transparent opacity={0.06} />
      </mesh>

      {/* ── Back wall (fond de scène) — slightly blue-tinted ─────────── */}
      <mesh receiveShadow position={[0, GRID_HEIGHT / 2, -HD]}>
        <planeGeometry args={[STAGE_WIDTH, GRID_HEIGHT]} />
        <meshStandardMaterial color="#0e0e14" side={2} roughness={1} metalness={0} />
      </mesh>

      {/* ── Side wings ───────────────────────────────────────────────── */}
      {/* Jardin (left, -X) */}
      <mesh position={[-HW, GRID_HEIGHT / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[STAGE_DEPTH, GRID_HEIGHT]} />
        <meshStandardMaterial
          color="#10101a"
          side={2}
          transparent
          opacity={0.75}
          roughness={1}
          metalness={0}
        />
      </mesh>

      {/* Cour (right, +X) */}
      <mesh position={[HW, GRID_HEIGHT / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[STAGE_DEPTH, GRID_HEIGHT]} />
        <meshStandardMaterial
          color="#10101a"
          side={2}
          transparent
          opacity={0.75}
          roughness={1}
          metalness={0}
        />
      </mesh>

      {/* ── Gril — overhead pipes ───────────────────────────────────── */}
      {Array.from({ length: 7 }, (_, i) => {
        const z = -HD + i * 3;
        return (
          <group key={`pipe-${i}`}>
            <mesh position={[0, GRID_HEIGHT, z]} castShadow>
              <boxGeometry args={[STAGE_WIDTH, 0.12, 0.12]} />
              <meshStandardMaterial color="#2a2a32" metalness={0.85} roughness={0.25} />
            </mesh>
            {/* Spotlight from each pipe pointing down */}
            <spotLight
              position={[0, GRID_HEIGHT - 0.1, z]}
              target-position={[0, 0, z]}
              intensity={0.35}
              color="#22d3ee"
              angle={0.5}
              penumbra={0.8}
              distance={GRID_HEIGHT + 2}
              castShadow={false}
            />
          </group>
        );
      })}

      {/* ── Avant-scène lip (glowing edge) ──────────────────────────── */}
      <mesh position={[0, 0.06, HD]} castShadow>
        <boxGeometry args={[STAGE_WIDTH, 0.12, 0.3]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#22d3ee"
          emissiveIntensity={0.55}
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>

      {/* ── Stage floor edge glow line ───────────────────────────────── */}
      <pointLight position={[0, 0.3, HD]} intensity={0.4} color="#22d3ee" distance={8} />

      {/* ── Labels ──────────────────────────────────────────────────── */}
      <Html center position={[0, 0.5, -HD + 0.6]}>
        <div className="px-3 py-1 bg-theme-base/90 border border-cyan-400/25 rounded-full text-xs text-cyan-400/80 whitespace-nowrap pointer-events-none select-none backdrop-blur-sm">
          Fond de scène
        </div>
      </Html>

      <Html center position={[0, 0.5, HD - 0.6]}>
        <div className="px-3 py-1 bg-theme-base/90 border border-cyan-400/25 rounded-full text-xs text-cyan-400/80 whitespace-nowrap pointer-events-none select-none backdrop-blur-sm">
          Avant-scène
        </div>
      </Html>

      <Html center position={[-HW + 0.8, 0.5, 0]}>
        <div className="px-3 py-1 bg-theme-base/90 border border-cyan-400/25 rounded-full text-xs text-cyan-400/80 whitespace-nowrap pointer-events-none select-none backdrop-blur-sm">
          Jardin
        </div>
      </Html>

      <Html center position={[HW - 0.8, 0.5, 0]}>
        <div className="px-3 py-1 bg-theme-base/90 border border-cyan-400/25 rounded-full text-xs text-cyan-400/80 whitespace-nowrap pointer-events-none select-none backdrop-blur-sm">
          Cour
        </div>
      </Html>
    </group>
  );
});
