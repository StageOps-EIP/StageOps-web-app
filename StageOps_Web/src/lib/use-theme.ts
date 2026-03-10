import { useContext } from 'react';
import { ThemeContext } from './theme.context';
import type { ThemeContextValue } from './theme.context';

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
