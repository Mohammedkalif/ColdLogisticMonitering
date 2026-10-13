import { useCallback } from 'react';
import type { TimeRangeKey } from '@/types';
import { dashboardApi } from '@/services';
import { DEFAULT_TIME_RANGE } from '@/utils/constants';
import { useAsyncData } from './useAsyncData';

/** KPI cards, fleet counters and service health for the Dashboard page. */
export function useDashboardSummary(range: TimeRangeKey = DEFAULT_TIME_RANGE) {
  const fetcher = useCallback(() => dashboardApi.getSummary(range), [range]);
  return useAsyncData(fetcher);
}

/** Highest-risk shipments currently on the road. */
export function useActiveShipments(limit = 5) {
  const fetcher = useCallback(() => dashboardApi.getActiveShipments(limit), [limit]);
  return useAsyncData(fetcher);
}

/** Series for the dashboard trend charts. */
export function useDashboardTrends(range: TimeRangeKey = DEFAULT_TIME_RANGE) {
  const fetcher = useCallback(() => dashboardApi.getTrends(range), [range]);
  return useAsyncData(fetcher);
}

/** Ambient weather at the origin hub. */
export function useWeatherSummary() {
  const fetcher = useCallback(() => dashboardApi.getWeather(), []);
  return useAsyncData(fetcher);
}

/** Operational audit feed for the Recent Activity timeline. */
export function useRecentActivity(limit = 8) {
  const fetcher = useCallback(() => dashboardApi.getRecentActivity(limit), [limit]);
  return useAsyncData(fetcher);
}
