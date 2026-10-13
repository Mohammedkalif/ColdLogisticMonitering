import { Suspense, lazy, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Pause, Play } from 'lucide-react';
import type { RiskLevel } from '@/types';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  useEnvironmental,
  useLiveMonitoring,
  useShipmentSelector,
} from '@/hooks/useLiveMonitoring';
import { cn } from '@/utils/cn';
import { PageHeader } from '@/components/layout';
import { Button, Card, CardContent, CardHeader, ErrorState, Skeleton } from '@/components';
import { ShipmentSelector } from './components/ShipmentSelector';
import { LiveSensorOverview } from './components/TelemetryReadings';
import { SensorConnectivityTable } from './components/DeviceList';
import { HealthScoreGauge } from './components/HealthScoreGauge';
import { TruckStatusPanel } from './components/TruckStatusPanel';
import { EnvironmentalPanel } from './components/EnvironmentalPanel';
import { EventTimeline } from './components/EventTimeline';
import { OperationalMap } from './components/OperationalMap';
import { EmergencyPanel } from './components/EmergencyPanel';

/**
 * Heavy Recharts consumer — kept off the initial bundle and streamed in after
 * first paint so the operations center feels instant.
 */
const RealTimeCharts = lazy(() => import('./components/RealTimeCharts'));

const RISK_RANK: Record<RiskLevel, number> = { critical: 3, high: 2, moderate: 1, low: 0 };

/** Subtle mount fade-in; honours the user's reduced-motion preference. */
function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: 'easeOut', delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ChartsFallback() {
  return (
    <Card>
      <CardHeader
        title="Real-Time Monitoring"
        description="Streaming temperature, humidity, cooling and signal quality"
      />
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-[260px] rounded-control" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingState() {
  const cells: { span: string; height: string }[] = [
    { span: 'xl:col-span-3', height: 'h-44' },
    { span: 'xl:col-span-3', height: 'h-72' },
    { span: '', height: 'h-72' },
    { span: '', height: 'h-72' },
    { span: '', height: 'h-72' },
    { span: 'xl:col-span-2', height: 'h-72' },
    { span: '', height: 'h-72' },
    { span: 'xl:col-span-2', height: 'h-72' },
    { span: '', height: 'h-72' },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      {cells.map((cell, index) => (
        <FadeIn key={index} className={cn(cell.span, cell.height)}>
          <Skeleton className="h-full w-full rounded-card" />
        </FadeIn>
      ))}
    </div>
  );
}

/**
 * Live Monitoring — Cold Chain Operations Center.
 *
 * Upgrades the previous per-shipment telemetry view into a real-time
 * operations center covering ten sections: shipment selector, live sensor
 * overview, real-time charts, cold chain health, truck status, environmental
 * conditions, sensor connectivity, event timeline, operational map and
 * emergency status.
 *
 * All data flows through the service layer (`liveMonitoringApi`, `weatherApi`,
 * `shipmentApi`); every widget receives pre-shaped data and never hardcodes a
 * value. The streaming cadence is owned by `useLiveMonitoring` (polling the
 * simulation engine) — replace that with a WebSocket subscription later.
 */
export function LiveMonitoringPage() {
  useDocumentTitle('Live Monitoring');

  /* Deep link: /live-monitoring/:shipmentId selects that consignment on load
     (matched by id or code, case-insensitive). Manual selection afterwards is
     page-local state; the URL is not rewritten. */
  const { shipmentId: shipmentParam } = useParams();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(true);

  const selector = useShipmentSelector();
  const live = useLiveMonitoring(selectedId, { live: isLive, intervalMs: 4000 });
  const environmental = useEnvironmental(selectedId);

  /* Resolve the deep link against the roster; fall back to the
     highest-risk consignment when no param is present or it matches nothing. */
  useEffect(() => {
    if (selectedId || !selector.data?.length) return;

    if (shipmentParam) {
      const wanted = shipmentParam.toLowerCase();
      const match = selector.data.find(
        (item) => item.id.toLowerCase() === wanted || item.code.toLowerCase() === wanted,
      );
      if (match) {
        setSelectedId(match.id);
        return;
      }
    }

    const highest = [...selector.data].sort((a, b) => {
      const diff = RISK_RANK[b.riskLevel] - RISK_RANK[a.riskLevel];
      return diff !== 0 ? diff : a.healthScore - b.healthScore;
    })[0];
    setSelectedId(highest?.id ?? null);
  }, [selector.data, selectedId, shipmentParam]);

  const frame = live.data;
  const isInitialLoading = live.isLoading && !frame;

  const refreshAll = () => {
    void live.refetch();
    void environmental.refetch();
    void selector.refetch();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Monitoring"
        description="Real-time cold chain operations center for refrigerated consignments in transit."
        lastUpdatedAt={live.lastUpdatedAt}
        onRefresh={refreshAll}
        isRefreshing={live.isRefreshing}
        actions={
          <Button
            variant={isLive ? 'secondary' : 'primary'}
            icon={isLive ? Pause : Play}
            onClick={() => setIsLive((previous) => !previous)}
          >
            {isLive ? 'Pause stream' : 'Resume stream'}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[20rem_minmax(0,1fr)]">
        {/* ---------------------------------------------------------- */}
        {/* 1. Live shipment selector                                */}
        {/* ---------------------------------------------------------- */}
        <div className="xl:sticky xl:top-[5.25rem] xl:self-start">
          <ShipmentSelector
            shipments={selector.data ?? []}
            selectedId={selectedId}
            onSelect={setSelectedId}
            isLoading={selector.isLoading}
          />
        </div>

        {/* ---------------------------------------------------------- */}
        {/* Main operations grid                                      */}
        {/* ---------------------------------------------------------- */}
        {live.isError && !frame ? (
          <ErrorState
            title="Unable to load live telemetry"
            description="The streaming service did not respond. Retry to reconnect the feed."
            onRetry={refreshAll}
          />
        ) : isInitialLoading ? (
          <LoadingState />
        ) : frame ? (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            {/* 2. Live sensor overview */}
            <FadeIn className="xl:col-span-3">
              <LiveSensorOverview cards={frame.sensorOverview} live={isLive} />
            </FadeIn>

            {/* 3. Real-time monitoring panel */}
            <FadeIn className="xl:col-span-3">
              <Suspense fallback={<ChartsFallback />}>
                <RealTimeCharts series={frame.series} thresholds={frame.thresholds} live={isLive} />
              </Suspense>
            </FadeIn>

            {/* 4. Cold chain health */}
            <FadeIn>
              <HealthScoreGauge score={frame.healthScore} live={isLive} />
            </FadeIn>

            {/* 5. Live truck status */}
            <FadeIn>
              <TruckStatusPanel status={frame.truckStatus} live={isLive} />
            </FadeIn>

            {/* 6. Environmental conditions */}
            <FadeIn>
              <EnvironmentalPanel
                conditions={environmental.data}
                isLoading={environmental.isLoading}
              />
            </FadeIn>

            {/* 7. Sensor connectivity */}
            <FadeIn className="xl:col-span-2">
              <SensorConnectivityTable rows={frame.connectivity} />
            </FadeIn>

            {/* 9. Operational map */}
            <FadeIn>
              <OperationalMap map={frame.map} live={isLive} />
            </FadeIn>

            {/* 8. Event timeline */}
            <FadeIn className="xl:col-span-2">
              <EventTimeline events={frame.events} live={isLive} />
            </FadeIn>

            {/* 10. Emergency status */}
            <FadeIn>
              <EmergencyPanel summary={frame.emergency} live={isLive} />
            </FadeIn>
          </div>
        ) : null}
      </div>
    </div>
  );
}
