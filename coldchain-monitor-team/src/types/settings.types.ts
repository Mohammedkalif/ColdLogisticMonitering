import type { CommodityType } from './shipment.types';

/** Per-commodity operating band enforced by the alerting engine. */
export interface ThresholdRule {
  commodity: CommodityType;
  minTemperatureC: number;
  maxTemperatureC: number;
  minHumidityPct: number;
  maxHumidityPct: number;
  /** Spoilage probability (0-1) above which a critical alert is raised. */
  riskAlertThreshold: number;
}

export interface NotificationPreferences {
  emailAlerts: boolean;
  smsAlerts: boolean;
  pushAlerts: boolean;
  criticalOnly: boolean;
  dailyDigest: boolean;
  digestHour: number;
}

export interface OrganizationProfile {
  organizationName: string;
  contactEmail: string;
  timezone: string;
  temperatureUnit: 'celsius' | 'fahrenheit';
  defaultTimeRange: string;
  /**
   * Prediction horizon (hours) prefilled when a new spoilage run is
   * configured. Optional so existing backend payloads keep working;
   * the UI falls back to 24h when absent.
   */
  defaultPredictionHorizonHours?: number;
}

export interface IntegrationSettings {
  apiBaseUrl: string;
  telemetryPollIntervalMs: number;
  modelEndpoint: string;
  webhookUrl: string;
  useMockData: boolean;
}

export interface AppSettings {
  organization: OrganizationProfile;
  notifications: NotificationPreferences;
  thresholds: ThresholdRule[];
  integrations: IntegrationSettings;
}
