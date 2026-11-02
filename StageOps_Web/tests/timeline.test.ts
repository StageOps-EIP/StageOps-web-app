import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  evaluateScene,
  formatShowTime,
  nextCueNumber,
  parseShowTime,
  timelineDuration,
} from '../src/domain/timeline.ts'
import {
  createDefaultScene,
  createSceneLight,
  createSceneObject,
  type Cue,
  type Keyframe,
  type Scene,
} from '../src/domain/scene-models.ts'
import {
  createSceneEditorState,
  sceneReducer,
  type SceneAction,
  type SceneEditorState,
} from '../src/domain/scene.ts'

const cue = (id: string, time: number, number = time): Cue => ({
  id,
  number,
  time,
  label: id,
  note: '',
})
function show(cues: Cue[], keyframes: Keyframe[]): Scene {
  const kevin = { ...createSceneObject('person', 'kevin'), name: 'Kevin', visible: false }
  const spot = { ...createSceneLight('spot', 'spot'), intensity: 0, color: '#000000' }
  return {
    ...createDefaultScene(),
    objects: [kevin],
    lights: [spot],
    timeline: { cues, keyframes },
  }
}
const kevinAt = (
  cueId: string,
  x: number,
  transition: Keyframe['transition'] = { kind: 'smooth', duration: null },
): Keyframe => ({
  cueId,
  targetKind: 'object',
  targetId: 'kevin',
  transition,
  values: { position: [x, 0, 0], visible: true },
})

test('before the first cue the base set-up is shown', () => {
  const scene = show([cue('q1', 10)], [kevinAt('q1', -6, { kind: 'cut' })])
  const at = evaluateScene(scene, 5)
  assert.equal(at.objects[0].visible, false)
  assert.deepEqual(at.objects[0].position, [0, 0, 0])
})

test('a cut keeps the previous state and jumps at the cue time', () => {
  const scene = show(
    [cue('q1', 10), cue('q2', 20)],
    [kevinAt('q1', -6, { kind: 'cut' }), kevinAt('q2', 0, { kind: 'cut' })],
  )
  assert.deepEqual(evaluateScene(scene, 10).objects[0].position, [-6, 0, 0])
  assert.deepEqual(evaluateScene(scene, 19.9).objects[0].position, [-6, 0, 0])
  assert.deepEqual(evaluateScene(scene, 20).objects[0].position, [0, 0, 0])
})

test('a smooth move without duration spans the time since the previous cue', () => {
  const scene = show(
    [cue('q1', 10), cue('q2', 20)],
    [kevinAt('q1', -6, { kind: 'cut' }), kevinAt('q2', 4)],
  )
  assert.deepEqual(evaluateScene(scene, 15).objects[0].position, [-1, 0, 0])
  assert.deepEqual(evaluateScene(scene, 25).objects[0].position, [4, 0, 0])
})

test('a smooth change with a duration happens just before the cue is reached', () => {
  const scene = show(
    [cue('q1', 10), cue('q2', 20)],
    [kevinAt('q1', -6, { kind: 'cut' }), kevinAt('q2', 4, { kind: 'smooth', duration: 4 })],
  )
  assert.deepEqual(evaluateScene(scene, 15).objects[0].position, [-6, 0, 0])
  assert.deepEqual(evaluateScene(scene, 18).objects[0].position, [-1, 0, 0])
})

test('a duration longer than the gap starts at the previous cue', () => {
  const scene = show(
    [cue('q1', 10), cue('q2', 12)],
    [kevinAt('q1', 0, { kind: 'cut' }), kevinAt('q2', 10, { kind: 'smooth', duration: 30 })],
  )
  assert.deepEqual(evaluateScene(scene, 11).objects[0].position, [5, 0, 0])
})

test('an entrance is visible during its move; lights fade in intensity and colour', () => {
  const scene = show(
    [cue('q1', 10)],
    [
      kevinAt('q1', 4),
      {
        cueId: 'q1',
        targetKind: 'light',
        targetId: 'spot',
        transition: { kind: 'smooth', duration: 2 },
        values: { intensity: 8, color: '#ffffff' },
      },
    ],
  )
  const at = evaluateScene(scene, 9)
  assert.equal(at.objects[0].visible, true)
  assert.equal(at.lights[0].intensity, 4)
  assert.equal(at.lights[0].color, '#808080')
})

test('keyframes follow cue times, not their order in the list', () => {
  const scene = show(
    [cue('late', 20), cue('early', 10)],
    [kevinAt('late', 10, { kind: 'cut' }), kevinAt('early', 0, { kind: 'cut' })],
  )
  assert.deepEqual(evaluateScene(scene, 15).objects[0].position, [0, 0, 0])
  assert.deepEqual(evaluateScene(scene, 20).objects[0].position, [10, 0, 0])
})

test('cue numbers are inserted between neighbours and times are formatted as mm:ss', () => {
  const cues = [cue('a', 10, 1), cue('b', 20, 2)]
  assert.equal(nextCueNumber([], 0), 1)
  assert.equal(nextCueNumber(cues, 30), 3)
  assert.equal(nextCueNumber(cues, 15), 1.5)
  assert.equal(nextCueNumber(cues, 5), 0.5)
  assert.equal(formatShowTime(150), '02:30')
  assert.equal(parseShowTime('02:30'), 150)
  assert.equal(parseShowTime('45'), 45)
  assert.equal(parseShowTime('1:75'), null)
  assert.equal(parseShowTime('abc'), null)
  assert.equal(timelineDuration({ cues: [cue('a', 125)], keyframes: [] }), 160)
})

// ─── Editing in Conduite mode ───────────────────────────────────────────────

const run = (state: SceneEditorState, ...actions: SceneAction[]) =>
  actions.reduce(sceneReducer, state)
const editor = () => createSceneEditorState(show([], []))

test('editing at a time with no cue creates one and records only animated values', () => {
  const state = run(editor(), {
    type: 'object/updated',
    id: 'kevin',
    patch: { position: [2, 0, 1], name: 'Kevin B.' },
    at: { time: 167.04, newCueId: 'new' },
  })
  const [created] = state.scene.timeline.cues
  assert.equal(created.time, 167)
  assert.equal(created.number, 1)
  assert.deepEqual(state.scene.timeline.keyframes[0].values, { position: [2, 0, 1] })
  assert.deepEqual(state.scene.timeline.keyframes[0].transition, {
    kind: 'smooth',
    duration: null,
  })
  // The base set-up keeps its position, but non-animated values change there.
  assert.deepEqual(state.scene.objects[0].position, [0, 0, 0])
  assert.equal(state.scene.objects[0].name, 'Kevin B.')
  assert.equal(state.history.past.length, 1)
})

test('editing again at the same moment updates the cue; a drag is one undo step', () => {
  const at = { time: 30, newCueId: 'q' }
  const state = run(
    editor(),
    { type: 'gesture/started' },
    { type: 'object/updated', id: 'kevin', patch: { position: [1, 0, 0] }, at },
    {
      type: 'object/updated',
      id: 'kevin',
      patch: { position: [2, 0, 0] },
      at: { ...at, time: 30.02 },
    },
    { type: 'gesture/ended' },
  )
  assert.equal(state.scene.timeline.cues.length, 1)
  assert.equal(state.scene.timeline.keyframes.length, 1)
  assert.deepEqual(state.scene.timeline.keyframes[0].values, { position: [2, 0, 0] })
  assert.equal(state.history.past.length, 1)
  const undone = run(state, { type: 'history/undone' })
  assert.equal(undone.scene.timeline.cues.length, 0)
})

test('lights default to a cut, and transitions can be changed or removed per cue', () => {
  const state = run(editor(), {
    type: 'light/updated',
    id: 'spot',
    patch: { intensity: 6 },
    at: { time: 12, newCueId: 'q' },
  })
  const target = { kind: 'light' as const, id: 'spot' }
  assert.deepEqual(state.scene.timeline.keyframes[0].transition, { kind: 'cut' })
  const faded = run(state, {
    type: 'keyframe/transition-changed',
    cueId: 'q',
    target,
    transition: { kind: 'smooth', duration: 3 },
  })
  assert.deepEqual(faded.scene.timeline.keyframes[0].transition, { kind: 'smooth', duration: 3 })
  const removed = run(faded, { type: 'keyframe/deleted', cueId: 'q', target })
  assert.equal(removed.scene.timeline.keyframes.length, 0)
  assert.equal(removed.scene.timeline.cues.length, 1)
})

test('deleting a cue or an element removes its keyframes', () => {
  const state = run(
    editor(),
    {
      type: 'object/updated',
      id: 'kevin',
      patch: { position: [1, 0, 0] },
      at: { time: 5, newCueId: 'a' },
    },
    { type: 'light/updated', id: 'spot', patch: { intensity: 3 }, at: { time: 5, newCueId: 'b' } },
  )
  assert.equal(state.scene.timeline.keyframes.length, 2)
  const noKevin = run(state, { type: 'object/deleted', id: 'kevin' })
  assert.equal(noKevin.scene.timeline.keyframes.length, 1)
  const noCue = run(state, { type: 'cue/deleted', id: 'a' })
  assert.equal(noCue.scene.timeline.keyframes.length, 0)
  assert.equal(noCue.scene.timeline.cues.length, 0)
})

test('moving a cue in time moves its changes', () => {
  const state = run(
    editor(),
    {
      type: 'object/updated',
      id: 'kevin',
      patch: { position: [4, 0, 0] },
      at: { time: 10, newCueId: 'q' },
    },
    { type: 'cue/updated', id: 'q', patch: { time: 20.04, label: 'Kevin au centre' } },
  )
  assert.equal(state.scene.timeline.cues[0].time, 20)
  assert.deepEqual(evaluateScene(state.scene, 10).objects[0].position, [2, 0, 0])
})
