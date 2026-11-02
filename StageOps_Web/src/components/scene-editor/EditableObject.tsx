import { useRef, useState, useCallback } from 'react'
import type * as THREE from 'three'
import { type ThreeEvent } from '@react-three/fiber'
import { Html, TransformControls } from '@react-three/drei'
import { useSceneEditor } from '@/hooks/useSceneEditor'
import type { SceneObject, TransformMode } from '@/domain/scene-models'
import { ObjectOutline, ObjectShape } from './ObjectShape'

interface EditableObjectProps {
  object: SceneObject
  isSelected: boolean
  transformMode: TransformMode
  onDrag: (dragging: boolean) => void
  readOnly?: boolean
}

export function EditableObject({
  object,
  isSelected,
  transformMode,
  onDrag,
  readOnly = false,
}: EditableObjectProps) {
  const { select, clearSelection, updateObject, beginGesture, endGesture } = useSceneEditor()
  const groupRef = useRef<THREE.Group>(null!)
  const [hovered, setHovered] = useState(false)
  const [mounted, setMounted] = useState(false)

  const callbackGroupRef = useCallback((node: THREE.Group | null) => {
    groupRef.current = node!
    setMounted(node !== null)
  }, [])

  const { position, rotation, scale, visible, locked, type } = object

  function handleClick(e: ThreeEvent<MouseEvent>) {
    if (readOnly) return
    e.stopPropagation?.()
    if (isSelected) clearSelection()
    else select({ kind: 'object', id: object.id })
  }

  function handleObjectChange() {
    const group = groupRef.current
    if (!group) return
    updateObject(object.id, {
      position: group.position.toArray() as [number, number, number],
      rotation: [group.rotation.x, group.rotation.y, group.rotation.z],
      scale: group.scale.toArray() as [number, number, number],
    })
  }

  if (!visible) return null

  return (
    <group>
      <group
        ref={callbackGroupRef}
        position={position}
        rotation={rotation}
        scale={scale}
        onClick={handleClick}
        onPointerOver={readOnly ? undefined : () => setHovered(true)}
        onPointerOut={readOnly ? undefined : () => setHovered(false)}
      >
        <ObjectShape object={object} />
        {isSelected && !readOnly && <ObjectOutline object={object} color="#7964ff" opacity={0.6} />}
        {hovered && !isSelected && !readOnly && (
          <ObjectOutline object={object} color="#71717a" opacity={0.4} />
        )}
        {type === 'person' && (
          <Html center position={[0, object.geometry.height + 0.3, 0]} zIndexRange={[10, 0]}>
            <span className="pointer-events-none select-none whitespace-nowrap border border-theme-border bg-theme-base px-1.5 py-0.5 text-[10px] font-medium text-content-primary">
              {object.name}
            </span>
          </Html>
        )}
      </group>

      {/* Transform gizmo — hidden in readOnly */}
      {isSelected && !locked && mounted && !readOnly && (
        <TransformControls
          object={groupRef}
          mode={transformMode}
          onObjectChange={handleObjectChange}
          onMouseDown={() => {
            // One drag of the gizmo is one undo step, whatever the number of frames.
            beginGesture()
            onDrag(true)
          }}
          onMouseUp={() => {
            endGesture()
            onDrag(false)
          }}
        />
      )}
    </group>
  )
}
