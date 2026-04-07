import { Injectable, signal } from '@angular/core';
import { LegalAiWorkspaceSnapshot } from 'src/app/domain/legal-ai/models/legal-ai.models';
import { LegalAiState } from './legal-ai.vm';

const INITIAL_STATE: LegalAiState = {
  loading: false,
  snapshot: null,
};

@Injectable({ providedIn: 'root' })
export class LegalAiStore {
  private readonly stateSignal = signal<LegalAiState>(INITIAL_STATE);

  readonly state = this.stateSignal.asReadonly();

  setLoading(loading: boolean): void {
    this.stateSignal.update((state) => ({ ...state, loading }));
  }

  setSnapshot(snapshot: LegalAiWorkspaceSnapshot): void {
    this.stateSignal.set({
      loading: false,
      snapshot,
    });
  }
}
