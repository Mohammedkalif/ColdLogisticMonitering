import { DEFAULT_LOCALE, formatDurationHours } from './format';
import type { ISODateString } from '@/types';

const dateFormatter = new Intl.DateTimeFormat(DEFAULT_LOCALE, {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat(DEFAULT_LOCALE, {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

const relativeFormatter = new Intl.RelativeTimeFormat(DEFAULT_LOCALE, { numeric: 'auto' });

/** `05 Aug 2026` */
export function formatDate(value: ISODateString | Date): string {
  return dateFormatter.format(new Date(value));
}

/** `14:35` */
export function formatTime(value: ISODateString | Date): string {
  return timeFormatter.format(new Date(value));
}

/** `05 Aug 2026, 14:35` */
export function formatDateTime(value: ISODateString | Date): string {
  const date = new Date(value);
  return `${dateFormatter.format(date)}, ${timeFormatter.format(date)}`;
}

/** `3 minutes ago`, `in 2 hours` */
export function formatRelativeTime(value: ISODateString | Date): string {
  const target = new Date(value).getTime();
  const deltaSeconds = Math.round((target - Date.now()) / 1000);
  const absolute = Math.abs(deltaSeconds);

  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['second', 60],
    ['minute', 3600],
    ['hour', 86400],
    ['day', 604800],
    ['week', 2629800],
    ['month', 31557600],
  ];

  let divisor = 1;
  for (const [unit, limit] of units) {
    if (absolute < limit) return relativeFormatter.format(Math.round(deltaSeconds / divisor), unit);
    divisor = limit;
  }
  return relativeFormatter.format(Math.round(deltaSeconds / 31557600), 'year');
}

/** Compact relative label for dense UI (`2m`, `4h`, `3d`). */
export function formatTimeAgoShort(value: ISODateString | Date): string {
  const deltaSeconds = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 1000));
  if (deltaSeconds < 60) return `${deltaSeconds}s`;
  if (deltaSeconds < 3600) return `${Math.floor(deltaSeconds / 60)}m`;
  if (deltaSeconds < 86400) return `${Math.floor(deltaSeconds / 3600)}h`;
  return `${Math.floor(deltaSeconds / 86400)}d`;
}

/**
 * Humanised elapsed span between two timestamps (`3h 12m`).
 * When `to` is omitted the span runs until now — used for open-alert age.
 */
export function formatTimeSpan(from: ISODateString | Date, to?: ISODateString | Date): string {
  const start = new Date(from).getTime();
  const end = to ? new Date(to).getTime() : Date.now();
  return formatDurationHours(Math.max(0, end - start) / 3_600_000);
}

/** ISO timestamp `n` hours before now — used by mock data builders. */
export function hoursAgo(hours: number): ISODateString {
  return new Date(Date.now() - hours * 3600_000).toISOString();
}

/** ISO timestamp `n` minutes before now. */
export function minutesAgo(minutes: number): ISODateString {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

/** ISO timestamp `n` hours after now. */
export function hoursFromNow(hours: number): ISODateString {
  return new Date(Date.now() + hours * 3600_000).toISOString();
}

/** `YYYY-MM-DD`, the value format expected by `<input type="date">`. */
export function toDateInputValue(value: ISODateString | Date): string {
  return new Date(value).toISOString().slice(0, 10);
}
