import { PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import { useAlertSummary } from '@/hooks/useAlerts';
import { useSidebar } from '@/hooks/useSidebar';
import { SIDEBAR_ROUTES } from '@/routes/routes.config';
import { cn } from '@/utils/cn';
import { env } from '@/utils/env';
import { IconButton, StatusDot } from '@/components/ui';
import { Logo } from './Logo';
import { SidebarNavItem } from './SidebarNavItem';

/**
 * Primary navigation.
 *
 * Desktop: fixed rail that can collapse to icons.
 * Below `lg`: off-canvas drawer with a dimmed backdrop.
 */
export function Sidebar() {
  const { isCollapsed, toggleCollapsed, isMobile, isMobileOpen, closeMobile } = useSidebar();
  const { data: alertSummary } = useAlertSummary();

  const collapsed = !isMobile && isCollapsed;

  return (
    <>
      {/* Backdrop (mobile only) */}
      <div
        onClick={closeMobile}
        aria-hidden
        className={cn(
          'fixed inset-0 z-overlay bg-slate-950/60 transition-opacity lg:hidden',
          isMobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      <aside
        aria-label="Main navigation"
        className={cn(
          'fixed inset-y-0 left-0 z-overlay flex flex-col border-r border-line bg-app transition-[width,transform] lg:z-sidebar lg:translate-x-0',
          collapsed ? 'w-sidebar-collapsed' : 'w-sidebar',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Brand row — height matches the top bar for a continuous baseline */}
        <div
          className={cn(
            'flex h-topbar shrink-0 items-center border-b border-line',
            collapsed ? 'justify-center px-2' : 'justify-between px-4',
          )}
        >
          <Logo markOnly={collapsed} />
          {isMobile && (
            <IconButton icon={X} label="Close navigation" size="sm" onClick={closeMobile} />
          )}
        </div>

        {/* Navigation */}
        <nav className={cn('flex-1 overflow-y-auto py-4', collapsed ? 'px-3' : 'px-3')}>
          {!collapsed && (
            <p className="px-3 pb-2 text-2xs font-semibold uppercase tracking-wider text-content-muted">
              Operations
            </p>
          )}
          <ul className="space-y-1">
            {SIDEBAR_ROUTES.map((route) => (
              <li key={route.id}>
                <SidebarNavItem
                  route={route}
                  isCollapsed={collapsed}
                  badgeCount={route.showAlertBadge ? alertSummary?.open : undefined}
                />
              </li>
            ))}
          </ul>
        </nav>

        {/* Environment / data-source indicator */}
        <div className="shrink-0 border-t border-line p-3">
          {collapsed ? (
            <div className="flex justify-center py-1">
              <StatusDot tone={env.useMockApi ? 'warning' : 'success'} />
            </div>
          ) : (
            <div className="rounded-control border border-line bg-surface/60 px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-2xs font-medium uppercase tracking-wide text-content-muted">
                  Data source
                </span>
                <StatusDot tone={env.useMockApi ? 'warning' : 'success'} />
              </div>
              <p className="mt-1 truncate text-xs text-content-secondary">
                {env.useMockApi ? 'Mock services' : 'Live API'}
              </p>
            </div>
          )}

          {!isMobile && (
            <div className={cn('mt-2 flex', collapsed ? 'justify-center' : 'justify-end')}>
              <IconButton
                icon={collapsed ? PanelLeftOpen : PanelLeftClose}
                label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                size="sm"
                onClick={toggleCollapsed}
              />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
