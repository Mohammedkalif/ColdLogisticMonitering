import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Subtle lift on hover — only for cards that are clickable. */
  interactive?: boolean;
  padded?: boolean;
}

/** Surface primitive. Every panel in the product is built from this. */
export function Card({
  interactive = false,
  padded = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-card border border-line bg-surface shadow-card transition',
        interactive && 'cursor-pointer hover:border-line-strong hover:shadow-elevated',
        padded && 'p-5',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  /** Right-aligned controls (filters, links, menus). */
  actions?: ReactNode;
  icon?: ReactNode;
  className?: string;
  /** Removes the bottom divider for headers that sit on plain content. */
  borderless?: boolean;
}

export function CardHeader({
  title,
  description,
  actions,
  icon,
  className,
  borderless = false,
}: CardHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between',
        !borderless && 'border-b border-line',
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {icon}
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-content-primary">{title}</h3>
          {description && (
            <p className="mt-0.5 text-xs leading-relaxed text-content-muted">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-5', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 border-t border-line px-5 py-3 text-xs text-content-muted',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
