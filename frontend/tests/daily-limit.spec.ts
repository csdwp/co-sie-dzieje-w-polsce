import { test, expect } from '@playwright/test';

test.describe('Daily reading limit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      document.cookie = 'modalOpens=; path=/; max-age=0';
    });
    await page.reload();
  });

  test('anonymous user can only open 3 acts', async ({ page }) => {
    const firstCard = page.locator('[data-testid="act-card"]').first();

    for (let i = 0; i < 3; i++) {
      await firstCard.click();
      await expect(page.locator('[data-testid="act-modal"]')).toBeVisible();
      await page.locator('[data-testid="modal-close"]').click();
      await expect(page.locator('[data-testid="act-modal"]')).not.toBeVisible();
    }

    await firstCard.click();
    await expect(page.locator('[data-testid="limit-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="limit-message"]')).toContainText(
      '3 aktów prawnych'
    );
  });
});
