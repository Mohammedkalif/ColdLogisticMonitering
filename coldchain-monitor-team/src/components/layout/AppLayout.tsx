import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { useSidebar } from '@/hooks/useSidebar';
import { cn } from '@/utils/cn';
import { APP_NAME } from '@/utils/constants';
import { Spinner } from '@/components/ui';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

/**
 * Application shell: fixed sidebar, sticky top bar and a scrollable content
 * area that adapts to the sidebar width.
 */
export function AppLayout() {
  const { isCollapsed, isMobile } = useSidebar();
  const collapsed = !isMobile && isCollapsed;

  return (
    <div className="min-h-screen bg-app">
      <Sidebar />

      <div
        className={cn(
          'flex min-h-screen flex-col transition-[padding-left] duration-200',
          collapsed ? 'lg:pl-sidebar-collapsed' : 'lg:pl-sidebar',
        )}
      >
        <Topbar />

        <main className="flex-1">
          <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
            <Suspense
              fallback={
                <div className="flex h-64 items-center justify-center">
                  <Spinner size={20} label="Loading module…" />
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </div>
        </main>

        <footer className="border-t border-line px-4 py-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[1600px] flex-col gap-1 text-2xs text-content-muted sm:flex-row sm:items-center sm:justify-between">
            <span>{APP_NAME} · v0.1.0 — cold chain monitoring &amp; spoilage prediction</span>
            <span>All timestamps shown in your local timezone</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
