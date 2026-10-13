import { useMemo, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown, Inbox } from 'lucide-react';
import { cn } from '@/utils/cn';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';

export type ColumnAlign = 'left' | 'center' | 'right';

export type SortDirection = 'asc' | 'desc';

export interface DataTableSort {
  columnId: string;
  direction: SortDirection;
}

export interface DataTableColumn<T> {
  /** Stable identifier, also used as the React key. */
  id: string;
  header: ReactNode;
  /** Cell renderer — keeps formatting decisions with the column. */
  cell: (row: T) => ReactNode;
  align?: ColumnAlign;
  /** Tailwind width utility, e.g. `w-32`. */
  width?: string;
  /** Hide the column below a breakpoint to keep mobile tables readable. */
  hideBelow?: 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Supplying an accessor makes the column sortable. It must return a
   * primitive so rows can be compared without knowing the domain shape.
   */
  sortAccessor?: (row: T) => string | number;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onRowClick?: (row: T) => void;
  /** Custom empty state; a neutral default is used when omitted. */
  emptyState?: ReactNode;
  skeletonRows?: number;
  dense?: boolean;
  /** Pin the header row while the body scrolls. */
  stickyHeader?: boolean;
  /** Initial sort applied to columns that declare a `sortAccessor`. */
  defaultSort?: DataTableSort;
  /** Max height of the scroll area; pair with `stickyHeader`. */
  maxBodyHeight?: string;
  className?: string;
}

const alignClasses: Record<ColumnAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

const justifyClasses: Record<ColumnAlign, string> = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
};

const hideBelowClasses: Record<NonNullable<DataTableColumn<unknown>['hideBelow']>, string> = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
  xl: 'hidden xl:table-cell',
};

/**
 * Generic, typed table.
 *
 * Owns the loading / error / empty lifecycle so feature pages only describe
 * their columns. Sorting and the sticky header are opt-in: a table that does
 * not declare `sortAccessor` or `stickyHeader` behaves exactly as before.
 */
export function DataTable<T>({
  columns,
  data,
  rowKey,
  isLoading = false,
  isError = false,
  onRetry,
  onRowClick,
  emptyState,
  skeletonRows = 6,
  dense = false,
  stickyHeader = false,
  defaultSort,
  maxBodyHeight,
  className,
}: DataTableProps<T>) {
  const cellPadding = dense ? 'px-4 py-2.5' : 'px-4 py-3';
  const [sort, setSort] = useState<DataTableSort | undefined>(defaultSort);

  const sortedData = useMemo(() => {
    if (!sort) return data;

    const column = columns.find((candidate) => candidate.id === sort.columnId);
    if (!column?.sortAccessor) return data;

    const accessor = column.sortAccessor;
    const modifier = sort.direction === 'asc' ? 1 : -1;

    // Copy first: never mutate the array owned by the caller.
    return [...data].sort((a, b) => {
      const left = accessor(a);
      const right = accessor(b);

      if (typeof left === 'number' && typeof right === 'number') {
        return (left - right) * modifier;
      }
      return String(left).localeCompare(String(right), undefined, { numeric: true }) * modifier;
    });
  }, [data, sort, columns]);

  /** Cycle a column through ascending → descending on repeat activation. */
  const toggleSort = (columnId: string) =>
    setSort((previous) =>
      previous?.columnId === columnId
        ? { columnId, direction: previous.direction === 'asc' ? 'desc' : 'asc' }
        : { columnId, direction: 'asc' },
    );

  if (isError) {
    return <ErrorState onRetry={onRetry} />;
  }

  return (
    <div
      className={cn('w-full overflow-auto', className)}
      style={maxBodyHeight ? { maxHeight: maxBodyHeight } : undefined}
    >
      <table className="w-full border-collapse text-sm">
        <thead className={cn(stickyHeader && 'sticky top-0 z-10')}>
          <tr className="border-b border-line">
            {columns.map((column) => {
              const align = column.align ?? 'left';
              const isSorted = sort?.columnId === column.id;
              const isSortable = Boolean(column.sortAccessor);

              return (
                <th
                  key={column.id}
                  scope="col"
                  aria-sort={
                    isSorted ? (sort?.direction === 'asc' ? 'ascending' : 'descending') : undefined
                  }
                  className={cn(
                    'whitespace-nowrap px-4 py-2.5 text-2xs font-semibold uppercase tracking-wide text-content-muted',
                    // Opaque while sticky so rows never bleed through.
                    stickyHeader ? 'border-b border-line bg-surface-muted' : 'bg-surface-muted/50',
                    alignClasses[align],
                    column.width,
                    column.hideBelow && hideBelowClasses[column.hideBelow],
                  )}
                >
                  {isSortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(column.id)}
                      className={cn(
                        'group/sort inline-flex w-full items-center gap-1.5 rounded transition',
                        'uppercase tracking-wide hover:text-content-primary',
                        justifyClasses[align],
                        isSorted && 'text-content-primary',
                      )}
                    >
                      {column.header}
                      {isSorted ? (
                        sort?.direction === 'asc' ? (
                          <ArrowUp size={12} aria-hidden />
                        ) : (
                          <ArrowDown size={12} aria-hidden />
                        )
                      ) : (
                        <ChevronsUpDown
                          size={12}
                          className="opacity-0 transition group-hover/sort:opacity-60"
                          aria-hidden
                        />
                      )}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {isLoading &&
            Array.from({ length: skeletonRows }).map((_, rowIndex) => (
              <tr key={`skeleton-${rowIndex}`} className="border-b border-line last:border-0">
                {columns.map((column) => (
                  <td
                    key={column.id}
                    className={cn(
                      cellPadding,
                      column.hideBelow && hideBelowClasses[column.hideBelow],
                    )}
                  >
                    <Skeleton className="h-3.5 w-full max-w-[10rem]" />
                  </td>
                ))}
              </tr>
            ))}

          {!isLoading &&
            sortedData.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'border-b border-line transition duration-200 last:border-0',
                  'hover:bg-surface-hover/40',
                  onRowClick && 'cursor-pointer',
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.id}
                    className={cn(
                      cellPadding,
                      'align-middle text-content-secondary',
                      alignClasses[column.align ?? 'left'],
                      column.hideBelow && hideBelowClasses[column.hideBelow],
                    )}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>

      {!isLoading && sortedData.length === 0 && (
        <div className="border-t border-line">
          {emptyState ?? (
            <EmptyState
              icon={Inbox}
              title="No records found"
              description="Adjust the filters or widen the selected time range."
            />
          )}
        </div>
      )}
    </div>
  );
}
