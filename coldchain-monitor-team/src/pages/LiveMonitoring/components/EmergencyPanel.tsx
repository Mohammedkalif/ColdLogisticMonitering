import {
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Phone,
  Siren,
  type LucideIcon,
} from 'lucide-react';
import type { EmergencySummary, StatusTone } from '@/types';
import { getToneStyle } from '@/utils/tone';
import { cn } from '@/utils/cn';
import { Badge, Card, CardContent, CardHeader, Skeleton, StatusDot } from '@/components';

/**
 * Emergency Status — section 10 of the Cold Chain Operations Center.
 *
 * Purpose: at-a-glance escalation state, recommended action and who to call.
 *
 * Expected API response: `LiveMonitoringFrame.emergency` (EmergencySummary).
 * Required fields: criticalAlerts, warnings, normalEvents, contacts[],
 * recommendedAction, tone.
 *
 * Future backend integration: the `recommendedAction` string and counts should
 * one day come from the alert/escalation service; the component renders them
 * verbatim. Emergency contacts are a placeholder directory for now.
 */

interface CountCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: StatusTone;
}

function CountCard({ label, value, icon: Icon, tone }: CountCardProps) {
  const toneStyle = getToneStyle(tone);
  return (
    <div className="flex items-center gap-2.5 rounded-control border border-line bg-surface-muted/40 p-3">
      <span
        className={cn('flex h-8 w-8 items-center justify-center rounded-md', toneStyle.iconSurface)}
      >
        <Icon size={15} aria-hidden />
      </span>
      <div>
        <p className="tabular text-lg font-semibold leading-none text-content-primary">{value}</p>
        <p className="mt-1 text-2xs text-content-muted">{label}</p>
      </div>
    </div>
  );
}

export interface EmergencyPanelProps {
  summary: EmergencySummary;
  live: boolean;
  isLoading?: boolean;
}

export function EmergencyPanel({ summary, live, isLoading = false }: EmergencyPanelProps) {
  const actionStyle = getToneStyle(summary.tone);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title="Emergency Status"
        description="Escalations and immediate actions"
        actions={<StatusDot tone={summary.tone} pulse={live && summary.tone !== 'success'} />}
      />
      <CardContent className="flex flex-1 flex-col gap-4 pt-0">
        {isLoading ? (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
            <Skeleton className="h-20" />
            <Skeleton className="h-24" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3">
              <CountCard
                label="Critical"
                value={summary.criticalAlerts}
                icon={Siren}
                tone="danger"
              />
              <CountCard
                label="Warnings"
                value={summary.warnings}
                icon={AlertTriangle}
                tone="warning"
              />
              <CountCard
                label="Normal"
                value={summary.normalEvents}
                icon={CheckCircle2}
                tone="success"
              />
            </div>

            <div className={cn('rounded-control border p-3', actionStyle.badge)}>
              <div className="flex items-start gap-2.5">
                <Lightbulb
                  size={16}
                  className={cn('mt-0.5 shrink-0', actionStyle.text)}
                  aria-hidden
                />
                <div>
                  <p className="text-2xs font-semibold uppercase tracking-wide text-content-muted">
                    Recommended immediate action
                  </p>
                  <p className={cn('mt-1 text-sm font-medium', actionStyle.text)}>
                    {summary.recommendedAction}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="mb-2 text-2xs font-semibold uppercase tracking-wide text-content-muted">
                Emergency contacts
              </p>
              <ul className="space-y-2">
                {summary.contacts.map((contact) => (
                  <li
                    key={contact.phone}
                    className="flex items-center justify-between gap-2 rounded-control border border-line bg-surface-muted/40 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-content-primary">
                        {contact.name}
                      </p>
                      <p className="truncate text-2xs text-content-muted">{contact.role}</p>
                    </div>
                    <a
                      href={`tel:${contact.phone.replace(/\s/g, '')}`}
                      className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-brand hover:underline"
                    >
                      <Phone size={12} aria-hidden />
                      {contact.phone}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-auto flex items-center gap-2 pt-1 text-2xs text-content-muted">
              <Badge tone={summary.tone} withDot>
                {summary.tone === 'danger'
                  ? 'Escalate'
                  : summary.tone === 'warning'
                    ? 'Monitor'
                    : 'Stable'}
              </Badge>
              <span>Contact directory is a placeholder for backend integration.</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
