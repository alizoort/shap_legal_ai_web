import { Injectable } from '@angular/core';
import { LegalAiPageCommand } from '../models/legal-ai-page-command';
import { LegalAiFlowService } from './legal-ai-flow.service';

@Injectable({ providedIn: 'root' })
export class LegalAiCommandsService {
  constructor(private readonly flowService: LegalAiFlowService) {}

  dispatch(command: LegalAiPageCommand): void {
    switch (command.type) {
      case 'refresh':
      case 'create-placeholder-request':
        this.flowService.refresh();
        return;
    }
  }
}
