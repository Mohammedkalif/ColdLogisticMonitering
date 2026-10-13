import type { Alert, AlertQuery, AlertSummary, PaginatedResult } from '@/types';
import { mockAlertSummary, mockAlerts } from '@/data';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';
import { paginate } from '@/utils/pagination';
import { apiRequest } from './apiClient';

/**
 * Alert feed and lifecycle actions.
 *
 * Backend contract:
 *   GET   /alerts?search=&severity=&status=&page=&pageSize=  -> PaginatedResult<Alert>
 *   GET   /alerts/summary                                    -> AlertSummary
 *   GET   /alerts/recent?limit=5                             -> Alert[]
 *   PATCH /alerts/:id/acknowledge                            -> Alert
 *   PATCH /alerts/:id/resolve                                -> Alert
 */

/** Mock-only filtering; the real backend performs this server-side. */
function filterAlerts(query: AlertQuery): Alert[] {
  const search = query.search?.trim().toLowerCase() ?? '';

  return mockAlerts
    .filter((alert) =>
      query.severity && query.severity !== 'all' ? alert.severity === query.severity : true,
    )
    .filter((alert) =>
      query.status && query.status !== 'all' ? alert.status === query.status : true,
    )
    .filter((alert) =>
      query.category && query.category !== 'all' ? alert.category === query.category : true,
    )
    .filter((alert) =>
      search
        ? [alert.title, alert.description, alert.shipmentCode, alert.code]
            .join(' ')
            .toLowerCase()
            .includes(search)
        : true,
    )
    .sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime());
}

export const alertsApi = {
  /** Paginated, filterable alert list backing the Alerts table. */
  getAlerts(query: AlertQuery = {}): Promise<PaginatedResult<Alert>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? DEFAULT_PAGE_SIZE;

    return apiRequest<PaginatedResult<Alert>>({
      method: 'GET',
      url: '/alerts',
      params: { ...query, page, pageSize },
      mock: () => paginate(filterAlerts(query), page, pageSize),
    });
  },

  /** Counters for the Alerts page header tiles. */
  getSummary(): Promise<AlertSummary> {
    return apiRequest<AlertSummary>({
      method: 'GET',
      url: '/alerts/summary',
      mock: () => mockAlertSummary,
    });
  },

  /** Most recent alerts for the dashboard panel and notification menu. */
  getRecentAlerts(limit = 5): Promise<Alert[]> {
    return apiRequest<Alert[]>({
      method: 'GET',
      url: '/alerts/recent',
      params: { limit },
      mock: () => filterAlerts({ status: 'all' }).slice(0, limit),
      mockLatencyMs: 300,
    });
  },

  acknowledgeAlert(alertId: string): Promise<Alert> {
    return apiRequest<Alert>({
      method: 'PATCH',
      url: `/alerts/${alertId}/acknowledge`,
      mock: () => {
        const alert = mockAlerts.find((item) => item.id === alertId) ?? mockAlerts[0]!;
        return {
          ...alert,
          status: 'acknowledged',
          acknowledgedAt: new Date().toISOString(),
          acknowledgedBy: 'You',
        };
      },
      mockLatencyMs: 350,
    });
  },

  resolveAlert(alertId: string): Promise<Alert> {
    return apiRequest<Alert>({
      method: 'PATCH',
      url: `/alerts/${alertId}/resolve`,
      mock: () => {
        const alert = mockAlerts.find((item) => item.id === alertId) ?? mockAlerts[0]!;
        return { ...alert, status: 'resolved' };
      },
      mockLatencyMs: 350,
    });
  },
};
