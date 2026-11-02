import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  createLocalSceneRepository,
  deserializeScene,
  LEGACY_SCENE_STORAGE_KEY,
  SCENE_STORAGE_KEY,
  serializeScene,
} from '../src/infrastructure/scene/local-scene.repository.ts'
import { createDefaultScene, createSceneObject } from '../src/domain/scene-models.ts'

function scene() {
  return { ...createDefaultScene(), objects: [createSceneObject('box', 'obj-1')] }
}
function storage() {
  const data = new Map<string, string>()
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value)
    },
    removeItem: (key: string) => {
      data.delete(key)
    },
  }
}
/** Shape written by the editor before the refactoring: the whole React state. */
function legacyPayload() {
  const { rendering, ...content } = scene()
  return JSON.stringify({
    ...content,
    postProcessing: rendering,
    selectedId: 'obj-1',
    selectedType: 'object',
    selectedSurface: null,
    transformMode: 'rotate',
    history: [],
    historyIndex: -1,
  })
}

test('round-trip preserves the scene', () => {
  assert.deepEqual(deserializeScene(serializeScene(scene())), scene())
})

test('the legacy editor state is migrated and its key removed after a successful save', () => {
  const store = storage()
  store.data.set(LEGACY_SCENE_STORAGE_KEY, legacyPayload())
  const repository = createLocalSceneRepository(() => store, createDefaultScene)
  const loaded = repository.load()
  assert.equal(loaded.status, 'ready')
  assert.deepEqual(loaded.scene, scene())
  assert.ok(store.data.has(LEGACY_SCENE_STORAGE_KEY))
  assert.equal(repository.save(loaded.scene).ok, true)
  assert.ok(store.data.has(SCENE_STORAGE_KEY))
  assert.equal(store.data.has(LEGACY_SCENE_STORAGE_KEY), false)
  assert.equal(JSON.parse(store.data.get(SCENE_STORAGE_KEY)!).selectedId, undefined)
})

test('a legacy save without display preferences gets the defaults', () => {
  const { rendering, ...content } = scene()
  assert.deepEqual(deserializeScene(JSON.stringify(content)).rendering, rendering)
})

test('corrupt data is reported and never overwritten', () => {
  const valid = JSON.parse(serializeScene(scene()))
  for (const raw of [
    '{bad json',
    JSON.stringify({ ...valid, version: 2 }),
    JSON.stringify({ ...valid, objects: [{ ...valid.objects[0], position: [0, 'x', 0] }] }),
    JSON.stringify({ ...valid, objects: [{ ...valid.objects[0], type: 'piano' }] }),
    JSON.stringify({ ...valid, lights: [valid.lights[0], valid.lights[0]] }),
    JSON.stringify({ ...valid, surfaces: { ...valid.surfaces, floor: undefined } }),
    JSON.stringify({ ...valid, lights: [{ ...valid.lights[0], color: 'red' }] }),
  ]) {
    const store = storage()
    store.data.set(SCENE_STORAGE_KEY, raw)
    const repository = createLocalSceneRepository(() => store, createDefaultScene)
    assert.equal(repository.load().status, 'invalid', raw)
    assert.equal(repository.save(scene()).ok, false)
    assert.equal(store.getItem(SCENE_STORAGE_KEY), raw)
  }
})

test('unavailable storage and quota errors are recoverable', () => {
  const denied = createLocalSceneRepository(() => {
    throw new Error('Denied')
  }, createDefaultScene)
  assert.equal(denied.load().status, 'unavailable')
  assert.equal(denied.save(scene()).ok, false)
  const store = storage()
  store.data.set(LEGACY_SCENE_STORAGE_KEY, legacyPayload())
  store.setItem = () => {
    throw new Error('Quota')
  }
  const full = createLocalSceneRepository(() => store, createDefaultScene)
  assert.equal(full.save(scene()).ok, false)
  assert.ok(store.data.has(LEGACY_SCENE_STORAGE_KEY))
})

test('people keep their posture and an unknown posture is rejected', () => {
  const withPerson = {
    ...scene(),
    objects: [{ ...createSceneObject('person', 'kevin'), posture: 'lying' as const }],
  }
  assert.deepEqual(deserializeScene(serializeScene(withPerson)), withPerson)
  const raw = JSON.parse(serializeScene(withPerson))
  raw.objects[0].posture = 'flying'
  assert.throws(() => deserializeScene(JSON.stringify(raw)))
})

test('the cue sheet round-trips and broken references are rejected', () => {
  const withShow = {
    ...scene(),
    timeline: {
      cues: [{ id: 'q1', number: 1, time: 150, label: 'Kevin entre', note: 'jardin' }],
      keyframes: [
        {
          cueId: 'q1',
          targetKind: 'object' as const,
          targetId: 'obj-1',
          transition: { kind: 'smooth' as const, duration: null },
          values: { position: [1, 0, 2] as [number, number, number], visible: true },
        },
        {
          cueId: 'q1',
          targetKind: 'light' as const,
          targetId: 'light-jardin-1',
          transition: { kind: 'smooth' as const, duration: 3 },
          values: { intensity: 4, color: '#ffaa00' },
        },
      ],
    },
  }
  assert.deepEqual(deserializeScene(serializeScene(withShow)), withShow)
  const broken = (mutate: (raw: ReturnType<typeof JSON.parse>) => void) => {
    const raw = JSON.parse(serializeScene(withShow))
    mutate(raw)
    return () => deserializeScene(JSON.stringify(raw))
  }
  assert.throws(broken((raw) => (raw.timeline.keyframes[0].cueId = 'missing')))
  assert.throws(broken((raw) => (raw.timeline.keyframes[0].targetId = 'ghost')))
  assert.throws(broken((raw) => (raw.timeline.keyframes[0].values.name = 'Kevin')))
  assert.throws(broken((raw) => (raw.timeline.keyframes[0].values.constructor = 1)))
  assert.throws(broken((raw) => (raw.timeline.keyframes[1].transition.duration = -1)))
  assert.throws(broken((raw) => (raw.timeline.cues[0].time = -5)))
  assert.throws(broken((raw) => raw.timeline.keyframes.push(raw.timeline.keyframes[0])))
})
