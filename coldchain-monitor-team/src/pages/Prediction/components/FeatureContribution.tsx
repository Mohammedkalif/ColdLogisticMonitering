import type { FeatureContributionItem } from '@/types';
import { cn } from '@/utils/cn';
import { getToneStyle } from '@/utils/tone';
import { Card, CardContent, CardHeader } from '@/components/ui';

/**
 * Feature Contribution — section 6 of the AI Decision Support Center.
 *
 * Purpose: show which inputs drive the prediction (model explainability).
 *
 * Expected API: `PredictionReport.featureContributions` (FeatureContributionItem[])
 * from `predictionApi.getPredictionReport`. Sorted by importance at render time.
 *
 * Future backend integration: importances are supplied by the model's
 * explainer (e.g. SHAP); replace the mock builder, not this component.
 * Required response fields: featureContributions[].{label,importance,tone}.
 */

export interface FeatureContributionProps {
  contributions: FeatureContributionItem[];
}

export function FeatureContribution({ contributions }: FeatureContributionProps) {
  const sorted = [...contributions].sort((a, b) => b.importance - a.importance);
  const max = Math.max(...sorted.map((item) => item.importance), 1);

  return (
    <Card>
      <CardHeader
        title="Feature Contribution"
        description="Relative driver weight behind the prediction"
      />
      <CardContent className="pt-0">
        <div className="space-y-3">
          {sorted.map((item) => {
            const toneStyle = getToneStyle(item.tone);
            const width = Math.round((item.importance / max) * 100);
            return (
              <div key={item.feature}>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-content-secondary">{item.label}</span>
                  <span className="tabular font-medium text-content-primary">
                    {item.importance}%
                  </span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-surface-hover">
                  <div
                    className={cn('h-full rounded-full', toneStyle.bar)}
                    style={{
                      width: `${width}%`,
                      transition: 'width 500ms cubic-bezier(0.4,0,0.2,1)',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-4 border-t border-line pt-3 text-2xs text-content-muted">
          These values are placeholders and will be supplied by the backend AI service.
        </p>
      </CardContent>
    </Card>
  );
}
