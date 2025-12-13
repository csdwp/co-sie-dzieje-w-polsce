import { test, expect } from '@playwright/test';

test.describe('Dzienny limit odczytów', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('anonim może otworzyć tylko 3 akty', async ({ page }) => {
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
