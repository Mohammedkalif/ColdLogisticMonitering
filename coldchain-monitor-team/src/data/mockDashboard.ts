import type {
  ActivityEvent,
  DashboardMetric,
  DashboardSummary,
  DashboardTrends,
  FleetOverview,
  SystemComponentHealth,
  TimeRangeKey,
  WeatherSummary,
} from '@/types';
import { hoursAgo, minutesAgo } from '@/utils/date';
import { buildSeries } from './mockFactory';
import { mockShipments } from './mockShipments';

/**
 * Placeholder values for the dashboard.
 *
 * The shape mirrors what the backend is expected to return, so swapping the
 * mock for a real `/dashboard/*` response requires no UI changes.
 */

/** Points per window, keeping sparklines and charts readable at every zoom. */
const WINDOW_CONFIG: Record<TimeRangeKey, { points: number; stepMinutes: number }> = {
  '1h': { points: 24, stepMinutes: 3 },
  '24h': { points: 48, stepMinutes: 30 },
  '7d': { points: 56, stepMinutes: 180 },
  '30d': { points: 60, stepMinutes: 720 },
  '90d': { points: 90, stepMinutes: 1440 },
};

/** Compact 24-point series used inside the KPI cards. */
const sparkline = (
  baseline: number,
  amplitude: number,
  drift: number,
  seed: number,
  decimals = 1,
) => buildSeries({ points: 24, stepMinutes: 60, baseline, amplitude, drift, decimals, seed });

const buildMetrics = (range: TimeRangeKey): DashboardMetric[] => {
  const comparisonLabel =
    range === '1h'
      ? 'vs. previous hour'
      : range === '24h'
        ? 'vs. yesterday'
        : `vs. previous ${range}`;

  return [
    {
      key: 'temperature',
      label: 'Current Temperature',
      value: '4.2',
      numericValue: 4.2,
      precision: 1,
      unit: '°C',
      caption: 'Fleet average across 12 active loggers',
      tone: 'success',
      statusLabel: 'In band',
      trend: { direction: 'up', value: '+0.3 °C', label: comparisonLabel },
      sparkline: sparkline(4.2, 0.6, 0.3, 11),
      updatedAt: minutesAgo(2),
    },
    {
      key: 'humidity',
      label: 'Current Humidity',
      value: '88',
      numericValue: 88,
      unit: '%',
      caption: 'Optimal band 85–95% for current loads',
      tone: 'success',
      statusLabel: 'Optimal',
      trend: { direction: 'down', value: '-1.4%', label: comparisonLabel },
      sparkline: sparkline(88, 2.4, -1.4, 23, 0),
      updatedAt: minutesAgo(2),
    },
    {
      key: 'spoilageRisk',
      label: 'Spoilage Risk',
      value: '18',
      numericValue: 18,
      unit: '%',
      caption: '2 shipments above the alert threshold',
      tone: 'warning',
      statusLabel: 'Elevated',
      trend: { direction: 'up', value: '+4 pts', label: comparisonLabel },
      progressPct: 18,
      sparkline: sparkline(16, 3.2, 4, 37, 0),
      updatedAt: minutesAgo(6),
    },
    {
      key: 'predictionConfidence',
      label: 'Prediction Confidence',
      value: '92',
      numericValue: 92,
      unit: '%',
      caption: 'Model v2.4.1 · rolling 7-day mean',
      tone: 'success',
      statusLabel: 'High',
      trend: { direction: 'up', value: '+1.2%', label: comparisonLabel },
      progressPct: 92,
      sparkline: sparkline(91, 1.6, 1.2, 53, 0),
      updatedAt: minutesAgo(11),
    },
    {
      key: 'truckStatus',
      label: 'Truck Status',
      value: '12',
      numericValue: 12,
      unit: '/ 14 active',
      caption: '1 delayed · 1 scheduled · 0 offline',
      tone: 'brand',
      statusLabel: 'On schedule',
      trend: { direction: 'flat', value: '0', label: 'no change' },
      sparkline: sparkline(12, 1.1, 0, 71, 0),
      updatedAt: minutesAgo(4),
    },
    {
      key: 'systemHealth',
      label: 'System Health',
      value: '99.9',
      numericValue: 99.9,
      precision: 1,
      unit: '% uptime',
      caption: '5 of 5 services responding normally',
      tone: 'success',
      statusLabel: 'Operational',
      trend: { direction: 'flat', value: '0.00%', label: '30-day uptime' },
      sparkline: sparkline(99.9, 0.06, 0, 89, 2),
      updatedAt: minutesAgo(1),
    },
  ];
};

const buildFleetOverview = (): FleetOverview => ({
  activeShipments: mockShipments.length,
  inTransit: mockShipments.filter((shipment) => shipment.status === 'in_transit').length,
  delayed: mockShipments.filter((shipment) => shipment.status === 'delayed').length,
  deliveredToday: 8,
  atRisk: mockShipments.filter(
    (shipment) => shipment.riskLevel === 'high' || shipment.riskLevel === 'critical',
  ).length,
});

export const mockSystemComponents: SystemComponentHealth[] = [
  {
    id: 'sensors',
    name: 'Sensor connectivity',
    status: 'operational',
    uptimePct: 99.98,
    latencyMs: 62,
  },
  { id: 'api', name: 'Core API', status: 'operational', uptimePct: 99.95, latencyMs: 118 },
  { id: 'ml', name: 'Prediction engine', status: 'degraded', uptimePct: 99.41, latencyMs: 412 },
  { id: 'database', name: 'Database', status: 'operational', uptimePct: 99.99, latencyMs: 24 },
  { id: 'alerts', name: 'Alert engine', status: 'operational', uptimePct: 99.99, latencyMs: 44 },
];

export const buildDashboardSummary = (range: TimeRangeKey): DashboardSummary => ({
  generatedAt: new Date().toISOString(),
  metrics: buildMetrics(range),
  fleet: buildFleetOverview(),
  components: mockSystemComponents,
});

/** Full-resolution series for the dashboard chart grid. */
export const buildDashboardTrends = (range: TimeRangeKey): DashboardTrends => {
  const { points, stepMinutes } = WINDOW_CONFIG[range] ?? WINDOW_CONFIG['24h'];

  return {
    range,
    generatedAt: new Date().toISOString(),
    series: [
      {
        key: 'temperature',
        label: 'Temperature',
        unit: '°C',
        tone: 'brand',
        threshold: { min: 2, max: 6 },
        points: buildSeries({
          points,
          stepMinutes,
          baseline: 4.2,
          amplitude: 1.1,
          drift: 0.4,
          seed: 101,
        }),
      },
      {
        key: 'humidity',
        label: 'Humidity',
        unit: '%',
        tone: 'info',
        threshold: { min: 85, max: 95 },
        points: buildSeries({
          points,
          stepMinutes,
          baseline: 89,
          amplitude: 3,
          drift: -1.5,
          decimals: 0,
          seed: 202,
        }),
      },
      {
        key: 'spoilageRisk',
        label: 'Spoilage risk',
        unit: '%',
        tone: 'warning',
        threshold: { min: 0, max: 25 },
        points: buildSeries({
          points,
          stepMinutes,
          baseline: 16,
          amplitude: 4,
          drift: 4,
          decimals: 0,
          seed: 303,
        }),
      },
      {
        key: 'predictionConfidence',
        label: 'Confidence',
        unit: '%',
        tone: 'success',
        threshold: { min: 85, max: 100 },
        points: buildSeries({
          points,
          stepMinutes,
          baseline: 91,
          amplitude: 1.8,
          drift: 1.2,
          decimals: 0,
          seed: 404,
        }),
      },
    ],
  };
};

export const mockWeatherSummary: WeatherSummary = {
  location: 'Chennai hub, TN',
  observedAt: minutesAgo(9),
  temperatureC: 34.6,
  humidityPct: 71,
  condition: 'haze',
  conditionLabel: 'Haze',
  windSpeedKph: 14,
  feelsLikeC: 39.2,
};

/** Operational audit feed, newest first. */
export const mockRecentActivity: ActivityEvent[] = [
  {
    id: 'act-5001',
    kind: 'temperature_warning',
    title: 'Temperature warning raised',
    description: 'Cargo held at 16.2 °C against a 15.0 °C ceiling for 38 minutes.',
    occurredAt: minutesAgo(12),
    tone: 'danger',
    shipmentCode: 'SHP-24829',
  },
  {
    id: 'act-5002',
    kind: 'prediction_generated',
    title: 'Prediction generated',
    description: 'Model v2.4.1 scored 0.81 spoilage probability on arrival.',
    occurredAt: minutesAgo(24),
    tone: 'brand',
    shipmentCode: 'SHP-24829',
  },
  {
    id: 'act-5003',
    kind: 'shipment_updated',
    title: 'Shipment status updated',
    description: 'Marked as unloading at the Coimbatore distribution centre.',
    occurredAt: minutesAgo(38),
    tone: 'info',
    shipmentCode: 'SHP-24834',
  },
  {
    id: 'act-5004',
    kind: 'alert_acknowledged',
    title: 'Alert acknowledged',
    description: 'Rising spoilage risk trend acknowledged and assigned to quality.',
    occurredAt: hoursAgo(1.9),
    tone: 'success',
    shipmentCode: 'SHP-24841',
    actor: 'Priya Raman',
  },
  {
    id: 'act-5005',
    kind: 'device_event',
    title: 'Logger reconnected',
    description: 'Rear bay logger resumed reporting after 3 missed windows.',
    occurredAt: hoursAgo(2.6),
    tone: 'neutral',
    shipmentCode: 'SHP-24841',
  },
  {
    id: 'act-5006',
    kind: 'prediction_generated',
    title: 'Batch re-scoring completed',
    description: '14 active consignments re-scored against the nightly model run.',
    occurredAt: hoursAgo(3.4),
    tone: 'brand',
  },
  {
    id: 'act-5007',
    kind: 'shipment_updated',
    title: 'Shipment dispatched',
    description: 'Pre-cooling verified at 2.0 °C before departure from Nashik.',
    occurredAt: hoursAgo(8),
    tone: 'success',
    shipmentCode: 'SHP-24822',
  },
];
