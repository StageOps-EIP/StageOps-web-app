import { createContext } from 'react';

export type Theme = 'dark' | 'light';

export interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

// Shared context — consumed by ThemeProvider and useTheme
export const ThemeContext = createContext<ThemeContextValue>({ theme: 'dark', toggle: () => {} });
