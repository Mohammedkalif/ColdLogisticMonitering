import { cn } from '@/utils/cn';

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  count?: number;
}

export interface TabsProps<T extends string = string> {
  items: readonly TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
}

/** Underlined tab bar for in-page section switching. */
export function Tabs<T extends string = string>({
  items,
  value,
  onChange,
  className,
}: TabsProps<T>) {
  return (
    <div
      className={cn('no-scrollbar overflow-x-auto border-b border-line', className)}
      role="tablist"
    >
      <div className="flex min-w-max items-center gap-1">
        {items.map((item) => {
          const isActive = item.id === value;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(item.id)}
              className={cn(
                'relative flex items-center gap-2 whitespace-nowrap px-3 py-2.5 text-sm font-medium transition',
                isActive
                  ? 'text-content-primary'
                  : 'text-content-muted hover:text-content-secondary',
              )}
            >
              {item.label}
              {item.count !== undefined && (
                <span
                  className={cn(
                    'tabular rounded-full px-1.5 py-0.5 text-2xs',
                    isActive ? 'bg-brand/15 text-brand' : 'bg-surface-hover text-content-muted',
                  )}
                >
                  {item.count}
                </span>
              )}
              {isActive && (
                <span
                  className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand"
                  aria-hidden
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
