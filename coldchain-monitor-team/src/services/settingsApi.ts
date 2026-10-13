import type { AppSettings, UserProfile } from '@/types';
import { mockSettings, mockUser } from '@/data';
import { apiRequest } from './apiClient';

/**
 * Workspace configuration and the signed-in operator.
 *
 * Backend contract:
 *   GET   /settings        -> AppSettings
 *   PATCH /settings        -> AppSettings   (body: the full settings object)
 *   GET   /me              -> UserProfile
 *
 * Payload notes:
 *  - `PATCH /settings` receives the whole `AppSettings` draft, including the
 *    `thresholds[]` rules edited in the Thresholds tab. The frontend validates
 *    ranges/ordering before submitting; the backend remains the authority on
 *    accepted values.
 *  - `organization.defaultPredictionHorizonHours` is optional; omit it from
 *    responses until the workspace configures one (the UI falls back to 24h).
 *  - `integrations.useMockData` is the persisted workspace record. Actual
 *    mock/live switching is build-time (`VITE_USE_MOCK_API`) — the frontend
 *    never derives runtime mode from this field.
 */
export const settingsApi = {
  getSettings(): Promise<AppSettings> {
    return apiRequest<AppSettings>({
      method: 'GET',
      url: '/settings',
      mock: () => mockSettings,
    });
  },

  updateSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
    return apiRequest<AppSettings>({
      method: 'PATCH',
      url: '/settings',
      data: patch,
      mock: () => ({ ...mockSettings, ...patch }),
      mockLatencyMs: 700,
    });
  },

  getCurrentUser(): Promise<UserProfile> {
    return apiRequest<UserProfile>({
      method: 'GET',
      url: '/me',
      mock: () => mockUser,
      mockLatencyMs: 200,
    });
  },
};
