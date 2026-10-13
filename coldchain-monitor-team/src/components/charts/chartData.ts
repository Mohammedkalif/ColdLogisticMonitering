import type { ChartDatum, TelemetrySeries, TimeSeriesPoint } from '@/types';

/** Minimal shape any series must satisfy to be plotted. */
export interface PlottableSeries {
  /** Becomes the `dataKey` on each merged row. */
  key: string;
  points: TimeSeriesPoint[];
}

/**
 * Merge independent series into the row format Recharts expects.
 *
 * `[{ key: 'temperature', points }, ...]`
 *   -> `[{ timestamp, temperature: 4.1, humidity: 88 }, ...]`
 */
export function toChartRows(series: PlottableSeries[]): ChartDatum[] {
  const rows = new Map<string, ChartDatum>();

  series.forEach((entry) => {
    entry.points.forEach((point) => {
      const existing = rows.get(point.timestamp) ?? { timestamp: point.timestamp };
      existing[entry.key] = point.value;
      rows.set(point.timestamp, existing);
    });
  });

  return [...rows.values()].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
}

/** Telemetry-specific wrapper: keys rows by the sensor `metric` field. */
export function toChartData(series: TelemetrySeries[]): ChartDatum[] {
  return toChartRows(series.map((entry) => ({ key: entry.metric, points: entry.points })));
}
