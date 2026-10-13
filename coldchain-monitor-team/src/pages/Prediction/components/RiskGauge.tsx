import type { RiskGaugeData, StatusTone } from '@/types';
import { formatDurationHours } from '@/utils/format';
import { getToneStyle } from '@/utils/tone';
import { cn } from '@/utils/cn';
import { Card, CardContent, CardHeader } from '@/components/ui';

/**
 * Spoilage Risk Analysis — section 3 of the AI Decision Support Center.
 *
 * Purpose: a single composite risk score with a five-band category scale
 * (Safe / Low / Medium / High / Critical) so operators can read severity at a glance.
 *
 * Expected API: `PredictionReport.risk` (RiskGaugeData) from
 * `predictionApi.getPredictionReport`. The `scale` defines the category bands;
 * `riskPercentage` + `healthCategory` colour the gauge.
 *
 * Future backend integration: riskPercentage / healthCategory are produced by the
 * model; replace the mock builder, not this component.
 * Required response fields: risk.{riskPercentage,healthCategory,estimatedTimeBeforeSpoilageHours,scale[]}.
 */

const RADIUS = 58;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/* Static stroke classes so Tailwind can see them at build time. */
const STROKE: Record<StatusTone, string> = {
  success: 'stroke-success',
  warning: 'stroke-warning',
  danger: 'stroke-danger',
  info: 'stroke-info',
  brand: 'stroke-brand',
  neutral: 'stroke-content-muted',
};

export interface RiskGaugeProps {
  risk: RiskGaugeData;
}

export function RiskGauge({ risk }: RiskGaugeProps) {
  const toneStyle = getToneStyle(
    risk.healthCategory === 'low'
      ? 'success'
      : risk.healthCategory === 'moderate'
        ? 'warning'
        : 'danger',
  );
  const strokeClass =
    STROKE[
      risk.healthCategory === 'low'
        ? 'success'
        : risk.healthCategory === 'moderate'
          ? 'warning'
          : 'danger'
    ];
  const offset = CIRCUMFERENCE * (1 - risk.riskPercentage / 100);
  const activeIndex = risk.scale.findIndex(
    (band) => risk.riskPercentage >= band.fromPct && risk.riskPercentage < band.toPct,
  );
  const activeBand = activeIndex >= 0 ? risk.scale[activeIndex] : risk.scale[risk.scale.length - 1];

  return (
    <Card>
      <CardHeader
        title="Spoilage Risk Analysis"
        description="Composite risk score and health band"
      />
      <CardContent className="pt-0">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="relative h-[148px] w-[148px] shrink-0">
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
                className={cn(strokeClass)}
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 500ms cubic-bezier(0.4,0,0.2,1)' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="tabular text-4xl font-semibold leading-none tracking-tight text-content-primary">
                {risk.riskPercentage}
              </span>
              <span className="mt-1 text-2xs uppercase tracking-wide text-content-muted">
                Risk %
              </span>
            </div>
          </div>

          <div className="w-full min-w-0">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-control border border-line bg-surface-muted/40 p-3">
                <p className="text-2xs uppercase tracking-wide text-content-muted">
                  Health Category
                </p>
                <p className={cn('mt-1 text-sm font-semibold', toneStyle.text)}>
                  {activeBand.label}
                </p>
              </div>
              <div className="rounded-control border border-line bg-surface-muted/40 p-3">
                <p className="text-2xs uppercase tracking-wide text-content-muted">
                  Time Before Spoilage
                </p>
                <p className="tabular mt-1 text-sm font-semibold text-content-primary">
                  {formatDurationHours(risk.estimatedTimeBeforeSpoilageHours)}
                </p>
              </div>
            </div>

            <div className="mt-3">
              <div className="flex overflow-hidden rounded-control border border-line">
                {risk.scale.map((band, index) => {
                  const bandStyle = getToneStyle(band.tone);
                  const isActive = index === activeIndex;
                  return (
                    <div
                      key={band.label}
                      className={cn(
                        'flex-1 px-1 py-1.5 text-center text-[0.625rem] font-medium',
                        isActive ? bandStyle.badge : 'bg-surface-muted text-content-muted',
                      )}
                    >
                      {band.label}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
