import type { ReactNode } from 'react';
import type { IntegrationSettings as IntegrationSettingsValue, ModelInfo } from '@/types';
import { env } from '@/utils/env';
import { modelStatusMeta } from '@/utils/domain';
import { formatDateTime } from '@/utils/date';
import { formatNumber, formatProbability } from '@/utils/format';
import { FormField, FormSection } from '@/components/forms';
import { Badge, Input, Skeleton } from '@/components/ui';
import type { IntegrationFieldKey } from '../validation';

export interface IntegrationSettingsProps {
  value: IntegrationSettingsValue;
  onChange: (patch: Partial<IntegrationSettingsValue>) => void;
  /** Field-level errors derived from the current draft. */
  errors?: Partial<Record<IntegrationFieldKey, string>>;
  /** Registered model metadata from `GET /models/active` (read-only). */
  model?: ModelInfo | null;
  isModelLoading?: boolean;
}

function StatusCell({ label, value, badge }: { label: string; value: string; badge?: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-2xs font-semibold uppercase tracking-wide text-content-muted">{label}</p>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <span className="truncate font-mono text-xs text-content-primary">{value}</span>
        {badge}
      </div>
    </div>
  );
}

/**
 * Backend & ML integration overview.
 *
 * Runtime connection facts (data source, base URL, cadence) come from the
 * build-time environment and are shown read-only; persisted endpoint records
 * are editable through the draft/save flow. No connectivity checks, secrets
 * or credentials are handled here — the frontend never touches tokens.
 */
export function IntegrationSettings({
  value,
  onChange,
  errors = {},
  model,
  isModelLoading = false,
}: IntegrationSettingsProps) {
  const modelStatus = model ? modelStatusMeta[model.status] : null;

  return (
    <div className="space-y-6">
      {/* Runtime status — derived from the environment, read-only */}
      <div className="space-y-3 rounded-card border border-line bg-surface-muted/40 px-4 py-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatusCell
            label="Data source"
            value={env.useMockApi ? 'Mock services' : 'Live API'}
            badge={
              <Badge tone={env.useMockApi ? 'warning' : 'success'} withDot>
                {env.useMockApi ? 'Mock' : 'Live'}
              </Badge>
            }
          />
          <StatusCell label="API base URL" value={env.apiBaseUrl} />
          <StatusCell label="Telemetry cadence" value={`${env.telemetryPollIntervalMs} ms`} />
          <StatusCell
            label="Credentials"
            value="Environment-managed"
            badge={<Badge tone="neutral">Never displayed</Badge>}
          />
        </div>
        <p className="text-2xs leading-relaxed text-content-muted">
          Runtime mode is controlled by <code className="font-mono">VITE_USE_MOCK_API</code> and{' '}
          <code className="font-mono">VITE_API_BASE_URL</code> in{' '}
          <code className="font-mono">.env.local</code>. The persisted values below are the
          workspace record surfaced to the backend — flipping the env vars switches every service
          without UI changes.
        </p>
      </div>

      <FormSection
        title="API endpoints"
        description="Workspace integration record persisted via PATCH /settings."
      >
        <FormField
          label="API base URL"
          htmlFor="apiBaseUrl"
          hint="Mirrors VITE_API_BASE_URL for this workspace."
          error={errors.apiBaseUrl}
        >
          <Input
            id="apiBaseUrl"
            value={value.apiBaseUrl}
            hasError={Boolean(errors.apiBaseUrl)}
            aria-invalid={Boolean(errors.apiBaseUrl)}
            onChange={(event) => onChange({ apiBaseUrl: event.target.value })}
          />
        </FormField>

        <FormField
          label="Model inference path"
          htmlFor="modelEndpoint"
          hint="Relative to the API base URL, or a full URL."
          error={errors.modelEndpoint}
        >
          <Input
            id="modelEndpoint"
            value={value.modelEndpoint}
            hasError={Boolean(errors.modelEndpoint)}
            aria-invalid={Boolean(errors.modelEndpoint)}
            onChange={(event) => onChange({ modelEndpoint: event.target.value })}
          />
        </FormField>

        <FormField
          label="Telemetry poll interval"
          htmlFor="telemetryPollIntervalMs"
          hint="Used by Live Monitoring until streaming is available (1000–60000 ms)."
          error={errors.telemetryPollIntervalMs}
        >
          <Input
            id="telemetryPollIntervalMs"
            type="number"
            min={1000}
            max={60000}
            step={500}
            suffix="ms"
            value={
              Number.isFinite(value.telemetryPollIntervalMs) ? value.telemetryPollIntervalMs : ''
            }
            hasError={Boolean(errors.telemetryPollIntervalMs)}
            aria-invalid={Boolean(errors.telemetryPollIntervalMs)}
            onChange={(event) => onChange({ telemetryPollIntervalMs: Number(event.target.value) })}
          />
        </FormField>

        <FormField
          label="Alert webhook"
          htmlFor="webhookUrl"
          hint="POSTed on every critical alert. Leave empty to disable."
          error={errors.webhookUrl}
        >
          <Input
            id="webhookUrl"
            value={value.webhookUrl}
            hasError={Boolean(errors.webhookUrl)}
            aria-invalid={Boolean(errors.webhookUrl)}
            onChange={(event) => onChange({ webhookUrl: event.target.value })}
          />
        </FormField>
      </FormSection>

      <FormSection
        title="Spoilage model"
        description="Registered model metadata from GET /models/active. Retraining and model configuration are managed by the ML platform."
      >
        {isModelLoading ? (
          <div className="space-y-2.5">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-3.5 w-full max-w-sm" />
            ))}
          </div>
        ) : model && modelStatus ? (
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            <div>
              <dt className="text-2xs font-semibold uppercase tracking-wide text-content-muted">
                Model
              </dt>
              <dd className="mt-1 text-sm text-content-primary">{model.name}</dd>
            </div>
            <div>
              <dt className="text-2xs font-semibold uppercase tracking-wide text-content-muted">
                Version
              </dt>
              <dd className="mt-1">
                <Badge tone="brand">{model.version}</Badge>
              </dd>
            </div>
            <div>
              <dt className="text-2xs font-semibold uppercase tracking-wide text-content-muted">
                Algorithm
              </dt>
              <dd className="mt-1 text-sm text-content-secondary">{model.algorithm}</dd>
            </div>
            <div>
              <dt className="text-2xs font-semibold uppercase tracking-wide text-content-muted">
                Status
              </dt>
              <dd className="mt-1">
                <Badge tone={modelStatus.tone} withDot>
                  {modelStatus.label}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-2xs font-semibold uppercase tracking-wide text-content-muted">
                Trained at
              </dt>
              <dd className="tabular mt-1 text-sm text-content-secondary">
                {formatDateTime(model.trainedAt)}
              </dd>
            </div>
            <div>
              <dt className="text-2xs font-semibold uppercase tracking-wide text-content-muted">
                Inference latency
              </dt>
              <dd className="tabular mt-1 text-sm text-content-secondary">
                {formatNumber(model.inferenceLatencyMs)} ms
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-2xs font-semibold uppercase tracking-wide text-content-muted">
                Validation metrics
              </dt>
              <dd className="tabular mt-1 text-sm text-content-secondary">
                Accuracy {formatProbability(model.accuracy)} · F1 {formatProbability(model.f1Score)}{' '}
                · ROC-AUC {formatProbability(model.rocAuc)} · {formatNumber(model.trainingSamples)}{' '}
                training samples
              </dd>
            </div>
          </dl>
        ) : (
          <p className="text-xs text-content-muted">
            Model metadata is unavailable until the ML service exposes GET /models/active.
          </p>
        )}
      </FormSection>
    </div>
  );
}
