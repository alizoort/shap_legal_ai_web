import { LegalAiWorkspaceSnapshot } from 'src/app/domain/legal-ai/models/legal-ai.models';

export interface LegalAiState {
  loading: boolean;
  snapshot: LegalAiWorkspaceSnapshot | null;
}
