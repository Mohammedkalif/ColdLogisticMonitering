import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: 'top' | 'bottom';
  className?: string;
}

/**
 * Lightweight CSS-only tooltip.
 * Sufficient for short hints; swap for a positioning library if collision
 * detection becomes necessary.
 */
export function Tooltip({ content, children, side = 'top', className }: TooltipProps) {
  return (
    <span className={cn('group/tooltip relative inline-flex', className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          // `hidden` (not `opacity-0`) so the tooltip never contributes to the
          // page scroll width on narrow viewports.
          'pointer-events-none absolute left-1/2 z-popover hidden w-max -translate-x-1/2 rounded-md border border-line',
          'max-w-[min(16rem,calc(100vw-2rem))] bg-surface px-2 py-1 text-2xs text-content-secondary shadow-popover',
          'group-hover/tooltip:block group-hover/tooltip:animate-fade-in',
          side === 'top' ? 'bottom-[calc(100%+6px)]' : 'top-[calc(100%+6px)]',
        )}
      >
        {content}
      </span>
    </span>
  );
}
