import { useCallback, useEffect, useMemo, type ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { STORAGE_KEYS } from '@/utils/constants';
import { ThemeContext, type ThemeMode } from './themeContext';

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeMode;
}

/**
 * Applies the theme class to `<html>` and persists the operator's choice.
 * Dark is the product default; light exists for warehouse/daylight use.
 */
export function ThemeProvider({ children, defaultTheme = 'dark' }: ThemeProviderProps) {
  const [theme, setStoredTheme] = useLocalStorage<ThemeMode>(STORAGE_KEYS.theme, defaultTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
  }, [theme]);

  const setTheme = useCallback((next: ThemeMode) => setStoredTheme(next), [setStoredTheme]);

  const toggleTheme = useCallback(
    () => setStoredTheme((previous) => (previous === 'dark' ? 'light' : 'dark')),
    [setStoredTheme],
  );

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
