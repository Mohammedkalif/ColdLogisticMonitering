import { useMemo, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import type { CommodityType, ThresholdRule } from '@/types';
import { commodityLabels } from '@/utils/domain';
import { formatProbability } from '@/utils/format';
import { FormField } from '@/components/forms';
import { DataTable, type DataTableColumn } from '@/components/tables';
import { Badge, EmptyState, Input, Select } from '@/components/ui';
import type { ThresholdRuleErrors } from '../validation';

export interface ThresholdSettingsProps {
  rules: ThresholdRule[];
  isLoading: boolean;
  /** Field-level errors per commodity, derived from the current draft. */
  errors: Partial<Record<CommodityType, ThresholdRuleErrors>>;
  /** Patches the draft rule for one commodity — persistence stays page-level. */
  onChange: (commodity: CommodityType, patch: Partial<ThresholdRule>) => void;
}

/** Number input that renders an empty field instead of React's NaN warning. */
const numericValue = (value: number): number | string => (Number.isFinite(value) ? value : '');

/**
 * Per-commodity operating bands enforced by the alerting engine.
 *
 * Editing happens against the page draft; saving goes through the standard
 * `PATCH /settings` flow — this component never persists anything itself.
 */
export function ThresholdSettings({ rules, isLoading, errors, onChange }: ThresholdSettingsProps) {
  const commodityOptions = useMemo(
    () =>
      rules.map((rule) => ({
        value: rule.commodity,
        label: commodityLabels[rule.commodity],
      })),
    [rules],
  );

  const [selected, setSelected] = useState<CommodityType | null>(null);
  const selectedCommodity = selected ?? rules[0]?.commodity ?? null;
  const rule = rules.find((candidate) => candidate.commodity === selectedCommodity);
  const ruleErrors = (selectedCommodity && errors[selectedCommodity]) || {};

  const columns: DataTableColumn<ThresholdRule>[] = [
    {
      id: 'commodity',
      header: 'Commodity',
      cell: (row) => (
        <span className="text-sm font-medium text-content-primary">
          {commodityLabels[row.commodity]}
        </span>
      ),
    },
    {
      id: 'temperature',
      header: 'Temperature band',
      align: 'right',
      cell: (row) => (
        <span className="tabular text-xs text-content-secondary">
          {numericValue(row.minTemperatureC)} °C – {numericValue(row.maxTemperatureC)} °C
        </span>
      ),
    },
    {
      id: 'humidity',
      header: 'Humidity band',
      align: 'right',
      hideBelow: 'sm',
      cell: (row) => (
        <span className="tabular text-xs text-content-secondary">
          {numericValue(row.minHumidityPct)}% – {numericValue(row.maxHumidityPct)}%
        </span>
      ),
    },
    {
      id: 'risk',
      header: 'Risk alert at',
      align: 'right',
      cell: (row) => (
        <Badge tone="warning">
          {Number.isFinite(row.riskAlertThreshold)
            ? formatProbability(row.riskAlertThreshold)
            : '—'}
        </Badge>
      ),
    },
    {
      id: 'validation',
      header: 'Status',
      align: 'right',
      hideBelow: 'sm',
      cell: (row) =>
        errors[row.commodity] ? (
          <Badge tone="danger">Review</Badge>
        ) : (
          <Badge tone="success">Valid</Badge>
        ),
    },
  ];

  if (!isLoading && rules.length === 0) {
    return (
      <EmptyState
        icon={SlidersHorizontal}
        title="No threshold rules configured"
        description="The backend has not supplied any commodity threshold rules yet."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-semibold text-content-primary">Commodity thresholds</h4>
        <p className="mt-0.5 text-xs text-content-muted">
          Breaching a band raises an alert; exceeding the risk threshold escalates to critical.
          Changes apply to the draft — use Save to persist them via PATCH /settings.
        </p>
      </div>

      {/* Editor for the selected commodity */}
      {rule && (
        <div className="space-y-5 rounded-card border border-line bg-surface-muted/30 p-4">
          <div className="max-w-xs">
            <FormField label="Commodity" htmlFor="threshold-commodity">
              <Select
                id="threshold-commodity"
                options={commodityOptions}
                value={rule.commodity}
                onChange={(event) => setSelected(event.target.value as CommodityType)}
              />
            </FormField>
          </div>

          <fieldset className="space-y-1.5">
            <legend className="text-xs font-medium text-content-secondary">Temperature band</legend>
            <p className="text-2xs leading-relaxed text-content-muted">
              Safe operating range enforced by the alerting engine while the load is in transit.
            </p>
            <div className="grid grid-cols-1 gap-4 pt-1 sm:grid-cols-2">
              <FormField
                label="Minimum temperature"
                htmlFor="minTemperatureC"
                error={ruleErrors.minTemperatureC}
              >
                <Input
                  id="minTemperatureC"
                  type="number"
                  step={0.5}
                  suffix="°C"
                  value={numericValue(rule.minTemperatureC)}
                  hasError={Boolean(ruleErrors.minTemperatureC)}
                  aria-invalid={Boolean(ruleErrors.minTemperatureC)}
                  onChange={(event) =>
                    onChange(rule.commodity, { minTemperatureC: Number(event.target.value) })
                  }
                />
              </FormField>
              <FormField
                label="Maximum temperature"
                htmlFor="maxTemperatureC"
                error={ruleErrors.maxTemperatureC}
              >
                <Input
                  id="maxTemperatureC"
                  type="number"
                  step={0.5}
                  suffix="°C"
                  value={numericValue(rule.maxTemperatureC)}
                  hasError={Boolean(ruleErrors.maxTemperatureC)}
                  aria-invalid={Boolean(ruleErrors.maxTemperatureC)}
                  onChange={(event) =>
                    onChange(rule.commodity, { maxTemperatureC: Number(event.target.value) })
                  }
                />
              </FormField>
            </div>
          </fieldset>

          <fieldset className="space-y-1.5">
            <legend className="text-xs font-medium text-content-secondary">Humidity band</legend>
            <p className="text-2xs leading-relaxed text-content-muted">
              Relative humidity limits that keep the commodity within spec without condensation.
            </p>
            <div className="grid grid-cols-1 gap-4 pt-1 sm:grid-cols-2">
              <FormField
                label="Minimum humidity"
                htmlFor="minHumidityPct"
                error={ruleErrors.minHumidityPct}
              >
                <Input
                  id="minHumidityPct"
                  type="number"
                  step={1}
                  suffix="%"
                  value={numericValue(rule.minHumidityPct)}
                  hasError={Boolean(ruleErrors.minHumidityPct)}
                  aria-invalid={Boolean(ruleErrors.minHumidityPct)}
                  onChange={(event) =>
                    onChange(rule.commodity, { minHumidityPct: Number(event.target.value) })
                  }
                />
              </FormField>
              <FormField
                label="Maximum humidity"
                htmlFor="maxHumidityPct"
                error={ruleErrors.maxHumidityPct}
              >
                <Input
                  id="maxHumidityPct"
                  type="number"
                  step={1}
                  suffix="%"
                  value={numericValue(rule.maxHumidityPct)}
                  hasError={Boolean(ruleErrors.maxHumidityPct)}
                  aria-invalid={Boolean(ruleErrors.maxHumidityPct)}
                  onChange={(event) =>
                    onChange(rule.commodity, { maxHumidityPct: Number(event.target.value) })
                  }
                />
              </FormField>
            </div>
          </fieldset>

          <div className="max-w-xs">
            <FormField
              label="Spoilage risk escalation"
              htmlFor="riskAlertThreshold"
              hint="Critical alert when the model's spoilage probability exceeds this value (0–1)."
              error={ruleErrors.riskAlertThreshold}
            >
              <Input
                id="riskAlertThreshold"
                type="number"
                step={0.05}
                min={0}
                max={1}
                value={numericValue(rule.riskAlertThreshold)}
                hasError={Boolean(ruleErrors.riskAlertThreshold)}
                aria-invalid={Boolean(ruleErrors.riskAlertThreshold)}
                onChange={(event) =>
                  onChange(rule.commodity, { riskAlertThreshold: Number(event.target.value) })
                }
              />
            </FormField>
          </div>
        </div>
      )}

      {/* Fleet-wide overview of every rule in the draft */}
      <div className="overflow-hidden rounded-card border border-line">
        <DataTable
          columns={columns}
          data={rules}
          rowKey={(row) => row.commodity}
          isLoading={isLoading}
          dense
        />
      </div>
    </div>
  );
}
