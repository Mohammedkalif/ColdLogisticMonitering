import { useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface GlobalSearchProps {
  className?: string;
}

/**
 * Top bar search field.
 *
 * Placeholder only — wire to `GET /search?q=` (shipments, alerts, devices)
 * and render a results popover when the endpoint exists.
 */
export function GlobalSearch({ className }: GlobalSearchProps) {
  const [query, setQuery] = useState('');

  return (
    <div className={cn('relative', className)}>
      <Search
        size={15}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-content-muted"
        aria-hidden
      />
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search shipments, devices, alerts…"
        aria-label="Search"
        className={cn(
          'h-9 w-full rounded-control border border-line bg-surface-muted pl-9 pr-14 text-sm text-content-primary transition',
          'placeholder:text-content-muted hover:border-line-strong focus:border-brand focus:bg-surface focus:outline-none',
        )}
      />
      <kbd className="kbd pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">⌘K</kbd>
    </div>
  );
}
