import { LegalAiStore } from './legal-ai.store';

describe('LegalAiStore', () => {
  it('stores the latest workspace snapshot', () => {
    const store = new LegalAiStore();

    store.setSnapshot({
      serviceName: 'gateway_service',
      status: 'ok',
      message: 'ready',
      reservedRoutes: ['/legal-ai/ping'],
    });

    expect(store.state().snapshot?.serviceName).toBe('gateway_service');
    expect(store.state().loading).toBeFalse();
  });
});
