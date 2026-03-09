import { useEffect } from 'react';

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} — StageOps`;
    return () => {
      document.title = 'StageOps — Régie Technique';
    };
  }, [title]);
}
