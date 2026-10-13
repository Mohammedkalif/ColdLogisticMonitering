import type { SelectOption } from '@/types';
import { cn } from '@/utils/cn';
import { Select } from '@/components/ui';

export interface FilterSelectProps<T extends string> {
  label: string;
  value: T;
  options: readonly SelectOption<T>[];
  onChange: (value: T) => void;
  className?: string;
}

/** Compact labelled dropdown used inside table toolbars. */
export function FilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
  className,
}: FilterSelectProps<T>) {
  return (
    <Select
      aria-label={label}
      selectSize="sm"
      className={cn('w-full sm:w-[10.5rem]', className)}
      options={options as readonly SelectOption<string>[]}
      value={value}
      onChange={(event) => onChange(event.target.value as T)}
    />
  );
}
