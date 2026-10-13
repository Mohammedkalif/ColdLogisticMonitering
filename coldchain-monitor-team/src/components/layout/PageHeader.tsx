import type { ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatRelativeTime } from '@/utils/date';
import { Button } from '@/components/ui';

export interface PageHeaderProps {
  title: string;
  description?: string;
  /** Filters and primary actions for the page. */
  actions?: ReactNode;
  /** Timestamp of the latest successful fetch. */
  lastUpdatedAt?: Date | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  className?: string;
}

/** Consistent page title block used by every screen. */
export function PageHeader({
  title,
  description,
  actions,
  lastUpdatedAt,
  onRefresh,
  isRefreshing = false,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn('flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between', className)}
    >
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-content-primary sm:text-[1.375rem]">
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-content-muted">{description}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {lastUpdatedAt && (
          <span className="hidden text-xs text-content-muted sm:inline">
            Updated {formatRelativeTime(lastUpdatedAt)}
          </span>
        )}
        {actions}
        {onRefresh && (
          <Button
            variant="secondary"
            size="md"
            icon={RefreshCw}
            onClick={onRefresh}
            isLoading={isRefreshing}
            aria-label="Refresh data"
          >
            Refresh
          </Button>
        )}
      </div>
    </div>
  );
}
