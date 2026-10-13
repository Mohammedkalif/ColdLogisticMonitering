import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ChartDatum, StatusTone } from '@/types';
import { formatTime } from '@/utils/date';
import { ChartTooltip } from './ChartTooltip';
import { useChartTheme } from './useChartTheme';

export interface ChartSeriesConfig {
  /** Key present on every `ChartDatum` row. */
  key: string;
  label: string;
  tone?: StatusTone;
  unit?: string;
  type?: 'line' | 'area';
}

/** Horizontal marker line, e.g. an upper temperature limit. */
export interface ChartReferenceLine {
  value: number;
  label?: string;
  tone?: StatusTone;
}

export interface TimeSeriesChartProps {
  data: ChartDatum[];
  series: ChartSeriesConfig[];
  height?: number;
  /** Shaded acceptable operating band. */
  referenceBand?: { min: number; max: number };
  /** Explicit threshold markers drawn on top of the band. */
  referenceLines?: ChartReferenceLine[];
  showLegend?: boolean;
  yAxisWidth?: number;
}

/**
 * Themed time-series chart.
 *
 * Wraps Recharts so pages never deal with axis/tooltip styling. Pass rows
 * produced by `toChartData()` plus a series configuration.
 */
export function TimeSeriesChart({
  data,
  series,
  height = 260,
  referenceBand,
  referenceLines,
  showLegend = true,
  yAxisWidth = 44,
}: TimeSeriesChartProps) {
  const theme = useChartTheme();
  const units = Object.fromEntries(series.map((entry) => [entry.key, entry.unit ?? '']));

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" vertical={false} />

          <XAxis
            dataKey="timestamp"
            tickFormatter={(value: string) => formatTime(value)}
            stroke={theme.grid}
            tick={{ fill: theme.axisText, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: theme.grid }}
            minTickGap={28}
          />
          <YAxis
            width={yAxisWidth}
            stroke={theme.grid}
            tick={{ fill: theme.axisText, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            domain={['auto', 'auto']}
          />

          {referenceBand && (
            <ReferenceArea
              y1={referenceBand.min}
              y2={referenceBand.max}
              // Without this Recharts discards bands that fall outside the
              // auto-computed domain, silently hiding the safe range.
              ifOverflow="extendDomain"
              fill={theme.series.success}
              fillOpacity={0.06}
              stroke={theme.series.success}
              strokeOpacity={0.2}
              strokeDasharray="4 4"
            />
          )}

          {referenceLines?.map((line) => (
            <ReferenceLine
              key={`${line.value}-${line.label ?? ''}`}
              y={line.value}
              ifOverflow="extendDomain"
              stroke={theme.series[line.tone ?? 'danger']}
              strokeDasharray="5 4"
              strokeOpacity={0.6}
              strokeWidth={1}
              label={
                line.label
                  ? {
                      value: line.label,
                      position: 'insideTopRight',
                      fill: theme.axisText,
                      fontSize: 10,
                    }
                  : undefined
              }
            />
          ))}

          <Tooltip
            content={<ChartTooltip units={units} />}
            cursor={{ stroke: theme.axis, strokeWidth: 1, strokeDasharray: '3 3' }}
          />

          {showLegend && (
            <Legend
              verticalAlign="top"
              align="right"
              height={28}
              iconType="plainline"
              iconSize={10}
              wrapperStyle={{ fontSize: 11, color: theme.axisText, paddingBottom: 8 }}
            />
          )}

          {series.map((entry) => {
            const colour = theme.series[entry.tone ?? 'brand'];

            return entry.type === 'area' ? (
              <Area
                key={entry.key}
                type="monotone"
                dataKey={entry.key}
                name={entry.label}
                stroke={colour}
                strokeWidth={1.75}
                fill={colour}
                fillOpacity={0.08}
                dot={false}
                activeDot={{ r: 3, strokeWidth: 0 }}
                isAnimationActive={false}
              />
            ) : (
              <Line
                key={entry.key}
                type="monotone"
                dataKey={entry.key}
                name={entry.label}
                stroke={colour}
                strokeWidth={1.75}
                dot={false}
                activeDot={{ r: 3, strokeWidth: 0 }}
                isAnimationActive={false}
              />
            );
          })}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
