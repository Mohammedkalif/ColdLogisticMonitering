import {
  Bell,
  BrainCircuit,
  History,
  LayoutDashboard,
  Radio,
  Settings,
  Truck,
  type LucideIcon,
} from 'lucide-react';

/**
 * Single source of truth for navigation.
 *
 * Sidebar items, breadcrumbs, document titles and the router all read from
 * this list — add a screen here and it appears everywhere consistently.
 */
export const ROUTE_PATHS = {
  dashboard: '/',
  vehicles: '/vehicles',
  liveMonitoring: '/live-monitoring',
  prediction: '/prediction',
  alerts: '/alerts',
  history: '/history',
  settings: '/settings',
} as const;

export type RoutePath = (typeof ROUTE_PATHS)[keyof typeof ROUTE_PATHS];

export interface AppRoute {
  id: string;
  path: string;
  label: string;
  /** Sub-title rendered in the page header. */
  description: string;
  icon: LucideIcon;
  /** Hide utility routes (404, deep links) from the sidebar. */
  showInSidebar: boolean;
  /** Renders the live open-alert count next to the item. */
  showAlertBadge?: boolean;
  /** `NavLink` exact matching — only the index route needs it. */
  exact?: boolean;
}

export const APP_ROUTES: AppRoute[] = [
  {
    id: 'dashboard',
    path: ROUTE_PATHS.dashboard,
    label: 'Dashboard',
    description: 'Fleet-wide cold chain health at a glance',
    icon: LayoutDashboard,
    showInSidebar: true,
    exact: true,
  },
  {
    id: 'vehicles',
    path: ROUTE_PATHS.vehicles,
    label: 'Vehicles',
    description: 'Condition of each vehicle in the fleet',
    icon: Truck,
    showInSidebar: true,
  },
  {
    id: 'liveMonitoring',
    path: ROUTE_PATHS.liveMonitoring,
    label: 'Live Monitoring',
    description: 'Real-time telemetry from in-transit consignments',
    icon: Radio,
    showInSidebar: false,
  },
  {
    id: 'prediction',
    path: ROUTE_PATHS.prediction,
    label: 'Prediction',
    description: 'Run the spoilage model against a consignment profile',
    icon: BrainCircuit,
    showInSidebar: false,
  },
  {
    id: 'alerts',
    path: ROUTE_PATHS.alerts,
    label: 'Alerts',
    description: 'Vehicles requiring immediate attention',
    icon: Bell,
    showInSidebar: true,
    showAlertBadge: true,
  },
  {
    id: 'history',
    path: ROUTE_PATHS.history,
    label: 'History',
    description: 'Completed journeys and prediction accuracy',
    icon: History,
    showInSidebar: false,
  },
  {
    id: 'settings',
    path: ROUTE_PATHS.settings,
    label: 'Settings',
    description: 'Monitoring configuration and model details',
    icon: Settings,
    showInSidebar: true,
  },
];

export const SIDEBAR_ROUTES = APP_ROUTES.filter((route) => route.showInSidebar);

/** Resolve the route entry that owns a pathname (longest prefix wins). */
export function findRouteByPath(pathname: string): AppRoute | undefined {
  if (pathname === '/') return APP_ROUTES.find((route) => route.path === '/');

  return APP_ROUTES.filter((route) => route.path !== '/')
    .filter((route) => pathname === route.path || pathname.startsWith(`${route.path}/`))
    .sort((a, b) => b.path.length - a.path.length)[0];
}
