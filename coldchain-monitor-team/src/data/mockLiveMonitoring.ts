import type {
  AirQualityLevel,
  ConnectivityRow,
  EnvironmentalConditions,
  LiveEvent,
  MapPlaceholder,
  MapRoutePoint,
  ShipmentSelectorItem,
} from '@/types';
import { commodityLabels } from '@/utils/domain';
import { minutesAgo } from '@/utils/date';
import { createSeededRandom, pick } from './mockFactory';
import { findMockShipment, mockShipments } from './mockShipments';

/**
 * Mock builders for the Live Monitoring screen.
 *
 * These mirror the shape the backend is expected to return so the UI never
 * changes when mock is swapped for a real endpoint. The live, streaming parts
 * (sensor values, health score, events, GPS) are produced by the simulation
 * engine in `services/liveSimulation.ts`; the mostly-static context here
 * (selector roster, ambient weather, connectivity roster seed, route geometry)
 * is built deterministically per shipment.
 */

/** Stable numeric seed derived from a shipment id. */
const seedFor = (shipmentId: string): number =>
  Math.abs([...shipmentId].reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 9973;

/* ----------------------------------------------------------------------- */
/* Shipment selector roster                                                 */
/* ----------------------------------------------------------------------- */

export const buildSelectorShipments = (): ShipmentSelectorItem[] =>
  mockShipments.map((shipment) => ({
    id: shipment.id,
    code: shipment.code,
    truckNumber: shipment.vehicle.registrationNumber,
    driverName: shipment.vehicle.driverName,
    productType: commodityLabels[shipment.commodity],
    commodity: shipment.commodity,
    origin: shipment.route.origin,
    destination: shipment.route.destination,
    status: shipment.status,
    etaAt: shipment.etaAt,
    healthScore: shipment.healthScore,
    riskLevel: shipment.riskLevel,
    currentLocation: shipment.currentLocation,
    progressPct: shipment.progressPct,
  }));

/* ----------------------------------------------------------------------- */
/* Environmental / ambient weather                                          */
/* ----------------------------------------------------------------------- */

const CONDITION_LABELS: Record<EnvironmentalConditions['condition'], string> = {
  clear: 'Clear',
  partly_cloudy: 'Partly cloudy',
  cloudy: 'Cloudy',
  rain: 'Rain',
  thunderstorm: 'Thunderstorm',
  haze: 'Haze',
};

const CONDITIONS: EnvironmentalConditions['condition'][] = [
  'clear',
  'partly_cloudy',
  'haze',
  'cloudy',
  'rain',
];

function airQualityFromIndex(aqi: number): { level: AirQualityLevel; label: string } {
  if (aqi < 50) return { level: 'good', label: 'Good' };
  if (aqi < 100) return { level: 'moderate', label: 'Moderate' };
  if (aqi < 200) return { level: 'unhealthy', label: 'Unhealthy' };
  return { level: 'hazardous', label: 'Hazardous' };
}

/** Today's sunrise / sunset as ISO strings (fixed local times). */
function todaySun(): { sunriseAt: string; sunsetAt: string } {
  const sunrise = new Date();
  sunrise.setHours(6, 8, 0, 0);
  const sunset = new Date();
  sunset.setHours(18, 44, 0, 0);
  return { sunriseAt: sunrise.toISOString(), sunsetAt: sunset.toISOString() };
}

/**
 * Ambient conditions outside the container (origin-region weather).
 *
 * The result is seeded per shipment and given a tiny time-based oscillation so
 * the panel feels alive without ever producing extremes.
 */
export const buildEnvironmental = (shipmentId: string): EnvironmentalConditions => {
  const shipment = findMockShipment(shipmentId) ?? mockShipments[0]!;
  const random = createSeededRandom(seedFor(shipmentId) + 3);
  const condition = pick(CONDITIONS, seedFor(shipmentId));
  const wobble = Math.sin(Date.now() / 240_000);

  const temperatureC = Math.round((28 + random() * 10 + wobble * 0.6) * 10) / 10;
  const humidityPct = Math.round(54 + random() * 32);
  const windSpeedKph = Math.round((6 + random() * 20) * 10) / 10;
  const airQualityIndex = Math.round(42 + random() * 130);
  const aq = airQualityFromIndex(airQualityIndex);
  const { sunriseAt, sunsetAt } = todaySun();

  return {
    location: `${shipment.route.destination} region`,
    observedAt: minutesAgo(4),
    temperatureC,
    humidityPct,
    condition,
    conditionLabel: CONDITION_LABELS[condition],
    windSpeedKph,
    feelsLikeC: Math.round((temperatureC + 2.5 + random() * 4) * 10) / 10,
    sunriseAt,
    sunsetAt,
    airQualityIndex,
    airQualityLevel: aq.level,
    airQualityLabel: aq.label,
  };
};

/* ----------------------------------------------------------------------- */
/* Connectivity roster seed                                                 */
/* ----------------------------------------------------------------------- */

const SENSOR_ROSTER = [
  { id: 'temp', name: 'Cabin Temperature Probe' },
  { id: 'hum', name: 'Humidity Sensor' },
  { id: 'door', name: 'Door Contact Sensor' },
  { id: 'gps', name: 'GPS Module' },
  { id: 'cool', name: 'Cooling Controller' },
  { id: 'batt', name: 'Battery Monitor' },
] as const;

/** Initial sensor connectivity rows; the engine drifts signal/battery live. */
export const buildConnectivitySeed = (shipmentId: string): ConnectivityRow[] => {
  const random = createSeededRandom(seedFor(shipmentId) + 17);

  return SENSOR_ROSTER.map((sensor) => {
    const roll = random();
    const status = roll > 0.9 ? 'degraded' : roll > 0.97 ? 'offline' : 'online';
    const signalStrengthPct = Math.round(status === 'offline' ? 0 : 55 + random() * 44);
    const batteryPct = Math.round(60 + random() * 38);
    const health = Math.round(
      status === 'offline'
        ? 8 + random() * 12
        : 70 + (signalStrengthPct / 100) * 22 + (batteryPct / 100) * 8,
    );
    const tone = status === 'offline' ? 'danger' : status === 'degraded' ? 'warning' : 'success';

    return {
      id: `sens-${shipmentId.slice(-5)}-${sensor.id}`,
      sensorName: sensor.name,
      status,
      signalStrengthPct,
      lastCommunicationAt: minutesAgo(Math.round(random() * 3)),
      batteryPct,
      health: Math.min(100, health),
      tone,
    } satisfies ConnectivityRow;
  });
};

/* ----------------------------------------------------------------------- */
/* Operational map geometry (placeholder polyline)                         */
/* ----------------------------------------------------------------------- */

const CHECKPOINT_NAMES = [
  'Krishnagiri checkpoint',
  'Bangalore bypass',
  'Chitradurga halt',
  'Hubli weighbridge',
  'Belagavi gate',
];

/**
 * Synthesise a smooth-ish route polyline between two synthetic endpoints.
 * Coordinates are invented (India bounding box) — this is a placeholder for a
 * future map-tile / routing backend, not real geocoding.
 */
export const buildMapSeed = (shipmentId: string): MapPlaceholder => {
  const shipment = findMockShipment(shipmentId) ?? mockShipments[0]!;
  const random = createSeededRandom(seedFor(shipmentId) + 41);

  const startLat = 8 + random() * 16;
  const startLng = 68 + random() * 12;
  const endLat = 12 + random() * 16;
  const endLng = 76 + random() * 14;
  const curvature = (random() - 0.5) * 4;

  const points: MapRoutePoint[] = Array.from({ length: 12 }, (_, index) => {
    const progress = index / 11;
    const lat =
      startLat + (endLat - startLat) * progress + Math.sin(progress * Math.PI) * curvature;
    const lng = startLng + (endLng - startLng) * progress;
    return { latitude: Math.round(lat * 1000) / 1000, longitude: Math.round(lng * 1000) / 1000 };
  });

  const progressPct = shipment.progressPct;
  const currentIndex = Math.min(
    points.length - 1,
    Math.round((progressPct / 100) * (points.length - 1)),
  );

  return {
    origin: shipment.route.origin,
    destination: shipment.route.destination,
    currentPosition: shipment.currentLocation,
    upcomingCheckpoint: pick(CHECKPOINT_NAMES, seedFor(shipmentId) + currentIndex),
    etaAt: shipment.etaAt,
    progressPct,
    route: points,
    currentIndex,
  };
};

/* ----------------------------------------------------------------------- */
/* Initial event timeline                                                   */
/* ----------------------------------------------------------------------- */

/** A few plausible historical events so the timeline is populated on load. */
export const buildSeedEvents = (shipmentId: string): LiveEvent[] => {
  const shipment = findMockShipment(shipmentId) ?? mockShipments[0]!;
  const base = [
    {
      kind: 'prediction_requested' as const,
      title: 'Prediction generated',
      description: `Model scored ${(shipment.riskScore * 100).toFixed(0)}% arrival spoilage probability.`,
      occurredAt: minutesAgo(36),
      tone: 'brand' as const,
    },
    {
      kind: 'checkpoint' as const,
      title: 'Checkpoint reached',
      description: `Consignment passed ${pick(CHECKPOINT_NAMES, seedFor(shipmentId))}.`,
      occurredAt: minutesAgo(22),
      tone: 'info' as const,
    },
    {
      kind: 'info' as const,
      title: 'Telemetry stream established',
      description: 'All paired loggers reporting nominal values.',
      occurredAt: minutesAgo(14),
      tone: 'success' as const,
    },
  ];

  return base.map((event, index) => ({
    id: `evt-seed-${shipmentId}-${index}`,
    ...event,
  }));
};
