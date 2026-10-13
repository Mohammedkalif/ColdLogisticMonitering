import type { ReactNode } from 'react';
import { LineChart } from 'lucide-react';
import { cn } from '@/utils/cn';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';

export interface ChartContainerProps {
  children: ReactNode;
  height?: number;
  isLoading?: boolean;
  isError?: boolean;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * Standardises the loading / error / empty lifecycle for every chart so the
 * pages stay declarative.
 */
export function ChartContainer({
  children,
  height = 260,
  isLoading = false,
  isError = false,
  isEmpty = false,
  emptyTitle = 'No data for this period',
  emptyDescription = 'Telemetry will appear here once the selected shipments start reporting.',
  onRetry,
  className,
}: ChartContainerProps) {
  if (isLoading) {
    return (
      <div className={cn('flex flex-col justify-end gap-3 px-1', className)} style={{ height }}>
        <div className="flex flex-1 items-end gap-2">
          {[40, 65, 52, 78, 58, 84, 46, 70, 62, 90, 55, 74].map((value, index) => (
            <Skeleton key={index} className="flex-1 rounded-sm" style={{ height: `${value}%` }} />
          ))}
        </div>
        <Skeleton className="h-2.5 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={cn('flex items-center justify-center', className)} style={{ height }}>
        <ErrorState size="sm" onRetry={onRetry} description="Chart data could not be retrieved." />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className={cn('flex items-center justify-center', className)} style={{ height }}>
        <EmptyState size="sm" icon={LineChart} title={emptyTitle} description={emptyDescription} />
      </div>
    );
  }

  return <div className={className}>{children}</div>;
}
