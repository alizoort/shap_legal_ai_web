import {
  LegalAiAnalyzeResponse,
  LegalAiFeatureContribution,
  LegalAiModelSummaryResponse,
  RiskLabel,
} from 'src/app/domain/legal-ai/models/legal-ai.models';
import { LegalAiPageVm } from '../models/legal-ai-page.model';
import { LEGAL_AI_SAMPLE_POLICIES } from '../state/legal-ai.vm';

export function buildLegalAiPageVm(
  summary: LegalAiModelSummaryResponse | null,
  analysis: LegalAiAnalyzeResponse | null,
  loadingSummary: boolean,
  analyzing: boolean,
  draftText: string,
  includeCommentary: boolean,
  errorMessage: string | null
): LegalAiPageVm {
  return {
    title: 'Employment Compliance Risk Detector',
    subtitle:
      'Demo-first HR/legal policy analyzer using a real classifier, SHAP explanations, and optional OpenAI commentary.',
    draftText,
    includeCommentary,
    loadingSummary,
    analyzing,
    canAnalyze: draftText.trim().length > 0 && !analyzing,
    errorMessage,
    modelTypeLabel: summary
      ? buildModelTypeLabel(summary.model_type)
      : loadingSummary
        ? 'Loading model summary…'
        : 'Awaiting model artifacts',
    trainingCountLabel: summary
      ? `${summary.training_sample_count} synthetic training clauses`
      : loadingSummary
        ? 'Loading corpus statistics…'
        : 'Training summary unavailable',
    goldMacroF1Label: summary
      ? `Gold macro F1 ${summary.gold_evaluation.macro_f1.toFixed(2)}`
      : loadingSummary
        ? 'Loading evaluation metrics…'
        : 'Gold macro F1 unavailable',
    globalFeatureSections:
      summary?.global_feature_importance
        .slice()
        .sort((left, right) => riskPriority(right.risk_label) - riskPriority(left.risk_label))
        .map((item) => ({
          label: item.risk_label.toUpperCase(),
          riskLabel: item.risk_label,
          features: item.features.slice(0, 4).map((feature) => humanizeTerm(feature.term)),
        })) ?? [],
    samplePolicies: LEGAL_AI_SAMPLE_POLICIES,
    hasAnalysis: analysis !== null,
    riskLabel: analysis ? analysis.risk_label.toUpperCase() : 'No analysis yet',
    riskTone: analysis?.risk_label ?? 'neutral',
    reviewMessage: analyzing
      ? 'Running analysis…'
      : analysis
      ? buildReviewMessage(analysis)
      : 'Submit a policy clause to see the risk classification.',
    explanation:
      analyzing
        ? 'Running the compliance model and SHAP explanation for the current policy text.'
        :
      analysis?.plain_english_explanation ??
      'The model explanation will appear here after a policy is analyzed.',
    probabilityBars: analysis ? buildProbabilityBars(analysis) : [],
    supportingFeatures: analysis
      ? buildFeatureList(analysis.top_features_supporting_prediction)
      : [],
    againstFeatures: analysis ? buildFeatureList(analysis.top_features_against_prediction) : [],
    openAiCommentary: analysis?.openai_commentary
      ? {
          summary: analysis.openai_commentary.summary,
          keyConcerns: analysis.openai_commentary.key_concerns,
          recommendedNextSteps: analysis.openai_commentary.recommended_next_steps,
          disclaimer: analysis.openai_commentary.disclaimer,
        }
      : null,
  };
}

function buildProbabilityBars(
  analysis: LegalAiAnalyzeResponse
): LegalAiPageVm['probabilityBars'] {
  const winner = analysis.risk_label;
  const entries: Array<{ label: RiskLabel; value: number }> = [
    { label: 'low', value: analysis.class_probabilities.low },
    { label: 'medium', value: analysis.class_probabilities.medium },
    { label: 'high', value: analysis.class_probabilities.high },
  ];
  return entries.map((entry) => ({
    label: entry.label.toUpperCase(),
    value: entry.value,
    valueLabel: `${Math.round(entry.value * 100)}%`,
    width: `${Math.max(8, Math.round(entry.value * 100))}%`,
    isWinner: entry.label === winner,
  }));
}

function buildFeatureList(
  items: LegalAiFeatureContribution[]
): LegalAiPageVm['supportingFeatures'] {
  return items.map((item) => ({
    term: humanizeTerm(item.term),
    valueLabel: formatShapValue(item.shap_value),
  }));
}

function buildModelTypeLabel(modelType: string): string {
  return modelType === 'tfidf_logistic_regression'
    ? 'TF-IDF + Logistic Regression'
    : modelType.replaceAll('_', ' ');
}

function humanizeTerm(term: string): string {
  return term.replaceAll('_', ' ');
}

function formatShapValue(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(3)}`;
}

function riskPriority(riskLabel: RiskLabel): number {
  switch (riskLabel) {
    case 'high':
      return 3;
    case 'medium':
      return 2;
    case 'low':
      return 1;
  }
}

function buildReviewMessage(analysis: LegalAiAnalyzeResponse): string {
  if (!analysis.needs_human_review) {
    return 'Lower review urgency';
  }
  if (analysis.risk_label === 'low') {
    return 'Low risk, but confidence is limited';
  }
  return 'Needs human review';
}
