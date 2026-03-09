import { useEffect, useState } from 'react';
import { ThemeContext } from './theme.context';
import type { Theme } from './theme.context';

// ThemeProvider is the only export — keeps this file component-only for React Fast Refresh.
// Use `import { useTheme } from '@/lib/use-theme'` to consume the theme in components.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('stageops-theme') as Theme) ?? 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
    localStorage.setItem('stageops-theme', theme);
  }, [theme]);

  const toggle = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
