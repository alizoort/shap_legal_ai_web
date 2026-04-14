import { LegalAiStore } from './legal-ai.store';

describe('LegalAiStore', () => {
  it('stores the latest model summary', () => {
    const store = new LegalAiStore();

    store.setSummary({
      model_type: 'tfidf_logistic_regression',
      training_sample_count: 120,
      gold_sample_count: 18,
      cross_validation: {
        accuracy: 0.8,
        macro_f1: 0.79,
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
        {
          risk_label: 'high',
          features: [{ term: 'without notice', mean_abs_shap: 0.42 }],
        },
        {
          risk_label: 'medium',
          features: [{ term: 'as needed', mean_abs_shap: 0.31 }],
        },
        {
          risk_label: 'low',
          features: [{ term: 'written notice', mean_abs_shap: 0.28 }],
        },
      ],
    });

    expect(store.state().summary?.model_type).toBe('tfidf_logistic_regression');
    expect(store.state().loadingSummary).toBeFalse();
  });

  it('clears stale analysis when the draft text changes', () => {
    const store = new LegalAiStore();

    store.setLatestAnalysis({
      risk_label: 'high',
      class_probabilities: { low: 0.05, medium: 0.15, high: 0.8 },
      needs_human_review: true,
      top_features_supporting_prediction: [{ term: 'monitor', shap_value: 0.4 }],
      top_features_against_prediction: [],
      plain_english_explanation: 'High risk explanation.',
      openai_commentary: null,
    });

    store.setDraftText('Updated policy text');

    expect(store.state().latestAnalysis).toBeNull();
    expect(store.state().errorMessage).toBeNull();
  });
});
