import { useMemo, useState } from 'react';
import {
  Archive,
  Download,
  PackageCheck,
  Target,
  Thermometer,
  Timer,
  TriangleAlert,
} from 'lucide-react';
import type {
  CommodityType,
  SelectOption,
  ShipmentHistoryRecord,
  ShipmentOutcome,
  TimeRangeKey,
} from '@/types';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  useHistoryCalibration,
  useHistoryStats,
  useExportHistory,
  useShipmentHistory,
} from '@/hooks/useHistory';
import { COMMODITY_OPTIONS, DEFAULT_PAGE_SIZE, TIME_RANGE_OPTIONS } from '@/utils/constants';
import { formatDateTime } from '@/utils/date';
import { commodityLabels, shipmentOutcomeMeta } from '@/utils/domain';
import {
  formatDurationHours,
  formatPercent,
  formatProbability,
  formatTemperature,
} from '@/utils/format';
import { PageHeader } from '@/components/layout';
import { StatTile } from '@/components/cards';
import { FilterSelect, SearchInput } from '@/components/forms';
import {
  DataTable,
  TablePagination,
  TableToolbar,
  type DataTableColumn,
} from '@/components/tables';
import { Badge, Button, Card, CardContent, CardHeader, EmptyState } from '@/components/ui';
import { CalibrationChart, ModelPerformancePanel } from './components';

const COMMODITY_FILTER_OPTIONS: SelectOption<CommodityType | 'all'>[] = [
  { value: 'all', label: 'All commodities' },
  ...COMMODITY_OPTIONS.map((option) => ({
    value: option.value as CommodityType | 'all',
    label: option.label,
  })),
];

const OUTCOME_FILTER_OPTIONS: SelectOption<ShipmentOutcome | 'all'>[] = [
  { value: 'all', label: 'All outcomes' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'partial_loss', label: 'Partial loss' },
  { value: 'rejected', label: 'Rejected' },
];

const RANGE_FILTER_OPTIONS = TIME_RANGE_OPTIONS.slice(2);

/**
 * History — completed journeys and prediction accuracy.
 *
 * Doubles as the feedback dataset view for the ML team: every row pairs the
 * dispatch-time prediction with the ground truth recorded at delivery, and
 * the calibration + performance panels evaluate the model over the filtered
 * window.
 */
export function HistoryPage() {
  useDocumentTitle('History');

  const [search, setSearch] = useState('');
  const [range, setRange] = useState<TimeRangeKey>('30d');
  const [commodity, setCommodity] = useState<CommodityType | 'all'>('all');
  const [outcome, setOutcome] = useState<ShipmentOutcome | 'all'>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const filters = useMemo(
    () => ({ search, range, commodity, outcome }),
    [search, range, commodity, outcome],
  );

  const history = useShipmentHistory({ ...filters, page, pageSize });
  const stats = useHistoryStats(filters);
  const calibration = useHistoryCalibration(filters);
  const exporter = useExportHistory();

  const updateFilter =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      setPage(1);
    };

  const columns: DataTableColumn<ShipmentHistoryRecord>[] = [
    {
      id: 'code',
      header: 'Shipment',
      cell: (record) => (
        <div className="min-w-0">
          <p className="truncate font-mono text-xs font-medium text-content-primary">
            {record.code}
          </p>
          <p className="mt-0.5 truncate text-2xs text-content-muted">
            {commodityLabels[record.commodity]} · {record.id}
          </p>
        </div>
      ),
    },
    {
      id: 'route',
      header: 'Route',
      hideBelow: 'md',
      cell: (record) => (
        <span className="text-xs text-content-secondary">
          {record.route.origin} → {record.route.destination}
        </span>
      ),
    },
    {
      id: 'completed',
      header: 'Completed',
      hideBelow: 'lg',
      cell: (record) => (
        <span className="tabular text-xs text-content-muted">
          {formatDateTime(record.completedAt)}
        </span>
      ),
    },
    {
      id: 'transit',
      header: 'Transit',
      align: 'right',
      hideBelow: 'xl',
      cell: (record) => (
        <span className="tabular text-xs text-content-secondary">
          {formatDurationHours(record.transitHours)}
        </span>
      ),
    },
    {
      id: 'conditions',
      header: 'Avg. conditions',
      align: 'right',
      hideBelow: 'xl',
      cell: (record) => (
        <span className="tabular text-xs text-content-secondary">
          {formatTemperature(record.avgTemperatureC)} · {formatPercent(record.avgHumidityPct)}
        </span>
      ),
    },
    {
      id: 'predicted',
      header: 'Predicted',
      align: 'right',
      hideBelow: 'sm',
      cell: (record) => (
        <span className="tabular text-xs text-content-secondary">
          {formatProbability(record.predictedSpoilage)}
        </span>
      ),
    },
    {
      id: 'actual',
      header: 'Actual',
      align: 'right',
      cell: (record) => (
        <span className="tabular text-xs font-medium text-content-primary">
          {formatProbability(record.actualSpoilage)}
        </span>
      ),
    },
    {
      id: 'error',
      header: 'Error',
      align: 'right',
      hideBelow: 'lg',
      cell: (record) => (
        <span className="tabular text-xs text-content-secondary">
          {formatProbability(Math.abs(record.predictedSpoilage - record.actualSpoilage), 1)}
        </span>
      ),
    },
    {
      id: 'model',
      header: 'Model',
      hideBelow: 'lg',
      cell: (record) => (
        <span className="font-mono text-xs text-content-secondary">{record.modelVersion}</span>
      ),
    },
    {
      id: 'outcome',
      header: 'Outcome',
      align: 'right',
      cell: (record) => {
        const meta = shipmentOutcomeMeta[record.outcome];
        return <Badge tone={meta.tone}>{meta.label}</Badge>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="History"
        description="Completed consignments with predicted versus observed spoilage for model evaluation."
        lastUpdatedAt={history.lastUpdatedAt}
        onRefresh={() => {
          void history.refetch();
          void stats.refetch();
          void calibration.refetch();
        }}
        isRefreshing={history.isRefreshing}
        actions={
          <Button
            variant="secondary"
            icon={Download}
            isLoading={exporter.isExporting}
            onClick={() => void exporter.exportCsv(filters)}
            aria-label="Export the filtered history as CSV"
          >
            Export CSV
          </Button>
        }
      />

      {exporter.error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-control border border-danger/40 bg-danger-soft px-3.5 py-2.5"
        >
          <TriangleAlert size={15} className="mt-0.5 shrink-0 text-danger" aria-hidden />
          <p className="text-xs text-content-primary">
            CSV export failed — {exporter.error.message}. Please try again.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Shipments"
          value={String(stats.data?.totalShipments ?? 0)}
          icon={Archive}
          tone="brand"
          isLoading={stats.isLoading}
          hint="In selected window"
        />
        <StatTile
          label="Accepted rate"
          value={stats.data ? formatProbability(stats.data.acceptedRate, 1) : '—'}
          icon={PackageCheck}
          tone="success"
          isLoading={stats.isLoading}
          hint="Delivered without loss"
        />
        <StatTile
          label="Avg. transit"
          value={stats.data ? formatDurationHours(stats.data.avgTransitHours) : '—'}
          icon={Timer}
          tone="info"
          isLoading={stats.isLoading}
          hint="Door to door"
        />
        <StatTile
          label="Prediction error"
          value={stats.data ? formatProbability(stats.data.predictionError, 1) : '—'}
          icon={Target}
          tone="warning"
          isLoading={stats.isLoading}
          hint="Mean absolute error"
        />
      </div>

      {/* Model evaluation — calibration chart + performance metrics */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Predicted vs. actual spoilage"
            description="Calibration by probability bin · served by GET /history/calibration"
            icon={
              <span className="flex h-8 w-8 items-center justify-center rounded-control bg-surface-muted text-content-muted">
                <Thermometer size={16} aria-hidden />
              </span>
            }
            actions={
              calibration.data &&
              calibration.data.modelVersions.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {calibration.data.modelVersions.map((version) => (
                    <Badge key={version} tone="neutral">
                      {version}
                    </Badge>
                  ))}
                </div>
              )
            }
          />
          <CardContent>
            <CalibrationChart
              report={calibration.data}
              isLoading={calibration.isLoading}
              isError={calibration.isError}
              onRetry={() => void calibration.refetch()}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Model performance"
            description="Computed over the filtered window · GET /history/stats"
          />
          <CardContent className="py-2">
            <ModelPerformancePanel stats={stats.data} isLoading={stats.isLoading} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <TableToolbar>
          <SearchInput
            value={search}
            onChange={updateFilter(setSearch)}
            placeholder="Search shipment or route"
            className="w-full sm:w-72"
          />
          <FilterSelect
            label="Time range"
            value={range}
            options={RANGE_FILTER_OPTIONS}
            onChange={updateFilter(setRange)}
          />
          <FilterSelect
            label="Commodity"
            value={commodity}
            options={COMMODITY_FILTER_OPTIONS}
            onChange={updateFilter(setCommodity)}
          />
          <FilterSelect
            label="Outcome"
            value={outcome}
            options={OUTCOME_FILTER_OPTIONS}
            onChange={updateFilter(setOutcome)}
          />
        </TableToolbar>

        <DataTable
          columns={columns}
          data={history.data?.items ?? []}
          rowKey={(record) => record.id}
          isLoading={history.isLoading}
          isError={history.isError}
          onRetry={() => void history.refetch()}
          dense
          emptyState={
            <EmptyState
              icon={Archive}
              title="No completed shipments"
              description="Widen the time range or clear the filters to see historical journeys."
            />
          }
        />

        <TablePagination
          page={history.data?.page ?? page}
          pageSize={pageSize}
          total={history.data?.total ?? 0}
          totalPages={history.data?.totalPages ?? 1}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          isLoading={history.isLoading}
        />
      </Card>
    </div>
  );
}
