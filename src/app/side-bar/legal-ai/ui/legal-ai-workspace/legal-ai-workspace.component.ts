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

  emitCommand(command: LegalAiPageCommand): void {
    this.command.emit(command);
  }

  emitTextChanged(text: string): void {
    this.emitCommand({ type: 'text-changed', text });
  }

  handleEditorInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement | null;
    const text = (target?.value ?? '').toString();
    this.emitTextChanged(text);

    const inputEvent = event as InputEvent;
    if (inputEvent.inputType === 'insertFromPaste') {
      this.emitCommand({ type: 'analyze' });
    }
  }

  emitCommentaryChanged(includeCommentary: boolean): void {
    this.emitCommand({ type: 'commentary-toggled', includeCommentary });
  }

  loadSample(text: string): void {
    this.emitCommand({ type: 'load-sample', text });
  }
}
