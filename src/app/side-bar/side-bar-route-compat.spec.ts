import { SIDE_BAR_ROUTES } from './side-bar-routing.module';

describe('SIDE_BAR_ROUTES', () => {
  it('keeps the legal-ai panel route contract', () => {
    expect(SIDE_BAR_ROUTES).toEqual([
      jasmine.objectContaining({ path: '', pathMatch: 'full', redirectTo: 'legal-ai' }),
      jasmine.objectContaining({ path: ':panel' }),
    ]);
  });
});
