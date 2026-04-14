import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GatewayApiConfigService } from 'src/app/shared/services/gateway-api-config.service';
import {
  LegalAiAnalyzeRequest,
  LegalAiAnalyzeResponse,
  LegalAiModelSummaryResponse,
} from '../models/legal-ai.models';

@Injectable({ providedIn: 'root' })
export class LegalAiApiService {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly gatewayApiConfig: GatewayApiConfigService
  ) {}

  getModelSummary(): Observable<LegalAiModelSummaryResponse> {
    return this.httpClient.get<LegalAiModelSummaryResponse>(
      `${this.gatewayApiConfig.gatewayBaseUrl}/legal-ai/model-summary`
    );
  }

  analyze(request: LegalAiAnalyzeRequest): Observable<LegalAiAnalyzeResponse> {
    return this.httpClient.post<LegalAiAnalyzeResponse>(
      `${this.gatewayApiConfig.gatewayBaseUrl}/legal-ai/analyze`,
      request
    );
  }
}
