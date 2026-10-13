import { Info } from 'lucide-react';
import type { ConfidenceMetricsData } from '@/types';
import { useCountUp } from '@/hooks/useCountUp';
import { formatNumber } from '@/utils/format';
import { cn } from '@/utils/cn';
import { Card, CardContent, CardHeader, ProgressBar, Tooltip } from '@/components/ui';

/**
 * Prediction Confidence — section 5 of the AI Decision Support Center.
 *
 * Purpose: explain how much the model trusts this specific inference and why.
 *
 * Expected API: `PredictionReport.confidence` (ConfidenceMetricsData) from
 * `predictionApi.getPredictionReport`. Each metric carries its own `description`
 * (shown in a tooltip) so the UI stays free of hard-coded explanatory text.
 *
 * Future backend integration: confidencePct + the four sub-metrics are returned
 * by the model service; replace the mock builder, not this component.
 * Required response fields: confidence.{confidencePct,metrics[].{value,tone,description}}.
 */

export interface ConfidenceMetricsProps {
  confidence: ConfidenceMetricsData;
}

export function ConfidenceMetrics({ confidence }: ConfidenceMetricsProps) {
  const animated = useCountUp(confidence.confidencePct, { precision: 0 });

  return (
    <Card>
      <CardHeader
        title="Prediction Confidence"
        description="Trust and quality signals for this inference"
      />
      <CardContent className="pt-0">
        <div className="flex items-end justify-between gap-3 border-b border-line pb-4">
          <div>
            <p className="text-2xs uppercase tracking-wide text-content-muted">Confidence</p>
            <p className="tabular text-3xl font-semibold tracking-tight text-content-primary">
              {formatNumber(animated, 0)}%
            </p>
          </div>
          <p className="text-2xs text-content-muted">Higher is better</p>
        </div>

        <dl className="mt-4 space-y-3">
          {confidence.metrics.map((metric) => (
            <div key={metric.key}>
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 text-content-secondary">
                  {metric.label}
                  <Tooltip content={metric.description}>
                    <span className="inline-flex cursor-help text-content-muted">
                      <Info size={12} aria-hidden />
                    </span>
                  </Tooltip>
                </span>
                <span className="tabular font-medium text-content-primary">{metric.value}%</span>
              </div>
              <ProgressBar value={metric.value} tone={metric.tone} className={cn('mt-1.5')} />
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
