import { of, Subject, throwError } from 'rxjs';
import { LegalAiApiService } from 'src/app/domain/legal-ai/data-access/legal-ai-api.service';
import { GatewayApiConfigService } from 'src/app/shared/services/gateway-api-config.service';
import { LegalAiStore } from '../state/legal-ai.store';
import { LegalAiFlowService } from './legal-ai-flow.service';

describe('LegalAiFlowService', () => {
  it('loads the model summary', () => {
    const api = jasmine.createSpyObj<LegalAiApiService>('LegalAiApiService', [
      'getModelSummary',
      'analyze',
    ]);
    const gatewayApiConfig = { gatewayBaseUrl: 'http://127.0.0.1:8000' } as GatewayApiConfigService;
    const store = new LegalAiStore();
    const service = new LegalAiFlowService(api, gatewayApiConfig, store);

    api.getModelSummary.and.returnValue(
      of({
        model_type: 'tfidf_logistic_regression',
        training_sample_count: 120,
        gold_sample_count: 18,
        cross_validation: {
          accuracy: 0.81,
          macro_f1: 0.8,
          confusion_matrix: [
            [4, 1, 1],
            [1, 4, 1],
            [0, 1, 5],
          ],
          per_class_metrics: {
            low: { precision: 0.8, recall: 0.7, f1: 0.75, support: 6 },
            medium: { precision: 0.75, recall: 0.8, f1: 0.77, support: 6 },
            high: { precision: 0.83, recall: 0.83, f1: 0.83, support: 6 },
          },
        },
        gold_evaluation: {
          accuracy: 0.78,
          macro_f1: 0.76,
          confusion_matrix: [
            [4, 1, 1],
            [1, 4, 1],
            [0, 1, 5],
          ],
          per_class_metrics: {
            low: { precision: 0.8, recall: 0.7, f1: 0.75, support: 6 },
            medium: { precision: 0.75, recall: 0.8, f1: 0.77, support: 6 },
            high: { precision: 0.83, recall: 0.83, f1: 0.83, support: 6 },
          },
        },
        global_feature_importance: [
          { risk_label: 'high', features: [{ term: 'without notice', mean_abs_shap: 0.42 }] },
          { risk_label: 'medium', features: [{ term: 'as needed', mean_abs_shap: 0.31 }] },
          { risk_label: 'low', features: [{ term: 'written notice', mean_abs_shap: 0.28 }] },
        ],
      })
    );

    service.loadModelSummary();

    expect(store.state().summary?.model_type).toBe('tfidf_logistic_regression');
  });

  it('stores the latest analysis result', () => {
    const api = jasmine.createSpyObj<LegalAiApiService>('LegalAiApiService', [
      'getModelSummary',
      'analyze',
    ]);
    const gatewayApiConfig = { gatewayBaseUrl: 'http://127.0.0.1:8000' } as GatewayApiConfigService;
    const store = new LegalAiStore();
    const service = new LegalAiFlowService(api, gatewayApiConfig, store);

    store.setDraftText('We reserve the right to monitor all employee communications at any time without notice.');
    api.analyze.and.returnValue(
      of({
        risk_label: 'high',
        class_probabilities: { low: 0.04, medium: 0.14, high: 0.82 },
        needs_human_review: true,
        top_features_supporting_prediction: [{ term: 'without notice', shap_value: 0.42 }],
        top_features_against_prediction: [{ term: 'written notice', shap_value: -0.21 }],
        plain_english_explanation: 'This text is high risk because it suggests unrestricted monitoring.',
        openai_commentary: null,
      })
    );

    service.analyzeCurrentDraft();

    expect(store.state().latestAnalysis?.risk_label).toBe('high');
    expect(store.state().analyzing).toBeFalse();
  });

  it('runs the selected sample immediately', () => {
    const api = jasmine.createSpyObj<LegalAiApiService>('LegalAiApiService', [
      'getModelSummary',
      'analyze',
    ]);
    const gatewayApiConfig = { gatewayBaseUrl: 'http://127.0.0.1:8000' } as GatewayApiConfigService;
    const store = new LegalAiStore();
    const service = new LegalAiFlowService(api, gatewayApiConfig, store);

    api.analyze.and.returnValue(
      of({
        risk_label: 'medium',
        class_probabilities: { low: 0.2, medium: 0.6, high: 0.2 },
        needs_human_review: true,
        top_features_supporting_prediction: [{ term: 'as needed', shap_value: 0.2 }],
        top_features_against_prediction: [],
        plain_english_explanation: 'Medium risk explanation.',
        openai_commentary: null,
      })
    );

    service.loadSample('Sample policy text');

    expect(store.state().draftText).toBe('Sample policy text');
    expect(api.analyze).toHaveBeenCalled();
    expect(store.state().latestAnalysis?.risk_label).toBe('medium');
  });

  it('ignores a stale analysis response after the draft changes', () => {
    const api = jasmine.createSpyObj<LegalAiApiService>('LegalAiApiService', [
      'getModelSummary',
      'analyze',
    ]);
    const gatewayApiConfig = { gatewayBaseUrl: 'http://127.0.0.1:8000' } as GatewayApiConfigService;
    const store = new LegalAiStore();
    const service = new LegalAiFlowService(api, gatewayApiConfig, store);
    const response$ = new Subject<{
      risk_label: 'high';
      class_probabilities: { low: number; medium: number; high: number };
      needs_human_review: boolean;
      top_features_supporting_prediction: Array<{ term: string; shap_value: number }>;
      top_features_against_prediction: Array<{ term: string; shap_value: number }>;
      plain_english_explanation: string;
      openai_commentary: null;
    }>();

    store.setDraftText('Original policy text');
    api.analyze.and.returnValue(response$);

    service.analyzeCurrentDraft();
    service.updateDraftText('Updated policy text');

    response$.next({
      risk_label: 'high',
      class_probabilities: { low: 0.05, medium: 0.15, high: 0.8 },
      needs_human_review: true,
      top_features_supporting_prediction: [{ term: 'monitor', shap_value: 0.4 }],
      top_features_against_prediction: [],
      plain_english_explanation: 'High risk explanation.',
      openai_commentary: null,
    });
    response$.complete();

    expect(store.state().latestAnalysis).toBeNull();
    expect(store.state().analyzing).toBeFalse();
  });

  it('stores an error message when the model summary fails', () => {
    const api = jasmine.createSpyObj<LegalAiApiService>('LegalAiApiService', [
      'getModelSummary',
      'analyze',
    ]);
    const gatewayApiConfig = { gatewayBaseUrl: 'http://127.0.0.1:8000' } as GatewayApiConfigService;
    const store = new LegalAiStore();
    const service = new LegalAiFlowService(api, gatewayApiConfig, store);

    api.getModelSummary.and.returnValue(throwError(() => new Error('down')));

    service.loadModelSummary();

    expect(store.state().errorMessage).toContain('model summary');
  });
});
