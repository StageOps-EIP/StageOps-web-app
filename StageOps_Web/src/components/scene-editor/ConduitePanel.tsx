import { useEffect, useMemo, useState } from 'react'
import { Pause, Play, Plus, SkipBack, SkipForward, Trash2 } from 'lucide-react'
import { useSceneEditor } from '@/hooks/useSceneEditor'
import { usePlayback } from '@/hooks/usePlayback'
import type { Cue } from '@/domain/scene-models'
import { currentCue, formatShowTime, parseShowTime, sortCues } from '@/domain/timeline'

/** Advances the playhead with the real elapsed time while playing. */
function usePlaybackLoop(playing: boolean, advance: (seconds: number) => void) {
  useEffect(() => {
    if (!playing) return
    let frame = 0
    let last = performance.now()
    const tick = (now: number) => {
      advance((now - last) / 1000)
      last = now
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [playing, advance])
}

const inputClass =
  'w-full rounded border border-transparent bg-transparent px-1.5 py-1 text-xs text-content-primary hover:border-theme-border focus:border-[var(--brand-violet)] focus:outline-none'

function CueTimeInput({ cue }: { cue: Cue }) {
  const { updateCue } = useSceneEditor()
  const [draft, setDraft] = useState<string | null>(null)
  function commit() {
    if (draft === null) return
    const time = parseShowTime(draft)
    if (time !== null) updateCue(cue.id, { time })
    setDraft(null)
  }
  return (
    <input
      aria-label={`Minute du cue ${cue.number}`}
      value={draft ?? formatShowTime(cue.time)}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit()
        if (e.key === 'Escape') setDraft(null)
      }}
      className={`${inputClass} font-mono`}
    />
  )
}

function CueRow({ cue, active }: { cue: Cue; active: boolean }) {
  const { updateCue, deleteCue, goToCue, beginGesture, endGesture } = useSceneEditor()
  const gesture = { onFocus: beginGesture, onBlur: endGesture }
  return (
    <li
      className={`grid grid-cols-[3.5rem_4rem_1fr_1.75rem] items-center gap-1 border-l-2 px-2 py-0.5 ${
        active ? 'border-[var(--brand-violet)] bg-[var(--brand-soft)]' : 'border-transparent'
      }`}
    >
      <input
        type="number"
        step={0.5}
        min={0}
        aria-label="Numéro du cue"
        value={cue.number}
        onChange={(e) => {
          const number = parseFloat(e.target.value)
          if (Number.isFinite(number)) updateCue(cue.id, { number })
        }}
        {...gesture}
        className={`${inputClass} font-mono`}
      />
      <CueTimeInput cue={cue} />
      <div className="flex min-w-0 items-center gap-1">
        <button
          type="button"
          onClick={() => goToCue(cue.id)}
          aria-label={`Aller au cue ${cue.number}`}
          className="flex-shrink-0 rounded px-1 text-[10px] font-semibold text-[var(--brand-violet-hover)] hover:bg-[var(--brand-soft)]"
        >
          Q{cue.number}
        </button>
        <input
          aria-label={`Libellé du cue ${cue.number}`}
          value={cue.label}
          onChange={(e) => updateCue(cue.id, { label: e.target.value })}
          {...gesture}
          className={inputClass}
        />
      </div>
      <button
        type="button"
        onClick={() => deleteCue(cue.id)}
        aria-label={`Supprimer le cue ${cue.number}`}
        className="flex h-6 w-6 items-center justify-center rounded text-content-subtle hover:bg-red-500/15 hover:text-red-400"
      >
        <Trash2 size={11} />
      </button>
    </li>
  )
}

export function ConduitePanel() {
  const { scene, play, pause, seek, advance, nextCue, previousCue, addCueHere, goToCue, select } =
    useSceneEditor()
  const { time, playing, duration } = usePlayback()
  usePlaybackLoop(playing, advance)

  const cues = useMemo(() => sortCues(scene.timeline.cues), [scene.timeline.cues])
  const active = currentCue(scene.timeline, time)
  const percent = (seconds: number) => `${(seconds / duration) * 100}%`

  // One track per element that changes in the cue sheet.
  const tracks = useMemo(() => {
    const cueById = new Map(scene.timeline.cues.map((cue) => [cue.id, cue]))
    const names = new Map<string, string>([
      ...scene.objects.map((item): [string, string] => [`object:${item.id}`, item.name]),
      ...scene.lights.map((item): [string, string] => [`light:${item.id}`, item.name]),
    ])
    const byTarget = new Map<string, Cue[]>()
    for (const frame of scene.timeline.keyframes) {
      const key = `${frame.targetKind}:${frame.targetId}`
      const cue = cueById.get(frame.cueId)
      if (cue) byTarget.set(key, [...(byTarget.get(key) ?? []), cue])
    }
    return [...byTarget.entries()].map(([key, items]) => {
      const [kind, id] = key.split(':') as ['object' | 'light', string]
      return { key, kind, id, name: names.get(key) ?? id, cues: items }
    })
  }, [scene.timeline, scene.objects, scene.lights])

  return (
    <section
      aria-label="Conduite"
      className="flex h-56 flex-shrink-0 border-t border-theme-border bg-theme-base"
    >
      {/* Cue sheet */}
      <div className="flex w-[22rem] flex-shrink-0 flex-col border-r border-theme-border">
        <div className="flex items-center justify-between border-b border-theme-border px-3 py-2">
          <h2 className="text-xs font-semibold text-content-primary">Conduite</h2>
          <button
            type="button"
            onClick={() => goToCue(addCueHere())}
            className="flex items-center gap-1 rounded px-2 py-1 text-[11px] text-content-muted hover:bg-theme-elevated hover:text-content-primary"
          >
            <Plus size={11} /> Cue à {formatShowTime(time)}
          </button>
        </div>
        <div className="grid grid-cols-[3.5rem_4rem_1fr_1.75rem] gap-1 px-2 pt-1 text-[10px] uppercase tracking-wide text-content-subtle">
          <span className="pl-2">N°</span>
          <span className="pl-1.5">Minute</span>
          <span className="pl-1.5">Ce qui se passe</span>
        </div>
        <ul className="flex-1 overflow-y-auto pb-2">
          {cues.length === 0 && (
            <li className="px-4 py-3 text-[11px] leading-relaxed text-content-subtle">
              Placez le curseur à une minute de la pièce puis déplacez une personne ou réglez un
              projecteur : le cue est créé automatiquement.
            </li>
          )}
          {cues.map((cue) => (
            <CueRow key={cue.id} cue={cue} active={cue.id === active?.id} />
          ))}
        </ul>
      </div>

      {/* Transport and timeline */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2 border-b border-theme-border px-3 py-1.5">
          <button
            type="button"
            onClick={previousCue}
            aria-label="Cue précédent"
            className="flex h-8 w-8 items-center justify-center rounded text-content-muted hover:bg-theme-elevated hover:text-content-primary"
          >
            <SkipBack size={14} />
          </button>
          <button
            type="button"
            onClick={playing ? pause : play}
            aria-label={playing ? 'Pause' : 'Lecture'}
            className="flex h-8 w-8 items-center justify-center rounded bg-[var(--brand-violet)] text-[#080a10]"
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button
            type="button"
            onClick={nextCue}
            aria-label="Cue suivant"
            className="flex h-8 w-8 items-center justify-center rounded text-content-muted hover:bg-theme-elevated hover:text-content-primary"
          >
            <SkipForward size={14} />
          </button>
          <span className="ml-2 font-mono text-sm text-content-primary" aria-live="off">
            {formatShowTime(time)}
          </span>
          <span className="font-mono text-xs text-content-subtle">
            / {formatShowTime(duration)}
          </span>
          <span className="ml-3 truncate text-xs text-content-muted">
            {active ? `Q${active.number} · ${active.label}` : 'Avant le premier cue (Décor)'}
          </span>
          <span className="ml-auto hidden text-[10px] text-content-subtle lg:inline">
            Espace : lecture/pause · en pause, toute modification est enregistrée dans le cue
          </span>
        </div>

        <div className="relative min-h-0 flex-1 overflow-y-auto px-3 py-2">
          <div className="pl-28">
            <input
              type="range"
              min={0}
              max={duration}
              step={0.1}
              value={time}
              onChange={(e) => seek(parseFloat(e.target.value))}
              aria-label="Position dans la conduite"
              aria-valuetext={formatShowTime(time)}
              className="w-full accent-[var(--brand-violet)]"
            />
          </div>
          <div className="relative mt-1 ml-28 h-5 text-[10px] text-content-subtle">
            {cues.map((cue) => (
              <button
                key={cue.id}
                type="button"
                onClick={() => goToCue(cue.id)}
                style={{ left: percent(cue.time) }}
                className="absolute -translate-x-1/2 rounded px-1 font-mono hover:text-content-primary"
              >
                Q{cue.number}
              </button>
            ))}
          </div>
          <ul className="relative mt-1 space-y-1">
            <span
              aria-hidden
              className="pointer-events-none absolute -top-6 bottom-0 z-10 w-px bg-[var(--brand-violet-hover)]"
              style={{ left: `calc(7rem + (100% - 7rem) * ${time / duration})` }}
            />
            {tracks.map((track) => (
              <li key={track.key} className="flex h-6 items-center">
                <button
                  type="button"
                  onClick={() => select({ kind: track.kind, id: track.id })}
                  className="w-28 flex-shrink-0 truncate pr-2 text-left text-[11px] text-content-muted hover:text-content-primary"
                >
                  {track.name}
                </button>
                <div className="relative h-full flex-1 border-b border-theme-border/60">
                  {track.cues.map((cue) => (
                    <button
                      key={cue.id}
                      type="button"
                      onClick={() => goToCue(cue.id)}
                      aria-label={`${track.name} au cue ${cue.number}`}
                      style={{ left: percent(cue.time) }}
                      className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[var(--brand-violet-hover)]"
                    />
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
