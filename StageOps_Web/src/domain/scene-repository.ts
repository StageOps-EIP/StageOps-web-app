import type { Scene } from './scene-models.ts'
export type SceneLoadResult =
  | { status: 'ready'; scene: Scene }
  | { status: 'invalid' | 'unavailable'; scene: Scene }
export type SceneSaveResult = { ok: true } | { ok: false }
export interface SceneRepository {
  load(): SceneLoadResult
  save(scene: Scene): SceneSaveResult
}
