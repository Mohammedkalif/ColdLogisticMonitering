import type { SelectOption } from '@/types';
import { cn } from '@/utils/cn';

export interface SegmentedControlProps<T extends string> {
  options: readonly SelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
  className?: string;
  'aria-label'?: string;
}

/** Compact exclusive selector — used for time ranges and view switches. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = 'sm',
  className,
  'aria-label': ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center gap-0.5 rounded-control border border-line bg-surface-muted p-0.5',
        className,
      )}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-[7px] font-medium transition',
              size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm',
              isActive
                ? 'bg-surface text-content-primary shadow-card'
                : 'text-content-muted hover:text-content-secondary',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
