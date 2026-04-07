export type LegalAiPageCommand =
  | { type: 'refresh' }
  | { type: 'create-placeholder-request' };
