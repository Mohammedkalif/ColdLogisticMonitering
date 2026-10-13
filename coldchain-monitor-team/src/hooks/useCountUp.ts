import { useEffect, useRef, useState } from 'react';

export interface UseCountUpOptions {
  /** Animation duration in milliseconds. */
  durationMs?: number;
  /** Decimal places preserved while counting. */
  precision?: number;
  /** Skip the animation entirely (e.g. while data is still loading). */
  enabled?: boolean;
}

/** Ease-out cubic — fast start, gentle settle. */
const easeOut = (progress: number): number => 1 - Math.pow(1 - progress, 3);

/**
 * Animate a number from its previous value to `target`.
 *
 * Used by the KPI cards so figures settle into place instead of snapping.
 * Honours `prefers-reduced-motion` by jumping straight to the target, and
 * always lands exactly on `target` to avoid rounding drift.
 */
export function useCountUp(target: number, options: UseCountUpOptions = {}): number {
  const { durationMs = 900, precision = 0, enabled = true } = options;

  const [value, setValue] = useState(enabled ? 0 : target);
  const frameRef = useRef<number>();
  const originRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      setValue(target);
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || durationMs <= 0) {
      setValue(target);
      return;
    }

    const from = originRef.current;
    const delta = target - from;
    if (delta === 0) {
      setValue(target);
      return;
    }

    const factor = 10 ** precision;
    const startedAt = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - startedAt) / durationMs, 1);
      const next = from + delta * easeOut(progress);

      setValue(progress === 1 ? target : Math.round(next * factor) / factor);
      if (progress < 1) frameRef.current = requestAnimationFrame(step);
    };

    frameRef.current = requestAnimationFrame(step);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      // Subsequent updates animate from wherever the last run finished.
      originRef.current = target;
    };
  }, [target, durationMs, precision, enabled]);

  return value;
}
