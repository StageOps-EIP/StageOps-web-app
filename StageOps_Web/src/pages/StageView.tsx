import { useNavigate } from 'react-router';
import { SceneEditorProvider } from '@/components/scene-editor/scene-editor.provider';
import { EditorCanvas } from '@/components/scene-editor/EditorCanvas';
import { Pencil } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';

export function StageView() {
  usePageTitle('Vue Scène');
  const navigate = useNavigate();

  return (
    <SceneEditorProvider>
      <div className="relative h-full w-full overflow-hidden" style={{ minHeight: 0 }}>
        {/* Titre de page accessible — visuellement masqué */}
        <h1 className="sr-only">Vue Scène</h1>
        {/* Canvas 3D — prend tout l'espace disponible */}
        <div className="absolute inset-0">
          <EditorCanvas readOnly />
        </div>

        {/* Badge Prévisualisation — haut-gauche */}
        <div className="pointer-events-none absolute left-4 top-4 z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/20 bg-[#0a1025]/85 px-3 py-1.5 text-xs font-semibold text-blue-100 backdrop-blur-xl">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Prévisualisation
          </span>
        </div>

        {/* Bouton Modifier — bas-droite */}
        <div className="absolute bottom-24 right-4 z-10 lg:bottom-6 lg:right-6">
          <button
            onClick={() => navigate('/editor')}
            className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/20 bg-[#0a1025]/90 px-4 py-2.5 text-sm font-semibold text-white shadow-brand backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-cyan-300/40"
          >
            <Pencil size={15} />
            Modifier la scène
          </button>
        </div>
      </div>
    </SceneEditorProvider>
  );
}
