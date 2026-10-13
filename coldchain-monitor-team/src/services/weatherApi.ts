import type { EnvironmentalConditions } from '@/types';
import { buildEnvironmental } from '@/data/mockLiveMonitoring';
import { apiRequest } from './apiClient';

/**
 * Ambient / environmental conditions outside the container.
 *
 * Backend contract:
 *   GET /shipments/:id/environment   -> EnvironmentalConditions
 *
 * In mock mode the values are seeded per shipment with a small time-based
 * oscillation so the panel feels live. Replace with a real weather / road-
 * condition feed later — the `EnvironmentalConditions` shape is the contract.
 */
export const weatherApi = {
  getEnvironmental(shipmentId: string): Promise<EnvironmentalConditions> {
    return apiRequest<EnvironmentalConditions>({
      method: 'GET',
      url: `/shipments/${shipmentId}/environment`,
      mock: () => buildEnvironmental(shipmentId),
      mockLatencyMs: 220,
    });
  },
};
