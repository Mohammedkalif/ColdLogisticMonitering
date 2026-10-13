import type {
  AirQualityLevel,
  AlertCategory,
  AlertSeverity,
  AlertStatus,
  CommodityType,
  CoolingStatus,
  DeviceConnectivity,
  DriverStatus,
  EngineStatus,
  LiveEventKind,
  ModelStatus,
  PackagingType,
  RiskLevel,
  SensorOverviewKey,
  ServiceStatus,
  ShipmentOutcome,
  ShipmentStatus,
  StatusTone,
  VehicleType,
} from '@/types';

/**
 * Display metadata for domain enums.
 *
 * Keeping labels + tones here means a component never decides what "critical"
 * looks like, and a backend rename only touches one file.
 */
export interface EnumMeta {
  label: string;
  tone: StatusTone;
  description?: string;
}

export const riskLevelMeta: Record<RiskLevel, EnumMeta> = {
  low: { label: 'Low', tone: 'success', description: 'Within safe operating band' },
  moderate: { label: 'Moderate', tone: 'warning', description: 'Monitor closely' },
  high: { label: 'High', tone: 'danger', description: 'Intervention recommended' },
  critical: { label: 'Critical', tone: 'danger', description: 'Immediate action required' },
};

export const shipmentStatusMeta: Record<ShipmentStatus, EnumMeta> = {
  scheduled: { label: 'Scheduled', tone: 'neutral' },
  in_transit: { label: 'In transit', tone: 'brand' },
  delayed: { label: 'Delayed', tone: 'warning' },
  unloading: { label: 'Unloading', tone: 'info' },
  delivered: { label: 'Delivered', tone: 'success' },
};

export const alertSeverityMeta: Record<AlertSeverity, EnumMeta> = {
  critical: { label: 'Critical', tone: 'danger' },
  warning: { label: 'Warning', tone: 'warning' },
  info: { label: 'Info', tone: 'info' },
};

export const alertStatusMeta: Record<AlertStatus, EnumMeta> = {
  open: { label: 'Open', tone: 'danger' },
  acknowledged: { label: 'Acknowledged', tone: 'warning' },
  resolved: { label: 'Resolved', tone: 'success' },
};

export const alertCategoryMeta: Record<AlertCategory, EnumMeta> = {
  temperature_excursion: { label: 'Temperature excursion', tone: 'danger' },
  humidity_deviation: { label: 'Humidity deviation', tone: 'warning' },
  spoilage_risk: { label: 'Spoilage risk', tone: 'danger' },
  device_offline: { label: 'Device offline', tone: 'neutral' },
  door_open: { label: 'Door open', tone: 'warning' },
  route_delay: { label: 'Route delay', tone: 'info' },
};

export const deviceConnectivityMeta: Record<DeviceConnectivity, EnumMeta> = {
  online: { label: 'Online', tone: 'success' },
  degraded: { label: 'Degraded', tone: 'warning' },
  offline: { label: 'Offline', tone: 'danger' },
};

export const serviceStatusMeta: Record<ServiceStatus, EnumMeta> = {
  operational: { label: 'Operational', tone: 'success' },
  degraded: { label: 'Degraded', tone: 'warning' },
  down: { label: 'Down', tone: 'danger' },
};

export const modelStatusMeta: Record<ModelStatus, EnumMeta> = {
  active: { label: 'Active', tone: 'success', description: 'Serving production traffic' },
  shadow: { label: 'Shadow', tone: 'info', description: 'Scoring silently for evaluation' },
  training: { label: 'Training', tone: 'warning', description: 'Being retrained' },
};

export const shipmentOutcomeMeta: Record<ShipmentOutcome, EnumMeta> = {
  accepted: { label: 'Accepted', tone: 'success' },
  partial_loss: { label: 'Partial loss', tone: 'warning' },
  rejected: { label: 'Rejected', tone: 'danger' },
};

/* ----------------------------------------------------------------------- */
/* Live Monitoring enums                                                    */
/* ----------------------------------------------------------------------- */

export const engineStatusMeta: Record<EngineStatus, EnumMeta> = {
  running: { label: 'Running', tone: 'success' },
  idling: { label: 'Idling', tone: 'warning' },
  off: { label: 'Off', tone: 'neutral' },
};

export const coolingStatusMeta: Record<CoolingStatus, EnumMeta> = {
  nominal: { label: 'Nominal', tone: 'success' },
  strained: { label: 'Strained', tone: 'warning' },
  fault: { label: 'Fault', tone: 'danger' },
};

export const driverStatusMeta: Record<DriverStatus, EnumMeta> = {
  driving: { label: 'Driving', tone: 'success' },
  resting: { label: 'Resting', tone: 'warning' },
  off_duty: { label: 'Off duty', tone: 'neutral' },
  unavailable: { label: 'Unavailable', tone: 'danger' },
};

export const airQualityMeta: Record<AirQualityLevel, EnumMeta> = {
  good: { label: 'Good', tone: 'success' },
  moderate: { label: 'Moderate', tone: 'warning' },
  unhealthy: { label: 'Unhealthy', tone: 'danger' },
  hazardous: { label: 'Hazardous', tone: 'danger' },
};

export const liveEventMeta: Record<LiveEventKind, EnumMeta> = {
  door_open: { label: 'Door opened', tone: 'warning' },
  door_close: { label: 'Door closed', tone: 'success' },
  temperature_excursion: { label: 'Temperature excursion', tone: 'danger' },
  cooling_adjust: { label: 'Cooling adjusted', tone: 'info' },
  checkpoint: { label: 'Checkpoint reached', tone: 'info' },
  prediction_requested: { label: 'Prediction requested', tone: 'brand' },
  sensor_reconnected: { label: 'Sensor reconnected', tone: 'success' },
  sensor_offline: { label: 'Sensor offline', tone: 'danger' },
  info: { label: 'Info', tone: 'neutral' },
};

export const sensorOverviewMeta: Record<SensorOverviewKey, { label: string }> = {
  temperature: { label: 'Temperature' },
  humidity: { label: 'Humidity' },
  door: { label: 'Door Status' },
  gps: { label: 'GPS Signal' },
  battery: { label: 'Battery' },
  cooling: { label: 'Cooling Unit' },
};

export const commodityLabels: Record<CommodityType, string> = {
  banana: 'Banana',
  mango: 'Mango',
  tomato: 'Tomato',
  grapes: 'Grapes',
  leafy_greens: 'Leafy greens',
  apple: 'Apple',
  onion: 'Onion',
  green_chilli: 'Green chilli',
};

export const vehicleTypeLabels: Record<VehicleType, string> = {
  reefer_truck: 'Reefer truck',
  insulated_van: 'Insulated van',
  refrigerated_container: 'Refrigerated container',
};

export const packagingLabels: Record<PackagingType, string> = {
  corrugated_box: 'Corrugated box',
  plastic_crate: 'Plastic crate',
  jute_bag: 'Jute bag',
  vented_carton: 'Vented carton',
};

/** Map a spoilage probability (0-1) to the shared risk buckets. */
export function riskLevelFromScore(score: number): RiskLevel {
  if (score >= 0.75) return 'critical';
  if (score >= 0.5) return 'high';
  if (score >= 0.25) return 'moderate';
  return 'low';
}
