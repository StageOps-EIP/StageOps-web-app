import { useState, useEffect, useRef } from 'react'
import {
  Box,
  Layers,
  Circle,
  Sun,
  Zap,
  Square,
  ChevronDown,
  ChevronRight,
  Plus,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
} from 'lucide-react'
import { useSceneEditor } from '@/hooks/useSceneEditor'
import { SURFACE_KEYS, kelvinToHex, type SceneLight, type SceneObject } from '@/domain/scene-models'
import { SURFACE_LABELS } from './scene-editor.labels'

function ObjectIcon({ type }: { type: SceneObject['type'] }) {
  if (type === 'plane') return <Layers size={13} />
  if (type === 'cylinder') return <Circle size={13} />
  return <Box size={13} />
}

function LightIcon({ type }: { type: SceneLight['type'] }) {
  if (type === 'directional') return <Sun size={13} />
  if (type === 'spot') return <Zap size={13} />
  if (type === 'rect-area') return <Square size={13} />
  return <Circle size={13} />
}

function ScrollItem({ active, children }: { active: boolean; children: React.ReactNode }) {
  const ref = useRef<HTMLLIElement>(null)
  useEffect(() => {
    if (active && ref.current) {
      ref.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [active])
  return <li ref={ref}>{children}</li>
}

export function SceneTreePanel() {
  const {
    scene,
    selection,
    select,
    addObject,
    updateObject,
    deleteObject,
    addLight,
    updateLight,
    deleteLight,
  } = useSceneEditor()
  const { objects, lights, surfaces } = scene

  const [objectsOpen, setObjectsOpen] = useState(true)
  const [lightsOpen, setLightsOpen] = useState(true)

  return (
    <div className="flex w-56 flex-shrink-0 flex-col overflow-hidden border-r border-theme-border bg-theme-base lg:w-64">
      {/* Header */}
      <div className="border-b border-theme-border px-4 py-3">
        <h2 className="text-xs font-semibold text-content-primary">Structure de la scène</h2>
        <p className="mt-0.5 text-[10px] text-content-subtle">
          {objects.length} objet{objects.length !== 1 ? 's' : ''} · {lights.length} lumières
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* ─ Objects section ────────────────────────────────────────── */}
        <div className="border-b border-[#27272e]/60">
          <div className="flex items-center px-2">
            <button
              className="flex flex-1 items-center gap-1.5 px-2 py-2.5 text-left text-xs font-semibold text-content-muted transition-colors hover:text-content-primary"
              onClick={() => setObjectsOpen((v) => !v)}
              aria-expanded={objectsOpen}
            >
              {objectsOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
              Objets
            </button>
            <button
              onClick={() => addObject('box')}
              aria-label="Ajouter un objet"
              className="flex h-7 w-7 items-center justify-center rounded-md text-content-subtle transition-colors hover:bg-[var(--brand-soft)] hover:text-[var(--brand-violet-hover)]"
            >
              <Plus size={13} />
            </button>
          </div>

          {objectsOpen && (
            <ul className="pb-1">
              {objects.length === 0 && (
                <li className="px-4 py-3 text-[11px] text-[#52525b] italic">
                  Aucun objet — cliquez + pour ajouter
                </li>
              )}
              {objects.map((obj) => {
                const active = selection?.kind === 'object' && selection.id === obj.id
                return (
                  <ScrollItem key={obj.id} active={active}>
                    <div
                      className={`group flex w-full items-center border-l-2 pr-2 text-xs transition-colors ${
                        active
                          ? 'border-[var(--brand-blue)] bg-[var(--brand-soft)] text-content-primary'
                          : 'border-transparent text-content-muted hover:bg-theme-elevated hover:text-content-primary'
                      }`}
                    >
                      <button
                        onClick={() => select({ kind: 'object', id: obj.id })}
                        className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2 text-left"
                      >
                        <span className="text-content-subtle">
                          <ObjectIcon type={obj.type} />
                        </span>
                        <span className="truncate">{obj.name}</span>
                      </button>
                      <span className="flex items-center gap-0.5 opacity-60 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                        <button
                          type="button"
                          aria-label={obj.visible ? `Masquer ${obj.name}` : `Afficher ${obj.name}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            updateObject(obj.id, { visible: !obj.visible })
                          }}
                          className="flex h-6 w-6 items-center justify-center rounded-md text-content-subtle hover:bg-theme-raised hover:text-content-primary"
                        >
                          {obj.visible ? <Eye size={10} /> : <EyeOff size={10} />}
                        </button>
                        <button
                          type="button"
                          aria-label={
                            obj.locked ? `Déverrouiller ${obj.name}` : `Verrouiller ${obj.name}`
                          }
                          onClick={(e) => {
                            e.stopPropagation()
                            updateObject(obj.id, { locked: !obj.locked })
                          }}
                          className="flex h-6 w-6 items-center justify-center rounded-md text-content-subtle hover:bg-theme-raised hover:text-content-primary"
                        >
                          {obj.locked ? <Lock size={10} /> : <Unlock size={10} />}
                        </button>
                        <button
                          type="button"
                          aria-label={`Supprimer ${obj.name}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteObject(obj.id)
                          }}
                          className="flex h-6 w-6 items-center justify-center rounded-md text-content-subtle hover:bg-red-500/20 hover:text-red-400"
                        >
                          <Trash2 size={10} />
                        </button>
                      </span>
                    </div>
                  </ScrollItem>
                )
              })}
            </ul>
          )}
        </div>

        {/* ─ Lights section ─────────────────────────────────────────── */}
        <div className="border-b border-[#27272e]/60">
          <div className="flex items-center px-2">
            <button
              className="flex flex-1 items-center gap-1.5 px-2 py-2.5 text-left text-xs font-semibold text-content-muted transition-colors hover:text-content-primary"
              onClick={() => setLightsOpen((v) => !v)}
              aria-expanded={lightsOpen}
            >
              {lightsOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
              Lumières
            </button>
            <button
              onClick={() => addLight('spot')}
              aria-label="Ajouter une lumière"
              className="flex h-7 w-7 items-center justify-center rounded-md text-content-subtle transition-colors hover:bg-[var(--brand-soft)] hover:text-[var(--brand-violet-hover)]"
            >
              <Plus size={13} />
            </button>
          </div>

          {lightsOpen && (
            <ul className="pb-1">
              {lights.map((light) => {
                const active = selection?.kind === 'light' && selection.id === light.id
                const dotColor = kelvinToHex(light.temperature)
                return (
                  <ScrollItem key={light.id} active={active}>
                    <div
                      className={`group flex w-full items-center border-l-2 pr-2 text-xs transition-colors ${
                        active
                          ? 'border-[var(--brand-blue)] bg-[var(--brand-soft)] text-content-primary'
                          : 'border-transparent text-content-muted hover:bg-theme-elevated hover:text-content-primary'
                      }`}
                    >
                      <button
                        onClick={() => select({ kind: 'light', id: light.id })}
                        className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2 text-left"
                      >
                        <span
                          className="h-2 w-2 flex-shrink-0 rounded-full"
                          style={{ backgroundColor: dotColor }}
                        />
                        <span className="text-content-subtle">
                          <LightIcon type={light.type} />
                        </span>
                        <span className="truncate">{light.name}</span>
                      </button>
                      <span className="flex items-center gap-0.5 opacity-60 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                        <button
                          type="button"
                          aria-label={
                            light.visible ? `Masquer ${light.name}` : `Afficher ${light.name}`
                          }
                          onClick={(e) => {
                            e.stopPropagation()
                            updateLight(light.id, { visible: !light.visible })
                          }}
                          className="flex h-6 w-6 items-center justify-center rounded-md text-content-subtle hover:bg-theme-raised hover:text-content-primary"
                        >
                          {light.visible ? <Eye size={10} /> : <EyeOff size={10} />}
                        </button>
                        <button
                          type="button"
                          aria-label={`Supprimer ${light.name}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteLight(light.id)
                          }}
                          className="flex h-6 w-6 items-center justify-center rounded-md text-content-subtle hover:bg-red-500/20 hover:text-red-400"
                        >
                          <Trash2 size={10} />
                        </button>
                      </span>
                    </div>
                  </ScrollItem>
                )
              })}
            </ul>
          )}
        </div>

        {/* ─ Surfaces section ───────────────────────────────────────── */}
        <div>
          <div className="px-4 py-2.5 text-xs font-semibold text-content-muted">Surfaces</div>
          <ul className="pb-2">
            {SURFACE_KEYS.map((key) => {
              const isActive = selection?.kind === 'surface' && selection.id === key
              const mat = surfaces[key]
              return (
                <li key={key}>
                  <button
                    onClick={() => select({ kind: 'surface', id: key })}
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
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}
