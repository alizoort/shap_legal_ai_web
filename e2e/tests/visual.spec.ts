import { expect, test } from '@playwright/test';
import { installDeterministicUiStyle, mockGatewayApis } from './helpers';

test('legal-ai scaffold visual regression', async ({ page }) => {
  await mockGatewayApis(page);
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto('/sideBar/legal-ai');
  await page.waitForLoadState('networkidle');
  await installDeterministicUiStyle(page);

  await expect(page.locator('.panel-area')).toHaveScreenshot('legal-ai-panel.png', {
    maxDiffPixelRatio: 0.02,
  });
});
