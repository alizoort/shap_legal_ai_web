import { Injectable } from '@angular/core';
import { take } from 'rxjs';
import { LegalAiApiService } from 'src/app/domain/legal-ai/data-access/legal-ai-api.service';
import { LegalAiStore } from '../state/legal-ai.store';

@Injectable({ providedIn: 'root' })
export class LegalAiFlowService {
  constructor(
    private readonly legalAiApi: LegalAiApiService,
    private readonly store: LegalAiStore
  ) {}

  refresh(): void {
    this.store.setLoading(true);
    this.legalAiApi.getWorkspaceSnapshot().pipe(take(1)).subscribe({
      next: (snapshot) => this.store.setSnapshot(snapshot),
      error: () => {
        this.store.setSnapshot({
          serviceName: 'gateway_service',
          status: 'unavailable',
          message: 'Gateway placeholder route is not reachable yet.',
          reservedRoutes: ['/legal-ai/ping', '/legal-ai/*'],
        });
      },
    });
  }
}
