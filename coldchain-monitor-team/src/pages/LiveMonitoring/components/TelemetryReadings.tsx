import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Battery,
  DoorOpen,
  Droplets,
  Satellite,
  Snowflake,
  Thermometer,
  type LucideIcon,
} from 'lucide-react';
import type { SensorOverviewCard, SensorOverviewKey } from '@/types';
import { useCountUp } from '@/hooks/useCountUp';
import { formatNumber } from '@/utils/format';
import { formatTimeAgoShort } from '@/utils/date';
import { getToneStyle } from '@/utils/tone';
import { cn } from '@/utils/cn';
import { Badge, Card, CardContent, CardHeader, Sparkline, StatusDot } from '@/components';
import { deviceConnectivityMeta } from '@/utils/domain';

/**
 * Live Sensor Overview — section 2 of the Cold Chain Operations Center.
 *
 * Purpose: at-a-glance health of the six primary in-container sensors.
 *
 * Expected API response: `LiveMonitoringFrame.sensorOverview` (SensorOverviewCard[]).
 * Required fields per card: value (pre-formatted), tone, statusLabel,
 * connection, lastUpdatedAt, optional trend + sparkline.
 *
 * Future backend integration: values already arrive shaped from the service
 * layer — no component change needed when the mock is replaced.
 * Future ML integration: the `trend` field can later carry a model-forecast
 * delta instead of the synthetic live delta.
 */

const ICONS: Record<SensorOverviewKey, LucideIcon> = {
  temperature: Thermometer,
  humidity: Droplets,
  door: DoorOpen,
  gps: Satellite,
  battery: Battery,
  cooling: Snowflake,
};

const TREND_ICONS = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  flat: ArrowRight,
} as const;

interface SensorCardProps {
  card: SensorOverviewCard;
  live: boolean;
  index: number;
}

function SensorCard({ card, live, index }: SensorCardProps) {
  const Icon = ICONS[card.key];
  const toneStyle = getToneStyle(card.tone);
  const shouldReduceMotion = useReducedMotion();

  const numeric = card.unit ? Number(card.value) : NaN;
  const isNumeric = !Number.isNaN(numeric);
  const precision = card.key === 'temperature' ? 1 : 0;

  const animated = useCountUp(numeric, { precision, enabled: isNumeric });
  const displayValue = isNumeric ? formatNumber(animated, precision) : card.value;

  const connection = deviceConnectivityMeta[card.connection];

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: 'easeOut', delay: Math.min(index * 0.03, 0.18) }}
    >
      <div className="flex h-full flex-col rounded-card border border-line bg-surface p-4 shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-elevated">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-md',
                toneStyle.iconSurface,
              )}
            >
              <Icon size={14} aria-hidden />
            </span>
            <p className="truncate text-xs font-medium text-content-muted">{card.label}</p>
          </div>
          <StatusDot
            tone={
              card.connection === 'online'
                ? 'success'
                : card.connection === 'degraded'
                  ? 'warning'
                  : 'danger'
            }
            pulse={live && card.connection !== 'offline'}
          />
        </div>

        <div className="mt-3 flex items-end justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1">
              <span className="tabular text-2xl font-semibold leading-none tracking-tight text-content-primary">
                {displayValue}
              </span>
              {card.unit && (
                <span className="text-sm font-medium text-content-muted">{card.unit}</span>
              )}
            </div>
            <Badge tone={card.tone} withDot className="mt-2">
              {card.statusLabel}
            </Badge>
          </div>
          {card.sparkline && card.sparkline.length > 0 && (
            <Sparkline
              data={card.sparkline}
              tone={card.tone}
              height={36}
              className="w-16 shrink-0 sm:w-20"
            />
          )}
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-2.5 text-2xs text-content-muted">
          {card.trend ? (
            <span className="inline-flex items-center gap-1">
              {(() => {
                const TrendIcon = TREND_ICONS[card.trend.direction];
                return <TrendIcon size={12} className={toneStyle.text} aria-hidden />;
              })()}
              <span className="tabular">{card.trend.value}</span>
            </span>
          ) : (
            <span className="truncate">{card.statusLabel}</span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <span className={cn('h-1.5 w-1.5 rounded-full', toneStyle.dot)} aria-hidden />
            <span className="capitalize">{connection.label.toLowerCase()}</span>
            <span className="text-content-muted/70">
              · {formatTimeAgoShort(card.lastUpdatedAt)}
            </span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export interface LiveSensorOverviewProps {
  cards: SensorOverviewCard[];
  live: boolean;
  isLoading?: boolean;
}

export function LiveSensorOverview({ cards, live, isLoading = false }: LiveSensorOverviewProps) {
  return (
    <Card>
      <CardHeader
        title="Live Sensor Overview"
        description="Primary in-container sensors streaming in real time"
        actions={
          <StatusDot
            tone={live ? 'success' : 'neutral'}
            pulse={live}
            label={live ? 'Live' : 'Paused'}
          />
        }
      />
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {isLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[8.75rem] animate-pulse rounded-card border border-line bg-surface-muted/40"
                />
              ))
            : cards.map((card, index) => (
                <SensorCard key={card.key} card={card} live={live} index={index} />
              ))}
        </div>
      </CardContent>
    </Card>
  );
}
