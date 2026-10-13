import { useMemo } from 'react';
import type { StatusTone } from '@/types';
import { useTheme } from '@/hooks/useTheme';

export interface ChartTheme {
  grid: string;
  axis: string;
  axisText: string;
  tooltipBackground: string;
  tooltipBorder: string;
  series: Record<StatusTone, string>;
}

/** Read a design token (`--color-*`) as a concrete rgb() string. */
function readToken(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value ? `rgb(${value})` : fallback;
}

/**
 * Recharts needs literal colour values (CSS variables do not resolve inside
 * SVG presentation attributes), so tokens are resolved at render time and
 * recomputed whenever the theme changes.
 */
export function useChartTheme(): ChartTheme {
  const { theme } = useTheme();

  return useMemo(
    () => ({
      grid: readToken('--color-line', '#334155'),
      axis: readToken('--color-line-strong', '#475569'),
      axisText: readToken('--color-content-muted', '#94A3B8'),
      tooltipBackground: readToken('--color-surface', '#1E293B'),
      tooltipBorder: readToken('--color-line', '#334155'),
      series: {
        brand: readToken('--color-brand', '#3B82F6'),
        info: readToken('--color-info', '#38BDF8'),
        success: readToken('--color-success', '#22C55E'),
        warning: readToken('--color-warning', '#F59E0B'),
        danger: readToken('--color-danger', '#EF4444'),
        neutral: readToken('--color-content-muted', '#94A3B8'),
      },
    }),
    // `theme` is the invalidation key: the resolved CSS variables change when
    // the theme class on <html> changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme],
  );
}
