import { useRef, useEffect } from 'react';
import { Mouse, Settings2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { SceneEditorProvider } from '@/components/scene-editor/scene-editor.provider';
import { useSceneEditor } from '@/components/scene-editor/scene-editor.store';
import { EditorToolbar } from '@/components/scene-editor/EditorToolbar';
import { EditorCanvas } from '@/components/scene-editor/EditorCanvas';
import { SceneTreePanel } from '@/components/scene-editor/SceneTreePanel';
import { PropertiesPanel } from '@/components/scene-editor/PropertiesPanel';

// Inner component that has access to the store context
function EditorInner({ canvasRef }: { canvasRef: React.RefObject<HTMLCanvasElement> }) {
  const { state, dispatch } = useSceneEditor();
  const { selectedId, selectedType, transformMode, objects, lights } = state;
  const navigate = useNavigate();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore shortcuts when typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'g' || e.key === 'G') {
        dispatch({ type: 'SET_TRANSFORM_MODE', mode: 'translate' });
        return;
      }
      if (e.key === 'r' || e.key === 'R') {
        dispatch({ type: 'SET_TRANSFORM_MODE', mode: 'rotate' });
        return;
      }
      if (e.key === 's' || e.key === 'S') {
        dispatch({ type: 'SET_TRANSFORM_MODE', mode: 'scale' });
        return;
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (!selectedId) return;
        if (selectedType === 'object') dispatch({ type: 'DELETE_OBJECT', id: selectedId });
        if (selectedType === 'light')  dispatch({ type: 'DELETE_LIGHT',  id: selectedId });
        return;
      }
      if (e.key === 'Escape') {
        dispatch({ type: 'DESELECT' });
        return;
      }
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'd' || e.key === 'D') {
          e.preventDefault();
          if (selectedId && selectedType === 'object') {
            dispatch({ type: 'DUPLICATE_OBJECT', id: selectedId });
          }
          return;
        }
        if (e.key === 'z' || e.key === 'Z') {
          e.preventDefault();
          if (e.shiftKey) {
            dispatch({ type: 'REDO' });
          } else {
            dispatch({ type: 'UNDO' });
          }
          return;
        }
        if (e.key === 'y' || e.key === 'Y') {
          e.preventDefault();
          dispatch({ type: 'REDO' });
          return;
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, selectedId, selectedType, navigate]);

  const selectedObj = selectedType === 'object' ? objects.find(o => o.id === selectedId) : null;
  const selectedLight = selectedType === 'light' ? lights.find(l => l.id === selectedId) : null;

  const statusText = selectedObj
    ? `${selectedObj.name}  x:${selectedObj.position[0].toFixed(2)}  y:${selectedObj.position[1].toFixed(2)}  z:${selectedObj.position[2].toFixed(2)}`
    : selectedLight
    ? `${selectedLight.name}  x:${selectedLight.position[0].toFixed(2)}  y:${selectedLight.position[1].toFixed(2)}  z:${selectedLight.position[2].toFixed(2)}`
    : null;

  return (
    <>
      <EditorToolbar canvasRef={canvasRef} />
      <div className="flex flex-1 overflow-hidden">
        <SceneTreePanel />
        <div className="flex-1 relative flex flex-col">
          <div className="flex-1 relative">
            <EditorCanvas canvasRef={canvasRef} />
            {/* Hint overlay when nothing selected */}
            {!selectedId && (
              <div className="absolute inset-0 flex items-end justify-center pb-8 pointer-events-none z-10">
                <div className="flex items-center gap-4 px-4 py-2 bg-black/40 backdrop-blur-sm rounded-xl text-xs text-[#52525b]">
                  <span><Mouse size={11} className="inline mr-0.5" /> Orbiter</span>
                  <span><Settings2 size={11} className="inline mr-0.5" /> G/R/S transformer</span>
                  <span>Del supprimer</span>
                  <span>Ctrl+Z annuler</span>
                </div>
              </div>
            )}
          </div>
          {/* Status bar */}
          <div className="h-6 flex-shrink-0 flex items-center px-4 gap-6 bg-[#0a0a0b] border-t border-[#1e1e28] text-[10px] text-[#52525b] font-mono">
            {statusText ? (
              <span className="text-[#71717a]">{statusText}</span>
            ) : (
              <span>Aucune sélection</span>
            )}
            <span className="ml-auto text-cyan-400/50 uppercase tracking-widest">{transformMode}</span>
          </div>
        </div>
        <PropertiesPanel />
      </div>
    </>
  );
}

export function SceneEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#0a0a0b]">
      <SceneEditorProvider>
        <EditorInner canvasRef={canvasRef} />
      </SceneEditorProvider>
    </div>
  );
}
