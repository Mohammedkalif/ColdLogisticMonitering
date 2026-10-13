import type { PaginatedResult } from '@/types';

/**
 * Client-side pagination helper.
 * Also used by the mock services to emulate a paginated backend response.
 */
export function paginate<T>(items: T[], page: number, pageSize: number): PaginatedResult<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    pageSize,
    total,
    totalPages,
  };
}

/** `Showing 1–10 of 42` range label for table footers. */
export function getPaginationLabel(
  result: Pick<PaginatedResult<unknown>, 'page' | 'pageSize' | 'total'>,
): string {
  if (result.total === 0) return 'No results';
  const start = (result.page - 1) * result.pageSize + 1;
  const end = Math.min(result.page * result.pageSize, result.total);
  return `Showing ${start}–${end} of ${result.total}`;
}
