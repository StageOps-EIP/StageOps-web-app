import { useNavigate } from 'react-router';
import { SceneEditorProvider } from '@/components/scene-editor/scene-editor.provider';
import { EditorCanvas } from '@/components/scene-editor/EditorCanvas';
import { Pencil } from 'lucide-react';

export function StageView() {
  const navigate = useNavigate();

  return (
    <SceneEditorProvider>
      <div className="relative h-full w-full overflow-hidden" style={{ minHeight: 0 }}>
        {/* Canvas 3D — prend tout l'espace disponible */}
        <div className="absolute inset-0">
          <EditorCanvas readOnly />
        </div>

        {/* Badge Prévisualisation — haut-gauche */}
        <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900/80 border border-zinc-700/60 px-3 py-1 text-xs font-medium text-zinc-300 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Prévisualisation
          </span>
        </div>

        {/* Bouton Modifier — bas-droite */}
        <div className="absolute bottom-6 right-6 z-10">
          <button
            onClick={() => navigate('/editor')}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900/90 border border-zinc-700/60 px-4 py-2.5 text-sm font-medium text-zinc-100 backdrop-blur-sm hover:bg-zinc-800/90 hover:border-zinc-600 transition-colors shadow-lg"
          >
            <Pencil size={15} />
            Modifier la scène
          </button>
        </div>
      </div>
    </SceneEditorProvider>
  );
}
