import { forwardRef, type ButtonHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  /** Required — icon-only controls must expose an accessible name. */
  label: string;
  size?: 'sm' | 'md';
  variant?: 'ghost' | 'outline';
  isActive?: boolean;
}

/** Square, icon-only control used in toolbars and the top bar. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon: Icon, label, size = 'md', variant = 'ghost', isActive = false, className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex items-center justify-center rounded-control border transition',
        'text-content-muted hover:bg-surface-hover hover:text-content-primary',
        'disabled:pointer-events-none disabled:opacity-50',
        variant === 'outline' ? 'border-line bg-surface' : 'border-transparent',
        size === 'sm' ? 'h-8 w-8' : 'h-9 w-9',
        isActive && 'bg-surface-hover text-content-primary',
        className,
      )}
      {...props}
    >
      <Icon size={size === 'sm' ? 15 : 17} aria-hidden />
    </button>
  );
});
