import { Activity, Cpu, Database, Radio, Server, ShieldCheck, type LucideIcon } from 'lucide-react';
import type { ServiceStatus, SystemComponentHealth } from '@/types';
import { cn } from '@/utils/cn';
import { serviceStatusMeta } from '@/utils/domain';
import { getToneStyle } from '@/utils/tone';
import { Badge, Card, CardHeader, Skeleton, Tooltip } from '@/components/ui';

export interface SystemHealthPanelProps {
  components: SystemComponentHealth[];
  isLoading: boolean;
}

/** Iconography per service id, with a neutral fallback for new services. */
const componentIcons: Record<string, LucideIcon> = {
  sensors: Radio,
  api: Server,
  ml: Cpu,
  database: Database,
  alerts: ShieldCheck,
};

/** Operator-facing wording for each service state. */
const statusWording: Record<ServiceStatus, string> = {
  operational: 'Healthy',
  degraded: 'Warning',
  down: 'Offline',
};

/**
 * Platform health widget.
 *
 * Surfaces sensor connectivity, API, prediction engine and database so a
 * controller can rule out platform faults before investigating cargo.
 */
export function SystemHealthPanel({ components, isLoading }: SystemHealthPanelProps) {
  const degraded = components.filter((component) => component.status !== 'operational').length;
  const allHealthy = !isLoading && degraded === 0;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title="System health"
        description="Platform services and ingestion pipeline"
        icon={
          <span className="flex h-8 w-8 items-center justify-center rounded-control bg-surface-muted text-content-muted">
            <Activity size={16} aria-hidden />
          </span>
        }
        actions={
          !isLoading && (
            <Badge tone={allHealthy ? 'success' : 'warning'} withDot>
              {allHealthy ? 'All systems go' : `${degraded} degraded`}
            </Badge>
          )
        }
      />

      <div className="flex-1 space-y-2 p-4">
        {isLoading &&
          Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-3 rounded-control border border-line px-3 py-2.5"
            >
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-7 w-7 rounded-md" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-4 w-14" />
            </div>
          ))}

        {!isLoading &&
          components.map((component) => {
            const meta = serviceStatusMeta[component.status];
            const tone = getToneStyle(meta.tone);
            const Icon = componentIcons[component.id] ?? Server;

            return (
              <div
                key={component.id}
                className={cn(
                  'flex items-center justify-between gap-3 rounded-control border border-line',
                  'bg-surface-muted/40 px-3 py-2.5 transition duration-200 hover:border-line-strong',
                )}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-md',
                      tone.iconSurface,
                    )}
                  >
                    <Icon size={14} aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-content-primary">
                      {component.name}
                    </p>
                    <p className="tabular mt-0.5 text-2xs text-content-muted">
                      {component.uptimePct.toFixed(2)}% uptime · {component.latencyMs} ms
                    </p>
                  </div>
                </div>

                <Tooltip
                  content={`${component.name} is ${statusWording[component.status].toLowerCase()}`}
                >
                  <Badge tone={meta.tone} withDot>
                    {statusWording[component.status]}
                  </Badge>
                </Tooltip>
              </div>
            );
          })}
      </div>
    </Card>
  );
}
