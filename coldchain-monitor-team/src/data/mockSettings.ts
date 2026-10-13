import type { AppSettings } from '@/types';
import { env } from '@/utils/env';

export const mockSettings: AppSettings = {
  organization: {
    organizationName: 'Meridian Cold Logistics',
    contactEmail: 'operations@meridiancold.example',
    timezone: 'Asia/Kolkata',
    temperatureUnit: 'celsius',
    defaultTimeRange: '24h',
    defaultPredictionHorizonHours: 24,
  },
  notifications: {
    emailAlerts: true,
    smsAlerts: true,
    pushAlerts: false,
    criticalOnly: false,
    dailyDigest: true,
    digestHour: 7,
  },
  thresholds: [
    {
      commodity: 'banana',
      minTemperatureC: 12,
      maxTemperatureC: 15,
      minHumidityPct: 85,
      maxHumidityPct: 95,
      riskAlertThreshold: 0.7,
    },
    {
      commodity: 'tomato',
      minTemperatureC: 8,
      maxTemperatureC: 15,
      minHumidityPct: 85,
      maxHumidityPct: 95,
      riskAlertThreshold: 0.7,
    },
    {
      commodity: 'grapes',
      minTemperatureC: -1,
      maxTemperatureC: 2,
      minHumidityPct: 90,
      maxHumidityPct: 95,
      riskAlertThreshold: 0.65,
    },
    {
      commodity: 'leafy_greens',
      minTemperatureC: 0,
      maxTemperatureC: 4,
      minHumidityPct: 90,
      maxHumidityPct: 98,
      riskAlertThreshold: 0.6,
    },
    {
      commodity: 'mango',
      minTemperatureC: 10,
      maxTemperatureC: 14,
      minHumidityPct: 85,
      maxHumidityPct: 92,
      riskAlertThreshold: 0.7,
    },
  ],
  integrations: {
    apiBaseUrl: env.apiBaseUrl,
    telemetryPollIntervalMs: env.telemetryPollIntervalMs,
    modelEndpoint: '/predictions/spoilage',
    webhookUrl: 'https://hooks.meridiancold.example/coldchain/alerts',
    useMockData: env.useMockApi,
  },
};
