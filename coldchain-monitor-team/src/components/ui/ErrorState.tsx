import { AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  size?: 'sm' | 'md';
  className?: string;
}

/** Standard failure state for any data-backed panel. */
export function ErrorState({
  title = 'Unable to load data',
  description = 'The request did not complete. Check the service status and try again.',
  onRetry,
  size = 'md',
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        size === 'sm' ? 'gap-2 px-4 py-8' : 'gap-3 px-6 py-12',
        className,
      )}
      role="alert"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-card border border-danger/30 bg-danger/10 text-danger">
        <AlertTriangle size={18} aria-hidden />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-content-primary">{title}</p>
        <p className="mx-auto max-w-sm text-xs leading-relaxed text-content-muted">{description}</p>
      </div>
      {onRetry && (
        <Button size="sm" variant="secondary" icon={RefreshCw} onClick={onRetry} className="mt-1">
          Retry
        </Button>
      )}
    </div>
  );
}
