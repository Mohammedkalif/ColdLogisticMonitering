import { ArrowRight, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import type { RecommendationItem } from '@/types';
import { getToneStyle } from '@/utils/tone';
import { cn } from '@/utils/cn';
import { Badge, Card, CardContent, CardHeader } from '@/components/ui';

/**
 * AI Recommendations — section 7 of the AI Decision Support Center.
 *
 * Purpose: translate the model verdict into actionable operator guidance.
 *
 * Expected API: `PredictionReport.recommendations` (RecommendationItem[]) from
 * `predictionApi.getPredictionReport`. Each item carries priority / reason /
 * expectedImpact — the component renders them, it never invents guidance.
 *
 * Future backend integration: replace the mock builder; keep the item contract.
 * Required response fields: recommendations[].{priority,title,reason,expectedImpact}.
 */

const PRIORITY_META = {
  high: { tone: 'danger' as const, icon: AlertTriangle, label: 'High priority' },
  medium: { tone: 'warning' as const, icon: Info, label: 'Medium priority' },
  low: { tone: 'info' as const, icon: CheckCircle2, label: 'Low priority' },
};

export interface RecommendationsProps {
  recommendations: RecommendationItem[];
}

export function Recommendations({ recommendations }: RecommendationsProps) {
  return (
    <Card>
      <CardHeader
        title="AI Recommendations"
        description="Suggested actions to reduce spoilage risk"
      />
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {recommendations.map((item) => {
            const meta = PRIORITY_META[item.priority];
            const toneStyle = getToneStyle(meta.tone);
            const Icon = meta.icon;
            return (
              <div
                key={item.id}
                className="flex flex-col rounded-card border border-line bg-surface p-4 shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-elevated"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-content-primary">
                    <Icon size={14} className={cn('shrink-0', toneStyle.text)} aria-hidden />
                    {item.title}
                  </p>
                  <Badge tone={meta.tone} withDot>
                    {meta.label}
                  </Badge>
                </div>
                <p className="mt-2 text-2xs leading-relaxed text-content-muted">{item.reason}</p>
                <div
                  className={cn(
                    'mt-3 flex items-center gap-1.5 border-t border-line pt-3 text-2xs',
                    toneStyle.text,
                  )}
                >
                  <ArrowRight size={13} aria-hidden />
                  <span className="font-medium">{item.expectedImpact}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
