import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface MetricCardGridProps {
  children: ReactNode;
  /** Maximum columns on extra-large screens. */
  columns?: 3 | 4;
  className?: string;
}

/** Responsive grid: 1 col (mobile) → 2 (tablet) → 3/4 (desktop). */
export function MetricCardGrid({ children, columns = 3, className }: MetricCardGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 sm:grid-cols-2',
        columns === 3 ? 'xl:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-4',
        className,
      )}
    >
      {children}
    </div>
  );
}
