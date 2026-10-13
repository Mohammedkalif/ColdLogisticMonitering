import { createContext } from 'react';

export type ThemeMode = 'dark' | 'light';

export interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

/** Consumed through the `useTheme` hook. */
export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
