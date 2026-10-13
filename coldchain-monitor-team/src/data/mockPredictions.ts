import type {
  ModelInfo,
  PredictionHistoryItem,
  PredictionReport,
  PredictionReportRequest,
  PredictionRequest,
  RecommendationItem,
  SpoilagePrediction,
  StatusTone,
} from '@/types';
import { buildSeries, createSeededRandom } from './mockFactory';
import { mockShipments, findMockShipment } from './mockShipments';
import { hoursAgo } from '@/utils/date';
import { riskLevelFromScore, riskLevelMeta } from '@/utils/domain';

export const mockModelInfo: ModelInfo = {
  name: 'Horticulture Spoilage Classifier',
  version: 'v2.4.1',
  algorithm: 'Gradient Boosted Trees (XGBoost)',
  status: 'active',
  trainedAt: hoursAgo(126),
  accuracy: 0.94,
  f1Score: 0.91,
  rocAuc: 0.96,
  trainingSamples: 48_210,
  inferenceLatencyMs: 240,
};

/**
 * Deterministic stand-in for the ML inference endpoint.
 *
 * The heuristic below is intentionally simple — it exists only so the UI can
 * demonstrate realistic states. Replace `predictionApi.predictSpoilage` with
 * the real model call; this file can then be deleted.
 */
export function buildMockPrediction(request: PredictionRequest): SpoilagePrediction {
  const temperaturePenalty = Math.max(0, request.avgTemperatureC - 8) * 0.035;
  const durationPenalty = Math.max(0, request.transitDurationHours - 12) * 0.012;
  const humidityPenalty = Math.abs(90 - request.avgHumidityPct) * 0.006;
  const ethylenePenalty = Math.max(0, request.ethylenePpm - 1) * 0.05;
  const vibrationPenalty = request.vibrationIndex * 0.08;
  const preCoolingBonus = request.preCoolingApplied ? -0.08 : 0.04;

  const probability = Math.min(
    0.98,
    Math.max(
      0.02,
      0.08 +
        temperaturePenalty +
        durationPenalty +
        humidityPenalty +
        ethylenePenalty +
        vibrationPenalty +
        preCoolingBonus,
    ),
  );

  const rounded = Math.round(probability * 100) / 100;
  const riskLevel = riskLevelFromScore(rounded);

  const recommendedActions =
    riskLevel === 'low'
      ? ['Maintain current set point', 'Continue standard telemetry cadence']
      : riskLevel === 'moderate'
        ? [
            'Lower the reefer set point by 1 °C',
            'Increase telemetry sampling to 2-minute intervals',
            'Notify the receiving warehouse of the projected quality band',
          ]
        : [
            'Re-route to the nearest cold storage hub',
            'Lower the reefer set point immediately and verify airflow',
            'Escalate to the quality team for a pre-arrival inspection',
            'Prepare partial-rejection paperwork for the consignee',
          ];

  return {
    id: `prd-${Date.now()}`,
    requestedAt: new Date().toISOString(),
    commodity: request.commodity,
    spoilageProbability: rounded,
    riskLevel,
    confidence: Math.round((0.86 + (1 - Math.abs(0.5 - rounded)) * 0.1) * 100) / 100,
    estimatedShelfLifeHours: Math.max(4, Math.round((1 - rounded) * 96)),
    recommendedActions,
    contributions: [
      {
        feature: 'avgTemperatureC',
        label: 'Average temperature',
        impact: Math.round(temperaturePenalty * 100) / 100,
      },
      {
        feature: 'transitDurationHours',
        label: 'Transit duration',
        impact: Math.round(durationPenalty * 100) / 100,
      },
      {
        feature: 'ethylenePpm',
        label: 'Ethylene concentration',
        impact: Math.round(ethylenePenalty * 100) / 100,
      },
      {
        feature: 'avgHumidityPct',
        label: 'Humidity deviation',
        impact: Math.round(humidityPenalty * 100) / 100,
      },
      {
        feature: 'vibrationIndex',
        label: 'Road vibration',
        impact: Math.round(vibrationPenalty * 100) / 100,
      },
      {
        feature: 'preCoolingApplied',
        label: 'Pre-cooling applied',
        impact: Math.round(preCoolingBonus * 100) / 100,
      },
    ].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact)),
    modelVersion: mockModelInfo.version,
  };
}

/* ======================================================================= */
/* Full AI Decision Support report (mock)                                   */
/* ======================================================================= */

const RISK_SCALE = [
  { label: 'Safe', tone: 'success', fromPct: 0, toPct: 20 },
  { label: 'Low', tone: 'info', fromPct: 20, toPct: 40 },
  { label: 'Medium', tone: 'warning', fromPct: 40, toPct: 60 },
  { label: 'High', tone: 'warning', fromPct: 60, toPct: 80 },
  { label: 'Critical', tone: 'danger', fromPct: 80, toPct: 100 },
] as const;

const toneForValue = (value: number) =>
  value >= 80 ? 'success' : value >= 60 ? 'warning' : 'danger';

function trendFor(delta: number, unit: string, label: string) {
  const direction = delta > 0.05 ? 'up' : delta < -0.05 ? 'down' : 'flat';
  return { direction, value: `${delta >= 0 ? '+' : ''}${delta.toFixed(1)} ${unit}`, label };
}

function forwardSeries(
  points: number,
  stepMinutes: number,
  baseline: number,
  driftPerStep: number,
  decimals: number,
  startAt: number,
) {
  const random = createSeededRandom(Math.round(startAt) % 9973);
  const factor = 10 ** decimals;
  const out = [];
  for (let i = 0; i < points; i++) {
    const value = baseline + driftPerStep * (i + 1) + (random() - 0.5) * 0.6;
    out.push({
      timestamp: new Date(startAt + i * stepMinutes * 60_000).toISOString(),
      value: Math.round(value * factor) / factor,
    });
  }
  return out;
}

/** Build the complete Decision Support report from a single request (mock). */
export function buildPredictionReport(request: PredictionReportRequest): PredictionReport {
  const base = buildMockPrediction(request);
  const probability = base.spoilageProbability;
  const risk = base.riskLevel;
  const riskLabel = riskLevelMeta[risk].label;
  const horizonHours = Math.max(6, Math.min(72, request.horizonHours));

  const predictedTemperatureC =
    Math.round(
      (request.avgTemperatureC + (request.avgTemperatureC - 8) * 0.03 * (horizonHours / 24)) * 10,
    ) / 10;
  const predictedHumidityPct = Math.round(
    Math.min(99, Math.max(0, request.avgHumidityPct + (90 - request.avgHumidityPct) * 0.02)),
  );

  const excursionFactor =
    risk === 'critical' ? 0.2 : risk === 'high' ? 0.4 : risk === 'moderate' ? 0.6 : 0.9;
  const expectedExcursionHours = Math.max(
    1,
    Math.round(base.estimatedShelfLifeHours * excursionFactor),
  );

  const now = Date.now();
  const seed = Math.round(
    request.avgTemperatureC * 100 + request.avgHumidityPct * 10 + request.transitDurationHours * 7,
  );
  const historical = buildSeries({
    points: 24,
    stepMinutes: 60,
    baseline: request.avgTemperatureC,
    amplitude: 0.8,
    drift: -0.1,
    decimals: 1,
    seed,
    endsAt: now,
  });
  const predicted = forwardSeries(
    Math.min(horizonHours, 24),
    60,
    predictedTemperatureC,
    (probability - 0.3) * 0.4,
    1,
    now,
  );
  const band = 0.8 + probability * 1.6;
  const confidenceUpper = predicted.map((point) => ({
    timestamp: point.timestamp,
    value: Math.round((point.value + band) * 10) / 10,
  }));
  const confidenceLower = predicted.map((point) => ({
    timestamp: point.timestamp,
    value: Math.round(Math.max(-5, point.value - band) * 10) / 10,
  }));
  const safeThreshold = 15;

  const tempDelta = Math.round((predictedTemperatureC - request.avgTemperatureC) * 10) / 10;
  const humDelta = predictedHumidityPct - request.avgHumidityPct;
  const probDelta = Math.round((probability * 100 - 18) * 10) / 10;

  const kpis = [
    {
      key: 'temp',
      label: 'Predicted Temperature',
      value: `${predictedTemperatureC.toFixed(1)}`,
      unit: '°C',
      tone:
        predictedTemperatureC <= 15
          ? 'success'
          : predictedTemperatureC <= 18
            ? 'warning'
            : 'danger',
      statusLabel: predictedTemperatureC <= 15 ? 'In band' : 'Elevated',
      numericValue: predictedTemperatureC,
      precision: 1,
      trend: trendFor(tempDelta, '°C', 'vs. current'),
      updatedAt: base.requestedAt,
    },
    {
      key: 'hum',
      label: 'Predicted Humidity',
      value: `${predictedHumidityPct}`,
      unit: '%',
      tone: predictedHumidityPct <= 95 ? 'success' : 'warning',
      statusLabel: predictedHumidityPct <= 95 ? 'Optimal' : 'High',
      numericValue: predictedHumidityPct,
      precision: 0,
      trend: trendFor(humDelta, '%', 'vs. current'),
      updatedAt: base.requestedAt,
    },
    {
      key: 'spoil',
      label: 'Spoilage Probability',
      value: `${(probability * 100).toFixed(0)}`,
      unit: '%',
      tone: risk === 'low' ? 'success' : risk === 'moderate' ? 'warning' : 'danger',
      statusLabel: `${riskLabel} risk`,
      numericValue: probability * 100,
      precision: 0,
      trend: trendFor(probDelta, '%', 'vs. last run'),
      updatedAt: base.requestedAt,
    },
    {
      key: 'conf',
      label: 'Prediction Confidence',
      value: `${(base.confidence * 100).toFixed(0)}`,
      unit: '%',
      tone: base.confidence >= 0.8 ? 'success' : base.confidence >= 0.6 ? 'warning' : 'danger',
      statusLabel: base.confidence >= 0.8 ? 'High' : base.confidence >= 0.6 ? 'Moderate' : 'Low',
      numericValue: base.confidence * 100,
      precision: 0,
      trend: trendFor(2.1, '%', 'vs. last run'),
      updatedAt: base.requestedAt,
    },
    {
      key: 'excursion',
      label: 'Expected Excursion',
      value: `${expectedExcursionHours}`,
      unit: 'h',
      tone:
        expectedExcursionHours <= 4
          ? 'danger'
          : expectedExcursionHours <= 12
            ? 'warning'
            : 'success',
      statusLabel: expectedExcursionHours <= 4 ? 'Imminent' : 'Monitored',
      numericValue: expectedExcursionHours,
      precision: 0,
      updatedAt: base.requestedAt,
    },
    {
      key: 'status',
      label: 'Overall Prediction Status',
      value: riskLabel,
      tone: risk === 'low' ? 'success' : risk === 'moderate' ? 'warning' : 'danger',
      statusLabel: `${riskLabel} risk`,
      updatedAt: base.requestedAt,
    },
  ];

  const confidencePct = Math.round(base.confidence * 100);
  const confidenceMetrics = [
    {
      key: 'quality',
      label: 'Prediction Quality',
      value: 86 + Math.round((1 - probability) * 10),
      tone: toneForValue(86 + Math.round((1 - probability) * 10)),
      description: 'Calibration of the predicted probability against held-out validation labels.',
    },
    {
      key: 'stability',
      label: 'Model Stability',
      value: 92,
      tone: 'success',
      description: 'Variance of predictions across the last three model retrains.',
    },
    {
      key: 'completeness',
      label: 'Data Completeness',
      value: 98,
      tone: 'success',
      description: 'Share of required input features present in the request payload.',
    },
    {
      key: 'sensor',
      label: 'Sensor Reliability',
      value: 88 + (risk === 'low' ? 6 : -4),
      tone: toneForValue(88 + (risk === 'low' ? 6 : -4)),
      description: 'Aggregated health of telemetry feeding this consignment.',
    },
  ];

  const featureWeights: { feature: string; label: string; w: number }[] = [
    { feature: 'temperature', label: 'Temperature', w: 26 + probability * 10 },
    { feature: 'cooling', label: 'Cooling Unit', w: 17 },
    { feature: 'humidity', label: 'Humidity', w: 14 },
    { feature: 'travel', label: 'Travel Time', w: 11 },
    { feature: 'weather', label: 'Outside Weather', w: 9 },
    { feature: 'door', label: 'Door Activity', w: Math.max(3, 9 - probability * 6) },
    { feature: 'battery', label: 'Battery', w: 4 },
    { feature: 'signal', label: 'Signal Quality', w: 4 },
  ];
  const weightTotal = featureWeights.reduce((sum, item) => sum + item.w, 0);
  const featureContributions = featureWeights.map((item) => {
    const importance = Math.round((item.w / weightTotal) * 100);
    const tone: StatusTone = importance > 20 ? 'danger' : importance > 10 ? 'warning' : 'info';
    return {
      feature: item.feature,
      label: item.label,
      importance,
      tone,
    };
  });

  const recLow: Omit<RecommendationItem, 'id'>[] = [
    {
      priority: 'medium',
      title: 'Maintain current cooling settings',
      reason: 'Temperature is holding within the safe band.',
      expectedImpact: 'Preserves current cargo quality.',
    },
    {
      priority: 'low',
      title: 'Monitor humidity closely',
      reason: 'Humidity is near its upper comfort limit.',
      expectedImpact: 'Avoids surface condensation and mould.',
    },
  ];
  const recMod: Omit<RecommendationItem, 'id'>[] = [
    {
      priority: 'high',
      title: 'Lower reefer set point by 1 °C',
      reason: 'Temperature is trending toward the ceiling.',
      expectedImpact: 'Restores a 1–2 °C safety margin.',
    },
    {
      priority: 'medium',
      title: 'Reduce door opening frequency',
      reason: 'Each opening injects warm, humid air.',
      expectedImpact: 'Stabilises cargo temperature.',
    },
    {
      priority: 'low',
      title: 'Monitor humidity closely',
      reason: 'Humidity is near the upper limit.',
      expectedImpact: 'Lowers mould risk.',
    },
  ];
  const recHigh: Omit<RecommendationItem, 'id'>[] = [
    {
      priority: 'high',
      title: 'Inspect refrigeration unit',
      reason: 'Cooling strain detected on the current run.',
      expectedImpact: 'Prevents mid-transit failure.',
    },
    {
      priority: 'high',
      title: 'Reduce door opening frequency',
      reason: 'Door activity is raising cargo temperature.',
      expectedImpact: 'Stabilises temperature quickly.',
    },
    {
      priority: 'medium',
      title: 'Schedule maintenance',
      reason: 'Cooling unit is showing wear.',
      expectedImpact: 'Avoids an unplanned breakdown.',
    },
    {
      priority: 'low',
      title: 'Monitor humidity closely',
      reason: 'Humidity is elevating the spoilage rate.',
      expectedImpact: 'Reduces mould development.',
    },
  ];
  const recommendations = risk === 'low' ? recLow : risk === 'moderate' ? recMod : recHigh;

  const history: PredictionHistoryItem[] = mockShipments.slice(0, 6).map((shipment, index) => ({
    id: `hist-${index}`,
    predictionTime: hoursAgo((index + 1) * 5),
    shipmentCode: shipment.code,
    risk: shipment.riskLevel,
    confidence: Math.round((0.7 + (index % 3) * 0.08) * 100) / 100,
    outcome:
      shipment.riskLevel === 'low'
        ? 'accepted'
        : shipment.riskLevel === 'critical'
          ? 'rejected'
          : shipment.riskLevel === 'high'
            ? 'partial_loss'
            : 'pending',
  }));

  const shipmentCode = request.shipmentId ? findMockShipment(request.shipmentId)?.code : undefined;

  return {
    id: `rpt-${now}`,
    generatedAt: new Date(now).toISOString(),
    request: {
      shipmentCode,
      commodity: request.commodity,
      horizonHours,
      predictionType: request.predictionType,
      predictionInterval: request.predictionInterval,
      modelVersion: request.modelVersion,
    },
    summary: {
      kpis: kpis as PredictionReport['summary']['kpis'],
      overallStatus: risk,
      generatedAt: new Date(now).toISOString(),
    },
    risk: {
      riskPercentage: Math.round(probability * 100),
      healthCategory: risk,
      estimatedTimeBeforeSpoilageHours: expectedExcursionHours,
      scale: RISK_SCALE as unknown as PredictionReport['risk']['scale'],
    },
    temperatureForecast: {
      historical,
      predicted,
      confidenceUpper,
      confidenceLower,
      safeThreshold,
      forecastWindowHours: horizonHours,
    },
    confidence: {
      confidencePct,
      metrics: confidenceMetrics as PredictionReport['confidence']['metrics'],
    },
    featureContributions,
    recommendations: recommendations.map((item, index) => ({ id: `rec-${index}`, ...item })),
    history,
    model: mockModelInfo,
    modelDetails: {
      predictionWindow: `${horizonHours}h rolling`,
      inputFeatures: [
        'commodity',
        'transitDurationHours',
        'avgTemperatureC',
        'avgHumidityPct',
        'ethylenePpm',
        'ambientTemperatureC',
        'vibrationIndex',
        'preCoolingApplied',
      ],
      outputVariables: [
        'spoilageProbability',
        'riskLevel',
        'confidence',
        'estimatedShelfLifeHours',
        'contributions',
      ],
      trainingDataset: '48,210 labelled consignment journeys (2023–2025)',
    },
    backend: {
      apiEndpoint: 'POST /api/v1/predictions/report',
      requestPayloadExample: JSON.stringify(
        {
          shipmentId: 'shp-24817',
          commodity: 'banana',
          transitDurationHours: 16,
          avgTemperatureC: 13.5,
          avgHumidityPct: 90,
          ethylenePpm: 1.4,
          vibrationIndex: 0.3,
          packaging: 'corrugated_box',
          vehicleType: 'reefer_truck',
          preCoolingApplied: true,
          ambientTemperatureC: 32,
          horizonHours: 24,
          predictionType: 'arrival_spoilage',
          predictionInterval: 'hourly',
        },
        null,
        2,
      ),
      responsePayloadExample: JSON.stringify(
        {
          id: 'rpt-…',
          summary: { kpis: 'PredictionKpi[]', overallStatus: 'moderate' },
          risk: {
            riskPercentage: 34,
            healthCategory: 'moderate',
            estimatedTimeBeforeSpoilageHours: 40,
          },
          temperatureForecast: {
            historical: 'TimeSeriesPoint[]',
            predicted: 'TimeSeriesPoint[]',
            safeThreshold: 15,
          },
          confidence: { confidencePct: 88, metrics: 'ConfidenceMetric[]' },
          featureContributions: 'FeatureContributionItem[]',
          recommendations: 'RecommendationItem[]',
          history: 'PredictionHistoryItem[]',
        },
        null,
        2,
      ),
      mlOutputFields: [
        'spoilageProbability (0–1)',
        'riskLevel (low|moderate|high|critical)',
        'confidence (0–1)',
        'estimatedShelfLifeHours',
        'contributions[] (feature, impact)',
        'recommendedActions[]',
      ],
      frontendMapping: [
        'summary.kpis → KPI cards',
        'risk.riskPercentage → circular risk gauge',
        'temperatureForecast.predicted → forecast chart',
        'featureContributions → horizontal contribution bars',
        'recommendations → recommendation cards',
        'history → prediction history table',
      ],
    },
  };
}
