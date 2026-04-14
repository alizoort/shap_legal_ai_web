import { Injectable } from '@angular/core';
import { LegalAiPageCommand } from '../models/legal-ai-page-command';
import { LegalAiFlowService } from './legal-ai-flow.service';

@Injectable({ providedIn: 'root' })
export class LegalAiCommandsService {
  constructor(private readonly flowService: LegalAiFlowService) {}

  dispatch(command: LegalAiPageCommand): void {
    switch (command.type) {
      case 'initialize':
      case 'refresh-summary':
        this.flowService.loadModelSummary();
        return;
      case 'text-changed':
        this.flowService.updateDraftText(command.text);
        return;
      case 'commentary-toggled':
        this.flowService.updateIncludeCommentary(command.includeCommentary);
        return;
      case 'load-sample':
        this.flowService.loadSample(command.text);
        return;
      case 'analyze':
        this.flowService.analyzeCurrentDraft();
        return;
    }
  }
}
