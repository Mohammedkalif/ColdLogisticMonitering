import { motion, useReducedMotion } from 'framer-motion';
import type { HealthScoreBreakdown, StatusTone } from '@/types';
import { useCountUp } from '@/hooks/useCountUp';
import { formatNumber } from '@/utils/format';
import { cn } from '@/utils/cn';
import { Badge, Card, CardContent, CardHeader, ProgressBar, StatusDot } from '@/components';

/**
 * Cold Chain Health Score — section 4 of the Cold Chain Operations Center.
 *
 * Purpose: a single composite cargo-condition score plus the four drivers
 * behind it.
 *
 * Expected API response: `LiveMonitoringFrame.healthScore`
 * (HealthScoreBreakdown). The `overall` and each sub-score are 0-100; `tone`
 * colours the whole widget.
 *
 * Future ML integration: `predictionReadiness` is the hook for a model
 * confidence score; the composite can later blend live sensor stability with
 * the prediction service output.
 */

const STROKE: Record<StatusTone, string> = {
  success: 'stroke-success',
  warning: 'stroke-warning',
  danger: 'stroke-danger',
  info: 'stroke-info',
  brand: 'stroke-brand',
  neutral: 'stroke-content-muted',
};

const STATUS_LABEL: Record<StatusTone, string> = {
  success: 'Healthy',
  warning: 'Degraded',
  danger: 'Critical',
  info: 'Info',
  brand: 'Nominal',
  neutral: 'Unknown',
};

function scoreTone(value: number): StatusTone {
  return value >= 75 ? 'success' : value >= 50 ? 'warning' : 'danger';
}

const RADIUS = 58;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export interface HealthScoreGaugeProps {
  score: HealthScoreBreakdown;
  live: boolean;
  isLoading?: boolean;
}

export function HealthScoreGauge({ score, live, isLoading = false }: HealthScoreGaugeProps) {
  const shouldReduceMotion = useReducedMotion();
  const animated = useCountUp(score.overall, { precision: 0, enabled: !isLoading });
  const offset = CIRCUMFERENCE * (1 - score.overall / 100);

  const subScores = [
    { label: 'Temperature Stability', value: score.temperatureStability },
    { label: 'Humidity Stability', value: score.humidityStability },
    { label: 'Sensor Reliability', value: score.sensorReliability },
    { label: 'Prediction Readiness', value: score.predictionReadiness },
  ];

  return (
    <Card>
      <CardHeader
        title="Cold Chain Health"
        description="Composite cargo condition score"
        actions={<StatusDot tone={score.tone} pulse={live} />}
      />
      <CardContent className="pt-0">
        <div className="flex flex-col items-center">
          <div className="relative h-[148px] w-[148px]">
            <svg viewBox="0 0 148 148" className="h-full w-full -rotate-90" aria-hidden>
              <circle
                cx="74"
                cy="74"
                r={RADIUS}
                fill="none"
                strokeWidth="12"
                className="stroke-surface-hover"
              />
              <circle
                cx="74"
                cy="74"
                r={RADIUS}
                fill="none"
                strokeWidth="12"
                strokeLinecap="round"
                className={cn(STROKE[score.tone])}
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={isLoading ? CIRCUMFERENCE : offset}
                style={{ transition: 'stroke-dashoffset 500ms cubic-bezier(0.4,0,0.2,1)' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="tabular text-4xl font-semibold leading-none tracking-tight text-content-primary">
                {isLoading ? '—' : formatNumber(animated, 0)}
              </span>
              <span className="mt-1 text-2xs uppercase tracking-wide text-content-muted">
                Health
              </span>
            </div>
          </div>

          <Badge tone={score.tone} withDot className="mt-3">
            {STATUS_LABEL[score.tone]}
          </Badge>
        </div>

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="mt-4 space-y-3"
        >
          {subScores.map((sub) => (
            <div key={sub.label}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-content-secondary">{sub.label}</span>
                <span className="tabular font-medium text-content-primary">{sub.value}</span>
              </div>
              <ProgressBar value={sub.value} tone={scoreTone(sub.value)} />
            </div>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  );
}
