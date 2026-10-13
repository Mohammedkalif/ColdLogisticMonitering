import type { LiveMonitoringFrame } from '@/types';
import { stepSimulator } from './liveSimulation';
import { apiRequest } from './apiClient';

/**
 * Live Monitoring aggregate service.
 *
 * Backend contract:
 *   GET /shipments/:id/live   -> LiveMonitoringFrame
 *
 * In mock mode `getLiveState` advances the local simulation engine and returns
 * the next frame, mimicking a server-pushed telemetry sample. To go live,
 * replace the `mock` resolver with a WebSocket / SSE subscription that calls
 * `onFrame(frame)` — no component or hook needs to change. The engine in
 * `liveSimulation.ts` is the only thing that fabricates values.
 */
export const liveMonitoringApi = {
  /** Latest live frame for a shipment. Each call advances the stream by one tick. */
  getLiveState(shipmentId: string): Promise<LiveMonitoringFrame> {
    return apiRequest<LiveMonitoringFrame>({
      method: 'GET',
      url: `/shipments/${shipmentId}/live`,
      mock: () => stepSimulator(shipmentId),
      // Live polling should feel instant — skip the simulated latency.
      mockLatencyMs: 0,
    });
  },
};
