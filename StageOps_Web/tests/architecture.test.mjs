import assert from 'node:assert/strict'
import { test } from 'node:test'
import { checkArchitecture, checkBoundary, findCycles } from '../scripts/check-architecture.mjs'

test('the source graph respects architecture boundaries', () => {
  assert.deepEqual(checkArchitecture(), [])
})
test('the guard rejects forbidden imports', () => {
  assert.ok(checkBoundary('application/workspace-store.ts', 'react'))
  assert.ok(checkBoundary('application/workspace-store.ts', 'infrastructure/storage.ts'))
  assert.ok(checkBoundary('domain/workspace.ts', 'react'))
  assert.ok(checkBoundary('domain/workspace.ts', 'infrastructure/storage.ts'))
  assert.ok(checkBoundary('contexts/Provider.tsx', 'infrastructure/storage.ts'))
  assert.ok(checkBoundary('infrastructure/storage.ts', 'pages/Equipment.tsx'))
  assert.equal(checkBoundary('app/providers.tsx', 'infrastructure/storage.ts'), null)
  assert.equal(checkBoundary('domain/workspace.ts', 'domain/models.ts'), null)
})
test('cycles are detected including indirect dependencies', () => {
  assert.equal(
    findCycles(
      new Map([
        ['a', ['b']],
        ['b', ['c']],
        ['c', ['a']],
      ]),
    ).length,
    1,
  )
  assert.deepEqual(
    findCycles(
      new Map([
        ['a', ['b']],
        ['b', []],
      ]),
    ),
    [],
  )
})
