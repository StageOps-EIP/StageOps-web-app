// crypto.randomUUID only exists in secure contexts (HTTPS or localhost); the fallback keeps
// the editor usable when the dev server is opened from another machine on the network.
export function createSceneId(kind: 'obj' | 'light'): string {
  const random =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  return `${kind}-${random}`
}
