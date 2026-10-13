import { createContext } from 'react';

export interface SidebarContextValue {
  /** Rail mode on desktop (icons only). */
  isCollapsed: boolean;
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
  /** Drawer visibility on tablet/mobile. */
  isMobileOpen: boolean;
  openMobile: () => void;
  closeMobile: () => void;
  /** True below the `lg` breakpoint. */
  isMobile: boolean;
}

/** Consumed through the `useSidebar` hook. */
export const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);
