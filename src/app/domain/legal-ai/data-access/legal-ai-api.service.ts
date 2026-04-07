import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GatewayApiConfigService } from 'src/app/shared/services/gateway-api-config.service';
import { LegalAiWorkspaceSnapshot } from '../models/legal-ai.models';

@Injectable({ providedIn: 'root' })
export class LegalAiApiService {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly gatewayApiConfig: GatewayApiConfigService
  ) {}

  getWorkspaceSnapshot(): Observable<LegalAiWorkspaceSnapshot> {
    return this.httpClient.get<LegalAiWorkspaceSnapshot>(
      `${this.gatewayApiConfig.gatewayBaseUrl}/legal-ai/ping`
    );
  }
}
