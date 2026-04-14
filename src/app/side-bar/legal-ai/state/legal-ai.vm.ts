import {
  LegalAiAnalyzeResponse,
  LegalAiModelSummaryResponse,
  RiskLabel,
} from 'src/app/domain/legal-ai/models/legal-ai.models';

export interface LegalAiState {
  loadingSummary: boolean;
  analyzing: boolean;
  draftText: string;
  includeCommentary: boolean;
  summary: LegalAiModelSummaryResponse | null;
  latestAnalysis: LegalAiAnalyzeResponse | null;
  errorMessage: string | null;
}

export interface LegalAiSamplePolicy {
  id: string;
  label: string;
  riskLabel: RiskLabel;
  text: string;
}

export const LEGAL_AI_SAMPLE_POLICIES: readonly LegalAiSamplePolicy[] = [
  {
    id: 'high-monitoring',
    label: 'High risk monitoring',
    riskLabel: 'high',
    text: 'We reserve the right to monitor all employee communications at any time without notice.',
  },
  {
    id: 'medium-discipline',
    label: 'Medium risk discipline',
    riskLabel: 'medium',
    text: 'Managers may take disciplinary action as needed when conduct concerns arise, but the policy does not define appeal steps.',
  },
  {
    id: 'low-hiring',
    label: 'Low risk hiring',
    riskLabel: 'low',
    text: 'Hiring decisions will use documented job-related criteria, structured interview scoring, and equal opportunity safeguards.',
  },
];
