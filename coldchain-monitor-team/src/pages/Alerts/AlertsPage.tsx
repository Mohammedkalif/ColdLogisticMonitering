import { AlertTriangle, CheckCheck, Clock3, TriangleAlert } from 'lucide-react';
import { fleetVehicles } from '@/data/fleet';
import { PageHeader } from '@/components/layout';
import { Card } from '@/components/ui';

const alertFlow = [
  'Prediction',
  'Risk threshold crossed',
  'Alert generated',
  'Operator acknowledges',
  'Resolved',
];

export function AlertsPage() {
  const alerts = fleetVehicles
    .filter((vehicle) => vehicle.status !== 'Normal')
    .map((vehicle) => ({
      id: vehicle.vehicleId,
      title:
        vehicle.status === 'Critical'
          ? 'Critical temperature predicted'
          : 'Temperature excursion predicted',
      current: vehicle.currentTemp,
      predicted: vehicle.predictedTemp,
      time: vehicle.status === 'Critical' ? '14:28' : '14:32',
      status: vehicle.status,
      message: vehicle.action,
    }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alerts"
        description="Which vehicles require immediate attention?"
      />

      <div className="grid gap-4 md:grid-cols-2">
        {alerts.map((alert) => (
          <Card key={alert.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-content-muted">
                  {alert.status}
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-content-primary">
                  {alert.id}
                </h3>
              </div>
              <div
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                  alert.status === 'Critical'
                    ? 'bg-rose-500/15 text-rose-600 ring-1 ring-rose-500/20'
                    : 'bg-amber-500/15 text-amber-600 ring-1 ring-amber-500/20'
                }`}
              >
                {alert.status === 'Critical' ? '🔴 Critical' : '⚠ Warning'}
              </div>
            </div>

            <p className="mt-4 text-base font-medium text-content-primary">
              {alert.title}
            </p>
            <div className="mt-3 space-y-2 text-sm text-content-secondary">
              <p>Current: {alert.current.toFixed(1)}°C</p>
              <p>Predicted: {alert.predicted.toFixed(1)}°C in 30 min</p>
              <p className="inline-flex items-center gap-2">
                <Clock3 size={14} /> Time: {alert.time}
              </p>
            </div>
            <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-content-primary">
              <div className="flex items-center gap-2 font-medium">
                <AlertTriangle
                  size={14}
                  className={
                    alert.status === 'Critical'
                      ? 'text-rose-600'
                      : 'text-amber-600'
                  }
                />
                {alert.message}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-2 text-sm font-medium text-content-primary">
          <CheckCheck size={16} className="text-emerald-600" />
          Alert lifecycle
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {alertFlow.map((item, index) => (
            <div key={item} className="flex items-center gap-2">
              <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-content-secondary">
                {item}
              </span>
              {index < alertFlow.length - 1 && (
                <TriangleAlert size={12} className="text-slate-400" />
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
