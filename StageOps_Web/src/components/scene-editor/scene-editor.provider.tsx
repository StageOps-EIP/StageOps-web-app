import { useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import {
  SceneEditorContext,
  reducer,
  loadPersistedState,
  STORAGE_KEY,
} from './scene-editor.store';

// SceneEditorProvider is the only export — keeps this file component-only for React Fast Refresh.
// All store access goes through `import { useSceneEditor } from './scene-editor.store'`.
export function SceneEditorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadPersistedState);

  // Persist to localStorage whenever state changes (skip history to keep storage lean)
  useEffect(() => {
    try {
      const { history: _history, historyIndex: _idx, ...persistable } = state;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...persistable, history: [], historyIndex: -1 }));
    } catch {
      // Ignore quota or serialisation errors
    }
  }, [state]);

  return (
    <SceneEditorContext.Provider value={{ state, dispatch }}>
      {children}
    </SceneEditorContext.Provider>
  );
}
