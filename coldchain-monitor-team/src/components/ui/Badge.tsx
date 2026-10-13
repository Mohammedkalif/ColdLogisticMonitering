import type { ReactNode } from 'react';
import type { StatusTone } from '@/types';
import { cn } from '@/utils/cn';
import { getToneStyle } from '@/utils/tone';

export interface BadgeProps {
  children: ReactNode;
  tone?: StatusTone;
  /** Show a leading status dot. */
  withDot?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

/** Compact status pill used in tables, cards and headers. */
export function Badge({
  children,
  tone = 'neutral',
  withDot = false,
  size = 'sm',
  className,
}: BadgeProps) {
  const style = getToneStyle(tone);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-2xs' : 'px-2.5 py-1 text-xs',
        style.badge,
        className,
      )}
    >
      {withDot && (
        <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', style.dot)} aria-hidden />
      )}
      {children}
    </span>
  );
}
