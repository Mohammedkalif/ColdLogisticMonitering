import {
  BrainCircuit,
  DoorClosed,
  DoorOpen,
  Info,
  MapPin,
  Snowflake,
  Thermometer,
  Wifi,
  WifiOff,
  type LucideIcon,
} from 'lucide-react';
import type { LiveEvent, LiveEventKind } from '@/types';
import { getToneStyle } from '@/utils/tone';
import { formatTimeAgoShort } from '@/utils/date';
import { cn } from '@/utils/cn';
import { Card, CardContent, CardHeader, Skeleton, StatusDot } from '@/components';

/**
 * Event Timeline — section 8 of the Cold Chain Operations Center.
 *
 * Purpose: chronological, newest-first audit of operational events.
 *
 * Expected API response: `LiveMonitoringFrame.events` (LiveEvent[]), already
 * ordered newest-first. Required fields: kind, title, description, occurredAt,
 * tone.
 *
 * Future backend integration: append server-emitted events (door, excursion,
 * checkpoint, prediction) to this same array — the renderer needs no change.
 * Future ML integration: prediction-generated events can carry model metadata.
 */

const EVENT_ICONS: Record<LiveEventKind, LucideIcon> = {
  door_open: DoorOpen,
  door_close: DoorClosed,
  temperature_excursion: Thermometer,
  cooling_adjust: Snowflake,
  checkpoint: MapPin,
  prediction_requested: BrainCircuit,
  sensor_reconnected: Wifi,
  sensor_offline: WifiOff,
  info: Info,
};

export interface EventTimelineProps {
  events: LiveEvent[];
  live: boolean;
  isLoading?: boolean;
}

export function EventTimeline({ events, live, isLoading = false }: EventTimelineProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title="Event Timeline"
        description="Live operational events, newest first"
        actions={
          <StatusDot
            tone={live ? 'success' : 'neutral'}
            pulse={live}
            label={live ? 'Live' : 'Paused'}
          />
        }
      />
      <CardContent className="flex-1 p-0">
        <div className="no-scrollbar max-h-[26rem] overflow-y-auto px-5 py-2">
          {isLoading ? (
            <div className="space-y-4 py-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-2.5 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ol className="relative">
              {events.map((event, index) => {
                const Icon = EVENT_ICONS[event.kind];
                const toneStyle = getToneStyle(event.tone);
                const isLatest = index === 0;
                return (
                  <li key={event.id} className="relative flex gap-3 pb-4 last:pb-1">
                    {index !== events.length - 1 && (
                      <span
                        className="absolute left-4 top-8 h-[calc(100%-1rem)] w-px -translate-x-1/2 bg-line"
                        aria-hidden
                      />
                    )}
                    <span
                      className={cn(
                        'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                        toneStyle.iconSurface,
                      )}
                    >
                      <Icon size={15} aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium text-content-primary">
                          {event.title}
                        </p>
                        <span className="tabular shrink-0 text-2xs text-content-muted">
                          {formatTimeAgoShort(event.occurredAt)} ago
                        </span>
                      </div>
                      <p className="mt-0.5 text-2xs leading-relaxed text-content-muted">
                        {event.description}
                      </p>
                      {isLatest && live && (
                        <span
                          className={cn(
                            'mt-1 inline-flex items-center gap-1 text-2xs',
                            toneStyle.text,
                          )}
                        >
                          <StatusDot tone={event.tone} pulse />
                          latest
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
