import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDownRight, ArrowRight, ArrowUpRight, type LucideIcon } from 'lucide-react';
import type { DashboardMetric, TrendDirection } from '@/types';
import { useCountUp } from '@/hooks/useCountUp';
import { cn } from '@/utils/cn';
import { formatNumber } from '@/utils/format';
import { getToneStyle } from '@/utils/tone';
import { formatTimeAgoShort } from '@/utils/date';
import { Badge, Card, ProgressBar, Skeleton } from '@/components/ui';
import { Sparkline } from '@/components/charts';
import { metricIcons } from './metricIcons';

const trendIcons: Record<TrendDirection, LucideIcon> = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  flat: ArrowRight,
};

export interface MetricCardProps {
  metric: DashboardMetric;
  /** Override the default icon derived from `metric.key`. */
  icon?: LucideIcon;
  /** Stagger index for the mount fade-in. */
  index?: number;
  className?: string;
}

/**
 * Headline KPI tile.
 *
 * Purely presentational — values, tone, trend, sparkline and timestamps all
 * arrive pre-computed from the service layer, so the card never contains
 * business logic. Every enhanced field is optional: a metric without
 * `sparkline`/`statusLabel`/`updatedAt` still renders correctly.
 */
export function MetricCard({ metric, icon, index = 0, className }: MetricCardProps) {
  const Icon = icon ?? metricIcons[metric.key];
  const tone = getToneStyle(metric.tone);
  const TrendIcon = metric.trend ? trendIcons[metric.trend.direction] : null;
  const shouldReduceMotion = useReducedMotion();

  /* Count up only when the service supplies a numeric companion value. */
  const animated = useCountUp(metric.numericValue ?? 0, {
    precision: metric.precision ?? 0,
    enabled: metric.numericValue !== undefined,
  });

  const displayValue =
    metric.numericValue !== undefined
      ? formatNumber(animated, metric.precision ?? 0)
      : metric.value;

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: 'easeOut', delay: Math.min(index * 0.04, 0.24) }}
    >
      <Card
        className={cn(
          'group h-full p-5 transition duration-200',
          'hover:-translate-y-0.5 hover:border-line-strong hover:shadow-elevated',
          className,
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-control',
                tone.iconSurface,
              )}
            >
              <Icon size={17} aria-hidden />
            </span>
            <p className="truncate text-xs font-medium uppercase tracking-wide text-content-muted">
              {metric.label}
            </p>
          </div>

          {metric.statusLabel && (
            <Badge tone={metric.tone} withDot className="shrink-0">
              {metric.statusLabel}
            </Badge>
          )}
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="tabular text-[1.75rem] font-semibold leading-none tracking-tight text-content-primary">
                {displayValue}
              </span>
              {metric.unit && (
                <span className="truncate text-sm font-medium text-content-muted">
                  {metric.unit}
                </span>
              )}
            </div>

            {metric.trend && TrendIcon && (
              <div className="mt-2 flex items-center gap-1.5 text-xs">
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 font-medium',
                    metric.trend.direction === 'flat' ? 'text-content-muted' : tone.text,
                  )}
                >
                  <TrendIcon size={13} aria-hidden />
                  <span className="tabular">{metric.trend.value}</span>
                </span>
                <span className="truncate text-content-muted">{metric.trend.label}</span>
              </div>
            )}
          </div>

          {metric.sparkline && metric.sparkline.length > 0 && (
            <Sparkline
              data={metric.sparkline}
              tone={metric.tone}
              height={38}
              className="w-20 shrink-0 sm:w-24"
            />
          )}
        </div>

        {metric.progressPct !== undefined && (
          <ProgressBar
            value={metric.progressPct}
            tone={metric.tone}
            className="mt-4"
            label={metric.label}
          />
        )}

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3">
          <p className="truncate text-2xs text-content-muted">{metric.caption}</p>
          {metric.updatedAt && (
            <span className="tabular shrink-0 text-2xs text-content-muted">
              {formatTimeAgoShort(metric.updatedAt)} ago
            </span>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

/** Loading placeholder with the same footprint as `MetricCard`. */
export function MetricCardSkeleton() {
  return (
    <Card className="h-full p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-9 w-9 rounded-control" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="h-9 w-20 sm:w-24" />
      </div>
      <div className="mt-4 border-t border-line pt-3">
        <Skeleton className="h-3 w-full" />
      </div>
    </Card>
  );
}
