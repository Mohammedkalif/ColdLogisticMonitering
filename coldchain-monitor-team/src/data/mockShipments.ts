import type { Shipment, ShipmentHistoryRecord } from '@/types';
import { hoursAgo, hoursFromNow } from '@/utils/date';
import { riskLevelFromScore } from '@/utils/domain';
import { createSeededRandom, pick } from './mockFactory';

/** Active fleet used by Dashboard and Live Monitoring. */
export const mockShipments: Shipment[] = [
  {
    id: 'shp-24817',
    code: 'SHP-24817',
    commodity: 'banana',
    quantityKg: 9800,
    packaging: 'corrugated_box',
    route: { origin: 'Thrissur, KL', destination: 'Chennai, TN', distanceKm: 682 },
    vehicle: {
      id: 'veh-101',
      registrationNumber: 'KL 07 CJ 4412',
      type: 'reefer_truck',
      driverName: 'Rajesh Menon',
      driverPhone: '+91 98470 11245',
    },
    status: 'in_transit',
    progressPct: 62,
    currentLocation: 'Krishnagiri, TN',
    healthScore: 74,
    departedAt: hoursAgo(11),
    etaAt: hoursFromNow(5),
    riskLevel: 'moderate',
    riskScore: 0.34,
    temperatureC: 13.4,
    humidityPct: 90,
    lastUpdatedAt: hoursAgo(0.05),
  },
  {
    id: 'shp-24822',
    code: 'SHP-24822',
    commodity: 'grapes',
    quantityKg: 6400,
    packaging: 'vented_carton',
    route: { origin: 'Nashik, MH', destination: 'Bengaluru, KA', distanceKm: 843 },
    vehicle: {
      id: 'veh-118',
      registrationNumber: 'MH 15 EG 7781',
      type: 'refrigerated_container',
      driverName: 'Sandeep Patil',
      driverPhone: '+91 90280 55310',
    },
    status: 'in_transit',
    progressPct: 41,
    currentLocation: 'Belagavi, KA',
    healthScore: 93,
    departedAt: hoursAgo(8),
    etaAt: hoursFromNow(12),
    riskLevel: 'low',
    riskScore: 0.12,
    temperatureC: 1.8,
    humidityPct: 92,
    lastUpdatedAt: hoursAgo(0.03),
  },
  {
    id: 'shp-24829',
    code: 'SHP-24829',
    commodity: 'tomato',
    quantityKg: 4200,
    packaging: 'plastic_crate',
    route: { origin: 'Kolar, KA', destination: 'Hyderabad, TS', distanceKm: 596 },
    vehicle: {
      id: 'veh-134',
      registrationNumber: 'KA 07 AB 2290',
      type: 'insulated_van',
      driverName: 'Mahesh Gowda',
      driverPhone: '+91 99001 78432',
    },
    status: 'delayed',
    progressPct: 55,
    currentLocation: 'Kurnool, AP',
    healthScore: 38,
    departedAt: hoursAgo(14),
    etaAt: hoursFromNow(3),
    riskLevel: 'critical',
    riskScore: 0.81,
    temperatureC: 16.2,
    humidityPct: 74,
    lastUpdatedAt: hoursAgo(0.12),
  },
  {
    id: 'shp-24834',
    code: 'SHP-24834',
    commodity: 'leafy_greens',
    quantityKg: 1850,
    packaging: 'plastic_crate',
    route: { origin: 'Ooty, TN', destination: 'Coimbatore, TN', distanceKm: 88 },
    vehicle: {
      id: 'veh-142',
      registrationNumber: 'TN 43 Z 6650',
      type: 'insulated_van',
      driverName: 'Karthik Subramanian',
      driverPhone: '+91 94430 22190',
    },
    status: 'unloading',
    progressPct: 97,
    currentLocation: 'Mettupalayam, TN',
    healthScore: 96,
    departedAt: hoursAgo(4),
    etaAt: hoursFromNow(0.4),
    riskLevel: 'low',
    riskScore: 0.09,
    temperatureC: 2.6,
    humidityPct: 95,
    lastUpdatedAt: hoursAgo(0.02),
  },
  {
    id: 'shp-24841',
    code: 'SHP-24841',
    commodity: 'mango',
    quantityKg: 7300,
    packaging: 'corrugated_box',
    route: { origin: 'Salem, TN', destination: 'Mumbai, MH', distanceKm: 1274 },
    vehicle: {
      id: 'veh-156',
      registrationNumber: 'TN 30 BQ 1183',
      type: 'reefer_truck',
      driverName: 'Anwar Basha',
      driverPhone: '+91 98942 66710',
    },
    status: 'in_transit',
    progressPct: 28,
    currentLocation: 'Pune, MH',
    healthScore: 57,
    departedAt: hoursAgo(6),
    etaAt: hoursFromNow(19),
    riskLevel: 'high',
    riskScore: 0.58,
    temperatureC: 15.1,
    humidityPct: 83,
    lastUpdatedAt: hoursAgo(0.08),
  },
  {
    id: 'shp-24848',
    code: 'SHP-24848',
    commodity: 'apple',
    quantityKg: 11200,
    packaging: 'vented_carton',
    route: { origin: 'Shimla, HP', destination: 'Delhi, DL', distanceKm: 342 },
    vehicle: {
      id: 'veh-163',
      registrationNumber: 'HP 03 K 9021',
      type: 'refrigerated_container',
      driverName: 'Vikram Thakur',
      driverPhone: '+91 94180 33875',
    },
    status: 'scheduled',
    progressPct: 0,
    currentLocation: 'Shimla depot, HP',
    healthScore: 98,
    departedAt: hoursFromNow(2),
    etaAt: hoursFromNow(11),
    riskLevel: 'low',
    riskScore: 0.07,
    temperatureC: 0.9,
    humidityPct: 91,
    lastUpdatedAt: hoursAgo(0.5),
  },
];

const historyRoutes = [
  { origin: 'Thrissur, KL', destination: 'Chennai, TN', distanceKm: 682 },
  { origin: 'Nashik, MH', destination: 'Bengaluru, KA', distanceKm: 843 },
  { origin: 'Kolar, KA', destination: 'Hyderabad, TS', distanceKm: 596 },
  { origin: 'Ooty, TN', destination: 'Coimbatore, TN', distanceKm: 88 },
  { origin: 'Salem, TN', destination: 'Mumbai, MH', distanceKm: 1274 },
] as const;

const historyCommodities = [
  'banana',
  'grapes',
  'tomato',
  'leafy_greens',
  'mango',
  'apple',
] as const;

/**
 * Completed journeys with prediction vs. ground-truth spoilage.
 * This is the feedback dataset the ML team will consume for retraining.
 */
export const mockShipmentHistory: ShipmentHistoryRecord[] = Array.from(
  { length: 42 },
  (_, index) => {
    const random = createSeededRandom(index + 17);
    const predicted = Math.round(random() * 78) / 100;
    const actual = Math.max(0, Math.min(1, predicted + (random() - 0.5) * 0.18));
    const transitHours = Math.round((6 + random() * 30) * 10) / 10;

    return {
      id: `hst-${24_500 + index}`,
      code: `SHP-${24_500 + index}`,
      commodity: pick(historyCommodities, index),
      route: pick(historyRoutes, index),
      completedAt: hoursAgo(index * 8 + 6),
      transitHours,
      avgTemperatureC: Math.round((2 + random() * 12) * 10) / 10,
      avgHumidityPct: Math.round(78 + random() * 18),
      excursions: Math.round(random() * 6),
      predictedSpoilage: predicted,
      actualSpoilage: Math.round(actual * 100) / 100,
      outcome: actual > 0.6 ? 'rejected' : actual > 0.3 ? 'partial_loss' : 'accepted',
      modelVersion: index % 3 === 0 ? 'v2.3.0' : 'v2.4.1',
    } satisfies ShipmentHistoryRecord;
  },
);

/** Convenience lookup used by mock services. */
export const findMockShipment = (shipmentId: string): Shipment | undefined =>
  mockShipments.find((shipment) => shipment.id === shipmentId);

export const mockFleetRiskScore = (): number => {
  const total = mockShipments.reduce((sum, shipment) => sum + shipment.riskScore, 0);
  return total / mockShipments.length;
};

export const mockFleetRiskLevel = () => riskLevelFromScore(mockFleetRiskScore());
