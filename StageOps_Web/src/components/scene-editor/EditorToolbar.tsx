import { useState } from 'react'
import type { RefObject } from 'react'
import { useNavigate } from 'react-router'
import {
  Boxes,
  ArrowLeft,
  Move,
  RotateCw,
  Maximize2,
  Plus,
  Undo2,
  Redo2,
  Camera,
  ChevronDown,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useSceneEditor } from '@/hooks/useSceneEditor'
import type { LightType, ObjectType, TransformMode } from '@/domain/scene-models'

interface EditorToolbarProps {
  canvasRef: RefObject<HTMLCanvasElement>
}

const OBJECT_MENU: [ObjectType, string][] = [
  ['person', 'Personne (mannequin)'],
  ['chair', 'Chaise'],
  ['table', 'Table'],
  ['box', 'Praticable (cube)'],
  ['plane', 'Décor plan'],
  ['cylinder', 'Colonne / cylindre'],
]
const LIGHT_MENU: [LightType, string][] = [
  ['directional', 'Lumière directionnelle'],
  ['spot', 'Spot'],
  ['point', 'Lumière ponctuelle'],
  ['rect-area', 'Area light'],
]

const TRANSFORM_MODES: {
  mode: TransformMode
  label: string
  shortcut: string
  Icon: LucideIcon
}[] = [
  { mode: 'translate', label: 'Déplacer', shortcut: 'G', Icon: Move },
  { mode: 'rotate', label: 'Rotation', shortcut: 'R', Icon: RotateCw },
  { mode: 'scale', label: 'Échelle', shortcut: 'S', Icon: Maximize2 },
]

export function EditorToolbar({ canvasRef }: EditorToolbarProps) {
  const navigate = useNavigate()
  const {
    scene,
    transformMode,
    canUndo,
    canRedo,
    setTransformMode,
    addObject,
    addLight,
    undo,
    redo,
    updateRendering,
  } = useSceneEditor()
  const pp = scene.rendering

  const [showAddMenu, setShowAddMenu] = useState(false)

  function handleExport() {
    const canvas = canvasRef.current
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = 'scene-export.png'
    a.click()
  }

  return (
    <div className="relative z-20 flex min-h-14 flex-shrink-0 flex-wrap items-center gap-2 border-b border-theme-border bg-theme-base px-3 py-2 xl:flex-nowrap xl:px-4">
      {/* ─ Left ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 xl:mr-auto">
        <div className="flex items-center gap-2 text-content-primary">
          <Boxes size={18} className="text-[var(--brand-violet-hover)]" />
          <span className="text-sm font-semibold">Éditeur du plateau</span>
        </div>
        <div className="w-px h-5 bg-[#27272e]" />
        <button
          onClick={() => navigate('/stage')}
          className="flex items-center gap-1.5 text-xs text-content-subtle transition-colors hover:text-content-primary"
        >
          <ArrowLeft size={13} />
          Vue Scène
        </button>
      </div>

      {/* ─ Centre ───────────────────────────────────────────────────── */}
      <div className="order-3 flex w-full items-center gap-2 overflow-x-auto pt-1 xl:order-none xl:w-auto xl:overflow-visible xl:pt-0">
        {/* Mode badge */}
        {/* Transform modes — button group */}
        <div className="flex overflow-hidden rounded-md border border-theme-border">
          {TRANSFORM_MODES.map(({ mode, label, shortcut, Icon }, i) => (
            <button
              key={mode}
              title={`${label} (${shortcut})`}
              onClick={() => setTransformMode(mode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                transformMode === mode
                  ? 'bg-[var(--brand-violet)] text-[#080a10]'
                  : 'bg-theme-elevated text-content-muted hover:bg-[var(--bg-hover)] hover:text-content-primary'
              } ${i > 0 ? 'border-l border-theme-border' : ''}`}
            >
              <Icon size={13} />
              {shortcut}
            </button>
          ))}
        </div>

        <div className="h-6 w-px bg-theme-border" />

        {/* Add menu */}
        <div className="relative">
          <button
            onClick={() => setShowAddMenu((v) => !v)}
            className="flex items-center gap-1.5 rounded-md border border-theme-border bg-theme-elevated px-3 py-1.5 text-xs font-medium text-content-muted hover:text-content-primary"
          >
            <Plus size={13} />
            Ajouter
            <ChevronDown size={11} />
          </button>

          {showAddMenu && (
            <div
              className="absolute left-0 top-10 z-50 w-52 overflow-hidden rounded-md border border-theme-border bg-theme-elevated py-1 shadow-2xl"
              onMouseLeave={() => setShowAddMenu(false)}
            >
              <p className="px-3 py-1.5 text-xs font-semibold text-content-subtle">Objets</p>
              {OBJECT_MENU.map(([type, label]) => (
                <button
                  key={type}
                  onClick={() => {
                    addObject(type)
                    setShowAddMenu(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-content-muted hover:bg-[var(--bg-hover)] hover:text-content-primary"
                >
                  {label}
                </button>
              ))}

              <div className="my-1 h-px bg-theme-border" />
              <p className="px-3 py-1.5 text-xs font-semibold text-content-subtle">Lumières</p>
              {LIGHT_MENU.map(([type, label]) => (
                <button
                  key={type}
                  onClick={() => {
                    addLight(type)
                    setShowAddMenu(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-content-muted hover:bg-[var(--bg-hover)] hover:text-content-primary"
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-theme-border" />

        {/* Undo / Redo */}
        <div className="flex items-center gap-1">
          <button
            disabled={!canUndo}
            onClick={undo}
            title="Annuler (Ctrl+Z)"
            className="flex h-8 w-8 items-center justify-center rounded-md text-content-subtle hover:bg-theme-elevated hover:text-content-primary disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Undo2 size={14} />
          </button>
          <button
            disabled={!canRedo}
            onClick={redo}
            title="Rétablir (Ctrl+Y)"
            className="flex h-8 w-8 items-center justify-center rounded-md text-content-subtle hover:bg-theme-elevated hover:text-content-primary disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Redo2 size={14} />
          </button>
        </div>
      </div>

      {/* ─ Right ────────────────────────────────────────────────────── */}
      <div className="ml-auto flex items-center gap-2">
        {/* HD Quality toggle */}
        <button
          type="button"
          aria-pressed={pp.highQuality}
          onClick={() => updateRendering({ highQuality: !pp.highQuality })}
          className="flex items-center gap-2"
        >
          <span className="hidden text-xs text-content-subtle md:inline">Qualité HD</span>
          <span
            className={`relative h-4 w-8 cursor-pointer rounded-full transition-colors ${pp.highQuality ? 'bg-[var(--brand-violet)]' : 'bg-theme-border'}`}
          >
            <span
              className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${pp.highQuality ? 'translate-x-4' : 'translate-x-0.5'}`}
            />
          </span>
        </button>

        {/* Bloom toggle */}
        <button
          type="button"
          aria-pressed={pp.bloom}
          onClick={() => updateRendering({ bloom: !pp.bloom })}
          className="flex items-center gap-2"
        >
          <span className="hidden text-xs text-content-subtle md:inline">Bloom</span>
          <span
            className={`relative h-4 w-8 cursor-pointer rounded-full transition-colors ${pp.bloom ? 'bg-[var(--brand-violet)]' : 'bg-theme-border'}`}
          >
            <span
              className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${pp.bloom ? 'translate-x-4' : 'translate-x-0.5'}`}
            />
          </span>
        </button>

        {/* Vignette toggle */}
        <button
          type="button"
          aria-pressed={pp.vignette}
          onClick={() => updateRendering({ vignette: !pp.vignette })}
          className="flex items-center gap-2"
        >
          <span className="hidden text-xs text-content-subtle md:inline">Vignette</span>
          <span
            className={`relative h-4 w-8 cursor-pointer rounded-full transition-colors ${pp.vignette ? 'bg-[var(--brand-violet)]' : 'bg-theme-border'}`}
          >
            <span
              className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${pp.vignette ? 'translate-x-4' : 'translate-x-0.5'}`}
            />
          </span>
        </button>

        <div className="h-6 w-px bg-theme-border" />

        {/* Export */}
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-content-muted hover:bg-theme-elevated hover:text-content-primary"
        >
          <Camera size={13} />
          <span className="hidden sm:inline">Export PNG</span>
        </button>

        {/* Close */}
        <button
          onClick={() => navigate('/stage')}
          className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-content-subtle hover:bg-red-500/10 hover:text-red-400"
        >
          <X size={13} />
          <span className="hidden sm:inline">Fermer</span>
        </button>
      </div>
    </div>
  )
}
