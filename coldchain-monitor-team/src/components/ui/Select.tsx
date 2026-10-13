import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import type { SelectOption } from '@/types';
import { cn } from '@/utils/cn';

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: readonly SelectOption<string>[];
  selectSize?: 'sm' | 'md';
  hasError?: boolean;
}

/**
 * Native select styled to match the design system.
 * Native is deliberate: it is accessible, keyboard-friendly and works on
 * mobile without extra dependencies.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { options, selectSize = 'md', hasError = false, className, ...props },
  ref,
) {
  return (
    <div className="relative flex w-full items-center">
      <select
        ref={ref}
        className={cn(
          'w-full cursor-pointer appearance-none rounded-control border bg-surface-muted pr-9 text-content-primary transition',
          'hover:border-line-strong focus:border-brand focus:bg-surface focus:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-60',
          selectSize === 'sm' ? 'h-8 pl-3 text-[0.8125rem]' : 'h-9 pl-3 text-sm',
          hasError ? 'border-danger' : 'border-line',
          className,
        )}
        {...props}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-surface text-content-primary"
          >
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-3 text-content-muted"
        aria-hidden
      />
    </div>
  );
});
