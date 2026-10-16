import { useRef, useEffect } from 'react'
import { Mouse, Settings2 } from 'lucide-react'
import { useSceneEditor } from '@/hooks/useSceneEditor'
import { EditorToolbar } from '@/components/scene-editor/EditorToolbar'
import { EditorCanvas } from '@/components/scene-editor/EditorCanvas'
import { SceneTreePanel } from '@/components/scene-editor/SceneTreePanel'
import { PropertiesPanel } from '@/components/scene-editor/PropertiesPanel'

// Inner component that has access to the store context
function EditorInner({ canvasRef }: { canvasRef: React.RefObject<HTMLCanvasElement> }) {
  const {
    scene,
    selection,
    transformMode,
    persistenceIssue,
    setTransformMode,
    deleteObject,
    deleteLight,
    duplicateObject,
    clearSelection,
    undo,
    redo,
  } = useSceneEditor()
  const { objects, lights } = scene

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore shortcuts when typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      )
        return

      if (e.key === 'g' || e.key === 'G') {
        setTransformMode('translate')
        return
      }
      if (e.key === 'r' || e.key === 'R') {
        setTransformMode('rotate')
        return
      }
      if (e.key === 's' || e.key === 'S') {
        setTransformMode('scale')
        return
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selection?.kind === 'object') deleteObject(selection.id)
        if (selection?.kind === 'light') deleteLight(selection.id)
        return
      }
      if (e.key === 'Escape') {
        clearSelection()
        return
      }
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'd' || e.key === 'D') {
          e.preventDefault()
          if (selection?.kind === 'object') duplicateObject(selection.id)
          return
        }
        if (e.key === 'z' || e.key === 'Z') {
          e.preventDefault()
          if (e.shiftKey) redo()
          else undo()
          return
        }
        if (e.key === 'y' || e.key === 'Y') {
          e.preventDefault()
          redo()
          return
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    selection,
    setTransformMode,
    deleteObject,
    deleteLight,
    duplicateObject,
    clearSelection,
    undo,
    redo,
  ])

  const selectedObj =
    selection?.kind === 'object' ? objects.find((o) => o.id === selection.id) : null
  const selectedLight =
    selection?.kind === 'light' ? lights.find((l) => l.id === selection.id) : null

  const statusText = selectedObj
    ? `${selectedObj.name}  x:${selectedObj.position[0].toFixed(2)}  y:${selectedObj.position[1].toFixed(2)}  z:${selectedObj.position[2].toFixed(2)}`
    : selectedLight
      ? `${selectedLight.name}  x:${selectedLight.position[0].toFixed(2)}  y:${selectedLight.position[1].toFixed(2)}  z:${selectedLight.position[2].toFixed(2)}`
      : null

  return (
    <>
      <EditorToolbar canvasRef={canvasRef} />
      <div className="flex flex-1 overflow-hidden">
        <SceneTreePanel />
        <div className="flex-1 relative flex flex-col">
          <div className="flex-1 relative">
            <EditorCanvas canvasRef={canvasRef} />
            {/* Hint overlay when nothing selected */}
            {persistenceIssue && (
              <p
                role="alert"
                className="absolute left-1/2 top-3 z-10 w-[min(90%,32rem)] -translate-x-1/2 border border-theme-border bg-theme-base px-4 py-2 text-center text-xs text-content-primary"
              >
                {persistenceIssue}
              </p>
            )}
            {!selection && (
              <div className="absolute inset-0 flex items-end justify-center pb-8 pointer-events-none z-10">
                <div className="flex items-center gap-4 border border-theme-border bg-theme-base px-4 py-2 text-xs text-content-subtle">
                  <span>
                    <Mouse size={11} className="inline mr-0.5" /> Orbiter
                  </span>
                  <span>
                    <Settings2 size={11} className="inline mr-0.5" /> G/R/S transformer
                  </span>
                  <span>Del supprimer</span>
                  <span>Ctrl+Z annuler</span>
                </div>
              </div>
            )}
          </div>
          {/* Status bar */}
          <div className="flex h-7 flex-shrink-0 items-center gap-6 border-t border-theme-border bg-theme-deeper px-4 font-mono text-[10px] text-content-subtle">
            {statusText ? <span>{statusText}</span> : <span>Aucune sélection</span>}
            <span className="ml-auto text-[var(--brand-violet-hover)]">
              Mode :{' '}
              {transformMode === 'translate'
                ? 'déplacement'
                : transformMode === 'rotate'
                  ? 'rotation'
                  : 'échelle'}
            </span>
          </div>
        </div>
        <PropertiesPanel />
      </div>
    </>
  )
}

export function SceneEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  return (
    <div className="flex h-dvh w-screen flex-col overflow-hidden bg-theme-void">
      <EditorInner canvasRef={canvasRef} />
    </div>
  )
}
