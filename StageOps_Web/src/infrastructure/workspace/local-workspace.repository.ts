import type { Equipment, Incident } from '../../domain/models.ts'
import type { Workspace } from '../../domain/workspace.ts'
import type { WorkspaceRepository } from '../../domain/workspace-repository.ts'

export const WORKSPACE_STORAGE_KEY = 'stageops.workspace.v1'
export const LEGACY_WORKSPACE_STORAGE_KEY = 'stageops.demo.workspace.v1'
type StoragePort = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

function record(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    throw new Error('Invalid object')
  return value as Record<string, unknown>
}
function text(value: unknown): string {
  if (typeof value !== 'string') throw new Error('Invalid string')
  return value
}
function optionalText(value: unknown): string | undefined {
  return value === undefined ? undefined : text(value)
}
function enumeration<T extends string>(value: unknown, allowed: readonly T[]): T {
  if (!allowed.includes(value as T)) throw new Error('Invalid enum')
  return value as T
}
function date(value: unknown): Date {
  const parsed = new Date(text(value))
  if (!Number.isFinite(parsed.getTime())) throw new Error('Invalid date')
  return parsed
}
function optionalDate(value: unknown): Date | undefined {
  return value === undefined ? undefined : date(value)
}
function strings(value: unknown): string[] | undefined {
  if (value === undefined) return undefined
  if (!Array.isArray(value)) throw new Error('Invalid array')
  return value.map(text)
}
function position(value: unknown): Equipment['position'] {
  if (value === undefined) return undefined
  const item = record(value)
  if (
    typeof item.x !== 'number' ||
    !Number.isFinite(item.x) ||
    typeof item.y !== 'number' ||
    !Number.isFinite(item.y) ||
    (item.z !== undefined && (typeof item.z !== 'number' || !Number.isFinite(item.z)))
  ) {
    throw new Error('Invalid position')
  }
  return { x: item.x, y: item.y, z: item.z as number | undefined }
}
function equipment(value: unknown): Equipment {
  const item = record(value)
  return {
    id: text(item.id),
    name: text(item.name),
    qrCode: text(item.qrCode),
    category: enumeration(item.category, ['sound', 'light', 'video', 'set', 'safety', 'rigging']),
    status: enumeration(item.status, ['ok', 'to-check', 'hs', 'repair']),
    location: text(item.location),
    zone: optionalText(item.zone),
    eventId: optionalText(item.eventId),
    responsiblePerson: optionalText(item.responsiblePerson),
    notes: optionalText(item.notes),
    lastCheck: optionalDate(item.lastCheck),
    position: position(item.position),
  }
}
function incident(value: unknown): Incident {
  const item = record(value)
  return {
    id: text(item.id),
    title: text(item.title),
    description: text(item.description),
    severity: enumeration(item.severity, ['low', 'medium', 'high', 'critical']),
    status: enumeration(item.status, ['open', 'in-progress', 'resolved', 'closed']),
    equipmentId: optionalText(item.equipmentId),
    reportedBy: text(item.reportedBy),
    timestamp: date(item.timestamp),
    resolvedAt: optionalDate(item.resolvedAt),
    resolutionNotes: optionalText(item.resolutionNotes),
    images: strings(item.images),
  }
}
function uniqueIds(items: { id: string }[]): void {
  if (
    items.some((item) => !item.id) ||
    new Set(items.map((item) => item.id)).size !== items.length
  ) {
    throw new Error('Invalid or duplicate identifier')
  }
}
export function deserializeWorkspace(raw: string): Workspace {
  const stored = record(JSON.parse(raw))
  if (!Array.isArray(stored.equipment) || !Array.isArray(stored.incidents))
    throw new Error('Invalid workspace')
  const result = {
    equipment: stored.equipment.map(equipment),
    incidents: stored.incidents.map(incident),
  }
  uniqueIds(result.equipment)
  uniqueIds(result.incidents)
  return result
}
export function createLocalWorkspaceRepository(
  getStorage: () => StoragePort,
  createSeed: () => Workspace,
): WorkspaceRepository {
  let writable = true
  return {
    load() {
      let raw: string | null
      try {
        const storage = getStorage()
        raw =
          storage.getItem(WORKSPACE_STORAGE_KEY) ?? storage.getItem(LEGACY_WORKSPACE_STORAGE_KEY)
      } catch {
        writable = false
        return { status: 'unavailable', workspace: createSeed() }
      }
      if (raw === null) return { status: 'ready', workspace: createSeed() }
      try {
        return { status: 'ready', workspace: deserializeWorkspace(raw) }
      } catch {
        // Preserve the original payload for recovery instead of overwriting it with fixtures.
        writable = false
        return { status: 'invalid', workspace: createSeed() }
      }
    },
    save(workspace) {
      if (!writable) return { ok: false }
      try {
        const storage = getStorage()
        storage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(workspace))
        storage.removeItem(LEGACY_WORKSPACE_STORAGE_KEY)
        return { ok: true }
      } catch {
        return { ok: false }
      }
    },
  }
}
