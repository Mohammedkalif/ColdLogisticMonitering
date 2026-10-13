import { useState, type FormEvent } from 'react';
import { FileDown, RotateCcw, Sparkles } from 'lucide-react';
import type {
  CommodityType,
  PackagingType,
  PredictionReportRequest,
  ShipmentSelectorItem,
  VehicleType,
} from '@/types';
import {
  COMMODITY_OPTIONS,
  DEFAULT_PREDICTION_REQUEST,
  PACKAGING_OPTIONS,
  VEHICLE_TYPE_OPTIONS,
} from '@/utils/constants';
import { FormActions, FormField, FormSection } from '@/components/forms';
import { Badge, Button, Input, Select, Switch } from '@/components/ui';

/**
 * Prediction Request Panel — section 1 of the AI Decision Support Center.
 *
 * Purpose: collect the feature vector + run configuration for a prediction.
 *
 * Expected API: `predictionApi.getPredictionReport(request)` where `request`
 * is a `PredictionReportRequest`. The component owns only local form state; it
 * never calls the service or holds prediction values.
 *
 * Future backend integration: the Shipment selector will be populated from
 * `/shipments`; the model version is returned by `/models/active`.
 * "Export Report" is a placeholder for a future document-generation endpoint.
 */

const HORIZON_OPTIONS = [
  { value: '6', label: '6 hours' },
  { value: '12', label: '12 hours' },
  { value: '24', label: '24 hours' },
  { value: '48', label: '48 hours' },
  { value: '72', label: '72 hours' },
];

const TYPE_OPTIONS = [
  { value: 'arrival_spoilage', label: 'Arrival spoilage' },
  { value: 'excursion_risk', label: 'Excursion risk' },
  { value: 'shelf_life', label: 'Shelf life' },
];

const INTERVAL_OPTIONS = [
  { value: '15min', label: 'Every 15 min' },
  { value: '30min', label: 'Every 30 min' },
  { value: 'hourly', label: 'Hourly' },
];

export interface PredictionRequestPanelProps {
  shipments: ShipmentSelectorItem[];
  modelVersion: string;
  onGenerate: (request: PredictionReportRequest) => void;
  onReset: () => void;
  isGenerating: boolean;
}

export function PredictionRequestPanel({
  shipments,
  modelVersion,
  onGenerate,
  onReset,
  isGenerating,
}: PredictionRequestPanelProps) {
  const [form, setForm] = useState<PredictionReportRequest>({
    ...DEFAULT_PREDICTION_REQUEST,
    shipmentId: undefined,
    horizonHours: 24,
    predictionType: 'arrival_spoilage',
    predictionInterval: 'hourly',
    modelVersion,
  });

  const update = <K extends keyof PredictionReportRequest>(
    key: K,
    value: PredictionReportRequest[K],
  ) => setForm((previous) => ({ ...previous, [key]: value }));

  const shipmentOptions = [
    { value: '', label: 'Select a consignment…' },
    ...shipments.map((shipment) => ({
      value: shipment.id,
      label: `${shipment.code} · ${shipment.truckNumber}`,
    })),
  ];

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onGenerate({ ...form, modelVersion });
  };

  const handleReset = () => {
    setForm({
      ...DEFAULT_PREDICTION_REQUEST,
      shipmentId: undefined,
      horizonHours: 24,
      predictionType: 'arrival_spoilage',
      predictionInterval: 'hourly',
      modelVersion,
    });
    onReset();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-5">
      <FormSection
        title="Consignment profile"
        description="Attributes of the load being scored. Values map to the model's feature vector."
      >
        <FormField label="Shipment" htmlFor="shipmentId">
          <Select
            id="shipmentId"
            options={shipmentOptions}
            value={form.shipmentId ?? ''}
            onChange={(event) => {
              const id = event.target.value;
              const selected = shipments.find((item) => item.id === id);
              update('shipmentId', id || undefined);
              if (selected) update('commodity', selected.commodity);
            }}
          />
        </FormField>

        <FormField label="Commodity" htmlFor="commodity" required>
          <Select
            id="commodity"
            options={COMMODITY_OPTIONS}
            value={form.commodity}
            onChange={(event) => update('commodity', event.target.value as CommodityType)}
          />
        </FormField>

        <FormField
          label="Transit duration"
          htmlFor="transitDurationHours"
          required
          hint="Door-to-door estimate"
        >
          <Input
            id="transitDurationHours"
            type="number"
            min={1}
            max={240}
            step={0.5}
            suffix="hours"
            value={form.transitDurationHours}
            onChange={(event) => update('transitDurationHours', Number(event.target.value))}
          />
        </FormField>

        <FormField label="Packaging" htmlFor="packaging">
          <Select
            id="packaging"
            options={PACKAGING_OPTIONS}
            value={form.packaging}
            onChange={(event) => update('packaging', event.target.value as PackagingType)}
          />
        </FormField>

        <FormField label="Vehicle type" htmlFor="vehicleType">
          <Select
            id="vehicleType"
            options={VEHICLE_TYPE_OPTIONS}
            value={form.vehicleType}
            onChange={(event) => update('vehicleType', event.target.value as VehicleType)}
          />
        </FormField>
      </FormSection>

      <FormSection
        title="Environmental conditions"
        description="Expected averages across the journey (1:1 with the model features)."
      >
        <FormField label="Average temperature" htmlFor="avgTemperatureC" required>
          <Input
            id="avgTemperatureC"
            type="number"
            step={0.1}
            min={-5}
            max={45}
            suffix="°C"
            value={form.avgTemperatureC}
            onChange={(event) => update('avgTemperatureC', Number(event.target.value))}
          />
        </FormField>

        <FormField label="Average humidity" htmlFor="avgHumidityPct" required>
          <Input
            id="avgHumidityPct"
            type="number"
            step={1}
            min={0}
            max={100}
            suffix="%"
            value={form.avgHumidityPct}
            onChange={(event) => update('avgHumidityPct', Number(event.target.value))}
          />
        </FormField>

        <FormField label="Ethylene concentration" htmlFor="ethylenePpm">
          <Input
            id="ethylenePpm"
            type="number"
            step={0.1}
            min={0}
            max={50}
            suffix="ppm"
            value={form.ethylenePpm}
            onChange={(event) => update('ethylenePpm', Number(event.target.value))}
          />
        </FormField>

        <FormField
          label="Ambient temperature"
          htmlFor="ambientTemperatureC"
          hint="Outside air along the route"
        >
          <Input
            id="ambientTemperatureC"
            type="number"
            step={0.5}
            min={-10}
            max={55}
            suffix="°C"
            value={form.ambientTemperatureC}
            onChange={(event) => update('ambientTemperatureC', Number(event.target.value))}
          />
        </FormField>

        <FormField
          label="Road vibration index"
          htmlFor="vibrationIndex"
          hint="0 = smooth, 1 = severe"
        >
          <Input
            id="vibrationIndex"
            type="number"
            step={0.05}
            min={0}
            max={1}
            value={form.vibrationIndex}
            onChange={(event) => update('vibrationIndex', Number(event.target.value))}
          />
        </FormField>

        <FormField label="Pre-cooling applied" hint="Load cooled to set point before dispatch">
          <div className="flex h-9 items-center gap-3">
            <Switch
              checked={form.preCoolingApplied}
              onCheckedChange={(checked) => update('preCoolingApplied', checked)}
              label="Pre-cooling applied"
            />
            <span className="text-xs text-content-muted">
              {form.preCoolingApplied ? 'Yes' : 'No'}
            </span>
          </div>
        </FormField>
      </FormSection>

      <FormSection
        title="Prediction configuration"
        description="Run scope and model selection for this inference."
      >
        <FormField label="Prediction horizon" htmlFor="horizonHours">
          <Select
            id="horizonHours"
            options={HORIZON_OPTIONS}
            value={`${form.horizonHours}`}
            onChange={(event) => update('horizonHours', Number(event.target.value))}
          />
        </FormField>

        <FormField label="Prediction type" htmlFor="predictionType">
          <Select
            id="predictionType"
            options={TYPE_OPTIONS}
            value={form.predictionType}
            onChange={(event) =>
              update(
                'predictionType',
                event.target.value as PredictionReportRequest['predictionType'],
              )
            }
          />
        </FormField>

        <FormField label="Prediction interval" htmlFor="predictionInterval">
          <Select
            id="predictionInterval"
            options={INTERVAL_OPTIONS}
            value={form.predictionInterval}
            onChange={(event) =>
              update(
                'predictionInterval',
                event.target.value as PredictionReportRequest['predictionInterval'],
              )
            }
          />
        </FormField>

        <FormField label="Model version" hint="Locked to the active production model">
          <div className="flex h-9 items-center">
            <Badge tone="success" withDot>
              {modelVersion || '—'}
            </Badge>
          </div>
        </FormField>
      </FormSection>

      <FormActions hint="Inference runs against the active production model.">
        <Button type="button" variant="ghost" icon={RotateCcw} onClick={handleReset}>
          Reset
        </Button>
        <Button type="submit" variant="primary" icon={Sparkles} isLoading={isGenerating}>
          Generate Prediction
        </Button>
        <Button type="button" variant="outline" icon={FileDown} disabled>
          Export Report
        </Button>
      </FormActions>
    </form>
  );
}
