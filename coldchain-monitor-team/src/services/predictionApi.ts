import type {
  ModelInfo,
  PredictionReport,
  PredictionReportRequest,
  PredictionRequest,
  SpoilagePrediction,
} from '@/types';
import { buildMockPrediction, buildPredictionReport, mockModelInfo, mockShipments } from '@/data';
import { apiRequest } from './apiClient';

/**
 * ML inference gateway.
 *
 * Backend / ML contract:
 *   POST /predictions/spoilage        body: PredictionRequest  -> SpoilagePrediction
 *   POST /predictions/spoilage/batch  body: PredictionRequest[] -> SpoilagePrediction[]
 *   GET  /models/active                                        -> ModelInfo
 *   GET  /shipments/:id/prediction                             -> SpoilagePrediction
 *
 * Only this file needs to change when the model is served from FastAPI /
 * TorchServe / SageMaker — the Prediction page consumes these functions only.
 */
export const predictionApi = {
  /** Score a single feature vector. */
  predictSpoilage(request: PredictionRequest): Promise<SpoilagePrediction> {
    return apiRequest<SpoilagePrediction>({
      method: 'POST',
      url: '/predictions/spoilage',
      data: request,
      mock: () => buildMockPrediction(request),
      mockLatencyMs: 900,
    });
  },

  /** Score many shipments at once (nightly re-scoring, what-if analysis). */
  predictSpoilageBatch(requests: PredictionRequest[]): Promise<SpoilagePrediction[]> {
    return apiRequest<SpoilagePrediction[]>({
      method: 'POST',
      url: '/predictions/spoilage/batch',
      data: requests,
      mock: () => requests.map(buildMockPrediction),
    });
  },

  /** Metadata of the model currently serving production traffic. */
  getActiveModel(): Promise<ModelInfo> {
    return apiRequest<ModelInfo>({
      method: 'GET',
      url: '/models/active',
      mock: () => mockModelInfo,
    });
  },

  /**
   * Full Decision Support report for one consignment.
   *
   * Backend contract:
   *   POST /predictions/report  body: PredictionReportRequest  -> PredictionReport
   *
   * The mock resolver assembles every section (summary KPIs, risk gauge,
   * temperature forecast, confidence metrics, feature contributions,
   * recommendations, history preview, model + backend metadata) from
   * `buildPredictionReport`. Replace only this resolver with the real model +
   * aggregation service; the Prediction page consumes the typed report only.
   */
  getPredictionReport(request: PredictionReportRequest): Promise<PredictionReport> {
    return apiRequest<PredictionReport>({
      method: 'POST',
      url: '/predictions/report',
      data: request,
      mock: () => buildPredictionReport(request),
      mockLatencyMs: 1000,
    });
  },

  /** Latest stored prediction for a shipment (no re-inference). */
  getShipmentPrediction(shipmentId: string): Promise<SpoilagePrediction> {
    return apiRequest<SpoilagePrediction>({
      method: 'GET',
      url: `/shipments/${shipmentId}/prediction`,
      mock: () => {
        const shipment = mockShipments.find((item) => item.id === shipmentId) ?? mockShipments[0]!;
        return buildMockPrediction({
          shipmentId: shipment.id,
          commodity: shipment.commodity,
          transitDurationHours: 16,
          avgTemperatureC: shipment.temperatureC,
          avgHumidityPct: shipment.humidityPct,
          ethylenePpm: 1.4,
          vibrationIndex: 0.3,
          packaging: shipment.packaging,
          vehicleType: shipment.vehicle.type,
          preCoolingApplied: true,
          ambientTemperatureC: 32,
        });
      },
    });
  },
};
