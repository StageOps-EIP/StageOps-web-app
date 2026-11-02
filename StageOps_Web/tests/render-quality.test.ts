import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createSceneLight } from '../src/domain/scene-models.ts'
import {
  physicalIntensity,
  QUALITY_PRESETS,
  shadowCasterIds,
} from '../src/components/scene-editor/render-quality.ts'

const light = (id: string, intensity: number, extra = {}) => ({
  ...createSceneLight('spot', id),
  castShadow: true,
  intensity,
  ...extra,
})

test('only the brightest eligible lights cast shadows, within the budget', () => {
  const lights = [
    light('dim', 1),
    light('bright', 9),
    light('medium', 5),
    light('off', 0),
    light('hidden', 10, { visible: false }),
    light('no-shadow', 10, { castShadow: false }),
    { ...createSceneLight('point', 'point'), castShadow: true, intensity: 10 },
  ]
  assert.deepEqual([...shadowCasterIds(lights, 2)], ['bright', 'medium'])
  assert.equal(shadowCasterIds(lights, 0).size, 0)
  assert.equal(shadowCasterIds(lights, 10).size, 3)
})

test('eco is the lightest preset and levels map to physical units', () => {
  assert.equal(QUALITY_PRESETS.eco.shadowCasters, 0)
  assert.equal(QUALITY_PRESETS.eco.postProcessing, false)
  assert.ok(QUALITY_PRESETS.hd.shadowCasters > QUALITY_PRESETS.standard.shadowCasters)
  assert.equal(physicalIntensity(light('a', 0)), 0)
  assert.ok(physicalIntensity(light('a', 10)) > physicalIntensity(light('a', 5)))
})
