import type { ModelDetails, ModelInfo } from '@/types';
import { formatDate } from '@/utils/date';
import { Card, CardContent, CardHeader } from '@/components/ui';

/**
 * Model Information — section 9 of the AI Decision Support Center.
 *
 * Purpose: provenance panel so operators know which model produced a score and
 * what it consumes / emits.
 *
 * Expected API: `PredictionReport.model` (ModelInfo) + `PredictionReport.modelDetails`
 * (ModelDetails) from `predictionApi.getPredictionReport`. All values are mock
 * placeholders supplied by the service layer — never hard-coded in the component.
 *
 * Future backend integration: model + details come from `/models/active` (or the
 * report payload); replace the mock builder, not this component.
 * Required response fields: model.{name,version,trainedAt,...} + modelDetails.{predictionWindow,inputFeatures,outputVariables,trainingDataset}.
 */

export interface ModelInformationProps {
  model: ModelInfo;
  modelDetails: ModelDetails;
}

export function ModelInformation({ model, modelDetails }: ModelInformationProps) {
  return (
    <Card>
      <CardHeader
        title="Model Information"
        description="Provenance and I/O contract of the active model"
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-2xs font-medium text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> {model.status}
          </span>
        }
      />
      <CardContent className="space-y-4 pt-0">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
          <Detail label="Model Name" value={model.name} />
          <Detail label="Model Version" value={model.version} />
          <Detail label="Last Updated" value={formatDate(model.trainedAt)} />
          <Detail label="Prediction Window" value={modelDetails.predictionWindow} />
        </div>

        <Detail label="Algorithm" value={model.algorithm} />

        <div>
          <p className="mb-1.5 text-2xs uppercase tracking-wide text-content-muted">
            Input Features
          </p>
          <div className="flex flex-wrap gap-1.5">
            {modelDetails.inputFeatures.map((feature) => (
              <span
                key={feature}
                className="rounded-full border border-line bg-surface-muted px-2 py-0.5 text-2xs text-content-secondary"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-2xs uppercase tracking-wide text-content-muted">
            Output Variables
          </p>
          <div className="flex flex-wrap gap-1.5">
            {modelDetails.outputVariables.map((variable) => (
              <span
                key={variable}
                className="rounded-full border border-brand/30 bg-brand/10 px-2 py-0.5 text-2xs text-brand"
              >
                {variable}
              </span>
            ))}
          </div>
        </div>

        <Detail label="Training Dataset" value={modelDetails.trainingDataset} />
      </CardContent>
    </Card>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-2xs uppercase tracking-wide text-content-muted">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-content-primary">{value}</p>
    </div>
  );
}
