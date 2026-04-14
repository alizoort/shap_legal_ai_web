import { Injectable, signal } from '@angular/core';
import {
  LegalAiAnalyzeResponse,
  LegalAiModelSummaryResponse,
} from 'src/app/domain/legal-ai/models/legal-ai.models';
import { LegalAiState } from './legal-ai.vm';

const INITIAL_STATE: LegalAiState = {
  loadingSummary: false,
  analyzing: false,
  draftText: '',
  includeCommentary: false,
  summary: null,
  latestAnalysis: null,
  errorMessage: null,
};

@Injectable({ providedIn: 'root' })
export class LegalAiStore {
  private readonly stateSignal = signal<LegalAiState>(INITIAL_STATE);

  readonly state = this.stateSignal.asReadonly();

  setLoadingSummary(loadingSummary: boolean): void {
    this.stateSignal.update((state) => ({
      ...state,
      loadingSummary,
      errorMessage: loadingSummary ? null : state.errorMessage,
    }));
  }

  setAnalyzing(analyzing: boolean): void {
    this.stateSignal.update((state) => ({
      ...state,
      analyzing,
      errorMessage: analyzing ? null : state.errorMessage,
    }));
  }

  setDraftText(draftText: string): void {
    this.stateSignal.update((state) => ({
      ...state,
      draftText,
      analyzing: false,
      latestAnalysis: draftText === state.draftText ? state.latestAnalysis : null,
      errorMessage: null,
    }));
  }

  setIncludeCommentary(includeCommentary: boolean): void {
    this.stateSignal.update((state) => ({
      ...state,
      includeCommentary,
      analyzing: false,
      latestAnalysis:
        includeCommentary === state.includeCommentary ? state.latestAnalysis : null,
      errorMessage: null,
    }));
  }

  setSummary(summary: LegalAiModelSummaryResponse): void {
    this.stateSignal.update((state) => ({
      ...state,
      loadingSummary: false,
      summary,
      errorMessage: null,
    }));
  }

  setLatestAnalysis(latestAnalysis: LegalAiAnalyzeResponse): void {
    this.stateSignal.update((state) => ({
      ...state,
      analyzing: false,
      latestAnalysis,
      errorMessage: null,
    }));
  }

  clearLatestAnalysis(): void {
    this.stateSignal.update((state) => ({
      ...state,
      latestAnalysis: null,
    }));
  }

  setErrorMessage(errorMessage: string): void {
    this.stateSignal.update((state) => ({
      ...state,
      loadingSummary: false,
      analyzing: false,
      errorMessage,
    }));
  }
}
