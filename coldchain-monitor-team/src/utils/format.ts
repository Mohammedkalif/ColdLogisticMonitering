/**
 * Value formatting helpers. Keep every `toFixed` / `Intl` call in this file so
 * number presentation stays consistent product-wide.
 */
export const DEFAULT_LOCALE = 'en-IN';

export function formatNumber(value: number, fractionDigits = 0): string {
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

/** `4.16` -> `4.2 °C` (unit optional so cards can render it separately). */
export function formatTemperature(celsius: number, withUnit = true): string {
  const value = formatNumber(celsius, 1);
  return withUnit ? `${value} °C` : value;
}

/** Percentage already expressed on a 0-100 scale. */
export function formatPercent(value: number, fractionDigits = 0): string {
  return `${formatNumber(value, fractionDigits)}%`;
}

/** Probability on a 0-1 scale -> `72%`. */
export function formatProbability(value: number, fractionDigits = 0): string {
  return formatPercent(value * 100, fractionDigits);
}

/** `18.5` -> `18h 30m`. */
export function formatDurationHours(hours: number): string {
  const totalMinutes = Math.round(hours * 60);
  const days = Math.floor(totalMinutes / (60 * 24));
  const remainingHours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}d ${remainingHours}h`;
  if (remainingHours > 0)
    return minutes > 0 ? `${remainingHours}h ${minutes}m` : `${remainingHours}h`;
  return `${minutes}m`;
}

export function formatWeightKg(kilograms: number): string {
  if (kilograms >= 1000) return `${formatNumber(kilograms / 1000, 1)} t`;
  return `${formatNumber(kilograms)} kg`;
}

export function formatDistanceKm(kilometres: number): string {
  return `${formatNumber(kilometres)} km`;
}

/** `temperature_excursion` -> `Temperature excursion` (safe fallback label). */
export function humanizeToken(token: string): string {
  const spaced = token.replace(/[_-]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}

/** Derive avatar initials from a display name. */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
