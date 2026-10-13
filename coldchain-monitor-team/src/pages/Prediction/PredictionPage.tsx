import { useEffect, useRef, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';
import type { PredictionReportRequest } from '@/types';
import { DEFAULT_PREDICTION_REQUEST } from '@/utils/constants';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useModelInfo, usePredictionReport } from '@/hooks/usePrediction';
import { useShipmentSelector } from '@/hooks/useLiveMonitoring';
import { PageHeader } from '@/components/layout';
import { Card, CardHeader, EmptyState, Skeleton } from '@/components/ui';
import { PredictionRequestPanel } from './components/PredictionForm';
import { PredictionSummary } from './components/PredictionResult';
import { RiskGauge } from './components/RiskGauge';
import { TemperatureForecast } from './components/TemperatureForecast';
import { ConfidenceMetrics } from './components/ConfidenceMetrics';
import { FeatureContribution } from './components/FeatureContribution';
import { Recommendations } from './components/Recommendations';
import { PredictionHistory } from './components/PredictionHistory';
import { ModelInformation } from './components/ModelSummary';
import { IntegrationStatus } from './components/IntegrationStatus';

/**
 * Prediction — AI Decision Support Center.
 *
 * Transforms on-demand spoilage inference into a full decision-support surface:
 * request panel, KPI summary, risk gauge, temperature forecast, confidence,
 * feature contribution, recommendations, history preview, model provenance and a
 * backend/ML integration contract.
 *
 * The page owns NO ML logic. It collects a request and renders the typed
 * `PredictionReport` returned by `predictionApi.getPredictionReport` — backend
 * developers replace only the mock resolver.
 */

function FadeIn({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: 'easeOut', delay }}
      className="min-w-0"
    >
      {children}
    </motion.div>
  );
}

export function PredictionPage() {
  useDocumentTitle('AI Decision Support');

  const model = useModelInfo();
  const selector = useShipmentSelector();
  const { report, isGenerating, generate, reset } = usePredictionReport();

  // Auto-generate a default prediction on first mount so the centre is populated
  // for demo/review. The call goes through the service layer only.
  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    void generate({
      ...DEFAULT_PREDICTION_REQUEST,
      horizonHours: 24,
      predictionType: 'arrival_spoilage',
      predictionInterval: 'hourly',
      modelVersion: model.data?.version ?? 'v2.4.1',
    });
  }, [generate, model.data?.version]);

  const handleGenerate = (request: PredictionReportRequest) => {
    void generate(request);
  };

  const handleReset = () => {
    reset();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Decision Support Center"
        description="Score consignments against the production spoilage model and act on explainable, risk-aware guidance."
        lastUpdatedAt={report ? new Date(report.generatedAt) : null}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[22rem_minmax(0,1fr)]">
        {/* 1. Prediction Request Panel */}
        <div className="xl:sticky xl:top-[5.25rem] xl:self-start">
          <Card>
            <CardHeader title="Prediction Request" description="Configure the inference run" />
            <PredictionRequestPanel
              shipments={selector.data ?? []}
              modelVersion={model.data?.version ?? 'v2.4.1'}
              onGenerate={handleGenerate}
              onReset={handleReset}
              isGenerating={isGenerating}
            />
          </Card>
        </div>

        {/* Decision-support output */}
        <div className="min-w-0 space-y-4">
          {isGenerating && !report && (
            <Card>
              <CardHeader title="Generating prediction" />
              <div className="space-y-3 p-5">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </Card>
          )}

          {!isGenerating && !report && (
            <Card>
              <EmptyState
                icon={BrainCircuit}
                title="No prediction yet"
                description="Select a consignment and run the model to populate the decision-support analysis."
              />
            </Card>
          )}

          {report && (
            <>
              <FadeIn>
                <PredictionSummary summary={report.summary} />
              </FadeIn>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <FadeIn>
                  <RiskGauge risk={report.risk} />
                </FadeIn>
                <FadeIn>
                  <ConfidenceMetrics confidence={report.confidence} />
                </FadeIn>
              </div>

              <FadeIn>
                <TemperatureForecast forecast={report.temperatureForecast} />
              </FadeIn>

              <FadeIn>
                <FeatureContribution contributions={report.featureContributions} />
              </FadeIn>

              <FadeIn>
                <Recommendations recommendations={report.recommendations} />
              </FadeIn>

              <FadeIn>
                <PredictionHistory history={report.history} />
              </FadeIn>

              <FadeIn>
                <ModelInformation model={report.model} modelDetails={report.modelDetails} />
              </FadeIn>

              <FadeIn>
                <IntegrationStatus backend={report.backend} />
              </FadeIn>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
