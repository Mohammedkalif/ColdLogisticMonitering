import type { NotificationPreferences } from '@/types';
import { FormField } from '@/components/forms';
import { Select, Switch } from '@/components/ui';

export interface NotificationSettingsProps {
  value: NotificationPreferences;
  onChange: (patch: Partial<NotificationPreferences>) => void;
}

interface ToggleRow {
  key: keyof NotificationPreferences;
  label: string;
  description: string;
}

const CHANNEL_ROWS: ToggleRow[] = [
  {
    key: 'emailAlerts',
    label: 'Email alerts',
    description: 'Send every new alert to the operations mailbox.',
  },
  {
    key: 'smsAlerts',
    label: 'SMS alerts',
    description: 'Text the on-duty controller for critical breaches.',
  },
  {
    key: 'pushAlerts',
    label: 'Push notifications',
    description: 'Deliver to the mobile driver companion app.',
  },
];

const ROUTING_ROWS: ToggleRow[] = [
  {
    key: 'criticalOnly',
    label: 'Critical only',
    description: 'Suppress warning and info severities on all channels.',
  },
  {
    key: 'dailyDigest',
    label: 'Daily digest',
    description: 'One consolidated summary of the previous 24 hours.',
  },
];

const DIGEST_HOUR_OPTIONS = Array.from({ length: 24 }, (_, hour) => ({
  value: String(hour),
  label: `${String(hour).padStart(2, '0')}:00`,
}));

function ToggleList({
  rows,
  value,
  onChange,
}: {
  rows: ToggleRow[];
  value: NotificationPreferences;
  onChange: NotificationSettingsProps['onChange'];
}) {
  return (
    <div className="divide-y divide-line overflow-hidden rounded-card border border-line">
      {rows.map((row) => (
        <div
          key={row.key}
          className="flex items-start justify-between gap-4 bg-surface-muted/30 px-4 py-3.5"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-content-primary">{row.label}</p>
            <p className="mt-0.5 text-xs text-content-muted">{row.description}</p>
          </div>
          <Switch
            checked={Boolean(value[row.key])}
            onCheckedChange={(checked) => onChange({ [row.key]: checked })}
            label={row.label}
            className="mt-1"
          />
        </div>
      ))}
    </div>
  );
}

/** Delivery channel and routing preferences. */
export function NotificationSettings({ value, onChange }: NotificationSettingsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-semibold text-content-primary">Channels</h4>
          <p className="mt-0.5 text-xs text-content-muted">
            How the operations team is informed when a consignment drifts out of band.
          </p>
        </div>
        <ToggleList rows={CHANNEL_ROWS} value={value} onChange={onChange} />
      </div>

      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-semibold text-content-primary">Routing</h4>
          <p className="mt-0.5 text-xs text-content-muted">
            Which severities are delivered and how they are bundled.
          </p>
        </div>
        <ToggleList rows={ROUTING_ROWS} value={value} onChange={onChange} />

        {value.dailyDigest && (
          <div className="max-w-xs">
            <FormField
              label="Digest delivery hour"
              htmlFor="digestHour"
              hint="Local time the consolidated daily summary is sent."
            >
              <Select
                id="digestHour"
                options={DIGEST_HOUR_OPTIONS}
                value={String(value.digestHour)}
                onChange={(event) => onChange({ digestHour: Number(event.target.value) })}
              />
            </FormField>
          </div>
        )}
      </div>
    </div>
  );
}
