import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from '../coldchain-monitor-team/node_modules/vite/dist/node/index.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(here, '../coldchain-monitor-team');
const vite = await createServer({
  configFile: false,
  root: frontendRoot,
  resolve: { alias: { '@': path.join(frontendRoot, 'src') } },
  server: { middlewareMode: true, hmr: false, ws: false },
  appType: 'custom',
});

try {
  const [shipments, dashboard, alerts, history, telemetry, live, predictions, settings, user, fleet, simulator] =
    await Promise.all([
      vite.ssrLoadModule('/src/data/mockShipments.ts'),
      vite.ssrLoadModule('/src/data/mockDashboard.ts'),
      vite.ssrLoadModule('/src/data/mockAlerts.ts'),
      vite.ssrLoadModule('/src/data/mockShipments.ts'),
      vite.ssrLoadModule('/src/data/mockTelemetry.ts'),
      vite.ssrLoadModule('/src/data/mockLiveMonitoring.ts'),
      vite.ssrLoadModule('/src/data/mockPredictions.ts'),
      vite.ssrLoadModule('/src/data/mockSettings.ts'),
      vite.ssrLoadModule('/src/data/mockUser.ts'),
      vite.ssrLoadModule('/src/data/fleet.ts'),
      vite.ssrLoadModule('/src/services/liveSimulation.ts'),
    ]);
  const ranges = ['1h', '24h', '7d', '30d', '90d'];
  const telemetryByShipment = Object.fromEntries(
    shipments.mockShipments.map((shipment) => [
      shipment.id,
      Object.fromEntries(
        ranges.map((range) => [range, telemetry.buildTelemetrySnapshot(shipment.id, range)]),
      ),
    ]),
  );
  const database = {
    generatedAt: new Date().toISOString(),
    shipments: shipments.mockShipments,
    shipmentHistory: history.mockShipmentHistory,
    alerts: alerts.mockAlerts,
    alertSummary: alerts.mockAlertSummary,
    systemComponents: dashboard.mockSystemComponents,
    weatherSummary: dashboard.mockWeatherSummary,
    recentActivity: dashboard.mockRecentActivity,
    user: user.mockUser,
    settings: settings.mockSettings,
    vehicles: fleet.fleetVehicles,
    model: predictions.mockModelInfo,
    predictionFixtures: Object.fromEntries(
      shipments.mockShipments.map((shipment) => {
        const request = {
          shipmentId: shipment.id,
          commodity: shipment.commodity,
          transitDurationHours: 16,
          avgTemperatureC: shipment.temperatureC,
          avgHumidityPct: shipment.humidityPct,
          ethylenePpm: 1.4,
          vibrationIndex: 0.3,
          packaging: shipment.packaging,
          vehicleType: shipment.vehicle.type,
          preCoolingApplied: true,
          ambientTemperatureC: 32,
        };
        return [shipment.id, {
          prediction: predictions.buildMockPrediction(request),
          report: predictions.buildPredictionReport({
            ...request,
            horizonHours: 24,
            predictionType: 'arrival_spoilage',
            predictionInterval: 'hourly',
            modelVersion: predictions.mockModelInfo.version,
          }),
        }];
      }),
    ),
    dashboard: {
      summaries: Object.fromEntries(ranges.map((range) => [range, dashboard.buildDashboardSummary(range)])),
      trends: Object.fromEntries(ranges.map((range) => [range, dashboard.buildDashboardTrends(range)])),
    },
    telemetry: telemetryByShipment,
    shipmentSelectors: live.buildSelectorShipments(),
    liveFrames: Object.fromEntries(
      shipments.mockShipments.map((shipment) => [shipment.id, simulator.snapshotSimulator(shipment.id)]),
    ),
    environmental: Object.fromEntries(
      shipments.mockShipments.map((shipment) => [shipment.id, live.buildEnvironmental(shipment.id)]),
    ),
  };
  await fs.writeFile(path.join(here, 'data/mock-database.json'), `${JSON.stringify(database, null, 2)}\n`);
  console.log(`Generated JSON simulation database with ${database.shipments.length} shipments.`);
} finally {
  await vite.close();
}
