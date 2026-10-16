import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  createAutoQualityState,
  sampleAutoQuality,
} from '../src/components/scene-editor/auto-quality.ts'
import { captureScenePng } from '../src/components/scene-editor/capture-scene.ts'
import { floorPoolPlacement } from '../src/components/scene-editor/floor-pool-placement.ts'
import { createSceneLight } from '../src/domain/scene-models.ts'

test('Auto stays HD after sustained 60 FPS instead of falling back after repeated inclines', () => {
  let state = createAutoQualityState()
  for (let frame = 0; frame < 3600; frame++) state = sampleAutoQuality(state, 1 / 60, true)
  assert.equal(state.tier, 'hd')
  assert.equal(state.lowResolution, false)
})
test('demand-render idle periods never count as slow performance', () => {
  let state = createAutoQualityState()
  for (let frame = 0; frame < 100; frame++) state = sampleAutoQuality(state, 10, false)
  assert.equal(state.tier, 'standard')
  assert.equal(state.lowResolution, false)
  state = sampleAutoQuality(state, 120, true)
  assert.equal(state.elapsed, 0)
  assert.equal(state.tier, 'standard')
})
test('Auto drops resolution only after sustained slowness in Eco and can recover', () => {
  let state = createAutoQualityState()
  for (let frame = 0; frame < 80; frame++) state = sampleAutoQuality(state, 0.1, true)
  assert.equal(state.tier, 'eco')
  assert.equal(state.lowResolution, true)
  for (let frame = 0; frame < 1800; frame++) state = sampleAutoQuality(state, 1 / 60, true)
  assert.equal(state.tier, 'hd')
  assert.equal(state.lowResolution, false)
})
test('short FPS dips do not lower quality', () => {
  let state = createAutoQualityState()
  for (let frame = 0; frame < 8; frame++) state = sampleAutoQuality(state, 0.1, true)
  for (let frame = 0; frame < 180; frame++) state = sampleAutoQuality(state, 1 / 60, true)
  assert.equal(state.tier, 'standard')
})

test('ending an interaction clears a pending slow window before the next demand frame', () => {
  let state = createAutoQualityState()
  for (let frame = 0; frame < 13; frame++) state = sampleAutoQuality(state, 0.1, true)
  assert.equal(state.slowWindows, 1)
  state = sampleAutoQuality(state, 0, false)
  state = sampleAutoQuality(state, 300, true)
  assert.equal(state.slowWindows, 0)
  assert.equal(state.tier, 'standard')
})
test('PNG capture reads the composed image without overwriting it with raw rendering', () => {
  let pixels = ''
  const renderer = {
    render: () => {
      pixels = 'raw'
    },
    domElement: { toDataURL: (type: string) => type + ':' + pixels },
  }
  const composer = {
    render: () => {
      pixels = 'bloom+vignette'
    },
  }
  assert.equal(captureScenePng(renderer, {}, {}, composer), 'image/png:bloom+vignette')
})
test('PNG capture falls back to direct rendering when effects are off', () => {
  let pixels = ''
  const renderer = {
    render: () => {
      pixels = 'raw'
    },
    domElement: { toDataURL: () => pixels },
  }
  assert.equal(captureScenePng(renderer, {}, {}, null), 'raw')
})
test('simulated spot only reaches the floor within its configured range', () => {
  const light = {
    ...createSceneLight('spot', 'test'),
    position: [0, 8, 0] as [number, number, number],
    targetPosition: [0, 0, 0] as [number, number, number],
  }
  assert.equal(floorPoolPlacement({ ...light, distance: 2 }), null)
  assert.equal(floorPoolPlacement({ ...light, distance: 8 }), null)
  assert.deepEqual(floorPoolPlacement({ ...light, distance: 10 })?.position, [0, 0.012, 0])
  assert.notEqual(floorPoolPlacement({ ...light, distance: 0 }), null)
})
test('simulated spot rejects upward beams and accounts for oblique path length', () => {
  const light = {
    ...createSceneLight('spot', 'test'),
    position: [0, 8, 0] as [number, number, number],
    targetPosition: [6, 0, 0] as [number, number, number],
  }
  assert.equal(floorPoolPlacement({ ...light, distance: 9 }), null)
  assert.notEqual(floorPoolPlacement({ ...light, distance: 11 }), null)
  assert.equal(floorPoolPlacement({ ...light, targetPosition: [0, 10, 0] }), null)
})
