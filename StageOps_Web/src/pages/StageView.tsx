import { useNavigate } from 'react-router'
import { SceneEditorProvider } from '@/components/scene-editor/scene-editor.provider'
import { useSceneEditor } from '@/components/scene-editor/scene-editor.store'
import { EditorCanvas } from '@/components/scene-editor/EditorCanvas'
import { Box, Lightbulb, MousePointer2, Pencil } from 'lucide-react'
import { usePageTitle } from '@/hooks/usePageTitle'
import { Button } from '@/components/design-system/Button'

function StageWorkspace() {
  const navigate = useNavigate()
  const { state } = useSceneEditor()

  return (
    <div className="relative h-full w-full overflow-hidden bg-theme-void" style={{ minHeight: 0 }}>
      <h1 className="sr-only">Plateau 3D</h1>
      <div className="absolute inset-0">
        <EditorCanvas readOnly />
      </div>

      <div className="absolute inset-x-0 top-0 z-10 flex flex-wrap items-center gap-3 border-b border-theme-border bg-theme-base px-3 py-2.5 sm:px-4">
        <div className="mr-auto min-w-0">
          <p className="truncate text-sm font-semibold text-content-primary">
            Plateau 3D · Grande Salle
          </p>
          <p className="text-xs text-content-subtle">
            Prévisualisation de la scène enregistrée localement
          </p>
        </div>
        <div className="hidden items-center gap-4 text-xs text-content-muted sm:flex">
          <span className="flex items-center gap-1.5">
            <Box size={14} /> {state.objects.length} objet{state.objects.length !== 1 ? 's' : ''}
          </span>
          <span className="flex items-center gap-1.5">
            <Lightbulb size={14} /> {state.lights.length} sources
          </span>
          <span className="flex items-center gap-1.5">
            <MousePointer2 size={14} /> Glisser pour orbiter
          </span>
        </div>
        <Button size="sm" onClick={() => navigate('/editor')}>
          <Pencil size={14} /> Modifier la scène
        </Button>
      </div>

      {state.objects.length === 0 && (
        <div className="pointer-events-none absolute bottom-24 left-1/2 z-10 w-[min(90%,28rem)] -translate-x-1/2 border border-theme-border bg-theme-base px-4 py-3 text-center lg:bottom-5">
          <p className="text-sm font-medium text-content-primary">Aucun objet de décor placé</p>
          <p className="mt-1 text-xs text-content-subtle">
            La structure du plateau et les éclairages restent visibles. Ouvrez l’éditeur pour
            ajouter des éléments.
          </p>
        </div>
      )}
    </div>
  )
}

export function StageView() {
  usePageTitle('Plateau 3D')
  return (
    <SceneEditorProvider>
      <StageWorkspace />
    </SceneEditorProvider>
  )
}
