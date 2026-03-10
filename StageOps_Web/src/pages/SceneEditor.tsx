import { useRef, useEffect, useState, useCallback } from 'react';
import { Mouse, Settings2, Maximize2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { SceneEditorProvider } from '@/components/scene-editor/scene-editor.provider';
import { useSceneEditor } from '@/components/scene-editor/scene-editor.store';
import { EditorToolbar } from '@/components/scene-editor/EditorToolbar';
import { EditorCanvas, type CameraView } from '@/components/scene-editor/EditorCanvas';
import { SceneTreePanel } from '@/components/scene-editor/SceneTreePanel';
import { PropertiesPanel } from '@/components/scene-editor/PropertiesPanel';

// Inner component that has access to the store context
function EditorInner({ canvasRef }: { canvasRef: React.RefObject<HTMLCanvasElement> }) {
  const { state, dispatch } = useSceneEditor();
  const { selectedId, selectedType, transformMode, objects, lights, stageSize } = state;
  const navigate = useNavigate();
  const [cameraView, setCameraView] = useState<CameraView>(null);
  const handleCameraViewHandled = useCallback(() => setCameraView(null), []);
  const [showStagePanel, setShowStagePanel] = useState(false);

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
      // Focus selected (F)
      if (e.key === 'f' || e.key === 'F') {
        const selObj = selectedType === 'object' ? objects.find(o => o.id === selectedId) : null;
        const selLight = selectedType === 'light' ? lights.find(l => l.id === selectedId) : null;
        const target = selObj?.position ?? selLight?.position;
        if (target) setCameraView({ type: 'focus', target });
        return;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, selectedId, selectedType, navigate, objects, lights, setCameraView]);

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
            <EditorCanvas
              canvasRef={canvasRef}
              cameraView={cameraView}
              onCameraViewHandled={handleCameraViewHandled}
            />
            {/* Camera view preset buttons */}
            <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
              {([
                { key: 'persp', label: 'Persp' },
                { key: 'top',   label: 'Haut' },
                { key: 'front', label: 'Face' },
                { key: 'side',  label: 'Côté' },
              ] as const).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setCameraView({ type: key })}
                  className="px-2 py-1 rounded-lg text-[10px] font-medium bg-black/50 text-[#a1a1aa] hover:text-[#f5f5f7] hover:bg-black/70 backdrop-blur-sm border border-white/10 transition-colors"
                >
                  {label}
                </button>
              ))}

              {/* Stage size button */}
              <button
                onClick={() => setShowStagePanel(v => !v)}
                className={`mt-1 px-2 py-1 rounded-lg text-[10px] font-medium backdrop-blur-sm border transition-colors flex items-center gap-1 ${
                  showStagePanel
                    ? 'bg-cyan-400/20 text-cyan-400 border-cyan-400/30'
                    : 'bg-black/50 text-[#a1a1aa] hover:text-[#f5f5f7] hover:bg-black/70 border-white/10'
                }`}
              >
                <Maximize2 size={10} /> Scène
              </button>

              {/* Stage size panel */}
              {showStagePanel && (
                <div className="mt-1 p-3 rounded-xl bg-[#0e0e12]/90 backdrop-blur-sm border border-[#27272e] text-[11px] flex flex-col gap-2 min-w-[140px]">
                  <p className="text-[#a1a1aa] font-semibold uppercase tracking-widest text-[9px]">Dimensions (m)</p>
                  {([
                    { key: 'width',  label: 'Largeur' },
                    { key: 'depth',  label: 'Profondeur' },
                    { key: 'height', label: 'Hauteur' },
                  ] as const).map(({ key, label }) => (
                    <label key={key} className="flex items-center justify-between gap-2">
                      <span className="text-[#71717a]">{label}</span>
                      <input
                        type="number"
                        min={4}
                        max={60}
                        step={1}
                        value={stageSize[key]}
                        onChange={e => dispatch({ type: 'UPDATE_STAGE_SIZE', updates: { [key]: Number(e.target.value) } })}
                        className="w-14 bg-[#131316] border border-[#27272e] rounded-md px-2 py-0.5 text-[#f5f5f7] text-right focus:outline-none focus:border-cyan-400/50"
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>
            {/* Hint overlay when nothing selected */}
            {!selectedId && (
              <div className="absolute inset-0 flex items-end justify-center pb-8 pointer-events-none z-10">
                <div className="flex items-center gap-4 px-4 py-2 bg-black/40 backdrop-blur-sm rounded-xl text-xs text-[#52525b]">
                  <span><Mouse size={11} className="inline mr-0.5" /> Orbiter</span>
                  <span><Settings2 size={11} className="inline mr-0.5" /> G/R/S transformer</span>
                  <span>F centrer</span>
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
