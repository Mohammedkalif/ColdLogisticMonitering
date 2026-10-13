import type { OrganizationProfile } from '@/types';
import { TIMEZONE_OPTIONS, TIME_RANGE_OPTIONS } from '@/utils/constants';
import { FormField, FormSection } from '@/components/forms';
import { Input, Select } from '@/components/ui';
import type { OrganizationFieldKey } from '../validation';

export interface GeneralSettingsProps {
  value: OrganizationProfile;
  onChange: (patch: Partial<OrganizationProfile>) => void;
  /** Field-level errors derived from the current draft. */
  errors?: Partial<Record<OrganizationFieldKey, string>>;
}

const TEMPERATURE_UNIT_OPTIONS = [
  { value: 'celsius', label: 'Celsius (°C)' },
  { value: 'fahrenheit', label: 'Fahrenheit (°F)' },
];

/** Horizon choices mirror the Prediction request panel. */
const HORIZON_OPTIONS = [
  { value: '6', label: '6 hours' },
  { value: '12', label: '12 hours' },
  { value: '24', label: '24 hours' },
  { value: '48', label: '48 hours' },
  { value: '72', label: '72 hours' },
];

/** Workspace identity and display defaults. */
export function GeneralSettings({ value, onChange, errors = {} }: GeneralSettingsProps) {
  return (
    <FormSection title="Organization" description="Shown on exports, reports and alert emails.">
      <FormField
        label="Organization name"
        htmlFor="organizationName"
        required
        error={errors.organizationName}
      >
        <Input
          id="organizationName"
          value={value.organizationName}
          hasError={Boolean(errors.organizationName)}
          aria-invalid={Boolean(errors.organizationName)}
          onChange={(event) => onChange({ organizationName: event.target.value })}
        />
      </FormField>

      <FormField
        label="Operations contact"
        htmlFor="contactEmail"
        hint="Receives escalation summaries"
        required
        error={errors.contactEmail}
      >
        <Input
          id="contactEmail"
          type="email"
          value={value.contactEmail}
          hasError={Boolean(errors.contactEmail)}
          aria-invalid={Boolean(errors.contactEmail)}
          onChange={(event) => onChange({ contactEmail: event.target.value })}
        />
      </FormField>

      <FormField label="Timezone" htmlFor="timezone">
        <Select
          id="timezone"
          options={TIMEZONE_OPTIONS}
          value={value.timezone}
          onChange={(event) => onChange({ timezone: event.target.value })}
        />
      </FormField>

      <FormField label="Temperature unit" htmlFor="temperatureUnit">
        <Select
          id="temperatureUnit"
          options={TEMPERATURE_UNIT_OPTIONS}
          value={value.temperatureUnit}
          onChange={(event) =>
            onChange({
              temperatureUnit: event.target.value as OrganizationProfile['temperatureUnit'],
            })
          }
        />
      </FormField>

      <FormField label="Default dashboard range" htmlFor="defaultTimeRange">
        <Select
          id="defaultTimeRange"
          options={TIME_RANGE_OPTIONS}
          value={value.defaultTimeRange}
          onChange={(event) => onChange({ defaultTimeRange: event.target.value })}
        />
      </FormField>

      <FormField
        label="Default prediction horizon"
        htmlFor="defaultPredictionHorizonHours"
        hint="Prefilled when a new spoilage prediction run is configured."
        error={errors.defaultPredictionHorizonHours}
      >
        <Select
          id="defaultPredictionHorizonHours"
          options={HORIZON_OPTIONS}
          value={`${value.defaultPredictionHorizonHours ?? 24}`}
          onChange={(event) =>
            onChange({ defaultPredictionHorizonHours: Number(event.target.value) })
          }
        />
      </FormField>
    </FormSection>
  );
}
