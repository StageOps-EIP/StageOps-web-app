import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  createSceneEditorState,
  HISTORY_LIMIT,
  sceneReducer,
  type SceneAction,
  type SceneEditorState,
} from '../src/domain/scene.ts'
import {
  applyPreset,
  createDefaultScene,
  createSceneLight,
  createSceneObject,
} from '../src/domain/scene-models.ts'

const initial = () => createSceneEditorState(createDefaultScene())
const run = (state: SceneEditorState, ...actions: SceneAction[]) =>
  actions.reduce(sceneReducer, state)
const addBox = (id = 'box'): SceneAction => ({
  type: 'object/added',
  object: createSceneObject('box', id),
})
const move = (x: number, id = 'box'): SceneAction => ({
  type: 'object/updated',
  id,
  patch: { position: [x, 0.5, 0] },
})

test('each change outside a gesture is one undo step and redo restores the undone change', () => {
  const edited = run(initial(), addBox(), move(3))
  assert.equal(edited.history.past.length, 2)
  const undone = run(edited, { type: 'history/undone' })
  assert.deepEqual(undone.scene.objects[0].position, [0, 0.5, 0])
  const redone = run(undone, { type: 'history/redone' })
  assert.deepEqual(redone.scene.objects[0].position, [3, 0.5, 0])
  assert.equal(redone.history.future.length, 0)
})

test('a gesture records a single undo step whatever the number of updates', () => {
  const added = run(initial(), addBox())
  const dragged = run(added, { type: 'gesture/started' }, move(1), move(2), move(3), {
    type: 'gesture/ended',
  })
  assert.equal(dragged.history.past.length, 2)
  assert.deepEqual(dragged.scene.objects[0].position, [3, 0.5, 0])
  const undone = run(dragged, { type: 'history/undone' })
  assert.deepEqual(undone.scene.objects[0].position, [0, 0.5, 0])
})

test('a new gesture starts a new step even if the previous one was not closed', () => {
  const state = run(
    initial(),
    addBox(),
    { type: 'gesture/started' },
    move(1),
    { type: 'gesture/started' },
    move(2),
  )
  assert.equal(state.history.past.length, 3)
})

test('no-op updates, unknown ids and empty stacks leave the state untouched', () => {
  const added = run(initial(), addBox())
  assert.equal(run(added, move(0)), added)
  assert.equal(run(added, move(5, 'missing')), added)
  assert.equal(run(added, addBox()), added)
  assert.equal(run(initial(), { type: 'history/redone' }).history.future.length, 0)
  const fresh = initial()
  assert.equal(run(fresh, { type: 'history/undone' }), fresh)
})

test('a new change after undo discards the redo stack', () => {
  const state = run(initial(), addBox(), move(3), { type: 'history/undone' }, move(7))
  assert.equal(state.history.future.length, 0)
  assert.equal(run(state, { type: 'history/redone' }), state)
})

test('history is capped', () => {
  let state = run(initial(), addBox())
  for (let i = 1; i <= HISTORY_LIMIT + 10; i++) state = run(state, move(i))
  assert.equal(state.history.past.length, HISTORY_LIMIT)
})

test('selection follows the content: deletion and undo never keep a missing item selected', () => {
  const selected = run(initial(), addBox(), {
    type: 'selection/changed',
    selection: { kind: 'object', id: 'box' },
  })
  const deleted = run(selected, { type: 'object/deleted', id: 'box' })
  assert.equal(deleted.selection, null)
  const reselected = run(selected, move(2))
  const undone = run(reselected, { type: 'history/undone' }, { type: 'history/undone' })
  assert.equal(undone.scene.objects.length, 0)
  assert.equal(undone.selection, null)
  assert.equal(
    run(initial(), { type: 'selection/changed', selection: { kind: 'object', id: 'nope' } })
      .selection,
    null,
  )
})

test('selection, tool mode and display preferences are not undoable', () => {
  const state = run(
    initial(),
    { type: 'selection/changed', selection: { kind: 'surface', id: 'floor' } },
    { type: 'transform-mode/changed', mode: 'rotate' },
    { type: 'rendering/updated', patch: { bloom: false } },
  )
  assert.equal(state.history.past.length, 0)
  assert.equal(state.scene.rendering.bloom, false)
})

test('duplication copies deeply, offsets the copy and selects it', () => {
  const state = run(initial(), addBox(), { type: 'object/duplicated', id: 'box', copyId: 'copy' })
  const [original, copy] = state.scene.objects
  assert.equal(copy.name, 'Praticable (copie)')
  assert.deepEqual(copy.position, [1, 0.5, 1])
  assert.notEqual(copy.material, original.material)
  assert.deepEqual(state.selection, { kind: 'object', id: 'copy' })
})

test('applying a material to every surface is a single undo step', () => {
  const steel = applyPreset('acier')
  const state = run(initial(), { type: 'surfaces/material-applied', material: steel })
  assert.equal(state.history.past.length, 1)
  assert.deepEqual(state.scene.surfaces.ceiling, steel)
  assert.notEqual(state.scene.surfaces.floor, state.scene.surfaces.ceiling)
  assert.equal(run(state, { type: 'surfaces/material-applied', material: steel }), state)
})

test('lights can be added, edited and removed immutably', () => {
  const before = initial()
  const state = run(
    before,
    { type: 'light/added', light: createSceneLight('point', 'p') },
    { type: 'light/updated', id: 'p', patch: { intensity: 5 } },
  )
  assert.equal(state.scene.lights.at(-1)?.intensity, 5)
  assert.equal(before.scene.lights.length, 3)
  const removed = run(state, { type: 'light/deleted', id: 'p' })
  assert.equal(removed.scene.lights.length, 3)
})

test('people and furniture stand on the floor with simple untextured defaults', () => {
  const kevin = createSceneObject('person', 'kevin')
  assert.equal(kevin.posture, 'standing')
  assert.deepEqual(kevin.position, [0, 0, 0])
  assert.equal(kevin.material.preset, 'custom')
  const chair = createSceneObject('chair', 'chair')
  assert.equal(chair.posture, undefined)
  assert.deepEqual(chair.position, [0, 0, 0])
  const state = run(
    initial(),
    { type: 'object/added', object: kevin },
    { type: 'object/updated', id: 'kevin', patch: { posture: 'sitting', name: 'Kevin' } },
  )
  assert.equal(state.scene.objects[0].posture, 'sitting')
  assert.equal(state.scene.objects[0].name, 'Kevin')
})
