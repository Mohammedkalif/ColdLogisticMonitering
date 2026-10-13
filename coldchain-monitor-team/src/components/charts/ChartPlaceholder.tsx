import { LineChart } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface ChartPlaceholderProps {
  height?: number;
  title?: string;
  description?: string;
  className?: string;
}

/**
 * Reserved slot for a visualisation that is not wired up yet.
 *
 * Renders the axis scaffolding so the layout keeps its final proportions —
 * replace with `<TimeSeriesChart>` once the endpoint is available.
 */
export function ChartPlaceholder({
  height = 260,
  title = 'Visualisation pending',
  description = 'This chart renders once the analytics endpoint is connected.',
  className,
}: ChartPlaceholderProps) {
  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-control bg-surface-muted/40',
        className,
      )}
      style={{ height }}
      aria-hidden
    >
      {/* Horizontal grid lines mirroring the real chart's y-axis */}
      <div className="absolute inset-0 flex flex-col justify-between p-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-px w-full bg-line/60" />
        ))}
      </div>

      <div className="relative flex h-full flex-col items-center justify-center gap-2 text-center">
        <div className="flex h-9 w-9 items-center justify-center rounded-control border border-line bg-surface text-content-muted">
          <LineChart size={16} />
        </div>
        <p className="text-sm font-medium text-content-secondary">{title}</p>
        <p className="max-w-xs text-xs leading-relaxed text-content-muted">{description}</p>
      </div>
    </div>
  );
}
