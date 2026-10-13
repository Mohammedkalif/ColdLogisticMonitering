import type { StatusTone } from '@/types';
import { cn } from '@/utils/cn';
import { getToneStyle } from '@/utils/tone';

export interface StatusDotProps {
  tone?: StatusTone;
  /** Adds a slow halo — reserved for genuinely live signals. */
  pulse?: boolean;
  label?: string;
  className?: string;
}

/** Small connectivity/health indicator. */
export function StatusDot({ tone = 'neutral', pulse = false, label, className }: StatusDotProps) {
  const style = getToneStyle(tone);

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span className="relative flex h-2 w-2 shrink-0">
        {pulse && (
          <span
            className={cn(
              'absolute inline-flex h-full w-full rounded-full opacity-60',
              style.dot,
              'animate-pulse-ring',
            )}
            aria-hidden
          />
        )}
        <span className={cn('relative inline-flex h-2 w-2 rounded-full', style.dot)} aria-hidden />
      </span>
      {label && <span className="text-xs text-content-secondary">{label}</span>}
    </span>
  );
}
