import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { LegalAiPageCommand } from '../../models/legal-ai-page-command';
import { LegalAiPageVm } from '../../models/legal-ai-page.model';

@Component({
  selector: 'app-legal-ai-workspace',
  templateUrl: './legal-ai-workspace.component.html',
  styleUrls: ['./legal-ai-workspace.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class LegalAiWorkspaceComponent {
  @Input({ required: true }) vm!: LegalAiPageVm;
  @Output() command = new EventEmitter<LegalAiPageCommand>();

  emitCommand(type: LegalAiPageCommand['type']): void {
    this.command.emit({ type });
  }
}
