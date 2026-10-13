import { useCallback, useState } from 'react';
import { historyApi, type HistoryQuery } from '@/services';
import { saveBlob } from '@/utils/download';
import { toApiError, type ApiError } from '@/services';
import { useAsyncData } from './useAsyncData';

/** Paginated archive of completed journeys. */
export function useShipmentHistory(query: HistoryQuery = {}) {
  const queryKey = JSON.stringify(query);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetcher = useCallback(() => historyApi.getShipmentHistory(query), [queryKey]);
  return useAsyncData(fetcher);
}

/** Aggregates for the History page summary tiles. */
export function useHistoryStats(query: HistoryQuery = {}) {
  const queryKey = JSON.stringify(query);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetcher = useCallback(() => historyApi.getStats(query), [queryKey]);
  return useAsyncData(fetcher);
}

/** Predicted-vs-observed calibration bins for the model evaluation chart. */
export function useHistoryCalibration(query: HistoryQuery = {}) {
  const queryKey = JSON.stringify(query);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetcher = useCallback(() => historyApi.getCalibration(query), [queryKey]);
  return useAsyncData(fetcher);
}

export interface UseExportHistoryResult {
  exportCsv: (query?: HistoryQuery) => Promise<boolean>;
  isExporting: boolean;
  error: ApiError | null;
}

/**
 * CSV export mutation (`GET /history/export`).
 *
 * Keeps the download flow out of the page component: resolving the blob and
 * triggering the browser download both live here, so the backend can swap in
 * the real endpoint without touching the History page.
 */
export function useExportHistory(): UseExportHistoryResult {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const exportCsv = useCallback(async (query: HistoryQuery = {}) => {
    setIsExporting(true);
    setError(null);
    try {
      const blob = await historyApi.exportCsv(query);
      saveBlob(blob, `coldchain-history-${new Date().toISOString().slice(0, 10)}.csv`);
      return true;
    } catch (caught) {
      setError(toApiError(caught));
      return false;
    } finally {
      setIsExporting(false);
    }
  }, []);

  return { exportCsv, isExporting, error };
}
