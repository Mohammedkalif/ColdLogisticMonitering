import { useCallback, useEffect, useRef, useState } from 'react';
import type { RequestStatus } from '@/types';
import { type ApiError, toApiError } from '@/services';

export interface UseAsyncDataOptions<T> {
  /** Skip the request until this becomes true (e.g. waiting for an id). */
  enabled?: boolean;
  /** Re-fetch silently on an interval — used by Live Monitoring. */
  pollIntervalMs?: number;
  initialData?: T | null;
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
}

export interface UseAsyncDataResult<T> {
  data: T | null;
  error: ApiError | null;
  status: RequestStatus;
  /** First load, no data yet — render skeletons. */
  isLoading: boolean;
  /** Background refresh with data already on screen — render a subtle spinner. */
  isRefreshing: boolean;
  isError: boolean;
  isSuccess: boolean;
  lastUpdatedAt: Date | null;
  refetch: () => Promise<void>;
  setData: (next: T | null) => void;
}

/**
 * Generic async-read hook shared by every data-backed screen.
 *
 * Keeps request state (loading / refreshing / error / last updated) out of
 * components and guarantees stale responses can never overwrite fresh ones.
 *
 * The `fetcher` MUST be memoised (`useCallback`) — domain hooks in this folder
 * follow that convention.
 */
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  options: UseAsyncDataOptions<T> = {},
): UseAsyncDataResult<T> {
  const { enabled = true, pollIntervalMs, initialData = null, onSuccess, onError } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [error, setError] = useState<ApiError | null>(null);
  const [status, setStatus] = useState<RequestStatus>(enabled ? 'loading' : 'idle');
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  const isMountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const hasDataRef = useRef(initialData !== null);

  /* Keep callbacks out of the effect dependency list. */
  const callbacksRef = useRef({ onSuccess, onError });
  callbacksRef.current = { onSuccess, onError };

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setStatus(hasDataRef.current ? 'refreshing' : 'loading');

    try {
      const result = await fetcher();
      if (!isMountedRef.current || requestId !== requestIdRef.current) return;

      hasDataRef.current = true;
      setData(result);
      setError(null);
      setStatus('success');
      setLastUpdatedAt(new Date());
      callbacksRef.current.onSuccess?.(result);
    } catch (caught) {
      if (!isMountedRef.current || requestId !== requestIdRef.current) return;

      const apiError = toApiError(caught);
      setError(apiError);
      setStatus('error');
      callbacksRef.current.onError?.(apiError);
    }
  }, [fetcher]);

  useEffect(() => {
    if (!enabled) {
      setStatus('idle');
      return;
    }
    void execute();
  }, [enabled, execute]);

  useEffect(() => {
    if (!enabled || !pollIntervalMs) return;

    const timer = window.setInterval(() => {
      void execute();
    }, pollIntervalMs);

    return () => window.clearInterval(timer);
  }, [enabled, pollIntervalMs, execute]);

  const overrideData = useCallback((next: T | null) => {
    hasDataRef.current = next !== null;
    setData(next);
  }, []);

  return {
    data,
    error,
    status,
    isLoading: status === 'loading',
    isRefreshing: status === 'refreshing',
    isError: status === 'error',
    isSuccess: status === 'success',
    lastUpdatedAt,
    refetch: execute,
    setData: overrideData,
  };
}
