import type { ChartDatum, LiveMonitoringSeries, LiveThresholds } from '@/types';
import {
  Card,
  CardContent,
  CardHeader,
  ChartContainer,
  StatusDot,
  TimeSeriesChart,
} from '@/components';

/**
 * Real-Time Monitoring Panel — section 3 of the Cold Chain Operations Center.
 *
 * Four live Recharts visualisations fed by `LiveMonitoringFrame.series`.
 * Charts continuously update because the parent re-renders the latest series
 * every tick (no page refresh; polling driven by `useLiveMonitoring`).
 *
 * Expected API response: `LiveMonitoringFrame.series` (TimeSeriesPoint[] per
 * metric) + `LiveMonitoringFrame.thresholds` for the safe-operating bands.
 *
 * This module is the heavy Recharts consumer, so the page lazy-loads it
 * (`React.lazy`) to keep it off the initial bundle. The shared `TimeSeriesChart`
 * already applies `ifOverflow="extendDomain"` so bands never vanish.
 *
 * Future ML integration: replace the `cooling` / `signal` series with
 * model-projected trajectories once a forecasting service exists.
 */

function toRows(points: { timestamp: string; value: number }[], key: string): ChartDatum[] {
  return points.map((point) => ({ timestamp: point.timestamp, [key]: point.value }));
}

interface ChartBlockProps {
  title: string;
  seriesKey: string;
  label: string;
  unit: string;
  tone: 'brand' | 'info' | 'success' | 'warning' | 'danger' | 'neutral';
  data: ChartDatum[];
  referenceBand?: { min: number; max: number };
  referenceLines?: { value: number; label: string }[];
  isLoading: boolean;
}

function ChartBlock({
  title,
  seriesKey,
  label,
  unit,
  tone,
  data,
  referenceBand,
  referenceLines,
  isLoading,
}: ChartBlockProps) {
  return (
    <div className="rounded-control border border-line bg-surface-muted/30 p-3">
      <div className="mb-1 flex items-center justify-between">
        <p className="text-xs font-medium text-content-secondary">{title}</p>
        <StatusDot tone={isLoading ? 'neutral' : 'success'} pulse={!isLoading} />
      </div>
      <ChartContainer height={210} isLoading={isLoading} isEmpty={data.length === 0}>
        <TimeSeriesChart
          height={210}
          data={data}
          referenceBand={referenceBand}
          referenceLines={referenceLines}
          series={[{ key: seriesKey, label: `${label} (${unit})`, unit, tone, type: 'area' }]}
        />
      </ChartContainer>
    </div>
  );
}

export interface RealTimeChartsProps {
  series: LiveMonitoringSeries;
  thresholds: LiveThresholds;
  live: boolean;
  isLoading?: boolean;
}

export default function RealTimeCharts({
  series,
  thresholds,
  live,
  isLoading = false,
}: RealTimeChartsProps) {
  return (
    <Card>
      <CardHeader
        title="Real-Time Monitoring"
        description="Streaming temperature, humidity, cooling and signal quality"
        actions={
          <StatusDot
            tone={live ? 'success' : 'neutral'}
            pulse={live}
            label={live ? 'Streaming' : 'Paused'}
          />
        }
      />
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartBlock
            title="Temperature Timeline"
            seriesKey="temperature"
            label="Temperature"
            unit="°C"
            tone="brand"
            data={toRows(series.temperature, 'temperature')}
            referenceBand={thresholds.temperature}
            referenceLines={
              thresholds.temperature
                ? [
                    { value: thresholds.temperature.min, label: 'Min' },
                    { value: thresholds.temperature.max, label: 'Max' },
                  ]
                : undefined
            }
            isLoading={isLoading}
          />
          <ChartBlock
            title="Humidity Timeline"
            seriesKey="humidity"
            label="Humidity"
            unit="%"
            tone="info"
            data={toRows(series.humidity, 'humidity')}
            referenceBand={thresholds.humidity}
            referenceLines={
              thresholds.humidity
                ? [
                    { value: thresholds.humidity.min, label: 'Min' },
                    { value: thresholds.humidity.max, label: 'Max' },
                  ]
                : undefined
            }
            isLoading={isLoading}
          />
          <ChartBlock
            title="Cooling Performance"
            seriesKey="cooling"
            label="Cooling"
            unit="%"
            tone="success"
            data={toRows(series.cooling, 'cooling')}
            isLoading={isLoading}
          />
          <ChartBlock
            title="Sensor Signal Quality"
            seriesKey="signal"
            label="Signal"
            unit="%"
            tone="brand"
            data={toRows(series.signal, 'signal')}
            isLoading={isLoading}
          />
        </div>
      </CardContent>
    </Card>
  );
}
