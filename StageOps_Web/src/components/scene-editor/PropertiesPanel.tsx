import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useSceneEditor } from '@/hooks/useSceneEditor'
import { useDisplayedScene, usePlayback } from '@/hooks/usePlayback'
import { cueAt, formatShowTime, keyframeFor, type TimelineTarget } from '@/domain/timeline'
import {
  ASSEMBLED_OBJECT_TYPES,
  MATERIAL_PRESETS,
  MATERIAL_PRESET_KEYS,
  kelvinToHex,
  type MaterialPreset,
  type Posture,
  type SceneLight,
  type SceneMaterial,
  type SceneObject,
} from '@/domain/scene-models'
import { PRESET_LABELS, SURFACE_LABELS } from './scene-editor.labels'

/**
 * Continuous inputs (sliders, typed numbers, colour pickers) group their changes into a
 * single undo step: the gesture starts on focus/press and ends on blur/release.
 */
function useGestureHandlers() {
  const { beginGesture, endGesture } = useSceneEditor()
  return {
    onFocus: beginGesture,
    onPointerDown: beginGesture,
    onPointerUp: endGesture,
    onBlur: endGesture,
  }
}

function radToDeg(r: number) {
  return Math.round(((r * 180) / Math.PI) * 10) / 10
}
function degToRad(d: number) {
  return (d * Math.PI) / 180
}

// ─── Reusable slider ──────────────────────────────────────────────────────────
function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
}) {
  const gesture = useGestureHandlers()
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-[11px] text-[#71717a]">{label}</span>
        <span className="text-[11px] text-[#a1a1aa] font-mono">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        {...gesture}
        className="w-full h-1.5 rounded-full accent-cyan-400 bg-[#27272e]"
      />
    </div>
  )
}

// ─── Number input ─────────────────────────────────────────────────────────────
function NumInput({
  label,
  value,
  step,
  min,
  onChange,
}: {
  label: string
  value: number
  step?: number
  min?: number
  onChange: (v: number) => void
}) {
  const gesture = useGestureHandlers()
  return (
    <div>
      <label className="block text-[10px] text-[#52525b] mb-0.5">{label}</label>
      <input
        type="number"
        step={step ?? 0.1}
        min={min}
        value={Math.round(value * 100) / 100}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        {...gesture}
        className="w-full bg-[#1c1c21] border border-[#27272e] rounded-lg px-2 py-1 text-xs text-[#f5f5f7] focus:outline-none focus:border-cyan-400/50"
      />
    </div>
  )
}

// ─── Material preset grid ─────────────────────────────────────────────────────
function MaterialPresetGrid({
  current,
  onSelect,
}: {
  current: SceneMaterial['preset']
  onSelect: (p: MaterialPreset) => void
}) {
  return (
    <div className="grid grid-cols-4 gap-1.5 mb-4">
      {MATERIAL_PRESET_KEYS.map((p) => (
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
  )
}

// ─── Material editor ──────────────────────────────────────────────────────────
function MaterialEditor({
  material,
  onChange,
}: {
  material: SceneMaterial
  onChange: (updates: Partial<SceneMaterial>) => void
}) {
  const gesture = useGestureHandlers()
  return (
    <div className="space-y-3">
      <MaterialPresetGrid
        current={material.preset}
        onSelect={(p) => {
          const preset = MATERIAL_PRESETS[p]
          onChange({ preset: p, ...preset })
        }}
      />

      <div className="h-px bg-[#27272e]" />
      <p className="text-[10px] text-[#52525b] uppercase tracking-wider font-semibold">
        Personnaliser
      </p>

      <div>
        <label className="block text-[11px] text-[#71717a] mb-1">Couleur</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={material.color}
            onChange={(e) => onChange({ color: e.target.value, preset: 'custom' })}
            {...gesture}
            className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
          />
          <span className="text-xs text-[#52525b] font-mono">{material.color}</span>
        </div>
      </div>

      <Slider
        label="Rugosité"
        value={material.roughness}
        min={0}
        max={1}
        step={0.01}
        onChange={(v) => onChange({ roughness: v, preset: 'custom' })}
      />
      <Slider
        label="Métallique"
        value={material.metalness}
        min={0}
        max={1}
        step={0.01}
        onChange={(v) => onChange({ metalness: v, preset: 'custom' })}
      />

      <div>
        <label className="block text-[11px] text-[#71717a] mb-1">Émissif</label>
        <input
          type="color"
          value={material.emissive}
          onChange={(e) => onChange({ emissive: e.target.value })}
          {...gesture}
          className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
        />
      </div>

      <Slider
        label="Intensité émissive"
        value={material.emissiveIntensity}
        min={0}
        max={3}
        step={0.05}
        onChange={(v) => onChange({ emissiveIntensity: v })}
      />
      <Slider
        label="Opacité"
        value={material.opacity}
        min={0}
        max={1}
        step={0.01}
        onChange={(v) => onChange({ opacity: v })}
      />

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={material.wireframe}
          onChange={(e) => onChange({ wireframe: e.target.checked })}
          className="accent-cyan-400"
        />
        <span className="text-xs text-[#a1a1aa]">Wireframe</span>
      </label>
    </div>
  )
}

// ─── Object panel ─────────────────────────────────────────────────────────────
/** Conduite mode: what this element does at the cue under the playhead. */
function CueSection({ target }: { target: TimelineTarget }) {
  const { scene, mode, setTransition, removeFromCue, beginGesture, endGesture } = useSceneEditor()
  const { time } = usePlayback()
  if (mode !== 'conduite') return null
  const cue = cueAt(scene.timeline, time)
  const frame = cue ? keyframeFor(scene.timeline, cue.id, target) : undefined
  const transition = frame?.transition
  return (
    <div className="mx-4 mb-4 rounded-lg border border-[var(--brand-violet)]/40 bg-[var(--brand-soft)] p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--brand-violet-hover)]">
        Conduite · {formatShowTime(time)}
        {cue ? ` · Q${cue.number}` : ''}
      </p>
      {!frame || !cue || !transition ? (
        <p className="mt-1 text-[11px] leading-relaxed text-content-muted">
          Déplacez, tournez ou réglez cet élément : le changement sera enregistré
          {cue ? ` dans Q${cue.number}` : ` dans un nouveau cue à ${formatShowTime(time)}`}.
        </p>
      ) : (
        <div className="mt-2 space-y-2">
          <div role="group" aria-label="Transition" className="flex gap-1">
            {(
              [
                ['cut', 'Coupe'],
                ['smooth', 'Progressif'],
              ] as const
            ).map(([kind, label]) => (
              <button
                key={kind}
                type="button"
                aria-pressed={transition.kind === kind}
                onClick={() =>
                  setTransition(
                    cue.id,
                    target,
                    kind === 'cut' ? { kind: 'cut' } : { kind: 'smooth', duration: null },
                  )
                }
                className={`flex-1 rounded-md border px-2 py-1 text-[11px] ${
                  transition.kind === kind
                    ? 'border-cyan-400 bg-cyan-400/10 text-[#f5f5f7]'
                    : 'border-[#27272e] text-[#a1a1aa] hover:text-[#f5f5f7]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {transition.kind === 'smooth' && (
            <label className="flex items-center gap-2 text-[11px] text-content-muted">
              Durée
              <input
                type="number"
                min={0}
                step={0.5}
                placeholder="auto"
                aria-label="Durée de la transition en secondes"
                value={transition.duration ?? ''}
                onChange={(e) => {
                  const value =
                    e.target.value === '' ? null : Math.max(0, parseFloat(e.target.value))
                  setTransition(cue.id, target, {
                    kind: 'smooth',
                    duration: value === null || Number.isNaN(value) ? null : value,
                  })
                }}
                onFocus={beginGesture}
                onBlur={endGesture}
                className="w-16 rounded border border-[#27272e] bg-[#1c1c21] px-1.5 py-0.5 text-xs text-[#f5f5f7]"
              />
              <span>
                s {transition.duration === null ? '(depuis le cue précédent)' : 'avant le cue'}
              </span>
            </label>
          )}
          <button
            type="button"
            onClick={() => removeFromCue(cue.id, target)}
            className="text-[11px] text-red-400 hover:underline"
          >
            Retirer cet élément de Q{cue.number}
          </button>
        </div>
      )}
    </div>
  )
}

const POSTURE_LABELS: Record<Posture, string> = {
  standing: 'Debout',
  sitting: 'Assis',
  lying: 'Allongé',
}

function ObjectPanel() {
  const { selection, updateObject } = useSceneEditor()
  const gesture = useGestureHandlers()
  const [tab, setTab] = useState<'transform' | 'material'>('transform')

  const displayed = useDisplayedScene()
  const obj =
    selection?.kind === 'object' ? displayed.objects.find((o) => o.id === selection.id) : undefined
  if (!obj) return null

  function updateObj(updates: Partial<Omit<SceneObject, 'id'>>) {
    updateObject(obj!.id, updates)
  }

  return (
    <div>
      <div className="px-4 pb-3">
        <input
          type="text"
          aria-label="Nom"
          value={obj.name}
          onChange={(e) => updateObj({ name: e.target.value })}
          {...gesture}
          className="w-full bg-[#1c1c21] border border-[#27272e] rounded-lg px-2 py-1 text-xs text-[#f5f5f7] focus:outline-none focus:border-cyan-400/50"
        />
        <p className="mt-1 text-[10px] text-[#52525b]">{obj.type}</p>
        {obj.type === 'person' && (
          <div className="mt-3 flex gap-1" role="group" aria-label="Posture">
            {(Object.keys(POSTURE_LABELS) as Posture[]).map((posture) => (
              <button
                key={posture}
                type="button"
                aria-pressed={(obj.posture ?? 'standing') === posture}
                onClick={() => updateObj({ posture })}
                className={`flex-1 rounded-md border px-2 py-1 text-[11px] ${
                  (obj.posture ?? 'standing') === posture
                    ? 'border-cyan-400 bg-cyan-400/10 text-[#f5f5f7]'
                    : 'border-[#27272e] text-[#a1a1aa] hover:text-[#f5f5f7]'
                }`}
              >
                {POSTURE_LABELS[posture]}
              </button>
            ))}
          </div>
        )}
      </div>

      <CueSection target={{ kind: 'object', id: obj.id }} />

      {/* Tabs */}
      <div className="flex border-b border-[#27272e] mb-4 px-2">
        {(['transform', 'material'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-xs font-medium capitalize transition-colors ${
              tab === t
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-[#71717a] hover:text-[#a1a1aa]'
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
              <p className="text-[10px] text-[#52525b] uppercase tracking-wider mb-2 font-semibold">
                Position
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {(['x', 'y', 'z'] as const).map((axis, i) => (
                  <NumInput
                    key={axis}
                    label={axis.toUpperCase()}
                    value={obj.position[i]}
                    onChange={(v) => {
                      const pos = [...obj.position] as [number, number, number]
                      pos[i] = v
                      updateObj({ position: pos })
                    }}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] text-[#52525b] uppercase tracking-wider mb-2 font-semibold">
                Rotation (°)
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {(['x', 'y', 'z'] as const).map((axis, i) => (
                  <NumInput
                    key={axis}
                    label={axis.toUpperCase()}
                    value={radToDeg(obj.rotation[i])}
                    step={1}
                    onChange={(v) => {
                      const rot = [...obj.rotation] as [number, number, number]
                      rot[i] = degToRad(v)
                      updateObj({ rotation: rot })
                    }}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] text-[#52525b] uppercase tracking-wider mb-2 font-semibold">
                Échelle
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {(['x', 'y', 'z'] as const).map((axis, i) => (
                  <NumInput
                    key={axis}
                    label={axis.toUpperCase()}
                    value={obj.scale[i]}
                    step={0.01}
                    min={0.01}
                    onChange={(v) => {
                      const sc = [...obj.scale] as [number, number, number]
                      sc[i] = Math.max(0.01, v)
                      updateObj({ scale: sc })
                    }}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={() =>
                updateObj({
                  position: [0, ASSEMBLED_OBJECT_TYPES.includes(obj.type) ? 0 : 0.5, 0],
                  rotation: [0, 0, 0],
                  scale: [1, 1, 1],
                })
              }
              className="w-full px-3 py-1.5 rounded-lg text-xs text-[#71717a] bg-[#1c1c21] hover:bg-[#27272e] hover:text-[#f5f5f7] transition-colors"
            >
              Réinitialiser transform
            </button>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={obj.visible}
                  onChange={(e) => updateObj({ visible: e.target.checked })}
                  className="accent-cyan-400"
                />
                <span className="text-xs text-[#a1a1aa]">Visible</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={obj.locked}
                  onChange={(e) => updateObj({ locked: e.target.checked })}
                  className="accent-cyan-400"
                />
                <span className="text-xs text-[#a1a1aa]">Verrouillé</span>
              </label>
            </div>
          </>
        )}

        {tab === 'material' && (
          <MaterialEditor
            material={obj.material}
            onChange={(updates) => updateObj({ material: { ...obj.material, ...updates } })}
          />
        )}
      </div>
    </div>
  )
}

// ─── Light panel ──────────────────────────────────────────────────────────────
function LightPanel() {
  const { selection, updateLight, deleteLight } = useSceneEditor()
  const gesture = useGestureHandlers()
  const displayed = useDisplayedScene()
  const light =
    selection?.kind === 'light' ? displayed.lights.find((l) => l.id === selection.id) : undefined
  if (!light) return null

  function update(updates: Partial<Omit<SceneLight, 'id'>>) {
    updateLight(light!.id, updates)
  }

  const typeLabels: Record<string, string> = {
    directional: 'Directionnelle',
    spot: 'Spot',
    point: 'Ponctuelle',
    'rect-area': 'Area',
  }

  return (
    <div>
      <CueSection target={{ kind: 'light', id: light.id }} />
      <div className="px-4 space-y-4">
        {/* En-tête : badge type + nom modifiable */}
        <div>
          <span className="inline-block px-2 py-0.5 rounded-full bg-[#27272e] text-[10px] text-[#a1a1aa] font-medium">
            {typeLabels[light.type] ?? light.type}
          </span>
          <input
            type="text"
            value={light.name}
            onChange={(e) => update({ name: e.target.value })}
            {...gesture}
            className="mt-1 w-full bg-[#1c1c21] border border-[#27272e] rounded-lg px-2 py-1 text-xs text-[#f5f5f7] focus:outline-none focus:border-cyan-400/50"
          />
        </div>

        {/* Position XYZ */}
        <div>
          <p className="text-[10px] text-[#52525b] uppercase tracking-wider mb-2 font-semibold">
            Position
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {(['x', 'y', 'z'] as const).map((axis, i) => (
              <NumInput
                key={axis}
                label={axis.toUpperCase()}
                value={light.position[i]}
                onChange={(v) => {
                  const pos = [...light.position] as [number, number, number]
                  pos[i] = v
                  update({ position: pos })
                }}
              />
            ))}
          </div>
        </div>

        {/* Target XYZ — spot uniquement */}
        {light.type === 'spot' && (
          <div>
            <p className="text-[10px] text-[#52525b] uppercase tracking-wider mb-2 font-semibold">
              Cible (Target)
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {(['x', 'y', 'z'] as const).map((axis, i) => (
                <NumInput
                  key={axis}
                  label={axis.toUpperCase()}
                  value={(light.targetPosition ?? [0, 0, 0])[i]}
                  onChange={(v) => {
                    const tgt = [...(light.targetPosition ?? [0, 0, 0])] as [number, number, number]
                    tgt[i] = v
                    update({ targetPosition: tgt })
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <Slider
          label="Intensité"
          value={light.intensity}
          min={0}
          max={10}
          step={0.05}
          onChange={(v) => update({ intensity: v })}
        />

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
            type="range"
            min={2700}
            max={10000}
            step={100}
            value={light.temperature}
            onChange={(e) => {
              const temp = parseInt(e.target.value)
              update({ temperature: temp, color: kelvinToHex(temp) })
            }}
            {...gesture}
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
          <input
            type="color"
            value={light.color}
            onChange={(e) => update({ color: e.target.value })}
            {...gesture}
            className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
          />
        </div>

        {(light.type === 'spot' || light.type === 'directional') && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={light.castShadow}
              onChange={(e) => update({ castShadow: e.target.checked })}
              className="accent-cyan-400"
            />
            <span className="text-xs text-[#a1a1aa]">Projeter ombres</span>
          </label>
        )}

        {light.type === 'spot' && (
          <>
            <Slider
              label="Angle (°)"
              value={radToDeg(light.angle)}
              min={1}
              max={90}
              step={1}
              onChange={(v) => update({ angle: degToRad(v) })}
            />
            <Slider
              label="Pénombre"
              value={light.penumbra}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => update({ penumbra: v })}
            />
          </>
        )}

        {(light.type === 'spot' || light.type === 'point') && (
          <Slider
            label="Distance"
            value={light.distance}
            min={0}
            max={50}
            step={0.5}
            onChange={(v) => update({ distance: v })}
          />
        )}

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={light.visible}
            onChange={(e) => update({ visible: e.target.checked })}
            className="accent-cyan-400"
          />
          <span className="text-xs text-[#a1a1aa]">Visible</span>
        </label>

        <button
          onClick={() => deleteLight(light.id)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors"
        >
          <Trash2 size={13} />
          Supprimer la lumière
        </button>
      </div>
    </div>
  )
}

// ─── Surface panel ────────────────────────────────────────────────────────────
function SurfacePanel() {
  const { scene, selection, updateSurface, applyMaterialToAllSurfaces } = useSceneEditor()
  if (selection?.kind !== 'surface') return null
  const key = selection.id
  const mat = scene.surfaces[key]

  function update(updates: Partial<SceneMaterial>) {
    updateSurface(key, updates)
  }

  return (
    <div className="px-4 space-y-4">
      <div>
        <p className="text-xs text-[#a1a1aa] font-medium">Surface : {SURFACE_LABELS[key]}</p>
      </div>

      <MaterialEditor material={mat} onChange={update} />

      <button
        onClick={() => applyMaterialToAllSurfaces(mat)}
        className="w-full px-3 py-2 rounded-lg text-xs font-medium text-[#71717a] bg-[#1c1c21] hover:bg-[#27272e] hover:text-[#f5f5f7] border border-[#27272e] transition-colors"
      >
        Appliquer à toutes les surfaces
      </button>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function PropertiesPanel() {
  const selectedType = useSceneEditor().selection?.kind

  return (
    <div className="flex w-64 flex-shrink-0 flex-col overflow-hidden border-l border-theme-border bg-theme-base lg:w-72">
      <div className="flex-shrink-0 border-b border-theme-border px-4 py-3">
        <h2 className="text-xs font-semibold text-content-primary">Propriétés</h2>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        {!selectedType && (
          <div className="px-4 text-center py-12">
            <p className="text-xs leading-relaxed text-content-subtle">
              Cliquez sur un objet, une lumière ou une surface pour modifier ses propriétés.
            </p>
          </div>
        )}
        {selectedType === 'object' && <ObjectPanel />}
        {selectedType === 'light' && <LightPanel />}
        {selectedType === 'surface' && <SurfacePanel />}
      </div>
    </div>
  )
}
