import type { ISODateString } from './common.types';

/**
 * Model-evaluation contracts backing the History page.
 *
 * These shapes are consumed by `historyApi` and rendered through the shared
 * chart components — the backend/analytics service only needs to serialise
 * them to go live.
 */

/** One probability bin of the spoilage calibration report. */
export interface CalibrationBin {
  id: string;
  /** Human-readable probability band, e.g. `20–40%`. */
  label: string;
  /** Mean predicted spoilage probability of journeys in the bin, 0-1. */
  predictedAvg: number;
  /** Mean observed spoilage actually recorded for the bin, 0-1. */
  observedAvg: number;
  /** Completed journeys contributing to this bin. */
  shipmentCount: number;
}

/** Payload behind `GET /history/calibration`. */
export interface CalibrationReport {
  /** Window the report was computed over, e.g. `30d`. */
  range: string;
  generatedAt: ISODateString;
  /** Non-empty bins only — empty bands are omitted rather than fabricated. */
  bins: CalibrationBin[];
  /** Model versions that contributed records inside the window. */
  modelVersions: string[];
}
