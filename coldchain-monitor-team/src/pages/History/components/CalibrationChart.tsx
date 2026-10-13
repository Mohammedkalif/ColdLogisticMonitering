import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { CalibrationReport } from '@/types';
import { ChartContainer, ChartTooltip, useChartTheme } from '@/components/charts';

export interface CalibrationChartProps {
  report?: CalibrationReport | null;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  height?: number;
}

/**
 * Predicted-vs-observed spoilage by probability bin.
 *
 * Data arrives fully shaped from `historyApi.getCalibration`
 * (`GET /history/calibration`); this component only draws it using the shared
 * chart theme. Empty bins are omitted upstream, never fabricated here.
 */
export function CalibrationChart({
  report,
  isLoading,
  isError,
  onRetry,
  height = 260,
}: CalibrationChartProps) {
  const theme = useChartTheme();

  const rows = useMemo(
    () =>
      (report?.bins ?? []).map((bin) => ({
        label: bin.label,
        count: bin.shipmentCount,
        predicted: Math.round(bin.predictedAvg * 100),
        observed: Math.round(bin.observedAvg * 100),
      })),
    [report],
  );

  return (
    <ChartContainer
      height={height}
      isLoading={isLoading}
      isError={isError}
      isEmpty={rows.length === 0}
      emptyTitle="No completed journeys in this window"
      emptyDescription="Widen the time range or clear filters to compute calibration bins."
      onRetry={onRetry}
    >
      <div className="flex items-center gap-4 pb-2 text-2xs text-content-muted">
        <span className="flex items-center gap-1.5">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: theme.series.brand }}
            aria-hidden
          />
          Predicted spoilage
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: theme.series.neutral }}
            aria-hidden
          />
          Observed spoilage
        </span>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={rows} barGap={3} margin={{ top: 4, right: 8, bottom: 0, left: -12 }}>
          <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: theme.axisText, fontSize: 11 }}
            axisLine={{ stroke: theme.axis }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tickFormatter={(value) => `${value}%`}
            tick={{ fill: theme.axisText, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: theme.grid, opacity: 0.25 }}
            content={<ChartTooltip units={{ predicted: '%', observed: '%' }} />}
          />
          <Bar
            dataKey="predicted"
            name="Predicted"
            fill={theme.series.brand}
            radius={[3, 3, 0, 0]}
            maxBarSize={30}
            isAnimationActive={false}
          />
          <Bar
            dataKey="observed"
            name="Observed"
            fill={theme.series.neutral}
            radius={[3, 3, 0, 0]}
            maxBarSize={30}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
