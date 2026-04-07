export interface LegalAiWorkspaceSnapshot {
  serviceName: string;
  status: 'ok' | 'unavailable';
  message: string;
  reservedRoutes: string[];
}
