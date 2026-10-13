import type { StatusTone } from '@/types';
import { cn } from '@/utils/cn';
import { clamp } from '@/utils/format';
import { getToneStyle } from '@/utils/tone';

export interface ProgressBarProps {
  /** 0-100 */
  value: number;
  tone?: StatusTone;
  size?: 'xs' | 'sm';
  label?: string;
  className?: string;
}

/** Horizontal meter used for risk, confidence and journey progress. */
export function ProgressBar({
  value,
  tone = 'brand',
  size = 'xs',
  label,
  className,
}: ProgressBarProps) {
  const safeValue = clamp(value, 0, 100);
  const style = getToneStyle(tone);

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'w-full overflow-hidden rounded-full bg-surface-hover',
          size === 'xs' ? 'h-1' : 'h-1.5',
        )}
        role="progressbar"
        aria-valuenow={Math.round(safeValue)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={cn('h-full rounded-full transition-[width] duration-500', style.bar)}
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}
