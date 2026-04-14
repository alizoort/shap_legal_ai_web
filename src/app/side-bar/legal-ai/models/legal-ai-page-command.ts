export type LegalAiPageCommand =
  | { type: 'initialize' }
  | { type: 'refresh-summary' }
  | { type: 'text-changed'; text: string }
  | { type: 'commentary-toggled'; includeCommentary: boolean }
  | { type: 'load-sample'; text: string }
  | { type: 'analyze' };
