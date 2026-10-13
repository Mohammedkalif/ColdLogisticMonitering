import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/layout';
import { ROUTE_PATHS } from './routes.config';

/**
 * Route table.
 *
 * Pages are code-split: each screen ships as its own chunk and is loaded on
 * demand behind the `<Suspense>` boundary inside `AppLayout`.
 */
const DashboardPage = lazy(() =>
  import('@/pages/Dashboard').then((module) => ({ default: module.DashboardPage })),
);
const VehiclesPage = lazy(() =>
  import('@/pages/Vehicles').then((module) => ({ default: module.VehiclesPage })),
);
const LiveMonitoringPage = lazy(() =>
  import('@/pages/LiveMonitoring').then((module) => ({ default: module.LiveMonitoringPage })),
);
const PredictionPage = lazy(() =>
  import('@/pages/Prediction').then((module) => ({ default: module.PredictionPage })),
);
const AlertsPage = lazy(() =>
  import('@/pages/Alerts').then((module) => ({ default: module.AlertsPage })),
);
const HistoryPage = lazy(() =>
  import('@/pages/History').then((module) => ({ default: module.HistoryPage })),
);
const SettingsPage = lazy(() =>
  import('@/pages/Settings').then((module) => ({ default: module.SettingsPage })),
);
const NotFoundPage = lazy(() =>
  import('@/pages/NotFound').then((module) => ({ default: module.NotFoundPage })),
);

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path={ROUTE_PATHS.dashboard} element={<DashboardPage />} />
        <Route path={ROUTE_PATHS.vehicles} element={<VehiclesPage />} />
        <Route path={`${ROUTE_PATHS.vehicles}/:vehicleId`} element={<VehiclesPage />} />
        <Route path={ROUTE_PATHS.liveMonitoring} element={<LiveMonitoringPage />} />
        <Route path={`${ROUTE_PATHS.liveMonitoring}/:shipmentId`} element={<LiveMonitoringPage />} />
        <Route path={ROUTE_PATHS.prediction} element={<PredictionPage />} />
        <Route path={ROUTE_PATHS.alerts} element={<AlertsPage />} />
        <Route path={ROUTE_PATHS.history} element={<HistoryPage />} />
        <Route path={ROUTE_PATHS.settings} element={<SettingsPage />} />

        <Route path="/dashboard" element={<Navigate to={ROUTE_PATHS.dashboard} replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
