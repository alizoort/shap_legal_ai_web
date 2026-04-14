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
          title: 'Employment Compliance Risk Detector',
          subtitle: 'Demo workspace',
          draftText: '',
          includeCommentary: false,
          loadingSummary: false,
          analyzing: false,
          canAnalyze: false,
          errorMessage: null,
          modelTypeLabel: 'tfidf_logistic_regression',
          trainingCountLabel: '120 synthetic training samples',
          goldMacroF1Label: 'Gold macro F1 0.76',
          globalFeatureSections: [],
          samplePolicies: [],
          hasAnalysis: false,
          riskLabel: 'No analysis yet',
          riskTone: 'neutral',
          reviewMessage: 'Submit text',
          explanation: 'Explanation placeholder',
          probabilityBars: [],
          supportingFeatures: [],
          againstFeatures: [],
          openAiCommentary: null,
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
    expect(facade.dispatch).toHaveBeenCalledWith({ type: 'initialize' });
  });
});
