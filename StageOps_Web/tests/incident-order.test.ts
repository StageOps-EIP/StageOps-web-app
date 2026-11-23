import assert from 'node:assert/strict'
import { it } from 'node:test'
import { sortIncidentsForAttention } from '../src/lib/incident-order.ts'
import type { Incident } from '../src/lib/types.ts'

function incident(
  id: string,
  status: Incident['status'],
  severity: Incident['severity'],
  timestamp: string,
): Incident {
  return {
    id,
    title: id,
    description: id,
    status,
    severity,
    reportedBy: 'Régie',
    timestamp: new Date(timestamp),
  }
}

it('shows active critical work first, then other active work, then completed work', () => {
  const input = [
    incident('closed-critical', 'closed', 'critical', '2026-11-23T10:00:00Z'),
    incident('open-medium', 'open', 'medium', '2026-11-23T10:00:00Z'),
    incident('progress-critical-old', 'in-progress', 'critical', '2026-11-23T08:00:00Z'),
    incident('open-critical-new', 'open', 'critical', '2026-11-23T09:00:00Z'),
    incident('resolved-high', 'resolved', 'high', '2026-11-23T10:00:00Z'),
  ]

  assert.deepEqual(sortIncidentsForAttention(input).map((item) => item.id), [
    'open-critical-new',
    'progress-critical-old',
    'open-medium',
    'closed-critical',
    'resolved-high',
  ])
  assert.equal(input[0].id, 'closed-critical')
})
