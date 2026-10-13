import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2, type LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'border-transparent bg-brand text-white shadow-card hover:bg-brand-hover',
  secondary: 'border-line bg-surface text-content-primary hover:bg-surface-hover',
  outline:
    'border-line bg-transparent text-content-secondary hover:bg-surface-hover hover:text-content-primary',
  ghost:
    'border-transparent bg-transparent text-content-secondary hover:bg-surface-hover hover:text-content-primary',
  danger: 'border-transparent bg-danger text-white hover:bg-danger/90',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1.5 px-3 text-[0.8125rem]',
  md: 'h-9 gap-2 px-3.5 text-sm',
  lg: 'h-10 gap-2 px-4 text-sm',
};

const iconSize: Record<ButtonSize, number> = { sm: 14, md: 16, lg: 16 };

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Lucide icon rendered before the label. */
  icon?: LucideIcon;
  /** Lucide icon rendered after the label. */
  trailingIcon?: LucideIcon;
  isLoading?: boolean;
  fullWidth?: boolean;
}

/** Primary interactive control. Every button in the product uses this. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'secondary',
    size = 'md',
    icon: Icon,
    trailingIcon: TrailingIcon,
    isLoading = false,
    fullWidth = false,
    className,
    children,
    disabled,
    type = 'button',
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex select-none items-center justify-center whitespace-nowrap rounded-control border font-medium transition',
        'disabled:pointer-events-none disabled:opacity-50',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 size={iconSize[size]} className="animate-spin" aria-hidden />
      ) : (
        Icon && <Icon size={iconSize[size]} aria-hidden />
      )}
      {children}
      {TrailingIcon && !isLoading && <TrailingIcon size={iconSize[size]} aria-hidden />}
    </button>
  );
});
