import { useMemo, useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import type { ShipmentSelectorItem, ShipmentStatus } from '@/types';
import { shipmentStatusMeta } from '@/utils/domain';
import { formatRelativeTime } from '@/utils/date';
import { cn } from '@/utils/cn';
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  ProgressBar,
  SearchInput,
  Select,
  Skeleton,
  StatusDot,
} from '@/components';

/**
 * Live Shipment Selector — section 1 of the Cold Chain Operations Center.
 *
 * Purpose: searchable, filterable roster of in-transit consignments.
 *
 * Expected API response: `ShipmentSelectorItem[]` (shipmentApi.getSelectorShipments).
 * Required fields: code, truckNumber, driverName, productType, origin,
 * destination, status, etaAt, healthScore, riskLevel, currentLocation,
 * progressPct.
 *
 * Future backend integration: filtering is performed client-side here; once the
 * roster grows, push the `search`/`status` params to the endpoint and let the
 * service return the filtered list.
 */

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  ...Object.entries(shipmentStatusMeta).map(([value, meta]) => ({ value, label: meta.label })),
];

function healthTone(score: number) {
  return score >= 75 ? 'success' : score >= 45 ? 'warning' : 'danger';
}

interface SelectorRowProps {
  shipment: ShipmentSelectorItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

function SelectorRow({ shipment, isSelected, onSelect }: SelectorRowProps) {
  const status = shipmentStatusMeta[shipment.status];

  return (
    <button
      type="button"
      onClick={() => onSelect(shipment.id)}
      aria-pressed={isSelected}
      className={cn(
        'w-full rounded-control border p-3 text-left transition',
        isSelected
          ? 'border-brand/50 bg-brand/[0.06]'
          : 'border-line bg-surface hover:border-line-strong hover:bg-surface-hover/40',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-content-primary">{shipment.code}</p>
          <p className="mt-0.5 truncate text-2xs text-content-muted">
            {shipment.productType} · {shipment.truckNumber}
          </p>
        </div>
        <Badge tone={status.tone} withDot>
          {status.label}
        </Badge>
      </div>

      <div className="mt-2 flex items-center gap-1.5 text-xs text-content-secondary">
        <MapPin size={12} className="shrink-0 text-content-muted" aria-hidden />
        <span className="truncate">
          {shipment.origin} → {shipment.destination}
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 text-2xs text-content-muted">
        <span className="truncate">Driver {shipment.driverName}</span>
        <span className="tabular shrink-0">ETA {formatRelativeTime(shipment.etaAt)}</span>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <ProgressBar
          value={shipment.healthScore}
          tone={healthTone(shipment.healthScore)}
          className="flex-1"
        />
        <span className="tabular text-2xs font-medium text-content-secondary">
          {shipment.healthScore}
        </span>
      </div>
    </button>
  );
}

export interface ShipmentSelectorProps {
  shipments: ShipmentSelectorItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLoading?: boolean;
}

export function ShipmentSelector({
  shipments,
  selectedId,
  onSelect,
  isLoading = false,
}: ShipmentSelectorProps) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return shipments.filter((shipment) => {
      if (status !== 'all' && shipment.status !== (status as ShipmentStatus)) return false;
      if (!term) return true;
      return [
        shipment.code,
        shipment.truckNumber,
        shipment.driverName,
        shipment.productType,
        shipment.origin,
        shipment.destination,
      ]
        .join(' ')
        .toLowerCase()
        .includes(term);
    });
  }, [shipments, search, status]);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title="Live Shipment Selector"
        description={`${filtered.length} of ${shipments.length} consignment(s) reporting`}
        icon={<StatusDot tone="success" pulse label="Streaming" />}
      />
      <div className="flex flex-col gap-2 border-b border-line p-3 sm:flex-row">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search code, truck, driver"
          className="flex-1"
        />
        <Select
          options={STATUS_OPTIONS}
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          selectSize="sm"
          aria-label="Filter by status"
          className="sm:w-40"
        />
      </div>

      <CardContent className="flex-1 p-3">
        <div className="no-scrollbar max-h-[34rem] space-y-2 overflow-y-auto">
          {isLoading &&
            Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-[7.5rem] w-full rounded-control" />
            ))}

          {!isLoading && filtered.length === 0 && (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <Search size={18} className="text-content-muted" aria-hidden />
              <p className="text-xs text-content-muted">No shipments match your filters.</p>
            </div>
          )}

          {!isLoading &&
            filtered.map((shipment) => (
              <SelectorRow
                key={shipment.id}
                shipment={shipment}
                isSelected={shipment.id === selectedId}
                onSelect={onSelect}
              />
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
