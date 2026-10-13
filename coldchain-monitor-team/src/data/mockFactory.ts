import type { TimeSeriesPoint } from '@/types';

/**
 * Helpers shared by the mock data modules.
 *
 * A seeded generator keeps mock output stable between renders/reloads, which
 * avoids flickering charts and makes UI review predictable.
 * DELETE THIS FOLDER once the backend is wired up.
 */
export function createSeededRandom(seed: number): () => number {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

export interface SeriesOptions {
  /** Number of points to generate. */
  points: number;
  /** Minutes between two consecutive points. */
  stepMinutes: number;
  baseline: number;
  /** Maximum deviation from the baseline. */
  amplitude: number;
  /** Slow drift applied across the whole window. */
  drift?: number;
  decimals?: number;
  seed: number;
  /** Optional epoch (ms) of the newest point. Defaults to now. */
  endsAt?: number;
}

/** Build a deterministic, smooth-looking time series. */
export function buildSeries({
  points,
  stepMinutes,
  baseline,
  amplitude,
  drift = 0,
  decimals = 1,
  seed,
  endsAt = Date.now(),
}: SeriesOptions): TimeSeriesPoint[] {
  const random = createSeededRandom(seed);
  const factor = 10 ** decimals;

  return Array.from({ length: points }, (_, index) => {
    const progress = index / Math.max(points - 1, 1);
    const wave = Math.sin(progress * Math.PI * 2.2 + seed) * amplitude * 0.6;
    const noise = (random() - 0.5) * amplitude * 0.8;
    const value = baseline + wave + noise + drift * progress;

    return {
      timestamp: new Date(endsAt - (points - 1 - index) * stepMinutes * 60_000).toISOString(),
      value: Math.round(value * factor) / factor,
    };
  });
}

/** Deterministic pick from a list (used to vary mock rows). */
export function pick<T>(items: readonly T[], index: number): T {
  return items[index % items.length] as T;
}
