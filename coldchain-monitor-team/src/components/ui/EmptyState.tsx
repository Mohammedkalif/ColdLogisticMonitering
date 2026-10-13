import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  /** Primary call to action (usually a `<Button>`). */
  action?: ReactNode;
  size?: 'sm' | 'md';
  className?: string;
}

/** Neutral "nothing here yet" placeholder used by panels, tables and charts. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  size = 'md',
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        size === 'sm' ? 'gap-2 px-4 py-8' : 'gap-3 px-6 py-12',
        className,
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-card border border-line bg-surface-muted text-content-muted',
          size === 'sm' ? 'h-9 w-9' : 'h-11 w-11',
        )}
      >
        <Icon size={size === 'sm' ? 16 : 18} aria-hidden />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-content-primary">{title}</p>
        {description && (
          <p className="mx-auto max-w-sm text-xs leading-relaxed text-content-muted">
            {description}
          </p>
        )}
      </div>
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}
