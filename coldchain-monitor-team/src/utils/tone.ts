import type { StatusTone } from '@/types';

/**
 * Tailwind class sets per semantic tone.
 *
 * Class strings must stay complete (never built by concatenation) so the
 * Tailwind compiler can statically detect them.
 */
export interface ToneStyle {
  /** Badge / pill surface. */
  badge: string;
  /** Solid dot indicator. */
  dot: string;
  /** Foreground-only text colour. */
  text: string;
  /** Tinted square used behind icons. */
  iconSurface: string;
  /** Progress / meter fill. */
  bar: string;
  /** Left accent border for list rows. */
  accent: string;
}

export const toneStyles: Record<StatusTone, ToneStyle> = {
  neutral: {
    badge: 'border-line bg-surface-muted text-content-secondary',
    dot: 'bg-content-muted',
    text: 'text-content-secondary',
    iconSurface: 'bg-surface-muted text-content-secondary',
    bar: 'bg-content-muted',
    accent: 'border-l-line-strong',
  },
  brand: {
    badge: 'border-brand/30 bg-brand/10 text-brand',
    dot: 'bg-brand',
    text: 'text-brand',
    iconSurface: 'bg-brand/10 text-brand',
    bar: 'bg-brand',
    accent: 'border-l-brand',
  },
  info: {
    badge: 'border-info/30 bg-info/10 text-info',
    dot: 'bg-info',
    text: 'text-info',
    iconSurface: 'bg-info/10 text-info',
    bar: 'bg-info',
    accent: 'border-l-info',
  },
  success: {
    badge: 'border-success/30 bg-success/10 text-success',
    dot: 'bg-success',
    text: 'text-success',
    iconSurface: 'bg-success/10 text-success',
    bar: 'bg-success',
    accent: 'border-l-success',
  },
  warning: {
    badge: 'border-warning/30 bg-warning/10 text-warning',
    dot: 'bg-warning',
    text: 'text-warning',
    iconSurface: 'bg-warning/10 text-warning',
    bar: 'bg-warning',
    accent: 'border-l-warning',
  },
  danger: {
    badge: 'border-danger/30 bg-danger/10 text-danger',
    dot: 'bg-danger',
    text: 'text-danger',
    iconSurface: 'bg-danger/10 text-danger',
    bar: 'bg-danger',
    accent: 'border-l-danger',
  },
};

/** Convenience accessor with a safe fallback. */
export function getToneStyle(tone: StatusTone = 'neutral'): ToneStyle {
  return toneStyles[tone] ?? toneStyles.neutral;
}
