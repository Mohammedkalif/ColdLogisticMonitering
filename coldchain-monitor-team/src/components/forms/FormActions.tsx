import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface FormActionsProps {
  children: ReactNode;
  /** Status text shown on the left (e.g. "Saved 2 minutes ago"). */
  hint?: ReactNode;
  className?: string;
}

/** Sticky-feeling footer for form submit/cancel controls. */
export function FormActions({ children, hint, className }: FormActionsProps) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="text-xs text-content-muted">{hint}</div>
      {/* Wraps keep action rows inside narrow containers (e.g. the Prediction sidebar card). */}
      <div className="flex flex-wrap items-center justify-end gap-2">{children}</div>
    </div>
  );
}
