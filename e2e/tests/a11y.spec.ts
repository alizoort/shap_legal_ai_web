import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { mockGatewayApis } from './helpers';

test('legal-ai scaffold has no serious or critical accessibility violations', async ({ page }) => {
  await mockGatewayApis(page);

  await page.goto('/sideBar/legal-ai');
  await page.waitForLoadState('networkidle');

  const results = await new AxeBuilder({ page }).analyze();
  const hardFailures = results.violations.filter(
    (item) => item.impact === 'serious' || item.impact === 'critical'
  );

  expect(hardFailures, JSON.stringify(hardFailures, null, 2)).toEqual([]);
});
