import { useMemo } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import type { MapPlaceholder } from '@/types';
import { formatRelativeTime } from '@/utils/date';
import { Card, CardContent, CardHeader, ProgressBar, Skeleton, StatusDot } from '@/components';

/**
 * Operational Map — section 9 of the Cold Chain Operations Center.
 *
 * Purpose: a self-contained route visualisation (NO third-party map provider).
 *
 * Expected API response: `LiveMonitoringFrame.map` (MapPlaceholder) with a
 * `route` polyline, origin/destination, currentPosition, upcomingCheckpoint,
 * etaAt and progressPct.
 *
 * Reserved for future backend integration: swap the inline SVG for a map-tile
 * / routing widget, feed it the same `route` + `currentIndex`, and keep this
 * component as the fallback when no map key is configured.
 */

const VIEW_W = 320;
const VIEW_H = 180;
const PAD = 22;

export interface OperationalMapProps {
  map: MapPlaceholder;
  live: boolean;
  isLoading?: boolean;
}

export function OperationalMap({ map, live, isLoading = false }: OperationalMapProps) {
  const projection = useMemo(() => {
    const lats = map.route.map((point) => point.latitude);
    const lngs = map.route.map((point) => point.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const spanLat = maxLat - minLat || 1;
    const spanLng = maxLng - minLng || 1;

    return (latitude: number, longitude: number) => ({
      x: PAD + ((longitude - minLng) / spanLng) * (VIEW_W - 2 * PAD),
      y: VIEW_H - PAD - ((latitude - minLat) / spanLat) * (VIEW_H - 2 * PAD),
    });
  }, [map.route]);

  const travelled = map.route
    .slice(0, map.currentIndex + 1)
    .map((point) => projection(point.latitude, point.longitude));
  const remaining = map.route
    .slice(map.currentIndex)
    .map((point) => projection(point.latitude, point.longitude));
  const toPath = (points: { x: number; y: number }[]) =>
    points
      .map(
        (point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)},${point.y.toFixed(1)}`,
      )
      .join(' ');

  const origin = projection(map.route[0]!.latitude, map.route[0]!.longitude);
  const destination = projection(
    map.route[map.route.length - 1]!.latitude,
    map.route[map.route.length - 1]!.longitude,
  );
  const current = projection(
    map.route[map.currentIndex]!.latitude,
    map.route[map.currentIndex]!.longitude,
  );

  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title="Operational Map"
        description="Route and live position (placeholder view)"
        actions={<StatusDot tone="brand" pulse={live} />}
      />
      <CardContent className="flex flex-1 flex-col pt-0">
        {isLoading ? (
          <Skeleton className="h-[180px] w-full rounded-control" />
        ) : (
          <div className="rounded-control border border-line bg-surface-muted/30 p-2">
            <svg
              viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
              className="h-[180px] w-full"
              role="img"
              aria-label="Route map placeholder"
            >
              {travelled.length > 1 && (
                <path
                  d={toPath(travelled)}
                  fill="none"
                  stroke="rgb(var(--color-success))"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              {remaining.length > 1 && (
                <path
                  d={toPath(remaining)}
                  fill="none"
                  stroke="rgb(var(--color-line-strong))"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Origin */}
              <circle cx={origin.x} cy={origin.y} r="4.5" fill="rgb(var(--color-success))" />
              {/* Destination */}
              <circle
                cx={destination.x}
                cy={destination.y}
                r="4.5"
                fill="rgb(var(--color-brand))"
              />
              {/* Current position with pulse halo */}
              <circle
                cx={current.x}
                cy={current.y}
                r="9"
                fill="rgb(var(--color-content-primary))"
                opacity="0.12"
                className="animate-pulse-ring"
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              />
              <circle
                cx={current.x}
                cy={current.y}
                r="5"
                fill="rgb(var(--color-content-primary))"
                stroke="rgb(var(--color-surface))"
                strokeWidth="2"
              />
            </svg>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
          <Info label="Origin" value={map.origin} icon={MapPin} />
          <Info label="Destination" value={map.destination} icon={Navigation} />
          <Info label="Current" value={map.currentPosition} icon={MapPin} />
          <Info label="Next checkpoint" value={map.upcomingCheckpoint} icon={MapPin} />
          <Info label="ETA" value={formatRelativeTime(map.etaAt)} icon={Navigation} />
          <div>
            <p className="text-2xs uppercase tracking-wide text-content-muted">Progress</p>
            <p className="tabular mt-0.5 text-sm font-semibold text-content-primary">
              {map.progressPct}%
            </p>
          </div>
        </div>

        <div className="mt-4">
          <ProgressBar value={map.progressPct} tone="brand" />
          <p className="mt-2 text-2xs text-content-muted">
            Placeholder view — reserved for future map-tile / routing backend integration.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

interface InfoProps {
  label: string;
  value: string;
  icon: typeof MapPin;
}

function Info({ label, value, icon: Icon }: InfoProps) {
  return (
    <div className="flex items-start gap-2">
      <Icon size={13} className="mt-0.5 shrink-0 text-content-muted" aria-hidden />
      <div className="min-w-0">
        <p className="text-2xs uppercase tracking-wide text-content-muted">{label}</p>
        <p className="truncate text-sm font-medium text-content-primary">{value}</p>
      </div>
    </div>
  );
}
