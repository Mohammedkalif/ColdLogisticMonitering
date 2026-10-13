import type { TooltipProps } from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { formatDateTime } from '@/utils/date';

export interface ChartTooltipProps extends TooltipProps<ValueType, NameType> {
  /** Unit suffix per series key, e.g. `{ temperature: '°C' }`. */
  units?: Record<string, string>;
}

/** Themed tooltip shared by every chart in the product. */
export function ChartTooltip({ active, payload, label, units = {} }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  /* Timestamp labels are formatted; categorical labels (chart bins) pass through. */
  const formattedLabel =
    typeof label === 'string' && !Number.isNaN(Date.parse(label)) ? formatDateTime(label) : label;

  return (
    <div className="min-w-[10rem] rounded-control border border-line bg-surface p-3 shadow-popover">
      <p className="text-2xs font-medium uppercase tracking-wide text-content-muted">
        {formattedLabel}
      </p>
      <div className="mt-2 space-y-1.5">
        {payload.map((entry) => (
          <div
            key={String(entry.dataKey)}
            className="flex items-center justify-between gap-4 text-xs"
          >
            <span className="flex items-center gap-2 text-content-secondary">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: entry.color }}
                aria-hidden
              />
              {entry.name}
            </span>
            <span className="tabular font-medium text-content-primary">
              {entry.value}
              {units[String(entry.dataKey)] ? ` ${units[String(entry.dataKey)]}` : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
