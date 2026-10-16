import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createSceneStore } from '../src/application/scene-store.ts'
import { createDefaultScene, type Scene } from '../src/domain/scene-models.ts'
import type { SceneRepository } from '../src/domain/scene-repository.ts'

function ids() {
  let next = 0
  return (kind: 'obj' | 'light') => `${kind}-${++next}`
}
function repository(status: 'ready' | 'invalid' = 'ready', ok = true) {
  const saved: Scene[] = []
  const port: SceneRepository = {
    load: () => ({ status, scene: createDefaultScene() }),
    save: (scene) => {
      saved.push(scene)
      return ok ? { ok: true } : { ok: false }
    },
  }
  return { port, saved }
}

test('commands publish a stable snapshot and persist only scene changes', () => {
  const { port, saved } = repository()
  const store = createSceneStore(port, ids())
  let calls = 0
  const unsubscribe = store.subscribe(() => calls++)
  store.commands.addObject('box')
  assert.equal(calls, 1)
  assert.equal(saved.length, 1)
  assert.equal(store.getSnapshot().scene.objects[0].id, 'obj-1')
  assert.equal(store.getSnapshot(), store.getSnapshot())
  assert.equal(store.getSnapshot().canUndo, true)

  store.commands.select({ kind: 'object', id: 'obj-1' })
  store.commands.setTransformMode('scale')
  store.commands.beginGesture()
  store.commands.endGesture()
  assert.equal(saved.length, 1, 'session state is not saved')

  store.commands.updateRendering({ vignette: false })
  assert.equal(saved.length, 2, 'display preferences are saved')
  unsubscribe()
  store.commands.undo()
  assert.equal(calls, 6)
  assert.equal(store.getSnapshot().scene.objects.length, 0)
  assert.equal(store.getSnapshot().canRedo, true)
})

test('a gizmo drag is one undo step through the store', () => {
  const { port } = repository()
  const store = createSceneStore(port, ids())
  store.commands.addLight('spot')
  store.commands.beginGesture()
  for (let y = 1; y <= 30; y++) store.commands.updateLight('light-1', { position: [0, y, 0] })
  store.commands.endGesture()
  store.commands.undo()
  assert.deepEqual(store.getSnapshot().scene.lights.at(-1)?.position, [0, 8, 0])
  store.commands.redo()
  assert.deepEqual(store.getSnapshot().scene.lights.at(-1)?.position, [0, 30, 0])
})

test('failed saves keep changes in memory and expose a warning', () => {
  const { port } = repository('ready', false)
  const store = createSceneStore(port, ids())
  store.commands.addObject('plane')
  assert.equal(store.getSnapshot().scene.objects.length, 1)
  assert.match(store.getSnapshot().persistenceIssue ?? '', /exportez/)
})

test('an invalid stored scene is never overwritten', () => {
  const { port, saved } = repository('invalid')
  const store = createSceneStore(port, ids())
  store.commands.addObject('box')
  assert.equal(saved.length, 0)
  assert.match(store.getSnapshot().persistenceIssue ?? '', /conservée/)
})
