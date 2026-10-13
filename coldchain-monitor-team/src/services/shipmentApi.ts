import type { ShipmentSelectorItem } from '@/types';
import { buildSelectorShipments } from '@/data/mockLiveMonitoring';
import { apiRequest } from './apiClient';

/**
 * Shipment selector roster for the Live Monitoring screen.
 *
 * Backend contract:
 *   GET /shipments?status=active   -> ShipmentSelectorItem[]
 *
 * Returns the lightweight list the searchable selector needs (id, code, truck,
 * driver, commodity, route, status, ETA, health). Replace the mock resolver
 * with the real endpoint when the fleet service is available.
 */
export const shipmentApi = {
  getSelectorShipments(): Promise<ShipmentSelectorItem[]> {
    return apiRequest<ShipmentSelectorItem[]>({
      method: 'GET',
      url: '/shipments/selector',
      mock: () => buildSelectorShipments(),
      mockLatencyMs: 200,
    });
  },
};
