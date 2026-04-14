import { expect, test } from '@playwright/test';
import { mockGatewayApis } from './helpers';

test('renders the legal-ai scaffold page', async ({ page }) => {
  await mockGatewayApis(page);

  await page.goto('/sideBar/legal-ai');
  await page.waitForLoadState('networkidle');

  await expect(page.getByRole('heading', { name: /employment compliance risk detector/i })).toBeVisible();
  await expect(page.getByText(/120 synthetic training samples/i)).toBeVisible();

  await page.locator('textarea').fill(
    'We reserve the right to monitor all employee communications at any time without notice.'
  );
  await page.getByRole('button', { name: /analyze policy/i }).click();

  await expect(page.getByText('HIGH')).toBeVisible();
  await expect(page.getByText(/needs human review/i)).toBeVisible();
  await expect(page.getByText(/unrestricted monitoring/i)).toBeVisible();
});
