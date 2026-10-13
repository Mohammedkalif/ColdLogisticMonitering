import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface FormFieldProps {
  label: string;
  htmlFor?: string;
  /** Helper text rendered under the control. */
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

/** Label + control + hint/error wrapper used by every form in the product. */
export function FormField({
  label,
  htmlFor,
  hint,
  error,
  required = false,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label
        htmlFor={htmlFor}
        className="flex items-center gap-1 text-xs font-medium text-content-secondary"
      >
        {label}
        {required && (
          <span className="text-danger" aria-hidden>
            *
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p className="text-2xs text-danger">{error}</p>
      ) : (
        hint && <p className="text-2xs leading-relaxed text-content-muted">{hint}</p>
      )}
    </div>
  );
}
