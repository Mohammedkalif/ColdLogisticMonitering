import cors from 'cors';
import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

async function readJson(fileName) {
  const filePath = path.join(__dirname, 'data', fileName);
  const raw = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(raw);
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'coldguard-backend' });
});

app.get('/api/fleet/summary', async (_req, res) => {
  const vehicles = await readJson('fleet.json');
  const total = vehicles.length;
  const normal = vehicles.filter((vehicle) => vehicle.status === 'Normal').length;
  const warning = vehicles.filter((vehicle) => vehicle.status === 'Warning').length;
  const critical = vehicles.filter((vehicle) => vehicle.status === 'Critical').length;

  res.json({
    totalVehicles: total,
    normal,
    warning,
    critical,
    vehicles,
  });
});

app.get('/api/vehicles', async (_req, res) => {
  const vehicles = await readJson('fleet.json');
  res.json({ data: vehicles });
});

app.get('/api/vehicles/:vehicleId', async (req, res) => {
  const vehicles = await readJson('fleet.json');
  const vehicle = vehicles.find((item) => item.vehicleId === req.params.vehicleId);

  if (!vehicle) {
    return res.status(404).json({ message: 'Vehicle not found' });
  }

  return res.json({ data: vehicle });
});

app.get('/api/alerts', async (_req, res) => {
  const vehicles = await readJson('fleet.json');
  const alerts = vehicles
    .filter((vehicle) => vehicle.status !== 'Normal')
    .map((vehicle) => ({
      id: vehicle.vehicleId,
      title:
        vehicle.status === 'Critical'
          ? 'Critical temperature predicted'
          : 'Temperature excursion predicted',
      current: vehicle.currentTemp,
      predicted: vehicle.predictedTemp,
      status: vehicle.status,
      route: vehicle.route,
      time: vehicle.status === 'Critical' ? '14:28' : '14:32',
      action: vehicle.action,
    }));

  res.json({ data: alerts });
});

app.get('/api/settings', async (_req, res) => {
  const settings = await readJson('settings.json');
  res.json({ data: settings });
});

app.listen(PORT, () => {
  console.log(`ColdGuard backend running on http://localhost:${PORT}`);
});
