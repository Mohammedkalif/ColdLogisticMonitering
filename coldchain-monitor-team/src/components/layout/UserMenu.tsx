import { ChevronDown, LogOut, Settings, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/useSettings';
import { ROUTE_PATHS } from '@/routes/routes.config';
import { cn } from '@/utils/cn';
import { DropdownMenu, DropdownMenuItem, Skeleton } from '@/components/ui';

/**
 * Profile avatar and account menu.
 * Actions are placeholders until the auth provider is integrated.
 */
export function UserMenu() {
  const { data: user, isLoading } = useCurrentUser();
  const navigate = useNavigate();

  return (
    <DropdownMenu
      width="w-60"
      trigger={({ isOpen, toggle }) => (
        <button
          type="button"
          onClick={toggle}
          aria-label="Account menu"
          aria-expanded={isOpen}
          className={cn(
            'flex items-center gap-2 rounded-control border border-transparent py-1 pl-1 pr-1.5 transition hover:bg-surface-hover',
            isOpen && 'bg-surface-hover',
          )}
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line bg-surface-muted text-2xs font-semibold text-content-secondary">
            {isLoading ? '' : (user?.initials ?? '—')}
          </span>
          <span className="hidden min-w-0 flex-col items-start leading-tight md:flex">
            {isLoading ? (
              <Skeleton className="h-3 w-20" />
            ) : (
              <span className="max-w-[9rem] truncate text-xs font-medium text-content-primary">
                {user?.name ?? 'Unknown user'}
              </span>
            )}
          </span>
          <ChevronDown
            size={14}
            className="hidden shrink-0 text-content-muted md:block"
            aria-hidden
          />
        </button>
      )}
    >
      {({ close }) => (
        <div>
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-sm font-medium text-content-primary">
              {user?.name ?? 'Unknown user'}
            </p>
            <p className="mt-0.5 truncate text-2xs text-content-muted">{user?.email ?? '—'}</p>
            <p className="mt-1.5 truncate text-2xs text-content-secondary">{user?.role ?? '—'}</p>
          </div>

          <div className="py-1">
            <DropdownMenuItem onClick={close}>
              <UserRound size={15} aria-hidden />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                close();
                navigate(ROUTE_PATHS.settings);
              }}
            >
              <Settings size={15} aria-hidden />
              Workspace settings
            </DropdownMenuItem>
          </div>

          <div className="border-t border-line py-1">
            <DropdownMenuItem onClick={close} className="text-danger hover:text-danger">
              <LogOut size={15} aria-hidden />
              Sign out
            </DropdownMenuItem>
          </div>
        </div>
      )}
    </DropdownMenu>
  );
}
