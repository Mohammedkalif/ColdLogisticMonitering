import { useCallback, useState } from 'react';
import type {
  PredictionReport,
  PredictionReportRequest,
  PredictionRequest,
  SpoilagePrediction,
} from '@/types';
import { predictionApi, toApiError, type ApiError } from '@/services';
import { useAsyncData } from './useAsyncData';

/** Metadata about the model currently serving production traffic. */
export function useModelInfo() {
  const fetcher = useCallback(() => predictionApi.getActiveModel(), []);
  return useAsyncData(fetcher);
}

export interface UseSpoilagePredictionResult {
  prediction: SpoilagePrediction | null;
  isPredicting: boolean;
  error: ApiError | null;
  predict: (request: PredictionRequest) => Promise<SpoilagePrediction | null>;
  reset: () => void;
}

/**
 * Mutation-style hook for on-demand inference.
 * Keeps request/response state out of the Prediction page component.
 */
export function useSpoilagePrediction(): UseSpoilagePredictionResult {
  const [prediction, setPrediction] = useState<SpoilagePrediction | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const predict = useCallback(async (request: PredictionRequest) => {
    setIsPredicting(true);
    setError(null);
    try {
      const result = await predictionApi.predictSpoilage(request);
      setPrediction(result);
      return result;
    } catch (caught) {
      setError(toApiError(caught));
      return null;
    } finally {
      setIsPredicting(false);
    }
  }, []);

  const reset = useCallback(() => {
    setPrediction(null);
    setError(null);
  }, []);

  return { prediction, isPredicting, error, predict, reset };
}

export interface UsePredictionReportResult {
  report: PredictionReport | null;
  isGenerating: boolean;
  error: ApiError | null;
  generate: (request: PredictionReportRequest) => Promise<PredictionReport | null>;
  reset: () => void;
}

/**
 * Mutation hook for the full Decision Support report.
 *
 * Keeps request/response state out of the page; the heavy assembly happens in
 * `predictionApi.getPredictionReport`. To go live, point that method at the
 * real model service — no component changes required.
 */
export function usePredictionReport(): UsePredictionReportResult {
  const [report, setReport] = useState<PredictionReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const generate = useCallback(async (request: PredictionReportRequest) => {
    setIsGenerating(true);
    setError(null);
    try {
      const result = await predictionApi.getPredictionReport(request);
      setReport(result);
      return result;
    } catch (caught) {
      setError(toApiError(caught));
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const reset = useCallback(() => {
    setReport(null);
    setError(null);
  }, []);

  return { report, isGenerating, error, generate, reset };
}
