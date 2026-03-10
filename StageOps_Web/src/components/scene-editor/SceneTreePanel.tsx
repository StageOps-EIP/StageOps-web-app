import { useState, useEffect, useRef } from 'react';
import { Box, Layers, Circle, Sun, Zap, Square, ChevronDown, ChevronRight, Plus, Eye, EyeOff, Lock, Unlock, Trash2 } from 'lucide-react';
import { useSceneEditor } from './scene-editor.store';
import type { SceneObject, SceneLight, SurfaceKey } from './scene-editor.types';
import { DEFAULT_MATERIAL } from './scene-editor.materials';
import { kelvinToHex } from './scene-editor.materials';

const SURFACE_LABELS: Record<SurfaceKey, string> = {
  floor:     'Sol',
  backWall:  'Fond de scène',
  leftWall:  'Jardin (gauche)',
  rightWall: 'Cour (droite)',
  ceiling:   'Plafond',
};

function ObjectIcon({ type }: { type: SceneObject['type'] }) {
  if (type === 'plane')    return <Layers size={13} />;
  if (type === 'cylinder') return <Circle size={13} />;
  return <Box size={13} />;
}

function LightIcon({ type }: { type: SceneLight['type'] }) {
  if (type === 'directional') return <Sun size={13} />;
  if (type === 'spot')        return <Zap size={13} />;
  if (type === 'rect-area')   return <Square size={13} />;
  return <Circle size={13} />;
}

function newDefaultObject(): SceneObject {
  return {
    id: `obj-${Date.now()}`,
    name: 'Praticable',
    type: 'box',
    position: [0, 0.5, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    material: { ...DEFAULT_MATERIAL },
    geometry: { width: 2, height: 1, depth: 2 },
    visible: true,
    locked: false,
  };
}

function newDefaultLight(): SceneLight {
  return {
    id: `light-${Date.now()}`,
    name: 'Spot',
    type: 'spot',
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

function ScrollItem({ active, children }: { active: boolean; children: React.ReactNode }) {
  const ref = useRef<HTMLLIElement>(null);
  useEffect(() => {
    if (active && ref.current) {
      ref.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [active]);
  return <li ref={ref}>{children}</li>;
}

export function SceneTreePanel() {
  const { state, dispatch } = useSceneEditor();
  const { objects, lights, selectedId, selectedType, selectedSurface, surfaces } = state;

  const [objectsOpen, setObjectsOpen] = useState(true);
  const [lightsOpen, setLightsOpen] = useState(true);

  return (
    <div className="w-64 flex-shrink-0 bg-[#0e0e12] border-r border-[#27272e] flex flex-col overflow-hidden">

      {/* Header */}
      <div className="px-4 py-3 border-b border-[#27272e]">
        <h2 className="text-xs font-semibold text-[#f5f5f7] uppercase tracking-wider">Scène</h2>
        <p className="text-[10px] text-[#52525b] mt-0.5">{objects.length} obj · {lights.length} lumières</p>
      </div>

      <div className="flex-1 overflow-y-auto">

        {/* ─ Objects section ────────────────────────────────────────── */}
        <div className="border-b border-[#27272e]/60">
          <button
            className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider hover:text-[#f5f5f7] transition-colors"
            onClick={() => setObjectsOpen(v => !v)}
          >
            <span className="flex items-center gap-1.5">
              {objectsOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
              Objets
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                dispatch({ type: 'ADD_OBJECT', object: newDefaultObject() });
              }}
              className="w-5 h-5 flex items-center justify-center rounded text-[#52525b] hover:text-cyan-400 hover:bg-cyan-400/10 transition-colors"
            >
              <Plus size={11} />
            </button>
          </button>

          {objectsOpen && (
            <ul className="pb-1">
              {objects.length === 0 && (
                <li className="px-4 py-3 text-[11px] text-[#52525b] italic">Aucun objet — cliquez + pour ajouter</li>
              )}
              {objects.map((obj) => {
                const active = selectedId === obj.id && selectedType === 'object';
                return (
                  <ScrollItem key={obj.id} active={active}>
                    <button
                      onClick={() => dispatch({ type: 'SELECT_OBJECT', id: obj.id })}
                      className={`w-full flex items-center gap-2 px-4 py-2 text-xs text-left group transition-colors ${
                        active
                          ? 'bg-cyan-400/10 border-l-2 border-cyan-400 text-[#f5f5f7]'
                          : 'border-l-2 border-transparent text-[#a1a1aa] hover:bg-[#1c1c21]/80 hover:text-[#f5f5f7]'
                      }`}
                    >
                      <span className="text-[#52525b]"><ObjectIcon type={obj.type} /></span>
                      <span className="flex-1 truncate">{obj.name}</span>
                      <span className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span
                          role="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch({ type: 'UPDATE_OBJECT', id: obj.id, updates: { visible: !obj.visible } });
                          }}
                          className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#27272e] text-[#52525b] hover:text-[#f5f5f7]"
                        >
                          {obj.visible ? <Eye size={10} /> : <EyeOff size={10} />}
                        </span>
                        <span
                          role="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch({ type: 'UPDATE_OBJECT', id: obj.id, updates: { locked: !obj.locked } });
                          }}
                          className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#27272e] text-[#52525b] hover:text-[#f5f5f7]"
                        >
                          {obj.locked ? <Lock size={10} /> : <Unlock size={10} />}
                        </span>
                        <span
                          role="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch({ type: 'DELETE_OBJECT', id: obj.id });
                          }}
                          className="w-5 h-5 flex items-center justify-center rounded hover:bg-red-500/20 text-[#52525b] hover:text-red-400"
                        >
                          <Trash2 size={10} />
                        </span>
                      </span>
                    </button>
                  </ScrollItem>
                );
              })}
            </ul>
          )}
        </div>

        {/* ─ Lights section ─────────────────────────────────────────── */}
        <div className="border-b border-[#27272e]/60">
          <button
            className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider hover:text-[#f5f5f7] transition-colors"
            onClick={() => setLightsOpen(v => !v)}
          >
            <span className="flex items-center gap-1.5">
              {lightsOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
              Lumières
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                dispatch({ type: 'ADD_LIGHT', light: newDefaultLight() });
              }}
              className="w-5 h-5 flex items-center justify-center rounded text-[#52525b] hover:text-cyan-400 hover:bg-cyan-400/10 transition-colors"
            >
              <Plus size={11} />
            </button>
          </button>

          {lightsOpen && (
            <ul className="pb-1">
              {lights.map((light) => {
                const active = selectedId === light.id && selectedType === 'light';
                const dotColor = kelvinToHex(light.temperature);
                return (
                  <ScrollItem key={light.id} active={active}>
                    <button
                      onClick={() => dispatch({ type: 'SELECT_LIGHT', id: light.id })}
                      className={`w-full flex items-center gap-2 px-4 py-2 text-xs text-left group transition-colors ${
                        active
                          ? 'bg-cyan-400/10 border-l-2 border-cyan-400 text-[#f5f5f7]'
                          : 'border-l-2 border-transparent text-[#a1a1aa] hover:bg-[#1c1c21]/80 hover:text-[#f5f5f7]'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: dotColor }}
                      />
                      <span className="text-[#52525b]"><LightIcon type={light.type} /></span>
                      <span className="flex-1 truncate">{light.name}</span>
                      <span className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span
                          role="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch({ type: 'UPDATE_LIGHT', id: light.id, updates: { visible: !light.visible } });
                          }}
                          className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#27272e] text-[#52525b] hover:text-[#f5f5f7]"
                        >
                          {light.visible ? <Eye size={10} /> : <EyeOff size={10} />}
                        </span>
                        <span
                          role="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch({ type: 'DELETE_LIGHT', id: light.id });
                          }}
                          className="w-5 h-5 flex items-center justify-center rounded hover:bg-red-500/20 text-[#52525b] hover:text-red-400"
                        >
                          <Trash2 size={10} />
                        </span>
                      </span>
                    </button>
                  </ScrollItem>
                );
              })}
            </ul>
          )}
        </div>

        {/* ─ Surfaces section ───────────────────────────────────────── */}
        <div>
          <div className="px-4 py-2.5 text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">
            Surfaces
          </div>
          <ul className="pb-2">
            {(Object.keys(SURFACE_LABELS) as SurfaceKey[]).map((key) => {
              const isActive = selectedType === 'surface' && selectedSurface === key;
              const mat = surfaces[key];
              return (
                <li key={key}>
                  <button
                    onClick={() => dispatch({ type: 'SELECT_SURFACE', surface: key })}
                    className={`w-full flex items-center gap-2.5 px-4 py-2 text-xs text-left transition-colors ${
                      isActive
                        ? 'bg-cyan-400/10 border-l-2 border-cyan-400 text-[#f5f5f7]'
                        : 'border-l-2 border-transparent text-[#a1a1aa] hover:bg-[#1c1c21] hover:text-[#f5f5f7]'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-sm flex-shrink-0 border border-white/10"
                      style={{ backgroundColor: mat.color }}
                    />
                    {SURFACE_LABELS[key]}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
