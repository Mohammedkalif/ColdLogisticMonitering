import { Link } from 'react-router-dom';
import { ArrowUpRight, Truck } from 'lucide-react';
import type { Shipment } from '@/types';
import { ROUTE_PATHS } from '@/routes/routes.config';
import { cn } from '@/utils/cn';
import { formatDateTime, formatTimeAgoShort } from '@/utils/date';
import { commodityLabels, riskLevelMeta, shipmentStatusMeta } from '@/utils/domain';
import { formatTemperature } from '@/utils/format';
import { getToneStyle } from '@/utils/tone';
import { Badge, Card, CardHeader, ProgressBar } from '@/components/ui';
import { DataTable, type DataTableColumn } from '@/components/tables';

export interface ShipmentOverviewTableProps {
  shipments: Shipment[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

/** Health score bands — presentation only, thresholds mirror the risk model. */
const healthTone = (score: number) =>
  score >= 80 ? 'success' : score >= 55 ? 'warning' : 'danger';

/**
 * Fleet-wide consignment summary.
 *
 * Sortable, sticky-headed and responsive: lower-priority columns drop away on
 * narrow viewports so the identity, status and health always stay visible.
 */
export function ShipmentOverviewTable({
  shipments,
  isLoading,
  isError,
  onRetry,
}: ShipmentOverviewTableProps) {
  const columns: DataTableColumn<Shipment>[] = [
    {
      id: 'code',
      header: 'Shipment',
      sortAccessor: (shipment) => shipment.code,
      cell: (shipment) => (
        <div className="min-w-0">
          <p className="truncate font-mono text-xs font-medium text-content-primary">
            {shipment.code}
          </p>
          <p className="mt-0.5 truncate text-2xs text-content-muted">
            {shipment.vehicle.registrationNumber}
          </p>
        </div>
      ),
    },
    {
      id: 'commodity',
      header: 'Product',
      sortAccessor: (shipment) => commodityLabels[shipment.commodity],
      hideBelow: 'sm',
      cell: (shipment) => (
        <span className="text-xs text-content-secondary">
          {commodityLabels[shipment.commodity]}
        </span>
      ),
    },
    {
      id: 'location',
      header: 'Current location',
      sortAccessor: (shipment) => shipment.currentLocation,
      hideBelow: 'lg',
      cell: (shipment) => (
        <div className="min-w-0">
          <p className="truncate text-xs text-content-secondary">{shipment.currentLocation}</p>
          <ProgressBar
            value={shipment.progressPct}
            tone="neutral"
            className="mt-1.5 w-24"
            label={`${shipment.code} progress`}
          />
        </div>
      ),
    },
    {
      id: 'destination',
      header: 'Destination',
      sortAccessor: (shipment) => shipment.route.destination,
      hideBelow: 'xl',
      cell: (shipment) => (
        <span className="truncate text-xs text-content-secondary">
          {shipment.route.destination}
        </span>
      ),
    },
    {
      id: 'eta',
      header: 'ETA',
      align: 'right',
      sortAccessor: (shipment) => new Date(shipment.etaAt).getTime(),
      hideBelow: 'md',
      cell: (shipment) => (
        <span
          className="tabular text-xs text-content-secondary"
          title={formatDateTime(shipment.etaAt)}
        >
          in {formatTimeAgoShort(shipment.etaAt).replace('-', '')}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      align: 'center',
      sortAccessor: (shipment) => shipmentStatusMeta[shipment.status].label,
      cell: (shipment) => {
        const status = shipmentStatusMeta[shipment.status];
        return (
          <Badge tone={status.tone} withDot>
            {status.label}
          </Badge>
        );
      },
    },
    {
      id: 'temperature',
      header: 'Temperature',
      align: 'right',
      sortAccessor: (shipment) => shipment.temperatureC,
      hideBelow: 'sm',
      cell: (shipment) => {
        const risk = riskLevelMeta[shipment.riskLevel];
        const tone = getToneStyle(risk.tone);
        return (
          <span className={cn('tabular text-xs font-medium', tone.text)}>
            {formatTemperature(shipment.temperatureC)}
          </span>
        );
      },
    },
    {
      id: 'health',
      header: 'Health score',
      align: 'right',
      sortAccessor: (shipment) => shipment.healthScore,
      cell: (shipment) => {
        const tone = healthTone(shipment.healthScore);
        return (
          <div className="flex flex-col items-end gap-1">
            <span className="tabular text-xs font-semibold text-content-primary">
              {shipment.healthScore}
            </span>
            <ProgressBar
              value={shipment.healthScore}
              tone={tone}
              className="w-14"
              label={`${shipment.code} health score`}
            />
          </div>
        );
      },
    },
  ];

  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title="Shipment overview"
        description="Active consignments ranked by predicted spoilage risk"
        icon={
          <span className="flex h-8 w-8 items-center justify-center rounded-control bg-surface-muted text-content-muted">
            <Truck size={16} aria-hidden />
          </span>
        }
        actions={
          <Link
            to={ROUTE_PATHS.liveMonitoring}
            className="inline-flex items-center gap-1 text-xs font-medium text-brand transition hover:text-brand-hover"
          >
            Live monitoring
            <ArrowUpRight size={13} aria-hidden />
          </Link>
        }
      />

      <DataTable
        columns={columns}
        data={shipments}
        rowKey={(shipment) => shipment.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={onRetry}
        stickyHeader
        maxBodyHeight="26rem"
        dense
      />
    </Card>
  );
}
