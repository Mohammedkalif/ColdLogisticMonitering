import { forwardRef, type InputHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  /** Static suffix such as a unit (°C, %, ppm). */
  suffix?: string;
  hasError?: boolean;
  inputSize?: 'sm' | 'md';
}

/** Text/number input with optional leading icon and unit suffix. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { icon: Icon, suffix, hasError = false, inputSize = 'md', className, ...props },
  ref,
) {
  return (
    <div className="relative flex w-full items-center">
      {Icon && (
        <Icon
          size={15}
          className="pointer-events-none absolute left-3 text-content-muted"
          aria-hidden
        />
      )}
      <input
        ref={ref}
        className={cn(
          'w-full rounded-control border bg-surface-muted text-content-primary transition',
          'placeholder:text-content-muted',
          'hover:border-line-strong focus:border-brand focus:bg-surface focus:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-60',
          inputSize === 'sm' ? 'h-8 px-3 text-[0.8125rem]' : 'h-9 px-3 text-sm',
          Icon && 'pl-9',
          suffix && 'pr-12',
          hasError ? 'border-danger focus:border-danger' : 'border-line',
          className,
        )}
        {...props}
      />
      {suffix && (
        <span className="pointer-events-none absolute right-3 text-xs font-medium text-content-muted">
          {suffix}
        </span>
      )}
    </div>
  );
});
