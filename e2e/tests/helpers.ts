import { Page, Route } from '@playwright/test';

function okJson(route: Route, body: unknown, status = 200): Promise<void> {
  return route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

async function gatewayHandler(route: Route): Promise<void> {
  const request = route.request();
  const url = new URL(request.url());

  if (url.pathname === '/legal-ai/ping') {
    return okJson(route, {
      serviceName: 'gateway_service',
      status: 'ok',
      message: 'Reserved SHAP Legal AI route is reachable.',
      reservedRoutes: ['/legal-ai/ping', '/legal-ai/*'],
    });
  }

  if (url.pathname.endsWith('/health')) {
    return okJson(route, { status: 'ok' });
  }

  return okJson(route, {});
}

export async function mockGatewayApis(page: Page): Promise<void> {
  await page.route('http://127.0.0.1:8000/**', gatewayHandler);
  await page.route('http://localhost:8000/**', gatewayHandler);
}

export async function installDeterministicUiStyle(page: Page): Promise<void> {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        caret-color: transparent !important;
      }
    `,
  });
}
