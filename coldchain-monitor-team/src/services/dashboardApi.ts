import type {
  ActivityEvent,
  DashboardSummary,
  DashboardTrends,
  Shipment,
  SystemComponentHealth,
  TimeRangeKey,
  WeatherSummary,
} from '@/types';
import {
  buildDashboardSummary,
  buildDashboardTrends,
  mockRecentActivity,
  mockShipments,
  mockSystemComponents,
  mockWeatherSummary,
} from '@/data';
import { DEFAULT_TIME_RANGE } from '@/utils/constants';
import { apiRequest } from './apiClient';

/**
 * Dashboard aggregates.
 *
 * Backend contract:
 *   GET /dashboard/summary?range=24h   -> DashboardSummary
 *   GET /dashboard/system-health       -> SystemComponentHealth[]
 *   GET /dashboard/active-shipments    -> Shipment[]
 *   GET /dashboard/trends?range=24h    -> DashboardTrends
 *   GET /dashboard/weather             -> WeatherSummary
 *   GET /dashboard/activity?limit=8    -> ActivityEvent[]
 */
export const dashboardApi = {
  /** Headline KPI cards + fleet counters for the selected window. */
  getSummary(range: TimeRangeKey = DEFAULT_TIME_RANGE): Promise<DashboardSummary> {
    return apiRequest<DashboardSummary>({
      method: 'GET',
      url: '/dashboard/summary',
      params: { range },
      mock: () => buildDashboardSummary(range),
    });
  },

  /** Per-service availability shown in the System Health panel. */
  getSystemHealth(): Promise<SystemComponentHealth[]> {
    return apiRequest<SystemComponentHealth[]>({
      method: 'GET',
      url: '/dashboard/system-health',
      mock: () => mockSystemComponents,
    });
  },

  /** Shipments currently being monitored, ordered by risk. */
  getActiveShipments(limit = 5): Promise<Shipment[]> {
    return apiRequest<Shipment[]>({
      method: 'GET',
      url: '/dashboard/active-shipments',
      params: { limit },
      mock: () => [...mockShipments].sort((a, b) => b.riskScore - a.riskScore).slice(0, limit),
    });
  },

  /** Full-resolution series powering the dashboard trend charts. */
  getTrends(range: TimeRangeKey = DEFAULT_TIME_RANGE): Promise<DashboardTrends> {
    return apiRequest<DashboardTrends>({
      method: 'GET',
      url: '/dashboard/trends',
      params: { range },
      mock: () => buildDashboardTrends(range),
    });
  },

  /** Ambient conditions at the origin hub — context for cooling load. */
  getWeather(): Promise<WeatherSummary> {
    return apiRequest<WeatherSummary>({
      method: 'GET',
      url: '/dashboard/weather',
      mock: () => mockWeatherSummary,
      mockLatencyMs: 320,
    });
  },

  /** Operational audit feed for the Recent Activity timeline. */
  getRecentActivity(limit = 8): Promise<ActivityEvent[]> {
    return apiRequest<ActivityEvent[]>({
      method: 'GET',
      url: '/dashboard/activity',
      params: { limit },
      mock: () =>
        [...mockRecentActivity]
          .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
          .slice(0, limit),
      mockLatencyMs: 380,
    });
  },
};
