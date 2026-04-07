import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GatewayApiConfigService {
  readonly gatewayBaseUrl = 'http://127.0.0.1:8000';
}
