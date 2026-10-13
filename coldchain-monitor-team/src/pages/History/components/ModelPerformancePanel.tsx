import type { HistoryStats } from '@/services';
import { formatNumber, formatProbability } from '@/utils/format';
import { Skeleton } from '@/components/ui';

export interface ModelPerformancePanelProps {
  stats?: HistoryStats | null;
  isLoading: boolean;
}

interface MetricRowProps {
  label: string;
  description: string;
  value: string;
}

function MetricRow({ label, description, value }: MetricRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-content-primary">{label}</p>
        <p className="mt-0.5 text-2xs leading-relaxed text-content-muted">{description}</p>
      </div>
      <p className="tabular shrink-0 text-sm font-semibold text-content-primary">{value}</p>
    </div>
  );
}

/**
 * Model evaluation metrics for the AI/ML team.
 *
 * Every figure is derived server-side (`GET /history/stats`) over the
 * currently filtered window — the panel renders them, nothing more.
 */
export function ModelPerformancePanel({ stats, isLoading }: ModelPerformancePanelProps) {
  if (isLoading || !stats) {
    return (
      <div className="space-y-3 py-1">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-1.5">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-2.5 w-48" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="divide-y divide-line">
      <MetricRow
        label="Predictions evaluated"
        description="Completed journeys with a dispatch-time prediction in the window."
        value={formatNumber(stats.totalShipments)}
      />
      <MetricRow
        label="Mean absolute error"
        description="Average gap between predicted and observed spoilage."
        value={formatProbability(stats.predictionError, 1)}
      />
      <MetricRow
        label="RMSE"
        description="Root mean square error — penalises large misses more heavily."
        value={formatProbability(stats.rmse, 1)}
      />
      <MetricRow
        label="Accepted rate"
        description="Share of deliveries accepted without loss."
        value={formatProbability(stats.acceptedRate, 1)}
      />
    </div>
  );
}
