import type { PredictionHistoryItem } from '@/types';
import { riskLevelMeta } from '@/utils/domain';
import { formatDateTime } from '@/utils/date';
import { formatProbability } from '@/utils/format';
import { Badge, Card, CardContent, CardHeader, DataTable } from '@/components';

/**
 * Prediction History Preview — section 8 of the AI Decision Support Center.
 *
 * Purpose: compact table of recent predictions for this consignment fleet.
 *
 * Expected API: `PredictionReport.history` (PredictionHistoryItem[]) from
 * `predictionApi.getPredictionReport`. The same shape is intended for the
 * dedicated backend history endpoint (`GET /predictions`) — swap the source later.
 *
 * Future backend integration: replace the mock history with the paginated
 * history API; the column contract stays identical.
 * Required response fields: history[].{predictionTime,shipmentCode,risk,confidence,outcome}.
 */

const OUTCOME_META: Record<
  PredictionHistoryItem['outcome'],
  { tone: 'success' | 'warning' | 'danger' | 'neutral'; label: string }
> = {
  accepted: { tone: 'success', label: 'Accepted' },
  partial_loss: { tone: 'warning', label: 'Partial loss' },
  rejected: { tone: 'danger', label: 'Rejected' },
  pending: { tone: 'neutral', label: 'Pending' },
};

export interface PredictionHistoryProps {
  history: PredictionHistoryItem[];
}

export function PredictionHistory({ history }: PredictionHistoryProps) {
  return (
    <Card>
      <CardHeader
        title="Prediction History Preview"
        description="Recent inferences across the fleet (backend history API pending)"
      />
      <CardContent className="pt-0">
        <DataTable<PredictionHistoryItem>
          data={history}
          rowKey={(row) => row.id}
          stickyHeader
          defaultSort={{ columnId: 'predictionTime', direction: 'desc' }}
          columns={[
            {
              id: 'predictionTime',
              header: 'Prediction Time',
              sortAccessor: (row) => new Date(row.predictionTime).getTime(),
              cell: (row) => (
                <span className="tabular text-content-secondary">
                  {formatDateTime(row.predictionTime)}
                </span>
              ),
            },
            {
              id: 'shipmentCode',
              header: 'Shipment',
              sortAccessor: (row) => row.shipmentCode,
              cell: (row) => (
                <span className="font-medium text-content-primary">{row.shipmentCode}</span>
              ),
            },
            {
              id: 'risk',
              header: 'Risk',
              sortAccessor: (row) => row.risk,
              cell: (row) => {
                const meta = riskLevelMeta[row.risk];
                return (
                  <Badge tone={meta.tone} withDot>
                    {meta.label}
                  </Badge>
                );
              },
            },
            {
              id: 'confidence',
              header: 'Confidence',
              align: 'right',
              sortAccessor: (row) => row.confidence,
              cell: (row) => (
                <span className="tabular text-content-secondary">
                  {formatProbability(row.confidence)}
                </span>
              ),
            },
            {
              id: 'outcome',
              header: 'Outcome',
              sortAccessor: (row) => row.outcome,
              cell: (row) => {
                const meta = OUTCOME_META[row.outcome];
                return (
                  <Badge tone={meta.tone} withDot>
                    {meta.label}
                  </Badge>
                );
              },
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}
