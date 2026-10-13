import { ArrowRight, CheckCircle2, TriangleAlert, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
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

  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * size;
      const y = size - ((value - min) / span) * (size - 24) - 12;
      return `${x},${y}`;
    })
    .join(' ');
}

export function DashboardPage() {
  const totalVehicles = fleetVehicles.length;
  const normalCount = fleetVehicles.filter((vehicle) => vehicle.status === 'Normal').length;
  const warningCount = fleetVehicles.filter((vehicle) => vehicle.status === 'Warning').length;
  const criticalCount = fleetVehicles.filter((vehicle) => vehicle.status === 'Critical').length;

  const statusCards = [
    { label: 'TOTAL VEHICLES', value: String(totalVehicles), tone: 'text-slate-700', icon: Truck },
    { label: 'NORMAL', value: String(normalCount), tone: 'text-emerald-600', icon: CheckCircle2 },
    { label: 'WARNING', value: String(warningCount), tone: 'text-amber-600', icon: TriangleAlert },
    { label: 'CRITICAL', value: String(criticalCount), tone: 'text-rose-600', icon: TriangleAlert },
  ];

  const highlightedVehicle = fleetVehicles.find((vehicle) => vehicle.status === 'Warning') ?? fleetVehicles[0];
  const sparkline = buildSparkline(highlightedVehicle.history);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fleet Dashboard"
        description="What is happening across my entire fleet right now?"
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {statusCards.map(({ label, value, tone, icon: Icon }) => {
          const targetPath =
            label === 'WARNING'
              ? `${ROUTE_PATHS.vehicles}?status=Warning`
              : label === 'CRITICAL'
                ? `${ROUTE_PATHS.vehicles}?status=Critical`
                : ROUTE_PATHS.vehicles;

          return (
            <Link key={label} to={targetPath} className="block">
              <Card className="h-full p-4 transition hover:border-brand-200 hover:shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="text-xs uppercase tracking-[0.12em] text-content-muted">{label}</div>
                  <Icon className={`h-4 w-4 ${tone}`} />
                </div>
                <div className={`mt-4 text-4xl font-semibold ${tone}`}>{value}</div>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-content-primary">Fleet Overview</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-content-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Vehicle</th>
                <th className="px-5 py-3 font-medium">Route</th>
                <th className="px-5 py-3 font-medium">Temperature</th>
                <th className="px-5 py-3 font-medium">Humidity</th>
                <th className="px-5 py-3 font-medium">Prediction</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {fleetVehicles.map((vehicle) => (
                <tr key={vehicle.vehicleId} className="border-t border-slate-200 hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-content-primary">
                    <Link to={`${ROUTE_PATHS.vehicles}/${vehicle.vehicleId}`} className="inline-flex items-center gap-2 text-brand-600">
                      {vehicle.vehicleId}
                      <ArrowRight size={14} />
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-content-secondary">{vehicle.route}</td>
                  <td className="px-5 py-3 text-content-secondary">{vehicle.currentTemp.toFixed(1)}°C</td>
                  <td className="px-5 py-3 text-content-secondary">{vehicle.humidity}%</td>
                  <td className="px-5 py-3 text-content-secondary">{vehicle.predictedTemp.toFixed(1)}°C ↑</td>
                  <td className="px-5 py-3">
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

      <Card className="p-5">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-content-muted">Selected vehicle</p>
            <h3 className="mt-2 text-2xl font-semibold text-content-primary">{highlightedVehicle.vehicleId}</h3>
            <p className="mt-1 text-content-muted">Current: {highlightedVehicle.currentTemp.toFixed(1)}°C</p>
            <p className="text-content-muted">Predicted: {highlightedVehicle.predictedTemp.toFixed(1)}°C</p>
            <p className="mt-2 text-sm font-medium text-amber-600">Risk: {highlightedVehicle.status}</p>
          </div>

          <div className="w-full lg:max-w-xl">
            <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.12em] text-content-muted">
              <span>Temperature</span>
              <span>{highlightedVehicle.currentTemp.toFixed(1)}°C</span>
            </div>
            <svg viewBox="0 0 220 220" className="h-32 w-full rounded-xl bg-slate-50 p-3">
              <line x1="0" y1="160" x2="220" y2="160" stroke="#cbd5e1" strokeWidth="1" />
              <polyline
                fill="none"
                stroke="#f59e0b"
                strokeWidth="3"
                points={sparkline}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="mt-2 flex items-center justify-between text-[11px] uppercase tracking-[0.12em] text-content-muted">
              <span>-30m</span>
              <span>Now</span>
              <span>+30m</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
