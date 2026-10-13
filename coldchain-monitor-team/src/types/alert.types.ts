import type { ISODateString, PaginationParams } from './common.types';

export type AlertSeverity = 'critical' | 'warning' | 'info';

export type AlertStatus = 'open' | 'acknowledged' | 'resolved';

export type AlertCategory =
  | 'temperature_excursion'
  | 'humidity_deviation'
  | 'spoilage_risk'
  | 'device_offline'
  | 'door_open'
  | 'route_delay';

export interface Alert {
  id: string;
  code: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  category: AlertCategory;
  shipmentId: string;
  shipmentCode: string;
  deviceId?: string;
  triggeredAt: ISODateString;
  acknowledgedAt?: ISODateString;
  acknowledgedBy?: string;
  /** Moment the alert was resolved (supplied by the backend when known). */
  resolvedAt?: ISODateString;
  /** Observed value that breached the rule (unit in `unit`). */
  observedValue?: number;
  thresholdValue?: number;
  unit?: string;
  /**
   * Operational next step suggested for this alert. Sourced from the backend
   * / ML layer — the frontend never derives remediation guidance itself.
   */
  recommendedAction?: string;
}

export interface AlertQuery extends Partial<PaginationParams> {
  search?: string;
  severity?: AlertSeverity | 'all';
  status?: AlertStatus | 'all';
  category?: AlertCategory | 'all';
}

export interface AlertSummary {
  open: number;
  critical: number;
  warning: number;
  acknowledged: number;
  resolvedToday: number;
  meanTimeToAcknowledgeMinutes: number;
}
