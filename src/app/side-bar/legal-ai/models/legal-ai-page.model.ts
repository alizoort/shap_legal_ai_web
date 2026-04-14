import { RiskLabel } from 'src/app/domain/legal-ai/models/legal-ai.models';

export interface LegalAiProbabilityBarVm {
  label: string;
  value: number;
  valueLabel: string;
  width: string;
  isWinner: boolean;
}

export interface LegalAiFeatureVm {
  term: string;
  valueLabel: string;
}

export interface LegalAiGlobalFeatureSectionVm {
  label: string;
  riskLabel: RiskLabel;
  features: string[];
}

export interface LegalAiSamplePolicyVm {
  id: string;
  label: string;
  riskLabel: RiskLabel;
  text: string;
}

export interface LegalAiOpenAiCommentaryVm {
  summary: string;
  keyConcerns: string[];
  recommendedNextSteps: string[];
  disclaimer: string;
}

export interface LegalAiPageVm {
  title: string;
  subtitle: string;
  draftText: string;
  includeCommentary: boolean;
  loadingSummary: boolean;
  analyzing: boolean;
  canAnalyze: boolean;
  errorMessage: string | null;
  modelTypeLabel: string;
  trainingCountLabel: string;
  goldMacroF1Label: string;
  globalFeatureSections: LegalAiGlobalFeatureSectionVm[];
  samplePolicies: readonly LegalAiSamplePolicyVm[];
  hasAnalysis: boolean;
  riskLabel: string;
  riskTone: RiskLabel | 'neutral';
  reviewMessage: string;
  explanation: string;
  probabilityBars: readonly LegalAiProbabilityBarVm[];
  supportingFeatures: readonly LegalAiFeatureVm[];
  againstFeatures: readonly LegalAiFeatureVm[];
  openAiCommentary: LegalAiOpenAiCommentaryVm | null;
}
