import type { AppSettings, CommodityType, ThresholdRule } from '@/types';

/**
 * Frontend validation for the Settings draft.
 *
 * Rules are generic and configuration-oriented (ranges, ordering, formats) —
 * they never encode scientific threshold logic. The backend remains the
 * authority for what values it accepts; this layer only keeps obviously
 * broken drafts from being submitted.
 */

export type SettingsTabKey = 'general' | 'thresholds' | 'notifications' | 'integrations';

export type ThresholdFieldKey = keyof Omit<ThresholdRule, 'commodity'>;
export type ThresholdRuleErrors = Partial<Record<ThresholdFieldKey, string>>;

export type OrganizationFieldKey =
  'organizationName' | 'contactEmail' | 'defaultPredictionHorizonHours';

export type IntegrationFieldKey =
  'apiBaseUrl' | 'modelEndpoint' | 'webhookUrl' | 'telemetryPollIntervalMs';

export interface SettingsValidationErrors {
  organization: Partial<Record<OrganizationFieldKey, string>>;
  thresholds: Partial<Record<CommodityType, ThresholdRuleErrors>>;
  integrations: Partial<Record<IntegrationFieldKey, string>>;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HTTP_URL_PATTERN = /^https?:\/\/\S+$/i;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

function validateOrganization(settings: AppSettings): SettingsValidationErrors['organization'] {
  const errors: SettingsValidationErrors['organization'] = {};
  const { organizationName, contactEmail, defaultPredictionHorizonHours } = settings.organization;

  if (!organizationName.trim()) errors.organizationName = 'Organization name is required.';
  if (!contactEmail.trim()) errors.contactEmail = 'Contact email is required.';
  else if (!EMAIL_PATTERN.test(contactEmail.trim()))
    errors.contactEmail = 'Enter a valid email address.';

  if (
    defaultPredictionHorizonHours !== undefined &&
    (!isFiniteNumber(defaultPredictionHorizonHours) ||
      defaultPredictionHorizonHours < 6 ||
      defaultPredictionHorizonHours > 72)
  ) {
    errors.defaultPredictionHorizonHours = 'Choose a horizon between 6 and 72 hours.';
  }

  return errors;
}

function validateThresholdRule(rule: ThresholdRule): ThresholdRuleErrors {
  const errors: ThresholdRuleErrors = {};
  const { minTemperatureC, maxTemperatureC, minHumidityPct, maxHumidityPct, riskAlertThreshold } =
    rule;

  if (!isFiniteNumber(minTemperatureC)) errors.minTemperatureC = 'Enter a number.';
  else if (minTemperatureC < -10 || minTemperatureC > 45)
    errors.minTemperatureC = 'Enter a value between -10 and 45 °C.';

  if (!isFiniteNumber(maxTemperatureC)) errors.maxTemperatureC = 'Enter a number.';
  else if (maxTemperatureC < -10 || maxTemperatureC > 45)
    errors.maxTemperatureC = 'Enter a value between -10 and 45 °C.';

  if (
    isFiniteNumber(minTemperatureC) &&
    isFiniteNumber(maxTemperatureC) &&
    minTemperatureC >= maxTemperatureC
  ) {
    errors.minTemperatureC = errors.minTemperatureC ?? 'Min must be below the maximum.';
    errors.maxTemperatureC = errors.maxTemperatureC ?? 'Max must be above the minimum.';
  }

  if (!isFiniteNumber(minHumidityPct)) errors.minHumidityPct = 'Enter a number.';
  else if (minHumidityPct < 0 || minHumidityPct > 100)
    errors.minHumidityPct = 'Enter a value between 0 and 100%.';

  if (!isFiniteNumber(maxHumidityPct)) errors.maxHumidityPct = 'Enter a number.';
  else if (maxHumidityPct < 0 || maxHumidityPct > 100)
    errors.maxHumidityPct = 'Enter a value between 0 and 100%.';

  if (
    isFiniteNumber(minHumidityPct) &&
    isFiniteNumber(maxHumidityPct) &&
    minHumidityPct >= maxHumidityPct
  ) {
    errors.minHumidityPct = errors.minHumidityPct ?? 'Min must be below the maximum.';
    errors.maxHumidityPct = errors.maxHumidityPct ?? 'Max must be above the minimum.';
  }

  if (!isFiniteNumber(riskAlertThreshold)) errors.riskAlertThreshold = 'Enter a number.';
  else if (riskAlertThreshold <= 0 || riskAlertThreshold >= 1)
    errors.riskAlertThreshold = 'Enter a probability between 0 and 1 (e.g. 0.7).';

  return errors;
}

function validateIntegrations(settings: AppSettings): SettingsValidationErrors['integrations'] {
  const errors: SettingsValidationErrors['integrations'] = {};
  const { apiBaseUrl, modelEndpoint, webhookUrl, telemetryPollIntervalMs } = settings.integrations;

  if (!apiBaseUrl.trim()) errors.apiBaseUrl = 'API base URL is required.';
  else if (!apiBaseUrl.trim().startsWith('/') && !HTTP_URL_PATTERN.test(apiBaseUrl.trim()))
    errors.apiBaseUrl = 'Use an absolute http(s) URL or a same-origin path like /api/v1.';

  if (!modelEndpoint.trim()) errors.modelEndpoint = 'Model endpoint is required.';
  else if (!modelEndpoint.trim().startsWith('/') && !HTTP_URL_PATTERN.test(modelEndpoint.trim()))
    errors.modelEndpoint = 'Use a path like /predictions/spoilage or a full URL.';

  if (webhookUrl.trim() && !HTTP_URL_PATTERN.test(webhookUrl.trim()))
    errors.webhookUrl = 'Must start with http:// or https:// (or leave empty).';

  if (!isFiniteNumber(telemetryPollIntervalMs)) errors.telemetryPollIntervalMs = 'Enter a number.';
  else if (telemetryPollIntervalMs < 1000 || telemetryPollIntervalMs > 60000)
    errors.telemetryPollIntervalMs = 'Choose an interval between 1000 and 60000 ms.';

  return errors;
}

/** Validate the whole settings draft. Empty sections mean "no errors". */
export function validateSettings(settings: AppSettings): SettingsValidationErrors {
  const thresholds: SettingsValidationErrors['thresholds'] = {};
  for (const rule of settings.thresholds) {
    const ruleErrors = validateThresholdRule(rule);
    if (Object.keys(ruleErrors).length > 0) thresholds[rule.commodity] = ruleErrors;
  }

  return {
    organization: validateOrganization(settings),
    thresholds,
    integrations: validateIntegrations(settings),
  };
}

export function countValidationErrors(errors: SettingsValidationErrors): number {
  const organizationCount = Object.keys(errors.organization).length;
  const thresholdCount = Object.values(errors.thresholds).reduce(
    (sum, ruleErrors) => sum + Object.keys(ruleErrors ?? {}).length,
    0,
  );
  const integrationCount = Object.keys(errors.integrations).length;
  return organizationCount + thresholdCount + integrationCount;
}

/** First tab containing errors, in the order the tabs are displayed. */
export function firstTabWithErrors(errors: SettingsValidationErrors): SettingsTabKey | null {
  if (Object.keys(errors.organization).length > 0) return 'general';
  if (Object.keys(errors.thresholds).length > 0) return 'thresholds';
  if (Object.keys(errors.integrations).length > 0) return 'integrations';
  return null;
}
