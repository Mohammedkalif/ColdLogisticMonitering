import type { ConnectivityRow } from '@/types';
import { formatPercent } from '@/utils/format';
import { formatTimeAgoShort } from '@/utils/date';
import { deviceConnectivityMeta } from '@/utils/domain';
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  DataTable,
  ProgressBar,
  StatusDot,
} from '@/components';

/**
 * Sensor Connectivity — section 7 of the Cold Chain Operations Center.
 *
 * Purpose: tabular health of every paired logger / subsystem.
 *
 * Expected API response: `LiveMonitoringFrame.connectivity` (ConnectivityRow[]).
 * Required fields: sensorName, status, signalStrengthPct, lastCommunicationAt,
 * batteryPct, health, tone.
 *
 * Future backend integration: replace the mock resolver with the device
 * management endpoint; columns already render tones/labels from domain meta.
 */

function signalTone(value: number) {
  return value > 60 ? 'success' : value > 30 ? 'warning' : 'danger';
}

interface SensorConnectivityTableProps {
  rows: ConnectivityRow[];
  isLoading?: boolean;
}

export function SensorConnectivityTable({ rows, isLoading = false }: SensorConnectivityTableProps) {
  return (
    <Card>
      <CardHeader
        title="Sensor Connectivity"
        description="Paired loggers, signal strength and battery"
        actions={
          <StatusDot
            tone={rows.some((r) => r.status === 'offline') ? 'danger' : 'success'}
            label={rows.some((r) => r.status === 'offline') ? 'Degraded' : 'Healthy'}
          />
        }
      />
      <CardContent className="pt-0">
        <DataTable<ConnectivityRow>
          data={rows}
          isLoading={isLoading}
          rowKey={(row) => row.id}
          stickyHeader
          defaultSort={{ columnId: 'health', direction: 'desc' }}
          columns={[
            {
              id: 'sensorName',
              header: 'Sensor',
              sortAccessor: (row) => row.sensorName,
              cell: (row) => (
                <div className="min-w-0">
                  <p className="truncate font-medium text-content-primary">{row.sensorName}</p>
                  <p className="truncate text-2xs text-content-muted">{row.id}</p>
                </div>
              ),
            },
            {
              id: 'status',
              header: 'Status',
              align: 'center',
              sortAccessor: (row) => row.status,
              cell: (row) => {
                const meta = deviceConnectivityMeta[row.status];
                return (
                  <Badge tone={meta.tone} withDot>
                    {meta.label}
                  </Badge>
                );
              },
            },
            {
              id: 'signalStrengthPct',
              header: 'Signal',
              align: 'right',
              sortAccessor: (row) => row.signalStrengthPct,
              cell: (row) => (
                <div className="flex items-center justify-end gap-2">
                  <span className="tabular w-9 text-right text-xs text-content-secondary">
                    {formatPercent(row.signalStrengthPct)}
                  </span>
                  <ProgressBar
                    value={row.signalStrengthPct}
                    tone={signalTone(row.signalStrengthPct)}
                    className="w-16"
                  />
                </div>
              ),
            },
            {
              id: 'lastCommunicationAt',
              header: 'Last comm.',
              align: 'right',
              hideBelow: 'md',
              sortAccessor: (row) => new Date(row.lastCommunicationAt).getTime(),
              cell: (row) => (
                <span className="tabular text-xs text-content-secondary">
                  {formatTimeAgoShort(row.lastCommunicationAt)} ago
                </span>
              ),
            },
            {
              id: 'batteryPct',
              header: 'Battery',
              align: 'right',
              hideBelow: 'lg',
              sortAccessor: (row) => row.batteryPct,
              cell: (row) => (
                <div className="flex items-center justify-end gap-2">
                  <span className="tabular w-9 text-right text-xs text-content-secondary">
                    {formatPercent(row.batteryPct)}
                  </span>
                  <ProgressBar
                    value={row.batteryPct}
                    tone={signalTone(row.batteryPct)}
                    className="w-16"
                  />
                </div>
              ),
            },
            {
              id: 'health',
              header: 'Health',
              align: 'right',
              hideBelow: 'xl',
              sortAccessor: (row) => row.health,
              cell: (row) => (
                <div className="flex items-center justify-end gap-2">
                  <span className="tabular w-9 text-right text-xs text-content-secondary">
                    {formatPercent(row.health)}
                  </span>
                  <ProgressBar value={row.health} tone={signalTone(row.health)} className="w-16" />
                </div>
              ),
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}
