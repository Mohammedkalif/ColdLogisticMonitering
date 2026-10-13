import { useMemo } from 'react';
import type { DashboardTrendSeries } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui';
import { ChartContainer, TimeSeriesChart, toChartRows } from '@/components/charts';

export interface DashboardChartsProps {
  series: DashboardTrendSeries[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  /** Window label shown in each panel subtitle, e.g. `Last 24 hours`. */
  rangeLabel: string;
}

interface TrendPanelProps {
  entry?: DashboardTrendSeries;
  title: string;
  description: string;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  /** Draw dashed limit lines on top of the shaded band. */
  showThresholdLines?: boolean;
  height?: number;
  className?: string;
}

/**
 * One trend panel.
 *
 * Kept local to this file: it is a layout detail of the dashboard grid, not a
 * product-wide primitive, and it composes the shared chart components rather
 * than duplicating them.
 */
function TrendPanel({
  entry,
  title,
  description,
  isLoading,
  isError,
  onRetry,
  showThresholdLines = false,
  height = 220,
  className,
}: TrendPanelProps) {
  const data = useMemo(() => (entry ? toChartRows([entry]) : []), [entry]);

  const referenceLines = useMemo(() => {
    if (!showThresholdLines || !entry?.threshold) return undefined;
    return [
      {
        value: entry.threshold.max,
        label: `Max ${entry.threshold.max}${entry.unit}`,
        tone: 'danger' as const,
      },
      {
        value: entry.threshold.min,
        label: `Min ${entry.threshold.min}${entry.unit}`,
        tone: 'info' as const,
      },
    ];
  }, [showThresholdLines, entry]);

  return (
    <Card className={className}>
      <CardHeader title={title} description={description} />
      <CardContent className="p-4 pt-2">
        <ChartContainer
          height={height}
          isLoading={isLoading}
          isError={isError}
          isEmpty={data.length === 0}
          onRetry={onRetry}
        >
          {entry && (
            <TimeSeriesChart
              height={height}
              data={data}
              referenceBand={entry.threshold}
              referenceLines={referenceLines}
              showLegend={false}
              series={[
                {
                  key: entry.key,
                  label: `${entry.label} (${entry.unit})`,
                  tone: entry.tone,
                  unit: entry.unit,
                  type: 'area',
                },
              ]}
            />
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

/**
 * Dashboard trend grid.
 *
 * Lazy-loaded by `DashboardPage` so Recharts stays out of the initial bundle
 * and the KPI row paints first.
 */
export default function DashboardCharts({
  series,
  isLoading,
  isError,
  onRetry,
  rangeLabel,
}: DashboardChartsProps) {
  const find = (key: DashboardTrendSeries['key']) => series.find((entry) => entry.key === key);

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <TrendPanel
        entry={find('temperature')}
        title="Temperature trend"
        description={`${rangeLabel} · dashed lines mark the safe operating limits`}
        isLoading={isLoading}
        isError={isError}
        onRetry={onRetry}
        showThresholdLines
        height={240}
      />
      <TrendPanel
        entry={find('humidity')}
        title="Humidity trend"
        description={`${rangeLabel} · shaded band is the optimal range`}
        isLoading={isLoading}
        isError={isError}
        onRetry={onRetry}
        height={240}
      />
      <TrendPanel
        entry={find('spoilageRisk')}
        title="Spoilage risk trend"
        description={`${rangeLabel} · fleet-wide predicted risk`}
        isLoading={isLoading}
        isError={isError}
        onRetry={onRetry}
      />
      <TrendPanel
        entry={find('predictionConfidence')}
        title="Prediction confidence trend"
        description={`${rangeLabel} · rolling model confidence`}
        isLoading={isLoading}
        isError={isError}
        onRetry={onRetry}
      />
    </div>
  );
}
