import type { TemperatureForecastData } from '@/types';
import { toChartRows } from '@/components/charts';
import {
  Card,
  CardContent,
  CardHeader,
  ChartContainer,
  StatusDot,
  TimeSeriesChart,
} from '@/components';

/**
 * Temperature Forecast — section 4 of the AI Decision Support Center.
 *
 * Purpose: compare historical temperature against the model's predicted
 * trajectory, bounded by a confidence corridor and the safe operating limit.
 *
 * Expected API: `PredictionReport.temperatureForecast` from
 * `predictionApi.getPredictionReport`. `historical` and `predicted` are
 * TimeSeriesPoint[]; `confidenceLower/Upper` define the band; `safeThreshold`
 * is the cold-chain ceiling.
 *
 * Future backend integration: the backend supplies real forecast series; the
 * chart contract (series + referenceBand + referenceLine) is unchanged.
 * Required response fields: temperatureForecast.{historical,predicted,confidenceLower,confidenceUpper,safeThreshold,forecastWindowHours}.
 */

export interface TemperatureForecastProps {
  forecast: TemperatureForecastData;
  live?: boolean;
}

export function TemperatureForecast({ forecast }: TemperatureForecastProps) {
  const rows = toChartRows([
    { key: 'historical', points: forecast.historical },
    { key: 'predicted', points: forecast.predicted },
  ]);

  const bandMin = Math.min(...forecast.confidenceLower.map((point) => point.value));
  const bandMax = Math.max(...forecast.confidenceUpper.map((point) => point.value));

  return (
    <Card>
      <CardHeader
        title="Temperature Forecast"
        description="Historical vs. predicted trajectory with confidence corridor"
        actions={
          <div className="flex items-center gap-3 text-2xs text-content-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-content-muted" /> Historical
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-brand" /> Predicted
            </span>
            <StatusDot tone="brand" pulse label={`${forecast.forecastWindowHours}h window`} />
          </div>
        }
      />
      <CardContent className="pt-0">
        <ChartContainer height={260}>
          <TimeSeriesChart
            height={260}
            data={rows}
            referenceBand={{ min: bandMin, max: bandMax }}
            referenceLines={[
              { value: forecast.safeThreshold, label: 'Safe limit', tone: 'danger' },
            ]}
            series={[
              { key: 'historical', label: 'Historical', tone: 'neutral', type: 'line' },
              { key: 'predicted', label: 'Predicted', tone: 'brand', type: 'line' },
            ]}
          />
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
