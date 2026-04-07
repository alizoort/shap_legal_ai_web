import { LegalAiWorkspaceSnapshot } from 'src/app/domain/legal-ai/models/legal-ai.models';
import { LegalAiPageVm } from '../models/legal-ai-page.model';

export function buildLegalAiPageVm(
  snapshot: LegalAiWorkspaceSnapshot | null,
  loading: boolean
): LegalAiPageVm {
  return {
    title: 'Legal AI workspace',
    subtitle: 'Reserved SHAP Legal AI slice awaiting the concrete business workflow prompt.',
    loading,
    statusLabel: snapshot?.status === 'ok' ? 'Gateway ready' : 'Gateway not checked',
    statusTone: snapshot?.status === 'ok' ? 'ok' : 'warning',
    syncMessage: snapshot?.message ?? 'The scaffold is waiting for the first real legal use case.',
    reservedRoutes: snapshot?.reservedRoutes ?? ['/legal-ai/ping', '/legal-ai/*'],
  };
}
