import { motion, useReducedMotion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  Droplets,
  Gauge,
  Minus,
  Thermometer,
  type LucideIcon,
} from 'lucide-react';
import type { PredictionKpi, PredictionSummary as Summary } from '@/types';
import { useCountUp } from '@/hooks/useCountUp';
import { formatNumber } from '@/utils/format';
import { formatTimeAgoShort } from '@/utils/date';
import { getToneStyle } from '@/utils/tone';
import { cn } from '@/utils/cn';
import { Badge, Card, CardContent, CardHeader } from '@/components/ui';

/**
 * AI Prediction Summary — section 2 of the AI Decision Support Center.
 *
 * Purpose: headline KPI cards that communicate the model's core verdict.
 *
 * Expected API: `PredictionReport.summary` (PredictionSummary) returned by
 * `predictionApi.getPredictionReport`. Each KPI is pre-shaped by the service
 * layer (value, unit, tone, statusLabel, trend, updatedAt). Components never
 * hardcode prediction values.
 *
 * Future backend integration: the service replaces the mock `buildPredictionReport`
 * with the real model response; this component is unchanged.
 * Required response fields: summary.kpis[].{value,unit,tone,statusLabel,trend,updatedAt}.
 */

const KPI_ICONS: Record<string, LucideIcon> = {
  temp: Thermometer,
  hum: Droplets,
  spoil: AlertTriangle,
  conf: Gauge,
  excursion: Clock,
  status: Activity,
};

const TREND_ICON = { up: ArrowUpRight, down: ArrowDownRight, flat: Minus } as const;

function KpiCard({ kpi, index }: { kpi: PredictionKpi; index: number }) {
  const Icon = KPI_ICONS[kpi.key] ?? Activity;
  const toneStyle = getToneStyle(kpi.tone);
  const reduce = useReducedMotion();
  const isNumeric = typeof kpi.numericValue === 'number';
  const animated = useCountUp(isNumeric ? kpi.numericValue! : 0, {
    precision: kpi.precision ?? 0,
    enabled: isNumeric,
  });
  const display = isNumeric ? formatNumber(animated, kpi.precision ?? 0) : kpi.value;
  const TrendIcon = kpi.trend ? TREND_ICON[kpi.trend.direction] : null;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: 'easeOut', delay: Math.min(index * 0.03, 0.18) }}
    >
      <div className="flex h-full flex-col rounded-card border border-line bg-surface p-4 shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-elevated">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-md',
                toneStyle.iconSurface,
              )}
            >
              <Icon size={14} aria-hidden />
            </span>
            <p className="truncate text-xs font-medium text-content-muted">{kpi.label}</p>
          </div>
          {TrendIcon && kpi.trend && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 text-2xs font-medium',
                toneStyle.text,
              )}
            >
              <TrendIcon size={12} aria-hidden />
              {kpi.trend.value}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-end justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1">
              <span className="tabular text-2xl font-semibold leading-none tracking-tight text-content-primary">
                {display}
              </span>
              {kpi.unit && (
                <span className="text-sm font-medium text-content-muted">{kpi.unit}</span>
              )}
            </div>
            <Badge tone={kpi.tone} className="mt-2">
              {kpi.statusLabel}
            </Badge>
          </div>
        </div>

        <p className="mt-3 border-t border-line pt-2 text-2xs text-content-muted">
          Updated {formatTimeAgoShort(kpi.updatedAt)}
        </p>
      </div>
    </motion.div>
  );
}

export interface PredictionSummaryProps {
  summary: Summary;
}

export function PredictionSummary({ summary }: PredictionSummaryProps) {
  return (
    <Card>
      <CardHeader
        title="AI Prediction Summary"
        description="Model verdict for the selected consignment"
      />
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {summary.kpis.map((kpi, index) => (
            <KpiCard key={kpi.key} kpi={kpi} index={index} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
