import type { LucideIcon } from 'lucide-react';
import type { StatusTone } from '@/types';
import { cn } from '@/utils/cn';
import { getToneStyle } from '@/utils/tone';
import { Skeleton } from '@/components/ui';

export interface StatTileProps {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  tone?: StatusTone;
  isLoading?: boolean;
  className?: string;
}

/** Compact secondary statistic — used in page headers and summary strips. */
export function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'neutral',
  isLoading = false,
  className,
}: StatTileProps) {
  const toneStyle = getToneStyle(tone);

  return (
    <div className={cn('rounded-card border border-line bg-surface p-4 shadow-card', className)}>
      <div className="flex items-center gap-2">
        {Icon && (
          <span
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded-md',
              toneStyle.iconSurface,
            )}
          >
            <Icon size={13} aria-hidden />
          </span>
        )}
        <p className="text-xs font-medium text-content-muted">{label}</p>
      </div>

      {isLoading ? (
        <Skeleton className="mt-3 h-6 w-16" />
      ) : (
        <p className="tabular mt-2 text-xl font-semibold tracking-tight text-content-primary">
          {value}
        </p>
      )}

      {hint && <p className="mt-1 text-2xs text-content-muted">{hint}</p>}
    </div>
  );
}
