import type { SensorDevice, SensorReading, TelemetrySeries, TelemetrySnapshot } from '@/types';
import { minutesAgo } from '@/utils/date';
import { buildSeries, createSeededRandom } from './mockFactory';
import { findMockShipment, mockShipments } from './mockShipments';

/** Stable numeric seed derived from a shipment id. */
const seedFor = (shipmentId: string): number =>
  Math.abs([...shipmentId].reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 9973;

const deviceSuffixes = ['A', 'B'];

function buildDevices(shipmentId: string): SensorDevice[] {
  const seed = seedFor(shipmentId);
  const random = createSeededRandom(seed);

  return deviceSuffixes.map((suffix, index) => {
    const roll = random();
    return {
      id: `dev-${shipmentId.slice(-5)}-${suffix.toLowerCase()}`,
      label: `Logger ${suffix} · ${index === 0 ? 'Front bay' : 'Rear bay'}`,
      shipmentId,
      connectivity: roll > 0.85 ? 'degraded' : roll > 0.95 ? 'offline' : 'online',
      batteryPct: Math.round(52 + roll * 45),
      signalStrengthPct: Math.round(48 + random() * 50),
      firmwareVersion: index === 0 ? '3.2.1' : '3.1.8',
      lastSeenAt: minutesAgo(Math.round(random() * 4)),
    } satisfies SensorDevice;
  });
}

function buildLatestReading(shipmentId: string): SensorReading {
  const shipment = findMockShipment(shipmentId) ?? mockShipments[0]!;
  const random = createSeededRandom(seedFor(shipmentId) + 5);

  return {
    id: `rdg-${shipmentId}-latest`,
    deviceId: `dev-${shipmentId.slice(-5)}-a`,
    shipmentId,
    recordedAt: minutesAgo(1),
    temperatureC: shipment.temperatureC,
    humidityPct: shipment.humidityPct,
    ethylenePpm: Math.round((0.4 + random() * 2.6) * 100) / 100,
    co2Ppm: Math.round(600 + random() * 900),
    vibrationG: Math.round((0.1 + random() * 0.6) * 100) / 100,
    doorOpen: false,
    batteryPct: Math.round(60 + random() * 38),
    location: { latitude: 12.9716 + random(), longitude: 77.5946 + random() },
  };
}

/** Points per analysis window, keeping charts readable at every zoom level. */
const WINDOW_CONFIG: Record<string, { points: number; stepMinutes: number }> = {
  '1h': { points: 30, stepMinutes: 2 },
  '24h': { points: 48, stepMinutes: 30 },
  '7d': { points: 56, stepMinutes: 180 },
  '30d': { points: 60, stepMinutes: 720 },
  '90d': { points: 90, stepMinutes: 1440 },
};

export function buildTelemetrySeries(shipmentId: string, range = '24h'): TelemetrySeries[] {
  const shipment = findMockShipment(shipmentId) ?? mockShipments[0]!;
  const seed = seedFor(shipmentId);
  const { points, stepMinutes } = WINDOW_CONFIG[range] ?? WINDOW_CONFIG['24h']!;

  return [
    {
      metric: 'temperature',
      label: 'Temperature',
      unit: '°C',
      tone: 'brand',
      threshold: { min: 12, max: 15 },
      points: buildSeries({
        points,
        stepMinutes,
        baseline: shipment.temperatureC,
        amplitude: 1.4,
        drift: 0.6,
        seed,
      }),
    },
    {
      metric: 'humidity',
      label: 'Humidity',
      unit: '%',
      tone: 'info',
      threshold: { min: 85, max: 95 },
      points: buildSeries({
        points,
        stepMinutes,
        baseline: shipment.humidityPct,
        amplitude: 3.2,
        drift: -1.2,
        decimals: 0,
        seed: seed + 31,
      }),
    },
    {
      metric: 'ethylene',
      label: 'Ethylene',
      unit: 'ppm',
      tone: 'warning',
      threshold: { min: 0, max: 2.5 },
      points: buildSeries({
        points,
        stepMinutes,
        baseline: 1.4,
        amplitude: 0.5,
        drift: 0.3,
        decimals: 2,
        seed: seed + 67,
      }),
    },
  ];
}

export function buildTelemetrySnapshot(shipmentId: string, range = '24h'): TelemetrySnapshot {
  const series = buildTelemetrySeries(shipmentId, range);
  const temperature = series[0]!;
  const excursionCount = temperature.points.filter(
    (point) =>
      temperature.threshold !== undefined &&
      (point.value < temperature.threshold.min || point.value > temperature.threshold.max),
  ).length;

  return {
    shipmentId,
    capturedAt: new Date().toISOString(),
    latest: buildLatestReading(shipmentId),
    devices: buildDevices(shipmentId),
    series,
    excursionCount,
  };
}
