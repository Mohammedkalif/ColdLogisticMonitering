import { MapPin, Thermometer, Droplets } from 'lucide-react';
import type { Shipment } from '@/types';
import { cn } from '@/utils/cn';
import { commodityLabels, riskLevelMeta, shipmentStatusMeta } from '@/utils/domain';
import { formatPercent, formatTemperature } from '@/utils/format';
import { Badge, ProgressBar } from '@/components/ui';

export interface ShipmentCardProps {
  shipment: Shipment;
  isSelected?: boolean;
  onSelect?: (shipmentId: string) => void;
  className?: string;
}

/** Selectable shipment row used in the Live Monitoring list panel. */
export function ShipmentCard({
  shipment,
  isSelected = false,
  onSelect,
  className,
}: ShipmentCardProps) {
  const risk = riskLevelMeta[shipment.riskLevel];
  const status = shipmentStatusMeta[shipment.status];

  return (
    <button
      type="button"
      onClick={() => onSelect?.(shipment.id)}
      aria-pressed={isSelected}
      className={cn(
        'w-full rounded-control border p-3.5 text-left transition',
        isSelected
          ? 'border-brand/50 bg-brand/[0.06]'
          : 'border-line bg-surface hover:border-line-strong hover:bg-surface-hover/40',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-content-primary">{shipment.code}</p>
          <p className="mt-0.5 truncate text-xs text-content-muted">
            {commodityLabels[shipment.commodity]} · {shipment.vehicle.registrationNumber}
          </p>
        </div>
        <Badge tone={risk.tone} withDot>
          {risk.label}
        </Badge>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-xs text-content-secondary">
        <MapPin size={12} className="shrink-0 text-content-muted" aria-hidden />
        <span className="truncate">
          {shipment.route.origin} → {shipment.route.destination}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs text-content-secondary">
        <span className="inline-flex items-center gap-1.5">
          <Thermometer size={12} className="text-content-muted" aria-hidden />
          <span className="tabular">{formatTemperature(shipment.temperatureC)}</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Droplets size={12} className="text-content-muted" aria-hidden />
          <span className="tabular">{formatPercent(shipment.humidityPct)}</span>
        </span>
        <span className="ml-auto text-2xs text-content-muted">{status.label}</span>
      </div>

      <ProgressBar
        value={shipment.progressPct}
        tone={isSelected ? 'brand' : 'neutral'}
        className="mt-3"
        label={`${shipment.code} journey progress`}
      />
    </button>
  );
}
