import { useId } from 'react';
import { Area, AreaChart, ResponsiveContainer, YAxis } from 'recharts';
import type { StatusTone, TimeSeriesPoint } from '@/types';
import { cn } from '@/utils/cn';
import { useChartTheme } from './useChartTheme';

export interface SparklineProps {
  data: TimeSeriesPoint[];
  tone?: StatusTone;
  height?: number;
  className?: string;
}

/**
 * Minimal trend line for KPI cards.
 *
 * Deliberately axis-free and non-interactive: it conveys shape only, so it
 * never competes with the headline figure beside it.
 */
export function Sparkline({ data, tone = 'brand', height = 40, className }: SparklineProps) {
  const theme = useChartTheme();
  const gradientId = useId();

  if (data.length === 0) return null;

  const colour = theme.series[tone];

  return (
    <div className={cn('w-full', className)} style={{ height }} aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colour} stopOpacity={0.22} />
              <stop offset="100%" stopColor={colour} stopOpacity={0} />
            </linearGradient>
          </defs>
          {/* Padded domain keeps the stroke clear of the card edges. */}
          <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={colour}
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
