import { expect, test } from '@playwright/test';
import { mockGatewayApis } from './helpers';

test('renders the legal-ai scaffold page', async ({ page }) => {
  await mockGatewayApis(page);

  await page.goto('/sideBar/legal-ai');
  await page.waitForLoadState('networkidle');

  await expect(page.getByRole('heading', { name: /legal ai workspace/i })).toBeVisible();
  await expect(page.getByText('/legal-ai/ping')).toBeVisible();
});
