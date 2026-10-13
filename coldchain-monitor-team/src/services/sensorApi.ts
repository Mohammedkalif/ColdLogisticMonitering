import type {
  SensorDevice,
  SensorReading,
  Shipment,
  TelemetrySnapshot,
  TimeRangeKey,
} from '@/types';
import { buildTelemetrySnapshot, findMockShipment, mockShipments } from '@/data';
import { apiRequest } from './apiClient';

/**
 * IoT telemetry and monitored shipments.
 *
 * Backend contract:
 *   GET /shipments?status=active                       -> Shipment[]
 *   GET /shipments/:id                                 -> Shipment
 *   GET /shipments/:id/telemetry?range=24h             -> TelemetrySnapshot
 *   GET /shipments/:id/readings/latest                 -> SensorReading
 *   GET /shipments/:id/devices                         -> SensorDevice[]
 *
 * Replace with a WebSocket/SSE subscription later — `useTelemetry` already
 * polls through this module, so only the transport changes.
 */
export const sensorApi = {
  /** All shipments currently reporting telemetry. */
  getMonitoredShipments(): Promise<Shipment[]> {
    return apiRequest<Shipment[]>({
      method: 'GET',
      url: '/shipments',
      params: { status: 'active' },
      mock: () => mockShipments,
    });
  },

  getShipment(shipmentId: string): Promise<Shipment | undefined> {
    return apiRequest<Shipment | undefined>({
      method: 'GET',
      url: `/shipments/${shipmentId}`,
      mock: () => findMockShipment(shipmentId),
    });
  },

  /** Latest reading, device roster and chart series for one shipment. */
  getTelemetrySnapshot(
    shipmentId: string,
    range: TimeRangeKey = '24h',
  ): Promise<TelemetrySnapshot> {
    return apiRequest<TelemetrySnapshot>({
      method: 'GET',
      url: `/shipments/${shipmentId}/telemetry`,
      params: { range },
      mock: () => buildTelemetrySnapshot(shipmentId, range),
      // Live polling should feel immediate — shorten the simulated latency.
      mockLatencyMs: 220,
    });
  },

  getLatestReading(shipmentId: string): Promise<SensorReading> {
    return apiRequest<SensorReading>({
      method: 'GET',
      url: `/shipments/${shipmentId}/readings/latest`,
      mock: () => buildTelemetrySnapshot(shipmentId).latest,
      mockLatencyMs: 180,
    });
  },

  getDevices(shipmentId: string): Promise<SensorDevice[]> {
    return apiRequest<SensorDevice[]>({
      method: 'GET',
      url: `/shipments/${shipmentId}/devices`,
      mock: () => buildTelemetrySnapshot(shipmentId).devices,
    });
  },
};
