import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { cn } from '@/utils/cn';
import { Input } from '@/components/ui';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Debounce window before `onChange` fires. */
  delayMs?: number;
  className?: string;
  inputSize?: 'sm' | 'md';
}

/** Debounced search field — prevents a request per keystroke. */
export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  delayMs = 300,
  className,
  inputSize = 'sm',
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(value);
  const debouncedValue = useDebouncedValue(internalValue, delayMs);

  /* Propagate debounced edits upwards. */
  useEffect(() => {
    if (debouncedValue !== value) onChange(debouncedValue);
    // `value` is intentionally excluded: it would re-fire on parent updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  /* Keep in sync when the parent resets filters. */
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  return (
    <div className={cn('relative', className)}>
      <Input
        icon={Search}
        inputSize={inputSize}
        placeholder={placeholder}
        value={internalValue}
        onChange={(event) => setInternalValue(event.target.value)}
        aria-label={placeholder}
      />
      {internalValue && (
        <button
          type="button"
          onClick={() => setInternalValue('')}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-content-muted transition hover:text-content-primary"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}
