import { useState } from 'react';
import { Trash2, Copy } from 'lucide-react';
import { useSceneEditor } from './scene-editor.store';
import { MATERIAL_PRESETS, PRESET_LABELS, kelvinToHex } from './scene-editor.materials';
import type { SceneAction, SceneMaterial, MaterialPreset, SurfaceKey } from './scene-editor.types';

const PRESET_KEYS = Object.keys(MATERIAL_PRESETS) as MaterialPreset[];
type UpdateObjectUpdates = Extract<SceneAction, { type: 'UPDATE_OBJECT' }>['updates'];
type UpdateLightUpdates = Extract<SceneAction, { type: 'UPDATE_LIGHT' }>['updates'];

const SURFACE_LABELS: Record<SurfaceKey, string> = {
  floor:     'Sol',
  backWall:  'Fond de scène',
  leftWall:  'Jardin',
  rightWall: 'Cour',
  ceiling:   'Plafond',
};

function radToDeg(r: number) { return Math.round((r * 180) / Math.PI * 10) / 10; }
function degToRad(d: number) { return (d * Math.PI) / 180; }

// ─── Reusable slider ──────────────────────────────────────────────────────────
function Slider({ label, value, min, max, step, onChange }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-[11px] text-[#71717a]">{label}</span>
        <span className="text-[11px] text-[#a1a1aa] font-mono">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full accent-cyan-400 bg-[#27272e]"
      />
    </div>
  );
}

// ─── Number input ─────────────────────────────────────────────────────────────
function NumInput({ label, value, step, min, onChange }: {
  label: string; value: number; step?: number; min?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="block text-[10px] text-[#52525b] mb-0.5">{label}</label>
      <input
        type="number"
        step={step ?? 0.1}
        min={min}
        value={Math.round(value * 100) / 100}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className="w-full bg-[#1c1c21] border border-[#27272e] rounded-lg px-2 py-1 text-xs text-[#f5f5f7] focus:outline-none focus:border-cyan-400/50"
      />
    </div>
  );
}

// ─── Material preset grid ─────────────────────────────────────────────────────
function MaterialPresetGrid({ current, onSelect }: {
  current: SceneMaterial['preset'];
  onSelect: (p: MaterialPreset) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-1.5 mb-4">
      {PRESET_KEYS.map(p => (
        <button
          key={p}
          onClick={() => onSelect(p)}
          title={PRESET_LABELS[p]}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border transition-all ${
            current === p
              ? 'border-cyan-400 bg-cyan-400/10'
              : 'border-[#27272e] hover:border-[#35353e] bg-[#1c1c21]'
          }`}
        >
          <span
            className="w-5 h-5 rounded"
            style={{ backgroundColor: MATERIAL_PRESETS[p].color }}
          />
          <span className="text-[9px] text-[#71717a] truncate w-full text-center leading-none">
            {PRESET_LABELS[p].split(' ')[0]}
          </span>
        </button>
      ))}
    </div>
  );
}

// ─── Material editor ──────────────────────────────────────────────────────────
function MaterialEditor({ material, onChange }: {
  material: SceneMaterial;
  onChange: (updates: Partial<SceneMaterial>) => void;
}) {
  return (
    <div className="space-y-3">
      <MaterialPresetGrid
        current={material.preset}
        onSelect={(p) => {
          const preset = MATERIAL_PRESETS[p];
          onChange({ preset: p, ...preset });
        }}
      />

      <div className="h-px bg-[#27272e]" />
      <p className="text-[10px] text-[#52525b] uppercase tracking-wider font-semibold">Personnaliser</p>

      <div>
        <label className="block text-[11px] text-[#71717a] mb-1">Couleur</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={material.color}
            onChange={e => onChange({ color: e.target.value, preset: 'custom' })}
            className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
          />
          <span className="text-xs text-[#52525b] font-mono">{material.color}</span>
        </div>
      </div>

      <Slider label="Rugosité" value={material.roughness} min={0} max={1} step={0.01}
        onChange={v => onChange({ roughness: v, preset: 'custom' })} />
      <Slider label="Métallique" value={material.metalness} min={0} max={1} step={0.01}
        onChange={v => onChange({ metalness: v, preset: 'custom' })} />

      <div>
        <label className="block text-[11px] text-[#71717a] mb-1">Émissif</label>
        <input
          type="color"
          value={material.emissive}
          onChange={e => onChange({ emissive: e.target.value })}
          className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
        />
      </div>

      <Slider label="Intensité émissive" value={material.emissiveIntensity} min={0} max={3} step={0.05}
        onChange={v => onChange({ emissiveIntensity: v })} />
      <Slider label="Opacité" value={material.opacity} min={0} max={1} step={0.01}
        onChange={v => onChange({ opacity: v })} />

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={material.wireframe}
          onChange={e => onChange({ wireframe: e.target.checked })}
          className="accent-cyan-400"
        />
        <span className="text-xs text-[#a1a1aa]">Wireframe</span>
      </label>
    </div>
  );
}

// ─── Object panel ─────────────────────────────────────────────────────────────
function ObjectPanel() {
  const { state, dispatch } = useSceneEditor();
  const [tab, setTab] = useState<'transform' | 'material'>('transform');

  const obj = state.objects.find(o => o.id === state.selectedId);
  if (!obj) return null;

  function updateObj(updates: UpdateObjectUpdates) {
    dispatch({ type: 'UPDATE_OBJECT', id: obj!.id, updates });
  }

  return (
    <div>
      <div className="px-4 pb-3">
        <input
          type="text"
          value={obj.name}
          onChange={e => updateObj({ name: e.target.value })}
          className="w-full bg-[#1c1c21] border border-[#27272e] rounded-lg px-2 py-1 text-xs text-[#f5f5f7] focus:outline-none focus:border-cyan-400/50 mb-1"
        />
        <p className="text-[10px] text-[#52525b]">{obj.type}</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#27272e] mb-4 px-2">
        {(['transform', 'material'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-xs font-medium capitalize transition-colors ${
              tab === t ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-[#71717a] hover:text-[#a1a1aa]'
            }`}
          >
            {t === 'transform' ? 'Transform' : 'Matériau'}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-4">
        {tab === 'transform' && (
          <>
            <div>
              <p className="text-[10px] text-[#52525b] uppercase tracking-wider mb-2 font-semibold">Position</p>
              <div className="grid grid-cols-3 gap-1.5">
                {(['x', 'y', 'z'] as const).map((axis, i) => (
                  <NumInput key={axis} label={axis.toUpperCase()} value={obj.position[i]}
                    onChange={v => {
                      const pos = [...obj.position] as [number,number,number];
                      pos[i] = v;
                      updateObj({ position: pos });
                    }} />
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] text-[#52525b] uppercase tracking-wider mb-2 font-semibold">Rotation (°)</p>
              <div className="grid grid-cols-3 gap-1.5">
                {(['x', 'y', 'z'] as const).map((axis, i) => (
                  <NumInput key={axis} label={axis.toUpperCase()} value={radToDeg(obj.rotation[i])}
                    step={1}
                    onChange={v => {
                      const rot = [...obj.rotation] as [number,number,number];
                      rot[i] = degToRad(v);
                      updateObj({ rotation: rot });
                    }} />
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] text-[#52525b] uppercase tracking-wider mb-2 font-semibold">Échelle</p>
              <div className="grid grid-cols-3 gap-1.5">
                {(['x', 'y', 'z'] as const).map((axis, i) => (
                  <NumInput key={axis} label={axis.toUpperCase()} value={obj.scale[i]}
                    step={0.01} min={0.01}
                    onChange={v => {
                      const sc = [...obj.scale] as [number,number,number];
                      sc[i] = Math.max(0.01, v);
                      updateObj({ scale: sc });
                    }} />
                ))}
              </div>
            </div>

            <button
              onClick={() => updateObj({ position: [0, 0.5, 0], rotation: [0, 0, 0], scale: [1, 1, 1] })}
              className="w-full px-3 py-1.5 rounded-lg text-xs text-[#71717a] bg-[#1c1c21] hover:bg-[#27272e] hover:text-[#f5f5f7] transition-colors"
            >
              Réinitialiser transform
            </button>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={obj.visible}
                  onChange={e => updateObj({ visible: e.target.checked })}
                  className="accent-cyan-400" />
                <span className="text-xs text-[#a1a1aa]">Visible</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={obj.locked}
                  onChange={e => updateObj({ locked: e.target.checked })}
                  className="accent-cyan-400" />
                <span className="text-xs text-[#a1a1aa]">Verrouillé</span>
              </label>
            </div>
          </>
        )}

        {tab === 'material' && (
          <MaterialEditor
            material={obj.material}
            onChange={updates => updateObj({ material: { ...obj.material, ...updates } })}
          />
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pt-4 pb-2 flex gap-2">
        <button
          onClick={() => dispatch({ type: 'DUPLICATE_OBJECT', id: obj.id })}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-[#a1a1aa] bg-[#1c1c21] hover:bg-[#27272e] hover:text-[#f5f5f7] border border-[#27272e] transition-colors"
        >
          <Copy size={12} />
          Dupliquer
        </button>
        <button
          onClick={() => dispatch({ type: 'DELETE_OBJECT', id: obj.id })}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors"
        >
          <Trash2 size={12} />
          Supprimer
        </button>
      </div>
    </div>
  );
}

// ─── Light panel ──────────────────────────────────────────────────────────────
function LightPanel() {
  const { state, dispatch } = useSceneEditor();
  const light = state.lights.find(l => l.id === state.selectedId);
  if (!light) return null;

  function update(updates: UpdateLightUpdates) {
    dispatch({ type: 'UPDATE_LIGHT', id: light!.id, updates });
  }

  const typeLabels: Record<string, string> = {
    directional: 'Directionnelle', spot: 'Spot', point: 'Ponctuelle', 'rect-area': 'Area',
  };

  return (
    <div className="px-4 space-y-4">

      {/* En-tête : badge type + nom modifiable */}
      <div>
        <span className="inline-block px-2 py-0.5 rounded-full bg-[#27272e] text-[10px] text-[#a1a1aa] font-medium">
          {typeLabels[light.type] ?? light.type}
        </span>
        <input
          type="text"
          value={light.name}
          onChange={e => update({ name: e.target.value })}
          className="mt-1 w-full bg-[#1c1c21] border border-[#27272e] rounded-lg px-2 py-1 text-xs text-[#f5f5f7] focus:outline-none focus:border-cyan-400/50"
        />
      </div>

      {/* Position XYZ */}
      <div>
        <p className="text-[10px] text-[#52525b] uppercase tracking-wider mb-2 font-semibold">Position</p>
        <div className="grid grid-cols-3 gap-1.5">
          {(['x', 'y', 'z'] as const).map((axis, i) => (
            <NumInput key={axis} label={axis.toUpperCase()} value={light.position[i]}
              onChange={v => {
                const pos = [...light.position] as [number, number, number];
                pos[i] = v;
                update({ position: pos });
              }} />
          ))}
        </div>
      </div>

      {/* Target XYZ — spot uniquement */}
      {light.type === 'spot' && (
        <div>
          <p className="text-[10px] text-[#52525b] uppercase tracking-wider mb-2 font-semibold">Cible (Target)</p>
          <div className="grid grid-cols-3 gap-1.5">
            {(['x', 'y', 'z'] as const).map((axis, i) => (
              <NumInput key={axis} label={axis.toUpperCase()} value={(light.targetPosition ?? [0, 0, 0])[i]}
                onChange={v => {
                  const tgt = [...(light.targetPosition ?? [0, 0, 0])] as [number, number, number];
                  tgt[i] = v;
                  update({ targetPosition: tgt });
                }} />
            ))}
          </div>
        </div>
      )}

      <Slider label="Intensité" value={light.intensity} min={0} max={10} step={0.05}
        onChange={v => update({ intensity: v })} />

      {/* Température avec barre gradient */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-[11px] text-[#71717a]">Température (K)</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-[#52525b] font-mono">{light.temperature}K</span>
            <span
              className="w-5 h-5 rounded border border-white/10"
              style={{ backgroundColor: kelvinToHex(light.temperature) }}
            />
          </div>
        </div>
        <input
          type="range" min={2700} max={10000} step={100}
          value={light.temperature}
          onChange={e => {
            const temp = parseInt(e.target.value);
            update({ temperature: temp, color: kelvinToHex(temp) });
          }}
          className="w-full h-1.5 rounded-full accent-cyan-400"
          style={{ background: 'transparent' }}
        />
        {/* Barre de visualisation couleur température */}
        <div
          className="w-full h-2 rounded-full mt-1"
          style={{ background: 'linear-gradient(to right, #ff7700, #ffffff, #aaccff)' }}
        />
        <div className="flex justify-between text-[9px] text-[#52525b] mt-0.5">
          <span>2700K</span>
          <span>10000K</span>
        </div>
      </div>

      <div>
        <label className="block text-[11px] text-[#71717a] mb-1">Couleur override</label>
        <input type="color" value={light.color}
          onChange={e => update({ color: e.target.value })}
          className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent" />
      </div>

      {(light.type === 'spot' || light.type === 'directional') && (
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={light.castShadow}
            onChange={e => update({ castShadow: e.target.checked })}
            className="accent-cyan-400" />
          <span className="text-xs text-[#a1a1aa]">Projeter ombres</span>
        </label>
      )}

      {light.type === 'spot' && (
        <>
          <Slider label="Angle (°)" value={radToDeg(light.angle)} min={1} max={90} step={1}
            onChange={v => update({ angle: degToRad(v) })} />
          <Slider label="Pénombre" value={light.penumbra} min={0} max={1} step={0.01}
            onChange={v => update({ penumbra: v })} />
        </>
      )}

      {(light.type === 'spot' || light.type === 'point') && (
        <Slider label="Distance" value={light.distance} min={0} max={50} step={0.5}
          onChange={v => update({ distance: v })} />
      )}

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={light.visible}
          onChange={e => update({ visible: e.target.checked })}
          className="accent-cyan-400" />
        <span className="text-xs text-[#a1a1aa]">Visible</span>
      </label>

      <button
        onClick={() => {
          dispatch({ type: 'DELETE_LIGHT', id: light.id });
        }}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors"
      >
        <Trash2 size={13} />
        Supprimer la lumière
      </button>
    </div>
  );
}

// ─── Surface panel ────────────────────────────────────────────────────────────
function SurfacePanel() {
  const { state, dispatch } = useSceneEditor();
  const key = state.selectedSurface;
  if (!key) return null;

  const mat = state.surfaces[key];

  function update(updates: Partial<typeof mat>) {
    dispatch({ type: 'UPDATE_SURFACE', surface: key!, material: updates });
  }

  function applyToAll() {
    const surfaces: SurfaceKey[] = ['floor', 'backWall', 'leftWall', 'rightWall', 'ceiling'];
    surfaces.forEach(s => dispatch({ type: 'UPDATE_SURFACE', surface: s, material: mat }));
  }

  return (
    <div className="px-4 space-y-4">
      <div>
        <p className="text-xs text-[#a1a1aa] font-medium">Surface : {SURFACE_LABELS[key]}</p>
      </div>

      <MaterialEditor
        material={mat}
        onChange={update}
      />

      <button
        onClick={applyToAll}
        className="w-full px-3 py-2 rounded-lg text-xs font-medium text-[#71717a] bg-[#1c1c21] hover:bg-[#27272e] hover:text-[#f5f5f7] border border-[#27272e] transition-colors"
      >
        Appliquer à toutes les surfaces
      </button>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function PropertiesPanel() {
  const { state } = useSceneEditor();
  const { selectedType } = state;

  return (
    <div className="w-72 flex-shrink-0 bg-[#0e0e12] border-l border-[#27272e] flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-[#27272e] flex-shrink-0">
        <h2 className="text-xs font-semibold text-[#f5f5f7] uppercase tracking-wider">Propriétés</h2>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        {!selectedType && (
          <div className="px-4 text-center py-12">
            <p className="text-xs text-[#52525b] leading-relaxed">
              Cliquez sur un objet, une lumière ou une surface pour modifier ses propriétés.
            </p>
          </div>
        )}
        {selectedType === 'object' && <ObjectPanel />}
        {selectedType === 'light'  && <LightPanel />}
        {selectedType === 'surface' && <SurfacePanel />}
      </div>
    </div>
  );
}
