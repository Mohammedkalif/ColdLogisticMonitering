import type {
  AlertCategory,
  AlertSeverity,
  AlertStatus,
  CommodityType,
  PackagingType,
  PredictionRequest,
  SelectOption,
  TimeRangeKey,
  VehicleType,
} from '@/types';
import { commodityLabels, packagingLabels, vehicleTypeLabels } from './domain';

export const APP_NAME = 'ColdChain Monitor';
export const APP_SHORT_NAME = 'ColdChain';
export const APP_DESCRIPTION =
  'ML-based cold chain logistics monitoring and spoilage prediction for horticulture supply chains';

/** Analysis windows offered across dashboards. */
export const TIME_RANGE_OPTIONS: SelectOption<TimeRangeKey>[] = [
  { value: '1h', label: 'Last hour' },
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
];

export const DEFAULT_TIME_RANGE: TimeRangeKey = '24h';

export const PAGE_SIZE_OPTIONS: SelectOption[] = [
  { value: '10', label: '10 / page' },
  { value: '25', label: '25 / page' },
  { value: '50', label: '50 / page' },
];

export const DEFAULT_PAGE_SIZE = 10;

const toOptions = <T extends string>(labels: Record<T, string>): SelectOption<T>[] =>
  (Object.keys(labels) as T[]).map((value) => ({ value, label: labels[value] }));

export const COMMODITY_OPTIONS: SelectOption<CommodityType>[] = toOptions(commodityLabels);
export const VEHICLE_TYPE_OPTIONS: SelectOption<VehicleType>[] = toOptions(vehicleTypeLabels);
export const PACKAGING_OPTIONS: SelectOption<PackagingType>[] = toOptions(packagingLabels);

export const SEVERITY_FILTER_OPTIONS: SelectOption<AlertSeverity | 'all'>[] = [
  { value: 'all', label: 'All severities' },
  { value: 'critical', label: 'Critical' },
  { value: 'warning', label: 'Warning' },
  { value: 'info', label: 'Info' },
];

export const ALERT_STATUS_FILTER_OPTIONS: SelectOption<AlertStatus | 'all'>[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'open', label: 'Open' },
  { value: 'acknowledged', label: 'Acknowledged' },
  { value: 'resolved', label: 'Resolved' },
];

export const CATEGORY_FILTER_OPTIONS: SelectOption<AlertCategory | 'all'>[] = [
  { value: 'all', label: 'All categories' },
  { value: 'temperature_excursion', label: 'Temperature excursion' },
  { value: 'humidity_deviation', label: 'Humidity deviation' },
  { value: 'spoilage_risk', label: 'Spoilage risk' },
  { value: 'device_offline', label: 'Device offline' },
  { value: 'door_open', label: 'Door open' },
  { value: 'route_delay', label: 'Route delay' },
];

export const TIMEZONE_OPTIONS: SelectOption[] = [
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
  { value: 'Europe/London', label: 'Europe/London (GMT)' },
  { value: 'UTC', label: 'UTC' },
];

/**
 * Default feature vector prefilled in the Prediction request form.
 * Pure form defaults live here (not in `src/data`) so presentation files
 * never import the mock dataset layer.
 */
export const DEFAULT_PREDICTION_REQUEST: PredictionRequest = {
  commodity: 'banana',
  transitDurationHours: 16,
  avgTemperatureC: 13.5,
  avgHumidityPct: 90,
  ethylenePpm: 1.4,
  vibrationIndex: 0.3,
  packaging: 'corrugated_box',
  vehicleType: 'reefer_truck',
  preCoolingApplied: true,
  ambientTemperatureC: 32,
};

/** localStorage keys — namespaced to avoid collisions. */
export const STORAGE_KEYS = {
  theme: 'ccm.theme',
  sidebarCollapsed: 'ccm.sidebar.collapsed',
} as const;
