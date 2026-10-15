import assert from 'node:assert/strict'
import { test } from 'node:test'
import { workspaceReducer, type Workspace } from '../src/domain/workspace.ts'
import type { Equipment, Incident } from '../src/domain/models.ts'

const item: Equipment = {
  id: 'eq',
  name: 'Console',
  qrCode: 'QR',
  category: 'sound',
  status: 'ok',
  location: 'Régie',
}
const incident: Incident = {
  id: 'inc',
  title: 'Panne',
  description: 'Signal absent',
  severity: 'high',
  status: 'open',
  equipmentId: 'eq',
  reportedBy: 'Illan',
  timestamp: new Date('2026-10-15T10:00:00Z'),
}
const initial = (): Workspace => structuredClone({ equipment: [item], incidents: [] })
const add = (state: Workspace, value = incident) =>
  workspaceReducer(state, { type: 'incident/added', incident: value })
const update = (state: Workspace, status: Incident['status']) =>
  workspaceReducer(state, { type: 'incident/updated', id: incident.id, patch: { status } })

test('one immutable transition updates incident and equipment', () => {
  const before = initial()
  const after = add(before)
  assert.equal(after.incidents.length, 1)
  assert.equal(after.equipment[0].status, 'to-check')
  assert.equal(before.equipment[0].status, 'ok')
  assert.equal(before.incidents.length, 0)
})
test('closing resolves the equipment and reopening flags it again', () => {
  const closed = update(add(initial()), 'closed')
  assert.equal(closed.equipment[0].status, 'ok')
  assert.equal(update(closed, 'open').equipment[0].status, 'to-check')
})
test('another active incident prevents release, a closed incident does not', () => {
  const two = add(add(initial()), { ...incident, id: 'inc-2' })
  assert.equal(update(two, 'resolved').equipment[0].status, 'to-check')
  const closed = add(add(initial()), { ...incident, id: 'inc-2', status: 'closed' })
  assert.equal(update(closed, 'resolved').equipment[0].status, 'ok')
})
test('HS and repair states survive incident creation and resolution', () => {
  for (const status of ['hs', 'repair'] as const) {
    const state = initial()
    state.equipment[0].status = status
    assert.equal(update(add(state), 'resolved').equipment[0].status, status)
  }
})
test('a resolved incident does not reset an independent check request', () => {
  const state = initial()
  state.equipment[0].status = 'to-check'
  assert.equal(add(state, { ...incident, status: 'resolved' }).equipment[0].status, 'to-check')
})
test('reassigning an active incident reconciles both pieces of equipment', () => {
  const state = initial()
  state.equipment.push({ ...item, id: 'eq-2' })
  const moved = workspaceReducer(add(state), {
    type: 'incident/updated',
    id: incident.id,
    patch: { equipmentId: 'eq-2' },
  })
  assert.equal(moved.equipment[0].status, 'ok')
  assert.equal(moved.equipment[1].status, 'to-check')
})
test('duplicates and unknown incident updates leave state untouched', () => {
  const state = add(initial())
  assert.equal(add(state), state)
  assert.equal(
    workspaceReducer(state, { type: 'incident/updated', id: 'missing', patch: { title: 'X' } }),
    state,
  )
})
