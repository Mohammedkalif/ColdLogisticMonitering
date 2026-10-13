import { NavLink } from 'react-router-dom';
import type { AppRoute } from '@/routes/routes.config';
import { cn } from '@/utils/cn';
import { Tooltip } from '@/components/ui';

export interface SidebarNavItemProps {
  route: AppRoute;
  isCollapsed: boolean;
  /** Live counter rendered on the right (open alerts). */
  badgeCount?: number;
}

/** Single sidebar entry. Active state is derived from the router. */
export function SidebarNavItem({ route, isCollapsed, badgeCount }: SidebarNavItemProps) {
  const { icon: Icon, label, path, exact } = route;

  const link = (
    <NavLink
      to={path}
      end={exact}
      className={({ isActive }) =>
        cn(
          'group relative flex h-9 items-center rounded-control text-sm font-medium transition',
          isCollapsed ? 'w-9 justify-center' : 'gap-3 px-3',
          isActive
            ? 'bg-surface text-content-primary'
            : 'text-content-muted hover:bg-surface/60 hover:text-content-secondary',
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* Active accent rail */}
          {isActive && (
            <span
              className="absolute inset-y-1.5 -left-3 w-0.5 rounded-full bg-brand"
              aria-hidden
            />
          )}
          <Icon size={17} className={cn('shrink-0', isActive && 'text-brand')} aria-hidden />
          {!isCollapsed && <span className="truncate">{label}</span>}
          {!isCollapsed && badgeCount !== undefined && badgeCount > 0 && (
            <span className="tabular ml-auto rounded-full bg-danger/15 px-1.5 py-0.5 text-2xs font-semibold text-danger">
              {badgeCount}
            </span>
          )}
          {isCollapsed && badgeCount !== undefined && badgeCount > 0 && (
            <span
              className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-danger"
              aria-hidden
            />
          )}
        </>
      )}
    </NavLink>
  );

  if (!isCollapsed) return link;

  return (
    <Tooltip content={label} side="bottom">
      {link}
    </Tooltip>
  );
}
