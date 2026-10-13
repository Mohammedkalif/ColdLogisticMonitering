import { Code2, Database, GitBranch } from 'lucide-react';
import type { BackendIntegrationInfo } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui';

/**
 * Backend & ML Integration Status — section 10 of the AI Decision Support Center.
 *
 * Purpose: a developer-facing reference showing exactly how the frontend maps to
 * the model service, so backend/ML engineers can wire the real endpoint.
 *
 * Expected API: `PredictionReport.backend` (BackendIntegrationInfo) from
 * `predictionApi.getPredictionReport`. All values are placeholders documenting
 * the intended contract.
 *
 * Future backend integration: the endpoint + payload examples here are the source
 * of truth for the swap from mock to production. Only `predictionApi` changes.
 * Required response fields: backend.{apiEndpoint,requestPayloadExample,responsePayloadExample,mlOutputFields,frontendMapping}.
 */

export interface IntegrationStatusProps {
  backend: BackendIntegrationInfo;
}

export function IntegrationStatus({ backend }: IntegrationStatusProps) {
  return (
    <Card>
      <CardHeader
        title="Backend & ML Integration Status"
        description="Contract reference for connecting the production model service"
      />
      <CardContent className="pt-0">
        <details className="group rounded-control border border-line bg-surface-muted/30">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-xs font-medium text-content-secondary">
            <span className="inline-flex items-center gap-2">
              <Code2 size={14} aria-hidden /> Show integration contract
            </span>
            <span className="text-content-muted transition group-open:rotate-180">▾</span>
          </summary>

          <div className="space-y-5 border-t border-line px-4 py-4">
            <Field icon={<GitBranch size={13} />} label="Prediction API Endpoint">
              <code className="block rounded bg-surface px-3 py-2 text-2xs text-brand">
                {backend.apiEndpoint}
              </code>
            </Field>

            <Field icon={<Database size={13} />} label="Expected Request Payload">
              <pre className="overflow-x-auto rounded bg-surface p-3 text-2xs leading-relaxed text-content-secondary">
                {backend.requestPayloadExample}
              </pre>
            </Field>

            <Field icon={<Database size={13} />} label="Expected Response Payload">
              <pre className="overflow-x-auto rounded bg-surface p-3 text-2xs leading-relaxed text-content-secondary">
                {backend.responsePayloadExample}
              </pre>
            </Field>

            <Field label="ML Output Fields Required">
              <ul className="space-y-1">
                {backend.mlOutputFields.map((field) => (
                  <li
                    key={field}
                    className="flex items-start gap-1.5 text-2xs text-content-secondary"
                  >
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-content-muted" />
                    {field}
                  </li>
                ))}
              </ul>
            </Field>

            <Field label="Frontend Mapping">
              <ul className="space-y-1">
                {backend.frontendMapping.map((map) => (
                  <li
                    key={map}
                    className="flex items-start gap-1.5 text-2xs text-content-secondary"
                  >
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-brand" />
                    {map}
                  </li>
                ))}
              </ul>
            </Field>
          </div>
        </details>
      </CardContent>
    </Card>
  );
}

function Field({
  icon,
  label,
  children,
}: {
  icon?: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1.5 text-2xs font-medium uppercase tracking-wide text-content-muted">
        {icon}
        {label}
      </p>
      {children}
    </div>
  );
}
