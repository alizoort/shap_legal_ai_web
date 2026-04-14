import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { take } from 'rxjs';
import { LegalAiApiService } from 'src/app/domain/legal-ai/data-access/legal-ai-api.service';
import { GatewayApiConfigService } from 'src/app/shared/services/gateway-api-config.service';
import { LegalAiStore } from '../state/legal-ai.store';

@Injectable({ providedIn: 'root' })
export class LegalAiFlowService {
  constructor(
    private readonly legalAiApi: LegalAiApiService,
    private readonly gatewayApiConfig: GatewayApiConfigService,
    private readonly store: LegalAiStore
  ) {}

  loadModelSummary(): void {
    this.store.setLoadingSummary(true);
    this.legalAiApi.getModelSummary().pipe(take(1)).subscribe({
      next: (summary) => this.store.setSummary(summary),
      error: (error) => {
        this.store.setErrorMessage(
          this.buildApiErrorMessage(
            'The model summary is not available yet.',
            error,
            'Train the model artifacts and refresh the panel.'
          )
        );
      },
    });
  }

  updateDraftText(text: string): void {
    this.store.setDraftText(text);
  }

  updateIncludeCommentary(includeCommentary: boolean): void {
    this.store.setIncludeCommentary(includeCommentary);
  }

  loadSample(text: string): void {
    this.store.setDraftText(text);
    this.analyzeCurrentDraft();
  }

  analyzeCurrentDraft(): void {
    const state = this.store.state();
    const requestedText = state.draftText.trim();
    const requestedIncludeCommentary = state.includeCommentary;
    if (!requestedText) {
      this.store.setErrorMessage('Enter policy text before running the analysis.');
      return;
    }
    this.store.clearLatestAnalysis();
    this.store.setAnalyzing(true);
    this.legalAiApi
      .analyze({
        text: requestedText,
        include_commentary: requestedIncludeCommentary,
      })
      .pipe(take(1))
      .subscribe({
        next: (analysis) => {
          const latestState = this.store.state();
          if (
            latestState.draftText.trim() !== requestedText ||
            latestState.includeCommentary !== requestedIncludeCommentary
          ) {
            this.store.setAnalyzing(false);
            return;
          }
          this.store.setLatestAnalysis(analysis);
        },
        error: (error) => {
          const latestState = this.store.state();
          if (
            latestState.draftText.trim() !== requestedText ||
            latestState.includeCommentary !== requestedIncludeCommentary
          ) {
            this.store.setAnalyzing(false);
            return;
          }
          this.store.setErrorMessage(
            this.buildApiErrorMessage(
              'The analysis request failed.',
              error,
              'Confirm the backend gateway is running and model artifacts are available.'
            )
          );
        },
      });
  }

  private buildApiErrorMessage(
    prefix: string,
    error: unknown,
    fallback: string
  ): string {
    if (!(error instanceof HttpErrorResponse)) {
      return `${prefix} ${fallback}`;
    }
    if (error.status === 0) {
      return `${prefix} Could not reach ${this.gatewayApiConfig.gatewayBaseUrl}. ${fallback}`;
    }
    const detail = this.extractErrorDetail(error.error);
    if (detail) {
      return `${prefix} ${detail}`;
    }
    return `${prefix} Request failed with status ${error.status}. ${fallback}`;
  }

  private extractErrorDetail(errorBody: unknown): string | null {
    if (typeof errorBody === 'string' && errorBody.trim()) {
      return errorBody.trim();
    }
    if (!errorBody || typeof errorBody !== 'object') {
      return null;
    }
    const detail = (errorBody as { detail?: unknown }).detail;
    if (typeof detail === 'string' && detail.trim()) {
      return detail.trim();
    }
    if (detail && typeof detail === 'object') {
      const reason = (detail as { reason?: unknown }).reason;
      if (typeof reason === 'string' && reason.trim()) {
        return reason.trim();
      }
    }
    return null;
  }
}
