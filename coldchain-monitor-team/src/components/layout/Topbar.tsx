import { Menu } from 'lucide-react';
import { useSidebar } from '@/hooks/useSidebar';
import { APP_NAME } from '@/utils/constants';
import { IconButton } from '@/components/ui';
import { Breadcrumbs } from './Breadcrumbs';
import { GlobalSearch } from './GlobalSearch';
import { Logo } from './Logo';
import { NotificationMenu } from './NotificationMenu';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';

/**
 * Sticky application header: navigation trigger, location trail, search and
 * account controls.
 */
export function Topbar() {
  const { openMobile } = useSidebar();

  return (
    <header className="sticky top-0 z-topbar flex h-topbar shrink-0 items-center gap-3 border-b border-line bg-app px-4 sm:px-6">
      {/* Mobile: drawer trigger + product identity */}
      <div className="flex items-center gap-2 lg:hidden">
        <IconButton icon={Menu} label="Open navigation" onClick={openMobile} />
        <Logo markOnly className="sm:hidden" />
        <span className="hidden text-sm font-semibold text-content-primary sm:block">
          {APP_NAME}
        </span>
      </div>

      {/* Desktop: breadcrumbs */}
      <Breadcrumbs className="hidden lg:block" />

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <GlobalSearch className="hidden w-56 md:block xl:w-80" />
        <ThemeToggle />
        <NotificationMenu />
        <div className="mx-1 hidden h-6 w-px bg-line sm:block" aria-hidden />
        <UserMenu />
      </div>
    </header>
  );
}
