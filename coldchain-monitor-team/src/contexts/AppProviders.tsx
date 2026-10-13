import type { ReactNode } from 'react';
import { SidebarProvider } from './SidebarProvider';
import { ThemeProvider } from './ThemeProvider';

/**
 * Composition root for global providers.
 * Add future providers (auth, feature flags, toasts) here — one place only.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light">
      <SidebarProvider>{children}</SidebarProvider>
    </ThemeProvider>
  );
}
