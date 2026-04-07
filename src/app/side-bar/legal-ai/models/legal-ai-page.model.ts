export interface LegalAiPageVm {
  title: string;
  subtitle: string;
  loading: boolean;
  statusLabel: string;
  statusTone: 'ok' | 'warning';
  syncMessage: string;
  reservedRoutes: readonly string[];
}
