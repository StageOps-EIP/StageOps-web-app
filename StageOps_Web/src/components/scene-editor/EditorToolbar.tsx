import { useState } from 'react';
import type { RefObject } from 'react';
import { useNavigate } from 'react-router';
import {
  Wand2, ArrowLeft, Move, RotateCw, Maximize2,
  Plus, Undo2, Redo2, Camera, ChevronDown, X,
} from 'lucide-react';
import { useSceneEditor } from './scene-editor.store';
import type { SceneObject, SceneLight, TransformMode } from './scene-editor.types';
import { DEFAULT_MATERIAL } from './scene-editor.materials';
import { kelvinToHex } from './scene-editor.materials';

interface EditorToolbarProps {
  canvasRef: RefObject<HTMLCanvasElement>;
}

function newObject(type: SceneObject['type'], name: string): SceneObject {
  return {
    id: `obj-${Date.now()}`,
    name,
    type,
    position: [0, type === 'plane' ? 0.01 : 0.5, 0],
    rotation: type === 'plane' ? [-Math.PI / 2, 0, 0] : [0, 0, 0],
    scale: [1, 1, 1],
    material: { ...DEFAULT_MATERIAL },
    geometry: { width: 2, height: type === 'plane' ? 2 : 1, depth: 2 },
    visible: true,
    locked: false,
  };
}

function newLight(type: SceneLight['type'], name: string): SceneLight {
  return {
    id: `light-${Date.now()}`,
    name,
    type,
    position: [0, 8, 0],
    targetPosition: [0, 0, 0],
    color: kelvinToHex(5500),
    intensity: 2,
    temperature: 5500,
    castShadow: false,
    distance: 20,
    angle: Math.PI / 6,
    penumbra: 0.4,
    width: 2,
    height: 2,
    visible: true,
  };
}

const TRANSFORM_MODES: { mode: TransformMode; label: string; shortcut: string; Icon: React.FC<{ size?: number }> }[] = [
  { mode: 'translate', label: 'Déplacer', shortcut: 'G', Icon: Move },
  { mode: 'rotate',    label: 'Rotation',  shortcut: 'R', Icon: RotateCw },
  { mode: 'scale',     label: 'Échelle',   shortcut: 'S', Icon: Maximize2 },
];

export function EditorToolbar({ canvasRef }: EditorToolbarProps) {
  const navigate = useNavigate();
  const { state, dispatch } = useSceneEditor();
  const { transformMode, postProcessing, historyIndex, history } = state;
  const pp = postProcessing;

  const [showAddMenu, setShowAddMenu] = useState(false);

  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < history.length - 1;

  function handleExport() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scene-export.png';
    a.click();
  }

  return (
    <div className="flex items-center justify-between h-14 px-4 bg-[#131316] border-b border-[#27272e] flex-shrink-0 z-20 relative">

      {/* ─ Left ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-[#f5f5f7]">
          <Wand2 size={18} className="text-cyan-400" />
          <span className="text-sm font-semibold">Éditeur Scénique</span>
        </div>
        <div className="w-px h-5 bg-[#27272e]" />
        <button
          onClick={() => navigate('/stage')}
          className="flex items-center gap-1.5 text-xs text-[#71717a] hover:text-[#f5f5f7] transition-colors"
        >
          <ArrowLeft size={13} />
          Vue Scène
        </button>
      </div>

      {/* ─ Centre ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">

        {/* Mode badge */}
        <span className="px-2 py-1 rounded text-[10px] font-bold text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 tracking-widest uppercase">
          {transformMode}
        </span>

        {/* Transform modes — button group */}
        <div className="flex rounded-lg overflow-hidden border border-[#27272e]">
          {TRANSFORM_MODES.map(({ mode, label, shortcut, Icon }, i) => (
            <button
              key={mode}
              title={`${label} (${shortcut})`}
              onClick={() => dispatch({ type: 'SET_TRANSFORM_MODE', mode })}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                transformMode === mode
                  ? 'bg-cyan-400 text-black'
                  : 'bg-[#1c1c21] text-[#a1a1aa] hover:bg-[#27272e] hover:text-[#f5f5f7]'
              } ${i > 0 ? 'border-l border-[#27272e]' : ''}`}
            >
              <Icon size={13} />
              {shortcut}
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-[#27272e]" />

        {/* Add menu */}
        <div className="relative">
          <button
            onClick={() => setShowAddMenu(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1c1c21] text-[#a1a1aa] hover:text-[#f5f5f7] transition-colors"
          >
            <Plus size={13} />
            Ajouter
            <ChevronDown size={11} />
          </button>

          {showAddMenu && (
            <div
              className="absolute top-10 left-0 z-50 w-52 bg-[#1c1c21] border border-[#27272e] rounded-xl shadow-2xl overflow-hidden py-1"
              onMouseLeave={() => setShowAddMenu(false)}
            >
              <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#52525b]">Objets</p>
              {([
                ['box', 'Praticable (Cube)'],
                ['plane', 'Décor plan'],
                ['cylinder', 'Colonne / cylindre'],
              ] as [SceneObject['type'], string][]).map(([type, label]) => (
                <button
                  key={type}
                  onClick={() => {
                    dispatch({ type: 'ADD_OBJECT', object: newObject(type, label) });
                    setShowAddMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-[#a1a1aa] hover:bg-[#27272e] hover:text-[#f5f5f7] transition-colors"
                >
                  {label}
                </button>
              ))}

              <div className="h-px bg-[#27272e] my-1" />
              <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#52525b]">Lumières</p>
              {([
                ['directional', 'Lumière directionnelle'],
                ['spot',        'Spot'],
                ['point',       'Lumière ponctuelle'],
                ['rect-area',   'Area light'],
              ] as [SceneLight['type'], string][]).map(([type, label]) => (
                <button
                  key={type}
                  onClick={() => {
                    dispatch({ type: 'ADD_LIGHT', light: newLight(type, label) });
                    setShowAddMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-[#a1a1aa] hover:bg-[#27272e] hover:text-[#f5f5f7] transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-[#27272e]" />

        {/* Undo / Redo */}
        <div className="flex items-center gap-1">
          <button
            disabled={!canUndo}
            onClick={() => dispatch({ type: 'UNDO' })}
            title="Annuler (Ctrl+Z)"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#71717a] hover:text-[#f5f5f7] hover:bg-[#27272e] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <Undo2 size={14} />
          </button>
          <button
            disabled={!canRedo}
            onClick={() => dispatch({ type: 'REDO' })}
            title="Rétablir (Ctrl+Y)"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#71717a] hover:text-[#f5f5f7] hover:bg-[#27272e] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <Redo2 size={14} />
          </button>
        </div>
      </div>

      {/* ─ Right ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">

        {/* HD Quality toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-xs text-[#71717a]">Qualité HD</span>
          <div
            onClick={() => dispatch({ type: 'UPDATE_POSTPROCESSING', updates: { highQuality: !pp.highQuality } })}
            className={`relative w-8 h-4 rounded-full transition-colors cursor-pointer ${pp.highQuality ? 'bg-cyan-400' : 'bg-[#27272e]'}`}
          >
            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${pp.highQuality ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </div>
        </label>

        {/* Bloom toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-xs text-[#71717a]">Bloom</span>
          <div
            onClick={() => dispatch({ type: 'UPDATE_POSTPROCESSING', updates: { bloom: !pp.bloom } })}
            className={`relative w-8 h-4 rounded-full transition-colors cursor-pointer ${pp.bloom ? 'bg-cyan-400' : 'bg-[#27272e]'}`}
          >
            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${pp.bloom ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </div>
        </label>

        {/* Vignette toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-xs text-[#71717a]">Vignette</span>
          <div
            onClick={() => dispatch({ type: 'UPDATE_POSTPROCESSING', updates: { vignette: !pp.vignette } })}
            className={`relative w-8 h-4 rounded-full transition-colors cursor-pointer ${pp.vignette ? 'bg-cyan-400' : 'bg-[#27272e]'}`}
          >
            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${pp.vignette ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </div>
        </label>

        <div className="w-px h-6 bg-[#27272e]" />

        {/* Export */}
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#a1a1aa] hover:text-[#f5f5f7] hover:bg-[#27272e] transition-colors"
        >
          <Camera size={13} />
          Export PNG
        </button>

        {/* Close */}
        <button
          onClick={() => navigate('/stage')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#71717a] hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <X size={13} />
          Fermer
        </button>
      </div>
    </div>
  );
}
