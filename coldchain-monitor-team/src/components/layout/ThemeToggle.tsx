import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { IconButton } from '@/components/ui';

/** Switches between the dark (default) and light themes. */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <IconButton
      icon={theme === 'dark' ? Sun : Moon}
      label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={toggleTheme}
    />
  );
}
