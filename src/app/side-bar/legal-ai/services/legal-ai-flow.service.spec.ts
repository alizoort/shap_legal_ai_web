import { of, throwError } from 'rxjs';
import { LegalAiApiService } from 'src/app/domain/legal-ai/data-access/legal-ai-api.service';
import { LegalAiStore } from '../state/legal-ai.store';
import { LegalAiFlowService } from './legal-ai-flow.service';

describe('LegalAiFlowService', () => {
  it('loads the placeholder gateway snapshot', () => {
    const api = jasmine.createSpyObj<LegalAiApiService>('LegalAiApiService', ['getWorkspaceSnapshot']);
    const store = new LegalAiStore();
    const service = new LegalAiFlowService(api, store);

    api.getWorkspaceSnapshot.and.returnValue(of({
      serviceName: 'gateway_service',
      status: 'ok',
      message: 'ready',
      reservedRoutes: ['/legal-ai/ping'],
    }));

    service.refresh();

    expect(store.state().snapshot?.status).toBe('ok');
  });

  it('falls back to an unavailable placeholder state', () => {
    const api = jasmine.createSpyObj<LegalAiApiService>('LegalAiApiService', ['getWorkspaceSnapshot']);
    const store = new LegalAiStore();
    const service = new LegalAiFlowService(api, store);

    api.getWorkspaceSnapshot.and.returnValue(throwError(() => new Error('down')));

    service.refresh();

    expect(store.state().snapshot?.status).toBe('unavailable');
  });
});
