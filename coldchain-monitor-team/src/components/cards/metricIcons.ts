import {
  Activity,
  Droplets,
  Gauge,
  Thermometer,
  Truck,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react';
import type { DashboardMetricKey } from '@/types';

/**
 * Iconography is a presentation concern, so it is mapped here rather than
 * returned by the API.
 */
export const metricIcons: Record<DashboardMetricKey, LucideIcon> = {
  temperature: Thermometer,
  humidity: Droplets,
  spoilageRisk: TriangleAlert,
  truckStatus: Truck,
  predictionConfidence: Gauge,
  systemHealth: Activity,
};
