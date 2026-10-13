import {
  CloudDrizzle,
  CloudSun,
  Cloudy,
  Droplets,
  Haze,
  Sun,
  Thermometer,
  Wind,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { WeatherCondition, WeatherSummary } from '@/types';
import { formatPercent, formatTemperature } from '@/utils/format';
import { formatTimeAgoShort } from '@/utils/date';
import { Card, CardHeader, Skeleton } from '@/components/ui';

export interface WeatherCardProps {
  weather?: WeatherSummary | null;
  isLoading: boolean;
}

const conditionIcons: Record<WeatherCondition, LucideIcon> = {
  clear: Sun,
  partly_cloudy: CloudSun,
  cloudy: Cloudy,
  rain: CloudDrizzle,
  thunderstorm: Zap,
  haze: Haze,
};

/**
 * Ambient conditions at the origin hub.
 *
 * Outside temperature drives reefer cooling load, so it provides context for
 * in-transit temperature drift.
 */
export function WeatherCard({ weather, isLoading }: WeatherCardProps) {
  const ConditionIcon = weather ? conditionIcons[weather.condition] : Cloudy;

  const stats = weather
    ? [
        { label: 'Humidity', value: formatPercent(weather.humidityPct), icon: Droplets },
        { label: 'Wind', value: `${weather.windSpeedKph} km/h`, icon: Wind },
        { label: 'Feels like', value: formatTemperature(weather.feelsLikeC), icon: Thermometer },
      ]
    : [];

  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title="Ambient conditions"
        description={weather ? weather.location : 'Origin hub'}
        actions={
          weather && (
            <span className="tabular text-2xs text-content-muted">
              {formatTimeAgoShort(weather.observedAt)} ago
            </span>
          )
        }
      />

      <div className="flex-1 p-5">
        {isLoading ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-11 w-11 rounded-control" />
              <Skeleton className="h-8 w-24" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full rounded-control" />
              ))}
            </div>
          </div>
        ) : (
          weather && (
            <>
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-surface-muted text-content-secondary">
                  <ConditionIcon size={22} aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="tabular text-2xl font-semibold leading-none tracking-tight text-content-primary">
                    {formatTemperature(weather.temperatureC)}
                  </p>
                  <p className="mt-1 truncate text-xs text-content-muted">
                    {weather.conditionLabel}
                  </p>
                </div>
              </div>

              <dl className="mt-5 grid grid-cols-3 gap-2">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-control border border-line bg-surface-muted/40 px-2.5 py-2"
                  >
                    <dt className="flex items-center gap-1 text-2xs text-content-muted">
                      <stat.icon size={11} aria-hidden />
                      <span className="truncate">{stat.label}</span>
                    </dt>
                    <dd className="tabular mt-1 truncate text-xs font-medium text-content-secondary">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </>
          )
        )}
      </div>
    </Card>
  );
}
