import { useCallback } from 'react';
import type { TimeRangeKey } from '@/types';
import { sensorApi } from '@/services';
import { env } from '@/utils/env';
import { useAsyncData } from './useAsyncData';

/** Shipments that currently stream telemetry. */
export function useMonitoredShipments() {
  const fetcher = useCallback(() => sensorApi.getMonitoredShipments(), []);
  return useAsyncData(fetcher);
}

export interface UseTelemetryOptions {
  range?: TimeRangeKey;
  /** Pause polling (tab hidden, operator paused the stream). */
  live?: boolean;
  pollIntervalMs?: number;
}

/**
 * Telemetry for one shipment, refreshed on an interval.
 *
 * Swap `sensorApi.getTelemetrySnapshot` for a WebSocket subscription later —
 * the component contract stays identical.
 */
export function useTelemetry(shipmentId: string | null, options: UseTelemetryOptions = {}) {
  const { range = '24h', live = true, pollIntervalMs = env.telemetryPollIntervalMs } = options;

  const fetcher = useCallback(
    () => sensorApi.getTelemetrySnapshot(shipmentId as string, range),
    [shipmentId, range],
  );

  return useAsyncData(fetcher, {
    enabled: Boolean(shipmentId),
    pollIntervalMs: live ? pollIntervalMs : undefined,
  });
}
