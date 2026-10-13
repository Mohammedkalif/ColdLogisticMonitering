import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PaginatedResult } from '@/types';
import { cn } from '@/utils/cn';
import { getPaginationLabel } from '@/utils/pagination';
import { PAGE_SIZE_OPTIONS } from '@/utils/constants';
import { IconButton, Select } from '@/components/ui';

export interface TablePaginationProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  isLoading?: boolean;
  className?: string;
}

/** Footer controls for every paginated table. */
export function TablePagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
  className,
}: TablePaginationProps) {
  const label = getPaginationLabel({ page, pageSize, total } as PaginatedResult<unknown>);

  return (
    <div
      className={cn(
        'flex flex-col-reverse items-start gap-3 border-t border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <p className="tabular text-xs text-content-muted">{isLoading ? 'Loading…' : label}</p>

      <div className="flex items-center gap-3">
        {onPageSizeChange && (
          <Select
            aria-label="Rows per page"
            selectSize="sm"
            className="w-[7.5rem]"
            options={PAGE_SIZE_OPTIONS}
            value={String(pageSize)}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
          />
        )}

        <div className="flex items-center gap-1">
          <IconButton
            icon={ChevronLeft}
            label="Previous page"
            size="sm"
            variant="outline"
            disabled={page <= 1 || isLoading}
            onClick={() => onPageChange(page - 1)}
          />
          <span className="tabular min-w-[5.5rem] text-center text-xs text-content-secondary">
            Page {page} of {totalPages}
          </span>
          <IconButton
            icon={ChevronRight}
            label="Next page"
            size="sm"
            variant="outline"
            disabled={page >= totalPages || isLoading}
            onClick={() => onPageChange(page + 1)}
          />
        </div>
      </div>
    </div>
  );
}
