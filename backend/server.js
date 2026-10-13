import cors from 'cors';
import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT ?? 4000);
const DB_FILE = path.join(here, 'data', 'mock-database.json');
const db = JSON.parse(await fs.readFile(DB_FILE, 'utf8'));
const liveTicks = new Map();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

const result = (res, data) => res.json({ data });
const page = (items, pageNumber = 1, pageSize = 10) => {
  const safePage = Math.max(1, Number(pageNumber) || 1);
  const safeSize = Math.min(100, Math.max(1, Number(pageSize) || 10));
  const start = (safePage - 1) * safeSize;
  return { items: items.slice(start, start + safeSize), total: items.length, page: safePage, pageSize: safeSize, totalPages: Math.ceil(items.length / safeSize) };
};
const range = (req) => req.query.range in db.dashboard.summaries ? req.query.range : '24h';
const getShipment = (id) => db.shipments.find((shipment) => shipment.id === id);
const wrap = (handler) => async (req, res, next) => {
  try { await handler(req, res, next); } catch (error) { next(error); }
};

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'coldguard-backend', dataSource: 'json', generatedAt: db.generatedAt }));

app.get('/api/fleet/summary', wrap(async (_req, res) => {
  const vehicles = JSON.parse(await fs.readFile(path.join(here, 'data/fleet.json'), 'utf8'));
  result(res, { totalVehicles: vehicles.length,
    normal: vehicles.filter((v) => v.status === 'Normal').length,
    warning: vehicles.filter((v) => v.status === 'Warning').length,
    critical: vehicles.filter((v) => v.status === 'Critical').length, vehicles });
}));
app.get('/api/vehicles', wrap(async (_req, res) => result(res, JSON.parse(await fs.readFile(path.join(here, 'data/fleet.json'), 'utf8')))));
app.get('/api/vehicles/:vehicleId', wrap(async (req, res) => {
  const vehicles = JSON.parse(await fs.readFile(path.join(here, 'data/fleet.json'), 'utf8'));
  const vehicle = vehicles.find((item) => item.vehicleId === req.params.vehicleId);
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found', code: 'not_found' });
  result(res, vehicle);
}));
app.get('/api/vehicles/:vehicleId/prediction', wrap(async (req, res) => {
  const vehicles = JSON.parse(await fs.readFile(path.join(here, 'data/fleet.json'), 'utf8'));
  const vehicle = vehicles.find((item) => item.vehicleId === req.params.vehicleId);
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found', code: 'not_found' });
  result(res, { vehicleId: vehicle.vehicleId, currentTemp: vehicle.currentTemp,
    predicted15MinTemp: vehicle.predicted15MinTemp, predictedTemp: vehicle.predictedTemp,
    excursionProbability: vehicle.excursionProbability, spoilageRisk: vehicle.spoilageRisk,
    riskLevel: vehicle.riskLevel, action: vehicle.action, message: vehicle.message, source: 'json-simulation' });
}));

app.get('/api/dashboard/summary', (req, res) => result(res, db.dashboard.summaries[range(req)]));
app.get('/api/dashboard/system-health', (_req, res) => result(res, db.systemComponents));
app.get('/api/dashboard/active-shipments', (req, res) => {
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 5));
  result(res, [...db.shipments].sort((a, b) => b.riskScore - a.riskScore).slice(0, limit));
});
app.get('/api/dashboard/trends', (req, res) => result(res, db.dashboard.trends[range(req)]));
app.get('/api/dashboard/weather', (_req, res) => result(res, db.weatherSummary));
app.get('/api/dashboard/activity', (req, res) => result(res, db.recentActivity.slice(0, Math.max(1, Number(req.query.limit) || 8))));

app.get('/api/shipments/selector', (_req, res) => result(res, db.shipmentSelectors));
app.get('/api/shipments', (req, res) => {
  const active = db.shipments.filter((shipment) => shipment.status !== 'delivered');
  result(res, req.query.status === 'active' ? active : db.shipments);
});
app.get('/api/shipments/:id/telemetry', (req, res) => {
  const snapshots = db.telemetry[req.params.id];
  if (!snapshots) return res.status(404).json({ message: 'Shipment not found', code: 'not_found' });
  result(res, snapshots[req.query.range] ?? snapshots['24h']);
});
app.get('/api/shipments/:id/readings/latest', (req, res) => {
  const snapshot = db.telemetry[req.params.id]?.['24h'];
  if (!snapshot) return res.status(404).json({ message: 'Shipment not found', code: 'not_found' });
  const tick = liveTicks.get(req.params.id) ?? 0;
  const reading = { ...snapshot.latest, recordedAt: new Date().toISOString(),
    temperatureC: Math.round((snapshot.latest.temperatureC + Math.sin(tick / 3) * .2) * 10) / 10,
    humidityPct: Math.round(snapshot.latest.humidityPct + Math.cos(tick / 4) * 2) };
  liveTicks.set(req.params.id, tick + 1);
  result(res, reading);
});
app.get('/api/shipments/:id/devices', (req, res) => {
  const snapshot = db.telemetry[req.params.id]?.['24h'];
  if (!snapshot) return res.status(404).json({ message: 'Shipment not found', code: 'not_found' });
  result(res, snapshot.devices);
});
app.get('/api/shipments/:id/environment', (req, res) => {
  const conditions = db.environmental[req.params.id];
  if (!conditions) return res.status(404).json({ message: 'Shipment not found', code: 'not_found' });
  result(res, conditions);
});
app.get('/api/shipments/:id/live', (req, res) => {
  const seed = db.liveFrames[req.params.id];
  if (!seed) return res.status(404).json({ message: 'Shipment not found', code: 'not_found' });
  const frame = structuredClone(seed);
  const tick = liveTicks.get(req.params.id) ?? 0;
  liveTicks.set(req.params.id, tick + 1);
  frame.capturedAt = new Date().toISOString();
  const shipment = getShipment(req.params.id);
  const temperature = Math.round((shipment.temperatureC + Math.sin(tick / 3) * .25) * 10) / 10;
  const humidity = Math.round(shipment.humidityPct + Math.cos(tick / 4) * 2);
  for (const [key, value] of [['temperature', temperature], ['humidity', humidity]]) {
    const points = frame.series[key];
    points.push({ timestamp: frame.capturedAt, value });
    if (points.length > 48) points.shift();
    const card = frame.sensorOverview.find((item) => item.key === key);
    if (card) { card.value = `${value}${key === 'temperature' ? ' °C' : '%'}`; card.lastUpdatedAt = frame.capturedAt; }
  }
  frame.healthScore.updatedAt = frame.capturedAt;
  result(res, frame);
});
app.get('/api/shipments/:id/prediction', (req, res) => {
  const fixture = db.predictionFixtures[req.params.id];
  if (!fixture) return res.status(404).json({ message: 'Shipment not found', code: 'not_found' });
  result(res, fixture.prediction);
});
app.get('/api/shipments/:id', (req, res) => {
  const shipment = getShipment(req.params.id);
  if (!shipment) return res.status(404).json({ message: 'Shipment not found', code: 'not_found' });
  result(res, shipment);
});

app.get('/api/alerts/summary', (_req, res) => result(res, {
  ...db.alertSummary,
  open: db.alerts.filter((alert) => alert.status === 'open').length,
  critical: db.alerts.filter((alert) => alert.severity === 'critical' && alert.status !== 'resolved').length,
  warning: db.alerts.filter((alert) => alert.severity === 'warning' && alert.status !== 'resolved').length,
  acknowledged: db.alerts.filter((alert) => alert.status === 'acknowledged').length,
  resolvedToday: db.alerts.filter((alert) => alert.status === 'resolved').length,
}));
app.get('/api/alerts/recent', (req, res) => {
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 5));
  result(res, [...db.alerts].sort((a, b) => Date.parse(b.triggeredAt) - Date.parse(a.triggeredAt)).slice(0, limit));
});
app.get('/api/alerts', (req, res) => {
  const search = String(req.query.search ?? '').toLowerCase();
  const filtered = db.alerts.filter((alert) =>
    (!req.query.severity || req.query.severity === 'all' || alert.severity === req.query.severity) &&
    (!req.query.status || req.query.status === 'all' || alert.status === req.query.status) &&
    (!req.query.category || req.query.category === 'all' || alert.category === req.query.category) &&
    (!search || [alert.title, alert.description, alert.shipmentCode, alert.code].join(' ').toLowerCase().includes(search)),
  ).sort((a, b) => Date.parse(b.triggeredAt) - Date.parse(a.triggeredAt));
  result(res, page(filtered, req.query.page, req.query.pageSize));
});
app.patch('/api/alerts/:id/:action(acknowledge|resolve)', wrap(async (req, res) => {
  const alert = db.alerts.find((item) => item.id === req.params.id);
  if (!alert) return res.status(404).json({ message: 'Alert not found', code: 'not_found' });
  if (req.params.action === 'acknowledge') {
    alert.status = 'acknowledged';
    alert.acknowledgedAt = new Date().toISOString();
    alert.acknowledgedBy = 'You';
  } else {
    alert.status = 'resolved';
    alert.resolvedAt = new Date().toISOString();
  }
  await fs.writeFile(DB_FILE, `${JSON.stringify(db, null, 2)}\n`);
  result(res, alert);
}));

app.get('/api/history/shipments', (req, res) => {
  const search = String(req.query.search ?? '').toLowerCase();
  const cutoff = Date.now() - ({ '1h': 1, '24h': 24, '7d': 168, '30d': 720, '90d': 2160 }[req.query.range] ?? 720) * 3_600_000;
  const records = db.shipmentHistory.filter((record) => Date.parse(record.completedAt) >= cutoff &&
    (!req.query.commodity || req.query.commodity === 'all' || record.commodity === req.query.commodity) &&
    (!req.query.outcome || req.query.outcome === 'all' || record.outcome === req.query.outcome) &&
    (!search || [record.code, record.route.origin, record.route.destination].join(' ').toLowerCase().includes(search)))
    .sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt));
  result(res, page(records, req.query.page, req.query.pageSize));
});
const filteredHistory = (req) => {
  const cutoff = Date.now() - ({ '1h': 1, '24h': 24, '7d': 168, '30d': 720, '90d': 2160 }[req.query.range] ?? 720) * 3_600_000;
  return db.shipmentHistory.filter((r) => Date.parse(r.completedAt) >= cutoff &&
    (!req.query.commodity || req.query.commodity === 'all' || r.commodity === req.query.commodity) &&
    (!req.query.outcome || req.query.outcome === 'all' || r.outcome === req.query.outcome));
};
app.get('/api/history/stats', (req, res) => {
  const records = filteredHistory(req); const count = Math.max(records.length, 1);
  const errors = records.map((r) => r.predictedSpoilage - r.actualSpoilage);
  result(res, { totalShipments: records.length, acceptedRate: records.filter((r) => r.outcome === 'accepted').length / count,
    avgTransitHours: records.reduce((s, r) => s + r.transitHours, 0) / count,
    avgExcursions: records.reduce((s, r) => s + r.excursions, 0) / count,
    predictionError: errors.reduce((s, e) => s + Math.abs(e), 0) / count,
    rmse: Math.sqrt(errors.reduce((s, e) => s + e * e, 0) / count) });
});
app.get('/api/history/calibration', (req, res) => {
  const records = filteredHistory(req);
  const bins = [0, .2, .4, .6, .8].map((lower, i) => {
    const upper = lower + .2; const rows = records.filter((r) => r.predictedSpoilage >= lower && r.predictedSpoilage < upper);
    if (!rows.length) return null;
    return { id: `bin-${i}`, label: `${lower * 100}–${upper * 100}%`, predictedAvg: rows.reduce((s, r) => s + r.predictedSpoilage, 0) / rows.length,
      observedAvg: rows.reduce((s, r) => s + r.actualSpoilage, 0) / rows.length, shipmentCount: rows.length };
  }).filter(Boolean);
  result(res, { range: req.query.range ?? '30d', generatedAt: new Date().toISOString(), bins, modelVersions: [...new Set(records.map((r) => r.modelVersion))] });
});
app.get('/api/history/export', (req, res) => {
  const headers = ['prediction_id','shipment_code','commodity','origin','destination','completed_at','transit_hours','avg_temperature_c','avg_humidity_pct','excursions','predicted_spoilage','actual_spoilage','outcome','model_version'];
  const esc = (v) => { const t = String(v); return /[",\n]/.test(t) ? `"${t.replaceAll('"', '""')}"` : t; };
  const lines = filteredHistory(req).map((r) => [r.id,r.code,r.commodity,r.route.origin,r.route.destination,r.completedAt,r.transitHours,r.avgTemperatureC,r.avgHumidityPct,r.excursions,r.predictedSpoilage,r.actualSpoilage,r.outcome,r.modelVersion].map(esc).join(','));
  res.type('text/csv').send([headers.join(','), ...lines].join('\n'));
});

app.get('/api/settings', (_req, res) => result(res, db.settings));
app.patch('/api/settings', wrap(async (req, res) => {
  db.settings = { ...db.settings, ...req.body,
    organization: { ...db.settings.organization, ...req.body.organization },
    notifications: { ...db.settings.notifications, ...req.body.notifications },
    integrations: { ...db.settings.integrations, ...req.body.integrations },
    thresholds: req.body.thresholds ?? db.settings.thresholds };
  await fs.writeFile(DB_FILE, `${JSON.stringify(db, null, 2)}\n`);
  result(res, db.settings);
}));
app.get('/api/me', (_req, res) => result(res, db.user));

app.get('/api/models/active', (_req, res) => result(res, db.model));
const scorePrediction = (request) => {
  const t = Math.max(0, request.avgTemperatureC - 8) * .035;
  const d = Math.max(0, request.transitDurationHours - 12) * .012;
  const h = Math.abs(90 - request.avgHumidityPct) * .006;
  const e = Math.max(0, request.ethylenePpm - 1) * .05;
  const v = request.vibrationIndex * .08;
  const cool = request.preCoolingApplied ? -.08 : .04;
  const probability = Math.round(Math.min(.98, Math.max(.02, .08 + t + d + h + e + v + cool)) * 100) / 100;
  const riskLevel = probability >= .75 ? 'critical' : probability >= .5 ? 'high' : probability >= .25 ? 'moderate' : 'low';
  const actions = riskLevel === 'low' ? ['Maintain current set point', 'Continue standard telemetry cadence'] :
    ['Re-route to the nearest cold storage hub', 'Lower the reefer set point immediately and verify airflow', 'Escalate to the quality team for a pre-arrival inspection'];
  return { id: `prd-${Date.now()}`, requestedAt: new Date().toISOString(), commodity: request.commodity,
    spoilageProbability: probability, riskLevel, confidence: Math.round((.86 + (1 - Math.abs(.5 - probability)) * .1) * 100) / 100,
    estimatedShelfLifeHours: Math.max(4, Math.round((1 - probability) * 96)), recommendedActions: actions,
    contributions: [{feature:'avgTemperatureC',label:'Average temperature',impact:+t.toFixed(2)},
      {feature:'transitDurationHours',label:'Transit duration',impact:+d.toFixed(2)},
      {feature:'ethylenePpm',label:'Ethylene concentration',impact:+e.toFixed(2)},
      {feature:'avgHumidityPct',label:'Humidity deviation',impact:+h.toFixed(2)},
      {feature:'vibrationIndex',label:'Road vibration',impact:+v.toFixed(2)},
      {feature:'preCoolingApplied',label:'Pre-cooling applied',impact:+cool.toFixed(2)}].sort((a,b)=>Math.abs(b.impact)-Math.abs(a.impact)),
    modelVersion: db.model.version };
};
app.post('/api/predictions/spoilage', (req, res) => result(res, scorePrediction(req.body)));
app.post('/api/predictions/spoilage/batch', (req, res) => result(res, (req.body ?? []).map(scorePrediction)));
app.post('/api/predictions/report', (req, res) => {
  const fixture = db.predictionFixtures[req.body?.shipmentId] ?? Object.values(db.predictionFixtures)[0];
  if (!fixture) return res.status(503).json({ message: 'Prediction fixtures are not available', code: 'simulation_unavailable' });
  const report = structuredClone(fixture.report);
  report.id = `rpt-${Date.now()}`;
  report.generatedAt = new Date().toISOString();
  report.request = { ...report.request, ...req.body };
  const prediction = scorePrediction(req.body);
  report.risk.riskPercentage = Math.round(prediction.spoilageProbability * 100);
  report.risk.healthCategory = prediction.riskLevel;
  report.risk.estimatedTimeBeforeSpoilageHours = prediction.estimatedShelfLifeHours;
  report.summary.overallStatus = prediction.riskLevel;
  for (const metric of report.summary.kpis) {
    if (metric.key === 'spoil') {
      metric.value = String(report.risk.riskPercentage);
      metric.numericValue = report.risk.riskPercentage;
      metric.statusLabel = `${prediction.riskLevel[0].toUpperCase()}${prediction.riskLevel.slice(1)} risk`;
    } else if (metric.key === 'status') {
      metric.value = `${prediction.riskLevel[0].toUpperCase()}${prediction.riskLevel.slice(1)}`;
      metric.statusLabel = `${prediction.riskLevel[0].toUpperCase()}${prediction.riskLevel.slice(1)} risk`;
    }
  }
  return result(res, report);
});

const frontendDist = path.resolve(here, '../coldchain-monitor-team/dist');
app.use(express.static(frontendDist));
app.get('*', (_req, res, next) => {
  res.sendFile(path.join(frontendDist, 'index.html'), (error) => {
    if (error) next(error);
  });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: 'Backend simulation error', code: 'internal_error' });
});

app.listen(PORT, '0.0.0.0', () => console.log(`ColdGuard JSON simulation backend listening on http://localhost:${PORT}`));
