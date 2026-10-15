import type { Workspace } from './workspace.ts'
export type WorkspaceLoadResult =
  | { status: 'ready'; workspace: Workspace }
  | { status: 'invalid' | 'unavailable'; workspace: Workspace }
export type WorkspaceSaveResult = { ok: true } | { ok: false }
export interface WorkspaceRepository {
  load(): WorkspaceLoadResult
  save(workspace: Workspace): WorkspaceSaveResult
}
