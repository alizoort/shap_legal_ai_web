import { FormControl, FormGroup } from '@angular/forms';

export interface LegalAiFilterForm {
  readonly keyword: FormControl<string>;
}

export function buildLegalAiFilterForm(): FormGroup<LegalAiFilterForm> {
  return new FormGroup<LegalAiFilterForm>({
    keyword: new FormControl('', { nonNullable: true }),
  });
}
