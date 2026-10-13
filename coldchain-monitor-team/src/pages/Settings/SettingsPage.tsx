import { CloudCog, Gauge, ShieldCheck, Thermometer } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Card } from '@/components/ui';

const monitoringConfig = [
  { label: 'Prediction Horizon', value: '30 minutes', icon: Gauge },
  { label: 'Warning Threshold', value: '7°C', icon: Thermometer },
  { label: 'Critical Threshold', value: '8°C', icon: Thermometer },
  { label: 'Temperature Prediction Alerts', value: 'ON', icon: ShieldCheck },
  { label: 'Critical Risk Alerts', value: 'ON', icon: ShieldCheck },
];

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="What configuration does the monitoring system use?"
      />

      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-content-primary">
          <CloudCog size={16} className="text-brand-600" />
          Monitoring Configuration
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {monitoringConfig.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-content-muted">
                <Icon size={14} />
                {label}
              </div>
              <div className="mt-3 text-xl font-semibold text-content-primary">{value}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <div className="text-sm font-medium text-content-primary">System</div>
        <div className="mt-4 space-y-3 text-sm text-content-secondary">
          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
            <span>Model Version</span>
            <span className="font-medium text-content-primary">LSTM-v1</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
            <span>Last Model Update</span>
            <span className="font-medium text-content-primary">27 Aug 2026</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
