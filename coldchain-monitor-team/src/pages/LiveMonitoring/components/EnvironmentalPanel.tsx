import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Droplets,
  Sun,
  Sunrise,
  Sunset,
  Wind,
  type LucideIcon,
} from 'lucide-react';
import type { EnvironmentalConditions, WeatherCondition } from '@/types';
import { airQualityMeta } from '@/utils/domain';
import { formatPercent, formatTemperature } from '@/utils/format';
import { formatTime } from '@/utils/date';
import { Badge, Card, CardContent, CardHeader, Skeleton, StatusDot } from '@/components';

/**
 * Environmental Conditions — section 6 of the Cold Chain Operations Center.
 *
 * Purpose: ambient context outside the container (origin-region weather).
 *
 * Expected API response: `EnvironmentalConditions` (weatherApi.getEnvironmental).
 * Required fields: temperatureC, humidityPct, condition, windSpeedKph,
 * feelsLikeC, sunriseAt, sunsetAt, airQualityIndex, airQualityLevel/Label.
 *
 * Future backend integration: point `weatherApi` at a weather / road-condition
 * feed — the component already renders every field it returns.
 */

const CONDITION_ICONS: Record<WeatherCondition, LucideIcon> = {
  clear: Sun,
  partly_cloudy: CloudSun,
  cloudy: Cloud,
  rain: CloudRain,
  thunderstorm: CloudLightning,
  haze: CloudFog,
};

interface MiniStatProps {
  label: string;
  value: string;
  icon: LucideIcon;
}

function MiniStat({ label, value, icon: Icon }: MiniStatProps) {
  return (
    <div className="rounded-control border border-line bg-surface-muted/40 p-3">
      <div className="flex items-center gap-1.5 text-2xs text-content-muted">
        <Icon size={13} aria-hidden />
        <span>{label}</span>
      </div>
      <p className="tabular mt-1.5 text-sm font-semibold text-content-primary">{value}</p>
    </div>
  );
}

export interface EnvironmentalPanelProps {
  conditions: EnvironmentalConditions | null;
  isLoading?: boolean;
}

export function EnvironmentalPanel({ conditions, isLoading = false }: EnvironmentalPanelProps) {
  const ConditionIcon = conditions ? CONDITION_ICONS[conditions.condition] : Cloud;
  const aq = conditions ? airQualityMeta[conditions.airQualityLevel] : undefined;

  return (
    <Card>
      <CardHeader
        title="Environmental Conditions"
        description={conditions?.location ?? 'Loading ambient data…'}
        actions={<StatusDot tone={isLoading ? 'neutral' : 'success'} pulse={!isLoading} />}
      />
      <CardContent className="pt-0">
        {isLoading || !conditions ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-32" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
            <Skeleton className="h-4 w-full" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-card bg-surface-muted text-content-secondary">
                <ConditionIcon size={24} aria-hidden />
              </span>
              <div>
                <p className="tabular text-3xl font-semibold tracking-tight text-content-primary">
                  {formatTemperature(conditions.temperatureC)}
                </p>
                <p className="text-xs text-content-muted">{conditions.conditionLabel}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <MiniStat
                label="Humidity"
                value={formatPercent(conditions.humidityPct)}
                icon={Droplets}
              />
              <MiniStat label="Wind" value={`${conditions.windSpeedKph} km/h`} icon={Wind} />
              <MiniStat
                label="Feels like"
                value={formatTemperature(conditions.feelsLikeC)}
                icon={Sun}
              />
              <div className="rounded-control border border-line bg-surface-muted/40 p-3">
                <div className="flex items-center gap-1.5 text-2xs text-content-muted">
                  <Wind size={13} aria-hidden />
                  <span>Air quality</span>
                </div>
                <p className="tabular mt-1.5 text-sm font-semibold text-content-primary">
                  {conditions.airQualityIndex}
                </p>
                {aq && (
                  <Badge tone={aq.tone} className="mt-1.5">
                    {aq.label}
                  </Badge>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-2xs text-content-muted">
              <span className="inline-flex items-center gap-1.5">
                <Sunrise size={13} aria-hidden />
                {formatTime(conditions.sunriseAt)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Sunset size={13} aria-hidden />
                {formatTime(conditions.sunsetAt)}
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
