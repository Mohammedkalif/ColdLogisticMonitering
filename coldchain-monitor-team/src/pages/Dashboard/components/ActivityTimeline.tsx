import {
  BellRing,
  BrainCircuit,
  Cpu,
  History,
  PackageSearch,
  ThermometerSun,
  type LucideIcon,
} from 'lucide-react';
import type { ActivityEvent, ActivityKind } from '@/types';
import { cn } from '@/utils/cn';
import { formatTimeAgoShort } from '@/utils/date';
import { getToneStyle } from '@/utils/tone';
import { Card, CardHeader, EmptyState, Skeleton } from '@/components/ui';

export interface ActivityTimelineProps {
  events: ActivityEvent[];
  isLoading: boolean;
}

const activityIcons: Record<ActivityKind, LucideIcon> = {
  prediction_generated: BrainCircuit,
  temperature_warning: ThermometerSun,
  shipment_updated: PackageSearch,
  alert_acknowledged: BellRing,
  device_event: Cpu,
};

/** Chronological audit feed, newest first. */
export function ActivityTimeline({ events, isLoading }: ActivityTimelineProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title="Recent activity"
        description="Latest system and operator events"
        icon={
          <span className="flex h-8 w-8 items-center justify-center rounded-control bg-surface-muted text-content-muted">
            <History size={16} aria-hidden />
          </span>
        }
      />

      <div className="flex-1 p-5">
        {isLoading && (
          <div className="space-y-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex gap-3">
                <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && events.length === 0 && (
          <EmptyState
            size="sm"
            icon={History}
            title="No recent activity"
            description="System and operator events will appear here as they happen."
          />
        )}

        {!isLoading && events.length > 0 && (
          <ol className="relative space-y-5">
            {events.map((event, index) => {
              const Icon = activityIcons[event.kind];
              const tone = getToneStyle(event.tone);
              const isLast = index === events.length - 1;

              return (
                <li key={event.id} className="relative flex gap-3">
                  {/* Connector rail between consecutive entries */}
                  {!isLast && (
                    <span
                      className="absolute left-3.5 top-8 h-[calc(100%+0.5rem)] w-px -translate-x-1/2 bg-line"
                      aria-hidden
                    />
                  )}

                  <span
                    className={cn(
                      'relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                      'border border-line bg-surface',
                      tone.text,
                    )}
                  >
                    <Icon size={13} aria-hidden />
                  </span>

                  <div className="min-w-0 flex-1 pb-0.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-xs font-medium text-content-primary">
                        {event.title}
                      </p>
                      <time className="tabular shrink-0 text-2xs text-content-muted">
                        {formatTimeAgoShort(event.occurredAt)} ago
                      </time>
                    </div>

                    <p className="mt-1 text-2xs leading-relaxed text-content-muted">
                      {event.description}
                    </p>

                    {(event.shipmentCode || event.actor) && (
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        {event.shipmentCode && (
                          <span className="rounded border border-line bg-surface-muted px-1.5 py-0.5 font-mono text-2xs text-content-secondary">
                            {event.shipmentCode}
                          </span>
                        )}
                        {event.actor && (
                          <span className="text-2xs text-content-muted">by {event.actor}</span>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </Card>
  );
}
