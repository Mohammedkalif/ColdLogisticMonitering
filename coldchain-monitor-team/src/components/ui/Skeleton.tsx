import type { CSSProperties } from 'react';
import { cn } from '@/utils/cn';

export interface SkeletonProps {
  className?: string;
  style?: CSSProperties;
}

/** Neutral loading placeholder — matches the final content's footprint. */
export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn('relative overflow-hidden rounded-md bg-surface-hover/60', className)}
      style={style}
      aria-hidden
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-content-muted/10 to-transparent" />
    </div>
  );
}

/** Convenience block of stacked text lines. */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton key={index} className={cn('h-3', index === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  );
}
