import { useMemo, useState } from 'react';
import { Droplets, Gauge, Search, Thermometer } from 'lucide-react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { fleetVehicles, type VehicleStatus } from '@/data/fleet';
import { PageHeader } from '@/components/layout';
import { Card } from '@/components/ui';
import { ROUTE_PATHS } from '@/routes/routes.config';

const statusClass: Record<VehicleStatus, string> = {
  Normal: 'bg-emerald-500/15 text-emerald-600 ring-1 ring-emerald-500/20',
  Warning: 'bg-amber-500/15 text-amber-600 ring-1 ring-amber-500/20',
  Critical: 'bg-rose-500/15 text-rose-600 ring-1 ring-rose-500/20',
};

function buildSparkline(values: number[]) {
  const size = 220;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * size;
      const y = size - ((value - min) / span) * (size - 24) - 12;
      return `${x},${y}`;
    })
    .join(' ');

  return { points, min, max, size };
}

function VehicleDetail({ vehicleId }: { vehicleId: string }) {
  const vehicle = fleetVehicles.find((item) => item.vehicleId === vehicleId) ?? fleetVehicles[0];
  const forecast = buildSparkline(vehicle.history);

  return (
    <div className="space-y-6">
      <PageHeader
        title={vehicle.vehicleId}
        description={vehicle.route}
        actions={
          <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${statusClass[vehicle.status]}`}>
            ● {vehicle.status}
          </span>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-content-muted">
            <Thermometer size={14} className="text-amber-500" />
            Temperature
          </div>
          <div className="mt-3 text-3xl font-semibold text-content-primary">{vehicle.currentTemp.toFixed(1)}°C</div>
          <p className="mt-1 text-sm text-content-muted">Current cabin reading</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-content-muted">
            <Droplets size={14} className="text-cyan-500" />
            Humidity
          </div>
          <div className="mt-3 text-3xl font-semibold text-content-primary">{vehicle.humidity}%</div>
          <p className="mt-1 text-sm text-content-muted">Relative humidity</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-content-muted">
            <Gauge size={14} className="text-violet-500" />
            Ambient
          </div>
          <div className="mt-3 text-3xl font-semibold text-content-primary">{vehicle.ambientTemp}°C</div>
          <p className="mt-1 text-sm text-content-muted">External environment</p>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-content-primary">Forecast</h2>
            <span className="text-xs uppercase tracking-[0.12em] text-content-muted">LSTM signal</span>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3">
            <svg viewBox={`0 0 ${forecast.size} ${forecast.size}`} className="h-40 w-full">
              <line x1="0" y1="160" x2="220" y2="160" stroke="#cbd5e1" strokeWidth="1" />
              <polyline
                fill="none"
                stroke="#22c55e"
                strokeWidth="3"
                points={forecast.points}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="mt-2 flex items-center justify-between text-[11px] uppercase tracking-[0.12em] text-content-muted">
              <span>Historical</span>
              <span>Now</span>
              <span>+30 min</span>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-lg font-semibold text-content-primary">Prediction</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span className="text-content-muted">Current Temperature</span>
              <span className="font-semibold text-content-primary">{vehicle.currentTemp.toFixed(1)}°C</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span className="text-content-muted">Predicted +15 min</span>
              <span className="font-semibold text-content-primary">{vehicle.predicted15MinTemp.toFixed(1)}°C</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span className="text-content-muted">Predicted +30 min</span>
              <span className="font-semibold text-content-primary">{vehicle.predictedTemp.toFixed(1)}°C</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span className="text-content-muted">Spoilage Risk</span>
              <span className={`font-semibold ${vehicle.status === 'Critical' ? 'text-rose-600' : vehicle.status === 'Warning' ? 'text-amber-600' : 'text-emerald-600'}`}>
                {vehicle.status}
              </span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-content-primary">Current Conditions</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="text-xs uppercase tracking-[0.12em] text-content-muted">Vehicle ID</div>
              <div className="mt-1 font-medium text-content-primary">{vehicle.vehicleId}</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="text-xs uppercase tracking-[0.12em] text-content-muted">Route</div>
              <div className="mt-1 font-medium text-content-primary">{vehicle.route}</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="text-xs uppercase tracking-[0.12em] text-content-muted">Door status</div>
              <div className="mt-1 font-medium text-content-primary">{vehicle.doorOpen ? 'Open' : 'Closed'}</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="text-xs uppercase tracking-[0.12em] text-content-muted">Compressor</div>
              <div className="mt-1 font-medium text-content-primary">{vehicle.compressorOn ? 'Running' : 'Off'}</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="text-xs uppercase tracking-[0.12em] text-content-muted">Vehicle speed</div>
              <div className="mt-1 font-medium text-content-primary">{vehicle.vehicleSpeedKph} km/h</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="text-xs uppercase tracking-[0.12em] text-content-muted">Travel duration</div>
              <div className="mt-1 font-medium text-content-primary">{vehicle.travelDurationHours.toFixed(1)} hrs</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 sm:col-span-2">
              <div className="text-xs uppercase tracking-[0.12em] text-content-muted">Last update</div>
              <div className="mt-1 font-medium text-content-primary">{new Date(vehicle.timestamp).toLocaleString()}</div>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-lg font-semibold text-content-primary">Derived Signals</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="text-xs uppercase tracking-[0.12em] text-content-muted">Rate of change</div>
              <div className="mt-1 font-medium text-content-primary">{vehicle.tempRateOfChange.toFixed(2)}°C/min</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="text-xs uppercase tracking-[0.12em] text-content-muted">Cumulative exposure</div>
              <div className="mt-1 font-medium text-content-primary">{vehicle.cumulativeExposureC.toFixed(1)}°C</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="text-xs uppercase tracking-[0.12em] text-content-muted">Time since last excursion</div>
              <div className="mt-1 font-medium text-content-primary">{vehicle.timeSinceLastExcursionMinutes} min</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="text-xs uppercase tracking-[0.12em] text-content-muted">Temp deviation</div>
              <div className="mt-1 font-medium text-content-primary">{vehicle.tempDeviationFromSafeRangeC.toFixed(1)}°C</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="text-xs uppercase tracking-[0.12em] text-content-muted">Humidity deviation</div>
              <div className="mt-1 font-medium text-content-primary">{vehicle.humidityDeviationPct}%</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="text-xs uppercase tracking-[0.12em] text-content-muted">Rolling mean</div>
              <div className="mt-1 font-medium text-content-primary">{vehicle.rollingMeanTempC.toFixed(1)}°C</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 sm:col-span-2">
              <div className="text-xs uppercase tracking-[0.12em] text-content-muted">Rolling variance</div>
              <div className="mt-1 font-medium text-content-primary">{vehicle.rollingTempVariance.toFixed(2)}°C²</div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="text-lg font-semibold text-content-primary">Model Outputs</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="text-xs uppercase tracking-[0.12em] text-content-muted">Excursion probability</div>
            <div className="mt-1 font-medium text-content-primary">{(vehicle.excursionProbability * 100).toFixed(0)}%</div>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="text-xs uppercase tracking-[0.12em] text-content-muted">Spoilage risk</div>
            <div className="mt-1 font-medium text-content-primary">{(vehicle.spoilageRisk * 100).toFixed(0)}%</div>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="text-xs uppercase tracking-[0.12em] text-content-muted">Risk level</div>
            <div className="mt-1 font-medium text-content-primary">{vehicle.riskLevel}</div>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="text-xs uppercase tracking-[0.12em] text-content-muted">Recommendation</div>
            <div className="mt-1 font-medium text-content-primary">{vehicle.status}</div>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <p className="text-xs uppercase tracking-[0.14em] text-content-muted">Recommended action</p>
        <p className="mt-3 text-lg font-medium text-content-primary">{vehicle.action}</p>
      </Card>
    </div>
  );
}

export function VehiclesPage() {
  const { vehicleId } = useParams();
  const { search } = useLocation();
  const [query, setQuery] = useState('');

  const statusFilter = new URLSearchParams(search).get('status') ?? 'all';

  const filteredVehicles = useMemo(() => {
    return fleetVehicles.filter((vehicle) => {
      const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
      const matchesQuery =
        query.trim().length === 0 ||
        vehicle.vehicleId.toLowerCase().includes(query.toLowerCase()) ||
        vehicle.route.toLowerCase().includes(query.toLowerCase());

      return matchesStatus && matchesQuery;
    });
  }, [query, statusFilter]);

  if (vehicleId) {
    const exists = fleetVehicles.some((vehicle) => vehicle.vehicleId === vehicleId);
    if (!exists) {
      return <Navigate to={ROUTE_PATHS.vehicles} replace />;
    }

    return <VehicleDetail vehicleId={vehicleId} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vehicles"
        description="What is the condition of each individual vehicle?"
      />

      <div className="grid gap-3 md:grid-cols-3">
        {(['Normal', 'Warning', 'Critical'] as VehicleStatus[]).map((status) => {
          const count = fleetVehicles.filter((vehicle) => vehicle.status === status).length;
          return (
            <Card key={status} className="p-4">
              <div className="text-xs uppercase tracking-[0.14em] text-content-muted">{status}</div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-3xl font-semibold text-content-primary">{count}</span>
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusClass[status]}`}>
                  {status}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-slate-200 p-4">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-3 text-content-muted" />
            <input
              aria-label="Search vehicle"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search vehicle..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-content-primary outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-content-muted">
              <tr>
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Route</th>
                <th className="px-4 py-3 font-medium">Condition</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map((vehicle) => (
                <tr
                  key={vehicle.vehicleId}
                  className="cursor-pointer border-t border-slate-200 transition hover:bg-slate-50"
                  onClick={() => {
                    window.location.href = `${ROUTE_PATHS.vehicles}/${vehicle.vehicleId}`;
                  }}
                >
                  <td className="px-4 py-3 font-medium text-content-primary">{vehicle.vehicleId}</td>
                  <td className="px-4 py-3 text-content-secondary">{vehicle.route}</td>
                  <td className="px-4 py-3 text-content-secondary">{vehicle.currentTemp.toFixed(1)}°C</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass[vehicle.status]}`}>
                      ● {vehicle.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
