import type { WeatherCondition } from './dashboard.types';
import type { DeviceConnectivity } from './sensor.types';
import type { CommodityType, ShipmentStatus } from './shipment.types';
import type {
  ISODateString,
  RiskLevel,
  StatusTone,
  TimeSeriesPoint,
  TrendIndicator,
} from './common.types';

/**
 * Domain contract for the Live Monitoring "Cold Chain Operations Center".
 *
 * Every object below is produced by the service layer (`liveMonitoringApi`,
 * `weatherApi`, `shipmentApi`) and consumed as plain, pre-shaped data by the
 * presentational components. Components never hardcode values or decide what a
 * tone/label looks like — that mapping lives in `utils/domain.ts`.
 *
 * Backend / ML integration point: replace the mock resolvers in the service
 * files with real HTTP calls returning these exact shapes. No component change
 * is required.
 */

/* ----------------------------------------------------------------------- */
/* 1. Live shipment selector                                                */
/* ----------------------------------------------------------------------- */

export interface ShipmentSelectorItem {
  id: string;
  code: string;
  truckNumber: string;
  driverName: string;
  productType: string;
  commodity: CommodityType;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  etaAt: ISODateString;
  healthScore: number;
  riskLevel: RiskLevel;
  currentLocation: string;
  progressPct: number;
}

/* ----------------------------------------------------------------------- */
/* 2. Live sensor overview cards                                            */
/* ----------------------------------------------------------------------- */

export type SensorOverviewKey = 'temperature' | 'humidity' | 'door' | 'gps' | 'battery' | 'cooling';

export interface SensorOverviewCard {
  key: SensorOverviewKey;
  label: string;
  /** Pre-formatted display value, e.g. `4.2 °C`, `Open`. */
  value: string;
  unit?: string;
  /** Status colour for the value / badge. */
  tone: StatusTone;
  /** Short status word, e.g. `Nominal`, `Open`, `Strained`. */
  statusLabel: string;
  /** Logger connectivity for this reading. */
  connection: DeviceConnectivity;
  lastUpdatedAt: ISODateString;
  trend?: TrendIndicator;
  /** Compact history for the in-card sparkline (omit to hide it). */
  sparkline?: TimeSeriesPoint[];
}

/* ----------------------------------------------------------------------- */
/* 3. Real-time monitoring series + safe operating bands                    */
/* ----------------------------------------------------------------------- */

export interface LiveMonitoringSeries {
  temperature: TimeSeriesPoint[];
  humidity: TimeSeriesPoint[];
  /** Effective cooling performance, 0-100. */
  cooling: TimeSeriesPoint[];
  /** Sensor signal quality, 0-100. */
  signal: TimeSeriesPoint[];
}

export interface LiveThresholds {
  temperature?: { min: number; max: number };
  humidity?: { min: number; max: number };
}

/* ----------------------------------------------------------------------- */
/* 4. Cold chain health score                                               */
/* ----------------------------------------------------------------------- */

export interface HealthScoreBreakdown {
  /** Composite cargo condition score, 0-100 (higher is healthier). */
  overall: number;
  temperatureStability: number;
  humidityStability: number;
  sensorReliability: number;
  predictionReadiness: number;
  tone: StatusTone;
  updatedAt: ISODateString;
}

/* ----------------------------------------------------------------------- */
/* 5. Live truck status                                                     */
/* ----------------------------------------------------------------------- */

export type EngineStatus = 'running' | 'idling' | 'off';
export type CoolingStatus = 'nominal' | 'strained' | 'fault';
export type DriverStatus = 'driving' | 'resting' | 'off_duty' | 'unavailable';

export interface TruckStatus {
  truckId: string;
  registrationNumber: string;
  speedKph: number;
  currentLocation: string;
  latitude: number;
  longitude: number;
  engineStatus: EngineStatus;
  coolingStatus: CoolingStatus;
  fuelPct: number;
  distanceTravelledKm: number;
  distanceRemainingKm: number;
  etaAt: ISODateString;
  driverName: string;
  driverStatus: DriverStatus;
  progressPct: number;
}

/* ----------------------------------------------------------------------- */
/* 6. Environmental conditions (outside the container)                      */
/* ----------------------------------------------------------------------- */

export type AirQualityLevel = 'good' | 'moderate' | 'unhealthy' | 'hazardous';

export interface EnvironmentalConditions {
  location: string;
  observedAt: ISODateString;
  temperatureC: number;
  humidityPct: number;
  condition: WeatherCondition;
  conditionLabel: string;
  windSpeedKph: number;
  feelsLikeC: number;
  sunriseAt: ISODateString;
  sunsetAt: ISODateString;
  airQualityIndex: number;
  airQualityLevel: AirQualityLevel;
  airQualityLabel: string;
}

/* ----------------------------------------------------------------------- */
/* 7. Sensor connectivity table                                             */
/* ----------------------------------------------------------------------- */

export interface ConnectivityRow {
  id: string;
  sensorName: string;
  status: DeviceConnectivity;
  signalStrengthPct: number;
  lastCommunicationAt: ISODateString;
  batteryPct: number;
  /** Composite sensor health, 0-100. */
  health: number;
  tone: StatusTone;
}

/* ----------------------------------------------------------------------- */
/* 8. Event timeline                                                        */
/* ----------------------------------------------------------------------- */

export type LiveEventKind =
  | 'door_open'
  | 'door_close'
  | 'temperature_excursion'
  | 'cooling_adjust'
  | 'checkpoint'
  | 'prediction_requested'
  | 'sensor_reconnected'
  | 'sensor_offline'
  | 'info';

export interface LiveEvent {
  id: string;
  kind: LiveEventKind;
  title: string;
  description: string;
  occurredAt: ISODateString;
  tone: StatusTone;
}

/* ----------------------------------------------------------------------- */
/* 9. Operational map placeholder                                           */
/* ----------------------------------------------------------------------- */

export interface MapRoutePoint {
  latitude: number;
  longitude: number;
}

export interface MapPlaceholder {
  origin: string;
  destination: string;
  currentPosition: string;
  upcomingCheckpoint: string;
  etaAt: ISODateString;
  progressPct: number;
  /** Polyline the SVG renders; reserved for a future tile/map backend. */
  route: MapRoutePoint[];
  /** Index of `currentPosition` within `route`. */
  currentIndex: number;
}

/* ----------------------------------------------------------------------- */
/* 10. Emergency status panel                                               */
/* ----------------------------------------------------------------------- */

export interface EmergencyContact {
  name: string;
  role: string;
  phone: string;
}

export interface EmergencySummary {
  criticalAlerts: number;
  warnings: number;
  normalEvents: number;
  contacts: EmergencyContact[];
  /** Context-aware recommendation derived from live cargo state. */
  recommendedAction: string;
  tone: StatusTone;
}

/* ----------------------------------------------------------------------- */
/* Aggregate frame returned by `liveMonitoringApi.getLiveState`             */
/* ----------------------------------------------------------------------- */

export interface LiveMonitoringFrame {
  shipmentId: string;
  capturedAt: ISODateString;
  sensorOverview: SensorOverviewCard[];
  healthScore: HealthScoreBreakdown;
  truckStatus: TruckStatus;
  connectivity: ConnectivityRow[];
  events: LiveEvent[];
  series: LiveMonitoringSeries;
  thresholds: LiveThresholds;
  map: MapPlaceholder;
  emergency: EmergencySummary;
}
