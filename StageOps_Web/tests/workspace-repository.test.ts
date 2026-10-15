import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  createLocalWorkspaceRepository,
  deserializeWorkspace,
  WORKSPACE_STORAGE_KEY,
  LEGACY_WORKSPACE_STORAGE_KEY,
} from '../src/infrastructure/workspace/local-workspace.repository.ts'
import type { Workspace } from '../src/domain/workspace.ts'

function seed(): Workspace {
  return {
    equipment: [
      {
        id: 'eq',
        name: 'Console',
        category: 'sound',
        qrCode: 'QR',
        status: 'ok',
        location: 'Régie',
        lastCheck: new Date('2026-10-15T09:00:00Z'),
      },
    ],
    incidents: [
      {
        id: 'inc',
        title: 'Panne',
        description: 'Signal absent',
        severity: 'high',
        status: 'open',
        equipmentId: 'eq',
        reportedBy: 'Illan',
        timestamp: new Date('2026-10-15T10:00:00Z'),
      },
    ],
  }
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
test('round-trip preserves dates and values', () => {
  const loaded = deserializeWorkspace(JSON.stringify(seed()))
  assert.deepEqual(JSON.parse(JSON.stringify(loaded)), JSON.parse(JSON.stringify(seed())))
  assert.ok(loaded.equipment[0].lastCheck instanceof Date)
  assert.ok(loaded.incidents[0].timestamp instanceof Date)
})
test('loads the legacy key and removes it only after successful persistence', () => {
  const store = storage()
  store.data.set(LEGACY_WORKSPACE_STORAGE_KEY, JSON.stringify(seed()))
  const repository = createLocalWorkspaceRepository(() => store, seed)
  assert.deepEqual(
    JSON.parse(JSON.stringify(repository.load().workspace)),
    JSON.parse(JSON.stringify(seed())),
  )
  assert.ok(store.data.has(LEGACY_WORKSPACE_STORAGE_KEY))
  assert.equal(repository.save(seed()).ok, true)
  assert.ok(store.data.has(WORKSPACE_STORAGE_KEY))
  assert.equal(store.data.has(LEGACY_WORKSPACE_STORAGE_KEY), false)
})
test('corrupt data is reported and never overwritten', () => {
  for (const raw of [
    '{bad json',
    '{"equipment":[]}',
    JSON.stringify({ ...seed(), incidents: [{ ...seed().incidents[0], timestamp: 'bad' }] }),
  ]) {
    const store = storage()
    store.data.set(WORKSPACE_STORAGE_KEY, raw)
    const repository = createLocalWorkspaceRepository(() => store, seed)
    assert.equal(repository.load().status, 'invalid')
    assert.equal(repository.save(seed()).ok, false)
    assert.equal(store.getItem(WORKSPACE_STORAGE_KEY), raw)
  }
})
test('unavailable storage and quota errors are recoverable', () => {
  const repository = createLocalWorkspaceRepository(() => {
    throw new Error('Denied')
  }, seed)
  assert.equal(repository.load().status, 'unavailable')
  assert.equal(repository.save(seed()).ok, false)
  const store = storage()
  store.data.set(LEGACY_WORKSPACE_STORAGE_KEY, JSON.stringify(seed()))
  store.setItem = () => {
    throw new Error('Quota')
  }
  const full = createLocalWorkspaceRepository(() => store, seed)
  assert.equal(full.save(seed()).ok, false)
  assert.ok(store.data.has(LEGACY_WORKSPACE_STORAGE_KEY))
})
test('invalid enums and duplicate identifiers are rejected', () => {
  assert.throws(() =>
    deserializeWorkspace(
      JSON.stringify({ ...seed(), equipment: [{ ...seed().equipment[0], status: 'unexpected' }] }),
    ),
  )
  assert.throws(() =>
    deserializeWorkspace(
      JSON.stringify({ ...seed(), equipment: [seed().equipment[0], seed().equipment[0]] }),
    ),
  )
})
