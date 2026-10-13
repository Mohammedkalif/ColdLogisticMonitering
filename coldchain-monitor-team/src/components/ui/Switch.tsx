import { cn } from '@/utils/cn';

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

/** Accessible on/off control used throughout Settings. */
export function Switch({
  checked,
  onCheckedChange,
  disabled = false,
  label,
  className,
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition',
        'disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'border-brand bg-brand' : 'border-line bg-surface-hover',
        className,
      )}
    >
      <span
        className={cn(
          'inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition',
          checked ? 'translate-x-[1.125rem]' : 'translate-x-[0.1875rem]',
        )}
      />
    </button>
  );
}
