import { Injectable, computed } from '@angular/core';
import { buildLegalAiPageVm } from '../mappers/legal-ai-vm.mapper';
import { LegalAiPageCommand } from '../models/legal-ai-page-command';
import { LegalAiPageVm } from '../models/legal-ai-page.model';
import { LegalAiCommandsService } from '../services/legal-ai-commands.service';
import { LegalAiStore } from './legal-ai.store';

@Injectable({ providedIn: 'root' })
export class LegalAiFacade {
  constructor(
    private readonly store: LegalAiStore,
    private readonly commands: LegalAiCommandsService
  ) {}

  readonly pageVm = computed<LegalAiPageVm>(() => {
    const state = this.store.state();
    return buildLegalAiPageVm(state.snapshot, state.loading);
  });

  dispatch(command: LegalAiPageCommand): void {
    this.commands.dispatch(command);
  }
}
