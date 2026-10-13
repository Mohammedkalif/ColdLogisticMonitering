import { Clock, Fuel, Gauge, MapPin, Route, Satellite } from 'lucide-react';
import type { TruckStatus } from '@/types';
import { coolingStatusMeta, driverStatusMeta, engineStatusMeta } from '@/utils/domain';
import { formatDistanceKm } from '@/utils/format';
import { formatRelativeTime } from '@/utils/date';
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  ProgressBar,
  StatTile,
  StatusDot,
} from '@/components';

/**
 * Live Truck Status — section 5 of the Cold Chain Operations Center.
 *
 * Purpose: vehicle-level telemetry alongside the cargo sensors.
 *
 * Expected API response: `LiveMonitoringFrame.truckStatus` (TruckStatus).
 * Required fields: truckId, registrationNumber, speedKph, currentLocation,
 * latitude/longitude, engineStatus, coolingStatus, fuelPct,
 * distanceTravelledKm, distanceRemainingKm, etaAt, driverName, driverStatus,
 * progressPct.
 *
 * Future backend integration: engine / cooling states currently derive from
 * the simulator; a CAN-bus / telematics feed would populate them directly.
 */

function fuelTone(pct: number) {
  return pct >= 40 ? 'success' : pct >= 20 ? 'warning' : 'danger';
}

export interface TruckStatusPanelProps {
  status: TruckStatus;
  live: boolean;
  isLoading?: boolean;
}

export function TruckStatusPanel({ status, live, isLoading = false }: TruckStatusPanelProps) {
  const engine = engineStatusMeta[status.engineStatus];
  const cooling = coolingStatusMeta[status.coolingStatus];
  const driver = driverStatusMeta[status.driverStatus];

  return (
    <Card>
      <CardHeader
        title="Live Truck Status"
        description="Vehicle and cooling-unit telemetry"
        actions={
          <StatusDot
            tone={
              status.coolingStatus === 'fault'
                ? 'danger'
                : status.engineStatus === 'running'
                  ? 'success'
                  : 'neutral'
            }
            pulse={live && status.engineStatus === 'running'}
          />
        }
      />
      <CardContent className="pt-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-content-primary">
              {status.registrationNumber}
            </p>
            <p className="mt-0.5 truncate text-2xs text-content-muted">
              {status.truckId} · {status.driverName}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Badge tone={engine.tone} withDot>
              {engine.label}
            </Badge>
            <Badge tone={cooling.tone} withDot>
              {cooling.label}
            </Badge>
            <Badge tone={driver.tone} withDot>
              {driver.label}
            </Badge>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-sm text-content-secondary">
          <MapPin size={14} className="shrink-0 text-content-muted" aria-hidden />
          <span className="truncate">{status.currentLocation}</span>
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-2xs text-content-muted">
          <Satellite size={12} className="shrink-0" aria-hidden />
          <span className="tabular">
            {status.latitude.toFixed(4)}°, {status.longitude.toFixed(4)}°
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatTile
            label="Speed"
            value={isLoading ? '—' : `${status.speedKph} km/h`}
            icon={Gauge}
            tone="brand"
            isLoading={isLoading}
          />
          <StatTile
            label="Fuel"
            value={isLoading ? '—' : `${status.fuelPct}%`}
            icon={Fuel}
            tone={fuelTone(status.fuelPct)}
            isLoading={isLoading}
          />
          <StatTile
            label="Travelled"
            value={isLoading ? '—' : formatDistanceKm(status.distanceTravelledKm)}
            icon={Route}
            tone="neutral"
            isLoading={isLoading}
          />
          <StatTile
            label="Remaining"
            value={isLoading ? '—' : formatDistanceKm(status.distanceRemainingKm)}
            icon={Route}
            tone="neutral"
            isLoading={isLoading}
          />
          <StatTile
            label="ETA"
            value={isLoading ? '—' : formatRelativeTime(status.etaAt)}
            icon={Clock}
            tone="info"
            isLoading={isLoading}
          />
          <StatTile
            label="Progress"
            value={isLoading ? '—' : `${status.progressPct}%`}
            icon={Route}
            tone={status.progressPct >= 100 ? 'success' : 'brand'}
            isLoading={isLoading}
          />
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-2xs text-content-muted">
            <span>Journey progress</span>
            <span className="text-content-secondary">{status.progressPct}% complete</span>
          </div>
          <ProgressBar
            value={status.progressPct}
            tone={status.progressPct >= 100 ? 'success' : 'brand'}
          />
        </div>
      </CardContent>
    </Card>
  );
}
