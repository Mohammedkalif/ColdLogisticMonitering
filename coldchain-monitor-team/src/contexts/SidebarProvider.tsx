import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { STORAGE_KEYS } from '@/utils/constants';
import { SidebarContext } from './sidebarContext';

/**
 * Owns all sidebar layout state so `Sidebar`, `Topbar` and `AppLayout` stay
 * presentational. Collapsed state persists across sessions.
 */
export function SidebarProvider({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();
  const [isCollapsed, setStoredCollapsed] = useLocalStorage<boolean>(
    STORAGE_KEYS.sidebarCollapsed,
    false,
  );
  const [isMobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  /* Navigating on mobile should always dismiss the drawer. */
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  /* Prevent the page behind the drawer from scrolling. */
  useEffect(() => {
    if (!isMobile) return;
    document.body.style.overflow = isMobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, isMobileOpen]);

  const value = useMemo(
    () => ({
      isCollapsed: isMobile ? false : isCollapsed,
      toggleCollapsed: () => setStoredCollapsed((previous) => !previous),
      setCollapsed: (collapsed: boolean) => setStoredCollapsed(collapsed),
      isMobileOpen,
      openMobile: () => setMobileOpen(true),
      closeMobile: () => setMobileOpen(false),
      isMobile,
    }),
    [isCollapsed, isMobile, isMobileOpen, setStoredCollapsed],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}
