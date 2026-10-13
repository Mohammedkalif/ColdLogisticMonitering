import type {
  CalibrationReport,
  CommodityType,
  PaginatedResult,
  ShipmentHistoryRecord,
  ShipmentOutcome,
  TimeRangeKey,
} from '@/types';
import { mockShipmentHistory } from '@/data';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';
import { paginate } from '@/utils/pagination';
import { apiRequest } from './apiClient';

/**
 * Completed shipment archive and model-accuracy feedback.
 *
 * Backend contract:
 *   GET /history/shipments?range=&commodity=&outcome=&page=&pageSize=
 *       -> PaginatedResult<ShipmentHistoryRecord>
 *   GET /history/stats?range=&commodity=&outcome= -> HistoryStats
 *   GET /history/calibration?range=&commodity=&outcome= -> CalibrationReport
 *   GET /history/export?range=&commodity=&outcome= -> text/csv attachment
 *
 * The calibration endpoint feeds the predicted-vs-observed chart on the
 * History page; the export endpoint streams the filtered archive as CSV.
 * Both respect the same filter vocabulary as the paginated list so the
 * frontend can hand the identical query object to every call.
 */
export interface HistoryQuery {
  search?: string;
  range?: TimeRangeKey;
  commodity?: CommodityType | 'all';
  outcome?: ShipmentOutcome | 'all';
  page?: number;
  pageSize?: number;
}

export interface HistoryStats {
  totalShipments: number;
  acceptedRate: number;
  avgTransitHours: number;
  avgExcursions: number;
  /** Mean absolute error between predicted and actual spoilage (0-1). */
  predictionError: number;
  /** Root mean square error between predicted and actual spoilage (0-1). */
  rmse: number;
}

const RANGE_TO_HOURS: Record<TimeRangeKey, number> = {
  '1h': 1,
  '24h': 24,
  '7d': 24 * 7,
  '30d': 24 * 30,
  '90d': 24 * 90,
};

function filterHistory(query: HistoryQuery): ShipmentHistoryRecord[] {
  const search = query.search?.trim().toLowerCase() ?? '';
  const cutoff = Date.now() - RANGE_TO_HOURS[query.range ?? '30d'] * 3_600_000;

  return mockShipmentHistory
    .filter((record) => new Date(record.completedAt).getTime() >= cutoff)
    .filter((record) =>
      query.commodity && query.commodity !== 'all' ? record.commodity === query.commodity : true,
    )
    .filter((record) =>
      query.outcome && query.outcome !== 'all' ? record.outcome === query.outcome : true,
    )
    .filter((record) =>
      search
        ? [record.code, record.route.origin, record.route.destination]
            .join(' ')
            .toLowerCase()
            .includes(search)
        : true,
    )
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
}

/* ----------------------------------------------------------------------- */
/* Calibration (mock builder)                                               */
/* ----------------------------------------------------------------------- */

/** 20-percentage-point bins spanning the full 0-100% spoilage range. */
const CALIBRATION_BIN_EDGES = [0, 0.2, 0.4, 0.6, 0.8, 1];

/** Bin the filtered records into predicted-probability bands. */
function buildCalibrationReport(query: HistoryQuery): CalibrationReport {
  const records = filterHistory(query);

  const bins = CALIBRATION_BIN_EDGES.slice(0, -1)
    .map((lower, index) => {
      const upper = CALIBRATION_BIN_EDGES[index + 1]!;
      const members = records.filter(
        (record) => record.predictedSpoilage >= lower && record.predictedSpoilage < upper,
      );
      if (members.length === 0) return null;

      return {
        id: `bin-${index}`,
        label: `${Math.round(lower * 100)}–${Math.round(upper * 100)}%`,
        predictedAvg:
          Math.round(
            (members.reduce((sum, r) => sum + r.predictedSpoilage, 0) / members.length) * 1000,
          ) / 1000,
        observedAvg:
          Math.round(
            (members.reduce((sum, r) => sum + r.actualSpoilage, 0) / members.length) * 1000,
          ) / 1000,
        shipmentCount: members.length,
      };
    })
    .filter((bin): bin is NonNullable<typeof bin> => bin !== null);

  return {
    range: query.range ?? '30d',
    generatedAt: new Date().toISOString(),
    bins,
    modelVersions: [...new Set(records.map((record) => record.modelVersion))],
  };
}

/* ----------------------------------------------------------------------- */
/* CSV export (mock builder)                                                */
/* ----------------------------------------------------------------------- */

const HISTORY_CSV_HEADER = [
  'prediction_id',
  'shipment_code',
  'commodity',
  'origin',
  'destination',
  'completed_at',
  'transit_hours',
  'avg_temperature_c',
  'avg_humidity_pct',
  'excursions',
  'predicted_spoilage',
  'actual_spoilage',
  'outcome',
  'model_version',
] as const;

const csvCell = (value: string | number): string => {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/** Serialise the filtered archive — the same rows the table displays. */
function buildHistoryCsv(query: HistoryQuery): Blob {
  const rows = filterHistory(query).map((record) =>
    [
      record.id,
      record.code,
      record.commodity,
      record.route.origin,
      record.route.destination,
      record.completedAt,
      record.transitHours,
      record.avgTemperatureC,
      record.avgHumidityPct,
      record.excursions,
      record.predictedSpoilage,
      record.actualSpoilage,
      record.outcome,
      record.modelVersion,
    ]
      .map(csvCell)
      .join(','),
  );

  return new Blob([[HISTORY_CSV_HEADER.join(','), ...rows].join('\n')], {
    type: 'text/csv;charset=utf-8',
  });
}

export const historyApi = {
  getShipmentHistory(query: HistoryQuery = {}): Promise<PaginatedResult<ShipmentHistoryRecord>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? DEFAULT_PAGE_SIZE;

    return apiRequest<PaginatedResult<ShipmentHistoryRecord>>({
      method: 'GET',
      url: '/history/shipments',
      params: { ...query, page, pageSize },
      mock: () => paginate(filterHistory(query), page, pageSize),
    });
  },

  getStats(query: HistoryQuery = {}): Promise<HistoryStats> {
    return apiRequest<HistoryStats>({
      method: 'GET',
      url: '/history/stats',
      params: query,
      mock: () => {
        const records = filterHistory(query);
        const count = Math.max(records.length, 1);
        const accepted = records.filter((record) => record.outcome === 'accepted').length;
        const errors = records.map((r) => r.predictedSpoilage - r.actualSpoilage);

        return {
          totalShipments: records.length,
          acceptedRate: accepted / count,
          avgTransitHours: records.reduce((sum, r) => sum + r.transitHours, 0) / count,
          avgExcursions: records.reduce((sum, r) => sum + r.excursions, 0) / count,
          predictionError: errors.reduce((sum, e) => sum + Math.abs(e), 0) / count,
          rmse: Math.sqrt(errors.reduce((sum, e) => sum + e * e, 0) / count),
        };
      },
    });
  },

  /**
   * Predicted-vs-observed spoilage by probability bin — drives the model
   * calibration chart. The mock computes honest bins from the same records
   * the table shows; the real endpoint simply returns the same shape.
   */
  getCalibration(query: HistoryQuery = {}): Promise<CalibrationReport> {
    return apiRequest<CalibrationReport>({
      method: 'GET',
      url: '/history/calibration',
      params: query,
      mock: () => buildCalibrationReport(query),
      mockLatencyMs: 380,
    });
  },

  /**
   * Download the filtered archive as CSV (`GET /history/export`).
   * Resolves to a Blob so the page stays transport-agnostic; in mock mode
   * the blob is serialised from the same records the table displays.
   */
  exportCsv(query: HistoryQuery = {}): Promise<Blob> {
    return apiRequest<Blob>({
      method: 'GET',
      url: '/history/export',
      params: query,
      responseType: 'blob',
      mock: () => buildHistoryCsv(query),
      mockLatencyMs: 600,
    });
  },
};
