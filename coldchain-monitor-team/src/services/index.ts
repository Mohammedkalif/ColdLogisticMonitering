/**
 * Service barrel — the only entry point components/hooks should use.
 *
 * Integration checklist for backend & ML engineers:
 *  1. Set `VITE_API_BASE_URL` and `VITE_USE_MOCK_API=false` in `.env.local`.
 *  2. Implement the endpoints documented in each service file.
 *  3. Delete the `mock` resolvers (and eventually `src/data`).
 * No component or page needs to change.
 */
export { ApiError, apiClient, apiRequest, isApiError, toApiError } from './apiClient';
export { alertsApi } from './alertsApi';
export { dashboardApi } from './dashboardApi';
export { liveMonitoringApi } from './liveMonitoringApi';
export { shipmentApi } from './shipmentApi';
export { weatherApi } from './weatherApi';
export { historyApi } from './historyApi';
export type { HistoryQuery, HistoryStats } from './historyApi';
export { predictionApi } from './predictionApi';
export { sensorApi } from './sensorApi';
export { settingsApi } from './settingsApi';
