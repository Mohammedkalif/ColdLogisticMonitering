import type { ISODateString, StatusTone, TimeSeriesPoint, TrendIndicator } from './common.types';

/** Stable keys for the six headline KPI cards on the Dashboard. */
export type DashboardMetricKey =
  | 'temperature'
  | 'humidity'
  | 'spoilageRisk'
  | 'truckStatus'
  | 'predictionConfidence'
  | 'systemHealth';

/**
 * A single KPI card payload.
 *
 * The API owns the *values and formatting*; the UI owns icons and layout.
 * This keeps components free of business logic and hardcoded numbers.
 */
export interface DashboardMetric {
  key: DashboardMetricKey;
  label: string;
  /** Pre-formatted display value, e.g. `4.2` or `Normal`. */
  value: string;
  unit?: string;
  /** Short supporting line under the value. */
  caption: string;
  tone: StatusTone;
  trend?: TrendIndicator;
  /** Optional 0-100 progress rail rendered at the bottom of the card. */
  progressPct?: number;
  /** Short status word rendered as a badge, e.g. `Nominal`, `Elevated`. */
  statusLabel?: string;
  /** Compact history for the in-card sparkline. Omit to hide the sparkline. */
  sparkline?: TimeSeriesPoint[];
  /** Timestamp of the reading behind this card. */
  updatedAt?: ISODateString;
  /**
   * Numeric form of `value`, supplied when the figure should count up on
   * mount. Formatting still comes from `value`; this is the animation target.
   */
  numericValue?: number;
  /** Decimal places to preserve while the counting animation runs. */
  precision?: number;
}

export type ServiceStatus = 'operational' | 'degraded' | 'down';

export interface SystemComponentHealth {
  id: string;
  name: string;
  status: ServiceStatus;
  uptimePct: number;
  latencyMs: number;
}

export interface FleetOverview {
  activeShipments: number;
  inTransit: number;
  delayed: number;
  deliveredToday: number;
  atRisk: number;
}

/** Aggregate payload backing the Dashboard page. */
export interface DashboardSummary {
  generatedAt: ISODateString;
  metrics: DashboardMetric[];
  fleet: FleetOverview;
  components: SystemComponentHealth[];
}

/** Series keys plotted by the dashboard trend charts. */
export type DashboardTrendKey =
  'temperature' | 'humidity' | 'spoilageRisk' | 'predictionConfidence';

/**
 * One plotted series plus the band it must stay inside.
 *
 * `threshold` drives the shaded safe-operating region and the reference lines
 * on the temperature chart.
 */
export interface DashboardTrendSeries {
  key: DashboardTrendKey;
  label: string;
  unit: string;
  tone: StatusTone;
  threshold?: { min: number; max: number };
  points: TimeSeriesPoint[];
}

/** Payload backing the dashboard chart grid. */
export interface DashboardTrends {
  range: string;
  generatedAt: ISODateString;
  series: DashboardTrendSeries[];
}

export type WeatherCondition =
  'clear' | 'partly_cloudy' | 'cloudy' | 'rain' | 'thunderstorm' | 'haze';

/** Ambient conditions at the origin hub — context for cooling load. */
export interface WeatherSummary {
  location: string;
  observedAt: ISODateString;
  temperatureC: number;
  humidityPct: number;
  condition: WeatherCondition;
  conditionLabel: string;
  windSpeedKph: number;
  feelsLikeC: number;
}

export type ActivityKind =
  | 'prediction_generated'
  | 'temperature_warning'
  | 'shipment_updated'
  | 'alert_acknowledged'
  | 'device_event';

/** Single entry in the Recent Activity timeline (newest first). */
export interface ActivityEvent {
  id: string;
  kind: ActivityKind;
  title: string;
  description: string;
  occurredAt: ISODateString;
  tone: StatusTone;
  /** Related shipment, shown as a monospace reference chip. */
  shipmentCode?: string;
  actor?: string;
}
