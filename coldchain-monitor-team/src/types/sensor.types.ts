import type { GeoPoint, ISODateString, StatusTone, TimeSeriesPoint } from './common.types';

/** Physical quantities streamed by in-container IoT loggers. */
export type SensorMetricKey = 'temperature' | 'humidity' | 'ethylene' | 'co2' | 'vibration';

export type DeviceConnectivity = 'online' | 'degraded' | 'offline';

/** A single multi-sensor sample emitted by a logger. */
export interface SensorReading {
  id: string;
  deviceId: string;
  shipmentId: string;
  recordedAt: ISODateString;
  temperatureC: number;
  humidityPct: number;
  ethylenePpm: number;
  co2Ppm: number;
  vibrationG: number;
  doorOpen: boolean;
  batteryPct: number;
  location: GeoPoint;
}

export interface SensorDevice {
  id: string;
  label: string;
  shipmentId: string;
  connectivity: DeviceConnectivity;
  batteryPct: number;
  signalStrengthPct: number;
  firmwareVersion: string;
  lastSeenAt: ISODateString;
}

/** Acceptable operating band for a metric, per commodity. */
export interface MetricThreshold {
  min: number;
  max: number;
}

export interface TelemetrySeries {
  metric: SensorMetricKey;
  label: string;
  unit: string;
  tone: StatusTone;
  threshold?: MetricThreshold;
  points: TimeSeriesPoint[];
}

/** Everything the Live Monitoring page needs for one shipment. */
export interface TelemetrySnapshot {
  shipmentId: string;
  capturedAt: ISODateString;
  latest: SensorReading;
  devices: SensorDevice[];
  series: TelemetrySeries[];
  /** Count of readings outside the commodity threshold in the window. */
  excursionCount: number;
}
