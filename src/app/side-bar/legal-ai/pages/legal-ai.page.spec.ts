import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LegalAiPageCommand } from '../models/legal-ai-page-command';
import { LegalAiPageVm } from '../models/legal-ai-page.model';
import { LegalAiFacade } from '../state/legal-ai.facade';
import { LegalAiPageComponent } from './legal-ai.page';

@Component({
  selector: 'app-legal-ai-workspace',
  template: '',
  standalone: false,
})
class LegalAiWorkspaceStubComponent {
  @Input({ required: true }) vm!: LegalAiPageVm;
  @Output() command = new EventEmitter<LegalAiPageCommand>();
}

describe('LegalAiPageComponent', () => {
  let fixture: ComponentFixture<LegalAiPageComponent>;
  let facade: jasmine.SpyObj<LegalAiFacade> & { pageVm: ReturnType<typeof signal<LegalAiPageVm>> };

  beforeEach(async () => {
    facade = Object.assign(
      jasmine.createSpyObj<LegalAiFacade>('LegalAiFacade', ['dispatch']),
      {
        pageVm: signal<LegalAiPageVm>({
          title: 'Legal AI workspace',
          subtitle: 'Reserved workspace',
          loading: false,
          statusLabel: 'Gateway ready',
          statusTone: 'ok',
          syncMessage: 'Ready',
          reservedRoutes: ['/legal-ai/ping'],
        }),
      }
    );

    await TestBed.configureTestingModule({
      declarations: [LegalAiPageComponent, LegalAiWorkspaceStubComponent],
      providers: [{ provide: LegalAiFacade, useValue: facade }],
    }).compileComponents();

    fixture = TestBed.createComponent(LegalAiPageComponent);
    fixture.detectChanges();
  });

  it('dispatches the initial refresh command', () => {
    expect(facade.dispatch).toHaveBeenCalledWith({ type: 'refresh' });
  });
});
