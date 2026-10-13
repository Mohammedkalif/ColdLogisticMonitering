import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  /** Grid columns for the fields inside the section. */
  columns?: 1 | 2 | 3;
  className?: string;
}

/** Titled group of related fields. */
export function FormSection({
  title,
  description,
  children,
  columns = 2,
  className,
}: FormSectionProps) {
  return (
    <section className={cn('space-y-4', className)}>
      <div>
        <h4 className="text-sm font-semibold text-content-primary">{title}</h4>
        {description && <p className="mt-0.5 text-xs text-content-muted">{description}</p>}
      </div>
      <div
        className={cn(
          'grid gap-4',
          columns === 1 && 'grid-cols-1',
          columns === 2 && 'grid-cols-1 sm:grid-cols-2',
          columns === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        )}
      >
        {children}
      </div>
    </section>
  );
}
