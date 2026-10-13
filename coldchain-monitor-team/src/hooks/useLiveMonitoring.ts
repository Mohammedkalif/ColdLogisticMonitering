import { useCallback } from 'react';
import type { EnvironmentalConditions, LiveMonitoringFrame, ShipmentSelectorItem } from '@/types';
import { liveMonitoringApi, shipmentApi, weatherApi } from '@/services';
import { useAsyncData } from './useAsyncData';

/**
 * Live Monitoring data hooks.
 *
 * These are thin wrappers over `useAsyncData` that point at the Live Monitoring
 * service layer. Polling intervals are kept deliberately different so the
 * page never hammers every endpoint at once: the high-frequency cargo stream
 * ticks every few seconds, while the slower roster and weather feeds refresh on
 * their own cadence.
 */

export interface UseLiveMonitoringOptions {
  /** Pause the streaming interval (operator paused the feed). */
  live?: boolean;
  /** Streaming tick in milliseconds. */
  intervalMs?: number;
}

/**
 * Streaming cargo frame for one shipment.
 *
 * `getLiveState` advances the simulation engine on every call, mirroring a
 * server-pushed sample. When `live` is false the interval stops but the last
 * frame stays on screen. Swap the service for a WebSocket subscription later
 * without touching this hook or any component.
 */
export function useLiveMonitoring(
  shipmentId: string | null,
  options: UseLiveMonitoringOptions = {},
) {
  const { live = true, intervalMs = 4000 } = options;

  const fetcher = useCallback(
    () => liveMonitoringApi.getLiveState(shipmentId as string),
    [shipmentId],
  );

  return useAsyncData<LiveMonitoringFrame>(fetcher, {
    enabled: Boolean(shipmentId),
    pollIntervalMs: live ? intervalMs : undefined,
  });
}

/** Searchable shipment selector roster (slow cadence). */
export function useShipmentSelector() {
  const fetcher = useCallback(() => shipmentApi.getSelectorShipments(), []);
  return useAsyncData<ShipmentSelectorItem[]>(fetcher, { pollIntervalMs: 30_000 });
}

/** Ambient / environmental conditions (medium cadence). */
export function useEnvironmental(shipmentId: string | null) {
  const fetcher = useCallback(
    () => weatherApi.getEnvironmental(shipmentId as string),
    [shipmentId],
  );
  return useAsyncData<EnvironmentalConditions>(fetcher, {
    enabled: Boolean(shipmentId),
    pollIntervalMs: 15_000,
  });
}
