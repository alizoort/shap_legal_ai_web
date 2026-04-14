export type RiskLabel = 'low' | 'medium' | 'high';

export interface LegalAiFeatureContribution {
  term: string;
  shap_value: number;
}

export interface LegalAiClassProbabilities {
  low: number;
  medium: number;
  high: number;
}

export interface LegalAiOpenAiCommentary {
  summary: string;
  key_concerns: string[];
  recommended_next_steps: string[];
  disclaimer: string;
}

export interface LegalAiAnalyzeRequest {
  text: string;
  include_commentary: boolean;
}

export interface LegalAiAnalyzeResponse {
  risk_label: RiskLabel;
  class_probabilities: LegalAiClassProbabilities;
  needs_human_review: boolean;
  top_features_supporting_prediction: LegalAiFeatureContribution[];
  top_features_against_prediction: LegalAiFeatureContribution[];
  plain_english_explanation: string;
  openai_commentary: LegalAiOpenAiCommentary | null;
}

export interface LegalAiClassMetric {
  precision: number;
  recall: number;
  f1: number;
  support: number;
}

export interface LegalAiEvaluationMetrics {
  accuracy: number;
  macro_f1: number;
  confusion_matrix: number[][];
  per_class_metrics: Record<RiskLabel, LegalAiClassMetric>;
}

export interface LegalAiGlobalFeatureImportanceItem {
  term: string;
  mean_abs_shap: number;
}

export interface LegalAiGlobalFeatureImportance {
  risk_label: RiskLabel;
  features: LegalAiGlobalFeatureImportanceItem[];
}

export interface LegalAiModelSummaryResponse {
  model_type: string;
  training_sample_count: number;
  gold_sample_count: number;
  cross_validation: LegalAiEvaluationMetrics;
  gold_evaluation: LegalAiEvaluationMetrics;
  global_feature_importance: LegalAiGlobalFeatureImportance[];
}
