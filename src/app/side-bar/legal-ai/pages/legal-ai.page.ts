import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { LegalAiPageCommand } from '../models/legal-ai-page-command';
import { LegalAiFacade } from '../state/legal-ai.facade';

@Component({
  selector: 'app-legal-ai-page',
  templateUrl: './legal-ai.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class LegalAiPageComponent implements OnInit {
  readonly pageVm = this.legalAiFacade.pageVm;

  constructor(private readonly legalAiFacade: LegalAiFacade) {}

  ngOnInit(): void {
    this.dispatch({ type: 'initialize' });
  }

  dispatch(command: LegalAiPageCommand): void {
    this.legalAiFacade.dispatch(command);
  }
}
