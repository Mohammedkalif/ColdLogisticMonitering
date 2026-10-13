import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface TableToolbarProps {
  /** Search field and filters. */
  children?: ReactNode;
  /** Right-aligned actions (export, bulk operations). */
  actions?: ReactNode;
  className?: string;
}

/** Filter bar that sits directly above a `DataTable`. */
export function TableToolbar({ children, actions, className }: TableToolbarProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-b border-line px-4 py-3 lg:flex-row lg:items-center lg:justify-between',
        className,
      )}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">{children}</div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
