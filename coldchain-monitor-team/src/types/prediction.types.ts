import type {
  ISODateString,
  RiskLevel,
  StatusTone,
  TimeSeriesPoint,
  TrendIndicator,
} from './common.types';
import type { CommodityType, PackagingType, VehicleType } from './shipment.types';

/** Feature vector submitted to the ML inference endpoint. */
export interface PredictionRequest {
  shipmentId?: string;
  commodity: CommodityType;
  transitDurationHours: number;
  avgTemperatureC: number;
  avgHumidityPct: number;
  ethylenePpm: number;
  vibrationIndex: number;
  packaging: PackagingType;
  vehicleType: VehicleType;
  preCoolingApplied: boolean;
  ambientTemperatureC: number;
}

/** Per-feature attribution (SHAP-style) returned with a prediction. */
export interface FeatureContribution {
  feature: keyof PredictionRequest | string;
  label: string;
  /** Signed contribution to the spoilage probability, -1..1. */
  impact: number;
}

export interface SpoilagePrediction {
  id: string;
  requestedAt: ISODateString;
  commodity: CommodityType;
  /** Probability of spoilage on arrival, 0-1. */
  spoilageProbability: number;
  riskLevel: RiskLevel;
  /** Model confidence in the prediction, 0-1. */
  confidence: number;
  estimatedShelfLifeHours: number;
  recommendedActions: string[];
  contributions: FeatureContribution[];
  modelVersion: string;
}

export type ModelStatus = 'active' | 'shadow' | 'training';

/** Metadata surfaced so operators know which model produced a score. */
export interface ModelInfo {
  name: string;
  version: string;
  algorithm: string;
  status: ModelStatus;
  trainedAt: ISODateString;
  accuracy: number;
  f1Score: number;
  rocAuc: number;
  trainingSamples: number;
  /** Mean inference latency in milliseconds. */
  inferenceLatencyMs: number;
}

/* ----------------------------------------------------------------------- */
/* AI Decision Support Center report                                        */
/* ----------------------------------------------------------------------- */

export type PredictionHorizonKey = '6h' | '12h' | '24h' | '48h' | '72h';
export type PredictionTypeKey = 'arrival_spoilage' | 'excursion_risk' | 'shelf_life';
export type PredictionIntervalKey = '15min' | '30min' | 'hourly';

/** Extended request that drives the full decision-support report. */
export interface PredictionReportRequest extends PredictionRequest {
  horizonHours: number;
  predictionType: PredictionTypeKey;
  predictionInterval: PredictionIntervalKey;
  modelVersion: string;
}

/** One KPI in the AI Prediction Summary. */
export interface PredictionKpi {
  key: string;
  label: string;
  /** Pre-formatted display value. */
  value: string;
  unit?: string;
  tone: StatusTone;
  statusLabel: string;
  /** Numeric companion for the count-up animation. */
  numericValue?: number;
  precision?: number;
  trend?: TrendIndicator;
  updatedAt: ISODateString;
}

export interface PredictionSummary {
  kpis: PredictionKpi[];
  overallStatus: RiskLevel;
  generatedAt: ISODateString;
}

export interface RiskCategoryScale {
  label: string;
  tone: StatusTone;
  fromPct: number;
  toPct: number;
}

export interface RiskGaugeData {
  riskPercentage: number;
  healthCategory: RiskLevel;
  estimatedTimeBeforeSpoilageHours: number;
  scale: RiskCategoryScale[];
}

export interface TemperatureForecastData {
  historical: TimeSeriesPoint[];
  predicted: TimeSeriesPoint[];
  confidenceUpper: TimeSeriesPoint[];
  confidenceLower: TimeSeriesPoint[];
  safeThreshold: number;
  forecastWindowHours: number;
}

export interface ConfidenceMetric {
  key: string;
  label: string;
  /** 0-100. */
  value: number;
  tone: StatusTone;
  description: string;
}

export interface ConfidenceMetricsData {
  confidencePct: number;
  metrics: ConfidenceMetric[];
}

export interface FeatureContributionItem {
  feature: string;
  label: string;
  /** Placeholder importance, 0-100. */
  importance: number;
  tone: StatusTone;
}

export interface RecommendationItem {
  id: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  reason: string;
  expectedImpact: string;
}

export interface PredictionHistoryItem {
  id: string;
  predictionTime: ISODateString;
  shipmentCode: string;
  risk: RiskLevel;
  confidence: number;
  outcome: 'accepted' | 'partial_loss' | 'rejected' | 'pending';
}

export interface BackendIntegrationInfo {
  apiEndpoint: string;
  requestPayloadExample: string;
  responsePayloadExample: string;
  mlOutputFields: string[];
  frontendMapping: string[];
}

export interface ModelDetails {
  predictionWindow: string;
  inputFeatures: string[];
  outputVariables: string[];
  trainingDataset: string;
}

/** Aggregate report rendered by the Prediction page. */
export interface PredictionReport {
  id: string;
  generatedAt: ISODateString;
  request: {
    shipmentCode?: string;
    commodity: CommodityType;
    horizonHours: number;
    predictionType: PredictionTypeKey;
    predictionInterval: PredictionIntervalKey;
    modelVersion: string;
  };
  summary: PredictionSummary;
  risk: RiskGaugeData;
  temperatureForecast: TemperatureForecastData;
  confidence: ConfidenceMetricsData;
  featureContributions: FeatureContributionItem[];
  recommendations: RecommendationItem[];
  history: PredictionHistoryItem[];
  model: ModelInfo;
  modelDetails: ModelDetails;
  backend: BackendIntegrationInfo;
}
