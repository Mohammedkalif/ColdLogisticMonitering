import { useCallback, useState } from 'react';
import type { Alert, AlertQuery } from '@/types';
import { alertsApi, toApiError, type ApiError } from '@/services';
import { useAsyncData } from './useAsyncData';

/** Paginated alert list driven by the Alerts page filters. */
export function useAlerts(query: AlertQuery = {}) {
  const queryKey = JSON.stringify(query);
  // Query is serialised so a new object literal per render does not refetch.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetcher = useCallback(() => alertsApi.getAlerts(query), [queryKey]);
  return useAsyncData(fetcher);
}

/** Header counters (open / critical / acknowledged / MTTA). */
export function useAlertSummary() {
  const fetcher = useCallback(() => alertsApi.getSummary(), []);
  return useAsyncData(fetcher);
}

/** Compact feed for the dashboard panel and the notification menu. */
export function useRecentAlerts(limit = 5) {
  const fetcher = useCallback(() => alertsApi.getRecentAlerts(limit), [limit]);
  return useAsyncData(fetcher);
}

/**
 * Alert lifecycle mutations with per-row pending state.
 * `onSettled` lets the caller refresh the list after a successful action.
 */
export function useAlertActions(onSettled?: () => void) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  const run = useCallback(
    async (alertId: string, action: (id: string) => Promise<Alert>) => {
      setPendingId(alertId);
      setError(null);
      try {
        const result = await action(alertId);
        onSettled?.();
        return result;
      } catch (caught) {
        setError(toApiError(caught));
        return null;
      } finally {
        setPendingId(null);
      }
    },
    [onSettled],
  );

  return {
    pendingId,
    error,
    acknowledge: (alertId: string) => run(alertId, alertsApi.acknowledgeAlert),
    resolve: (alertId: string) => run(alertId, alertsApi.resolveAlert),
  };
}
