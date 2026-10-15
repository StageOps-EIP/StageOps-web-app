import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createWorkspaceStore } from '../src/application/workspace-store.ts'
import type { Workspace } from '../src/domain/workspace.ts'
import type { WorkspaceRepository } from '../src/domain/workspace-repository.ts'

const equipment = {
  id: 'eq',
  name: 'Console',
  category: 'sound' as const,
  qrCode: 'QR',
  status: 'ok' as const,
  location: 'Régie',
}

test('commands publish one coherent snapshot and persist through the injected port', () => {
  let saved: Workspace | undefined
  const repository: WorkspaceRepository = {
    load: () => ({ status: 'ready', workspace: { equipment: [], incidents: [] } }),
    save: (workspace) => {
      saved = workspace
      return { ok: true }
    },
  }
  const store = createWorkspaceStore(repository)
  const before = store.getSnapshot()
  let calls = 0
  const unsubscribe = store.subscribe(() => {
    calls++
  })
  store.commands.addEquipment(equipment)
  assert.equal(calls, 1)
  assert.equal(saved?.equipment[0].id, 'eq')
  assert.equal(store.getSnapshot().equipment[0].id, 'eq')
  assert.equal(before.equipment.length, 0)
  assert.equal(store.getSnapshot(), store.getSnapshot())
  unsubscribe()
  store.commands.updateEquipment({ ...equipment, name: 'Console mise à jour' })
  assert.equal(calls, 1)
})
test('failed saves retain changes in memory and expose an actionable warning', () => {
  const repository: WorkspaceRepository = {
    load: () => ({ status: 'ready', workspace: { equipment: [], incidents: [] } }),
    save: () => ({ ok: false }),
  }
  const store = createWorkspaceStore(repository)
  store.commands.addEquipment(equipment)
  assert.equal(store.getSnapshot().equipment.length, 1)
  assert.match(store.getSnapshot().persistenceIssue ?? '', /exportez/)
})
test('an invalid stored workspace never triggers persistence', () => {
  let saves = 0
  const repository: WorkspaceRepository = {
    load: () => ({ status: 'invalid', workspace: { equipment: [], incidents: [] } }),
    save: () => {
      saves++
      return { ok: true }
    },
  }
  const store = createWorkspaceStore(repository)
  store.commands.addEquipment(equipment)
  assert.equal(saves, 0)
  assert.match(store.getSnapshot().persistenceIssue ?? '', /données originales/)
})
