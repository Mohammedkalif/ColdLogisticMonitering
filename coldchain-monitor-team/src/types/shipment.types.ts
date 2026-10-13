import type { ISODateString, RiskLevel } from './common.types';

export type ShipmentStatus = 'scheduled' | 'in_transit' | 'delayed' | 'unloading' | 'delivered';

/** Horticulture commodities supported by the prediction model. */
export type CommodityType =
  'banana' | 'mango' | 'tomato' | 'grapes' | 'leafy_greens' | 'apple' | 'onion' | 'green_chilli';

export type VehicleType = 'reefer_truck' | 'insulated_van' | 'refrigerated_container';

export type PackagingType = 'corrugated_box' | 'plastic_crate' | 'jute_bag' | 'vented_carton';

export interface Vehicle {
  id: string;
  registrationNumber: string;
  type: VehicleType;
  driverName: string;
  driverPhone: string;
}

export interface RouteLeg {
  origin: string;
  destination: string;
  distanceKm: number;
}

export interface Shipment {
  id: string;
  /** Human-readable identifier shown in tables, e.g. `SHP-24817`. */
  code: string;
  commodity: CommodityType;
  quantityKg: number;
  packaging: PackagingType;
  route: RouteLeg;
  vehicle: Vehicle;
  status: ShipmentStatus;
  /** Journey completion, 0-100. */
  progressPct: number;
  /** Last known waypoint, e.g. `Krishnagiri, TN`. */
  currentLocation: string;
  /** Composite cargo condition score, 0-100 (higher is healthier). */
  healthScore: number;
  departedAt: ISODateString;
  etaAt: ISODateString;
  riskLevel: RiskLevel;
  /** Model spoilage probability, 0-1. */
  riskScore: number;
  temperatureC: number;
  humidityPct: number;
  lastUpdatedAt: ISODateString;
}

export type ShipmentOutcome = 'accepted' | 'partial_loss' | 'rejected';

/** Completed journey used by the History page and model feedback loop. */
export interface ShipmentHistoryRecord {
  id: string;
  code: string;
  commodity: CommodityType;
  route: RouteLeg;
  completedAt: ISODateString;
  transitHours: number;
  avgTemperatureC: number;
  avgHumidityPct: number;
  excursions: number;
  /** Prediction issued at dispatch, 0-1. */
  predictedSpoilage: number;
  /** Ground truth recorded at delivery, 0-1. */
  actualSpoilage: number;
  outcome: ShipmentOutcome;
  modelVersion: string;
}
