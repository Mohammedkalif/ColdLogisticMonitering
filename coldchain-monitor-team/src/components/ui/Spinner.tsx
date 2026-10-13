import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface SpinnerProps {
  size?: number;
  className?: string;
  label?: string;
}

/** Indeterminate loading indicator. */
export function Spinner({ size = 16, className, label }: SpinnerProps) {
  return (
    <span
      className={cn('inline-flex items-center gap-2 text-content-muted', className)}
      role="status"
    >
      <Loader2 size={size} className="animate-spin" aria-hidden />
      {label && <span className="text-xs">{label}</span>}
      <span className="sr-only">Loading</span>
    </span>
  );
}
