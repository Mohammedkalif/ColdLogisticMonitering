import { Bell, Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRecentAlerts } from '@/hooks/useAlerts';
import { ROUTE_PATHS } from '@/routes/routes.config';
import { cn } from '@/utils/cn';
import { formatTimeAgoShort } from '@/utils/date';
import { alertSeverityMeta } from '@/utils/domain';
import { getToneStyle } from '@/utils/tone';
import { DropdownMenu, EmptyState, Skeleton } from '@/components/ui';

/** Bell icon with the latest alerts. Data comes from `alertsApi`. */
export function NotificationMenu() {
  const { data: alerts, isLoading } = useRecentAlerts(5);
  const unreadCount = alerts?.filter((alert) => alert.status === 'open').length ?? 0;

  return (
    <DropdownMenu
      width="w-[21rem]"
      trigger={({ isOpen, toggle }) => (
        <button
          type="button"
          onClick={toggle}
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
          aria-expanded={isOpen}
          className={cn(
            'relative inline-flex h-9 w-9 items-center justify-center rounded-control border border-transparent text-content-muted transition',
            'hover:bg-surface-hover hover:text-content-primary',
            isOpen && 'bg-surface-hover text-content-primary',
          )}
        >
          <Bell size={17} aria-hidden />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-danger opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-danger ring-2 ring-app" />
            </span>
          )}
        </button>
      )}
    >
      {({ close }) => (
        <div>
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-sm font-semibold text-content-primary">Notifications</p>
            {unreadCount > 0 && (
              <span className="rounded-full bg-danger/15 px-2 py-0.5 text-2xs font-semibold text-danger">
                {unreadCount} open
              </span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading && (
              <div className="space-y-3 p-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            )}

            {!isLoading && (alerts?.length ?? 0) === 0 && (
              <EmptyState
                size="sm"
                icon={Inbox}
                title="You're all caught up"
                description="New threshold breaches will show up here."
              />
            )}

            {!isLoading &&
              alerts?.map((alert) => {
                const severity = alertSeverityMeta[alert.severity];
                const tone = getToneStyle(severity.tone);

                return (
                  <Link
                    key={alert.id}
                    to={ROUTE_PATHS.alerts}
                    onClick={close}
                    className="flex gap-3 border-b border-line px-4 py-3 transition last:border-0 hover:bg-surface-hover/50"
                  >
                    <span
                      className={cn('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', tone.dot)}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-xs font-medium text-content-primary">
                          {alert.title}
                        </span>
                        <span className="tabular shrink-0 text-2xs text-content-muted">
                          {formatTimeAgoShort(alert.triggeredAt)}
                        </span>
                      </span>
                      <span className="mt-0.5 block truncate text-2xs text-content-muted">
                        {alert.shipmentCode} · {alert.description}
                      </span>
                    </span>
                  </Link>
                );
              })}
          </div>

          <Link
            to={ROUTE_PATHS.alerts}
            onClick={close}
            className="block border-t border-line px-4 py-2.5 text-center text-xs font-medium text-brand transition hover:bg-surface-hover"
          >
            View all alerts
          </Link>
        </div>
      )}
    </DropdownMenu>
  );
}
