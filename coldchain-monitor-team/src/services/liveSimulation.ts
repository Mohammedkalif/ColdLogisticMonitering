import type {
  ConnectivityRow,
  CoolingStatus,
  DeviceConnectivity,
  EmergencySummary,
  EngineStatus,
  HealthScoreBreakdown,
  LiveEvent,
  LiveEventKind,
  LiveMonitoringFrame,
  LiveThresholds,
  MapPlaceholder,
  SensorOverviewCard,
  StatusTone,
  TimeSeriesPoint,
  TrendDirection,
  TrendIndicator,
} from '@/types';
import { clamp } from '@/utils/format';
import { buildConnectivitySeed, buildMapSeed, buildSeedEvents } from '@/data/mockLiveMonitoring';
import { buildSeries, createSeededRandom } from '@/data/mockFactory';
import { findMockShipment, mockShipments } from '@/data/mockShipments';

/**
 * ---------------------------------------------------------------------------
 * Reusable live-streaming simulation engine
 * ---------------------------------------------------------------------------
 * This is the ONLY place that fabricates "live" telemetry. The service layer
 * (`liveMonitoringApi`) forwards `step()` output to the UI, exactly as a real
 * WebSocket / SSE subscription would forward server-pushed frames.
 *
 * Design goals:
 *  - Believable values: every metric follows a mean-reverting random walk with
 *    clamping, so readings drift gently and never jump to extremes.
 *  - Stateful per shipment: a simulator instance is kept alive in a registry,
 *    so switching away and back resumes the same journey.
 *  - API-ready: swap `liveMonitoringApi.getLiveState` for a socket subscription
 *    and delete this file — no component or hook changes.
 *
 * ML integration point: replace the synthetic `health` / `coolingStatus`
 * derivation with model output once a prediction service is available.
 */

const MAX_POINTS = 48;
const STEP_MINUTES = 4;

interface CommodityBand {
  tempMin: number;
  tempMax: number;
  humMin: number;
  humMax: number;
}

const COMMODITY_BANDS: Record<string, CommodityBand> = {
  banana: { tempMin: 12, tempMax: 15, humMin: 85, humMax: 95 },
  mango: { tempMin: 10, tempMax: 13, humMin: 85, humMax: 95 },
  tomato: { tempMin: 12, tempMax: 15, humMin: 85, humMax: 92 },
  grapes: { tempMin: 0, tempMax: 2, humMin: 85, humMax: 95 },
  leafy_greens: { tempMin: 0, tempMax: 4, humMin: 90, humMax: 98 },
  apple: { tempMin: 0, tempMax: 4, humMin: 90, humMax: 95 },
  onion: { tempMin: 0, tempMax: 4, humMin: 65, humMax: 75 },
  green_chilli: { tempMin: 7, tempMax: 10, humMin: 80, humMax: 90 },
};

const FALLBACK_BAND: CommodityBand = { tempMin: 2, tempMax: 8, humMin: 80, humMax: 95 };

interface SimState {
  shipmentId: string;
  riskScore: number;
  distanceKm: number;
  band: CommodityBand;
  tempSetpoint: number;
  humMid: number;
  temperatureC: number;
  humidityPct: number;
  doorOpen: boolean;
  batteryPct: number;
  fuelPct: number;
  signalStrengthPct: number;
  coolingStatus: CoolingStatus;
  prevCooling: CoolingStatus;
  engineStatus: EngineStatus;
  speedKph: number;
  latitude: number;
  longitude: number;
  progressPct: number;
  truckId: string;
  registrationNumber: string;
  driverName: string;
  temperatureSeries: TimeSeriesPoint[];
  humiditySeries: TimeSeriesPoint[];
  coolingSeries: TimeSeriesPoint[];
  signalSeries: TimeSeriesPoint[];
  batterySeries: TimeSeriesPoint[];
  connectivity: ConnectivityRow[];
  prevConnStatus: Record<string, DeviceConnectivity>;
  map: MapPlaceholder;
  events: LiveEvent[];
  excursionActive: boolean;
  stepCount: number;
}

/* ----------------------------------------------------------------------- */
/* Engine registry — one simulator instance per shipment                   */
/* ----------------------------------------------------------------------- */

const registry = new Map<string, SimState>();

const seedFor = (shipmentId: string): number =>
  Math.abs([...shipmentId].reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 9973;

function createState(shipmentId: string): SimState {
  const shipment = findMockShipment(shipmentId) ?? mockShipments[0]!;
  const band = COMMODITY_BANDS[shipment.commodity] ?? FALLBACK_BAND;
  const seed = seedFor(shipmentId);
  const random = createSeededRandom(seed);

  const temperatureC = clamp(shipment.temperatureC, band.tempMin - 3, band.tempMax + 3);
  const humidityPct = clamp(shipment.humidityPct, band.humMin - 6, band.humMax + 4);
  const fuelPct = clamp(96 - shipment.progressPct * 0.55 + (random() - 0.5) * 8, 8, 100);
  const signalStrengthPct = Math.round(70 + random() * 25);
  const batteryPct = Math.round(64 + random() * 32);

  const map = buildMapSeed(shipmentId);
  const connectivity = buildConnectivitySeed(shipmentId);
  const prevConnStatus = Object.fromEntries(connectivity.map((row) => [row.id, row.status]));

  const temperatureSeries = buildSeries({
    points: MAX_POINTS,
    stepMinutes: STEP_MINUTES,
    baseline: temperatureC,
    amplitude: 0.9,
    drift: 0.1,
    decimals: 1,
    seed,
  });
  const humiditySeries = buildSeries({
    points: MAX_POINTS,
    stepMinutes: STEP_MINUTES,
    baseline: humidityPct,
    amplitude: 2.4,
    drift: -0.6,
    decimals: 1,
    seed: seed + 31,
  });
  const coolingSeries = buildSeries({
    points: MAX_POINTS,
    stepMinutes: STEP_MINUTES,
    baseline: 93,
    amplitude: 5,
    drift: -0.4,
    decimals: 0,
    seed: seed + 53,
  });
  const signalSeries = buildSeries({
    points: MAX_POINTS,
    stepMinutes: STEP_MINUTES,
    baseline: signalStrengthPct,
    amplitude: 9,
    drift: -0.6,
    decimals: 0,
    seed: seed + 71,
  });
  const batterySeries = buildSeries({
    points: MAX_POINTS,
    stepMinutes: STEP_MINUTES,
    baseline: batteryPct,
    amplitude: 1.5,
    drift: -0.5,
    decimals: 1,
    seed: seed + 89,
  });

  const startPoint = map.route[map.currentIndex] ?? map.route[0]!;

  return {
    shipmentId,
    riskScore: shipment.riskScore,
    distanceKm: shipment.route.distanceKm,
    band,
    tempSetpoint: (band.tempMin + band.tempMax) / 2,
    humMid: (band.humMin + band.humMax) / 2,
    temperatureC,
    humidityPct,
    doorOpen: false,
    batteryPct,
    fuelPct,
    signalStrengthPct,
    coolingStatus: 'nominal',
    prevCooling: 'nominal',
    engineStatus: shipment.progressPct >= 100 ? 'off' : 'running',
    speedKph: shipment.progressPct >= 100 ? 0 : Math.round(52 + random() * 26),
    latitude: startPoint.latitude,
    longitude: startPoint.longitude,
    progressPct: shipment.progressPct,
    truckId: shipment.vehicle.id,
    registrationNumber: shipment.vehicle.registrationNumber,
    driverName: shipment.vehicle.driverName,
    temperatureSeries,
    humiditySeries,
    coolingSeries,
    signalSeries,
    batterySeries,
    connectivity,
    prevConnStatus,
    map,
    events: buildSeedEvents(shipmentId),
    excursionActive: temperatureC > band.tempMax,
    stepCount: 0,
  };
}

/** Get (or lazily create) the per-shipment simulator. */
export function getSimulator(shipmentId: string): SimState {
  let state = registry.get(shipmentId);
  if (!state) {
    state = createState(shipmentId);
    registry.set(shipmentId, state);
  }
  return state;
}

/* ----------------------------------------------------------------------- */
/* Event helper                                                             */
/* ----------------------------------------------------------------------- */

function pushEvent(
  state: SimState,
  kind: LiveEventKind,
  title: string,
  description: string,
  tone: StatusTone,
): void {
  state.events.unshift({
    id: `evt-${state.shipmentId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    kind,
    title,
    description,
    occurredAt: new Date().toISOString(),
    tone,
  });
  if (state.events.length > 30) state.events.length = 30;
}

/* ----------------------------------------------------------------------- */
/* Step — advance the simulation by one tick                                */
/* ----------------------------------------------------------------------- */

function append(series: TimeSeriesPoint[], value: number, decimals = 1): void {
  series.push({
    timestamp: new Date().toISOString(),
    value: Math.round(value * 10 ** decimals) / 10 ** decimals,
  });
  if (series.length > MAX_POINTS) series.shift();
}

function step(state: SimState): void {
  state.stepCount += 1;
  const { band, tempSetpoint } = state;

  /* Higher-risk consignments fight a gentle upward thermal bias. */
  const struggle = clamp((state.riskScore - 0.4) * 4, 0, 1.2);
  const tempTarget = tempSetpoint + struggle;

  state.temperatureC = clamp(
    state.temperatureC + (tempTarget - state.temperatureC) * 0.05 + (Math.random() - 0.5) * 0.5,
    band.tempMin - 3.5,
    band.tempMax + 3.5,
  );
  state.humidityPct = clamp(
    state.humidityPct + (state.humMid - state.humidityPct) * 0.05 + (Math.random() - 0.5) * 0.8,
    55,
    99,
  );

  /* Door — mostly closed, brief occasional openings. */
  if (state.doorOpen) {
    if (Math.random() < 0.4) {
      state.doorOpen = false;
      pushEvent(
        state,
        'door_close',
        'Door closed',
        'Rear door secured; cold chain restored.',
        'success',
      );
    }
  } else if (Math.random() < 0.015) {
    state.doorOpen = true;
    pushEvent(state, 'door_open', 'Door opened', 'Rear door opened during transit.', 'warning');
  }

  /* Battery (logger) and fuel (truck) drain slowly. */
  state.batteryPct = clamp(state.batteryPct - 0.02 - Math.random() * 0.015, 8, 100);
  state.fuelPct = clamp(
    state.fuelPct - (state.speedKph > 2 ? 0.05 : 0.01) - Math.random() * 0.02,
    0,
    100,
  );

  /* GPS signal quality random walk with occasional dips. */
  state.signalStrengthPct = clamp(state.signalStrengthPct + (Math.random() - 0.5) * 10, 18, 99);
  if (Math.random() < 0.04) state.signalStrengthPct = clamp(state.signalStrengthPct - 12, 18, 99);

  /* Speed / engine. */
  if (state.progressPct >= 100) {
    state.speedKph = 0;
    state.engineStatus = 'off';
  } else {
    state.speedKph = clamp(state.speedKph + (Math.random() - 0.5) * 12, 0, 96);
    if (Math.random() < 0.04) state.speedKph = 0;
    state.engineStatus = state.speedKph > 2 ? 'running' : 'idling';
  }

  /* Cooling unit status derived from temperature deviation. */
  state.prevCooling = state.coolingStatus;
  if (state.temperatureC > band.tempMax + 0.6 || state.temperatureC < band.tempMin - 0.6) {
    state.coolingStatus = 'fault';
  } else if (Math.abs(state.temperatureC - tempSetpoint) > (band.tempMax - tempSetpoint) * 0.7) {
    state.coolingStatus = 'strained';
  } else {
    state.coolingStatus = 'nominal';
  }
  if (Math.random() < 0.004) state.coolingStatus = 'fault';
  if (Math.random() < 0.02 && state.coolingStatus === 'nominal') state.coolingStatus = 'strained';
  if (state.coolingStatus === 'fault' && Math.random() < 0.12) state.coolingStatus = 'strained';

  if (state.coolingStatus !== state.prevCooling) {
    if (state.coolingStatus === 'fault') {
      pushEvent(
        state,
        'cooling_adjust',
        'Cooling fault',
        'Cooling unit reporting a fault; verify setpoint.',
        'danger',
      );
    } else if (state.coolingStatus === 'strained' && state.prevCooling === 'nominal') {
      pushEvent(
        state,
        'cooling_adjust',
        'Cooling strained',
        'Cooling unit straining to hold setpoint.',
        'info',
      );
    }
  }

  /* Temperature excursion edges. */
  if (state.temperatureC > band.tempMax && !state.excursionActive) {
    state.excursionActive = true;
    pushEvent(
      state,
      'temperature_excursion',
      'Temperature excursion',
      `Cargo at ${state.temperatureC.toFixed(1)} °C above the ${band.tempMax} °C ceiling.`,
      'danger',
    );
  } else if (state.temperatureC <= band.tempMax && state.excursionActive) {
    state.excursionActive = false;
  }

  /* Progress + GPS position along the route. */
  state.progressPct = clamp(
    state.progressPct + (state.speedKph > 2 ? 0.06 : 0) + Math.random() * 0.02,
    0,
    100,
  );
  const route = state.map.route;
  const targetIndex = Math.min(
    route.length - 1,
    Math.round((state.progressPct / 100) * (route.length - 1)),
  );
  if (targetIndex !== state.map.currentIndex) {
    state.map.currentIndex = targetIndex;
    const point = route[targetIndex]!;
    state.latitude = point.latitude;
    state.longitude = point.longitude;
    if (targetIndex > state.map.currentIndex - 1 && targetIndex % 3 === 0) {
      pushEvent(
        state,
        'checkpoint',
        'Checkpoint reached',
        'Consignment crossed a route checkpoint.',
        'info',
      );
    }
  }

  /* Drift connectivity roster. */
  for (const row of state.connectivity) {
    row.signalStrengthPct = clamp(row.signalStrengthPct + (Math.random() - 0.5) * 12, 0, 99);
    row.batteryPct = clamp(row.batteryPct - 0.03 - Math.random() * 0.02, 6, 100);
    row.lastCommunicationAt = new Date(
      Date.now() - Math.round(Math.random() * 90_000),
    ).toISOString();

    if (row.status !== 'offline' && Math.random() < 0.01) row.status = 'degraded';
    else if (row.status === 'degraded' && Math.random() < 0.05) row.status = 'online';
    else if (row.status !== 'offline' && Math.random() < 0.004) row.status = 'offline';
    else if (row.status === 'offline' && Math.random() < 0.08) row.status = 'online';

    const offline = row.status === 'offline';
    row.health = Math.min(
      100,
      Math.round(
        offline
          ? 8 + Math.random() * 12
          : 70 + (row.signalStrengthPct / 100) * 22 + (row.batteryPct / 100) * 8,
      ),
    );
    row.tone = offline ? 'danger' : row.status === 'degraded' ? 'warning' : 'success';

    const prev = state.prevConnStatus[row.id];
    if (prev && prev !== row.status) {
      if (row.status === 'offline') {
        pushEvent(
          state,
          'sensor_offline',
          'Sensor offline',
          `${row.sensorName} stopped reporting.`,
          'danger',
        );
      } else if (row.status === 'online' && prev === 'offline') {
        pushEvent(
          state,
          'sensor_reconnected',
          'Sensor reconnected',
          `${row.sensorName} reconnected.`,
          'success',
        );
      }
    }
    state.prevConnStatus[row.id] = row.status;
  }

  /* Append series points. */
  append(state.temperatureSeries, state.temperatureC, 1);
  append(state.humiditySeries, state.humidityPct, 1);
  const coolingPerf =
    state.coolingStatus === 'nominal'
      ? 94 + Math.random() * 5
      : state.coolingStatus === 'strained'
        ? 72 + Math.random() * 12
        : 40 + Math.random() * 20;
  append(state.coolingSeries, coolingPerf, 0);
  append(state.signalSeries, state.signalStrengthPct, 0);
  append(state.batterySeries, state.batteryPct, 1);
}

/* ----------------------------------------------------------------------- */
/* Frame assembly                                                           */
/* ----------------------------------------------------------------------- */

function toneFromBand(value: number, min: number, max: number): StatusTone {
  if (value > max || value < min)
    return Math.abs(value - (max + min) / 2) > (max - min) * 0.5 ? 'danger' : 'warning';
  return 'success';
}

function toneFromThreshold(value: number, warnLow: number, dangerLow: number): StatusTone {
  if (value <= dangerLow) return 'danger';
  if (value <= warnLow) return 'warning';
  return 'success';
}

function trendFromSeries(series: TimeSeriesPoint[], unit: string): TrendIndicator | undefined {
  const n = series.length;
  if (n < 2) return undefined;
  const prev = series[n - 2]!.value;
  const cur = series[n - 1]!.value;
  const delta = cur - prev;
  const direction: TrendDirection = delta > 0.001 ? 'up' : delta < -0.001 ? 'down' : 'flat';
  return { direction, value: `${delta >= 0 ? '+' : ''}${delta.toFixed(1)} ${unit}`, label: 'live' };
}

function buildSensorCards(state: SimState): SensorOverviewCard[] {
  const conn = (suffix: string): DeviceConnectivity =>
    state.connectivity.find((row) => row.id.endsWith(`-${suffix}`))?.status ?? 'online';
  const spark = (series: TimeSeriesPoint[], count = 20): TimeSeriesPoint[] => series.slice(-count);
  const now = new Date().toISOString();

  const tempTone = toneFromBand(state.temperatureC, state.band.tempMin, state.band.tempMax);
  const humTone = toneFromBand(state.humidityPct, state.band.humMin, state.band.humMax);
  const gpsTone = toneFromThreshold(state.signalStrengthPct, 45, 28);
  const battTone = toneFromThreshold(state.batteryPct, 30, 15);
  const coolTone: StatusTone =
    state.coolingStatus === 'fault'
      ? 'danger'
      : state.coolingStatus === 'strained'
        ? 'warning'
        : 'success';

  return [
    {
      key: 'temperature',
      label: 'Temperature',
      value: `${state.temperatureC.toFixed(1)}`,
      unit: '°C',
      tone: tempTone,
      statusLabel:
        tempTone === 'success' ? 'In band' : tempTone === 'warning' ? 'Elevated' : 'Excursion',
      connection: conn('temp'),
      lastUpdatedAt: now,
      trend: trendFromSeries(state.temperatureSeries, '°C'),
      sparkline: spark(state.temperatureSeries),
    },
    {
      key: 'humidity',
      label: 'Humidity',
      value: `${Math.round(state.humidityPct)}`,
      unit: '%',
      tone: humTone,
      statusLabel: humTone === 'success' ? 'Optimal' : humTone === 'warning' ? 'High' : 'Critical',
      connection: conn('hum'),
      lastUpdatedAt: now,
      trend: trendFromSeries(state.humiditySeries, '%'),
      sparkline: spark(state.humiditySeries),
    },
    {
      key: 'door',
      label: 'Door Status',
      value: state.doorOpen ? 'Open' : 'Closed',
      tone: state.doorOpen ? 'warning' : 'success',
      statusLabel: state.doorOpen ? 'Open' : 'Secured',
      connection: conn('door'),
      lastUpdatedAt: now,
    },
    {
      key: 'gps',
      label: 'GPS Signal',
      value: `${Math.round(state.signalStrengthPct)}`,
      unit: '%',
      tone: gpsTone,
      statusLabel: gpsTone === 'success' ? 'Strong' : gpsTone === 'warning' ? 'Weak' : 'Lost',
      connection: conn('gps'),
      lastUpdatedAt: now,
      trend: trendFromSeries(state.signalSeries, '%'),
      sparkline: spark(state.signalSeries),
    },
    {
      key: 'battery',
      label: 'Battery',
      value: `${Math.round(state.batteryPct)}`,
      unit: '%',
      tone: battTone,
      statusLabel: battTone === 'success' ? 'Healthy' : battTone === 'warning' ? 'Low' : 'Critical',
      connection: conn('batt'),
      lastUpdatedAt: now,
      trend: trendFromSeries(state.batterySeries, '%'),
      sparkline: spark(state.batterySeries),
    },
    {
      key: 'cooling',
      label: 'Cooling Unit',
      value:
        state.coolingStatus === 'nominal'
          ? 'Nominal'
          : state.coolingStatus === 'strained'
            ? 'Strained'
            : 'Fault',
      tone: coolTone,
      statusLabel:
        coolTone === 'success' ? 'Nominal' : coolTone === 'warning' ? 'Strained' : 'Fault',
      connection: conn('cool'),
      lastUpdatedAt: now,
      trend: trendFromSeries(state.coolingSeries, '%'),
      sparkline: spark(state.coolingSeries),
    },
  ];
}

function buildHealth(state: SimState): HealthScoreBreakdown {
  const temperatureStability = clamp(
    100 - Math.abs(state.temperatureC - state.tempSetpoint) * 16,
    0,
    100,
  );
  const humidityStability = clamp(100 - Math.abs(state.humidityPct - state.humMid) * 1.4, 0, 100);

  const avgHealth =
    state.connectivity.reduce((sum, row) => sum + row.health, 0) /
    Math.max(state.connectivity.length, 1);
  const offline = state.connectivity.filter((row) => row.status === 'offline').length;
  const sensorReliability = clamp(avgHealth - offline * 12, 0, 100);
  const predictionReadiness = clamp(96 - offline * 8 + (sensorReliability - 90) * 0.2, 0, 100);

  const overall = Math.round(
    0.35 * temperatureStability +
      0.2 * humidityStability +
      0.25 * sensorReliability +
      0.2 * predictionReadiness,
  );
  const tone: StatusTone = overall > 78 ? 'success' : overall > 50 ? 'warning' : 'danger';

  return {
    overall,
    temperatureStability: Math.round(temperatureStability),
    humidityStability: Math.round(humidityStability),
    sensorReliability: Math.round(sensorReliability),
    predictionReadiness: Math.round(predictionReadiness),
    tone,
    updatedAt: new Date().toISOString(),
  };
}

function buildEmergency(state: SimState): EmergencySummary {
  const recent = state.events.slice(0, 12);
  const criticalAlerts = recent.filter((event) => event.tone === 'danger').length;
  const warnings = recent.filter((event) => event.tone === 'warning').length;
  const normalEvents = recent.filter(
    (event) => event.tone !== 'danger' && event.tone !== 'warning',
  ).length;

  let recommendedAction = 'Maintain current setpoint; continue monitoring humidity.';
  let tone: StatusTone = 'success';
  if (state.temperatureC > state.band.tempMax) {
    recommendedAction = `Lower setpoint by 1 °C and verify the cooling unit near ${state.map.currentPosition}.`;
    tone = 'danger';
  } else if (state.coolingStatus === 'fault') {
    recommendedAction = 'Dispatch a technician; switch to the backup cooling circuit.';
    tone = 'danger';
  } else if (state.doorOpen) {
    recommendedAction = 'Secure the rear door to restore the cold chain.';
    tone = 'warning';
  } else if (state.connectivity.some((row) => row.status === 'offline')) {
    recommendedAction = `Check the antenna connection for ${state.connectivity.find((row) => row.status === 'offline')?.sensorName}.`;
    tone = 'warning';
  } else if (criticalAlerts > 0) {
    tone = 'danger';
  } else if (warnings > 0) {
    tone = 'warning';
  }

  return {
    criticalAlerts,
    warnings,
    normalEvents,
    contacts: [
      { name: 'Control Room', role: '24×7 Operations', phone: '+91 1800 200 1133' },
      { name: 'Fleet Maintenance', role: 'Cold unit support', phone: '+91 44 6688 2200' },
      { name: 'Quality Lead', role: 'Cold chain QA', phone: '+91 80 4123 9900' },
    ],
    recommendedAction,
    tone,
  };
}

/** Produce a fresh, fully-shaped frame for the UI. */
export function buildFrame(state: SimState): LiveMonitoringFrame {
  const thresholds: LiveThresholds = {
    temperature: { min: state.band.tempMin, max: state.band.tempMax },
    humidity: { min: state.band.humMin, max: state.band.humMax },
  };

  return {
    shipmentId: state.shipmentId,
    capturedAt: new Date().toISOString(),
    sensorOverview: buildSensorCards(state),
    healthScore: buildHealth(state),
    truckStatus: {
      truckId: state.truckId,
      registrationNumber: state.registrationNumber,
      speedKph: Math.round(state.speedKph),
      currentLocation: state.map.currentPosition,
      latitude: state.latitude,
      longitude: state.longitude,
      engineStatus: state.engineStatus,
      coolingStatus: state.coolingStatus,
      fuelPct: Math.round(state.fuelPct),
      distanceTravelledKm: Math.round((state.distanceKm * state.progressPct) / 100),
      distanceRemainingKm: Math.round((state.distanceKm * (100 - state.progressPct)) / 100),
      etaAt: state.map.etaAt,
      driverName: state.driverName,
      driverStatus:
        state.progressPct >= 100
          ? 'off_duty'
          : state.engineStatus === 'running'
            ? 'driving'
            : 'resting',
      progressPct: Math.round(state.progressPct),
    },
    connectivity: state.connectivity.map((row) => ({ ...row })),
    events: state.events.map((event) => ({ ...event })),
    series: {
      temperature: [...state.temperatureSeries],
      humidity: [...state.humiditySeries],
      cooling: [...state.coolingSeries],
      signal: [...state.signalSeries],
    },
    thresholds,
    map: { ...state.map, route: state.map.route.map((point) => ({ ...point })) },
    emergency: buildEmergency(state),
  };
}

/** Advance the simulator one tick and return the new frame. */
export function stepSimulator(shipmentId: string): LiveMonitoringFrame {
  const state = getSimulator(shipmentId);
  step(state);
  return buildFrame(state);
}

/** Current frame without advancing (used for an immediate first paint). */
export function snapshotSimulator(shipmentId: string): LiveMonitoringFrame {
  return buildFrame(getSimulator(shipmentId));
}
