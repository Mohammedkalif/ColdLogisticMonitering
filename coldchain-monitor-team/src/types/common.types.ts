/**
 * Primitive/shared types used across every domain module.
 */

/** ISO-8601 timestamp, e.g. `2026-08-05T09:30:00.000Z`. */
export type ISODateString = string;

export type Nullable<T> = T | null;

/** Visual tone used by badges, metric cards, chart series and status dots. */
export type StatusTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'brand';

/** Direction of a metric compared to the previous period. */
export type TrendDirection = 'up' | 'down' | 'flat';

/** Normalised spoilage risk buckets produced by the ML service. */
export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

/** Selectable analysis windows used by dashboards and history filters. */
export type TimeRangeKey = '1h' | '24h' | '7d' | '30d' | '90d';

export interface SelectOption<TValue extends string = string> {
  value: TValue;
  label: string;
  description?: string;
}

export interface TrendIndicator {
  direction: TrendDirection;
  /** Pre-formatted delta, e.g. `+1.4%`. Formatting stays in the data layer. */
  value: string;
  /** Comparison window label, e.g. `vs. last 24h`. */
  label: string;
}

/** Single point of a time series. */
export interface TimeSeriesPoint {
  timestamp: ISODateString;
  value: number;
}

/** Chart-friendly row: `{ timestamp, temperature: 4.1, humidity: 88 }`. */
export interface ChartDatum {
  timestamp: ISODateString;
  [seriesKey: string]: number | string;
}

export interface DateRange {
  from: ISODateString;
  to: ISODateString;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
}
