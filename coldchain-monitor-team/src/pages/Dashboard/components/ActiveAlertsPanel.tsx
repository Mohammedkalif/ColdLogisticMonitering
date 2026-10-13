import { Link } from 'react-router-dom';
import { ArrowUpRight, BellRing, ShieldCheck } from 'lucide-react';
import type { Alert } from '@/types';
import { ROUTE_PATHS } from '@/routes/routes.config';
import { cn } from '@/utils/cn';
import { formatDateTime, formatTimeAgoShort } from '@/utils/date';
import { alertSeverityMeta, alertStatusMeta } from '@/utils/domain';
import { getToneStyle } from '@/utils/tone';
import { Badge, Card, CardHeader, EmptyState, Skeleton } from '@/components/ui';

export interface ActiveAlertsPanelProps {
  alerts: Alert[];
  isLoading: boolean;
}

/** Compact alert feed with severity, timestamp, description and status. */
export function ActiveAlertsPanel({ alerts, isLoading }: ActiveAlertsPanelProps) {
  const openCount = alerts.filter((alert) => alert.status === 'open').length;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title="Active alerts"
        description="Threshold breaches and model escalations"
        icon={
          <span className="flex h-8 w-8 items-center justify-center rounded-control bg-surface-muted text-content-muted">
            <BellRing size={16} aria-hidden />
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            {!isLoading && openCount > 0 && <Badge tone="danger">{openCount} open</Badge>}
            <Link
              to={ROUTE_PATHS.alerts}
              className="inline-flex items-center gap-1 text-xs font-medium text-brand transition hover:text-brand-hover"
            >
              View all
              <ArrowUpRight size={13} aria-hidden />
            </Link>
          </div>
        }
      />

      <div className="flex-1">
        {isLoading && (
          <div className="space-y-3 p-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2 rounded-control border border-line p-3">
                <div className="flex justify-between gap-3">
                  <Skeleton className="h-4 w-20 rounded-full" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && alerts.length === 0 && (
          <EmptyState
            size="sm"
            icon={ShieldCheck}
            title="No active alerts"
            description="Every consignment is operating inside its threshold band."
          />
        )}

        {!isLoading && alerts.length > 0 && (
          <ul className="divide-y divide-line">
            {alerts.map((alert) => {
              const severity = alertSeverityMeta[alert.severity];
              const status = alertStatusMeta[alert.status];
              const tone = getToneStyle(severity.tone);

              return (
                <li
                  key={alert.id}
                  className={cn(
                    'border-l-2 px-4 py-3 transition duration-200 hover:bg-surface-hover/40',
                    tone.accent,
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <Badge tone={severity.tone} withDot>
                        {severity.label}
                      </Badge>
                      <span className="truncate font-mono text-2xs text-content-muted">
                        {alert.shipmentCode}
                      </span>
                    </div>
                    <time
                      className="tabular shrink-0 text-2xs text-content-muted"
                      title={formatDateTime(alert.triggeredAt)}
                    >
                      {formatTimeAgoShort(alert.triggeredAt)} ago
                    </time>
                  </div>

                  <p className="mt-1.5 truncate text-xs font-medium text-content-primary">
                    {alert.title}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-2xs text-content-muted">
                    {alert.description}
                  </p>

                  <div className="mt-2">
                    <Badge tone={status.tone}>{status.label}</Badge>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
}
